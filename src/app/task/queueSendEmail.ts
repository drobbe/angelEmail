import { playCampaignWithoutRquest } from '../controllers/campaign.controller';
import { getDelayedCampaings } from '../db/models/campaign.model';

const schedule = require('node-schedule');
/**
 * SAMPLE FUNCTION - CAN BE REMOVED
 * @param req Request
 * @param res Response
 */
export default function () {
    console.log('Cargando Tareas de play programado');
    schedule.scheduleJob('*/2 * * * *', async () => {
        console.log(
            '- - - - - - - - | Iniciando Tarea de play programado | - - - - - - - - '
        );
        const idCampaigns = await getDelayedCampaings();
        if ((idCampaigns.length = 0)) {
            console.log(
                ' - - - - - - - - | No hay campañas programadas disponibles para enviar | - - - - - - - - '
            );
            return;
        }
        console.log('- - - - - - - - | Campañas a Iniciar: | - - - - - - - - ');
        console.table(idCampaigns);
        idCampaigns.forEach(async (element) => {
            const resultPlayCampaign = await playCampaignWithoutRquest(
                element.id
            );
            console.log(
                `- - - - - - - - | Resultado del play por tarea Campaña ${element.id} | - - - - - - - - `
            );
            console.log(resultPlayCampaign);
            console.log(
                `- - - - - - - - | Resultado del play por tarea Campaña ${element.id} | - - - - - - - - `
            );
        });
    });
}
