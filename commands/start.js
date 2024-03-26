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

        Object.keys(playerData).forEach(key => {
            var occupied = false;
            var newX = Math.floor(Math.random() * playerData.data.width);
            var newY = Math.floor(Math.random() * playerData.data.height);

            while (!occupied) {
                Object.keys(playerData).forEach(newKey => {
                    if (newX == playerData[newKey].pos.x && newY == playerData[newKey].pos.y) {
                        newX = Math.floor(Math.random() * playerData.data.width);
                        newY = Math.floor(Math.random() * playerData.data.height);
                    }
                    else {
                        occupied = true;
                        playerData[key].pos.x = newX;
                        playerData[key].pos.y = newY;
                        playerArray.push(playerData[key]);
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