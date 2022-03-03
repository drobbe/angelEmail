"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deteleTemplate = exports.getTemplatesDB = exports.editTemplateDB = exports.insertTemplateDB = void 0;
const connection_1 = require("../../../app/db/connection");
const insertTemplateDB = (template) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield connection_1.default.template.create({
            data: {
                client: template.client,
                name: template.name,
                htmlTemplate: template.htmlTemplate,
                htmlJson: template.htmlJson,
                urlPreview: template.urlPreview,
                base64Image: template.base64Image,
                customVariables: template.customVariables
            }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.insertTemplateDB = insertTemplateDB;
const editTemplateDB = (id, template) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idTemplate = Number(id);
        const data = yield connection_1.default.template.update({
            where: {
                id: idTemplate
            },
            data: {
                client: template.client,
                name: template.name,
                htmlTemplate: template.htmlTemplate,
                htmlJson: template.htmlJson,
                urlPreview: template.urlPreview,
                base64Image: template.base64Image,
                customVariables: template.customVariables
            }
        });
        return data;
    }
    catch (error) {
        console.log(error);
    }
});
exports.editTemplateDB = editTemplateDB;
const getTemplatesDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield connection_1.default.template.findMany();
        return data;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
});
exports.getTemplatesDB = getTemplatesDB;
const deteleTemplate = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idTemplate = Number(id);
        const data = yield connection_1.default.template.delete({
            where: { id: idTemplate }
        });
        return data;
    }
    catch (error) {
        console.error(error);
        throw new Error(error);
    }
});
exports.deteleTemplate = deteleTemplate;
//# sourceMappingURL=template.model.js.map