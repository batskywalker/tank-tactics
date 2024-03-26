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
        return [false];
    }

    if (playerData[toString(interaction.user.id)]) {
        delete playerData[toString(interaction.user.id)];

        interaction.member.roles.remove('1190233509172891708');

        interaction.reply({
            content: `<@${interaction.user.id}> has left the game.`
        });

        fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

        return [false];
    }

    interaction.reply({
        content: "You're already not in the game.",
        ephemeral: true
    });
    return [false];
}

export default {data, execute};