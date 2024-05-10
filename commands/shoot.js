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

async function execute(interaction, playerData, bountyPoints, bounties) {
    if (!playerData.data.started) {
        interaction.reply({
            content: "Actions can't be played right now.",
            ephemeral: true
        });
        return [false];
    }
    
    const player = interaction.user.id;
    const target = interaction.options._hoistedOptions[0].value;
    var reply;

    if (!playerData[player].alive || playerData[player].action <= 0) {
        return [false];
    }

    if (!playerData[target] || player == target || !playerData[target].shown) {
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
                    reply = `<@${player}> has shot the wreckage of <@${target}>!`;
                }
                else if (playerData[target].health <= 0) {
                    playerData[target].alive = false;
                    playerData.data.amount_alive -= 1;
                    playerData[player].action += playerData[target].action;

                    if (bounties[target]) {
                        if (bounties[target].active) {
                            if (bounties[target].playerID == player) {
                                bountyPoints[player].points += bounties[target].total;
                            }
                            Object.keys(bounties[target].rewards).forEach(reward => {
                                if (reward == "points") {
                                    bountyPoints[player].points += bounties[target].rewards[reward];
                                }
                                else {
                                    playerData[player][reward] += bounties[target].rewards[reward];
                                }
                            });

                            if (playerData.data.amount_alive == 1) {
                                reply = `<@${player}> has killed <@${target}> and collected their bounty!\n<@${player}> HAS WON THE GAME!`;
                                bountyPoints[player].points += 1000;
                                playerData.data.started = false;
                                playerData.data.amount_alive = 0;
                            }
                            else {
                                reply = `<@${player}> has killed <@${target}> and collected their bounty!\n${playerData.data.amount_alive} players remain!`;
                            }
                        }
                        playerData[bounties[target].playerID].bounty = false;
                        delete bounties[target];
                    }
                    else {
                        if (playerData.data.amount_alive == 1) {
                            reply = `<@${player}> has killed <@${target}>!\n<@${player}> HAS WON THE GAME!`;
                            bountyPoints[player].points += 1000;
                            playerData.data.started = false;
                            playerData.data.amount_alive = 0;
                        }
                        else {
                            reply = `<@${player}> has killed <@${target}>!\n${playerData.data.amount_alive} players remain!`;
                        }
                    }
                    
                }
                else {
                    reply = `<@${player}> has shot <@${target}>!`;
                }

                fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));
                fs.writeFileSync(`${__dirname}\\bounties.json`, JSON.stringify(bounties));
                fs.writeFileSync(`${__dirname}\\bounty-points.json`, JSON.stringify(bountyPoints));

                return [reply, playerData[player], playerData[target]];
            }
        }
    }

    return [false];
}

export default {data, execute};