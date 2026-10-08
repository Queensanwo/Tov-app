// TOV Phase 1 validation — pure functions, no DB. PRD §7 Quick Setup.
export const AGE_RANGES = ['3-5', '6-8', '9-12', '13-15', '16+'];
export const PROFILE_KINDS = ['child', 'student'];
export const YOUTUBE_MODES = ['shared', 'separate'];

export function validateFamily(input = {}) {
  const errors = [];
  if (!input.name || String(input.name).trim().length < 2) errors.push('name required (min 2 chars)');
  if (input.youtube_account_mode && !YOUTUBE_MODES.includes(input.youtube_account_mode))
    errors.push('youtube_account_mode must be shared|separate');
  return errors;
}

export function validateProfile(input = {}) {
  const errors = [];
  if (!input.family_id) errors.push('family_id required');
  if (!input.name || String(input.name).trim().length < 1) errors.push('name required');
  if (!PROFILE_KINDS.includes(input.kind)) errors.push('kind must be child|student');
  if (!AGE_RANGES.includes(input.age_range)) errors.push(`age_range must be one of ${AGE_RANGES.join(',')}`);
  return errors;
}

export function validateRuleSet(input = {}) {
  const errors = [];
  if (!input.family_id) errors.push('family_id required');
  if (input.uncertain_action && !['skip_review', 'block', 'allow'].includes(input.uncertain_action))
    errors.push('bad uncertain_action');
  if (input.unsuitable_action && !['skip_quiet', 'block'].includes(input.unsuitable_action))
    errors.push('bad unsuitable_action');
  if (input.shorts_mode && !['allow', 'limit', 'block', 'per_child'].includes(input.shorts_mode))
    errors.push('bad shorts_mode');
  return errors;
}

// Parent-first guard: writes require parent_admin; reads scoped to own family.
// Full JWT comes later — Phase 1 uses trusted headers set by auth gateway.
export function checkGuard({ role, headerFamilyId, bodyFamilyId }) {
  if (!headerFamilyId || !bodyFamilyId || headerFamilyId !== bodyFamilyId)
    return 'family mismatch (isolation)';
  if (role !== 'parent_admin') return 'parent_admin only for Phase 1 writes';
  return null;
}
