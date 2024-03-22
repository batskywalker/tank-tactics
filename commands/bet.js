import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('bet')
.setDescription('Bet who you think will get an extra point')
.addUserOption(option =>
    option.setName('player')
    .setDescription('The player you think will win')
    .setRequired(true)
)
.addIntegerOption(option =>
    option.setName('amount')
    .setDescription('The amount of points you want to bet')
    .setRequired(true)
);

async function execute(interaction, playerData) {
    
}

export default {data, execute};