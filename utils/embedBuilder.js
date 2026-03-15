// utils/embedBuilder.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getAnimatedSprite, getShinySprite, getOfficialArt, getTypeIconUrl } = require('./sprites');
const { xpBar, xpToNextLevel, MAX_LEVEL } = require('./xp');

// ── Type colours ──────────────────────────────────────────────────────────────
const TYPE_COLOURS = {
  normal: 0xA8A878, fire: 0xF08030, water: 0x6890F0, electric: 0xF8D030,
  grass: 0x78C850, ice: 0x98D8D8, fighting: 0xC03028, poison: 0xA040A0,
  ground: 0xE0C068, flying: 0xA890F0, psychic: 0xF85888, bug: 0xA8B820,
  rock: 0xB8A038, ghost: 0x705898, dragon: 0x7038F8, dark: 0x705848,
  steel: 0xB8B8D0, fairy: 0xEE99AC,
};

const COLOURS = {
  pokedex: 0xCC0000, shop: 0xF8D030, economy: 0xF1C40F,
  success: 0x2ECC71, fail: 0xE74C3C, info: 0x3498DB,
  neutral: 0x95A5A6, daily: 0xE67E22, evolution: 0x9B59B6,
};

const RARITY = {
  common:    { dot: '🟢', label: 'Common'    },
  uncommon:  { dot: '🔵', label: 'Uncommon'  },
  rare:      { dot: '🟣', label: 'Rare'      },
  legendary: { dot: '⭐', label: 'Legendary' },
};

