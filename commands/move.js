const {SlashCommandBuilder} = require('discord.js');sss

export default {
    data: new SlashCommandBuilder()
        .setName('Move')
        .setDescription('Use one action point to move one space up, down, left, or right')
        .addStringOption(option =>
            option.setName('Direction')
                .setDescription('The direction you want to move')
                .setRequired(true)
                .addChoices(
                    {name: 'Up', value: 'up'},
                    {name: 'Down', value: 'down'},
                    {name: 'Left', value: 'left'},
                    {name: 'Right', value: 'right'}
                )),
    async execute(interaction) {
        const moveData = {
            player: interaction.user.id,
            move: interaction.options.getString('Direction')
        }
    }
}