// /commands/catch.js

const fs = require('fs');
const path = require('path');
const pokedex = require('../data/pokedex.json');
const { getRarity } = require('../utils/rarity');

const usersPath = path.join(__dirname, '../data/users.json');
const pokeballsPath = path.join(__dirname, '../data/pokeballs.json');

module.exports = {
  name: 'catch',
  description: 'Use a Pokéball to catch the wild Pokémon.',
  async execute(message, args, client) {
    const wild = client.currentWild;

    if (!wild) {
      return message.channel.send('❌ No Pokémon has spawned right now!');
    }

    const pokeballType = args[0]?.toLowerCase();
    if (!pokeballType) {
      return message.channel.send('❌ Please specify a Pokéball to use. Example: `!catch pokeball`');
    }

    // Load Pokéball data
    const pokeballs = JSON.parse(fs.readFileSync(pokeballsPath, 'utf8'));
    const ball = pokeballs[pokeballType];
    if (!ball) {
      return message.channel.send(`❌ Invalid Pokéball type: \`${pokeballType}\`. Check your spelling.`);
    }

    // Load user data
    let users = {};
    if (fs.existsSync(usersPath)) {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    }

    const userId = message.author.id;

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


    if (!users[userId].inventory[pokeballType] || users[userId].inventory[pokeballType] <= 0) {
      return message.channel.send(`❌ You don't have any ${pokeballType}s left!`);
    }

    users[userId].inventory[pokeballType]--;

    const pokemonName = wild.name;
    const rarity = getRarity(pokemonName);
    const multiplier = ball.multiplier[rarity] || 0;

    const baseRate = wild.catchRate || 0;
    const finalCatchChance = baseRate * multiplier;
    const roll = Math.random() * 100;

    const spriteUrl = `https://play.pokemonshowdown.com/sprites/ani/${pokemonName.replace(/\s/g, '').toLowerCase()}.gif`;

    if (roll <= finalCatchChance) {
      users[userId].caught.push(pokemonName);
      client.currentWild = null;

      // Reward coins
      const reward = Math.floor(Math.random() * 21) + 10; // 10–30 coins
      users[userId].coins = (users[userId].coins || 0) + reward;

      message.channel.send({
        embeds: [{
          title: `🎉 ${message.author.username} caught a ${pokemonName}!`,
          description: `You earned 💰 ${reward} coins!`,
          image: { url: spriteUrl },
          color: 0x00FF00
        }]
      });
    } else {
      message.channel.send({
        embeds: [{
          title: `😢 The ${pokeballType} failed to catch ${pokemonName}.`,
          image: { url: spriteUrl },
          color: 0xFF0000
        }]
      });
    }

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  }
};
