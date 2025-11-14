import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Patient from './patient.model';

export interface IAntidoping {
  id?: number;
  patientId: number;
  date: Date;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  verification?: string;
  observations?: string;
  evaluation?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Antidoping extends Model<IAntidoping> implements IAntidoping {
  public id!: number;
  public patientId!: number;
  public date!: Date;
  public identification!: string;
  public fullName!: string;
  public position!: string;
  public workArea!: string;
  public verification!: string;
  public observations!: string;
  public evaluation!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Antidoping.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'patients',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha del registro',
    },
    identification: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Cédula - auto-poblado desde Squarenet',
    },
    fullName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombres y apellidos - auto-poblado',
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Puesto de trabajo - auto-poblado',
    },
    workArea: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Área de trabajo - auto-poblado',
    },
    verification: {
      type: DataTypes.STRING(200),
      comment: 'Verificación - campo editable hasta 200 caracteres',
      validate: {
        len: [0, 200],
      },
    },
    observations: {
      type: DataTypes.STRING(200),
      comment: 'Observaciones - campo editable hasta 200 caracteres',
      validate: {
        len: [0, 200],
      },
    },
    evaluation: {
      type: DataTypes.STRING(200),
      comment: 'Evolución - campo editable hasta 200 caracteres',
      validate: {
        len: [0, 200],
      },
    },
  },
  {
    sequelize,
    tableName: 'antidoping_records',
    timestamps: true,
    indexes: [
      {
        fields: ['patientId'],
      },
      {
        fields: ['date'],
      },
      {
        fields: ['identification'],
      },
    ],
  }
);

// Relaciones
Antidoping.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

export default Antidoping;


