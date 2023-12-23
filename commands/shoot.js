import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('shoot')
.setDescription('Shoot a player within your shooting radius')
.addUserOption(option =>
option.setName('target')
.setDescription('The player you want to shoot')
.setRequired(true)    
);

async function execute(interaction, playerData) {
    var currentPlayer;
    var num1;
    var targetString = interaction.options.getUser('target');
    var target;
    var num2;
    for (var i = 1; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            currentPlayer = playerData[i];
            num1 = i;
            break;
        }
    }

    if (currentPlayer.action > 0) {
        interaction.reply({
            content: 'You have no more action points.'
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
            content: "You can't shoot yourself."
        });
        return false;
    }

    for (var i = currentPlayer.pos.x - currentPlayer.range; i <= currentPlayer.pos.x + currentPlayer.range; i++) {
        for (var j = currentPlayer.pos.y - currentPlayer.range; j <= currentPlayer.pos.y + currentPlayer.range; j++) {
            if (target.pos.x == i && target.pos.y == j) {
                currentPlayer.action -= 1;
                target.health -= 1;

                playerData[num1] = currentPlayer;
                playerData[num2] = target;

                fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

                interaction.reply({
                    content: `<@${currentPlayer.playerID}> has shot <@${target.playerID}>!`
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