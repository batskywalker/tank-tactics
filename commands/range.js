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
            content: "Actions can't be played right now.",
            ephemeral: true
        });
        return [false];
    }

    const player = interaction.user.id;

    if (!playerData[player].alive) {
        return [false];
    }
    
    if (playerData[player].action > 0) {
        playerData[player].range += 1;
        playerData[player].action -= 1;

        fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

        return [`<@${player}> has increased their shooting range.`, playerData[player]];
    }
    else {
        return [false];
    }
}

export default {data, execute};