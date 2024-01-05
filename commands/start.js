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
    if (!playerData[0].started) {
        playerData[0].started = true;

        for (var i = 1; i < playerData.length; i++) {
            var occupied = false;
            var newX = Math.floor(Math.random() * playerData[0].width);
            var newY = Math.floor(Math.random() * playerData[0].height);

            while (!occupied) {
                for (var j = 1; j < playerData.length; j++) {
                    if (newX == playerData[j].pos.x && newY == playerData[j].pos.y) {
                        newX = Math.floor(Math.random() * playerData[0].width);
                        newY = Math.floor(Math.random() * playerData[0].height);
                    }
                    else {
                        occupied = true;
                        playerData[i].pos.x = newX;
                        playerData[i].pos.y = newY;
                    }
                }
            }
        }

        interaction.reply({
            content: 'Game has started!'
        });
        
        fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

        return playerData;
    }

    return [false];
}

export default {data, execute};