const BALL_DISPLAY = {
  pokeball:   { name: 'Poké Ball',   dot: '🔴' },
  greatball:  { name: 'Great Ball',  dot: '🔵' },
  ultraball:  { name: 'Ultra Ball',  dot: '🟡' },
  masterball: { name: 'Master Ball', dot: '🟪' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function cap(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1) : ''; }
function capName(str) { return (str||'').replace(/-/g,' ').split(' ').map(cap).join(' '); }
function typeStr(types) { return types.map(cap).join(' / '); }
function getStat(stats, n) { return stats?.find(s=>s.stat.name===n)?.base_stat ?? 0; }
function statBar(v,max=255,len=10){const f=Math.round((v/max)*len);return'█'.repeat(Math.max(0,f))+'░'.repeat(Math.max(0,len-f));}
function statGrade(v){if(v>=120)return'🟢';if(v>=90)return'🟡';if(v>=60)return'🟠';return'🔴';}
function buildStatBlock(stats,len=10){
  const hp=getStat(stats,'hp'),atk=getStat(stats,'attack'),def=getStat(stats,'defense');
  const spa=getStat(stats,'special-attack'),spd=getStat(stats,'special-defense'),spe=getStat(stats,'speed');
  const bst=hp+atk+def+spa+spd+spe;
  const line=(label,v)=>`${statGrade(v)} \`${label.padEnd(3)}\` **${String(v).padStart(3)}**  ${statBar(v,255,len)}`;
  return[line('HP',hp),line('ATK',atk),line('DEF',def),line('SpA',spa),line('SpD',spd),line('SPE',spe),
    '`────────────────────`',`📊 **BST: ${bst}**`].join('\n');
}
function getFlavorText(species){return species?.flavor_text_entries?.find(e=>e.language.name==='en')?.flavor_text?.replace(/[\f\n\r]/g,' ')??null;}
function formatHeight(dm){const m=(dm/10).toFixed(1);const ti=Math.round(dm*3.937);return`${Math.floor(ti/12)}'${ti%12}"  /  ${m}m`;}
function formatWeight(hg){return`${(hg*0.2205).toFixed(1)} lbs  /  ${(hg/10).toFixed(1)} kg`;}
function embedColour(types,rarity,isShiny=false){if(isShiny)return 0xFFD700;if(rarity==='legendary')return 0xFFD700;return TYPE_COLOURS[types?.[0]]??0x78C850;}

// ── Level badge ───────────────────────────────────────────────────────────────
function levelBadge(level) {
  if (level >= 80) return '🏆';
  if (level >= 50) return '💫';
  if (level >= 20) return '⚡';
  return '🌱';
}

// ═════════════════════════════════════════════════════════════════════════════
// SPAWN & CATCH
// ═════════════════════════════════════════════════════════════════════════════

function buildSpawnEmbed(pokemon, species, dexEntry, isShiny=false) {
  const name=capName(pokemon.name),types=pokemon.types.map(t=>t.type.name);
  const dexNum=String(pokemon.id).padStart(3,'0'),colour=embedColour(types,dexEntry.rarity,isShiny);
  const flavor=getFlavorText(species),rar=RARITY[dexEntry.rarity]??RARITY.common;
  const sprite=isShiny?getShinySprite(dexEntry.name):getAnimatedSprite(dexEntry.name);
  const typeIcon=getTypeIconUrl(types[0]);
  return new EmbedBuilder()
    .setColor(colour)
    .setAuthor({name:`${typeStr(types)} Type  •  Pokédex #${dexNum}`,iconURL:typeIcon??undefined})
    .setTitle(isShiny?`✨ A wild Shiny **${name}** appeared!`:`⚡ A wild **${name}** appeared!`)
    .setDescription((isShiny?'> ⭐ **SHINY! Catch it before it flees!**\n\n':'')+(flavor?`*"${flavor}"*\n\n`:'')+`**Rarity:** ${rar.dot} ${rar.label}`)
    .setImage(sprite)
    .setFooter({text:'🎯 Choose a Pokéball below to catch it!'});
}

function buildCatchButtons(emojiIds={}) {
  const defs=[
    {id:'catch_pokeball', label:'Poké Ball', style:ButtonStyle.Primary, emoji:emojiIds.pokeball},
    {id:'catch_greatball',label:'Great Ball',style:ButtonStyle.Success, emoji:emojiIds.greatball},
    {id:'catch_ultraball',label:'Ultra Ball',style:ButtonStyle.Danger,  emoji:emojiIds.ultraball},
  ];
  const row=new ActionRowBuilder();
  for(const d of defs){const btn=new ButtonBuilder().setCustomId(d.id).setLabel(d.label).setStyle(d.style);if(d.emoji)btn.setEmoji(d.emoji);row.addComponents(btn);}
  return row;
}

function buildCatchSuccessEmbed(pokemon, species, user, result, isShiny=false) {
  const {reward, newLevel, leveledUp, levelsGained, caughtEntry} = result;
  const name=capName(pokemon.name),types=pokemon.types.map(t=>t.type.name);
  const colour=embedColour(types,null,isShiny),dexNum=String(pokemon.id).padStart(3,'0');
  const typeIcon=getTypeIconUrl(types[0]),genus=species?.genera?.find(g=>g.language.name==='en')?.genus??'Pokémon';
  const sprite=getOfficialArt(pokemon);
  const xpGained=result.caughtEntry?.xp ?? 0;
  const xpStr = `+${require('./xp').getXpReward(caughtEntry?.rarity ?? 'common')} XP  (Lv.${newLevel})`;

  let desc = `**${user.username}** added **${isShiny?'✨ Shiny ':''}${name}** to their Pokédex!`;
  if(leveledUp) desc += `\n\n${levelBadge(newLevel)} Reached **Level ${newLevel}**!`;

  return new EmbedBuilder()
    .setColor(colour)
    .setAuthor({name:`${typeStr(types)} Type  •  ${genus}`,iconURL:typeIcon??undefined})
    .setTitle(`🎉 Gotcha! ${isShiny?'✨ Shiny ':''}${name} was caught!`)
    .setDescription(desc)
    .setThumbnail(sprite)
    .addFields(
      {name:'📈 Base Stats', value:buildStatBlock(pokemon.stats), inline:false},
      {name:'🏷️ Type',        value:typeStr(types),               inline:true},
      {name:'💰 Pokécoins',   value:isShiny?`+${reward} *(3× shiny!)*`:`+${reward}`, inline:true},
      {name:'⭐ XP Gained',   value:xpStr,                        inline:true},
    )
    .setFooter({text:`Pokédex #${dexNum}`, iconURL:user.displayAvatarURL()})
    .setTimestamp();
}

function buildCatchFailEmbed(pokemon, ballType, isShiny=false) {
  const name=capName(pokemon.name),types=pokemon.types.map(t=>t.type.name);
  const typeIcon=getTypeIconUrl(types[0]),ballName=BALL_DISPLAY[ballType]?.name??'Pokéball';
  const sprite=isShiny?getShinySprite(pokemon.name):getAnimatedSprite(pokemon.name);
  return new EmbedBuilder()
    .setColor(COLOURS.fail)
    .setAuthor({name:`${typeStr(types)} Type`,iconURL:typeIcon??undefined})
    .setTitle(`💨 ${name} broke free!`)
    .setDescription(`The **${ballName}** couldn't hold **${name}**!\nTry a stronger ball — it's still out there.\n`+(isShiny?'\n> ⭐ **That was a SHINY! Don\'t give up!**':''))
    .setThumbnail(sprite)
    .setFooter({text:'The Pokémon is still in the area!'});
}

function buildNoSpawnEmbed(){return new EmbedBuilder().setColor(COLOURS.neutral).setTitle('🌿 No wild Pokémon here!').setDescription('There\'s nothing to catch right now.\nWait for a Pokémon to appear in the channel!');}
function buildNoBallsEmbed(ballType){const n=BALL_DISPLAY[ballType]?.name??'that Pokéball';return new EmbedBuilder().setColor(COLOURS.daily).setTitle(`📦 Out of ${n}s!`).setDescription(`You're all out of **${n}s**.\n\`!shop\` → \`!buy ${ballType}\``);}

// ═════════════════════════════════════════════════════════════════════════════
// EVOLUTION EMBED
// ═════════════════════════════════════════════════════════════════════════════

function buildEvolutionEmbed(oldPokemon, newPokemon, oldSpecies, newSpecies, user, newLevel) {
  const oldName = capName(oldPokemon.name);
  const newName = capName(newPokemon.name);
  const types   = newPokemon.types.map(t=>t.type.name);
  const colour  = embedColour(types, null);
  const typeIcon = getTypeIconUrl(types[0]);
  const newSprite = getOfficialArt(newPokemon);
  const genus = newSpecies?.genera?.find(g=>g.language.name==='en')?.genus ?? 'Pokémon';

  return new EmbedBuilder()
    .setColor(colour)
    .setAuthor({name:`${typeStr(types)} Type  •  ${genus}`, iconURL:typeIcon??undefined})
    .setTitle(`🎊 ${oldName} evolved into ${newName}!`)
    .setDescription(
      `**${user.username}**'s **${oldName}** evolved!\n\n` +
      `${oldName} **→** ✨ **${newName}**\n\n` +
      `*Reached Level ${newLevel} and evolved!*`
    )
    .setImage(newSprite)
    .setFooter({text:`Use !inspect to see ${newName}'s full stats`, iconURL:user.displayAvatarURL()})
    .setTimestamp();
}

// ═════════════════════════════════════════════════════════════════════════════
// PARTY CARD  (!pokemon)
// ═════════════════════════════════════════════════════════════════════════════

function buildPartyCard(pokemon, species, localEntry, user, caughtEntry, page, total) {
  const name     = capName(pokemon.name);
  const types    = pokemon.types.map(t=>t.type.name);
  const dexNum   = String(pokemon.id).padStart(3,'0');
  const isShiny  = caughtEntry?.isShiny ?? false;
  const level    = caughtEntry?.level ?? 1;
  const xp       = caughtEntry?.xp ?? 0;
  const colour   = embedColour(types, localEntry?.rarity, isShiny);
  const typeIcon = getTypeIconUrl(types[0]);
  const flavor   = getFlavorText(species);
  const genus    = species?.genera?.find(g=>g.language.name==='en')?.genus??'Unknown Pokémon';
  const rar      = RARITY[localEntry?.rarity]??RARITY.common;
  const sprite   = isShiny
    ? (pokemon.sprites?.other?.['official-artwork']?.front_shiny ?? getOfficialArt(pokemon))
    : getOfficialArt(pokemon);
  const height = pokemon.height!=null?formatHeight(pokemon.height):'???';
  const weight = pokemon.weight!=null?formatWeight(pokemon.weight):'???';

  // XP progress bar
  const xpNeeded  = level >= MAX_LEVEL ? '—' : xpToNextLevel(level);
  const xpBarStr  = level >= MAX_LEVEL ? '`MAX LEVEL`' : `\`${xpBar(xp, level, 12)}\`  ${xp} / ${xpNeeded} XP`;

  return new EmbedBuilder()
    .setColor(colour)
    .setAuthor({name:`${typeStr(types)} Type  •  ${genus}`, iconURL:typeIcon??undefined})
    .setTitle(`${isShiny?'✨ ':''}#${dexNum} — ${name}`)
    .setDescription(flavor?`*"${flavor}"*`:null)
    .setImage(sprite)
    .addFields(
      {name:`${levelBadge(level)} Level`,  value:`**${level}** / ${MAX_LEVEL}`,          inline:true},
      {name:'⭐ XP Progress',              value:xpBarStr,                                inline:false},
      {name:'📈 Base Stats',               value:buildStatBlock(pokemon.stats),           inline:false},
      {name:'🏷️ Type',                     value:typeStr(types),                          inline:true},
      {name:'✨ Rarity',                   value:`${rar.dot} ${rar.label}`,               inline:true},
      {name:'🎯 Catch Rate',               value:localEntry?`${localEntry.catchRate}%`:'?%', inline:true},
      {name:'📐 Height',                   value:height,                                  inline:true},
      {name:'⚖️ Weight',                   value:weight,                                  inline:true},
    )
    .setFooter({
      text:`${user.username}'s Pokémon  •  ${page} / ${total} caught`,
      iconURL:user.displayAvatarURL(),
    });
}

function buildPartyButtons(page, total, userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`party_prev_${page}_${userId}`).setLabel('◀  Prev').setStyle(ButtonStyle.Secondary).setDisabled(page<=1),
    new ButtonBuilder().setCustomId(`party_next_${page}_${userId}`).setLabel('Next  ▶').setStyle(ButtonStyle.Secondary).setDisabled(page>=total),
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// INSPECT EMBED  (!inspect)
// ═════════════════════════════════════════════════════════════════════════════

function buildInspectEmbed(pokemon, species, caughtEntry, user) {
  const name     = capName(pokemon.name);
  const types    = pokemon.types.map(t=>t.type.name);
  const dexNum   = String(pokemon.id).padStart(3,'0');
  const level    = caughtEntry.level;
  const xp       = caughtEntry.xp;
  const isShiny  = caughtEntry.isShiny;
  const colour   = embedColour(types, null, isShiny);
  const typeIcon = getTypeIconUrl(types[0]);
  const sprite   = isShiny
    ? (pokemon.sprites?.other?.['official-artwork']?.front_shiny ?? getOfficialArt(pokemon))
    : getOfficialArt(pokemon);
  const genus = species?.genera?.find(g=>g.language.name==='en')?.genus??'Pokémon';

  const xpNeeded = level >= MAX_LEVEL ? '—' : xpToNextLevel(level);
  const xpBarStr = level >= MAX_LEVEL
    ? '`MAX LEVEL 🏆`'
    : `\`${xpBar(xp, level, 14)}\`\n${xp} / ${xpNeeded} XP to Level ${level+1}`;

  const caughtDate = caughtEntry.caughtAt
    ? new Date(caughtEntry.caughtAt).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})
    : 'Unknown';

  // Top 4 moves from PokéAPI
  const moves = pokemon.moves
    ?.slice(0, 4)
    .map(m => `\`${capName(m.move.name)}\``)
    .join('  ') ?? 'None';

  return new EmbedBuilder()
    .setColor(colour)
    .setAuthor({name:`${typeStr(types)} Type  •  ${genus}`, iconURL:typeIcon??undefined})
    .setTitle(`${isShiny?'✨ ':''}#${dexNum} — ${name}`)
    .setThumbnail(sprite)
    .addFields(
      {name:`${levelBadge(level)} Level`,  value:`**${level}** / ${MAX_LEVEL}`,  inline:true},
      {name:'🏷️ Type',                     value:typeStr(types),                  inline:true},
      {name:'✨ Shiny',                    value:isShiny?'Yes ✨':'No',           inline:true},
      {name:'📊 XP Progress',              value:xpBarStr,                        inline:false},
      {name:'📈 Base Stats',               value:buildStatBlock(pokemon.stats),   inline:false},
      {name:'⚔️ Moves',                    value:moves,                           inline:false},
      {name:'📅 Caught On',               value:caughtDate,                      inline:true},
    )
    .setFooter({text:`Inspected by ${user.username}`, iconURL:user.displayAvatarURL()});
}

