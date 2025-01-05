const { Sequelize , Op } = require('sequelize');
const { DATABASE_URL } = require('./config')
const { Umzug, SequelizeStorage } = require('umzug')

const sequelize = new Sequelize(DATABASE_URL, {dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Allows self-signed certificates
    },
  },})

  const migrationConf = {
    migrations: {
      glob: 'migrations/*.js',
    },
    storage : new SequelizeStorage({ sequelize, tableName: 'migrations' }),
    context: sequelize.getQueryInterface(),
    logger: console
  }
  
  const runMigrations = async () => {
    const migrator = new Umzug(migrationConf)
    const migrations = await migrator.up()
  
    console.log('Migrations up to date', {
      files : migrations.map((mig) => mig.name),
    })
  }
  
  const connectToDatabase = async () => {
      try {
        await sequelize.authenticate()
        await runMigrations()
        console.log('connected to the database')
      } catch (err) {
        console.log('failed to connect to the database', err)
        return process.exit(1)
      }
    
      return null
    }
    
    module.exports = { connectToDatabase, sequelize, Op }