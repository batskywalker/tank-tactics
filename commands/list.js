import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('list')
.setDescription('List actions or players')
.addStringOption(option =>
    option.setName('info')
        .setDescription('Player info or action info')
        .setRequired(true)
        .addChoices(
            {name: 'actions', value: 'actions'},
            {name: 'players', value: 'players'},
        ));

async function execute(interaction, playerData, actionQueue, bountyPoints) {
    if (!playerData.data.started) {
        interaction.reply({
            content: "Game hasn't started."
        });
        return;
    }

    const optionString = interaction.options._hoistedOptions[0].value;
    var result = '';

    if (optionString == 'actions') {
        for (var i = 0; i < actionQueue.length; i++) {
            for (var j = 0; j < actionQueue[i].length; j++) {
                if (actionQueue[i][j].user.id == interaction.user.id) {
                    result += `${actionQueue[i][j].commandName}`
                }
            }
        }
    }
}

export default {data, execute};