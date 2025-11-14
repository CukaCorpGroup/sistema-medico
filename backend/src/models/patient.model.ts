import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface IPatient {
  id?: number;
  identification: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  position: string;
  workArea: string;
  gender: string;
  phone?: string;
  company: string;
  address?: string;
  email?: string;
  birthDate?: Date;
  bloodType?: string;
  allergies?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Patient extends Model<IPatient> implements IPatient {
  public id!: number;
  public identification!: string;
  public firstName!: string;
  public lastName!: string;
  public fullName!: string;
  public position!: string;
  public workArea!: string;
  public gender!: string;
  public phone!: string;
  public company!: string;
  public address!: string;
  public email!: string;
  public birthDate!: Date;
  public bloodType!: string;
  public allergies!: string;
  public emergencyContact!: string;
  public emergencyPhone!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    identification: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: 'Cédula o identificación del paciente',
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombres del paciente',
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Apellidos del paciente',
    },
    fullName: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Puesto de trabajo',
    },
    workArea: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Área de trabajo',
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(20),
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Marbelize S.A.',
    },
    address: {
      type: DataTypes.STRING(255),
    },
    email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true,
      },
    },
    birthDate: {
      type: DataTypes.DATEONLY,
    },
    bloodType: {
      type: DataTypes.STRING(10),
    },
    allergies: {
      type: DataTypes.TEXT,
      comment: 'Alergias conocidas',
    },
    emergencyContact: {
      type: DataTypes.STRING(100),
    },
    emergencyPhone: {
      type: DataTypes.STRING(20),
    },
  },
  {
    sequelize,
    tableName: 'patients',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['identification'],
      },
    ],
  }
);

export default Patient;


