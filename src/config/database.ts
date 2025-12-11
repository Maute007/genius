import { Sequelize } from 'sequelize';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../database.sqlite');

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
