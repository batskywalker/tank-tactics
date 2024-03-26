import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('range')
.setDescription('Increase the range you can shoot in')

async function execute(interaction, playerData) {
    if (!playerData.data.started) {
        interaction.reply({
            content: "Actions can't be played right now."
        });
        return [false];
    }

    const id = interaction.user.id;

    if (!playerData[id].alive) {
        return [false];
    }
    
    if (playerData[id].action > 0) {
        playerData[id].range += 1;
        playerData[id].action -= 1;

        fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

        return [`<@${interaction.user.id}> has increased their shooting range.`, playerData[id]];
    }
    else {
        return [false];
    }
}

export default {data, execute};