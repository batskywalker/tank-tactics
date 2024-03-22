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
    if (!playerData[0].started) {
        interaction.reply({
            content: "Actions can't be played right now."
        });
        return [false];
    }
    
    var currentPlayer;
    var num1;
    var targetString = interaction.options._hoistedOptions[0].user.id;
    var target;
    var num2;
    var amount = interaction.options._hoistedOptions[1].value;
    for (var i = 1; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            currentPlayer = playerData[i];
            num1 = i;
            break;
        }
    }

    if (!currentPlayer.alive) {
        return [false];
    }

    if (currentPlayer.action <= 0 || amount > currentPlayer.action) {
        return [false];
    }

    for (var i = 1; i < playerData.length; i++) {
        if (targetString == playerData[i].playerID) {
            target = playerData[i];
            num2 = i;
        }
    }

    if (!target) {
        return [false];
    }
    else if (currentPlayer.playerID == target.playerID) {
        return [false];
    }
    else if (!target.alive) {
        return [false];
    }

    for (var i = currentPlayer.pos.x - currentPlayer.range; i <= currentPlayer.pos.x + currentPlayer.range; i++) {
        for (var j = currentPlayer.pos.y - currentPlayer.range; j <= currentPlayer.pos.y + currentPlayer.range; j++) {
            if (target.pos.x == i && target.pos.y == j) {
                currentPlayer.action -= amount;
                target.action += amount;

                playerData[num1] = currentPlayer;
                playerData[num2] = target;

                fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

                return [`<@${currentPlayer.playerID}> has given <@${target.playerID}> ${amount} action points!`, currentPlayer, target];
            }
        }
    }

    return [false];
}

export default {data, execute};