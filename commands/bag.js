// /commands/bag.js

const fs = require('fs');
const path = require('path');

const usersPath = path.join(__dirname, '../data/users.json');

module.exports = {
  name: 'bag',
  description: 'Check your inventory of Pokéballs.',
  async execute(message) {
    const userId = message.author.id;

    let users = {};
    if (fs.existsSync(usersPath)) {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    }

    if (!users[userId]) {
      users[userId] = {
        caught: [],
        inventory: {
          pokeball: 5,
          greatball: 2,
          ultraball: 1
        }
      };
    }

    const inventory = users[userId].inventory;

    const emojiMap = {
      pokeball: '<:pokeball:1371836222821109851>',
      greatball: '<:greatball:1371833017940709417>',
      ultraball: '<:ultraball:1371835235884597268>'
    };

    const fields = Object.entries(inventory).map(([item, count]) => ({
      name: item.charAt(0).toUpperCase() + item.slice(1),
      value: `${count}`,
      inline: true
    }));

    fields.push({
      name: '💰 Coins',
      value: `${users[userId].coins || 0}`,
      inline: false
    });

    message.channel.send({
      embeds: [{
        title: `${message.author.username}'s Bag`,
        fields,
        color: 0xFFD700
      }]
    });

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }
};
