import {SlashCommandBuilder} from 'discord.js';

const data = new SlashCommandBuilder()
.setName('start')
.setDescription('Start the game.')

async function execute(interaction, playerData) {
    /*for (var i = 0; i < playerData.length; i++) {
        playerData[i].pos.x = Math.floor(Math.random() * 30);
        playerData[i].pos.y = Math.floor(Math.random() * 30);
    }*/

    interaction.reply({
        content: 'Game has started!'
    });

    return playerData;
}

export default {data, execute};