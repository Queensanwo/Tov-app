// TOV Phase 5 API — + learning paths. Run: npm run dev:api
import http from 'node:http';
import { query } from './db.js';
import { validateFamily, validateProfile, validateRuleSet, checkGuard } from './validate.js';
import { reviewVideo, pickNextSafe } from '../../../workers/review/src/engine.js';
import { buildPath, recommendStartLevel, progressStats } from '../../../workers/learning/src/path.js';

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
      send(res, 200, { ok: true, phase: 5 });
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

    // PUT /screen-time/rules {family_id, profile_id, scope, device, weekday/weekend limits} (PC04)
    if (req.method === 'PUT' && url.pathname === '/screen-time/rules') {
      const b = await body(req);
      const guard = checkGuard({ role: req.headers['x-role'], headerFamilyId: req.headers['x-family-id'], bodyFamilyId: b.family_id });
      if (guard) { send(res, 403, { error: guard }); return; }
      if (!b.profile_id) { send(res, 400, { error: 'profile_id required' }); return; }
      const r = await query(
        `INSERT INTO screen_time_rules(family_id, profile_id, scope, device, weekday_limit_sec, weekend_limit_sec)
         VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT (family_id, profile_id, device)
         DO UPDATE SET scope=EXCLUDED.scope, weekday_limit_sec=EXCLUDED.weekday_limit_sec, weekend_limit_sec=EXCLUDED.weekend_limit_sec RETURNING *`,
        [b.family_id, b.profile_id, b.scope || 'combined', b.device || 'all', b.weekday_limit_sec ?? 3600, b.weekend_limit_sec ?? 5400]
      );
      send(res, 200, { rule: r.rows[0] });
      return;
    }

    // POST /screen-time/consume {family_id, profile_id, device, seconds} — heartbeat; paused sessions don't consume
    if (req.method === 'POST' && url.pathname === '/screen-time/consume') {
      const b = await body(req);
      if (!b.family_id || !b.profile_id) { send(res, 400, { error: 'family_id + profile_id required' }); return; }
      if (req.headers['x-family-id'] !== b.family_id) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const s = await query('SELECT status FROM sessions WHERE family_id=$1 AND profile_id=$2 ORDER BY updated_at DESC LIMIT 1', [b.family_id, b.profile_id]);
      if (s.rows[0]?.status === 'paused' || s.rows[0]?.status === 'stopped') { send(res, 200, { consumed: false, reason: `session ${s.rows[0].status}` }); return; }
      const device = b.device || 'all';
      await query(
        `INSERT INTO screen_time_usage(family_id, profile_id, device, day, used_sec) VALUES($1,$2,$3,CURRENT_DATE,$4)
         ON CONFLICT (family_id, profile_id, device, day) DO UPDATE SET used_sec = screen_time_usage.used_sec + EXCLUDED.used_sec`,
        [b.family_id, b.profile_id, device, b.seconds || 60]
      );
      send(res, 200, { consumed: true });
      return;
    }

    // GET /screen-time/status/:family_id/:profile_id — limits + used today + remaining
    if (req.method === 'GET' && /^\/screen-time\/status\/[^/]+\/[^/]+$/.test(url.pathname)) {
      const [, , , familyId, profileId] = url.pathname.split('/');
      if (req.headers['x-family-id'] !== familyId) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const device = url.searchParams.get('device') || 'all';
      const rule = await query('SELECT * FROM screen_time_rules WHERE family_id=$1 AND profile_id=$2 AND device=$3', [familyId, profileId, device]);
      const use = await query('SELECT used_sec FROM screen_time_usage WHERE family_id=$1 AND profile_id=$2 AND device=$3 AND day=CURRENT_DATE', [familyId, profileId, device]);
      const isWeekend = [0, 6].includes(new Date().getDay());
      const limit = rule.rows[0] ? (isWeekend ? rule.rows[0].weekend_limit_sec : rule.rows[0].weekday_limit_sec) : null;
      const used = use.rows[0]?.used_sec || 0;
      send(res, 200, { limit_sec: limit, used_sec: used, remaining_sec: limit == null ? null : Math.max(0, limit - used) });
      return;
    }

    // PUT /continuity/state {family_id, profile_id, last/next video, progress} — last-write-wins
    if (req.method === 'PUT' && url.pathname === '/continuity/state') {
      const b = await body(req);
      if (!b.family_id || !b.profile_id) { send(res, 400, { error: 'family_id + profile_id required' }); return; }
      if (req.headers['x-family-id'] !== b.family_id) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const r = await query(
        `INSERT INTO continuity_state(family_id, profile_id, last_video_id, next_video_id, progress, updated_at)
         VALUES($1,$2,$3,$4,$5::jsonb,now()) ON CONFLICT (family_id, profile_id)
         DO UPDATE SET last_video_id=EXCLUDED.last_video_id, next_video_id=EXCLUDED.next_video_id, progress=EXCLUDED.progress, updated_at=now() RETURNING *`,
        [b.family_id, b.profile_id, b.last_video_id || null, b.next_video_id || null, JSON.stringify(b.progress || {})]
      );
      send(res, 200, { state: r.rows[0] });
      return;
    }

    // GET /continuity/state/:family_id/:profile_id — resume anywhere
    if (req.method === 'GET' && /^\/continuity\/state\/[^/]+\/[^/]+$/.test(url.pathname)) {
      const [, , , familyId, profileId] = url.pathname.split('/');
      if (req.headers['x-family-id'] !== familyId) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const r = await query('SELECT * FROM continuity_state WHERE family_id=$1 AND profile_id=$2', [familyId, profileId]);
      send(res, 200, { state: r.rows[0] || null });
      return;
    }

    // POST /learning/paths {family_id, profile_id, goal, options_per_level, candidates[], self_assessed} (SL01-04)
    if (req.method === 'POST' && url.pathname === '/learning/paths') {
      const b = await body(req);
      if (!b.family_id || !b.profile_id || !b.goal) { send(res, 400, { error: 'family_id + profile_id + goal required' }); return; }
      if (req.headers['x-family-id'] !== b.family_id) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const startLevel = recommendStartLevel({ selfAssessed: b.self_assessed });
      const built = buildPath({ goal: b.goal, startLevel, candidates: b.candidates || [], optionsPerLevel: b.options_per_level || 3 });
      const r = await query(
        'INSERT INTO learning_paths(family_id, profile_id, goal, start_level, levels) VALUES($1,$2,$3,$4,$5::jsonb) RETURNING *',
        [b.family_id, b.profile_id, b.goal, built.start_level, JSON.stringify(built.levels)]
      );
      send(res, 201, { path: r.rows[0], start_level: built.start_level, next_three: built.next_three, final_goal: built.final_goal, estimated_sec: built.estimated_sec, outline: built.outline });
      return;
    }

    // GET /learning/paths/:family_id/:profile_id — list with stats (SL07)
    if (req.method === 'GET' && /^\/learning\/paths\/[^/]+\/[^/]+$/.test(url.pathname)) {
      const [, , , familyId, profileId] = url.pathname.split('/');
      if (req.headers['x-family-id'] !== familyId) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const r = await query('SELECT * FROM learning_paths WHERE family_id=$1 AND profile_id=$2 ORDER BY updated_at DESC', [familyId, profileId]);
      const out = r.rows.map((p) => ({ ...p, stats: progressStats({ levels: p.levels }, p.progress?.completed || []) }));
      send(res, 200, { paths: out });
      return;
    }

    // POST /learning/progress {path_id, family_id, completed_video_id} — track + next (SL07)
    if (req.method === 'POST' && url.pathname === '/learning/progress') {
      const b = await body(req);
      if (!b.path_id || !b.family_id) { send(res, 400, { error: 'path_id + family_id required' }); return; }
      if (req.headers['x-family-id'] !== b.family_id) { send(res, 403, { error: 'family mismatch (isolation)' }); return; }
      const cur = await query('SELECT * FROM learning_paths WHERE id=$1 AND family_id=$2', [b.path_id, b.family_id]);
      if (!cur.rows[0]) { send(res, 404, { error: 'path not found' }); return; }
      const done = new Set([...(cur.rows[0].progress?.completed || []), ...(b.completed_video_id ? [b.completed_video_id] : [])]);
      const upd = await query("UPDATE learning_paths SET progress=$1::jsonb, updated_at=now() WHERE id=$2 RETURNING *",
        [JSON.stringify({ completed: [...done] }), b.path_id]);
      const stats = progressStats({ levels: upd.rows[0].levels }, [...done]);
      send(res, 200, { path: upd.rows[0], stats });
      return;
    }

    send(res, 404, { error: 'not-found' });
  } catch (e) {
    send(res, 500, { error: String(e.message || e) });
  }
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`tov-api phase5 on :${port}`));
