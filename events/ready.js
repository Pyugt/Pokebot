// /events/ready.js

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}! Pokebot is ready.`);
  }
};
