// Exportar todos los modelos y configurar relaciones
import sequelize from '../config/database';
import User from './user.model';
import Patient from './patient.model';
import CIE10 from './cie10.model';
import MedicalRecord from './medical-record.model';
import Incident from './incident.model';
import Antidoping from './antidoping.model';
import Gloves from './gloves.model';
import Diet from './diet.model';
import Certificate from './certificate.model';

// Configurar todas las relaciones entre modelos
const initModels = () => {
  // Patient relationships
  Patient.hasMany(MedicalRecord, { foreignKey: 'patientId', as: 'medicalRecords' });
  Patient.hasMany(Incident, { foreignKey: 'patientId', as: 'incidents' });
  Patient.hasMany(Antidoping, { foreignKey: 'patientId', as: 'antidopingRecords' });
  Patient.hasMany(Gloves, { foreignKey: 'patientId', as: 'glovesRecords' });
  Patient.hasMany(Diet, { foreignKey: 'patientId', as: 'dietRecords' });
  Patient.hasMany(Certificate, { foreignKey: 'patientId', as: 'certificates' });

  // User (Doctor) relationships
  User.hasMany(MedicalRecord, { foreignKey: 'doctorId', as: 'medicalRecords' });
  User.hasMany(Incident, { foreignKey: 'doctorId', as: 'incidents' });
  User.hasMany(Gloves, { foreignKey: 'doctorId', as: 'glovesRecords' });
  User.hasMany(Diet, { foreignKey: 'doctorId', as: 'dietRecords' });
  User.hasMany(Certificate, { foreignKey: 'doctorId', as: 'certificates' });

  // MedicalRecord relationships
  MedicalRecord.hasOne(Certificate, { foreignKey: 'medicalRecordId', as: 'certificate' });
};

// Inicializar modelos
initModels();

// Exportar modelos
export {
  sequelize,
  User,
  Patient,
  CIE10,
  MedicalRecord,
  Incident,
  Antidoping,
  Gloves,
  Diet,
  Certificate,
};

export default {
  sequelize,
  User,
  Patient,
  CIE10,
  MedicalRecord,
  Incident,
  Antidoping,
  Gloves,
  Diet,
  Certificate,
};


