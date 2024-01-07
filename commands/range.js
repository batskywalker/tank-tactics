import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('range')
.setDescription('Increase the range you can shoot in')

async function execute(interaction, playerData) {
    if (!playerData[0].started) {
        interaction.reply({
            content: "Actions can't be played right now."
        });
        return [false];
    }

    for (var i = 1; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            if (!playerData[i].alive) {
                return [false];
            }
            
            if (playerData[i].action > 0) {
                playerData[i].range += 1;
                playerData[i].action -= 1;

                fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

                return [`<@${playerData[i].playerID}> has increased their shooting range.`, playerData[i]];
            }
            else {
                return [false];
            }
        }
    }
}

export default {data, execute};