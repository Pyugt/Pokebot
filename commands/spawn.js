// commands/spawn.js

const pokedex  = require('../data/pokedex.json');
const { getPokemon, getSpecies } = require('../utils/pokeapi');
const { buildSpawnEmbed, buildCatchButtons } = require('../utils/embedBuilder');
const { getAnimatedSprite, getShinySprite } = require('../utils/sprites');

// Your custom server emoji IDs — copied from the original spawn.js
const BALL_EMOJIS = {
  pokeball:  '1371836222821109851',
  greatball: '1371833017940709417',
  ultraball: '1371835235884597268',
};

// ── Shiny odds: 1 in 512 (approx. Gen VI+ odds) ──────────────────────────────
const SHINY_ODDS = 512;

function rollShiny() {
  return Math.floor(Math.random() * SHINY_ODDS) === 0;
}

module.exports = {
  name: 'spawn',
  description: 'Spawns a random wild Pokémon in the channel.',

  async execute(message, args, client) {
    const entry    = pokedex[Math.floor(Math.random() * pokedex.length)];
    const isShiny  = rollShiny();

    // ── Phase 1: Mystery reveal ───────────────────────────────────────────────
    // Show a "rustling grass" message while we fetch PokéAPI data.
    // Gives the feel of the game's encounter animation without needing canvas.
    const spawnMsg = await message.channel.send({
      embeds: [{
        color:       0x2C2F33,
        description: '`🌿 The grass is rustling...`',
        footer:      { text: 'Something is hiding in the tall grass!' },
      }],
    });

    // Small delay — builds tension before the reveal
    await new Promise(r => setTimeout(r, 1200));

    // ── Phase 2: Fetch PokéAPI data ───────────────────────────────────────────
    let pokemon, species;
    try {
      pokemon = await getPokemon(entry.name);
      species = await getSpecies(pokemon.id);
    } catch (err) {
      console.error('[spawn] PokéAPI error:', err.message);

      // Graceful fallback — still spawns, just without extra data
      const slug   = entry.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sprite = isShiny
        ? `https://play.pokemonshowdown.com/sprites/ani-shiny/${slug}.gif`
        : `https://play.pokemonshowdown.com/sprites/ani/${slug}.gif`;

      await spawnMsg.edit({
        embeds: [{
          title:  isShiny ? `✨ A wild Shiny **${entry.name}** appeared!` : `A wild **${entry.name}** appeared!`,
          image:  { url: sprite },
          color:  isShiny ? 0xFFD700 : 0x78C850,
          footer: { text: 'Choose a Pokéball below!' },
        }],
        components: [buildCatchButtons(BALL_EMOJIS)],
      });

      client.currentWild = {
        name:        entry.name,
        catchRate:   entry.catchRate,
        rarity:      entry.rarity,
        isShiny,
        channelId:   message.channel.id,
        pokemonData: null,
      };
      return;
    }

    // ── Phase 3: Edit into full rich embed ────────────────────────────────────
    const embed = buildSpawnEmbed(pokemon, species, entry, isShiny);
    const row   = buildCatchButtons(BALL_EMOJIS);

    await spawnMsg.edit({ embeds: [embed], components: [row] });

    // Store on client so interactionCreate.js can access it without another fetch
    client.currentWild = {
      name:        entry.name,
      catchRate:   entry.catchRate,
      rarity:      entry.rarity,
      isShiny,
      channelId:   message.channel.id,
      pokemonData: pokemon,   // cached — no re-fetch on catch
    };
  },
};
