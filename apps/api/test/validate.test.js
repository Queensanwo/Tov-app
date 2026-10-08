import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFamily, validateProfile, validateRuleSet, checkGuard } from '../src/validate.js';

test('family validation', () => {
  assert.deepEqual(validateFamily({}), ['name required (min 2 chars)']);
  assert.deepEqual(validateFamily({ name: 'Sanwo', youtube_account_mode: 'x' }).length, 1);
  assert.deepEqual(validateFamily({ name: 'Sanwo Fam' }), []);
});

test('profile validation enforces age ranges + clean start contract', () => {
  assert.ok(validateProfile({}).length >= 3);
  assert.deepEqual(validateProfile({ family_id: 'f', name: 'A', kind: 'child', age_range: '6-8' }), []);
  assert.ok(validateProfile({ family_id: 'f', name: 'A', kind: 'child', age_range: '99' }).length === 1);
});

test('guard enforces family isolation + parent-first', () => {
  assert.equal(checkGuard({ role: 'parent_admin', headerFamilyId: 'a', bodyFamilyId: 'a' }), null);
  assert.ok(checkGuard({ role: 'child_managed', headerFamilyId: 'a', bodyFamilyId: 'a' }));
  assert.ok(checkGuard({ role: 'parent_admin', headerFamilyId: 'a', bodyFamilyId: 'b' }));
});

test('ruleset defaults accepted', () => {
  assert.deepEqual(validateRuleSet({ family_id: 'f' }), []);
});
