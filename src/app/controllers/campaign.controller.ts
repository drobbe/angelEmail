import { Request, Response } from 'express';
import { insertCampaign, insertDataEmail } from '../db/models/campaign.model';

import { log } from '../utils/error.utils';
import { getDataXlsx } from './file.controller';

/**
 * SAMPLE FUNCTION - CAN BE REMOVED
 * @param req Request
 * @param res Response
 */
export const createCampaign = async (req: any, res: Response) => {
    // console.log(req.file);

    const insert = await insertCampaign({
        client: req.body.client,
        name: req.body.name,
        subject: req.body.subject,
        idTemplate: req.body.idTemplate,
        schedule: req.body.schedule
    });

    const path = './' + req.file.path.replace('\\', '/');

    let dataExcel = await getDataXlsx(path);

    dataExcel = dataExcel.map((row) => {
        return {
            idCampaign: insert.id,
            email: row.EMAIL.toString(),
            indentity: row.IDENTIFICACION.toString(),
            fullName: row.NOMBRE.toString(),
            customVariables: JSON.stringify(row)
        };
    });

    await insertDataEmail(dataExcel);

    log('info', {
        msg: insert
    });

    log('info', {
        msg: 'Se ha creado correctamente la campaña ' + req.body.name
    });

    return res.status(201).json({
        message: 'Todo OK',
        status: true,
        data: insert
    });
};

export const zz = (req: Request, res: Response) => {
    console.log(req, res);
};
