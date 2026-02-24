// /utils/rarity.js

const pokedex = require('../data/pokedex.json');

module.exports.getRarity = (name) => {
  const entry = pokedex.find(p => p.name.toLowerCase() === name.toLowerCase());
  return entry?.rarity || 'common';
};
