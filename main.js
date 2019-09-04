require('dotenv').config();
const apiaiApp = require('apiai')(process.env.AI_TOKEN);
const Discord = require('discord.js');
const client = new Discord.Client();
const id = require('./restart.json');
client.on('ready', function (evt) {
    console.log(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`);
    client.user.setActivity('Female Replacement Intelligent Digital Assistant Youth');
    if (id.id == '618571488697647127') client.users.get('359988404316012547').send('Restarted!');
    else client.channels.find(x => x.id === id.id).send('Restarted!');
});

const timediff = require('timediff');
const tz = require('timezone-id');
const { listTimeZones, findTimeZone, getZonedTime, getUnixTime } = require('timezone-support');


const formatDate = function(d) {
    const minutes = d.minutes.toString().length == 1 ? '0'+d.minutes : d.minutes,
    hours = d.hours.toString().length == 1 ? '0'+d.hours : d.hours,
    ampm = d.hours >= 12 ? 'PM' : 'AM',
    months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return {
        day: days[d.day],
        month: months[d.month],
        date: d.dayOfWeek,
        year: d.year,
        hours: hours%12,
        minutes: minutes,
        ampm: ampm
    };
};

let contexts = [];
client.on('message', message => {
    const prefixes = [`<@${client.user.id}> `, process.env.prefix, 'friday', 'ok friday', 'hey friday'];
    if (message.author.bot) return;
    let prefix = false;
    for (const i of prefixes) {
        if (message.content.toLowerCase().startsWith(i)) prefix = i;
    }
    if (prefix == process.env.PREFIX) {
        if (message.author.id === '359988404316012547') {
            try {
                let args = message.content.slice(prefix.length).trim().split(/ +/g),
                command = args.shift().toLowerCase(),
                commandFile = require(`./commands/${command}.js`);
                commandFile(client, message, args);
            } catch(e) {
                message.channel.send(e.message);
            }
        }
        return;
    }
    if (message.content.toLowerCase().indexOf(prefix) !== 0 && message.channel.type !== 'dm') return;
    message.channel.startTyping();
try {
    let text = message.content.substring(prefix.length);
    let request = apiaiApp.textRequest(text, {
        sessionId: message.author.id,
        contexts: contexts
    });
    request.on('response', async response => {
        message.channel.stopTyping();
        let args = response.result.parameters, text = response.result.fulfillment.speech, res = '';
        if (text == 'code') {
            let a = async function(q, value) {
                if (typeof q != 'object') q = [q];
                for (let i = 0; i < q.length; i ++) {
                    if (response.result.metadata.intentName == q[i]) {
                        res = typeof value == 'function' ? value() : value;
                    }
                }
            };
            a('date.between', function() {return timediff(args.date1, args.date2, args.unit[0].toUpperCase())[args.unit+'s']+` ${args.unit}s`});
            a(['date.check', 'date.check - context:date-check', 'date.day_of_week'], async function() {
                const location = typeof args.location == 'string' ? args.location : args.location.country || args.location.city;
                const id = await tz.getTimeZone(location);
                const zone = findTimeZone(id);
                const t = formatDate(getZonedTime(new Date(), zone));
                contexts.push({
                    name: 'date.check',
                    parameters: args
                });
                return {embed: {
                    color: 0xff6300,
                    title: `Time in ${location}`,
                    fields: [{
                        name: `${t.hours}:${t.minutes} ${t.ampm}`,
                        value: `${t.day}, ${t.month} ${t.date}, ${t.year}`
                    }]
                }};
            });
        } else res = text;
        message.channel.send(await res);
    });
    request.on('error', (e) => {
        message.channel.stopTyping();
        if (message.author.id === "359988404316012547") message.reply(e.message);
        else message.channel.send("Oops, there was an error on our end.");
    });
    request.end();
} catch(e) {
    if (message.author.id === "359988404316012547") message.reply(e.message);
    else message.channel.send("Oops, there was an error on our end.");
}
});

client.login(process.env.DISCORD_TOKEN);
