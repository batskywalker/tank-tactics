import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('leave')
.setDescription('Leave the game.')

async function execute(interaction, playerData) {
    if (playerData[0].started) {
        interaction.reply({
            content: 'Game has already started.'
        });
        return false;
    }

    for (var i = 1; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            delete playerData[i];

            interaction.reply({
                content: `<@${interaction.user.id} has left the game.`
            });

            fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

            return false;
        }
    }

    interaction.reply({
        content: "You're already not in the game."
    });
    return false;
}

export default {data, execute};