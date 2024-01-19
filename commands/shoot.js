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
    if (!playerData[0].started) {
        interaction.reply({
            content: "Actions can't be played right now."
        });
        return [false];
    }
    
    var currentPlayer;
    var num1;
    var targetString = interaction.options._hoistedOptions[0].user.id;
    var target;
    var num2;
    var reply;

    for (var i = 1; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            currentPlayer = playerData[i];
            num1 = i;
            break;
        }
    }

    if (!currentPlayer.alive) {
        return [false];
    }

    if (currentPlayer.action <= 0) {
        return [false];
    }

    for (var i = 1; i < playerData.length; i++) {
        if (targetString == playerData[i].playerID) {
            target = playerData[i];
            num2 = i;
        }
    }

    if (!target) {
        return [false];
    }
    else if (currentPlayer.playerID == target.playerID) {
        return [false];
    }
    else if (!target.alive) {
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
        for (var j = 1; j <= currentPlayer.range; j++) {
            if (target.pos.x == currentPlayer.pos.x + (attackDirection[i][0] * j) && target.pos.y == currentPlayer.pos.y + (attackDirection[i][1] * j)) {
                currentPlayer.action -= 1;
                target.health -= 1;

                if (target.health <= 0) {
                    target.alive = false;
                    playerData[0].amount_alive -= 1;
                    

                    if (playerData[0].amount_alive == 1) {
                        reply = `<@${currentPlayer.playerID}> has killed <@${target.playerID}>!\n<@${currentPlayer.playerID}> HAS WON THE GAME!`;
                        playerData[0].started = false;
                        playerData[0].amount_alive = 0;
                    }
                    else {
                        var dead = await interaction.options._hoistedOptions[0].member;
                        for (var m = 0; m < dead.roles.length; m++) {
                            if (dead.roles[m] == "1190233509172891708") {
                                dead.roles[m] = "1190234100137742386";
                            }
                        }
                        reply = `<@${currentPlayer.playerID}> has killed <@${target.playerID}>!\n${playerData[0].amount_alive} players remain!`;
                    }
                }
                else {
                    reply = `<@${currentPlayer.playerID}> has shot <@${target.playerID}>!`;
                }

                playerData[num1] = currentPlayer;
                playerData[num2] = target;

                fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

                return [reply, currentPlayer, target];
            }
        }
    }

    return [false];
}

export default {data, execute};