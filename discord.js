require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageComponentInteraction, InteractionCollector, ButtonComponent, InteractionResponse, Events, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates], partials: [Partials.Channel] });

const express = require('express');
const app = express();
const hbs = require('hbs');
const fs = require('fs');

/*app.set('view engine', 'html');
app.engine('html', require('hbs').__express);*/
//app.use(express.static('website'));

/*app.get("/", function(req, res) {
    res.sendFile(__dirname + "/website/index.html");
});

app.listen(3000, function () {
    console.log("its runnin");
});

app.get("/", function (req, res) {
    res.send("msg.content");
})*/

const http = require('http');

const server = http.createServer((req, res) => {
    fs.readFile('website/index.html', function(err, data) {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': data.length
        });
        res.write(data);
        res.end();
    })
}).listen(3000);

/*server.listen(3000, () => {
    console.log('Server listening on port 3000');
});*/

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

/*client.on("messageCreate", (msg) => {
    
});*/

client.login(process.env.DISCORD);