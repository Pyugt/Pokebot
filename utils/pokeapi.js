// utils/pokeapi.js
// Thin PokéAPI wrapper with in-memory cache.

const cache = new Map();

const NAME_OVERRIDES = {
  'nidoran♀':   'nidoran-f',
  'nidoran♂':   'nidoran-m',
  'mr. mime':   'mr-mime',
  "farfetch'd": 'farfetchd',
  'mime jr.':   'mime-jr',
  "sirfetch'd": 'sirfetchd',
  'mr. rime':   'mr-rime',
  'type: null': 'type-null',
};

function toApiSlug(name) {
  const lower = (name || '').toLowerCase().trim();
  if (NAME_OVERRIDES[lower]) return NAME_OVERRIDES[lower];
  return lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchJson(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PokéAPI ${url} → ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
}

async function getPokemon(name) {
  const slug = toApiSlug(name);
  return fetchJson(`https://pokeapi.co/api/v2/pokemon/${slug}`);
}

async function getSpecies(id) {
  return fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
}

async function getEvolutionChain(url) {
  return fetchJson(url);
}

/**
 * Given a Pokémon name and its current level, returns evolution data if applicable.
 *
 * @param {string} pokemonName  Display name e.g. 'Bulbasaur'
 * @param {number} level        Current level
 * @returns {{ evolvesTo: string, minLevel: number } | null}
 */
async function checkEvolution(pokemonName, level) {
  try {
    const pokemon = await getPokemon(pokemonName);
    const species = await getSpecies(pokemon.id);
    const chain   = await getEvolutionChain(species.evolution_chain.url);

    return walkChain(chain.chain, toApiSlug(pokemonName), level);
  } catch (err) {
    console.error('[checkEvolution] error:', err.message);
    return null;
  }
}

/**
 * Recursively walk the evolution chain tree.
 * Returns the first level-up evolution found for `targetSlug` at `level`.
 */
function walkChain(node, targetSlug, level) {
  const nodeSlug = node.species.name.toLowerCase();

  if (nodeSlug === targetSlug) {
    for (const evo of node.evolves_to) {
      const details = evo.evolution_details?.[0];
      if (
        details?.trigger?.name === 'level-up' &&
        details?.min_level != null &&
        level >= details.min_level
      ) {
        return {
          evolvesTo: evo.species.name,   // PokéAPI slug e.g. 'ivysaur'
          minLevel:  details.min_level,
        };
      }
    }
    return null; // Found the Pokémon but no level-up evolution applies
  }

  for (const evo of node.evolves_to) {
    const result = walkChain(evo, targetSlug, level);
    if (result !== null) return result;
  }

  return null;
}

module.exports = { getPokemon, getSpecies, getEvolutionChain, checkEvolution, toApiSlug };
