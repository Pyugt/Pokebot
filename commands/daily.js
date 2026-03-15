<<<<<<< HEAD
// commands/daily.js
// Claim a daily Pokécoin reward. Resets every 24 hours.
// Usage: !daily

const User = require('../models/User');
const { buildDailyEmbed } = require('../utils/embedBuilder');

const COOLDOWN_MS  = 24 * 60 * 60 * 1000;
const DAILY_REWARD = 50;

module.exports = {
  name: 'daily',
  description: 'Claim your daily Pokécoin reward.',

  async execute(message, args, client) {
    // findOneAndUpdate with upsert so new users are created in one step
    let userData = await User.findOne({ userId: message.author.id });
    if (!userData) {
      userData = await User.create({ userId: message.author.id });
    }

    const now         = Date.now();
    const msRemaining = COOLDOWN_MS - (now - (userData.lastDaily ?? 0));

    if (msRemaining > 0) {
      return message.channel.send({
        embeds: [buildDailyEmbed(0, 0, message.author, true, msRemaining)],
      });
    }

    // Atomic: add coins and update lastDaily timestamp
    const updated = await User.findOneAndUpdate(
      { userId: message.author.id },
      {
        $inc: { coins: DAILY_REWARD },
        $set: { lastDaily: now },
      },
      { new: true }
    );

    await message.channel.send({
      embeds: [buildDailyEmbed(DAILY_REWARD, updated.coins, message.author)],
    });
  },
};
=======
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
>>>>>>> c1d5f1b841688771fe84b4e8558eed023ffd4f81
