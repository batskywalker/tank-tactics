const dotenv = require('dotenv');
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageComponentInteraction, InteractionCollector, ButtonComponent, InteractionResponse, Events, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Channel] });

window.onload = function() {
    console.log("please work")
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}!`);
    });

    let paragraph = window.document.querySelector("#test");

    paragraph.textContent = "this worked";
}

client.login(process.env.DISCORD);