// ═════════════════════════════════════════════════════════════════════════════
// NATIONAL POKÉDEX  (!pokedex)
// ═════════════════════════════════════════════════════════════════════════════

const POKEDEX_PAGE_SIZE = 10;

function buildPokedexListEmbed(pokedexData, userCaught, page, user) {
  const totalPages=Math.ceil(pokedexData.length/POKEDEX_PAGE_SIZE);
  const start=((page-1)*POKEDEX_PAGE_SIZE);
  const slice=pokedexData.slice(start,start+POKEDEX_PAGE_SIZE);

  // userCaught can be [String] (legacy) or [{name,...}] (new schema)
  const caughtSet=new Set((userCaught||[]).map(e=>(typeof e==='string'?e:e.name).toLowerCase()));
  const caughtCount=pokedexData.filter(e=>caughtSet.has(e.name.toLowerCase())).length;

  // Build max level map for caught Pokémon
  const levelMap=new Map();
  (userCaught||[]).forEach(e=>{
    if(typeof e==='object'&&e.name) levelMap.set(e.name.toLowerCase(), e.level??1);
  });

  const lines=slice.map((entry,i)=>{
    const num=String(start+i+1).padStart(3,'0');
    const isCaught=caughtSet.has(entry.name.toLowerCase());
    const status=isCaught?'✅':'◻️';
    const rar=RARITY[entry.rarity]??RARITY.common;
    const lvl=isCaught&&levelMap.has(entry.name.toLowerCase())?` · Lv.${levelMap.get(entry.name.toLowerCase())}`:'';
    return `\`#${num}\` ${status} **${entry.name}**${lvl} — ${rar.dot} ${rar.label} · \`${entry.catchRate}%\``;
  });

  const progressFilled=Math.round((caughtCount/pokedexData.length)*20);
  const progressBar='█'.repeat(progressFilled)+'░'.repeat(20-progressFilled);

  return new EmbedBuilder()
    .setColor(COLOURS.pokedex)
    .setAuthor({name:`${user.username}'s Pokédex`, iconURL:user.displayAvatarURL()})
    .setTitle('📖 National Pokédex — Kanto')
    .setDescription(lines.join('\n'))
    .addFields({name:`Progress: ${caughtCount} / ${pokedexData.length}`, value:`\`${progressBar}\`  **${Math.round((caughtCount/pokedexData.length)*100)}%**`})
    .setFooter({text:`Page ${page} / ${totalPages}  •  !pokemon to view your caught Pokémon  •  !inspect <n> for details`});
}

