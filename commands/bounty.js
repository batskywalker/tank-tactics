import {SlashCommandBuilder} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const data = new SlashCommandBuilder()
.setName('bounty')
.setDescription('Put a bounty on a players head')
.addUserOption(option =>
    option.setName('target')
        .setDescription('The player you want your bounty to be on')
        .setRequired(true)
)
.addSubcommand(subcommand =>
    subcommand
        .setName('actions')
        .setDescription('A bounty reward of action points')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('1 action point = 100 bounty points')
            .setRequired(true)
        )
)
.addSubcommand(subcommand =>
    subcommand
        .setName('health')
        .setDescription('A bounty reward of health points')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('1 health point = 1000 bounty points')
            .setRequired(true)
        )
)
.addSubcommand(subcommand =>
    subcommand
        .setName('points')
        .setDescription('A bounty reward of bounty points')
        .addIntegerOption(option =>
            option.setName('amount')
            .setDescription('The amount of bounty points')
            .setRequired(true)
        )
)

async function execute(interaction, playerData, bountyPoints, bounties) {
    const player = interaction.user.id;
    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getUser('target');
    const amount = interaction.options.getInteger('amount');
    var cost;

    if (!playerData.data.started || !playerData[player]) {
        interaction.reply({
            content: "You can't place a bounty right now.",
            ephemeral: true
        });
        return [false];
    }
    else if (bounties[target.id] && bounties[target.id].playerID != player) {
        interaction.reply({
            content: "This player already has a bounty out for them.",
            ephemeral: true
        });
        return [false];
    }
    else if (playerData[player].bounty && !bounties[target.id]) {
        interaction.reply({
            content: "You already have an active bounty.",
            ephemeral: true
        });
        return [false];
    }
    else if (!playerData[target.id] || !playerData[target.id].alive) {
        interaction.reply({
            content: "You can't put a bounty on this person.",
            ephemeral: true
        });
        return [false];
    }
    else if (amount <= 0) {
        interaction.reply({
            content: "Please enter a number larger than 0.",
            ephemeral: true
        });
        return [false];
    }

    var newBounty = {
        targetUser: target.username,
        playerID: player,
        playerUser: playerData[player].playerUser,
        active: false,
        rewards: {}
    };


    switch (subcommand) {
        case "actions":
            cost = amount * 100;
            break;
        case "health":
            cost = amount * 1000;
            break;
        case "bounties":
            cost = amount;
            break;
        default:
            break;
    }

    if (bountyPoints[player].points < cost) {
        interaction.reply({
            content: "You don't have enough points.",
            ephemeral: true
        });
        return [false];
    }

    bountyPoints[player].points -= cost;
    playerData[player].bounty = true;

    if (bounties[target.id]) {
        if (bounties[target.id].rewards[subcommand]) {
            bounties[target.id].rewards[subcommand] += amount;
        }
        else {
            bounties[target.id].rewards[subcommand] = amount;
        }
    }
    else {
        newBounty.rewards[subcommand] = amount;
        bounties[target.id] = newBounty;
    }

    fs.writeFileSync(`${__dirname}\\player-data.json`, JSON.stringify(playerData));
    fs.writeFileSync(`${__dirname}\\bounty-points.json`, JSON.stringify(bountyPoints));
    fs.writeFileSync(`${__dirname}\\bounties.json`, JSON.stringify(bounties));
   
    interaction.reply({
        content: "Thank you for creating a new bounty!\nYour bounty will take effect after the next round of turns.",
        ephemeral: true
    });
    return [false];
}

export default {data, execute};