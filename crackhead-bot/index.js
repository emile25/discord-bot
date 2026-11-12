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
            channel.send('Yo  **Crackhead Deluxe** is online en klaar om jullie brein te slopen met trivia! 🧠💥');
        }
    } catch (error) {
        console.error('Kon het kanaal niet vinden:', error);
    }
});

client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.reply('ik haat je STOP MET PINGEN');
    }
});

// Log in via de beveiligde environment variabele uit je .env bestand
client.login(process.env.DISCORD_TOKEN);






// Vragenlijst: antwoord altijd in kleine letters
const vragen = [
    { vraag: 'Wat is de hoofdstad van Frankrijk?', antwoord: 'parijs' },
    { vraag: 'Hoeveel poten heeft een spin?', antwoord: '8' },
    { vraag: 'Welke kleur krijg je als je blauw en geel mengt?', antwoord: 'groen' },
    { vraag: 'Hoe heet de hoofdstad van Nederland?', antwoord: 'amsterdam' },
    { vraag: 'Hoeveel dagen heeft een week?', antwoord: '7' },
    {vraag: 'Wat is de grootste planeet in ons zonnestelsel?', antwoord: 'jupiter' },
    {vraag: 'Wat is de hoofdstad van Italië?', antwoord: 'rome' },
    {vraag: 'Hoeveel continenten zijn er op aarde?', antwoord: '7' },
    {vraag: 'Wat is de langste rivier ter wereld?', antwoord: 'nijl' },
    {vraag: 'Welke planeet staat bekend als de rode planeet?', antwoord: 'mars' },
    {vraag: 'Wat is de hoofdstad van Spanje?', antwoord: 'madrid' },
    {vraag: 'Hoeveel tanden heeft een volwassen mens gemiddeld?', antwoord: '32' },
    {vraag: 'Wat is de grootste oceaan ter wereld?', antwoord: 'stille oceaan' },
    {vraag: 'Welke planeet staat het dichtst bij de zon?', antwoord: 'mercurius' },
    {vraag: 'Welke dubbel moet je gooien in darts als je 32 scoren over hebt?', antwoord: 'dubbel 16' },
    
];

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content !== '!vraag') return;

    // Kies een willekeurige vraag
    const gekozen = vragen[Math.floor(Math.random() * vragen.length)];
    await message.channel.send(`🧠 **Vraag:** ${gekozen.vraag}\nJullie hebben 15 seconden!`);

    // Alleen een goed antwoord van een echte gebruiker telt
    const filter = (m) =>
        !m.author.bot && m.content.trim().toLowerCase() === gekozen.antwoord;

    try {
        const verzameld = await message.channel.awaitMessages({
            filter,
            max: 1,
            time: 15000,
            errors: ['time']
        });

        const winnaar = verzameld.first().author;

        // 10 punten opslaan in de database
        db.run(
            `INSERT INTO scores (userId, username, points) VALUES (?, ?, ?)
             ON CONFLICT(userId) DO UPDATE SET
                 username = excluded.username,
                 points = points + excluded.points`,
            [winnaar.id, winnaar.username, 10]
        );

        message.channel.send(`✅ **${winnaar.username}** heeft het goed! +10 punten`);
    } catch (error) {
        message.channel.send(`⏰ Tijd is om! Het antwoord was: **${gekozen.antwoord}**`);
    }
});




// ---- Aparte quiz met winstreak: !streakvraag ----
// Gebruikt de lijst "vragen" van het !vraag-blok hierboven. Die lijst mag je niet weghalen.

let streakUserId = null;
let streakAantal = 2;
let streakVraagBezig = false;

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content !== '!streakvraag') return;

    if (streakVraagBezig) {
        return message.reply('Er loopt al een vraag, beantwoord die eerst!');
    }
    streakVraagBezig = true;

    const gekozen = vragen[Math.floor(Math.random() * vragen.length)];
    await message.channel.send(`🧠 **Vraag:** ${gekozen.vraag}\nJullie hebben 15 seconden!`);

    const filter = (m) =>
        !m.author.bot && m.content.trim().toLowerCase() === gekozen.antwoord;

    try {
        const verzameld = await message.channel.awaitMessages({
            filter,
            max: 1,
            time: 15000,
            errors: ['time']
        });

        const winnaar = verzameld.first().author;

        // Zelfde winnaar als vorige keer: streak omhoog, anders opnieuw beginnen
        if (winnaar.id === streakUserId) {
            streakAantal++;
        } else {
            streakUserId = winnaar.id;
            streakAantal = 1;
        }

        // 10 punten, plus 5 extra voor elke vraag die je al achter elkaar goed had
        const bonus = (streakAantal - 1) * 5;
        const punten = 10 + bonus;

        db.run(
            `INSERT INTO scores (userId, username, points) VALUES (?, ?, ?)
             ON CONFLICT(userId) DO UPDATE SET
                 username = excluded.username,
                 points = points + excluded.points`,
            [winnaar.id, winnaar.username, punten]
        );

        let tekst = `✅ **${winnaar.username}** heeft het goed! +${punten} punten`;
        if (streakAantal > 1) {
            tekst += `\n🔥 Winstreak van ${streakAantal}! (+${bonus} bonus)`;
        }
        message.channel.send(tekst);
    } catch (error) {
        streakUserId = null;
        streakAantal = 0;
        message.channel.send(`⏰ Tijd is om! Het antwoord was: **${gekozen.antwoord}**`);
    } finally {
        streakVraagBezig = false;
    }
});