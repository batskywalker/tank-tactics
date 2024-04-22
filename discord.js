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
var poll = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\votes.json`, 'utf-8'));
var bountyPoints = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\bounty-points.json`, 'utf-8'));
var bounties = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\bounties.json`, 'utf-8'));

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
            if (playerData.data.started) {
                var playerArray = [];
                Object.keys(playerData).forEach(async player => {
                    playerArray.push(playerData[player]);
                });

                for (const response of sseResponse) {
                    await sendData(response, JSON.stringify(playerArray));
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

if (playerData.data.started) {
    var playerArray = [];
    Object.keys(playerData).forEach(async player => {
        playerArray.push(playerData[player]);
    });

    for (const response of sseResponse) {
        await sendData(response, JSON.stringify(playerArray));
    }
}

async function EndGame() {
    var temp = playerData.data;
    temp.amount_alive = 0;
    temp.max_alive = 0;
    var guild = client.guilds.cache.get('1184701532822851655');
    await guild.members.fetch().then(users => {
        users.forEach(async theUser => {
            if (playerData[theUser.user.id].alive) {
                theUser.roles.remove('1190233509172891708');
            }
            else {
                theUser.roles.remove('1190234100137742386');
            }
        });
    });

    playerData = {
        data: temp
    };
    actionQueue = [];
    poll = []
    fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));
    fs.writeFileSync(`${__dirname}\\commands\\action-queue.json`, JSON.stringify(actionQueue));
    fs.writeFileSync(`${__dirname}\\commands\\votes.json`, JSON.stringify(poll));
}

async function Deadify(userID) {
    var guild = client.guilds.cache.get('1184701532822851655');
    await guild.members.fetch().then(users => {
        users.forEach(async theUser => {
            if (userID == theUser.user.id) {
                theUser.roles.add('1190234100137742386');
            }
        });
    });
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

            if (tempData.length > 0) {
                for (var i = 0; i < tempData.length; i++) {
                    if (!tempData[i].alive) {
                        await Deadify(tempData[i].playerID);
                    }
                }
            }

            if (!playerData.data.started && playerData.data.amount_alive < playerData.data.max_alive) {
                EndGame();
            }
        }
    }
    catch (error) {
        console.log(error);
    }
}

// Reset a players icon in the game
client.on("messageCreate", async (msg) => {
    if (msg.content.toLowerCase().startsWith(".get") && msg.channel.id == "1198525372334080020") {

        playerData = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\player-data.json`, 'utf-8'));
        var guild = client.guilds.cache.get('1184701532822851655');
        
        await guild.members.fetch().then(users => {
            users.forEach(async theUser => {

                //Check the users id to the id submitted through the text
                if (theUser.user.id === msg.content.slice(5)) {
                    if (playerData[theUser.user.id].playerID) {

                        // Set the icon
                        playerData[theUser.user.id].icon = theUser.user.avatar;
                        fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));

                        // Send the new avatar to the site
                        for (const response of sseResponse) {
                            await sendData(response, JSON.stringify(playerData[theUser.user.id]));
                        }
                    }
                }
            });
        });
    }
})