function buildPokedexButtons(page, totalPages, userId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`pokedex_prev_${page}_${userId}`).setLabel('◀  Prev').setStyle(ButtonStyle.Secondary).setDisabled(page<=1),
    new ButtonBuilder().setCustomId(`pokedex_next_${page}_${userId}`).setLabel('Next  ▶').setStyle(ButtonStyle.Secondary).setDisabled(page>=totalPages),
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// HELP / ECONOMY (unchanged structure, updated text)
// ═════════════════════════════════════════════════════════════════════════════

function buildHelpEmbed(){
  return new EmbedBuilder()
    .setColor(COLOURS.info)
    .setTitle('📖 Pokébot — Command Reference')
    .setDescription('Catch wild Pokémon, level them up, and build your collection!\n\u200b')
    .addFields(
      {name:'⚡ Catching',value:['`!spawn` — Spawn a wild Pokémon','`!catch <ball>` — Throw a Pokéball *(or use the buttons!)*'].join('\n'),inline:false},
      {name:'📖 Pokédex', value:['`!pokedex [page]` — Browse all 151 Kanto Pokémon','`!pokemon [n]` — View your caught Pokémon','`!inspect [n]` — Detailed view with level & XP'].join('\n'),inline:false},
      {name:'💰 Economy', value:['`!shop` — View Pokéball prices','`!buy <ball>` — Purchase a Pokéball','`!bag` — View your inventory','`!balance` — Check your Pokécoin balance','`!daily` — Claim your daily coin reward'].join('\n'),inline:false},
    )
    .setFooter({text:'Balls: pokeball · greatball · ultraball · masterball'});
}

