import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('give')
.setDescription('Give a player your points')
.addUserOption(option =>
option.setName('target')
.setDescription('The player you want to give points to')
.setRequired(true)    
)
.addIntegerOption(option =>
option.setName('amount')
.setDescription('The amount of points you want to give this player')
.setRequired(true)
);

async function execute(interaction, playerData) {
    if (!playerData.data.started) {
        interaction.reply({
            content: "Actions can't be played right now.",
            ephemeral: true
        });
        return [false];
    }
    
    var player = interaction.user.id;
    var target = interaction.options._hoistedOptions[0].value;
    var amount = interaction.options._hoistedOptions[1].value;

    if (!playerData[target] || !playerData[player].alive || playerData[player].action <= 0 || amount > playerData[player].action || player == target || !playerData[target].alive || amount <= 0) {
        return [false];
    }

    if ((playerData[target].pos.x >= playerData[player].pos.x - playerData[player].range && playerData[target].pos.x <= playerData[player].pos.x + playerData[player].range) && (playerData[target].pos.y >= playerData[player].pos.y - playerData[player].range && playerData[target].pos.y <= playerData[player].pos.y + playerData[player].range)) {
        playerData[player].action -= amount;
        playerData[target].action += amount;

        fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

        return [`<@${player}> has given <@${target}> ${amount} action points!`, playerData[player], playerData[target]];
    }

    return [false];
}

export default {data, execute};