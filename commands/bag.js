// commands/bag.js
// Usage: !bag

const User = require('../models/User');
const { buildBagEmbed } = require('../utils/embedBuilder');

module.exports = {
  name: 'bag',
  description: 'View your Pokéball inventory.',

  async execute(message, args, client) {
    const userData = await User.findOne({ userId: message.author.id })
      ?? { coins: 0, caught: [], inventory: {} };

    await message.channel.send({ embeds: [buildBagEmbed(userData, message.author)] });
  },
};
