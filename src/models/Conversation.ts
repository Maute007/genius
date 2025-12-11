import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface ConversationAttributes {
  id: number;
  title: string;
  mode: 'quick_doubt' | 'exam_prep' | 'revision' | 'free_learning';
  subject: string | null;
  topic: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationCreationAttributes extends Optional<ConversationAttributes, 'id' | 'subject' | 'topic' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class Conversation extends Model<ConversationAttributes, ConversationCreationAttributes> implements ConversationAttributes {
  declare id: number;
  declare title: string;
  declare mode: 'quick_doubt' | 'exam_prep' | 'revision' | 'free_learning';
  declare subject: string | null;
  declare topic: string | null;
  declare isActive: boolean;
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

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['quick_doubt', 'exam_prep', 'revision', 'free_learning']],
      },
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    topic: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'conversations',
    modelName: 'Conversation',
  }
);

export default Conversation;
