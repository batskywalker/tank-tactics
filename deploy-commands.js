import 'dotenv/config';
import { REST, Routes } from 'discord.js';
const discord = process.env.DISCORD;
const theClientId = process.env.CLIENTID;
const theGuildId = process.env.GUILDID;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = [];
// Grab all the command files from the commands directory you created earlier

const commandFiles = fs.readdirSync(`${__dirname}\\commands\\`).filter(file => file.endsWith('.js'));
// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
for (const file of commandFiles) {
    const command = await import(`file://${__dirname}\\commands\\${file}`);
    if ('data' in command.default && 'execute' in command.default) {
        commands.push(command.default.data.toJSON());
    } else {
        console.log(`[WARNING] The command at ${`${__dirname}\\commands\\${file}`} is missing a required "data" or "execute" property.`);
    }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(discord);

// and deploy your commands!
(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(theClientId, theGuildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();