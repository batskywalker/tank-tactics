import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';

const data = new SlashCommandBuilder()
.setName('move')
.setDescription('Use one action point to move one space up, down, left, or right')
.addStringOption(option =>
option.setName('direction')
.setDescription('The direction you want to move')
.setRequired(true)
.addChoices(
    {name: 'up', value: [0, -1]},
    {name: 'down', value: [0, 1]},
    {name: 'left', value: [-1, 0]},
    {name: 'right', value: [1, 0]}
));

async function execute(interaction, playerData) {
    const direction = interaction.data.options[0].value;
    var currentPlayer;
    var num;
    for (var i = 0; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            currentPlayer = playerData[i];
            num = i;
        }
    }

    if ((currentPlayer.pos.x + direction[0] >= 0 && currentPlayer.pos.x + direction[0] < 30) && (currentPlayer.pos.y + direction[1] >= 0 && currentPlayer.pos.y + direction[1] < 30) && currentPlayer.action > 0) {
        currentPlayer.action
    }
}

export default {data, execute};