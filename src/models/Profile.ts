import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface ProfileAttributes {
  id: number;
  userId: number;
  name: string | null;
  email: string | null;
  age: number | null;
  grade: string | null;
  interests: string | null;
  province: string | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileCreationAttributes extends Optional<ProfileAttributes, 'id' | 'name' | 'email' | 'age' | 'grade' | 'interests' | 'province' | 'onboardingCompleted' | 'createdAt' | 'updatedAt'> {}

class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
  declare id: number;
  declare userId: number;
  declare name: string | null;
  declare email: string | null;
  declare age: number | null;
  declare grade: string | null;
  declare interests: string | null;
  declare province: string | null;
  declare onboardingCompleted: boolean;
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

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    grade: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    interests: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    onboardingCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: 'profiles',
    modelName: 'Profile',
  }
);

export default Profile;
