const ExcelJS = require('exceljs');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'usuarios.xlsx');

async function reiniciarUsuarios() {
  console.log('🔄 Reiniciando archivo de usuarios...');
  
  // Eliminar archivo anterior si existe
  if (fs.existsSync(USERS_FILE)) {
    fs.unlinkSync(USERS_FILE);
    console.log('✓ Archivo anterior eliminado');
  }

  // Crear nuevo workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Datos');

  // Configurar columnas
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Usuario', key: 'username', width: 20 },
    { header: 'Contraseña', key: 'password', width: 60 },
    { header: 'Nombre Completo', key: 'fullName', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Rol', key: 'role', width: 15 },
    { header: 'Activo', key: 'isActive', width: 10 },
    { header: 'Cambiar Contraseña', key: 'mustChangePassword', width: 20 },
  ];

  // Hashear contraseñas
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const doctorPasswordHash = await bcrypt.hash('doctor123', 10);

  // Agregar usuarios
  worksheet.addRow({
    id: 1,
    username: 'admin',
    password: adminPasswordHash,
    fullName: 'Dr. Administrador Sistema',
    email: 'admin@marbelize.com',
    role: 'admin',
    isActive: true,
    mustChangePassword: false,
  });

  worksheet.addRow({
    id: 2,
    username: 'doctor1',
    password: doctorPasswordHash,
    fullName: 'Dr. Juan Pérez Médico',
    email: 'doctor1@marbelize.com',
    role: 'doctor',
    isActive: true,
    mustChangePassword: true,
  });

  worksheet.addRow({
    id: 3,
    username: 'lector1',
    password: await bcrypt.hash('lector123', 10),
    fullName: 'Usuario Lector',
    email: 'lector@marbelize.com',
    role: 'reader',
    isActive: true,
    mustChangePassword: false,
  });

  // Guardar archivo
  await workbook.xlsx.writeFile(USERS_FILE);

  console.log('✅ Archivo de usuarios creado exitosamente');
  console.log('');
  console.log('📋 USUARIOS CREADOS:');
  console.log('');
  console.log('1. ADMINISTRADOR:');
  console.log('   Usuario: admin');
  console.log('   Contraseña: admin123');
  console.log('');
  console.log('2. DOCTOR:');
  console.log('   Usuario: doctor1');
  console.log('   Contraseña: doctor123');
  console.log('');
  console.log('3. LECTOR:');
  console.log('   Usuario: lector1');
  console.log('   Contraseña: lector123');
  console.log('');
  console.log('🚀 Ya puedes iniciar sesión en http://localhost:4200');
}

reiniciarUsuarios().catch(console.error);

