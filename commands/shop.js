<<<<<<< HEAD
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
=======
const pokeballEmoji = '<:pokeball:1371836222821109851>';
const greatballEmoji = '<:greatball:1371833017940709417>';
const ultraballEmoji = '<:ultraball:1371835235884597268>';
module.exports = {
  name: 'shop',
  description: 'View available Pokéballs and prices.',
  async execute(message) {
    message.channel.send({
      embeds: [{
        title: '🛒 Pokéball Shop',
        description: [
          '🔴 **Pokéball** - 20 coins',
          '🔵 **Greatball** - 50 coins',
          '🟡 **Ultraball** - 100 coins'
        ].join('\n'),
        footer: { text: 'Use !buy <item> to purchase a Pokéball.' },
        color: 0xFFD700
      }]
    });
  }
};
>>>>>>> c1d5f1b841688771fe84b4e8558eed023ffd4f81
