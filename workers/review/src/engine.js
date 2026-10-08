// TOV Phase 2 review engine — deterministic rules per PRD §11.
// YouTube metadata + AI analysis plug in later; this enforces the product rules offline.
export const LONG_VIDEO_SEC = 3600;

export function reviewVideo({ video = {}, rule = {} }) {
  const blockedThemes = rule.blocked_themes || [];
  const blockedWords = (rule.blocked_words || []).map((w) => String(w).toLowerCase());
  const text = `${video.title || ''} ${video.description || ''} ${video.transcript || ''}`.toLowerCase();
  const themes = video.themes || [];

  // 1. Long video gated until full review complete (CS03)
  if ((video.duration_sec || 0) >= LONG_VIDEO_SEC && !video.full_review_complete) {
    return { verdict: 'blocked_long_pending', reason: 'long video: full review not complete' };
  }
  // 2. Live requires parent approval (default blocked in Child Mode)
  if (video.isLive && (rule.live_requires_approval ?? true)) {
    return { verdict: 'needs_review', reason: 'live video requires parent approval' };
  }
  // 3. Blocked theme hit → quiet skip
  const themeHit = themes.find((t) => blockedThemes.includes(t));
  if (themeHit) return { verdict: 'skip', reason: `blocked theme: ${themeHit}` };
  // 4. Blocked word hit in title/desc/transcript → quiet skip
  const wordHit = blockedWords.find((w) => w && text.includes(w));
  if (wordHit) return { verdict: 'skip', reason: `blocked word: ${wordHit}` };
  // 5. Shorts per-child rule
  if (video.isShort) {
    const m = rule.shorts_mode || 'per_child';
    if (m === 'block') return { verdict: 'skip', reason: 'shorts blocked for this child' };
    if (m === 'per_child' && rule.shorts_allowed === false)
      return { verdict: 'skip', reason: 'shorts not allowed for this child' };
  }
  // 6. Uncertain: missing transcript/metadata → follow parent rule (CS04)
  if (video.uncertain) {
    const a = rule.uncertain_action || 'skip_review';
    if (a === 'block') return { verdict: 'skip', reason: 'uncertain: parent rule block' };
    if (a === 'allow') return { verdict: 'allow', reason: 'uncertain: parent rule allow' };
    return { verdict: 'needs_review', reason: 'uncertain: sent for review' };
  }
  return { verdict: 'allow', reason: 'passes active rules' };
}

// Playback gate: pick next-safe from candidates, quiet (no child warning).
// Returns { play, skipped: [], fallback: boolean }
export function pickNextSafe(candidates = [], verdictById = {}) {
  const skipped = [];
  for (const c of candidates) {
    const v = verdictById[c.video_id] || c.verdict || 'allow';
    if (v === 'allow') return { play: c, skipped, fallback: false };
    skipped.push(c.video_id);
  }
  return { play: null, skipped, fallback: true };
}