function buildBagEmbed(userData, user){
  const inv=userData.inventory??{},coins=userData.coins??0,caught=(userData.caught??[]).length;
  return new EmbedBuilder()
    .setColor(COLOURS.info)
    .setAuthor({name:`${user.username}'s Bag`,iconURL:user.displayAvatarURL()})
    .setTitle('🎒 Inventory')
    .addFields(
      {name:'Pokéballs',value:[`🔴 **Poké Ball** — \`${inv.pokeball??0}\``,`🔵 **Great Ball** — \`${inv.greatball??0}\``,`🟡 **Ultra Ball** — \`${inv.ultraball??0}\``,`🟪 **Master Ball** — \`${inv.masterball??0}\``].join('\n'),inline:false},
      {name:'💰 Pokécoins',value:`**${coins.toLocaleString()}** coins`,inline:true},
      {name:'📖 Pokémon Caught',value:`**${caught}** total`,inline:true},
    )
    .setFooter({text:'!buy <ball> to restock  •  !daily for free coins'});
}

function buildShopEmbed(pokeballs){
  const items=Object.entries(pokeballs).filter(([k])=>k!=='masterball').map(([key,data])=>{
    const d=BALL_DISPLAY[key],rareCatch=Math.round((data.multiplier?.rare??1)*100);
    return[`${d?.dot??'⚪'} **${d?.name??key}** — \`${data.price} coins\``,`> ${rareCatch}% catch modifier on Rare Pokémon · \`!buy ${key}\``].join('\n');
  }).join('\n\n');
  return new EmbedBuilder()
    .setColor(COLOURS.shop)
    .setTitle('🛒 Pokéball Shop')
    .setDescription('Spend Pokécoins on Pokéballs to catch more Pokémon.\n\u200b')
    .addFields({name:'Available Items',value:items||'No items.'})
    .setFooter({text:'!balance to check your coins  •  Earn coins by catching Pokémon'});
}

