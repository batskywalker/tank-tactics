import {SlashCommandBuilder, codeBlock} from 'discord.js';
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
    {name: 'self', value: '1'},
    {name: "leaderboard", value: '0'}
));

async function execute(interaction, bountyPoints) {
    const player = interaction.user.id;
    const leaderboard = interaction.options.getString('format');

    if (leaderboard == '0') {
        var result = '   Player                Points         Most Won    Most Lost\n-------------------------------------------------------------\n';
        var pos = [];
        Object.keys(bountyPoints).forEach(key => {
            pos.push(bountyPoints[key]);
        });

        for (var j = 0; j < pos.length; j++) {
            for (var k = j; k > 0; k--) {
                if (pos[k].points > pos[k - 1].points) {
                    var temp1 = pos[k - 1];
                    var temp2 = pos[k];

                    pos[k - 1] = temp2;
                    pos[k] = temp1;
                }
                else {
                    break;
                }
            }
        }

        for (var i = 0; i < pos.length; i++) { //the current players id
            var loopResult = '';
            const pointSize = Math.max(Math.floor(Math.log10(Math.abs(pos[i].points))), 0) + 1;
            const wonSize = Math.max(Math.floor(Math.log10(Math.abs(pos[i].won))), 0) + 1;
            const lostSize = Math.max(Math.floor(Math.log10(Math.abs(pos[i].lost))), 0) + 1;
            const posSize = Math.max(Math.floor(Math.log10(Math.abs(i))), 0) + 1;

            
            loopResult += `${i}  ${pos[i].playerUser}`;

            for (var j = 0; j < 25 - ((pos[i].playerUser.length - 1) + (pointSize - 1) + (posSize - 1)); j++) {
                loopResult += ' ';
            }

            loopResult += pos[i].points;

            for (var j = 0; j < 16 - ((pointSize - 1) + (wonSize - 1)); j++) {
                loopResult += ' ';
            }

            loopResult += pos[i].won;

            for (var j = 0; j < 11 - ((wonSize - 1) + (lostSize - 1)); j++) {
                loopResult += ' ';
            }

            loopResult += `${pos[i].lost}\n`;

            result += loopResult;
        };
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

        interaction.reply({
            content: `You have ${bountyPoints[player].points} points.`,
            ephemeral: true
        });

        return [false];
    }
}

export default {data, execute};