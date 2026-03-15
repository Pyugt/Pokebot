// /commands/dex.js

const fs = require('fs');
const path = require('path');
const pokedex = require('../data/pokedex.json');
const usersPath = path.join(__dirname, '../data/users.json');

module.exports = {
  name: 'dex',
  description: 'View all the Pokémon you have caught.',
  async execute(message) {
    const userId = message.author.id;

    let users = {};
    if (fs.existsSync(usersPath)) {
      users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    }

    if (!users[userId] || users[userId].caught.length === 0) {
      return message.channel.send({
        embeds: [{
          title: `${message.author.username}'s Pokédex`,
          description: '📭 You haven’t caught any Pokémon yet!',
          color: 0x999999
        }]
      });
    }

    const caughtList = [...new Set(users[userId].caught)];

    const embeds = [];

    for (let i = 0; i < Math.min(caughtList.length, 10); i++) {
      const name = caughtList[i];
      const dexIndex = pokedex.findIndex(p => p.name.toLowerCase() === name.toLowerCase());
      const dexNumber = dexIndex >= 0 ? dexIndex + 1 : '?';
      const spriteUrl = `https://play.pokemonshowdown.com/sprites/pokemon/${dexNumber}.png`;

      embeds.push({
        title: `${i + 1}. ${name} (#${dexNumber})`,
        image: { url: spriteUrl },
        color: 0x33CC33
      });
    }

    message.channel.send({ embeds });
  }
};
