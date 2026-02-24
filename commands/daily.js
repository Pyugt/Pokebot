const fs = require('fs');
const path = require('path');
const usersPath = path.join(__dirname, '../data/users.json');

const DAILY_REWARD = 50;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in ms

module.exports = {
  name: 'daily',
  description: 'Claim your daily reward of coins.',
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
        coins: 100,
        lastDaily: 0
      };
    }

    const now = Date.now();
    const lastDaily = users[userId].lastDaily || 0;

    if (now - lastDaily < DAILY_COOLDOWN) {
      const remaining = Math.ceil((DAILY_COOLDOWN - (now - lastDaily)) / 1000 / 60); // in minutes
      return message.channel.send(`⏳ You’ve already claimed your daily reward. Come back in ${remaining} minutes.`);
    }

    users[userId].coins += DAILY_REWARD;
    users[userId].lastDaily = now;

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    message.channel.send(`✅ You claimed your daily reward of 💰 ${DAILY_REWARD} coins!`);
  }
};
