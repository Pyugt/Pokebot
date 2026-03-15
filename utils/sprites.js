// utils/sprites.js
// Single source of truth for every image URL the bot uses.

// ── Showdown slug overrides ───────────────────────────────────────────────────
const SHOWDOWN_OVERRIDES = {
  'nidoran♀':   'nidoran-f',
  'nidoran♂':   'nidoran-m',
  'mr. mime':   'mr-mime',
  "farfetch'd": 'farfetchd',
  'mime jr.':   'mime-jr',
  "sirfetch'd": 'sirfetchd',
  'mr. rime':   'mr-rime',
  'type: null': 'type-null',
};

function getShowdownSlug(name) {
  const lower = (name || '').toLowerCase().trim();
  if (SHOWDOWN_OVERRIDES[lower]) return SHOWDOWN_OVERRIDES[lower];
  return lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ── Animated sprites (Pokémon Showdown) ──────────────────────────────────────

/** Animated front GIF — used on spawn & catch fail */
function getAnimatedSprite(name) {
  return `https://play.pokemonshowdown.com/sprites/ani/${getShowdownSlug(name)}.gif`;
}

/** Animated shiny GIF — used on shiny spawns & fail */
function getShinySprite(name) {
  return `https://play.pokemonshowdown.com/sprites/ani-shiny/${getShowdownSlug(name)}.gif`;
}

// ── Official art (PokéAPI) ────────────────────────────────────────────────────

/** High-res official artwork — used on Pokédex & catch success */
function getOfficialArt(pokemon) {
  return (
    pokemon?.sprites?.other?.['official-artwork']?.front_default ??
    pokemon?.sprites?.front_default ??
    null
  );
}

/** High-res official shiny artwork */
function getOfficialArtShiny(pokemon) {
  return (
    pokemon?.sprites?.other?.['official-artwork']?.front_shiny ??
    pokemon?.sprites?.front_shiny ??
    null
  );
}

// ── Type icons ────────────────────────────────────────────────────────────────
// Using Generation VIII (Sword/Shield) type badge sprites.
// These are the coloured pill badges from the games.
// Path: /sprites/types/generation-viii/sword-shield/en/{id}.png
// Gen-VIII is the most reliably populated folder in the PokeAPI sprites repo.

const TYPE_IDS = {
  normal: 1, fighting: 2, flying: 3, poison: 4, ground: 5,
  rock: 6, bug: 7, ghost: 8, steel: 9, fire: 10, water: 11,
  grass: 12, electric: 13, psychic: 14, ice: 15, dragon: 16,
  dark: 17, fairy: 18,
};

const TYPE_ICON_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-viii/sword-shield/en/';

/**
 * Returns the URL of the official Pokémon type badge image (gen-viii sword-shield).
 * Renders as a small icon in Discord's embed author field.
 * @param {string} typeName  e.g. 'fire', 'water'
 * @returns {string|null}
 */
function getTypeIconUrl(typeName) {
  const id = TYPE_IDS[typeName?.toLowerCase()];
  if (!id) return null;
  return `${TYPE_ICON_BASE}${id}.png`;
}

// ── Pokéball sprites (Bulbapedia CDN) ─────────────────────────────────────────
// These are reliable static images of each ball.
const BALL_SPRITES = {
  pokeball:  'https://archives.bulbagarden.net/media/upload/thumb/1/1d/Bag_Pok%C3%A9_Ball_SV_Sprite.png/40px-Bag_Pok%C3%A9_Ball_SV_Sprite.png',
  greatball: 'https://archives.bulbagarden.net/media/upload/thumb/5/52/Bag_Great_Ball_SV_Sprite.png/40px-Bag_Great_Ball_SV_Sprite.png',
  ultraball: 'https://archives.bulbagarden.net/media/upload/thumb/5/55/Bag_Ultra_Ball_SV_Sprite.png/40px-Bag_Ultra_Ball_SV_Sprite.png',
  masterball:'https://archives.bulbagarden.net/media/upload/thumb/e/e6/Bag_Master_Ball_SV_Sprite.png/40px-Bag_Master_Ball_SV_Sprite.png',
};

function getBallSprite(ballType) {
  return BALL_SPRITES[ballType] ?? null;
}

module.exports = {
  getAnimatedSprite,
  getShinySprite,
  getOfficialArt,
  getOfficialArtShiny,
  getTypeIconUrl,
  getBallSprite,
  getShowdownSlug,
};
