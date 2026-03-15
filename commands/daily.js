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
