// Alternative version that loads environment and creates database connection directly
require('dotenv').config();
const {Sequelize} = require('sequelize');

// Database configuration
const config = {
  DB_NAME: process.env.DB_NAME || '',
  USER_NAME: process.env.DB_USER_NAME || '',
  PASSWORD: process.env.DB_PASSWORD || '',
  HOST: process.env.DB_HOST || '',
  PORT: process.env.DB_PORT || '',
  DIALECT: process.env.DB_DIALECT || 'postgres',
};

// Create sequelize instance
const sequelize = new Sequelize(
  config.DB_NAME,
  config.USER_NAME,
  config.PASSWORD,
  {
    host: config.HOST,
    port: Number(config.PORT),
    dialect: config.DIALECT,
    logging: false,
  }
);

/**
 * Reset a specific table's identity column to start from a value
 */
async function reseedTableIdentity(tableName, startValue = 1) {
  const sequenceName = `${tableName}_id_seq`;
  await sequelize.query(
    `ALTER SEQUENCE ${sequenceName} RESTART WITH ${startValue};`
  );
  console.log(`✅ Reset ${tableName} identity to start from ${startValue}`);
}

/**
 * Reset to next available value based on existing data
 */
async function reseedToNextAvailable(tableName) {
  // Get the maximum current ID
  const [result] = await sequelize.query(`
    SELECT COALESCE(MAX(id), 0) + 1 as next_id 
    FROM ${tableName}
  `);

  const nextId = result[0].next_id;
  await reseedTableIdentity(tableName, nextId);
  console.log(
    `✅ Reset ${tableName} identity to next available value: ${nextId}`
  );
}

/**
 * Main function demonstrating usage
 */
async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');
    const tables = [
      'profiles',
      'properties',
      'charges',
      'transactions',
      'categories',
      'property_assignments',
      'settings',
      'vouchers',
    ];
    for (const table of tables) {
      await reseedToNextAvailable(table);
    }
    console.log('✅ Identity reseeding completed successfully');
  } catch (error) {
    console.error('❌ Error reseeding identities:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  reseedTableIdentity,
  reseedToNextAvailable,
  main,
};
