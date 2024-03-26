import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('destruct')
.setDescription('Blow yourself up and anyone else within 2 squares of you.')

async function execute(interaction, playerData) {
    var response = [``];
    if (!playerData.data.started) {
        interaction.reply({
            content: "Actions can't be played right now."
        });
        return [false];
    }

    const player = interaction.user.id;
    if (!playerData[player].alive) {
        return [false];
    }

    response[0] = `<@${playerData[player].playerID}> has self-destructed dealing ${playerData[player].health} damage to:`;
    response.push(playerData[player]);
    var respMessage = ``;

    playerData[player].alive = false;
    playerData[player].shown = false;
    playerData.data.amount_alive--;
    
    Object.keys(playerData).forEach(key => {
        // key is the potential victims id
        if (playerData[key].alive && (playerData[key].pos.x >= playerData[player].pos.x - 2 && playerData[key].pos.x <= playerData[player].pos.x + 2) && (playerData[key].pos.y >= playerData[player].pos.y - 2 && playerData[key].pos.y <= playerData[player].pos.y + 2)) {
            playerData[key].health -= playerData[player].health;

            if (playerData[key].health <= 0) {
                playerData[key].alive = false;
                playerData.data.amount_alive--;
                respMessage += `\n<@${playerData[key].playerID}>, leaving them with 0 health! ${playerData[0].amount_alive} players remain!`;
            }
            else {
                respMessage += `\n<@${playerData[key].playerID}, leaving them with ${playerData[key].health}!`;
            }
            
            response.push(playerData[key]);
        }
    });

    if (respMessage.length == 0) {
        response[0] += `\nNo one.`;
    }

    fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

    return response;
}

export default {data, execute};