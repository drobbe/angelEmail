import prisma from '../connection';

export const setJobStatus = async (idJob, status) => {
    try {
        const data = await prisma.jobs.update({
            where: {
                id: Number(idJob)
            },
            data: {
                status: Number(status)
            }
        });
        // console.log('SetJobStatus: ', data);
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const setJobStart = async (idJob, idCampaign, idServer) => {
    try {
        await prisma.$queryRaw`UPDATE Jobs SET status = 5 WHERE idCampaign = ${idCampaign} AND idServer = ${idServer} AND status != 1 AND status != 2`;
        await prisma.$queryRaw`UPDATE Jobs SET status = 1 WHERE id = ${idJob}`;
        await prisma.$queryRaw`UPDATE Jobs SET status = 0 WHERE idCampaign = ${idCampaign} AND idServer = ${idServer} AND status = 5`;
    } catch (error) {
        console.log(error);
    }
};

export const getOneJobByServer = async (idServer) => {
    try {
        let job = null;
        let data =
            await prisma.$queryRaw`SELECT * FROM Jobs WHERE idServer = ${idServer} AND status = 0 ORDER BY RAND() LIMIT 1`;
        // console.log(data);
        if ((<any>data).length) {
            job = data[0];
        } else {
            data =
                await prisma.$queryRaw`SELECT * FROM Jobs WHERE idServer = ${idServer} AND status = 1 ORDER BY RAND() LIMIT 1`;
            // console.log('2', data);
            if ((<any>data).length) {
                job = data[0];
            }
        }
        return job;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const createJobs = async (datos) => {
    try {
        let valores = [];
        // eslint-disable-next-line guard-for-in
        for (let o in datos) {
            console.log(datos[0]);
            valores.push({
                idCampaign: datos[o][0],
                idServer: datos[o][1],
                status: datos[o][2],
                start: datos[o][3],
                end: datos[o][4]
            });
        }

        const data = await prisma.jobs.createMany({
            data: valores
        });
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const cleanJobsByCampaign = async (idCampaign) => {
    try {
        const data = await prisma.jobs.deleteMany({
            where: {
                idCampaign: Number(idCampaign)
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getJobsByCampaing = async (idCampaign) => {
    try {
        const data = await prisma.jobs.count({
            where: {
                idCampaign: Number(idCampaign),
                status: { in: [0, 1] }
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const cleanJobsCompletedByCampaign = async (idCampaign) => {
    try {
        const data = await prisma.jobs.deleteMany({
            where: {
                idCampaign: Number(idCampaign),
                status: 2
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getJobsList = async () => {
    try {
        const data = await prisma.jobs.count({
            where: {
                status: { in: [0, 1, 2] }
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};

export const cleanAllJobs = async () => {
    try {
        const data = await prisma.jobs.deleteMany({
            where: {
                status: { in: [0, 1, 2] }
            }
        });
        return data;
    } catch (error) {
        console.log(error);
    }
};
