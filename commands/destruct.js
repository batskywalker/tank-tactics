import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('destruct')
.setDescription('Blow yourself up and anyone else within 2 squares of you.')

async function execute(interaction, playerData) {
    var response = [``];
    if (!playerData[0].started) {
        interaction.reply({
            content: "Actions can't be played right now."
        });
        return [false];
    }

    for (var i = 1; i < playerData.length; i++) {
        if (interaction.user.id == playerData[i].playerID) {
            var curr = playerData[i];
            if (!curr.alive) {
                return [false];
            }

            response[0] = `<@${curr.playerID}> has self-destructed dealing ${curr.health} damage to:`;
            response.push(curr);
            var respMessage = ``;

            curr.alive = false;
            curr.shown = false;
            playerData[0].amount_alive--;
            
            for (var j = 1; j < playerData.length; j++) {
                var target = playerData[j];
                if (target.alive && (target.pos.x >= curr.pos.x - 2 && target.pos.x <= curr.pos.x + 2) && (target.pos.y >= curr.pos.y - 2 && target.pos.y <= curr.pos.y + 2)) {
                    target.health -= curr.health;
                    if (target.health <= 0) {
                        target.alive = false;
                        playerData[0].amount_alive--;
                        respMessage += `\n<@${target.playerID}>, leaving them with 0 health! ${playerData[0].amount_alive} players remain!`;
                    }
                    else {
                        respMessage += `\n<@${target.playerID}, leaving them with ${target.health}!`;
                    }
                    
                    playerData[j] = target;
                    response.push(target);
                }
            }

            if (respMessage.length == 0) {
                response[0] += `\nNo one.`;
            }

            playerData[i] = curr;

            fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));

            return response;
        }
    }
}

export default {data, execute};