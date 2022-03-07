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
		let variables = JSON.parse(templateData.customVariables.replace(/\|/g, ''));
		console.log('Datos para plantilla:', datos);
		console.log('Variables: ', variables);
		for (let v of variables) {
			console.log(v, datos[v]);
			// eslint-disable-next-line no-prototype-builtins
			objVariables[v] = datos.hasOwnProperty(v) ? datos[v] : '';
		}
		console.log('Variables llenas: ', objVariables);
		const salida = nunjucks.renderString(templateData.htmlTemplate, objVariables);
		return salida;
	} catch (error) {
		console.log(error);
		console.log('Error al generar la template: ', error.message);
		return 'null';
	}
};
