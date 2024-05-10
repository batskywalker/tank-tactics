import {SlashCommandBuilder, codeBlock} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('odds')
.setDescription('See how much you can earn for betting');

async function execute(interaction, votes) {
    if (Object.keys(votes).length > 1) {
        var result = 'Player            Return Ratio       Bets         Pool\n-------------------------------------------------------------\n';

        Object.keys(votes).forEach(key => { //the current players id
        if (key != "pool") {
            var loopResult = '';
            var ratio = 1.0 / ((votes[key].pool + 1.0) / (votes.pool + 1.0));
            ratio = `1:${ratio.toFixed(2)}`;
            const betterSize = Math.max(Math.floor(Math.log10(Math.abs(votes[key].bets.length))), 0) + 1;
            const voteePoolSize = Math.max(Math.floor(Math.log10(Math.abs(votes[key].pool))), 0) + 1;
            
            loopResult += votes[key].playerUser;
            loopResult += ' ';
            
            for (var j = 0; j < 17 - (votes[key].playerUser.length - 1); j++) {
                loopResult += ' ';
            }

            loopResult += ratio;
            loopResult += ' ';

            for (var j = 0; j < 14 - ((ratio.length - 6) + (betterSize - 1)); j++) {
                loopResult += ' ';
            }

            loopResult += votes[key].bets.length;

            for (var j = 0; j < 12 - ((betterSize - 1) + (voteePoolSize - 1)); j++) {
                loopResult += ' ';
            }

            loopResult += `${votes[key].pool}\n`;

            result += loopResult;
        }
        });
        result += `\nTOTAL POOL: ${votes.pool}\nNumbers and Ratios may be subject to change once you enter your bet.`;
        result = codeBlock(result);

        interaction.reply({
            content: result,
            ephemeral: true
        });

        return [false];
    }

    interaction.reply({
        content: "Bets aren't open right now.",
        ephemeral: true
    });

    return [false];
}

export default {data, execute};