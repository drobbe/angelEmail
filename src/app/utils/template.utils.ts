const nunjucks = require('nunjucks');

nunjucks.configure({
    autoescape: true,
    tags: {
        variableStart: '||',
        variableEnd: '||'
    }
});

export const makeHtml = (templateData, templateVariables) => {
    try {
        let objVariables = {};
        let variables = JSON.parse(
            templateData.customVariables.replace(/\|/g, '')
        );

        for (let d in templateVariables) {
            if (/\s+/.test(d)) {
                // console.log('Limpiar variable: ', d);
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
                valor = templateVariables[v].toString().trim();
            }
            // console.log('Variable: ', v, ' --- Valor:', templateVariables[v]);
            objVariables[v] = valor;
        }

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
