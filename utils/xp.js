// utils/xp.js
// XP and leveling system.
//
// Formula: xpToNextLevel(level) = level * 100
//   Level 1 → 2: 100 XP
//   Level 2 → 3: 200 XP
//   Level 10 → 11: 1000 XP
// Max level: 100

const MAX_LEVEL = 100;

// XP awarded per catch by rarity
const RARITY_XP = {
  common:    50,
  uncommon:  100,
  rare:      200,
  legendary: 500,
};

/**
 * XP required to level up from `level` to `level + 1`.
 */
function xpToNextLevel(level) {
  return level * 100;
}

/**
 * Apply `xpToAdd` to a Pokémon at `currentLevel` / `currentXp`.
 * Handles multiple level-ups in a single call.
 *
 * @returns {{ newLevel, newXp, leveledUp, levelsGained }}
 */
function applyXp(currentLevel, currentXp, xpToAdd) {
  let level  = currentLevel;
  let xp     = currentXp + xpToAdd;
  let gained = 0;

  while (level < MAX_LEVEL) {
    const needed = xpToNextLevel(level);
    if (xp >= needed) {
      xp -= needed;
      level++;
      gained++;
    } else {
      break;
    }
  }

  // Cap at max level
  if (level >= MAX_LEVEL) {
    level = MAX_LEVEL;
    xp    = 0;
  }

  return {
    newLevel:    level,
    newXp:       xp,
    leveledUp:   gained > 0,
    levelsGained: gained,
  };
}

/**
 * Unicode XP bar  e.g. ████████░░
 */
function xpBar(currentXp, level, len = 10) {
  if (level >= MAX_LEVEL) return '█'.repeat(len) + ' MAX';
  const needed = xpToNextLevel(level);
  const filled = Math.round((currentXp / needed) * len);
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, len - filled));
}

/**
 * Returns the XP reward for catching a Pokémon of the given rarity.
 */
function getXpReward(rarity) {
  return RARITY_XP[rarity] ?? RARITY_XP.common;
}

module.exports = { applyXp, xpBar, xpToNextLevel, getXpReward, MAX_LEVEL, RARITY_XP };
