const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', async () => {
    console.log(`Ingelogd als ${client.user.tag}!`);

    // Zet hier het ID van het kanaal waar je het bericht wilt sturen
    const channelId = '1569634733002985546';
    
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) {
            channel.send('Yo stelletje randdebielen, **Crackhead Deluxe** is online en klaar om jullie brein te slopen met trivia! 🧠💥');
        }
    } catch (error) {
        console.error('Kon het kanaal niet vinden:', error);
    }
});

// Je simpele ping commando blijft gewoon werken
client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.reply('Pong! 🏓');
    }
});

client.login('MTU2OTYzMzUwNTEyODc0MjkxNA.GFgW_C.hhZnXG2-vtzB4EALWb5So3KECSxOeNYuojqgLE');