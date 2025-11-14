import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Patient from './patient.model';
import User from './user.model';

export interface IIncident {
  id?: number;
  patientId: number;
  doctorId: number;
  date: Date;
  identification: string;
  fullName: string;
  position: string;
  workArea: string;
  company: string;
  address?: string;
  phone?: string;
  cie10Code?: string;
  cie10Description?: string;
  causes?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  diagnosis: string;
  prescription?: string;
  daysOfRest?: number;
  observations?: string;
  pdfGenerated: boolean;
  pdfPath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Incident extends Model<IIncident> implements IIncident {
  public id!: number;
  public patientId!: number;
  public doctorId!: number;
  public date!: Date;
  public identification!: string;
  public fullName!: string;
  public position!: string;
  public workArea!: string;
  public company!: string;
  public address!: string;
  public phone!: string;
  public cie10Code!: string;
  public cie10Description!: string;
  public causes!: string;
  public secondaryCode!: string;
  public secondaryDescription!: string;
  public diagnosis!: string;
  public prescription!: string;
  public daysOfRest!: number;
  public observations!: string;
  public pdfGenerated!: boolean;
  public pdfPath!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Incident.init(
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
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha del incidente',
    },
    identification: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Cédula - auto-poblado desde atención médica',
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
    company: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Empresa - auto-poblado',
    },
    address: {
      type: DataTypes.STRING(255),
      comment: 'Dirección - auto-poblado',
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: 'Teléfono - auto-poblado',
    },
    cie10Code: {
      type: DataTypes.STRING(10),
      comment: 'CIE-10 - auto-poblado',
    },
    cie10Description: {
      type: DataTypes.TEXT,
      comment: 'Descripción CIE-10 - auto-poblado',
    },
    causes: {
      type: DataTypes.TEXT,
      comment: 'Causas - auto-poblado',
    },
    secondaryCode: {
      type: DataTypes.STRING(10),
      comment: 'Cod. Secundario',
    },
    secondaryDescription: {
      type: DataTypes.TEXT,
      comment: 'Descripción secundaria',
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Evolución/Diagnóstico - máximo 1500 caracteres',
      validate: {
        len: [0, 1500],
      },
    },
    prescription: {
      type: DataTypes.TEXT,
      comment: 'Receta - máximo 1500 caracteres',
      validate: {
        len: [0, 1500],
      },
    },
    daysOfRest: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Días de reposo - máximo 2 caracteres',
      validate: {
        min: 0,
        max: 99,
      },
    },
    observations: {
      type: DataTypes.TEXT,
      comment: 'Observaciones adicionales',
    },
    pdfGenerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    pdfPath: {
      type: DataTypes.STRING(500),
      comment: 'Ruta del PDF generado',
    },
  },
  {
    sequelize,
    tableName: 'incidents',
    timestamps: true,
    indexes: [
      {
        fields: ['patientId'],
      },
      {
        fields: ['doctorId'],
      },
      {
        fields: ['date'],
      },
    ],
  }
);

// Relaciones
Incident.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Incident.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

export default Incident;


