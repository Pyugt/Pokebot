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
