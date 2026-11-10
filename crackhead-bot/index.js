require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const db = require('./database'); // Laadt je SQLite database in

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', async () => {
    console.log(`Ingelogd als ${client.user.tag}!`);

    const channelId = '1569634733002985546';
    
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            channel.send('Yo stelletje randdebielen, ik ben gekomen voor mijn kleine schatje emile MUAHUAHAUH **Crackhead Deluxe** is online en klaar om jullie brein te slopen met trivia! 🧠💥');
        }
    } catch (error) {
        console.error('Kon het kanaal niet vinden:', error);
    }
});

client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.reply('Pong! 🏓');
    }
});

// Log in via de beveiligde environment variabele uit je .env bestand
client.login(process.env.DISCORD_TOKEN);