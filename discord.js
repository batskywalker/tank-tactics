require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageComponentInteraction, InteractionCollector, ButtonComponent, InteractionResponse, Events, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Channel] });

const express = require('express');
const app = express();
const hbs = require('hbs');

/*app.set('view engine', 'html');
app.engine('html', require('hbs').__express);*/
app.use(express.static('website'));

/*app.get("/", function(req, res) {
    res.sendFile(__dirname + "/website/index.html");
});*/

app.listen(3000, function () {
    console.log("its runnin");
});

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

app.get("/", function (req, res) {
    res.send("msg.content");
})

client.on("messageCreate", (msg) => {
    console.log(msg.content);
    
});

client.login(process.env.DISCORD);