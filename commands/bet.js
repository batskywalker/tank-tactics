import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('bet')
.setDescription('Bet who you think will get an extra point')
.addUserOption(option =>
    option.setName('target')
    .setDescription('The player you think will win')
    .setRequired(true)
)
.addIntegerOption(option =>
    option.setName('amount')
    .setDescription('The amount of points you want to bet')
    .setRequired(true)
);

async function execute(interaction, playerData, bountyPoints, votes) {
    const player = interaction.user.id;
    const target = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');

    if (!playerData.data.started || !playerData[player]) {
        interaction.reply({
            content: "You can't place bets right now.",
            ephemeral: true
        });
        return [false];
    }
    else if (playerData[player].bet) {
        interaction.reply({
            content: "You've already placed your bet.",
            ephemeral: true
        });
        return [false];
    }
    else if (bountyPoints[player].points < amount || bountyPoints[player].points <= 0) {
        interaction.reply({
            content: "You don't have enough points.",
            ephemeral: true
        });
        return [false];
    }
    else if (!playerData[target.id] || !playerData[target.id].alive) {
        interaction.reply({
            content: "Bets can't be placed on this player.",
            ephemeral: true
        });
        return [false];
    }

    playerData[player].bet = true;

    var newBet = {
        playerID: player,
        playerUser: playerData[player].playerUser,
        amount: amount
    };
    votes[target.id].bets.push(newBet);
    votes[target.id].pool += amount;
    votes.pool += amount;
    bountyPoints[player].points -= amount;

    fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));
    fs.writeFileSync(`${__dirname}\\bounty-points.json`, JSON.stringify(bountyPoints));
    fs.writeFileSync(`${__dirname}\\votes.json`, JSON.stringify(votes));

    interaction.reply({
        content: `Thank you for placing your bet!\n${amount} points bet on ${target.username} to win the vote.\nCurrent point balance: ${bountyPoints[player].points}`,
        ephemeral: true
    });
    return [false];
}

export default {data, execute};