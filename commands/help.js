// commands/help.js
// Usage: !help

const { buildHelpEmbed } = require('../utils/embedBuilder');

module.exports = {
  name: 'help',
  description: 'Displays all Pokébot commands.',

  async execute(message, args, client) {
    await message.channel.send({ embeds: [buildHelpEmbed()] });
  },
};
