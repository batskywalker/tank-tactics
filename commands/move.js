import {SlashCommandBuilder} from 'discord.js'

const data = new SlashCommandBuilder()
.setName('move')
.setDescription('Use one action point to move one space up, down, left, or right')
.addStringOption(option =>
option.setName('direction')
.setDescription('The direction you want to move')
.setRequired(true)
.addChoices(
    {name: 'up', value: 'up'},
    {name: 'down', value: 'down'},
    {name: 'left', value: 'left'},
    {name: 'right', value: 'right'}
));

async function execute(interaction) {
    const moveData = {
        player: interaction.user.id,
        move: interaction.options.getString('direction')
    }
    return moveData
}

export default {data, execute};