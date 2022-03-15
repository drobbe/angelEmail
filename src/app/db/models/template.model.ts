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
        const data = await prisma.template.findMany({
            where: {
                deleted: false
            },
            orderBy: {
                id: 'desc'
            }
        });
        return data;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const getTemplatesEnabledDB = async () => {
    try {
        const data = await prisma.template.findMany({
            where: {
                deleted: false,
                enable: true
            },
            orderBy: {
                id: 'desc'
            }
        });
        return data;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const deleteTemplateDB = async (id) => {
    try {
        const idTemplate = Number(id);
        const data = await prisma.template.update({
            where: { id: idTemplate },
            data: {
                deleted: true
            }
        });
        return data;

        // ---VIEJO DELETE --
        // return data;
        // const idTemplate = Number(id);
        // const data = await prisma.template.delete({
        //     where: { id: idTemplate }
        // });
        // return data;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const enableTemplateDB = async (id) => {
    try {
        const idTemplate = Number(id);
        const data = await prisma.template.update({
            where: { id: idTemplate },
            data: {
                enable: true
            }
        });
        return data;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const disableTemplateDB = async (id) => {
    try {
        const idTemplate = Number(id);
        const data = await prisma.template.update({
            where: { id: idTemplate },
            data: {
                enable: false
            }
        });
        return data;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};

export const getTemplate = async (id) => {
    try {
        const data = await prisma.template.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                htmlTemplate: true,
                htmlJson: true,
                customVariables: true,
                urlPreview: true,
                base64Image: true,
                client: true,
                enable: true
            }
        });
        return data;
    } catch (error) {
        console.error(error);
        throw new Error(error);
    }
};
