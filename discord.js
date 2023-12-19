import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, MessageComponentInteraction, InteractionCollector, InteractionResponse, Events, Collection } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers], partials: [Partials.Channel] });

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import {createRequire} from 'module';
const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

client.commands = new Collection();

const commandFiles = fs.readdirSync(`${__dirname}\\commands\\`).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    console.log(__dirname);
    const command = await import(`file://${__dirname}\\commands\\${file}`);

    if ('data' in command.default && 'execute' in command.default) {
        client.commands.set(command.default.data.name, command.default);
    }
    else {
        console.log(`[WARNING] the command at ./commands/ ${file} is missing a required "data" or "execute" property.`);
    }
}

let sseResponse = [];

const server = http.createServer((req, res) => {
    if (req.url === '/sse') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            "Connection": 'keep-alive'
        });

        sseResponse.push(res);
    }
    else if (req.url === '/') {
        fs.readFile(`${__dirname}/website/index.html`, function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end(data);
        });
    }
    else if (req.url === '/index.js') {
        fs.readFile(`${__dirname}/website/index.js`, function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'application/javascript'
            });
            res.end(data);
        });
    }
    else if (req.url === '/styles.css') {
        fs.readFile(`${__dirname}/website/styles.css`, function(err, data) {
            res.writeHead(200, {
                'Content-Type': 'text/css'
            })
            res.end(data);
        })
    }
}).listen(4200);

function sendData(response, data) {
    if (response) {
        response.write(`data: ${data}\n\n`);
    }
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (msg) => {
    sseResponse.forEach(response => {
        sendData(response, msg.content);
    })
})

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        }
        catch (error) {
            console.log(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
            else {
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    ephemeral: true
                });
            }
        }
        return;
    }
});

client.login(process.env.DISCORD);