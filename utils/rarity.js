<<<<<<< HEAD
// /utils/rarity.js

const pokedex = require('../data/pokedex.json');

module.exports.getRarity = (name) => {
  const entry = pokedex.find(p => p.name.toLowerCase() === name.toLowerCase());
  return entry?.rarity || 'common';
};
=======
// /utils/rarity.js

const pokedex = require('../data/pokedex.json');

module.exports.getRarity = (name) => {
  const entry = pokedex.find(p => p.name.toLowerCase() === name.toLowerCase());
  return entry?.rarity || 'common';
};
>>>>>>> c1d5f1b841688771fe84b4e8558eed023ffd4f81
