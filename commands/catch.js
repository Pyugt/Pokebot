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
