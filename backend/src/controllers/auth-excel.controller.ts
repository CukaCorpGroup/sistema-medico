import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import excelDB from '../utils/excel-database';
import logger from '../utils/logger';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    logger.info(`Intento de login: ${username}`);

    // Buscar usuario en Excel
    const user = await excelDB.findUserByUsername(username);

    if (!user) {
      logger.warn(`Usuario no encontrado: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectas, por favor inténtelo de nuevo',
      });
    }

    // Verificar si está activo
    if (!user.isActive) {
      logger.warn(`Usuario inactivo: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo, contacte al administrador',
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`Contraseña incorrecta para usuario: ${username}`);
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectas, por favor inténtelo de nuevo',
      });
    }

    // Generar token JWT
    const secret = process.env.JWT_SECRET || 'sistema-medico-secret-key';

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      secret,
      { expiresIn: '24h' }
    );

    logger.info(`Login exitoso: ${username}`);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        },
      },
    });
  } catch (error: any) {
    logger.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar login',
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const username = (req as any).user?.username;

    const user = await excelDB.findUserByUsername(username);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    logger.error('Error al obtener usuario actual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener información del usuario',
      error: error.message,
    });
  }
};





