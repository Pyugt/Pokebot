# Pokebot — Pokémon Discord Bot

An event-driven Pokémon Discord bot built using Node.js, and Discord.js.  
The bot allows users to spawn, catch and collect Pokémon while maintaining their own Pokédex.  
It is designed with a modular architecture and managed using PM2 for production-level process management.

---

## Features

• Spawn wild Pokémon in Discord channels.  
• Catch Pokémon with interactive commands.  
• User-specific Pokédex tracking.  
• Organized command and event handling system.  
• Persistent data storage using JSON.  
• Production-ready deployment using PM2.  
• Scalable and modular architecture.  

---

## Tech Stack

- Node.js  
- Discord.js  
- PM2 (Process Manager)  
- JavaScript (ES6)  
- JSON (Small Scale Data storage)  

---

## Project Structure

```

Pokebot/
├── commands/
├── data/
├── events/
├── utils/
├── main.js
├── ecosystem.config.js
├── package.json
├── .gitignore
├── .env.example

````

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Pyugt/Pokebot.git
cd Pokebot
````

### 2. Install dependencies

```bash
npm install
```

### 3. Create a .env file

Create a file named `.env` and add your credentials:

```env
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
```

---

## Running the Bot

### Run normally

```bash
node main.js
```

### Run using PM2 (recommended)

PM2 keeps the bot running continuously and restarts it automatically if it crashes.

Install PM2 globally:

```bash
npm install -g pm2
```

Start the bot:

```bash
pm2 start ecosystem.config.js
```

Useful PM2 commands:

```bash
pm2 list
pm2 restart Pokebot
pm2 stop Pokebot
pm2 logs Pokebot
```

---

## Why PM2 is used

PM2 ensures:

• 24/7 uptime
• Automatic restart on crashes
• Process monitoring
• Production-level deployment

---

## Future Improvements

• Economy system
• Pokémon leveling system
• Database integration (MongoDB)
• Trading system
• Web dashboard
