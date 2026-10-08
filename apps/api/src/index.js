// TOV Phase 1 API — Parent Quick Setup + profiles. Run: npm run dev:api
import http from 'node:http';
import { query } from './db.js';
import { validateFamily, validateProfile, validateRuleSet, checkGuard } from './validate.js';

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
      send(res, 200, { ok: true, phase: 1 });
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

    send(res, 404, { error: 'not-found' });
  } catch (e) {
    send(res, 500, { error: String(e.message || e) });
  }
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`tov-api phase1 on :${port}`));
