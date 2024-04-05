import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('start')
.setDescription('Start the game.')

async function execute(interaction, playerData) {
    if (!playerData.data.started && interaction.user.id == '327298783526387713') {
        playerData.data.started = true;
        var playerArray = [];

        Object.keys(playerData).forEach(async player => {
            var occupied = false;
            var newX = Math.floor(Math.random() * playerData.data.width);
            var newY = Math.floor(Math.random() * playerData.data.height);

            while (!occupied) {
                Object.keys(playerData).forEach(async newPlayer => {
                    if (newX == playerData[newPlayer].pos.x && newY == playerData[newPlayer].pos.y) {
                        newX = Math.floor(Math.random() * playerData.data.width);
                        newY = Math.floor(Math.random() * playerData.data.height);
                    }
                    else {
                        occupied = true;
                        playerData[player].pos.x = newX;
                        playerData[player].pos.y = newY;
                        playerArray.push(playerData[player]);
                    }
                });
            }
        });
        
        fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

        return ['Game has started!', playerArray];
    }

    return [false];
}

export default {data, execute};