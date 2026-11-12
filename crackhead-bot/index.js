require('dotenv').config();
const { Client, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
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

    // Registreer het /leaderboard commando automatisch bij het opstarten
    const leaderboardCommand = new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Bekijk de top scores van Crackhead Deluxe!');

    try {
        await client.application.commands.create(leaderboardCommand);
        console.log('Slash-command /leaderboard geregistreerd! 🏆');
    } catch (error) {
        console.error('Fout bij registreren slash-command:', error);
    }

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

// Simpele ping commando
client.on('messageCreate', message => {
    if (message.content === '!ping') {
        message.reply('ik haat je STOP MET PINGEN');
    }
});

// Slash-command afhandeling voor /leaderboard
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'leaderboard') {
        db.all(`SELECT username, points FROM scores ORDER BY points DESC LIMIT 10`, async (err, rows) => {
            if (err) {
                console.error('Fout bij ophalen leaderboard:', err);
                return interaction.reply({ content: 'Oeps, kon het leaderboard niet laden!', ephemeral: true });
            }

            if (rows.length === 0) {
                return interaction.reply('Er staan nog geen scores in de database!');
            }

            let leaderboardText = '';
            rows.forEach((row, index) => {
                let medal = '';
                if (index === 0) medal = '🥇';
                else if (index === 1) medal = '🥈';
                else if (index === 2) medal = '🥉';
                else medal = `\`${index + 1}.\``;

                leaderboardText += `${medal} **${row.username}** — *${row.points} punten*\n`;
            });

            await interaction.reply({
                content: `🏆 **CRACKHEAD DELUXE - LEADERBOARD** 🏆\n\n${leaderboardText}`
            });
        });
    }
});

// Vragenlijst: antwoord altijd in kleine letters
const vragen = [
    { vraag: 'Wat is de hoofdstad van Frankrijk?', antwoord: 'parijs' },
    { vraag: 'Hoeveel poten heeft een spin?', antwoord: '8' },
    { vraag: 'Welke kleur krijg je als je blauw en geel mengt?', antwoord: 'groen' },
    { vraag: 'Hoe heet de hoofdstad van Nederland?', antwoord: 'amsterdam' },
    { vraag: 'Hoeveel dagen heeft een week?', antwoord: '7' },
    { vraag: 'Wat is de grootste planeet in ons zonnestelsel?', antwoord: 'jupiter' },
    { vraag: 'Wat is de hoofdstad van Italië?', antwoord: 'rome' },
    { vraag: 'Hoeveel continenten zijn er op aarde?', antwoord: '7' },
    { vraag: 'Wat is de langste rivier ter wereld?', antwoord: 'nijl' },
    { vraag: 'Welke planeet staat bekend als de rode planeet?', antwoord: 'mars' },
    { vraag: 'Wat is de hoofdstad van Spanje?', antwoord: 'madrid' },
    { vraag: 'Hoeveel tanden heeft een volwassen mens gemiddeld?', antwoord: '32' },
    { vraag: 'Wat is de grootste oceaan ter wereld?', antwoord: 'stille oceaan' },
    { vraag: 'Welke planeet staat het dichtst bij de zon?', antwoord: 'mercurius' },
    { vraag: 'Welke dubbel moet je gooien in darts als je 32 scoren over hebt?', antwoord: 'dubbel 16' },
];

// Normale trivia vraag: !vraag
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content !== '!vraag') return;

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

// Winstreak quiz: !streakvraag
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

        if (winnaar.id === streakUserId) {
            streakAantal++;
        } else {
            streakUserId = winnaar.id;
            streakAantal = 1;
        }

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

// Log in via de beveiligde environment variabele uit je .env bestand
client.login(process.env.DISCORD_TOKEN);