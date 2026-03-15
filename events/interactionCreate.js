<<<<<<< HEAD
// events/interactionCreate.js
// Button handlers: catch, pokedex nav, party nav

const path = require('path');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

const User            = require('../models/User');
const pokedexData     = require('../data/pokedex.json');
const { getPokemon, getSpecies } = require('../utils/pokeapi');
const { processCatch }           = require('../utils/catchProcessor');
const {
  buildCatchSuccessEmbed, buildCatchFailEmbed,
  buildNoSpawnEmbed, buildNoBallsEmbed,
  buildEvolutionEmbed,
  buildPokedexListEmbed, buildPokedexButtons, POKEDEX_PAGE_SIZE,
  buildPartyCard, buildPartyButtons,
} = require('../utils/embedBuilder');

const POKEBALLS_PATH = path.join(__dirname, '../data/pokeballs.json');
const DEX_MAP        = new Map(pokedexData.map(e => [e.name.toLowerCase(), e]));

function disableAllButtons(components) {
  return components.map(row =>
    ActionRowBuilder.from(row.toJSON()).setComponents(
      row.components.map(c => ButtonBuilder.from(c.toJSON()).setDisabled(true))
    )
  );
}

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    const { customId, user, channel, message } = interaction;

    // ── 1. CATCH BUTTONS ──────────────────────────────────────────────────────
    if (customId.startsWith('catch_')) {
      const ballType = customId.replace('catch_', '');
      const wild     = client.currentWild;

      if (!wild || wild.channelId !== channel.id) {
        return interaction.reply({ embeds: [buildNoSpawnEmbed()], ephemeral: true });
      }

      let userData = await User.findOne({ userId: user.id });
      if (!userData) userData = await User.create({ userId: user.id });

      if ((userData.inventory[ballType] ?? 0) <= 0) {
        return interaction.reply({ embeds: [buildNoBallsEmbed(ballType)], ephemeral: true });
      }

      // Lock buttons and deduct ball immediately
      await interaction.deferUpdate();
      await interaction.editReply({ components: disableAllButtons(message.components) });
      await User.updateOne({ userId: user.id }, { $inc: { [`inventory.${ballType}`]: -1 } });

      // Catch roll
      const pokeballs  = require(POKEBALLS_PATH);
      const multiplier = pokeballs[ballType]?.multiplier?.[wild.rarity] ?? 1;
      const caught     = Math.random() * 100 <= wild.catchRate * multiplier;
      const isShiny    = wild.isShiny ?? false;

      let pokemon = wild.pokemonData;
      let species = null;
      try {
        if (!pokemon) pokemon = await getPokemon(wild.name);
        species = await getSpecies(pokemon.id);
      } catch (err) {
        console.error('[interactionCreate] PokéAPI error:', err.message);
      }

      if (caught) {
        client.currentWild = null;

        const result = await processCatch(user.id, wild.name, wild.rarity, isShiny);

        const embed = pokemon
          ? buildCatchSuccessEmbed(pokemon, species, user, result, isShiny)
          : new EmbedBuilder().setColor(0x2ECC71).setTitle(`🎉 ${user.username} caught ${wild.name}!`).setDescription(`+${result.reward} Pokécoins`);

        await channel.send({ embeds: [embed] });

        // Evolution cutscene
        if (result.evolution) {
          try {
            const newPokemon = await getPokemon(result.evolution.evolvesTo);
            const newSpecies = await getSpecies(newPokemon.id);
            const evoEmbed   = buildEvolutionEmbed(pokemon, newPokemon, species, newSpecies, user, result.newLevel);
            await channel.send({ embeds: [evoEmbed] });
          } catch (err) {
            console.error('[interactionCreate] evolution embed error:', err.message);
          }
        }

      } else {
        const embed = pokemon
          ? buildCatchFailEmbed(pokemon, ballType, isShiny)
          : new EmbedBuilder().setColor(0xE74C3C).setTitle(`💨 ${wild.name} broke free!`);

        await channel.send({ embeds: [embed] });
      }
    }

    // ── 2. NATIONAL POKÉDEX NAVIGATION ───────────────────────────────────────
    if (customId.startsWith('pokedex_')) {
      const parts     = customId.split('_');
      const direction = parts[1];
      const currPage  = parseInt(parts[2]);
      const ownerId   = parts[3];

      if (user.id !== ownerId) {
        return interaction.reply({ content: '❌ This Pokédex belongs to someone else!', ephemeral: true });
      }

      const totalPages = Math.ceil(pokedexData.length / POKEDEX_PAGE_SIZE);
      const page       = Math.max(1, Math.min(direction === 'next' ? currPage + 1 : currPage - 1, totalPages));
      const userData   = await User.findOne({ userId: ownerId });
      const caught     = userData?.caught ?? [];

      const embed = buildPokedexListEmbed(pokedexData, caught, page, user);
      const row   = buildPokedexButtons(page, totalPages, ownerId);
      await interaction.update({ embeds: [embed], components: [row] });
    }

    // ── 3. PARTY VIEWER NAVIGATION ────────────────────────────────────────────
    if (customId.startsWith('party_')) {
      const parts     = customId.split('_');
      const direction = parts[1];
      const currPage  = parseInt(parts[2]);
      const ownerId   = parts[3];

      if (user.id !== ownerId) {
        return interaction.reply({ content: '❌ These are someone else\'s Pokémon!', ephemeral: true });
      }

      const userData = await User.findOne({ userId: ownerId });
      if (!userData?.caught?.length) {
        return interaction.reply({ content: 'You have no caught Pokémon!', ephemeral: true });
      }

      const total  = userData.caught.length;
      const page   = Math.max(1, Math.min(direction === 'next' ? currPage + 1 : currPage - 1, total));
      const entry  = userData.caught[page - 1];

      const pokemonName = typeof entry === 'string' ? entry : entry.name;
      const caughtEntry = typeof entry === 'string'
        ? { name: entry, level: 1, xp: 0, isShiny: false }
        : entry;

      await interaction.deferUpdate();

      try {
        const pokemon    = await getPokemon(pokemonName);
        const species    = await getSpecies(pokemon.id);
        const localEntry = DEX_MAP.get(pokemonName.toLowerCase());

        const embed = buildPartyCard(pokemon, species, localEntry, user, caughtEntry, page, total);
        const row   = buildPartyButtons(page, total, ownerId);
        await interaction.editReply({ embeds: [embed], components: [row] });
      } catch (err) {
        console.error('[party nav] error:', err.message);
        await interaction.editReply({ content: `❌ Failed to load **${pokemonName}**. Try again!` });
      }
    }
  },
};
=======
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
>>>>>>> c1d5f1b841688771fe84b4e8558eed023ffd4f81
