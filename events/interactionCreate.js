const fs = require('fs');
const path = require('path');
const pokedex = require('../data/pokedex.json');
const pokeballs = require('../data/pokeballs.json');
const usersPath = path.join(__dirname, '../data/users.json');
const { getRarity } = require('../utils/rarity');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const userId = interaction.user.id;
    const wild = client.currentWild;

    if (!wild) {
      return interaction.reply({ content: '❌ No Pokémon to catch!', ephemeral: true });
    }

    const ballType = interaction.customId.replace('catch_', '');
    const ball = pokeballs[ballType];
    if (!ball) return interaction.reply({ content: 'Invalid Pokéball.', ephemeral: true });

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

    if (!users[userId].inventory[ballType] || users[userId].inventory[ballType] <= 0) {
      return interaction.reply({ content: `❌ You don't have any ${ballType}s left!`, ephemeral: true });
    }

    users[userId].inventory[ballType]--;

    const rarity = getRarity(wild.name);
    const baseRate = wild.catchRate;
    const multiplier = ball.multiplier[rarity] || 0;
    const finalChance = baseRate * multiplier;
    const roll = Math.random() * 100;
    const caught = roll <= finalChance;
    const sprite = wild.sprite;

    if (caught) {
      users[userId].caught.push(wild.name);
      client.currentWild = null;

      // Reward coins
      const reward = Math.floor(Math.random() * 21) + 10; // 10–30 coins
      users[userId].coins = (users[userId].coins || 0) + reward;

      interaction.reply({
        embeds: [{
          title: `🎉 ${interaction.user.username} caught a ${wild.name}!`,
          description: `You earned 💰 ${reward} coins!`,
          image: { url: sprite },
          color: 0x00FF00
        }]
      });
    } else {
      interaction.reply({
        embeds: [{
          title: `😢 The ${ballType} failed to catch ${wild.name}.`,
          image: { url: sprite },
          color: 0xFF0000
        }],
        ephemeral: true
      });
    }

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }
};
