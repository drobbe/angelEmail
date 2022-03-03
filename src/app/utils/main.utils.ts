const XLSX = require('xlsx');
import { log } from '../utils/error.utils';

export const loadExcelFile = async (path) => {
    try {
        let workbook = await XLSX.readFile(path);
        let sheetNameList = workbook.SheetNames;
        let xlData = XLSX.utils.sheet_to_json(
            workbook.Sheets[sheetNameList[0]]
        );
        return xlData;
    } catch (error) {
        log(
            'error',
            {
                message: 'Archivo Excel Preview Eliminado',
                error: error
            },
            'error'
        );
        console.error(error);
        throw error('Error Leyendo Archivo');
    }
};
