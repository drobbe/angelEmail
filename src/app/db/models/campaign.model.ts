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
                    role: 'ELIMINADO'
                }
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
