import { Request, Response } from 'express';
import CIE10 from '../models/cie10.model';
import logger from '../utils/logger';
import { Op } from 'sequelize';

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

    const codes = await CIE10.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { code: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } },
        ],
      },
      limit: Number(limit),
      order: [['code', 'ASC']],
    });

    res.json({
      success: true,
      data: codes,
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

export const getCIE10ByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const cie10 = await CIE10.findOne({
      where: { code, isActive: true },
    });

    if (!cie10) {
      return res.status(404).json({
        success: false,
        message: 'Código CIE-10 no encontrado',
      });
    }

    res.json({
      success: true,
      data: cie10,
    });
  } catch (error: any) {
    logger.error('Error al obtener CIE-10:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener código CIE-10',
      error: error.message,
    });
  }
};

export const getAllCIE10 = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, category = '' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = { isActive: true };
    if (category) {
      where.category = category;
    }

    const { rows: codes, count: total } = await CIE10.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['code', 'ASC']],
    });

    res.json({
      success: true,
      data: codes,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
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

export const createCIE10 = async (req: Request, res: Response) => {
  try {
    const cie10 = await CIE10.create(req.body);

    logger.info(`Código CIE-10 creado: ${cie10.code}`);

    res.status(201).json({
      success: true,
      message: 'Código CIE-10 creado exitosamente',
      data: cie10,
    });
  } catch (error: any) {
    logger.error('Error al crear CIE-10:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear código CIE-10',
      error: error.message,
    });
  }
};

export const updateCIE10 = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const cie10 = await CIE10.findByPk(id);

    if (!cie10) {
      return res.status(404).json({
        success: false,
        message: 'Código CIE-10 no encontrado',
      });
    }

    await cie10.update(req.body);

    logger.info(`Código CIE-10 actualizado: ${cie10.code}`);

    res.json({
      success: true,
      message: 'Código CIE-10 actualizado exitosamente',
      data: cie10,
    });
  } catch (error: any) {
    logger.error('Error al actualizar CIE-10:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar código CIE-10',
      error: error.message,
    });
  }
};

export const bulkCreateCIE10 = async (req: Request, res: Response) => {
  try {
    const { codes } = req.body;

    if (!Array.isArray(codes) || codes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar un array de códigos',
      });
    }

    const created = await CIE10.bulkCreate(codes, {
      ignoreDuplicates: true,
    });

    logger.info(`Códigos CIE-10 creados en lote: ${created.length}`);

    res.status(201).json({
      success: true,
      message: `${created.length} códigos CIE-10 creados exitosamente`,
      data: { count: created.length },
    });
  } catch (error: any) {
    logger.error('Error al crear códigos CIE-10 en lote:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear códigos CIE-10',
      error: error.message,
    });
  }
};