client.on(Events.InteractionCreate, async interaction => {
    var player = interaction.user.id;
    if (interaction.isChatInputCommand()) {
        if (playerData.data.started) {
            var shortInteraction = {};

            if (!playerData[player]) {
                await interaction.reply({
                    content: "You're not in the game.",
                    ephemeral: true
                });
                console.log(interaction);
                return;
                
            }

            if (!playerData[player].alive) {
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

            if (!actionQueue[playerData[player].queue]) {
                var tempArray = [shortInteraction];
                await actionQueue.push(tempArray);
            }
            else {
                await actionQueue[playerData[player].queue].push(shortInteraction);
            }

            playerData[player].queue += 1;

            await interaction.reply({
                content: 'Action submitted.',
                ephemeral: true
            });

            fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));
            fs.writeFileSync(`${__dirname}\\commands\\action-queue.json`, JSON.stringify(actionQueue));
        }
        else {
            console.log(interaction);
            console.log(interaction.options);
            await ExecuteCommand(interaction);
        }
    }
    else if (interaction.isButton()) {
        const button = interaction.component.customId;
        poll = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\votes.json`, 'utf-8'));
        if (playerData[player]) {
            if (!playerData[player].voted) {
                if (playerData[player].votedFor == interaction.component.customId) {
                    interaction.reply({
                        content: "You voted for that player yesterday, please change your vote.",
                        ephemeral: true
                    });
                    return;
                }

                poll[button].votes += 1;
                playerData[player].voted = true;
                playerData[player].votedFor = interaction.component.customId;

                // Sort list of votees by most votes
                /*for (var k = j; k > 0; k--) {
                    if (poll[k].votes > poll[k - 1].votes) {
                        var temp1 = poll[k - 1];
                        var temp2 = poll[k];

                        poll[k - 1] = temp2;
                        poll[k] = temp1;
                    }
                    else {
                        break;
                    }
                }*/

                interaction.reply({
                    content: 'Thanks for voting!',
                    ephemeral: true
                });

                fs.writeFileSync(`${__dirname}\\commands\\votes.json`, JSON.stringify(poll));
                fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));
            }
            else {
                interaction.reply({
                    content: "You've already voted",
                    ephemeral: true
                });
            }
        }
        else {
            interaction.reply({
                content: "You're not in the game.",
                ephemeral: true
            });
        }
    }
});

var pointsGiven = false;

async function GivePoints() {
    var theDate = new Date;

    // Check that the game is running and if its noon
    if (theDate.getHours() == 12 && playerData.data.started) {
        if (!pointsGiven) { // The points haven't been given yet
            pointsGiven = true;
            actionQueue = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\action-queue.json`, 'utf-8'));

            // Execute all commands in the queue
            for (var i = 0; i < actionQueue.length; i++) {
                for (var j = 0; j < actionQueue[i].length; j++) {
                    await ExecuteCommand(actionQueue[i][j]);
                }
            }

            // Reset the queue
            actionQueue = [];
            fs.writeFileSync(`${__dirname}\\commands\\action-queue.json`, JSON.stringify(actionQueue));

            Object.keys(playerData).forEach(async player => {
                // Blow up all hit dead players
                const currPos = playerData[player].pos;
                const currRange = playerData[player].shots;

                if (playerData[player].shown && !playerData[player].alive && playerData[player].shots > 0) {
                    Object.keys(playerData).forEach(async target => {
                        const targPos = playerData[target].pos;

                        if (playerData[target].alive && (targPos.x >= currPos.x - currRange && targPos.x <= currPos.x + currRange) && (targPos.y >= currPos.y - currRange && targPos.y <= currPos.y + currRange)) {
                            playerData[target].health--;

                            if (playerData[target].health <= 0) {
                                playerData[target].alive = false;
                                await Deadify(playerData[target].playerID);
                                playerData.data.amount_alive--;

                                client.channels.cache.get(process.env.CHANNELID).send(`<@${playerData[target].playerID}> got blown up by the wreckage of <@${playerData[player].playerID}>!\n${playerData.data.amount_alive} players left!`);
                            }
                            else {
                                client.channels.cache.get(process.env.CHANNELID).send(`<@${playerData[target].playerID}> got damaged by the wreckage of <@${playerData[player].playerID}>!`);
                            }
                        }
                    });

                    playerData[player].shown = false;
                }

                //add actions and reset player data
                if (playerData[player].alive) {
                    playerData[player].action++;
                }
                else {
                    if (!playerData[player].voted) {
                        playerData[player].votedFor = null;
                    }
                }

                playerData[player].queue = 0;
                playerData[player].voted = false;
            });

            if (playerData.data.amount_alive == 1) {
                Object.keys(playerData).forEach(async player => {
                    if (playerData[player].alive) {
                        client.channels.cache.get(process.env.CHANNELID).send(`<@${playerData[player].playerID}> HAS WON THE GAME!`);
                    }
                });
                EndGame();
                return;
            }
            else if (playerData.data.amount_alive == 0) {
                client.channels.cache.get(process.env.CHANNELID).send(`NO PLAYERS WERE LEFT ALIVE, ITS A TIE GAME!`);
                EndGame();
                return;
            }
            
            client.channels.cache.get(process.env.CHANNELID).send('<@&1190233509172891708>\nEveryone has received an action point!');

            poll = await JSON.parse(fs.readFileSync(`${__dirname}\\commands\\votes.json`, 'utf-8'));
            //const highest = [];

            if (playerData.data.amount_alive < playerData.data.max_alive && Object.keys(poll).length > 0) {
                /*if (poll[0].votes > 0) {
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
                }*/
                var votePool = [];
                var maxVotes = 0;

                Object.keys(playerData).forEach(async votee => {
                    if (poll[votee].votes) {
                        for (var j = 0; j < poll[votee].votes; j++) {
                            votePool.push(poll[votee]);
                            maxVotes++;
                        }
                    }
                });

                var random = Math.floor(Math.random() * maxVotes);
            
                var isGood = true;

                while(isGood) {
                    if (votePool[random] && !playerData[votePool[random].id].alive) {
                        isGood = false;
                        var percent = (votePool[random].votes / maxVotes) * 100;

                        playerData[votePool[random].id].action += 1;
                        client.channels.cache.get(process.env.CHANNELID).send(`With a ${percent.toFixed(1)}% chance of winning, <@${playerData[votePool[random].id].playerID}> has received an extra point!`);
                    }
                    else {
                        random = Math.floor(Math.random() * maxVotes);
                                
                        break;
                    }
                }
            }

            fs.writeFileSync(`${__dirname}\\commands\\player-data.json`, JSON.stringify(playerData));

            if (playerData.data.amount_alive < playerData.data.max_alive) {
                var buttons = [];
                var newPoll = [];
                
                Object.keys(playerData).forEach(async player => {
                    if (playerData[player].alive) {
                        const currPlayer = {
                            id: playerData[player].playerID,
                            username: playerData[player].user,
                            votes: 1
                        };

                        newPoll[playerData[player].playerID] = currPlayer;

                        const button = new ButtonBuilder()
                        .setLabel(playerData[player].playerUser)
                        .setStyle(ButtonStyle.Secondary)
                        .setCustomId(currPlayer.id);

                        buttons.push(button);
                    }
                });

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
                    content: '<@&1190234100137742386> Vote for who you want to receive an extra point tomorrow.\n',
                    components: rows
                });
            }

            var playerArray = [];
            Object.keys(playerData).forEach(async player => {
                playerArray.push(playerData[player]);
            });

            for (const response of sseResponse) {
                await sendData(response, JSON.stringify(playerArray));
            }
        }
    }
    else {
        pointsGiven = false;
    }
}

setInterval(GivePoints, 600000);

client.login(process.env.DISCORD);