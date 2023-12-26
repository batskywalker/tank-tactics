import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('radius')
.setDescription('Increase the radius you can shoot in')

async function execute(interaction, playerData) {
    for (var i = 1; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            if (!playerData[i].alive) {
                interaction.reply({
                    content: "You are dead."
                });
                return false;
            }
            
            if (playerData[i].action > 0) {
                playerData[i].radius += 1;
                playerData[i].action -= 1;

                interaction.reply({
                    content: `<@${playerData[i].playerID}> has increased their shooting radius.`
                });

                fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

                return [playerData[i]];
            }
            else {
                interaction.reply({
                    content: 'You have no more action points.'
                });

                return false;
            }
        }
    }
}

export default {data, execute};