import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPath, progressStats, recommendStartLevel } from '../src/path.js';

const cands = [
  { video_id: 'b1', title: 'adding numbers basics', duration_sec: 600, level: 'beginner' },
  { video_id: 'b2', title: 'adding numbers practice', duration_sec: 600, level: 'beginner' },
  { video_id: 'b3', title: 'subtracting numbers intro', duration_sec: 600, level: 'beginner' },
  { video_id: 'i1', title: 'fractions explained', duration_sec: 900, level: 'intermediate' },
];

test('default 3 options, dedup repetition', () => {
  const p = buildPath({ goal: 'maths', startLevel: 'beginner', candidates: cands, optionsPerLevel: 3 });
  assert.equal(p.start_level, 'beginner');
  assert.ok(p.next_three.length <= 3);
  assert.equal(p.final_goal, 'maths');
});

test('progress stats', () => {
  const p = buildPath({ goal: 'maths', candidates: cands });
  const s = progressStats(p, ['b1']);
  assert.equal(s.completed, 1);
  assert.ok(s.next_lesson);
  assert.ok(s.remaining_sec >= 0);
});

test('start level default', () => {
  assert.equal(recommendStartLevel({}), 'beginner');
  assert.equal(recommendStartLevel({ selfAssessed: 'advanced' }), 'advanced');
});
