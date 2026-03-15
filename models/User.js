// models/User.js
// Caught is now an array of objects instead of strings.
// Each entry stores the Pokémon's name, level, XP, shiny status, and catch date.

const { Schema, model, models } = require('mongoose');

const CaughtPokemonSchema = new Schema({
  name:     { type: String,  required: true              },
  level:    { type: Number,  default: 1,   min: 1, max: 100 },
  xp:       { type: Number,  default: 0,   min: 0        },
  isShiny:  { type: Boolean, default: false               },
  caughtAt: { type: Date,    default: Date.now            },
}, { _id: true });

const UserSchema = new Schema({
  userId: {
    type:     String,
    required: true,
    unique:   true,
    index:    true,
  },
  caught:    { type: [CaughtPokemonSchema], default: [] },
  inventory: {
    pokeball:   { type: Number, default: 5 },
    greatball:  { type: Number, default: 2 },
    ultraball:  { type: Number, default: 1 },
    masterball: { type: Number, default: 0 },
  },
  coins:     { type: Number, default: 100 },
  lastDaily: { type: Number, default: 0   },
}, { timestamps: true });

module.exports = models.User ?? model('User', UserSchema);
