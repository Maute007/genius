import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ProfileAttributes {
  id: number;
  userId: number;
  name: string | null;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileCreationAttributes extends Optional<ProfileAttributes, 'id' | 'name' | 'email' | 'createdAt' | 'updatedAt'> {}

class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
  public id!: number;
  public userId!: number;
  public name!: string | null;
  public email!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public toJSON(): Record<string, unknown> {
    const values = super.toJSON() as Record<string, unknown>;
    values.createdAt = (this.createdAt as Date).toISOString();
    values.updatedAt = (this.updatedAt as Date).toISOString();
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
