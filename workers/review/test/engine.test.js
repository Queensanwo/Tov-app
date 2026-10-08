import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewVideo, pickNextSafe, LONG_VIDEO_SEC } from '../src/engine.js';

test('blocks long video until full review', () => {
  const r = reviewVideo({ video: { duration_sec: LONG_VIDEO_SEC + 10 }, rule: {} });
  assert.equal(r.verdict, 'blocked_long_pending');
});

test('live needs approval by default', () => {
  const r = reviewVideo({ video: { isLive: true }, rule: {} });
  assert.equal(r.verdict, 'needs_review');
});

test('blocked theme and word cause quiet skip', () => {
  assert.equal(reviewVideo({ video: { themes: ['violence'] }, rule: { blocked_themes: ['violence'] } }).verdict, 'skip');
  assert.equal(reviewVideo({ video: { title: 'bad spell trick' }, rule: { blocked_words: ['spell'] } }).verdict, 'skip');
});

test('uncertain follows parent rule', () => {
  assert.equal(reviewVideo({ video: { uncertain: true }, rule: { uncertain_action: 'block' } }).verdict, 'skip');
  assert.equal(reviewVideo({ video: { uncertain: true }, rule: { uncertain_action: 'allow' } }).verdict, 'allow');
  assert.equal(reviewVideo({ video: { uncertain: true }, rule: {} }).verdict, 'needs_review');
});

test('shorts block respected', () => {
  assert.equal(reviewVideo({ video: { isShort: true }, rule: { shorts_mode: 'block' } }).verdict, 'skip');
});

test('pickNextSafe skips quietly and falls back', () => {
  const c = [{ video_id: 'a' }, { video_id: 'b' }, { video_id: 'c' }];
  const r1 = pickNextSafe(c, { a: 'skip', b: 'allow' });
  assert.equal(r1.play.video_id, 'b');
  assert.deepEqual(r1.skipped, ['a']);
  const r2 = pickNextSafe(c, { a: 'skip', b: 'skip', c: 'skip' });
  assert.equal(r2.play, null);
  assert.equal(r2.fallback, true);
});
