import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('shoot')
.setDescription('Shoot a player within your shooting radius')
.addUserOption(option =>
option.setName('target')
.setDescription('The player you want to shoot')
.setRequired(true)    
);

async function execute(interaction, playerData) {
    if (!playerData.data.started) {
        interaction.reply({
            content: "Actions can't be played right now."
        });
        return [false];
    }
    
    const player = interaction.user.id;
    const target = interaction.options._hoistedOptions[0].user.id;
    var reply;

    if (!playerData[player].alive || playerData[player].action <= 0) {
        return [false];
    }

    if (!playerData[target] || playerData[player].playerID == playerData[target].playerID || !playerData[target].shown) {
        return [false];
    }

    const attackDirection = [
        [-1, 0],
        [-1, -1],
        [0, -1],
        [1, -1],
        [1, 0],
        [1, 1],
        [0, 1],
        [-1, 1]
    ];

    for (var i = 0; i < 8; i++) {
        for (var j = 1; j <= playerData[player].range; j++) {
            if (playerData[target].pos.x == playerData[player].pos.x + (attackDirection[i][0] * j) && playerData[target].pos.y == playerData[player].pos.y + (attackDirection[i][1] * j)) {
                playerData[player].action -= 1;
                playerData[target].health -= 1;

                if (!playerData[target].alive) {
                    playerData[target].shots++;
                    reply = `<@${playerData[player].playerID}> has shot the wreckage of <@${playerData[target].playerID}>!`;
                }
                else if (playerData[target].health <= 0) {
                    playerData[target].alive = false;
                    playerData.data.amount_alive -= 1;
                    playerData[player].action += playerData[target].action;

                    if (playerData.data.amount_alive == 1) {
                        reply = `<@${playerData[player].playerID}> has killed <@${playerData[target].playerID}>!\n<@${playerData[player].playerID}> HAS WON THE GAME!`;
                        playerData.data.started = false;
                        playerData.data.amount_alive = 0;
                    }
                    else {
                        reply = `<@${playerData[player].playerID}> has killed <@${playerData[target].playerID}>!\n${playerData.data.amount_alive} players remain!`;
                    }
                }
                else {
                    reply = `<@${playerData[player].playerID}> has shot <@${playerData[target].playerID}>!`;
                }

                fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

                return [reply, playerData[player], playerData[target]];
            }
        }
    }

    return [false];
}

export default {data, execute};