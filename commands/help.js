module.exports = {
  name: 'help',
  description: 'List all available commands and how to use them.',
  async execute(message) {
    message.channel.send({
      embeds: [{
        title: '📖 Pokebot Commands',
        description: [
          '`!spawn` - Spawns a wild Pokémon in the channel.',
          '`!catch <pokeball>` - Use a Pokéball to try catching the wild Pokémon.',
          '`!bag` - Shows your Pokéball inventory.',
          '`!info <pokemon>` - Shows info for a specific Pokémon.',
          '`!dex` - Shows the Pokémon you’ve caught.',
          '`!help` - Displays this command list.',
          '`!shop` - View the Pokéball market and prices.',
          '`!buy <item>` - Buy a Pokéball using coins.',
          '`!balance` - View how many coins you have.',
          '`!daily` - Claim your daily reward of coins.',
        ].join('\n'),
        color: 0x00BFFF
      }]
    });
  }
};
