import prisma from '../connection';

export const releaseAllServerForce = async () => {
    try {
        const data = await prisma.servers.updateMany({
            where: {
                active: true
            },
            data: {
                busy: false
            }
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getServersActive = async () => {
    try {
        const data = await prisma.servers.findMany({
            where: {
                active: true
            }
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const releaseAllServers = async () => {
    try {
        let data =
            await prisma.$queryRaw`UPDATE Servers SET busy = 0 WHERE id IN (SELECT idServer FROM Jobs WHERE status != 1)`;

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const getServer = async (idServer) => {
    try {
        const data = await prisma.servers.findUnique({
            where: {
                id: Number(idServer)
            }
        });

        // if ((<any>data).length) return data[0];

        return data;
    } catch (error) {
        console.log(error);
    }
};

export const setServerBusy = async (idServer, busy) => {
    try {
        const data = await prisma.servers.update({
            where: {
                id: Number(idServer)
            },
            data: {
                busy: Boolean(busy)
            }
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};
