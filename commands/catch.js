<<<<<<< HEAD
// commands/catch.js
// Prefix command: !catch <ball>
// Button-based catching is in events/interactionCreate.js
// Both use catchProcessor for shared logic.

const path = require('path');
const { EmbedBuilder } = require('discord.js');
const User = require('../models/User');
const { processCatch } = require('../utils/catchProcessor');
const { getPokemon, getSpecies } = require('../utils/pokeapi');
const {
  buildCatchSuccessEmbed, buildCatchFailEmbed,
  buildNoSpawnEmbed, buildNoBallsEmbed,
  buildEvolutionEmbed,
} = require('../utils/embedBuilder');

const POKEBALLS_PATH = path.join(__dirname, '../data/pokeballs.json');
const VALID_BALLS    = ['pokeball', 'greatball', 'ultraball', 'masterball'];

module.exports = {
  name: 'catch',
  description: 'Catch the wild Pokémon. Usage: !catch <pokeball|greatball|ultraball>',

  async execute(message, args, client) {
    const wild = client.currentWild;

    if (!wild || wild.channelId !== message.channel.id) {
      return message.channel.send({ embeds: [buildNoSpawnEmbed()] });
    }

    const ballType = args[0]?.toLowerCase();
    if (!ballType || !VALID_BALLS.includes(ballType)) {
      return message.channel.send({
        embeds: [new EmbedBuilder().setColor(0x3498DB).setTitle('❓ Which Pokéball?')
          .setDescription('Usage: `!catch <pokeball|greatball|ultraball>`\n\nOr click the buttons on the spawn message!')
        ],
      });
    }

    let userData = await User.findOne({ userId: message.author.id });
    if (!userData) userData = await User.create({ userId: message.author.id });

    if ((userData.inventory[ballType] ?? 0) <= 0) {
      return message.channel.send({ embeds: [buildNoBallsEmbed(ballType)] });
    }

    // Deduct ball
    await User.updateOne({ userId: message.author.id }, { $inc: { [`inventory.${ballType}`]: -1 } });

    // Catch roll
    const pokeballs  = require(POKEBALLS_PATH);
    const multiplier = pokeballs[ballType]?.multiplier?.[wild.rarity] ?? 1;
    const caught     = Math.random() * 100 <= wild.catchRate * multiplier;
    const isShiny    = wild.isShiny ?? false;

    // Fetch Pokémon data — use spawn cache when available
    let pokemon = wild.pokemonData;
    let species = null;
    try {
      if (!pokemon) pokemon = await getPokemon(wild.name);
      species = await getSpecies(pokemon.id);
    } catch (err) {
      console.error('[catch] PokéAPI error:', err.message);
    }

    if (caught) {
      client.currentWild = null;

      // Process catch: XP, level-up, evolution, coins
      const result = await processCatch(message.author.id, wild.name, wild.rarity, isShiny);

      const embed = pokemon
        ? buildCatchSuccessEmbed(pokemon, species, message.author, result, isShiny)
        : new EmbedBuilder().setColor(0x2ECC71).setTitle(`🎉 ${message.author.username} caught ${wild.name}!`).setDescription(`+${result.reward} Pokécoins`);

      await message.channel.send({ embeds: [embed] });

      // Evolution cutscene
      if (result.evolution) {
        try {
          const newPokemon = await getPokemon(result.evolution.evolvesTo);
          const newSpecies = await getSpecies(newPokemon.id);
          const evoEmbed   = buildEvolutionEmbed(pokemon, newPokemon, species, newSpecies, message.author, result.newLevel);
          await message.channel.send({ embeds: [evoEmbed] });
        } catch (err) {
          console.error('[catch] evolution embed error:', err.message);
        }
      }

    } else {
      const embed = pokemon
        ? buildCatchFailEmbed(pokemon, ballType, isShiny)
        : new EmbedBuilder().setColor(0xE74C3C).setTitle(`💨 ${wild.name} broke free!`);

      await message.channel.send({ embeds: [embed] });
    }
  },
};
=======
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
>>>>>>> c1d5f1b841688771fe84b4e8558eed023ffd4f81
