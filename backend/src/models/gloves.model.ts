import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Patient from './patient.model';
import User from './user.model';

export interface IGloves {
  id?: number;
  patientId: number;
  doctorId: number;
  startDate: Date;
  endDate: Date;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  phone?: string;
  company: string;
  address?: string;
  observations?: string;
  cie10Code?: string;
  cie10Description?: string;
  causes?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  evolution?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Gloves extends Model<IGloves> implements IGloves {
  public id!: number;
  public patientId!: number;
  public doctorId!: number;
  public startDate!: Date;
  public endDate!: Date;
  public identification!: string;
  public fullName!: string;
  public position!: string;
  public workArea!: string;
  public phone!: string;
  public company!: string;
  public address!: string;
  public observations!: string;
  public cie10Code!: string;
  public cie10Description!: string;
  public causes!: string;
  public secondaryCode!: string;
  public secondaryDescription!: string;
  public evolution!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Gloves.init(
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
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha de inicio',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha de fin',
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
      comment: 'Puesto de Trabajo - auto-poblado',
    },
    workArea: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Área de Trabajo - auto-poblado',
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: 'Teléfono',
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Marbelize S.A.',
      comment: 'Empresa',
    },
    address: {
      type: DataTypes.STRING(255),
      comment: 'Dirección',
    },
    observations: {
      type: DataTypes.TEXT,
      comment: 'Observaciones adicionales',
    },
    cie10Code: {
      type: DataTypes.STRING(20),
      comment: 'Código CIE-10',
    },
    cie10Description: {
      type: DataTypes.STRING(500),
      comment: 'Descripción del código CIE-10',
    },
    causes: {
      type: DataTypes.STRING(500),
      comment: 'Causas',
    },
    secondaryCode: {
      type: DataTypes.STRING(50),
      comment: 'Código secundario',
    },
    secondaryDescription: {
      type: DataTypes.STRING(500),
      comment: 'Descripción del código secundario',
    },
    evolution: {
      type: DataTypes.TEXT,
      comment: 'Evolución médica',
    },
  },
  {
    sequelize,
    tableName: 'gloves_records',
    timestamps: true,
    indexes: [
      {
        fields: ['patientId'],
      },
      {
        fields: ['doctorId'],
      },
      {
        fields: ['startDate', 'endDate'],
      },
    ],
  }
);

// Relaciones
Gloves.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Gloves.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

export default Gloves;


