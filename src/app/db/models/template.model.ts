import prisma from '../../../app/db/connection';

export type Template = {
    id?: number;
    client?: number;
    name: string;
    htmlTemplate: string;
    htmlJson: string;
    urlPreview: string;
    base64Image: string;
    customVariables?: string;
};

export const insertTemplateDB = async (template: Template) => {
    try {
        const data = await prisma.template.create({
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
    } catch (error) {
        console.log(error);
    }
};

export const editTemplateDB = async (id, template: Template) => {
    try {
        const idTemplate = Number(id);
        const data = await prisma.template.update({
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
    } catch (error) {
        console.log(error);
    }
};

export const getTemplatesDB = async () => {
    try {
        const data = await prisma.template.findMany();
        return data;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const deteleTemplate = async (id) => {
    try {
        const idTemplate = Number(id);
        const data = await prisma.template.delete({
            where: { id: idTemplate }
        });
        return data;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
