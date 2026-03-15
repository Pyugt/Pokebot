<<<<<<< HEAD
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
=======
const fs = require('fs');
const path = require('path');
const usersPath = path.join(__dirname, '../data/users.json');

const prices = {
  pokeball: 20,
  greatball: 50,
  ultraball: 100
};

module.exports = {
  name: 'buy',
  description: 'Buy Pokéballs using coins.',
  async execute(message, args) {
    const item = args[0]?.toLowerCase();

    if (!item || !prices[item]) {
      return message.channel.send('❌ Invalid item. Available: pokeball, greatball, ultraball');
    }

    let users = {};
    if (fs.existsSync(usersPath)) {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    }

    const userId = message.author.id;

    // Initialize user if missing
    if (!users[userId]) {
      users[userId] = {
        caught: [],
        inventory: {
          pokeball: 5,
          greatball: 2,
          ultraball: 1
        },
        coins: 100
      };
    }

    const cost = prices[item];
    if ((users[userId].coins || 0) < cost) {
      return message.channel.send(`❌ You need ${cost} coins to buy a ${item}.`);
    }

    // Deduct coins and give item
    users[userId].coins -= cost;
    users[userId].inventory[item] = (users[userId].inventory[item] || 0) + 1;

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    const emojiMap = {
      pokeball: '<:pokeball:1371836222821109851>',
      greatball: '<:greatball:1371833017940709417>',
      ultraball: '<:ultraball:1371835235884597268>'
    };

    message.channel.send(`✅ You bought ${emojiMap[item]} **${item}** for 💰 ${cost} coins!`);


    
  }
};
>>>>>>> c1d5f1b841688771fe84b4e8558eed023ffd4f81
