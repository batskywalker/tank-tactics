import 'dotenv/config';
import { Client, GatewayIntentBits, Partials, MessageComponentInteraction, InteractionCollector, InteractionResponse, Events, Collection, ButtonBuilder, ButtonStyle, ActionRowBuilder  } from 'discord.js';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers], partials: [Partials.Channel] });

import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import JSONbig from 'json-bigint';

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

var actionQueue = [];
var poll = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\votes.json`, 'utf-8'));

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
            await client.channels.cache.get(process.env.CHANNELID).send(reply);
        }

        if (tempData) {
            for (const response of sseResponse) {
                await sendData(response, JSON.stringify(tempData));
            }

            if (!playerData[0].started && playerData[0].amount_alive < playerData[0].max_alive) {
                var temp = playerData[0];
                temp.amount_alive = 0;
                temp.max_alive = 0;
                var guild = client.guilds.cache.get('1184701532822851655');
                await guild.members.fetch().then(users => {
                    users.forEach(async theUser => {
                        for (var i = 1; i < playerData.length; i++) {
                            if (playerData[i].playerID == theUser.user.id) {
                                if (playerData[i].alive) {
                                    theUser.roles.remove('1190233509172891708');
                                }
                                else {
                                    theUser.roles.remove('1190234100137742386');
                                }
                            }
                        }
                    });
                });

                playerData = [temp];
                fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));
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

client.on("messageCreate", async (msg) => {
    if (msg.content.toLowerCase().startsWith(".get") && msg.channel.id == "1198525372334080020") {
        //console.log(msg);
        playerData = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\player-data.json`, 'utf-8'));
        var guild = client.guilds.cache.get('1184701532822851655');
        await guild.members.fetch().then(users => {
            users.forEach(async theUser => {
                if (theUser.user.id === msg.content.slice(5)) {
                    for (var i = 1; i < playerData.length; i++) {
                        if (playerData[i].playerID == theUser.user.id) {
                            playerData[i].icon = theUser.user.avatar;
                            fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));
                            for (const response of sseResponse) {
                                await sendData(response, JSON.stringify(playerData[i]));
                            }
                            break;
                        }
                    }
                }
            })
            
        });
        //msg.reply(avatarID);
    }
})

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        if (playerData[0].started) {
            var shortInteraction = {};
            var curr;
            for (var i = 1; i < playerData.length; i++) {
                if (playerData[i].playerID == interaction.user.id) {
                    curr = i;
                }
            }

            if (!curr) {
                await interaction.reply({
                    content: "You're not in the game.",
                    ephemeral: true
                });
                console.log(interaction);
                return;
                
            }

            if (!playerData[curr].alive) {
                await interaction.reply({
                    content: "You're dead.",
                    ephemeral: true
                });
                return;
            }

            shortInteraction['user'] = interaction.user;
            shortInteraction['commandName'] = interaction.commandName;
            shortInteraction['options'] = interaction.options;

            actionQueue = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\action-queue.json`, 'utf-8'));

            if (!actionQueue[playerData[curr].queue]) {
                var tempArray = [shortInteraction];
                await actionQueue.push(tempArray);
            }
            else {
                await actionQueue[playerData[curr].queue].push(shortInteraction);
            }

            playerData[curr].queue += 1;

            await interaction.reply({
                content: 'Action submitted.',
                ephemeral: true
            });

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
            if (interaction.user.id == playerData[i].playerID) {
                if (!playerData[i].voted) {
                    if (playerData[i].votedFor == interaction.component.customId) {
                        interaction.reply({
                            content: "You voted for that player yesterday, please change your vote.",
                            ephemeral: true
                        });
                        return;
                    }
                    for (var j = 0; j < poll.length; j++) {
                        if (interaction.component.customId == poll[j].id) {
                            poll[j].votes += 1;
                            playerData[i].voted = true;
                            playerData[i].votedFor = interaction.component.customId;

                            for (var k = j; k > 0; k--) {
                                if (poll[k].votes > poll[k - 1].votes) {
                                    var temp1 = poll[k - 1];
                                    var temp2 = poll[k];

                                    poll[k - 1] = temp2;
                                    poll[k] = temp1;
                                }
                                else {
                                    break;
                                }
                            }

                            interaction.reply({
                                content: 'Thanks for voting!',
                                ephemeral: true
                            });

                            fs.writeFileSync(`${__dirname}\\commands\\votes.json`, JSON.stringify(poll));
                            fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));
                            break;
                        }
                    }
                    break;
                }
                else {
                    interaction.reply({
                        content: "You've already voted",
                        ephemeral: true
                    });
                }
            }
        }
    }
});

var pointsGiven = true;

async function GivePoints() {
    var theDate = new Date;

    if (theDate.getHours() == 12 && playerData[0].started) {
        if (!pointsGiven) {
            pointsGiven = true;
            actionQueue = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\action-queue.json`, 'utf-8'));

            for (var i = 0; i < actionQueue.length; i++) {
                for (var j = 0; j < actionQueue[i].length; j++) {
                    await ExecuteCommand(actionQueue[i][j]);
                }
            }

            for (var i = 1; i < playerData.length; i++) {
                playerData[i].queue = 0;
            }

            actionQueue = [];
            fs.writeFileSync(`${__dirname}\\commands\\action-queue.json`, JSON.stringify(actionQueue));

            for (var i = 1; i < playerData.length; i++) {
                if (playerData[i].alive) {
                    playerData[i].action += 1;
                }
                else {
                    if (!playerData[i].voted) {
                        playerData[i].votedFor = null;
                    }
                }

                playerData[i].voted = false;
            }
            
            client.channels.cache.get(process.env.CHANNELID).send('<@&1190233509172891708>\nEveryone has received an action point!')

            poll = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\votes.json`, 'utf-8'));
            const highest = [];

            if (playerData[0].amount_alive < playerData[0].max_alive && poll.length > 0) {
                if (poll[0].votes > 0) {
                    highest.push(poll[0]);
                    for (var i = 1; i < poll.length; i++) {
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
                                client.channels.cache.get(process.env.CHANNELID).send(`<@${playerData[j].playerID}> has recieved an extra point with ${highest[i].votes} votes!`);
                            }
                        }
                    }
                }
            }

            fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));

            if (playerData[0].amount_alive < playerData[0].max_alive) {
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
                        .setLabel(playerData[i].playerUser)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(currPlayer.id);

                        buttons.push(button);
                    }
                }

                var rows = [];
                var tempArr = [];

                for (var i = 0; i < buttons.length; i++) {
                    tempArr.push(buttons[i]);

                    if ((i + 1) % 4 == 0) {
                        const tempRow = new ActionRowBuilder()
                        .addComponents(tempArr);

                        rows.push(tempRow);
                        tempArr = [];
                    }
                }

                if (tempArr.length >= 1) {
                    const tempRow = new ActionRowBuilder()
                    .addComponents(tempArr)
                    rows.push(tempRow);
                    tempArr = [];
                }

                fs.writeFileSync(`${__dirname}\\commands\\votes.json`, JSON.stringify(newPoll));

                client.channels.cache.get(process.env.DEADCHANNELID).send({
                    content: '<@&1190234100137742386> Vote for who you want to recieve an extra point tomorrow.\n',
                    components: rows
                });
            }

            for (const response of sseResponse) {
                await sendData(response, JSON.stringify(playerData));
            }
        }
    }
    else {
        pointsGiven = false;
    }
}

setInterval(GivePoints, 600000);

client.login(process.env.DISCORD);