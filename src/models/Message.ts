import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import Conversation from './Conversation.js';

export interface MessageAttributes {
  id: number;
  conversationId: number;
  content: string;
  role: 'user' | 'assistant';
  tokens: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'tokens' | 'createdAt' | 'updatedAt'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  declare id: number;
  declare conversationId: number;
  declare content: string;
  declare role: 'user' | 'assistant';
  declare tokens: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  toJSON() {
    const values = { ...this.get() } as Record<string, unknown>;
    if (this.get('createdAt')) {
      values.createdAt = (this.get('createdAt') as Date).toISOString();
    }
    if (this.get('updatedAt')) {
      values.updatedAt = (this.get('updatedAt') as Date).toISOString();
    }
    return values;
  }
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['user', 'assistant']],
      },
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    modelName: 'Message',
  }
);

Conversation.hasMany(Message, { foreignKey: 'conversationId', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Conversation, { foreignKey: 'conversationId', as: 'conversation' });

export default Message;
