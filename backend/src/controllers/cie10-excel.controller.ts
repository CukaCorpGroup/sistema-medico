import { Request, Response } from 'express';
import excelDB from '../utils/excel-database';
import logger from '../utils/logger';

export const searchCIE10 = async (req: Request, res: Response) => {
  try {
    const { query = '', limit = 20 } = req.query;

    if (!query || (query as string).length < 2) {
      return res.json({
        success: true,
        data: [],
        message: 'Ingrese al menos 2 caracteres para buscar',
      });
    }

    logger.info(`Buscando CIE-10: ${query}`);

    const codes = await excelDB.searchCIE10(query as string);
    const limitedCodes = codes.slice(0, Number(limit));

    res.json({
      success: true,
      data: limitedCodes,
    });
  } catch (error: any) {
    logger.error('Error al buscar CIE-10:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar códigos CIE-10',
      error: error.message,
    });
  }
};

export const getAllCIE10 = async (req: Request, res: Response) => {
  try {
    const codes = await excelDB.getCIE10Codes();
    // Filtrar solo códigos activos
    const activeCodes = codes.filter(c => c.isActive);
    
    res.json({
      success: true,
      data: activeCodes,
      pagination: {
        total: activeCodes.length,
        page: 1,
        limit: activeCodes.length,
        totalPages: 1,
      },
    });
  } catch (error: any) {
    logger.error('Error al obtener CIE-10:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener códigos CIE-10',
      error: error.message,
    });
  }
};



