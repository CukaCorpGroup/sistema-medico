import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import Patient from './patient.model';
import User from './user.model';
import MedicalRecord from './medical-record.model';

export interface ICertificate {
  id?: number;
  medicalRecordId: number;
  patientId: number;
  doctorId: number;
  fullName: string;
  position: string;
  workArea: string;
  phone?: string;
  company: string;
  address?: string;
  cie10Code?: string;
  cie10Description?: string;
  startDate: Date;
  endDate: Date;
  validDays?: number;
  issuingInstitution: string;
  issuingDoctor: string;
  specialty?: string;
  service?: string;
  document?: string;
  doctor?: string;
  observations?: string;
  pdfGenerated: boolean;
  pdfPath?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Certificate extends Model<ICertificate> implements ICertificate {
  public id!: number;
  public medicalRecordId!: number;
  public patientId!: number;
  public doctorId!: number;
  public fullName!: string;
  public position!: string;
  public workArea!: string;
  public phone!: string;
  public company!: string;
  public address!: string;
  public cie10Code!: string;
  public cie10Description!: string;
  public startDate!: Date;
  public endDate!: Date;
  public validDays!: number;
  public issuingInstitution!: string;
  public issuingDoctor!: string;
  public specialty!: string;
  public service!: string;
  public document!: string;
  public doctor!: string;
  public observations!: string;
  public pdfGenerated!: boolean;
  public pdfPath!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Certificate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    medicalRecordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'medical_records',
        key: 'id',
      },
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
    fullName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Nombres y apellidos - desde atención médica',
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Puesto de trabajo - desde atención médica',
    },
    workArea: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Área de trabajo - desde atención médica',
    },
    phone: {
      type: DataTypes.STRING(20),
      comment: 'Teléfono',
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Empresa',
    },
    address: {
      type: DataTypes.STRING(255),
      comment: 'Dirección',
    },
    cie10Code: {
      type: DataTypes.STRING(10),
      comment: 'CIE-10 - desde atención médica',
    },
    cie10Description: {
      type: DataTypes.TEXT,
      comment: 'Descripción CIE-10 - desde atención médica',
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha Desde',
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Fecha Hasta',
    },
    validDays: {
      type: DataTypes.INTEGER,
      comment: 'Días válidos del certificado (calculado)',
    },
    issuingInstitution: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Institución que emite - seleccionable de lista',
    },
    issuingDoctor: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Médico que emite - editable',
    },
    specialty: {
      type: DataTypes.STRING(100),
      comment: 'Especialidad B - lista desplegable',
    },
    service: {
      type: DataTypes.STRING(100),
      comment: 'Servicio C - lista desplegable',
    },
    document: {
      type: DataTypes.STRING(100),
      comment: 'Documento - lista desplegable',
    },
    doctor: {
      type: DataTypes.STRING(100),
      comment: 'Médico D - lista desplegable',
    },
    observations: {
      type: DataTypes.STRING(250),
      comment: 'Observaciones - editable hasta 250 caracteres',
      validate: {
        len: [0, 250],
      },
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
    tableName: 'certificates',
    timestamps: true,
    indexes: [
      {
        fields: ['medicalRecordId'],
      },
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
Certificate.belongsTo(MedicalRecord, { foreignKey: 'medicalRecordId', as: 'medicalRecord' });
Certificate.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Certificate.belongsTo(User, { foreignKey: 'doctorId', as: 'doctorUser' });

export default Certificate;


