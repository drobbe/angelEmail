"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeHtml = void 0;
const nunjucks = require('nunjucks');
nunjucks.configure({
    autoescape: true,
    tags: {
        variableStart: '||',
        variableEnd: '||'
    }
});
const makeHtml = function (templateData, datos) {
    let objVariables = {};
    let variables = JSON.parse(templateData.customVariables.replace(/\|/g, ''));
    for (let v of variables) {
        objVariables[v] = datos.hasOwnProperty(v) ? datos[v] : '';
    }
    return nunjucks.renderString(templateData.htmlTemplate, objVariables);
};
exports.makeHtml = makeHtml;
//# sourceMappingURL=template.utils.js.map