const nunjucks = require('nunjucks');

nunjucks.configure({
    autoescape: true,
    tags: {
        variableStart: '||',
        variableEnd: '||'
    }
});

export const makeHtml = function (templateData, datos) {
    try {
        let objVariables = {};
        console.log(
            'Variables en la plantilla: ',
            JSON.parse(templateData.customVariables)
        );
        let variables = JSON.parse(
            templateData.customVariables.replace(/\|/g, '')
        );
        // console.log('Datos para plantilla:', datos);
        let datos2 = datos;

        for (let d in datos2) {
            if (/\s+/.test(d)) {
                console.log('Limpiar variable: ', d);
                datos2[d.replace(/\s+/g, '_')] = datos2[d].toString();
                templateData.htmlTemplate = templateData.htmlTemplate.replace(
                    '||' + d + '||',
                    '||' + d.replace(/\s+/g, '_') + '||'
                );
                delete datos2[d];
            }
        }
        console.log('Matriz de datos:', datos2);

        console.log('Variables en la base: ', variables);
        for (let v of variables) {
            if (/\s+/.test(v)) {
                v = v.replace(/\s+/g, '_');
            }
            let valor = '';
            // eslint-disable-next-line no-prototype-builtins
            if (datos.hasOwnProperty(v)) {
                valor = datos2[v].toString().trim();
            }
            // console.log('Variable: ', v, ' --- Valor:', datos2[v]);
            objVariables[v] = valor;
        }
        console.log('Variables llenas: ', objVariables);
        // console.log('HTML Crudo: ', templateData.htmlTemplate);
        const salida = nunjucks.renderString(
            templateData.htmlTemplate,
            objVariables
        );
        // console.log('Salida: ', salida);
        return salida;
    } catch (error) {
        console.log(error);
        console.log('Error al generar la template: ', error.message);
        return 'null';
    }
};
