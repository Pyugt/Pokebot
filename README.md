# 🎮 Pokebot

> A Pokémon Discord bot built with Node.js & Discord.js — catch 'em all without leaving your server.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?logo=discord&logoColor=white)
![PM2](https://img.shields.io/badge/PM2-Process%20Manager-2B037A?logo=pm2&logoColor=white)

Pokebot brings Pokémon gameplay directly into Discord. Wild Pokémon spawn in your channels, users race to catch them, and everyone builds their own personal Pokédex — all powered by a clean, modular codebase and kept running 24/7 with PM2.

---

## ✨ Features

- **Wild Spawns** — Pokémon appear randomly in Discord channels for anyone to catch
- **Catch Command** — Interactive catching experience with per-user collection tracking
- **Personal Pokédex** — Every user maintains their own persistent Pokédex
- **Modular Architecture** — Commands, events, and utilities are cleanly separated for easy extension
- **Persistent Storage** — User data is saved to JSON so nothing is lost on restart
- **PM2 Process Management** — Production-ready deployment with automatic crash recovery and 24/7 uptime

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [Node.js](https://nodejs.org) | Runtime environment |
| [Discord.js v14](https://discord.js.org) | Discord API wrapper |
| [PM2](https://pm2.keymetrics.io) | Process management & deployment |
| JSON | Lightweight persistent data storage |
| JavaScript (ES6+) | Core language |

---

## 📁 Project Structure

```
Pokebot/
├── commands/          # Slash command handlers (catch, pokédex, etc.)
├── data/              # JSON files for persistent user & Pokémon data
├── events/            # Discord event listeners (messageCreate, interactionCreate, etc.)
├── utils/             # Shared helpers and utility functions
├── main.js            # Bot entry point — loads commands, events, and logs in
├── ecosystem.config.js # PM2 configuration
├── .env.example       # Environment variable template
├── package.json
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- A [Discord application & bot token](https://discord.com/developers/applications)
- (Optional) [PM2](https://pm2.keymetrics.io) for production deployment

### 1. Clone the repository

```bash
git clone https://github.com/Pyugt/Pokebot.git
cd Pokebot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id_here
GUILD_ID=your_discord_server_id_here
```

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your bot's secret token from the Discord Developer Portal |
| `CLIENT_ID` | Your application's client ID (used to register slash commands) |
| `GUILD_ID` | The ID of your Discord server (for guild-scoped command registration) |

### 4. Run the bot

**Development (standard Node.js):**

```bash
node main.js
```

**Production (recommended — using PM2):**

```bash
# Install PM2 globally if you haven't already
npm install -g pm2

# Start the bot via the ecosystem config
pm2 start ecosystem.config.js

# Save the process list so it survives reboots
pm2 save
pm2 startup
```

---

## ⚙️ PM2 Commands

| Command | Description |
|---|---|
| `pm2 list` | View all running processes |
| `pm2 logs Pokebot` | Stream live logs |
| `pm2 restart Pokebot` | Restart the bot |
| `pm2 stop Pokebot` | Stop the bot |
| `pm2 monit` | Real-time process monitor |

PM2 keeps Pokebot alive continuously — if the process crashes for any reason, it restarts automatically without any manual intervention.

---

## 🗺 Roadmap

- [ ] Economy system (PokéCoins)
- [ ] Pokémon leveling & evolution
- [ ] Trading system between users
- [ ] MongoDB integration for scalable data storage
- [ ] Web dashboard for server stats

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue to report bugs or suggest features, or submit a pull request with improvements.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

