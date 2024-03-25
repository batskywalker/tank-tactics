import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('remove')
.setDescription('Remove actions or bounties')
.addStringOption(option =>
    option.setName('choice')
        .setDescription('Actions or bounties')
        .setRequired(true)
        .addChoices(
            {name: 'actions', value: 'actions'},
            {name: 'bounty', value: 'bounty'},
        ));

async function execute(interaction, playerData, actionQueue, bounties, bountyPoints) {
    
}

export default {data, execute};