'use strict';
import { log } from '../utils/error.utils';
import { loadExcelFile } from '../utils/main.utils';
import nodeHtmlToImage from 'node-html-to-image';
const fs = require('fs');
/**
 * SAMPLE FUNCTION - CAN BE REMOVED
 * @param req Request
 * @param res Response
 */
export const previewFile = async function (req: any, res) {
    let path = './' + req.file.path.replace('\\', '/');
    let xlData = await loadExcelFile(path);
    const row = xlData[0];

    fs.unlink(path, (err) => {
        if (err) {
            log(
                'error',
                {
                    message: 'Error Eliminando Archivo excel',
                    // file: req.file,
                    err: err
                },
                'error'
            );
            console.error(err);
        }
    });

    let array = Object.entries(row).map(([k]) => k);

    const requiresColumns = ['NOMBRE', 'IDENTIFICACION', 'EMAIL'];

    const containsAll = requiresColumns.every((i) => array.includes(i));

    if (containsAll) {
        log('info', {
            message: 'Archivo Excel Preview Eliminado',
            file: req.file
        });

        res.status(200).json({
            message: 'Cabezeras Leidas',
            data: array
        });
    } else {
        res.status(406).json({
            message:
                'Es necesario que el archivo excel contenga al menos la siguientes columnas: ' +
                requiresColumns.join(', '),
            status: false,
            error: { error: 'Columnas requeridas no válidas' }
        });
    }
};

export const getDataXlsx = async (path) => {
    // let path = './' + req.file.path.replace('\\', '/');

    let xlData = await loadExcelFile(path);

    return xlData;
};

export const buildImagesTemplate = (
    templateName: string,
    html: string
): Promise<boolean | string> => {
    const output = `./src/app/public/assets/images/${templateName}.png`;
    return nodeHtmlToImage({
        output: output,
        html: html,
        puppeteerArgs: {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    })
        .then(() => output)
        .catch((error) => {
            console.error(error);
            return false;
        });
};

export const base64Encode = (file): string => {
    const bitmap = fs.readFileSync(file);
    return Buffer.from(bitmap).toString('base64');
};
