import prisma from '../connection';

export type Campaign = {
    id?: number;
    client?: number;
    name: string;
    subject: string;
    idTemplate: number;
    schedule: boolean;
};

export const insertCampaign = async (campaign: Campaign) => {
    try {
        const data = await prisma.campaign.create({
            data: {
                client: Number(campaign.client),
                name: campaign.name,
                subject: campaign.subject,
                idTemplate: Number(campaign.idTemplate),
                schedule: Boolean(Number(campaign.schedule))
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

export const getCampaignsClientDateFilter = async (
    idClient: number,
    dateFilter: any
) => {
    try {
        const data = await prisma.campaign.findMany({
            where: {
                client: idClient,
                NOT: {
                    status: 'ELIMINADO'
                },
                AND: [
                    { createdAt: { lte: new Date(dateFilter.end) } },
                    { createdAt: { gte: new Date(dateFilter.start) } }
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
        const data = await prisma.campaign.findUnique({
            where: {
                // eslint-disable-next-line radix
                id: campaign
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
                isSent: 0,
                error: 0
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
                isSent: Number(dataEmail.isSent),
                sentId: dataEmail.sentId,
                error: Number(dataEmail.error),
                errorMessage: dataEmail.errorMessage
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
                isSent: 0,
                error: 0
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};
