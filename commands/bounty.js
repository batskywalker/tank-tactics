import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('bounty')
.setDescription('Put a bounty on a players head')
.addUserOption(option =>
    option.setName('target')
        .setDescription('The player you want your bounty to be on')
        .setRequired(true)
)
.addSubcommand(subcommand =>
    subcommand
        .setName('actions')
        .setDescription('A bounty reward of action points')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('1 action point = 100 bounty points')
            .setRequired(true)
        )
)
.addSubcommand(subcommand =>
    subcommand
        .setName('health')
        .setDescription('A bounty reward of health points')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('1 health point = 1000 bounty points')
            .setRequired(true)
        )
)
.addSubcommand(subcommand =>
    subcommand
        .setName('bounties')
        .setDescription('A bounty reward of bounty points')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The amount of bounty points')
            .setRequired(true)
        )
)
.addSubcommand(subcommand =>
    subcommand
        .setName('message')
        .setDescription('A custom reward message')
        .addStringOption(option =>
            option.setName('content')
            .setDescription('The text in your bounty message')
            .setRequired(true)
        )
)

async function execute(interaction, playerData, bountyPoints, bounties) {
    
}

export default {data, execute};