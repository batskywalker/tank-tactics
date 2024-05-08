import {SlashCommandBuilder, codeBlock, bold} from 'discord.js';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('balance')
.setDescription('Check your bounty point balance')
.addStringOption(option =>
option.setName('format')
.setDescription('Choose to see your own balance or a leaderboard')
.setRequired(true)
.addChoices(
    {name: 'self', value: true},
    {name: "leaderboard", value: false}
));

async function execute(interaction, bountyPoints) {
    const player = interaction.user.id;
    const leaderboard = interaction.options.getString('format');

    if (leaderboard) {
        var result = '   Player                Points         Most Won    Most Lost\n-------------------------------------------------------------\n';
        var i = 1;

        Object.keys(bountyPoints).forEach(key => { //the current players id
            var loopResult = '';
            const pointSize = Math.max(Math.floor(Math.log10(Math.abs(bountyPoints[key].points))), 0) + 1;
            const wonSize = Math.max(Math.floor(Math.log10(Math.abs(bountyPoints[key].won))), 0) + 1;
            const lostSize = Math.max(Math.floor(Math.log10(Math.abs(bountyPoints[key].lost))), 0) + 1;
            const posSize = Math.max(Math.floor(Math.log10(Math.abs(i))), 0) + 1;

            
            loopResult += `${i}  ${bountyPoints[key].playerUser}`;

            for (var j = 0; j < 25 - ((bountyPoints[key].playerUser.length - 1) + (pointSize - 1) + (posSize - 1)); j++) {
                loopResult += ' ';
            }

            loopResult += bountyPoints[key].points;

            for (var j = 0; j < 16 - ((pointSize - 1) + (wonSize - 1)); j++) {
                loopResult += ' ';
            }

            loopResult += bountyPoints[key].won;

            for (var j = 0; j < 11 - ((wonSize - 1) + (lostSize - 1)); j++) {
                loopResult += ' ';
            }

            loopResult += `${bountyPoints[key].lost}\n`;
            i++;

            result += loopResult;
        });
        result = codeBlock(result);

        interaction.reply({
            content: result,
            ephemeral: true
        });

        return [false];
    }
    else {
        if (!bountyPoints[player]) {
            interaction.reply({
                content: "Join the next game to start earning points.",
                ephemeral: true
            });
            return [false];
        }

        
    }
}