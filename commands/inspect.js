// commands/inspect.js
// Shows detailed info for a specific caught Pokémon — level, XP bar, moves, catch date.
// Usage: !inspect [slot]   e.g. !inspect 3 shows your 3rd caught Pokémon

const { EmbedBuilder } = require('discord.js');
const User        = require('../models/User');
const pokedexData = require('../data/pokedex.json');
const { getPokemon, getSpecies } = require('../utils/pokeapi');
const { buildInspectEmbed }      = require('../utils/embedBuilder');

const DEX_MAP = new Map(pokedexData.map(e => [e.name.toLowerCase(), e]));

module.exports = {
  name: 'inspect',
  description: 'View detailed info for a caught Pokémon. Usage: !inspect [slot]',

  async execute(message, args, client) {
    const userData = await User.findOne({ userId: message.author.id });

    if (!userData?.caught?.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0x95A5A6)
          .setTitle('📭 No Pokémon caught yet!')
          .setDescription('You haven\'t caught any Pokémon!\nWait for one to appear and throw a ball.')
          .setFooter({ text: '!pokedex to browse all 151 Kanto Pokémon' })
        ],
      });
    }

    const total = userData.caught.length;
    const slot  = Math.max(1, Math.min(parseInt(args[0]) || 1, total));
    const entry = userData.caught[slot - 1];

    // Handle legacy string entries gracefully
    const pokemonName = typeof entry === 'string' ? entry : entry.name;
    const caughtEntry = typeof entry === 'string'
      ? { name: entry, level: 1, xp: 0, isShiny: false, caughtAt: null }
      : entry;

    const loadingMsg = await message.channel.send({
      content: `🔍 Inspecting **${pokemonName}**... *(slot ${slot}/${total})*`,
    });

    try {
      const pokemon = await getPokemon(pokemonName);
      const species = await getSpecies(pokemon.id);
      const embed   = buildInspectEmbed(pokemon, species, caughtEntry, message.author);
      await loadingMsg.edit({ content: null, embeds: [embed] });
    } catch (err) {
      console.error('[inspect] error:', err.message);
      await loadingMsg.edit({ content: `❌ Failed to load **${pokemonName}**. Try again!` });
    }
  },
};
