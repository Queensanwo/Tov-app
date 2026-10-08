// TOV Phase 3 API — + dashboard + TV remote. Run: npm run dev:api
import http from 'node:http';
import { query } from './db.js';
import { validateFamily, validateProfile, validateRuleSet, checkGuard } from './validate.js';
import { reviewVideo, pickNextSafe } from '../../../workers/review/src/engine.js';

async function activeRule(family_id, profile_id) {
  if (profile_id) {
    const r = await query('SELECT * FROM rule_sets WHERE family_id=$1 AND profile_id=$2 ORDER BY created_at DESC LIMIT 1', [family_id, profile_id]);
    if (r.rows[0]) return r.rows[0];
  }
  const f = await query('SELECT * FROM rule_sets WHERE family_id=$1 AND profile_id IS NULL ORDER BY created_at DESC LIMIT 1', [family_id]);
  return f.rows[0] || {};
}

function send(res, code, obj) {
  res.writeHead(code, { 'content-type': 'application/json' });
  res.end(JSON.stringify(obj));
}

async function body(req) {
  let s = '';
  for await (const c of req) s += c;
  return s ? JSON.parse(s) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');

    if (req.method === 'GET' && url.pathname === '/health') {
      send(res, 200, { ok: true, phase: 3 });
      return;
    }

    // POST /families {name, youtube_account_mode} — creates family + parent_admin stub
    if (req.method === 'POST' && url.pathname === '/families') {
      const b = await body(req);
      const errs = validateFamily(b);
      if (errs.length) { send(res, 400, { error: errs }); return; }
      const r = await query(
        'INSERT INTO families(name, youtube_account_mode) VALUES($1,$2) RETURNING id, name, youtube_account_mode',
        [b.name.trim(), b.youtube_account_mode || 'shared']
      );
      send(res, 201, { family: r.rows[0] });
      return;
    }

    // POST /profiles {family_id, name, kind, age_range} — clean_start=true always (PRD §5.8)
    if (req.method === 'POST' && url.pathname === '/profiles') {
      const b = await body(req);
      const guard = checkGuard({ role: req.headers['x-role'], headerFamilyId: req.headers['x-family-id'], bodyFamilyId: b.family_id });
      if (guard) { send(res, 403, { error: guard }); return; }
      const errs = validateProfile(b);
      if (errs.length) { send(res, 400, { error: errs }); return; }
      const r = await query(
        'INSERT INTO profiles(family_id, name, kind, age_range, clean_start) VALUES($1,$2,$3,$4,true) RETURNING *',
        [b.family_id, b.name.trim(), b.kind, b.age_range]
      );
      send(res, 201, { profile: r.rows[0] });
      return;
    }

    // GET /families/:id/profiles — scoped list, caller must pass matching x-family-id
    if (req.method === 'GET' && /^\/families\/[^/]+\/profiles$/.test(url.pathname)) {
      const familyId = url.pathname.split('/')[2];
      if (req.headers['x-family-id'] !== familyId) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const r = await query('SELECT * FROM profiles WHERE family_id=$1 ORDER BY created_at', [familyId]);
      send(res, 200, { profiles: r.rows });
      return;
    }

    // PUT /rule_sets — upsert family or per-profile rules (PRD §7 parent choices + defaults §15)
    if (req.method === 'PUT' && url.pathname === '/rule_sets') {
      const b = await body(req);
      const guard = checkGuard({ role: req.headers['x-role'], headerFamilyId: req.headers['x-family-id'], bodyFamilyId: b.family_id });
      if (guard) { send(res, 403, { error: guard }); return; }
      const errs = validateRuleSet(b);
      if (errs.length) { send(res, 400, { error: errs }); return; }
      const r = await query(
        `INSERT INTO rule_sets(family_id, profile_id, blocked_themes, blocked_words, uncertain_action, unsuitable_action, shorts_mode, comments_allowed, live_requires_approval)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)
         RETURNING *`,
        [b.family_id, b.profile_id || null, Array.isArray(b.blocked_themes) ? b.blocked_themes : [], Array.isArray(b.blocked_words) ? b.blocked_words : [], b.uncertain_action || 'skip_review', b.unsuitable_action || 'skip_quiet', b.shorts_mode || 'per_child', b.comments_allowed ?? false, b.live_requires_approval ?? true]
      );
      send(res, 200, { rule_set: r.rows[0] });
      return;
    }

    // POST /reviews/request {family_id, video_id, profile_id} — parent correction scaffold (re-review)
    if (req.method === 'POST' && url.pathname === '/reviews/request') {
      const b = await body(req);
      if (!b.family_id || !b.video_id || !b.profile_id) { send(res, 400, { error: 'family_id, profile_id, video_id required' }); return; }
      if (req.headers['x-family-id'] !== b.family_id) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      await query(
        "INSERT INTO activity_events(family_id, profile_id, kind, video_id, detail) VALUES($1,$2,'request',$3,$4)",
        [b.family_id, b.profile_id, b.video_id, JSON.stringify({ type: 're-review' })]
      );
      send(res, 201, { ok: true });
      return;
    }

    // POST /reviews/enqueue {family_id, profile_id, video} — run engine, cache verdict (CS01-04)
    if (req.method === 'POST' && url.pathname === '/reviews/enqueue') {
      const b = await body(req);
      if (!b.family_id || !b.video || !b.video.video_id) { send(res, 400, { error: 'family_id + video.video_id required' }); return; }
      if (req.headers['x-family-id'] !== b.family_id) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const rule = await activeRule(b.family_id, b.profile_id || null);
      const { verdict, reason } = reviewVideo({ video: b.video, rule });
      await query(
        `INSERT INTO video_verdicts(family_id, video_id, rule_version, verdict, reason) VALUES($1,$2,1,$3,$4)
         ON CONFLICT (family_id, video_id, rule_version) DO UPDATE SET verdict=EXCLUDED.verdict, reason=EXCLUDED.reason, reviewed_at=now()`,
        [b.family_id, b.video.video_id, verdict, reason]
      );
      if ((verdict === 'skip' || verdict === 'blocked_long_pending') && b.profile_id) {
        await query("INSERT INTO activity_events(family_id, profile_id, kind, video_id, detail) VALUES($1,$2,'rejected',$3,$4)",
          [b.family_id, b.profile_id, b.video.video_id, JSON.stringify({ reason })]);
      }
      send(res, 201, { verdict, reason });
      return;
    }

    // POST /playback/next {family_id, profile_id, candidates[]} — quiet next-safe (SV02-04)
    if (req.method === 'POST' && url.pathname === '/playback/next') {
      const b = await body(req);
      if (!b.family_id || !Array.isArray(b.candidates)) { send(res, 400, { error: 'family_id + candidates[] required' }); return; }
      if (req.headers['x-family-id'] !== b.family_id) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const rule = await activeRule(b.family_id, b.profile_id || null);
      const verdictById = {};
      for (const c of b.candidates) {
        verdictById[c.video_id] = reviewVideo({ video: c, rule }).verdict;
      }
      const { play, skipped, fallback } = pickNextSafe(b.candidates, verdictById);
      let alternatives = [];
      if (fallback) {
        const r = await query("SELECT video_id FROM video_verdicts WHERE family_id=$1 AND verdict='allow' ORDER BY reviewed_at DESC LIMIT 5", [b.family_id]);
        alternatives = r.rows.map((x) => x.video_id);
      }
      send(res, 200, { play, skipped, fallback, alternatives });
      return;
    }

    // POST /reports/dislike {family_id, profile_id, video_id} — I-don't-like-this (CS05), quiet
    if (req.method === 'POST' && url.pathname === '/reports/dislike') {
      const b = await body(req);
      if (!b.family_id || !b.profile_id || !b.video_id) { send(res, 400, { error: 'family_id, profile_id, video_id required' }); return; }
      if (req.headers['x-family-id'] !== b.family_id) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      await query("INSERT INTO activity_events(family_id, profile_id, kind, video_id, detail) VALUES($1,$2,'report',$3,$4)",
        [b.family_id, b.profile_id, b.video_id, JSON.stringify({ type: 'dislike' })]);
      const r = await query("SELECT video_id FROM video_verdicts WHERE family_id=$1 AND verdict='allow' AND video_id<>$2 ORDER BY reviewed_at DESC LIMIT 1", [b.family_id, b.video_id]);
      send(res, 201, { ok: true, play_next: r.rows[0]?.video_id || null });
      return;
    }

    // POST /sessions/select {family_id, profile_id, device, mode} — parent binds profile to TV/device (§10)
    if (req.method === 'POST' && url.pathname === '/sessions/select') {
      const b = await body(req);
      const guard = checkGuard({ role: req.headers['x-role'], headerFamilyId: req.headers['x-family-id'], bodyFamilyId: b.family_id });
      if (guard) { send(res, 403, { error: guard }); return; }
      if (!b.profile_id || !['child', 'learning'].includes(b.mode || 'child')) { send(res, 400, { error: 'profile_id + mode child|learning required' }); return; }
      const r = await query(
        'INSERT INTO sessions(family_id, profile_id, device, mode, status) VALUES($1,$2,$3,$4,\'playing\') RETURNING *',
        [b.family_id, b.profile_id, b.device || 'tv', b.mode || 'child']
      );
      send(res, 201, { session: r.rows[0] });
      return;
    }

    // GET /dashboard/:family_id — parent-first live view (PC01, PC06)
    if (req.method === 'GET' && /^\/dashboard\/[^/]+$/.test(url.pathname)) {
      const familyId = url.pathname.split('/')[2];
      if (req.headers['x-family-id'] !== familyId) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      if (req.headers['x-role'] !== 'parent_admin') { send(res, 403, { error: 'parent_admin only' }); return; }
      const live = await query('SELECT DISTINCT ON (profile_id) * FROM sessions WHERE family_id=$1 ORDER BY profile_id, updated_at DESC', [familyId]);
      const recent = await query('SELECT * FROM activity_events WHERE family_id=$1 ORDER BY created_at DESC LIMIT 20', [familyId]);
      const counts = await query("SELECT kind, count(*)::int AS n FROM activity_events WHERE family_id=$1 GROUP BY kind", [familyId]);
      send(res, 200, { live: live.rows, recent: recent.rows, counts: counts.rows });
      return;
    }

    // POST /remote/command {family_id, session_id, command, args} — pause/stop/mode/send/extend (PC02)
    if (req.method === 'POST' && url.pathname === '/remote/command') {
      const b = await body(req);
      const guard = checkGuard({ role: req.headers['x-role'], headerFamilyId: req.headers['x-family-id'], bodyFamilyId: b.family_id });
      if (guard) { send(res, 403, { error: guard }); return; }
      const allowed = ['pause', 'stop', 'resume', 'switch_mode', 'send_video', 'extend_time'];
      if (!allowed.includes(b.command)) { send(res, 400, { error: `command must be ${allowed.join('|')}` }); return; }
      const s = await query('SELECT * FROM sessions WHERE id=$1 AND family_id=$2', [b.session_id, b.family_id]);
      if (!s.rows[0]) { send(res, 404, { error: 'session not found' }); return; }
      const cur = s.rows[0];
      let status = cur.status, mode = cur.mode, video = cur.current_video_id;
      if (b.command === 'pause') status = 'paused';
      if (b.command === 'stop') status = 'stopped';
      if (b.command === 'resume') status = 'playing';
      if (b.command === 'switch_mode' && ['child', 'learning'].includes(b.args?.mode)) mode = b.args.mode;
      if (b.command === 'send_video' && b.args?.video_id) { video = b.args.video_id; status = 'playing'; }
      const upd = await query('UPDATE sessions SET status=$1, mode=$2, current_video_id=$3, updated_at=now() WHERE id=$4 RETURNING *', [status, mode, video, b.session_id]);
      await query("INSERT INTO activity_events(family_id, profile_id, kind, video_id, detail) VALUES($1,$2,'remote_command',$3,$4)",
        [b.family_id, cur.profile_id, video, JSON.stringify({ command: b.command, args: b.args || {} })]);
      send(res, 200, { session: upd.rows[0] });
      return;
    }

    send(res, 404, { error: 'not-found' });
  } catch (e) {
    send(res, 500, { error: String(e.message || e) });
  }
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`tov-api phase3 on :${port}`));
