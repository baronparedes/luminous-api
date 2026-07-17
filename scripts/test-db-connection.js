// Database connection test script
const {Sequelize} = require('sequelize');
require('dotenv').config();

const config = {
  DB_NAME: process.env.DB_NAME || '',
  USER_NAME: process.env.DB_USER_NAME || '',
  PASSWORD: process.env.DB_PASSWORD || '',
  HOST: process.env.DB_HOST || '',
  PORT: process.env.DB_PORT || '',
  DIALECT: process.env.DB_DIALECT || 'postgres',
};

console.log('🔍 Database Configuration:');
console.log('  Database Name:', config.DB_NAME);
console.log('  Username:', config.USER_NAME);
console.log('  Host:', config.HOST);
console.log('  Port:', config.PORT);
console.log('  Dialect:', config.DIALECT);
console.log('  Password:', config.PASSWORD ? '***hidden***' : 'NOT SET');
console.log('');

async function testConnection() {
  const sequelize = new Sequelize(
    config.DB_NAME,
    config.USER_NAME,
    config.PASSWORD,
    {
      host: config.HOST,
      port: Number(config.PORT),
      dialect: config.DIALECT,
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );

  try {
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');

    // Test basic query
    const [results] = await sequelize.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', results[0].version);
  } catch (error) {
    console.log('❌ Database connection failed:');
    console.error('Error details:', error.message);

    if (error.code) {
      console.log('Error code:', error.code);
    }

    // Common error suggestions
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Suggestions:');
      console.log('  - Check if PostgreSQL is running');
      console.log('  - Verify host and port are correct');
      console.log(
        '  - Try connecting with: psql -h',
        config.HOST,
        '-p',
        config.PORT,
        '-U',
        config.USER_NAME,
        config.DB_NAME
      );
    }

    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Suggestions:');
      console.log('  - Check username and password');
      console.log('  - Verify user has access to the database');
    }

    if (error.message.includes('does not exist')) {
      console.log('\n💡 Suggestions:');
      console.log('  - Check if database exists');
      console.log(
        '  - Create database with: createdb -h',
        config.HOST,
        '-p',
        config.PORT,
        '-U',
        config.USER_NAME,
        config.DB_NAME
      );
    }
  } finally {
    await sequelize.close();
  }
}

testConnection();
