import { Request, Response } from 'express';
import {
    deleteTemplateDB,
    disableTemplateDB,
    editTemplateDB,
    enableTemplateDB,
    getTemplate,
    getTemplatesDB,
    getTemplatesEnabledDB,
    insertTemplateDB
} from '../db/models/template.model';
import { log } from '../utils/error.utils';
import { base64Encode, buildImagesTemplate } from './file.controller';
const HTMLDecoderEncoder = require('html-encoder-decoder');

export const getVariablesInHtml = (html: string): string[] => {
    const regex = /\|\|[A-z0-9]*\|\|/g;

    const found = html.match(regex);
    return found;
};

/**
 * SAMPLE FUNCTION - CAN BE REMOVED
 * @param req Request
 * @param res Response
 */
export const createTemplate = async (req: Request, res: Response) => {
    const htmlDecode = HTMLDecoderEncoder.decode(req.body.html);
    const htmlJson = HTMLDecoderEncoder.decode(
        JSON.stringify(req.body.htmlJson)
    );

    const isBuildedImageFromTemplate = await buildImagesTemplate(
        req.body.name,
        htmlDecode
    );

    if (!isBuildedImageFromTemplate)
        return res.status(400).json({
            message: 'Error Armando Imagen del preview ' + req.body.name,
            status: false
        });

    log('info', {
        msg: 'Se ha construido la imagen del preview ' + req.body.name
    });

    const base64Image = await base64Encode(
        isBuildedImageFromTemplate as string
    );

    const customVariables = JSON.stringify(getVariablesInHtml(htmlDecode));

    const insert = await insertTemplateDB({
        client: 1,
        name: req.body.name,
        htmlJson: htmlJson,
        htmlTemplate: htmlDecode,
        urlPreview: isBuildedImageFromTemplate as string,
        base64Image: base64Image,
        customVariables: customVariables
    });

    return res.status(201).json({
        message: 'Todo OK',
        status: true,
        data: insert
    });
};

export const deleteTemplate = async (req: Request, res: Response) => {
    try {
        const deleted = await deleteTemplateDB(req.params.id);
        return res.status(200).json({
            message: 'Todo OK',
            status: true,
            data: deleted
        });
    } catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
};

export const enableTemplate = async (req: Request, res: Response) => {
    try {
        const deleted = await enableTemplateDB(req.params.id);
        return res.status(200).json({
            message: 'Todo OK',
            status: true,
            data: deleted
        });
    } catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
};

export const disableTemplate = async (req: Request, res: Response) => {
    try {
        const deleted = await disableTemplateDB(req.params.id);
        return res.status(200).json({
            message: 'Todo OK',
            status: true,
            data: deleted
        });
    } catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
};

export const duplicateTemplate = async (req: Request, res: Response) => {
    try {
        const idTemplate = req.body.id;
        const template = await getTemplate(idTemplate);
        const date = new Date();
        const formateDate = date.toLocaleTimeString();
        const newDuplicateTemplate = await insertTemplateDB({
            client: template.client,
            name: `${template.name}-Copia-${formateDate}`,
            htmlJson: template.htmlJson,
            htmlTemplate: template.htmlTemplate,
            urlPreview: template.urlPreview,
            base64Image: template.base64Image,
            customVariables: template.customVariables
        });

        return res.status(200).json({
            message: 'Todo OK',
            status: true,
            data: newDuplicateTemplate
        });
    } catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
};

export const editTemplate = async (req: Request, res: Response) => {
    try {
        const htmlDecode = HTMLDecoderEncoder.decode(req.body.html);
        const htmlJson = HTMLDecoderEncoder.decode(
            JSON.stringify(req.body.htmlJson)
        );

        const isBuildedImageFromTemplate = await buildImagesTemplate(
            req.body.name,
            htmlDecode
        );

        if (!isBuildedImageFromTemplate)
            return res.status(400).json({
                message: 'Error Armando Imagen del preview ' + req.body.name,
                status: false
            });

        log('info', {
            msg: 'Se ha construido la imagen del preview ' + req.body.name
        });

        const base64Image = await base64Encode(
            isBuildedImageFromTemplate as string
        );

        const customVariables = JSON.stringify(getVariablesInHtml(htmlDecode));

        const update = await editTemplateDB(req.params.id, {
            name: req.body.name,
            htmlJson: htmlJson,
            htmlTemplate: htmlDecode,
            urlPreview: isBuildedImageFromTemplate as string,
            base64Image: base64Image,
            customVariables: customVariables
        });

        return res.status(201).json({
            message: 'Todo OK',
            status: true,
            data: update
        });
    } catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
};

export const getTemplates = async (req: Request, res: Response) => {
    try {
        const templates = await getTemplatesDB();

        return res.status(200).json({
            message: 'Todo OK',
            status: true,
            data: templates
        });
    } catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
};

export const getTemplatesEnabled = async (req: Request, res: Response) => {
    try {
        const templates = await getTemplatesEnabledDB();

        return res.status(200).json({
            message: 'Todo OK',
            status: true,
            data: templates
        });
    } catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
};
