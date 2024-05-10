import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('join')
.setDescription('Join the game.')

async function execute(interaction, playerData, bountyPoints) {
    if (playerData.data.started) {
        return [false];
    }

    var newPlayer = {
        playerID: interaction.user.id,
        playerUser: interaction.user.username,
        icon: interaction.user.avatar,
        alive: true,
        shown: true,
        pos: {
            x: 0,
            y: 0,
        },
        range: 1,
        action: 3,
        health: 3,
        queue: 0,
        voted: false,
        votedFor: null,
        bet: false,
        shots: 0,
        bounty: false
    };

    const player = interaction.user.id;

    if (playerData[player]) {
        interaction.reply({
            content: "You're already in the game.",
            ephemeral: true
        });
        return [false];
    }

    if (!bountyPoints[player]) {
        bountyPoints[player] = {};
        bountyPoints[player]['playerUser'] = interaction.user.username;
        bountyPoints[player]['points'] = 100;
        bountyPoints[player]['won'] = 0; //most points won in a bet
        bountyPoints[player]['lost'] = 0; // most points lost in a bet
        bountyPoints[player]['maybe'] = 0;
    }

    playerData[player] = newPlayer;
    playerData.data.amount_alive += 1;
    playerData.data.max_alive += 1;

    interaction.member.roles.add('1190233509172891708');

    fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));
    fs.writeFileSync(`${__dirname}\\bounty-points.json`, JSON.stringify(bountyPoints));

    interaction.reply({
        content: `<@${interaction.user.id}> has joined!`
    });

    return [false];
}

export default {data, execute};