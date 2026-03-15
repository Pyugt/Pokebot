// commands/pokedex.js
// National Pokédex — all 151, caught status + level, paginated.
// Usage: !pokedex [page]

const User        = require('../models/User');
const pokedexData = require('../data/pokedex.json');
const { buildPokedexListEmbed, buildPokedexButtons, POKEDEX_PAGE_SIZE } = require('../utils/embedBuilder');

module.exports = {
  name: 'pokedex',
  description: 'Browse all 151 Kanto Pokémon. Usage: !pokedex [page]',

  async execute(message, args, client) {
    const userData   = await User.findOne({ userId: message.author.id });
    const caught     = userData?.caught ?? [];
    const totalPages = Math.ceil(pokedexData.length / POKEDEX_PAGE_SIZE);
    const page       = Math.max(1, Math.min(parseInt(args[0]) || 1, totalPages));

    const embed = buildPokedexListEmbed(pokedexData, caught, page, message.author);
    const row   = buildPokedexButtons(page, totalPages, message.author.id);

    await message.channel.send({ embeds: [embed], components: [row] });
  },
};
