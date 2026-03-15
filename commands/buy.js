// commands/buy.js
// Purchase a Pokéball. Usage: !buy <pokeball|greatball|ultraball>

const path = require('path');
const User = require('../models/User');
const { buildBuySuccessEmbed, buildBuyFailEmbed } = require('../utils/embedBuilder');

const POKEBALLS_PATH = path.join(__dirname, '../data/pokeballs.json');
const VALID_BALLS    = ['pokeball', 'greatball', 'ultraball'];

module.exports = {
  name: 'buy',
  description: 'Buy a Pokéball. Usage: !buy <pokeball|greatball|ultraball>',

  async execute(message, args, client) {
    const item = args[0]?.toLowerCase();

    if (!item || !VALID_BALLS.includes(item)) {
      return message.channel.send({ embeds: [buildBuyFailEmbed('invalid')] });
    }

    const pokeballs = require(POKEBALLS_PATH);
    const ballData  = pokeballs[item];

    if (!ballData?.price) {
      return message.channel.send({ embeds: [buildBuyFailEmbed('invalid')] });
    }

    const cost = ballData.price;

    // Load or create user
    let userData = await User.findOne({ userId: message.author.id });
    if (!userData) {
      userData = await User.create({ userId: message.author.id });
    }

    if ((userData.coins ?? 0) < cost) {
      return message.channel.send({ embeds: [buildBuyFailEmbed('broke')] });
    }

    // Atomic: deduct coins and add ball in one operation
    const updated = await User.findOneAndUpdate(
      { userId: message.author.id },
      {
        $inc: {
          coins:                      -cost,
          [`inventory.${item}`]:       1,
        },
      },
      { new: true, upsert: true }
    );

    await message.channel.send({
      embeds: [buildBuySuccessEmbed(item, cost, updated.coins, updated.inventory[item])],
    });
  },
};
