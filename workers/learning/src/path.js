// TOV Phase 5 path builder — deterministic, no AI needed for V1 structure.
// Dedup via title token overlap; level ordering beginner->intermediate->advanced.
const LEVELS = ['beginner', 'intermediate', 'advanced'];

function tokens(s = '') {
  return new Set(String(s).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2));
}
function overlap(a, b) {
  const A = tokens(a), B = tokens(b);
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n / Math.max(1, Math.max(A.size, B.size));
}

export function recommendStartLevel({ selfAssessed }) {
  if (LEVELS.includes(selfAssessed)) return selfAssessed;
  return 'beginner';
}

// candidates: [{video_id, title, duration_sec, level}] → path with optionsPerLevel each (default 3)
export function buildPath({ goal, startLevel = 'beginner', candidates = [], optionsPerLevel = 3 }) {
  const n = Math.max(1, Math.min(5, optionsPerLevel || 3));
  const startIdx = Math.max(0, LEVELS.indexOf(startLevel));
  const levels = [];
  const used = new Set();
  let totalSec = 0;
  for (let li = startIdx; li < LEVELS.length; li++) {
    const lvl = LEVELS[li];
    const pool = candidates.filter((c) => (c.level || lvl) === lvl && !used.has(c.video_id));
    const picked = [];
    for (const c of pool) {
      if (picked.length >= n) break;
      if (picked.some((p) => overlap(p.title, c.title) > 0.6)) continue; // skip repetition (SL03)
      picked.push(c);
      used.add(c.video_id);
      totalSec += c.duration_sec || 600;
    }
    levels.push({ level: lvl, videos: picked });
  }
  const flat = levels.flatMap((l) => l.videos.map((v) => v.video_id));
  return {
    start_level: startLevel,
    next_three: flat.slice(0, 3),
    final_goal: goal,
    estimated_sec: totalSec,
    outline: levels.map((l) => ({ level: l.level, count: l.videos.length })),
    levels,
  };
}

export function progressStats(path, completed = []) {
  const all = path.levels.flatMap((l) => l.videos.map((v) => v.video_id));
  const done = all.filter((id) => completed.includes(id));
  const next = all.find((id) => !completed.includes(id)) || null;
  const totalSec = path.levels.flatMap((l) => l.videos).reduce((s, v) => s + (v.duration_sec || 600), 0);
  const doneSec = path.levels.flatMap((l) => l.videos).filter((v) => completed.includes(v.video_id)).reduce((s, v) => s + (v.duration_sec || 600), 0);
  return {
    total: all.length,
    completed: done.length,
    pct: all.length ? Math.round((done.length / all.length) * 100) : 0,
    next_lesson: next,
    remaining_sec: Math.max(0, totalSec - doneSec),
  };
}
