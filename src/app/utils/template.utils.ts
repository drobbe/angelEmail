const nunjucks = require('nunjucks');
const moment = require('moment-timezone');

nunjucks.configure({
    autoescape: true,
    tags: {
        variableStart: '||',
        variableEnd: '||'
    }
});

const convertDateExcel = (excelDate) => {
    const unixTime = (excelDate - 25569) * 86400 * 1000;
    return new Date(unixTime);
};

export const makeHtml = (templateData, templateVariables) => {
    try {
        let objVariables = {};
        let variables = JSON.parse(
            templateData.customVariables.replace(/\|/g, '')
        );

        for (let d in templateVariables) {
            if (/\s+/.test(d)) {
                console.log('Limpiar variable: ', d);
                templateVariables[d.replace(/\s+/g, '_')] =
                    templateVariables[d].toString();
                templateData.htmlTemplate = templateData.htmlTemplate.replace(
                    '||' + d + '||',
                    '||' + d.replace(/\s+/g, '_') + '||'
                );
                delete templateVariables[d];
            }
        }

        for (let v of variables) {
            if (/\s+/.test(v)) {
                v = v.replace(/\s+/g, '_');
            }
            let valor = '';
            // eslint-disable-next-line no-prototype-builtins
            if (templateVariables[v] !== undefined) {
                if (typeof templateVariables[v] === 'string') {
                    valor = templateVariables[v].trim();
                } else if (typeof templateVariables[v] === 'number') {
                    valor = Number(templateVariables[v]).toString().trim();
                }

                if (/^4\d{4}/.test(valor)) {
                    valor = moment(
                        convertDateExcel(valor).toISOString()
                    ).format('DD-MM-YYYY');
                }
            }
            console.log('Variable: ', v, ' --- Valor:', templateVariables[v]);
            objVariables[v] = valor;
        }

        console.log('Variables finales: ', objVariables);
        const salida = nunjucks.renderString(
            templateData.htmlTemplate,
            objVariables
        );

        return salida;
    } catch (error) {
        console.log(error);
        console.log('Error al generar la template: ', error.message);
        return null;
    }
};
