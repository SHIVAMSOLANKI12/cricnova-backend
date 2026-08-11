/**
 * -----------------------------------------------------------------------------
 * File: avatar.constants.js
 * Description:
 * Enterprise User Avatar Catalog
 *
 * Responsibilities:
 * - Define officially supported avatar identifiers
 * - Provide avatar metadata
 * - Provide a single source of truth for avatar validation
 *
 * NOTE:
 * - No database logic
 * - No business workflow
 * - No Express logic
 * - No user-specific data
 *
 * Future:
 * If avatars become admin-managed, purchasable, unlockable, or dynamic,
 * this static catalog can be migrated to a dedicated Avatar database model.
 * -----------------------------------------------------------------------------
 */

/**
 * -----------------------------------------------------------------------------
 * Avatar Categories
 * -----------------------------------------------------------------------------
 */
export const AVATAR_CATEGORY = Object.freeze({
  BATSMAN: 'BATSMAN',
  BOWLER: 'BOWLER',
  ALL_ROUNDER: 'ALL_ROUNDER',
  WICKET_KEEPER: 'WICKET_KEEPER',
  FAN: 'FAN',
});

/**
 * -----------------------------------------------------------------------------
 * Avatar Catalog
 * -----------------------------------------------------------------------------
 *
 * `id` is the value persisted in User.avatarId.
 *
 * Keep these identifiers stable.
 * Once released to clients, an avatar ID should not be casually renamed
 * because existing users may already have that ID persisted.
 */
export const AVATAR_CATALOG = Object.freeze([
  Object.freeze({
    id: 'batsman_blue_01',
    category: AVATAR_CATEGORY.BATSMAN,
    active: true,
  }),

  Object.freeze({
    id: 'batsman_red_01',
    category: AVATAR_CATEGORY.BATSMAN,
    active: true,
  }),

  Object.freeze({
    id: 'bowler_blue_01',
    category: AVATAR_CATEGORY.BOWLER,
    active: true,
  }),

  Object.freeze({
    id: 'bowler_red_01',
    category: AVATAR_CATEGORY.BOWLER,
    active: true,
  }),

  Object.freeze({
    id: 'allrounder_green_01',
    category: AVATAR_CATEGORY.ALL_ROUNDER,
    active: true,
  }),

  Object.freeze({
    id: 'wicketkeeper_blue_01',
    category: AVATAR_CATEGORY.WICKET_KEEPER,
    active: true,
  }),

  Object.freeze({
    id: 'fan_blue_01',
    category: AVATAR_CATEGORY.FAN,
    active: true,
  }),
]);

/**
 * -----------------------------------------------------------------------------
 * Derived Active Avatar IDs
 * -----------------------------------------------------------------------------
 *
 * Used by validation/service layers.
 *
 * This prevents every layer from maintaining its own list of valid IDs.
 */
export const ACTIVE_AVATAR_IDS = Object.freeze(
  AVATAR_CATALOG.filter((avatar) => avatar.active).map((avatar) => avatar.id)
);

/**
 * -----------------------------------------------------------------------------
 * Avatar Lookup
 * -----------------------------------------------------------------------------
 *
 * Returns a single catalog entry by ID.
 */
export function getAvatarById(avatarId) {
  if (!avatarId) {
    return null;
  }

  return AVATAR_CATALOG.find((avatar) => avatar.id === avatarId) ?? null;
}

/**
 * -----------------------------------------------------------------------------
 * Active Avatar Check
 * -----------------------------------------------------------------------------
 */
export function isActiveAvatar(avatarId) {
  if (!avatarId) {
    return false;
  }

  return ACTIVE_AVATAR_IDS.includes(avatarId);
}
