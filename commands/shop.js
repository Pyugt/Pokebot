const pokeballEmoji = '<:pokeball:1371836222821109851>';
const greatballEmoji = '<:greatball:1371833017940709417>';
const ultraballEmoji = '<:ultraball:1371835235884597268>';
module.exports = {
  name: 'shop',
  description: 'View available Pokéballs and prices.',
  async execute(message) {
    message.channel.send({
      embeds: [{
        title: '🛒 Pokéball Shop',
        description: [
          '🔴 **Pokéball** - 20 coins',
          '🔵 **Greatball** - 50 coins',
          '🟡 **Ultraball** - 100 coins'
        ].join('\n'),
        footer: { text: 'Use !buy <item> to purchase a Pokéball.' },
        color: 0xFFD700
      }]
    });
  }
};
