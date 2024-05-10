import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('destruct')
.setDescription('Blow yourself up and anyone else within 2 squares of you.')

async function execute(interaction, playerData, bountyPoints, bounties) {
    var response = [``];
    if (!playerData.data.started) {
        interaction.reply({
            content: "Actions can't be played right now.",
            ephemeral: true
        });
        return [false];
    }

    const player = interaction.user.id;
    if (!playerData[player].alive) {
        return [false];
    }

    if (bounties[player]) {
        playerData[bounties[player].playerID].bounty = false;
        delete bounties[player];
    }

    response[0] = `<@${player}> has self-destructed dealing ${playerData[player].health} damage to:`;
    response.push(playerData[player]);
    var respMessage = ``;

    playerData[player].alive = false;
    playerData[player].shown = false;
    playerData.data.amount_alive--;
    
    Object.keys(playerData).forEach(async curr => {
        // curr is the potential victims id
        if (playerData[curr].alive && (playerData[curr].pos.x >= playerData[player].pos.x - 2 && playerData[curr].pos.x <= playerData[player].pos.x + 2) && (playerData[curr].pos.y >= playerData[player].pos.y - 2 && playerData[curr].pos.y <= playerData[player].pos.y + 2)) {
            playerData[curr].health -= playerData[player].health;

            if (playerData[curr].health <= 0) {
                playerData[curr].alive = false;
                playerData.data.amount_alive--;
                respMessage += `\n<@${curr}>, leaving them with 0 health! ${playerData[0].amount_alive} players remain!`;

                if (bounties[curr]) {
                    if (bounties[curr].active) {
                        bountyPoints[player].points += bounties[curr].total;
                    }
                    playerData[bounties[curr].playerID].bounty = false;
                    delete bounties[curr];
                }
            }
            else {
                respMessage += `\n<@${curr}, leaving them with ${playerData[curr].health}!`;
            }
            
            response.push(playerData[curr]);
        }
    });

    if (respMessage.length == 0) {
        response[0] += `\nNo one.`;
    }

    fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));
    fs.writeFileSync(`${__dirname}\\bounties.json`, JSON.stringify(bounties));
    fs.writeFileSync(`${__dirname}\\bounty-points.json`, JSON.stringify(bountyPoints));

    return response;
}

export default {data, execute};