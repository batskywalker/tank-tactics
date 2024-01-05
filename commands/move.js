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
    if (!playerData[0].started) {
        interaction.reply({
            content: "Actions can't be played right now."
        });
        return [false];
    }
    
    const directionString = interaction.options.getString('direction');
    var direction

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
    }

    var currentPlayer;
    var num;
    for (var i = 1; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            currentPlayer = playerData[i];
            num = i;

            if (!currentPlayer.alive) {
                return [false];
            }

            for (var j = 1; j < playerData.length; j++) {
                if (currentPlayer.pos.x + direction[0] == playerData[j].pos.x && currentPlayer.pos.y + direction[1] == playerData[j].pos.y) {
                    return [false];
                }
            }
            break;
        }
    }

    if ((currentPlayer.pos.x + direction[0] >= 0 && currentPlayer.pos.x + direction[0] < playerData[0].width) && (currentPlayer.pos.y + direction[1] >= 0 && currentPlayer.pos.y + direction[1] < playerData[0].height)) {
        if (currentPlayer.action > 0) {
            const previous = [currentPlayer.pos.x, currentPlayer.pos.y];
            currentPlayer.action -= 1;
            currentPlayer.pos.x += direction[0];
            currentPlayer.pos.y += direction[1];
            playerData[num] = currentPlayer;

            fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

            currentPlayer['prev_pos'] = previous;

            return [`<@${currentPlayer.playerID}> has moved ${directionString}.`, currentPlayer];
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