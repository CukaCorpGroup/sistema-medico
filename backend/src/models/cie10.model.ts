import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface ICIE10 {
  id?: number;
  code: string;
  description: string;
  category?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

class CIE10 extends Model<ICIE10> implements ICIE10 {
  public id!: number;
  public code!: string;
  public description!: string;
  public category!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CIE10.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      comment: 'Código CIE-10',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Descripción del diagnóstico',
    },
    category: {
      type: DataTypes.STRING(100),
      comment: 'Categoría del diagnóstico',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'cie10_codes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['code'],
      },
      {
        fields: ['description'],
      },
    ],
  }
);

export default CIE10;


