import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('move')
.setDescription('Use one action point to move one space up, down, left, or right')
.addStringOption(option =>
option.setName('direction')
.setDescription('The direction you want to move')
.setRequired(true)
.addChoices(
    {name: 'up', value: 'up'},
    {name: 'down', value: 'down'},
    {name: 'left', value: 'left'},
    {name: 'right', value: 'right'}
));

async function execute(interaction, playerData) {
    if (!playerData.data.started) {
        interaction.reply({
            content: "Actions can't be played right now.",
            ephemeral: true
        });
        return [false];
    }
    
    const player = interaction.user.id;
    const directionString = interaction.options._hoistedOptions[0].value;
    var direction;

    switch(directionString) {
        case 'up':
            direction = [0, -1];
            break;
        case 'down':
            direction = [0, 1];
            break;
        case 'left':
            direction = [-1, 0];
            break;
        case 'right':
            direction = [1, 0];
            break;
        default:
            return [false];
    }

    if (!playerData[player].alive) {
        return [false];
    }

    Object.keys(playerData).forEach(async curr => {
        if (playerData[player].pos.x + direction[0] == playerData[curr].pos.x && playerData[player].pos.y + direction[1] == playerData[curr].pos.y) {
            return [false];
        }
    })

    if ((playerData[player].pos.x + direction[0] >= 0 && playerData[player].pos.x + direction[0] < playerData.data.width) && (playerData[player].pos.y + direction[1] >= 0 && playerData[player].pos.y + direction[1] < playerData.data.height)) {
        if (playerData[player].action > 0) {
            const previous = [playerData[player].pos.x, playerData[player].pos.y];
            playerData[player].action -= 1;
            playerData[player].pos.x += direction[0];
            playerData[player].pos.y += direction[1];

            fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

            playerData[player]['prev_pos'] = previous;

            return [`<@${playerData[player].playerID}> has moved ${directionString}.`, playerData[player]];
        }
        else {
            return [false];
        }
    }
    else {
        return [false];
    }
}

export default {data, execute};