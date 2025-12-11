import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

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
  public id!: number;
  public title!: string;
  public mode!: 'quick_doubt' | 'exam_prep' | 'revision' | 'free_learning';
  public subject!: string | null;
  public topic!: string | null;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): Record<string, unknown> {
    const values = super.toJSON() as Record<string, unknown>;
    values.createdAt = (this.createdAt as Date).toISOString();
    values.updatedAt = (this.updatedAt as Date).toISOString();
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
      type: DataTypes.ENUM('quick_doubt', 'exam_prep', 'revision', 'free_learning'),
      allowNull: false,
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
