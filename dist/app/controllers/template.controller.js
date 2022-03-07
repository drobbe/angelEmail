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
exports.getTemplates = exports.editTemplate = exports.duplicateTemplate = exports.deleteTemplate = exports.createTemplate = exports.getVariablesInHtml = void 0;
const template_model_1 = require("../db/models/template.model");
const error_utils_1 = require("../utils/error.utils");
const file_controller_1 = require("./file.controller");
const HTMLDecoderEncoder = require('html-encoder-decoder');
const getVariablesInHtml = (html) => {
    const regex = /\|\|[A-z0-9]*\|\|/g;
    const found = html.match(regex);
    return found;
};
exports.getVariablesInHtml = getVariablesInHtml;
const createTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const htmlDecode = HTMLDecoderEncoder.decode(req.body.html);
    const htmlJson = HTMLDecoderEncoder.decode(JSON.stringify(req.body.htmlJson));
    const isBuildedImageFromTemplate = yield (0, file_controller_1.buildImagesTemplate)(req.body.name, htmlDecode);
    if (!isBuildedImageFromTemplate)
        return res.status(400).json({
            message: 'Error Armando Imagen del preview ' + req.body.name,
            status: false
        });
    (0, error_utils_1.log)('info', {
        msg: 'Se ha construido la imagen del preview ' + req.body.name
    });
    const base64Image = yield (0, file_controller_1.base64Encode)(isBuildedImageFromTemplate);
    const customVariables = JSON.stringify((0, exports.getVariablesInHtml)(htmlDecode));
    const insert = yield (0, template_model_1.insertTemplateDB)({
        client: 1,
        name: req.body.name,
        htmlJson: htmlJson,
        htmlTemplate: htmlDecode,
        urlPreview: isBuildedImageFromTemplate,
        base64Image: base64Image,
        customVariables: customVariables
    });
    return res.status(201).json({
        message: 'Todo OK',
        status: true,
        data: insert
    });
});
exports.createTemplate = createTemplate;
const deleteTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleted = yield (0, template_model_1.deteleTemplate)(req.params.id);
        return res.status(200).json({
            message: 'Todo OK',
            status: true,
            data: deleted
        });
    }
    catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
});
exports.deleteTemplate = deleteTemplate;
const duplicateTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const idTemplate = req.body.id;
        const template = yield (0, template_model_1.getTemplate)(idTemplate);
        const date = new Date();
        const formateDate = date.toLocaleTimeString();
        const newDuplicateTemplate = yield (0, template_model_1.insertTemplateDB)({
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
    }
    catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
});
exports.duplicateTemplate = duplicateTemplate;
const editTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const htmlDecode = HTMLDecoderEncoder.decode(req.body.html);
        const htmlJson = HTMLDecoderEncoder.decode(JSON.stringify(req.body.htmlJson));
        const isBuildedImageFromTemplate = yield (0, file_controller_1.buildImagesTemplate)(req.body.name, htmlDecode);
        if (!isBuildedImageFromTemplate)
            return res.status(400).json({
                message: 'Error Armando Imagen del preview ' + req.body.name,
                status: false
            });
        (0, error_utils_1.log)('info', {
            msg: 'Se ha construido la imagen del preview ' + req.body.name
        });
        const base64Image = yield (0, file_controller_1.base64Encode)(isBuildedImageFromTemplate);
        const customVariables = JSON.stringify((0, exports.getVariablesInHtml)(htmlDecode));
        const update = yield (0, template_model_1.editTemplateDB)(req.params.id, {
            name: req.body.name,
            htmlJson: htmlJson,
            htmlTemplate: htmlDecode,
            urlPreview: isBuildedImageFromTemplate,
            base64Image: base64Image,
            customVariables: customVariables
        });
        return res.status(201).json({
            message: 'Todo OK',
            status: true,
            data: update
        });
    }
    catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
});
exports.editTemplate = editTemplate;
const getTemplates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templates = yield (0, template_model_1.getTemplatesDB)();
        return res.status(200).json({
            message: 'Todo OK',
            status: true,
            data: templates
        });
    }
    catch (error) {
        return res.status(406).json({
            message: 'Error ni idea xq',
            status: false,
            error: error
        });
    }
});
exports.getTemplates = getTemplates;
//# sourceMappingURL=template.controller.js.map