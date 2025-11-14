import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Patient from './patient.model';
import User from './user.model';
import CIE10 from './cie10.model';

export interface IMedicalRecord {
  id?: number;
  patientId: number;
  doctorId: number;
  date: Date;
  time: string;
  consultType: string;
  cie10Code?: string;
  cie10Description?: string;
  secondaryCode?: string;
  secondaryDescription?: string;
  causes?: string;
  diagnosis: string;
  prescription?: string;
  daysOfRest?: number;
  observations?: string;
  monthlyCount?: number;
  totalMonthlyCount?: number;
  annualCount?: number;
  certificateGenerated: boolean;
  certificateId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

class MedicalRecord extends Model<IMedicalRecord> implements IMedicalRecord {
  public id!: number;
  public patientId!: number;
  public doctorId!: number;
  public date!: Date;
  public time!: string;
  public consultType!: string;
  public cie10Code!: string;
  public cie10Description!: string;
  public secondaryCode!: string;
  public secondaryDescription!: string;
  public causes!: string;
  public diagnosis!: string;
  public prescription!: string;
  public daysOfRest!: number;
  public observations!: string;
  public monthlyCount!: number;
  public totalMonthlyCount!: number;
  public annualCount!: number;
  public certificateGenerated!: boolean;
  public certificateId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MedicalRecord.init(
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
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha de la consulta',
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
      comment: 'Hora de la consulta',
    },
    consultType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Tipo de consulta',
    },
    cie10Code: {
      type: DataTypes.STRING(10),
      comment: 'Código CIE-10',
    },
    cie10Description: {
      type: DataTypes.TEXT,
      comment: 'Descripción del código CIE-10',
    },
    secondaryCode: {
      type: DataTypes.STRING(10),
      comment: 'Código secundario (COD. SEC)',
    },
    secondaryDescription: {
      type: DataTypes.TEXT,
      comment: 'Descripción del código secundario',
    },
    causes: {
      type: DataTypes.TEXT,
      comment: 'Causas del diagnóstico',
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Diagnóstico médico (Evolución) - máximo 1500 caracteres',
      validate: {
        len: [0, 1500],
      },
    },
    prescription: {
      type: DataTypes.TEXT,
      comment: 'Receta médica - máximo 1500 caracteres',
      validate: {
        len: [0, 1500],
      },
    },
    daysOfRest: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Días de reposo',
    },
    observations: {
      type: DataTypes.TEXT,
      comment: 'Observaciones adicionales',
    },
    monthlyCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Mensual por código - contador de atenciones por código CIE-10 en el mes',
    },
    totalMonthlyCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Mensual total - contador total de atenciones del paciente en el mes',
    },
    annualCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Anual total - contador total de atenciones del paciente en el año',
    },
    certificateGenerated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    certificateId: {
      type: DataTypes.INTEGER,
      comment: 'ID del certificado si fue generado',
    },
  },
  {
    sequelize,
    tableName: 'medical_records',
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
      {
        fields: ['cie10Code'],
      },
    ],
  }
);

// Relaciones
MedicalRecord.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
MedicalRecord.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });

export default MedicalRecord;


