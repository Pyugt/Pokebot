// commands/shop.js
// Shows the Pokéball shop with prices.
// Usage: !shop

const fs   = require('fs');
const path = require('path');
const { buildShopEmbed } = require('../utils/embedBuilder');

const POKEBALLS_PATH = path.join(__dirname, '../data/pokeballs.json');

module.exports = {
  name: 'shop',
  description: 'View the Pokéball shop.',

  async execute(message, args, client) {
    const pokeballs = JSON.parse(fs.readFileSync(POKEBALLS_PATH, 'utf8'));
    await message.channel.send({ embeds: [buildShopEmbed(pokeballs)] });
  },
};
