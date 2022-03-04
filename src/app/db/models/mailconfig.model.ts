import prisma from '../connection';

export const getServer = async (server) => {
    try {
        const data = await prisma.servers.findUnique({
            where: {
                id: Number(server)
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
                active: 1
            }
        });

        return data;
    } catch (error) {
        console.log(error);
    }
};
