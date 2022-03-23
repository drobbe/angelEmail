import prisma from '../connection';

const { cleanJobsByCampaign } = require('./job.model');

export type Campaign = {
    id?: number;
    client?: number;
    name: string;
    subject: string;
    idTemplate: number;
    schedule: boolean;
    emailReponse?: string;
    sender: string;
    finalDate?: string;
};

export const insertCampaign = async (campaign: Campaign) => {
    try {
        const date = new Date(Number(campaign.finalDate));
        const correctDate = new Date(
            Date.parse(date.toUTCString()) - date.getTimezoneOffset() * 60000
        );
        const data = await prisma.campaign.create({
            data: {
                client: Number(campaign.client),
                name: campaign.name,
                subject: campaign.subject,
                idTemplate: Number(campaign.idTemplate),
                schedule: Boolean(Number(campaign.schedule)),
                emailReponse: campaign.emailReponse,
                sender: campaign.sender,
                date: correctDate
            }
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getCampaignsClient = async (idClient: number) => {
    try {
        const data = await prisma.campaign.findMany({
            where: {
                client: idClient,
                NOT: {
                    status: 'ELIMINADO'
                }
            }
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getAvailable = async (idCampaign: number) => {
    try {
        const data = await prisma.dataEmail.aggregate({
            _count: {
                id: true
            },
            where: {
                idCampaign: idCampaign,
                isSent: false
            }
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getCampaignsClientDateFilter = async (
    idClient: number,
    dateFilter: any
) => {
    try {
        const start = new Date(dateFilter.start);
        let endNumber = new Date(dateFilter.end);
        const end = new Date(endNumber.getTime() + 86399999);

        console.log(start, end);

        const data = await prisma.campaign.findMany({
            where: {
                client: idClient,
                NOT: {
                    status: 'ELIMINADO'
                },
                AND: [
                    { createdAt: { gte: start } },
                    { createdAt: { lte: end } }
                ]
            }
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const insertDataEmail = async (dataEmail: any) => {
    try {
        const data = await prisma.dataEmail.createMany({
            data: dataEmail
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getCampaign = async (campaign: any) => {
    try {
        // console.log('GetCampaign: ', campaign);
        const data = await prisma.campaign.findUnique({
            where: {
                // eslint-disable-next-line radix
                id: Number(campaign)
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getCampaignBase = async (campaign, start, end) => {
    try {
        const limit = end ? Number(end) : 10;
        const offset = start ? Number(start) : 0;
        const data = await prisma.dataEmail.findMany({
            where: {
                idCampaign: campaign,
                isSent: false,
                error: false,
                isValid: true
            },
            take: limit,
            skip: offset,
            orderBy: {
                id: 'asc'
            }
        });

        return data;
    } catch (error) {
        console.error(error);
    }
};

export const setBaseStatus = async (record, dataEmail) => {
    try {
        const idRecord = Number(record);
        const datos = await prisma.dataEmail.update({
            where: {
                id: idRecord
            },
            data: {
                isSent: Boolean(dataEmail.isSent),
                sentId: dataEmail.sentId,
                sentDate: dataEmail.sentDate,
                isValid: dataEmail.isValid,
                error: Boolean(dataEmail.error),
                errorMessage: dataEmail.errorMessage,
                serverSent: dataEmail.server
            }
        });

        return datos;
    } catch (error) {
        console.error(error);
    }
};

export const getBaseActive = async (campaign: any) => {
    try {
        const data = await prisma.dataEmail.count({
            where: {
                // eslint-disable-next-line radix
                idCampaign: campaign,
                isSent: false,
                error: false,
                isValid: true
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getCampaignsActive = async () => {
    try {
        const data = await prisma.campaign.findMany({
            where: {
                status: 'PROCESANDO'
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const setStateCampaign = async (idCampaign, state, message) => {
    try {
        const data = await prisma.campaign.update({
            where: {
                id: Number(idCampaign)
            },
            data: {
                status: state,
                statusMessage: message
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getCampaignRecipients = async (datos) => {
    try {
        const data =
            await prisma.$queryRaw`SELECT id, fullName, email, customVariables FROM dataEmail WHERE idCampaign = ${datos.campaign} AND isSent = 0 AND id BETWEEN ${datos.desde} AND ${datos.hasta}`;
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getCountBasePending = async (idCampaign) => {
    try {
        const data = await prisma.dataEmail.count({
            where: {
                // eslint-disable-next-line radix
                idCampaign: Number(idCampaign),
                isSent: false,
                isValid: true
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getRangeEmails = async (data) => {
    try {
        let result =
            await prisma.$queryRaw`SELECT MIN(r.id) AS inicio, MAX(r.id) AS hasta FROM (SELECT id FROM dataEmail WHERE idCampaign = ${data.idCampaign} AND isSent = 0 AND isValid = 1 GROUP BY id LIMIT ${data.inicio}, ${data.limitByServer}) AS r;`;
        if ((<any>result).length) result = result[0];
        return result;
    } catch (error) {
        console.log(error);
    }
};

export const checkCampaignFinalized = async (idCampaign) => {
    try {
        const pendientes = await getCountBasePending(idCampaign);
        // console.log('Comprobando pendientes (%s) result (%s)', idCampaign, pendientes);
        if (pendientes <= 0) {
            // console.log('Finaisando campaña.');
            await setStateCampaign(
                idCampaign,
                'COMPLETADO',
                'COMPLETADO por no tener destinatarios pendientes desde DB.'
            );
            await cleanJobsByCampaign(idCampaign);
        }
    } catch (errors) {
        console.log(errors);
        console.log('campaign.models.checkCampaignFinalized:', errors.message);
    }
};

export const getDataCampaign = async (idCampaign) => {
    try {
        const data = await prisma.dataEmail.findMany({
            where: {
                idCampaign: Number(idCampaign)
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getDelayedCampaings = async () => {
    try {
        let result =
            await prisma.$queryRaw`SELECT id FROM campaign WHERE status = 'CARGADA' AND schedule = 1 AND date > now()`;
        // if ((<any>result).length) result = result;
        return result as any[];
    } catch (error) {
        console.log(error);
    }
};
