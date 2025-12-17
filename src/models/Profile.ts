import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export interface ProfileAttributes {
  id: number;
  userId: number;
  fullName: string | null;
  email: string | null;
  whatsapp: string | null;
  age: number | null;
  grade: string | null;
  interests: object | null;
  otherInterests: string | null;
  learningStyle: string | null;
  learningPreferences: object | null;
  challenges: string | null;
  studyGoals: string | null;
  schoolName: string | null;
  schoolType: string | null;
  province: string | null;
  city: string | null;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileCreationAttributes extends Optional<ProfileAttributes, 'id' | 'fullName' | 'email' | 'whatsapp' | 'age' | 'grade' | 'interests' | 'otherInterests' | 'learningStyle' | 'learningPreferences' | 'challenges' | 'studyGoals' | 'schoolName' | 'schoolType' | 'province' | 'city' | 'onboardingCompleted' | 'createdAt' | 'updatedAt'> {}

class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
  declare id: number;
  declare userId: number;
  declare fullName: string | null;
  declare email: string | null;
  declare whatsapp: string | null;
  declare age: number | null;
  declare grade: string | null;
  declare interests: object | null;
  declare otherInterests: string | null;
  declare learningStyle: string | null;
  declare learningPreferences: object | null;
  declare challenges: string | null;
  declare studyGoals: string | null;
  declare schoolName: string | null;
  declare schoolType: string | null;
  declare province: string | null;
  declare city: string | null;
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
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      field: 'user_id',
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'full_name',
    },
    email: {
      type: DataTypes.STRING(320),
      allowNull: true,
    },
    whatsapp: {
      type: DataTypes.STRING(20),
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
      type: DataTypes.JSONB,
      allowNull: true,
    },
    otherInterests: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'other_interests',
    },
    learningStyle: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'learning_style',
    },
    learningPreferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'learning_preferences',
    },
    challenges: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    studyGoals: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'study_goals',
    },
    schoolName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'school_name',
    },
    schoolType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'school_type',
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    onboardingCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'onboarding_completed',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'profiles',
    modelName: 'Profile',
    underscored: true,
  }
);

export default Profile;
