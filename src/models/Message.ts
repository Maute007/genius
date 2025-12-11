import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import Conversation from './Conversation';

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
  public id!: number;
  public conversationId!: number;
  public content!: string;
  public role!: 'user' | 'assistant';
  public tokens!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): Record<string, unknown> {
    const values = super.toJSON() as Record<string, unknown>;
    values.createdAt = (this.createdAt as Date).toISOString();
    values.updatedAt = (this.updatedAt as Date).toISOString();
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
      type: DataTypes.ENUM('user', 'assistant'),
      allowNull: false,
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
