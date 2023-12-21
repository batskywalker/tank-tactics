import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('join')
.setDescription('Join the game.')

async function execute(interaction, playerData) {
    const player = {
        playerID: interaction.user.id,
        playerUser: interaction.user.username,
        icon: interaction.user.avatar,
        pos: {
            x: 0,
            y: 0,
        },
        range: 1,
        action: 3,
        health: 3
    };

    playerData.push(player);

    fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

    interaction.reply({
        content: 'Thanks for joining!'
    });

    return false;
}

export default {data, execute};