// /commands/info.js

const fs = require('fs');
const path = require('path');
const pokedex = require('../data/pokedex.json');

module.exports = {
  name: 'info',
  description: 'Get information about a Pokémon.',
  async execute(message, args) {
    const name = args.join(' ').toLowerCase();

    if (!name) {
      return message.channel.send('❌ Please specify a Pokémon name. Example: `!info pikachu`');
    }

    const pokemon = pokedex.find(p => p.name.toLowerCase() === name);

    if (!pokemon) {
      return message.channel.send(`❌ Pokémon \`${name}\` not found in the Pokédex.`);
    }

    const spriteUrl = `https://play.pokemonshowdown.com/sprites/ani/${pokemon.name.toLowerCase().replace(' ', '')}.gif`;

    message.channel.send({
      embeds: [{
        title: `📘 ${pokemon.name}`,
        description: `**Rarity:** ${pokemon.rarity}\n**Catch Rate:** ${pokemon.catchRate}%`,
        image: { url: spriteUrl },
        color: 0x3399FF
      }]
    });
  }
};
