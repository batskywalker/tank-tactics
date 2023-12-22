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
    /*for (var i = 0; i < playerData.length; i++) {
        playerData[i].pos.x = Math.floor(Math.random() * 30);
        playerData[i].pos.y = Math.floor(Math.random() * 30);
    }*/
    if (!playerData[0].started) {
        playerData[0].started = true;

        interaction.reply({
            content: 'Game has started!'
        });
        
        fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

        return playerData;
    }

    interaction.reply({
        content: 'Game is already going!'
    });
    return false;
}

export default {data, execute};