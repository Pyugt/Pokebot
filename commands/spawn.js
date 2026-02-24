const pokedex = require('../data/pokedex.json');

module.exports = {
  name: 'spawn',
  description: 'Spawns a random Pokémon in the channel.',
  async execute(message, args, client) {
    const randomIndex = Math.floor(Math.random() * pokedex.length);
    const pokemon = pokedex[randomIndex];
    const pokemonName = pokemon.name.toLowerCase().replace(' ', '');

    const imageUrl = `https://play.pokemonshowdown.com/sprites/ani/${pokemonName}.gif`;

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('catch_pokeball')
        .setLabel('Pokéball')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('1371836222821109851'), // pokeball ID

      new ButtonBuilder()
        .setCustomId('catch_greatball')
        .setLabel('Greatball')
        .setStyle(ButtonStyle.Success)
        .setEmoji('1371833017940709417'), // greatball ID

      new ButtonBuilder()
        .setCustomId('catch_ultraball')
        .setLabel('Ultraball')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('1371835235884597268') // ultraball ID
    );

    message.channel.send({
    embeds: [
        {
        title: `A wild ${pokemon.name} has appeared!`,
        image: { url: imageUrl },
        color: 0xFF0000,
        footer: { text: 'Click a button to try catching it!' }
        }
    ],
    components: [row]
    });


    // Save the current wild Pokémon to client memory (for catch.js)
    client.currentWild = {
    name: pokemon.name.toLowerCase(),
    catchRate: pokemon.catchRate,
    sprite: imageUrl
    };
  }
};
