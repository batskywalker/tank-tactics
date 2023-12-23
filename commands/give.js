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
.addNumberOption(option =>
option.setName('amount')
.setDescription('The amount of points you want to give this player')
.setRequired(true)
);

async function execute(interaction, playerData) {
    var currentPlayer;
    var num1;
    var targetString = interaction.options.getUser('target');
    var target;
    var num2;
    var amount = interaction.options.getNumber('amount');
    for (var i = 1; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            currentPlayer = playerData[i];
            num1 = i;
            break;
        }
    }

    if (currentPlayer.action > 0 || amount > currentPlayer.action) {
        interaction.reply({
            content: "You don't have enough points."
        });
        return false;
    }

    for (var i = 1; i < playerData.length; i++) {
        if (targetString == playerData[i].playerID) {
            target = playerData[i];
            num2 = i;
        }
    }

    if (!target) {
        interaction.reply({
            content: 'That player is not in the game.'
        });
        return false;
    }
    else if (currentPlayer.playerID == target.playerID) {
        interaction.reply({
            content: "You can't give yourself points."
        });
        return false;
    }

    for (var i = currentPlayer.pos.x - currentPlayer.range; i <= currentPlayer.pos.x + currentPlayer.range; i++) {
        for (var j = currentPlayer.pos.y - currentPlayer.range; j <= currentPlayer.pos.y + currentPlayer.range; j++) {
            if (target.pos.x == i && target.pos.y == j) {
                currentPlayer.action -= amount;
                target.action += amount;

                playerData[num1] = currentPlayer;
                playerData[num2] = target;

                fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

                interaction.reply({
                    content: `<@${currentPlayer.playerID}> has given <@${target.playerID}> ${amount} action points!`
                });

                return [currentPlayer, target];
            }
        }
    }

    interaction.reply({
        content: 'That player is out of your range.'
    });
    return false;
}

export default {data, execute};