<<<<<<< HEAD
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
=======
const fs = require('fs');
const path = require('path');
const usersPath = path.join(__dirname, '../data/users.json');

module.exports = {
  name: 'balance',
  description: 'Check how many coins you have.',
  async execute(message) {
    let users = {};
    if (fs.existsSync(usersPath)) {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    }

    const userId = message.author.id;

    if (!users[userId]) {
      users[userId] = {
        caught: [],
        inventory: { pokeball: 5, greatball: 2, ultraball: 1 },
        coins: 100
      };
    }

    const coins = users[userId].coins || 0;

    message.channel.send({
      embeds: [{
        title: `${message.author.username}'s Balance`,
        description: `💰 You have **${coins} coins**.`,
        color: 0xF5C518
      }]
    });

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }
};
>>>>>>> c1d5f1b841688771fe84b4e8558eed023ffd4f81
