import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('[Database] DATABASE_URL not set, using SQLite in-memory');
}

export const sequelize = databaseUrl 
  ? new Sequelize(databaseUrl, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      define: {
        timestamps: true,
        underscored: true,
      },
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false,
        } : false,
      },
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
    });

export async function initializeDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('[Database] Connection established successfully.');
    
    await sequelize.sync({ alter: true });
    console.log('[Database] Models synchronized.');
  } catch (error) {
    console.error('[Database] Unable to connect:', error);
    throw error;
  }
}
