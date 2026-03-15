// scripts/migrate.js
// One-time migration script.
// Converts caught: ['Pikachu', 'Bulbasaur'] → caught: [{ name, level, xp, isShiny, caughtAt }]
//
// Run ONCE with: node scripts/migrate.js
// Safe to run multiple times — already-migrated entries are skipped.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');

async function migrate() {
  console.log('🔄 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected\n');

  const users = await User.find({});
  console.log(`Found ${users.length} user(s) to check.\n`);

  let migrated = 0;
  let skipped  = 0;

  for (const user of users) {
    const needsMigration = user.caught.some(e => typeof e === 'string');

    if (!needsMigration) {
      skipped++;
      continue;
    }

    // Convert any string entries to the new object format
    user.caught = user.caught.map(e => {
      if (typeof e === 'string') {
        return { name: e, level: 1, xp: 0, isShiny: false, caughtAt: new Date() };
      }
      return e; // already an object, leave it
    });

    await user.save();
    console.log(`✅ Migrated user ${user.userId} — ${user.caught.length} Pokémon converted`);
    migrated++;
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Migrated: ${migrated} user(s)`);
  console.log(`   Skipped:  ${skipped} user(s) (already up to date)`);

  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
