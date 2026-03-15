// commands/balance.js
// Usage: !balance

const User = require('../models/User');
const { buildBalanceEmbed } = require('../utils/embedBuilder');

module.exports = {
  name: 'balance',
  description: 'Check your Pokécoin balance.',

  async execute(message, args, client) {
    const userData = await User.findOne({ userId: message.author.id })
      ?? { coins: 0, caught: [], inventory: {} };

    await message.channel.send({ embeds: [buildBalanceEmbed(userData, message.author)] });
  },
};
