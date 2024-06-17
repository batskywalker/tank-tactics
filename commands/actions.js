import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('actions')
.setDescription('List actions')

async function execute(interaction, playerData, actionQueue) {
    const player = interaction.user.id;

    if (!playerData.data.started) {
        interaction.reply({
            content: "Game hasn't started.",
            ephemeral: true
        });
        return [false];
    }
    else if (!playerData[player]) {
        interaction.reply({
            content: "You're not in the game.",
            ephemeral: true
        });
        return [false];
    }
    else if (!playerData[player].alive || playerData[player].queue <= 0) {
        interaction.reply({
            content: "You have no actions submitted",
            ephemeral: true
        });
        return [false];
    }

    var result = '';
    for (var i = 0; i < actionQueue.length; i++) {
        for (var j = 0; j < actionQueue[i].length; j++) {
            if (actionQueue[i][j].user.id == player) {
                result += `${actionQueue[i][j].commandName}`;
                for (var k = 0; k < actionQueue[i][j].options._hoistedOptions.length; k++) {
                    if (actionQueue[i][j].options._hoistedOptions[k].user) {
                        result += ` ${actionQueue[i][j].options._hoistedOptions[k].user.username}`;
                    }
                    else {
                        result += ` ${actionQueue[i][j].options._hoistedOptions[k].value}`;
                    }
                }

                result += '\n';
                break;
            }
        }
    }

    if (!result) {
        result = "You haven't submitted any actions.";
    }

    interaction.reply({
        content: result,
        ephemeral: true
    });

    return [false];
}

export default {data, execute};