function buildBuySuccessEmbed(ballType,cost,newBalance,newQty){
  const d=BALL_DISPLAY[ballType];
  return new EmbedBuilder().setColor(COLOURS.success).setTitle('✅ Purchase Successful!')
    .setDescription(`You bought a ${d?.dot??'⚪'} **${d?.name??ballType}** for **${cost} coins**.`)
    .addFields({name:'New Balance',value:`**${newBalance.toLocaleString()}** coins`,inline:true},{name:'Stock',value:`**${newQty}x** ${d?.name??ballType}`,inline:true})
    .setFooter({text:'Use your balls on the next wild Pokémon!'});
}

function buildBuyFailEmbed(reason){
  const msgs={invalid:'Not a valid item.\nAvailable: `pokeball`, `greatball`, `ultraball`.',broke:'Not enough coins!\nCatch Pokémon to earn coins, or claim `!daily`.',unknown:'Something went wrong.'};
  return new EmbedBuilder().setColor(COLOURS.fail).setTitle('❌ Purchase Failed').setDescription(msgs[reason]??msgs.unknown).setFooter({text:'!shop to see prices'});
}

function buildBalanceEmbed(userData, user){
  const coins=userData.coins??0,caught=(userData.caught??[]).length,inv=userData.inventory??{};
  const balls=(inv.pokeball??0)+(inv.greatball??0)+(inv.ultraball??0)+(inv.masterball??0);
  return new EmbedBuilder().setColor(COLOURS.economy)
    .setAuthor({name:`${user.username}'s Wallet`,iconURL:user.displayAvatarURL()})
    .setTitle('💰 Pokécoin Balance').setDescription(`You have **${coins.toLocaleString()} Pokécoins**.`)
    .addFields({name:'Pokéballs',value:`**${balls}** in bag`,inline:true},{name:'Pokémon Caught',value:`**${caught}** total`,inline:true})
    .setFooter({text:'!daily for a free bonus  •  !shop to spend coins'});
}

function buildDailyEmbed(reward,newBalance,user,alreadyClaimed=false,msRemaining=0){
  if(alreadyClaimed){
    const h=Math.floor(msRemaining/3_600_000),m=Math.floor((msRemaining%3_600_000)/60_000);
    return new EmbedBuilder().setColor(COLOURS.neutral).setTitle('⏳ Already Claimed!').setDescription(`Come back in **${h}h ${m}m**!`).setFooter({text:'Daily resets every 24 hours'});
  }
  return new EmbedBuilder().setColor(COLOURS.daily)
    .setAuthor({name:user.username,iconURL:user.displayAvatarURL()})
    .setTitle('🎁 Daily Reward Claimed!').setDescription(`You received **+${reward} Pokécoins**!`)
    .addFields({name:'New Balance',value:`**${newBalance.toLocaleString()}** coins`,inline:true})
    .setFooter({text:'Come back tomorrow for another reward!'}).setTimestamp();
}

module.exports = {
  buildSpawnEmbed, buildCatchButtons, buildCatchSuccessEmbed, buildCatchFailEmbed,
  buildNoSpawnEmbed, buildNoBallsEmbed, buildEvolutionEmbed,
  buildPokedexListEmbed, buildPokedexButtons, POKEDEX_PAGE_SIZE,
  buildPartyCard, buildPartyButtons,
  buildInspectEmbed,
  buildHelpEmbed, buildBagEmbed, buildShopEmbed,
  buildBuySuccessEmbed, buildBuyFailEmbed, buildBalanceEmbed, buildDailyEmbed,
  cap, capName,
};
