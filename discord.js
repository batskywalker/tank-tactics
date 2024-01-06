import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, MessageComponentInteraction, InteractionCollector, InteractionResponse, Events, Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder  } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers], partials: [Partials.Channel] });

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function sendData(response, data) {
    if (response) {
        response.write(`data: ${data}\n\n`);
    }
}

var playerData = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\player-data.json`, 'utf-8'));
var actionQueue = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\action-queue.json`, 'utf-8'));
var poll = await JSON.parse(fs.readFileSync(`${__dirame}\\commands\\votes.json`, 'utf-8'));

let sseResponse = [];

const server = http.createServer((req, res) => {
    if (req.url === '/sse') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            "Connection": 'keep-alive'
        });

        sseResponse.push(res);

        (async () => {
            if (playerData[0].started) {
                for (const response of sseResponse) {
                    await sendData(response, JSON.stringify(playerData));
                }
            }
        })();
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

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

if (playerData[0].started) {
    for (const response of sseResponse) {
        await sendData(response, JSON.stringify(playerData));
    }
}

async function ExecuteCommand(interaction) {
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        playerData = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\player-data.json`, 'utf-8'));
        const tempData = await command.execute(interaction, playerData);
        playerData = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\player-data.json`, 'utf-8'));

        const reply = await tempData.shift();

        if (reply) {
            client.channels.cache.get(process.env.CHANNELID).send(reply);
        }

        if (tempData) {
            for (const response of sseResponse) {
                await sendData(response, JSON.stringify(tempData));
            }
        }
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
}

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        if (playerData[0].started) {
            var curr;
            for (var i = 1; i < playerData.length; i++) {
                if (playerData[i].playerID == interaction.user.id) {
                    curr = i;
                }
            }

            if (!curr) {
                await interaction.reply({
                    content: "You're not in the game."
                });
                return;
            }

            if (!playerData[curr].alive) {
                await interaction.reply({
                    content: "You're dead."
                });
                return;
            }

            actionQueue = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\action-queue.json`, 'utf-8'));

            if (!actionQueue[playerData[curr].queue]) {
                tempArray = [];
                await actionQueue.push(tempArray);
            }

            await actionQueue[playerData[curr].queue].push(interaction);
            playerData[curr].queue += 1;

            fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));
            fs.writeFileSync(`${__dirname}\\commands\\action-queue.json`, JSON.stringify(actionQueue));
        }
        else {
            await ExecuteCommand(interaction);
        }
    }
    else if (interaction.isButton()) {
        poll = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\votes.json`, 'utf-8'));

        for (var i = 1; i < playerData.length; i++) {
            if (interaction.user.id == playerData[i].playerID && !playerData[i].voted) {
                for (var j = 0; j < poll.length; j++) {
                    if (interaction.component.customId == poll[j].id) {
                        poll[j].votes += 1;
                        playerData[i].voted = true;

                        for (var k = j; k >= 0; k--) {
                            if (poll[k].votes > poll[k - 1].votes) {
                                var temp1 = poll[k - 1];
                                var temp2 = poll[k];

                                poll[k - 1] = temp2;
                                poll[k] = temp1;
                            }
                        }
                    }
                }
            }
        }
    }
});

var pointsGiven = false;

async function GivePoints() {
    var theDate = new Date;
    if (theDate.getHours() == 12) {
        if (!pointsGiven) {
            for (var i = 1; i < playerData.length; i++) {
                if (playerData[i].alive) {
                    playerData[i].action += 1;
                }
            }
            pointsGiven = true;

            client.channels.cache.get(process.env.CHANNELID).send('<@&1190233509172891708>\nEveryone has received an action point!')

            poll = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\votes.json`, 'utf-8'));
            const highest = [];

            if (playerData[0].alive < playerData[0].max_alive && poll.length > 0) {
                highest.push(poll[0]);
                for (var i = 0; i < poll.length; i++) {
                    if (poll[i].votes == poll[0].votes) {
                        highest.push(poll[i]);
                    }
                    else {
                        break;
                    }
                }

                for (var i = 0; i < highest.length; i++) {
                    for (var j = 1; j < playerData.length; j++) {
                        if (highest[i].id == playerData[j].playerID) {
                            playerData[j].action += 1;
                            client.channels.cache.get(process.env.CHANNELID).send(`<@${playerData[j].playerID}> has recieved an extra point with ${highest[i].votes} votes for them!`);
                        }
                    }
                }
            }

            fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));

            for (const response of sseResponse) {
                await sendData(response, JSON.stringify(playerData));
            }

            for (var i = 0; i < actionQueue.length; i++) {
                for (var j = 0; j < actionQueue[i].length; j++) {
                    await ExecuteCommand(actionQueue[i][j]);
                }
            }

            fs.writeFileSync(`${__dirname}\\commands\\action-queue.json`, "[]");

            if (playerData[0].alive < playerData[0].max_alive) {
                var buttons = [];
                var newPoll = []
                
                for (var i = 1; i < playerData.length; i++) {
                    if (playerData[i].alive) {
                        const currPlayer = {
                            id: playerData[i].playerID,
                            votes: 0
                        };

                        newPoll.push(currPlayer);

                        const button = new ButtonBuilder()
                        .setLabel(currPlayer.id)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(currPlayer.id);

                        buttons.push(button);
                    }
                }

                fs.writeFileSync(`${__dirname}\\commands\\votes.json`, JSON.stringify(newPoll));

                client.channels.cache.get(process.env.DEADCHANNELID).send({
                    content: '<@&1190234100137742386> Vote for who you want to recieve an extra point tomorrow.\n',
                    components: buttons
                });
            }
        }
    }
    else {
        pointsGiven = false;
    }
}

setInterval(GivePoints, 600000);

client.login(process.env.DISCORD);