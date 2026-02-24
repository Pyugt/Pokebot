// /events/messageCreate.js

const prefix = '!';
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (command.name === commandName) {
        try {
          await command.execute(message, args, client);
        } catch (err) {
          console.error(err);
          message.channel.send('❌ There was an error executing that command.');
        }
        break;
      }
    }
  }
};
