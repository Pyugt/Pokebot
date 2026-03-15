// utils/catchProcessor.js
// Shared catch logic — called by both events/interactionCreate.js (buttons)
// and commands/catch.js (prefix command).
//
// Handles: creating the caught entry, awarding XP, level-ups, evolution, coins.
// Returns a result object so the caller can build the right embeds.

const User          = require('../models/User');
const { applyXp, getXpReward } = require('./xp');
const { checkEvolution, getPokemon, getSpecies, toApiSlug } = require('./pokeapi');
const pokedexData   = require('../data/pokedex.json');

const SHINY_COIN_MULT = 3;

// Slug → display name lookup built from pokedex.json
const SLUG_TO_NAME = new Map(
  pokedexData.map(e => [toApiSlug(e.name), e.name])
);

/**
 * Process a successful catch.
 *
 * @param {string}  userId
 * @param {string}  pokemonName   Display name from pokedex.json e.g. 'Bulbasaur'
 * @param {string}  rarity        'common' | 'uncommon' | 'rare' | 'legendary'
 * @param {boolean} isShiny
 * @returns {{
 *   reward:     number,
 *   caughtEntry: object,   // the new mongoose subdoc
 *   leveledUp:  boolean,
 *   newLevel:   number,
 *   evolution:  { evolvesTo: string, displayName: string } | null,
 * }}
 */
async function processCatch(userId, pokemonName, rarity, isShiny) {
  // ── 1. XP reward ────────────────────────────────────────────────────────────
  const xpReward = getXpReward(rarity);
  const { newLevel, newXp, leveledUp, levelsGained } = applyXp(1, 0, xpReward);

  // ── 2. Coin reward ───────────────────────────────────────────────────────────
  const baseCoins = Math.floor(Math.random() * 21) + 10; // 10–30
  const reward    = isShiny ? baseCoins * SHINY_COIN_MULT : baseCoins;

  // ── 3. Push new Pokémon to DB ────────────────────────────────────────────────
  const updated = await User.findOneAndUpdate(
    { userId },
    {
      $push: {
        caught: {
          name:    pokemonName,
          level:   newLevel,
          xp:      newXp,
          isShiny,
        },
      },
      $inc: { coins: reward },
    },
    { new: true, upsert: true }
  );

  // The entry we just pushed is the last one
  const caughtEntry = updated.caught[updated.caught.length - 1];

  // ── 4. Check for evolution ───────────────────────────────────────────────────
  let evolution = null;
  if (leveledUp) {
    const evoData = await checkEvolution(pokemonName, newLevel);
    if (evoData) {
      const displayName = SLUG_TO_NAME.get(evoData.evolvesTo) ?? evoData.evolvesTo;

      // Update the caught entry's name to the evolved form
      await User.updateOne(
        { userId, 'caught._id': caughtEntry._id },
        { $set: { 'caught.$.name': displayName } }
      );

      evolution = { evolvesTo: evoData.evolvesTo, displayName };
    }
  }

  return { reward, caughtEntry, leveledUp, newLevel, levelsGained, evolution };
}

/**
 * Apply XP to an existing caught Pokémon (e.g. from battles in future phases).
 * Updates DB in place.
 *
 * @param {string} userId
 * @param {string} caughtId   MongoDB _id of the caught subdoc
 * @param {number} xpToAdd
 */
async function awardXpToExisting(userId, caughtId, xpToAdd) {
  const user  = await User.findOne({ userId });
  if (!user) return null;

  const entry = user.caught.id(caughtId);
  if (!entry) return null;

  const { newLevel, newXp, leveledUp } = applyXp(entry.level, entry.xp, xpToAdd);

  entry.level = newLevel;
  entry.xp    = newXp;
  await user.save();

  let evolution = null;
  if (leveledUp) {
    const evoData = await checkEvolution(entry.name, newLevel);
    if (evoData) {
      const displayName = SLUG_TO_NAME.get(evoData.evolvesTo) ?? evoData.evolvesTo;
      entry.name = displayName;
      await user.save();
      evolution = { evolvesTo: evoData.evolvesTo, displayName };
    }
  }

  return { entry, leveledUp, newLevel, evolution };
}

module.exports = { processCatch, awardXpToExisting, SLUG_TO_NAME };
