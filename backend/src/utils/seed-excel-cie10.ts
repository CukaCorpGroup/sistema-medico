import excelDB from './excel-database';
import logger from './logger';

// Códigos CIE-10 para incidentes y accidentes
const newCIE10Codes = [
  { code: 'S20', description: 'Traumatismo superficial del tórax - INCIDENTE LABORAL', category: 'INCIDENTE', isActive: true },
  { code: 'S40', description: 'Traumatismo superficial del hombro y del brazo - INCIDENTE LABORAL', category: 'INCIDENTE', isActive: true },
  { code: 'S72', description: 'Fractura del fémur - ACCIDENTE LABORAL', category: 'ACCIDENTE', isActive: true },
  { code: 'S82', description: 'Fractura de la pierna, incluido el tobillo - ACCIDENTE LABORAL', category: 'ACCIDENTE', isActive: true },
];

export const seedExcelCIE10 = async () => {
  try {
    logger.info('Iniciando semilla de códigos CIE-10 para Excel...');

    // Obtener códigos existentes
    const existingCodes = await excelDB.getCIE10Codes();
    logger.info(`Códigos CIE-10 existentes: ${existingCodes.length}`);

    // Crear nuevos códigos si no existen
    let created = 0;
    let skipped = 0;

    for (const codeData of newCIE10Codes) {
      const exists = existingCodes.find(c => c.code === codeData.code);
      if (!exists) {
        await excelDB.createCIE10(codeData);
        logger.info(`✓ Código CIE-10 creado: ${codeData.code} - ${codeData.description}`);
        created++;
      } else {
        logger.info(`⊘ Código CIE-10 ya existe: ${codeData.code}`);
        skipped++;
      }
    }

    logger.info(`\n✓ Semilla completada:`);
    logger.info(`  - Códigos creados: ${created}`);
    logger.info(`  - Códigos existentes: ${skipped}`);
    logger.info(`  - Total procesados: ${newCIE10Codes.length}`);

    process.exit(0);
  } catch (error) {
    logger.error('Error al sembrar códigos CIE-10:', error);
    process.exit(1);
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  seedExcelCIE10();
}

export default seedExcelCIE10;



