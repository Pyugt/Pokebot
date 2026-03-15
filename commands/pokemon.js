// commands/pokemon.js
// Party viewer — browse your caught Pokémon one at a time.
// Usage: !pokemon [page]

const { EmbedBuilder } = require('discord.js');
const User        = require('../models/User');
const pokedexData = require('../data/pokedex.json');
const { getPokemon, getSpecies }         = require('../utils/pokeapi');
const { buildPartyCard, buildPartyButtons } = require('../utils/embedBuilder');

const DEX_MAP = new Map(pokedexData.map(e => [e.name.toLowerCase(), e]));

module.exports = {
  name: 'pokemon',
  description: 'View your caught Pokémon. Usage: !pokemon [page]',

  async execute(message, args, client) {
    const userData = await User.findOne({ userId: message.author.id });

    if (!userData?.caught?.length) {
      return message.channel.send({
        embeds: [new EmbedBuilder()
          .setColor(0x95A5A6)
          .setTitle('📭 No Pokémon caught yet!')
          .setDescription('You haven\'t caught any Pokémon yet!\nWait for a wild Pokémon to appear.')
          .setFooter({ text: '!pokedex to browse all 151 Kanto Pokémon' })
        ],
      });
    }

    const total = userData.caught.length;
    const page  = Math.max(1, Math.min(parseInt(args[0]) || 1, total));
    const entry = userData.caught[page - 1];

    // Handle both legacy string and new object format
    const pokemonName = typeof entry === 'string' ? entry : entry.name;
    const caughtEntry = typeof entry === 'string'
      ? { name: entry, level: 1, xp: 0, isShiny: false }
      : entry;

    const loadingMsg = await message.channel.send({
      content: `🔍 Loading **${pokemonName}**... *(${page}/${total})*`,
    });

    try {
      const pokemon    = await getPokemon(pokemonName);
      const species    = await getSpecies(pokemon.id);
      const localEntry = DEX_MAP.get(pokemonName.toLowerCase());

      const embed = buildPartyCard(pokemon, species, localEntry, message.author, caughtEntry, page, total);
      const row   = buildPartyButtons(page, total, message.author.id);

      await loadingMsg.edit({ content: null, embeds: [embed], components: [row] });
    } catch (err) {
      console.error('[pokemon] error:', err.message);
      await loadingMsg.edit({ content: `❌ Failed to load **${pokemonName}**. Try again!` });
    }
  },
};
