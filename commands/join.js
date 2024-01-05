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
    if (playerData[0].started) {
        return [false];
    }

    const player = {
        playerID: interaction.user.id,
        playerUser: interaction.user.username,
        icon: interaction.user.avatar,
        alive: true,
        pos: {
            x: 0,
            y: 0,
        },
        range: 1,
        action: 3,
        health: 3,
        queue: 0
    };

    for (var i = 1; i < playerData.length; i++) {
        if (player.playerID == playerData[i].playerID) {
            interaction.reply({
                content: "You're already in the game."
            });
            return [false];
        }
    }

    playerData.push(player);
    playerData[0].amount_alive += 1;
    playerData[0].max_alive += 1;

    interaction.user.roles.add('1190233509172891708');

    fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

    interaction.reply({
        content: 'Thanks for joining!'
    });

    return [false];
}

export default {data, execute};