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
    const minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
    ampm = d.getHours() >= 12 ? 'PM' : 'AM',
    months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Fridar','Saturday'];
    return {
        day: days[d.getDay()],
        month: months[d.getMonth()],
        date: d.getDate(),
        year: d.getFullYear(),
        hours: hours%12 == 0 ? 12 : hours%12,
        minutes: minutes,
        ampm: ampm
    };
};
const holidays = { // Values are formatted as month,week,day,*date
    "New Year": [0,0,0],
    "Martin Luther King": [0,2,1],
    "Valentine's Day": [1,0,0,13],
    "Washington's Birthday": [1,2,1],
    "Saint Patrick's Day": [2,0,0,16],
    "Fools' Day": [3,0,0],
    "Mother's Day": [4,1,0],
    "Memorial Day": [4,-1,0],
    "Father's Day": [5,2,0],
    "Independence Day": [6,0,0,3],
    "Labor Day": [8,0,1],
    "Halloween": [9,0,0,30],
    "Veterans Day": [10,0,0,10],
    "Thanksgiving day": [10,3,4],
    "Black Friday": [10,4,5],
    "Easter": [10,4,7],
    "Christmas Eve": [11,0,0,23],
    "Christmas": [11,0,0,24],
    "New Year's Eve": [11,-1,6],
};


let contexts = [];
client.on('message', message => {
    const prefixes = [`<@${client.user.id}> `, process.env.PREFIX, 'friday', 'ok friday', 'hey friday'];
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
                        res = typeof value == 'function' ? value(q[i]) : value;
                    }
                }
            };
            a('date.between', function() {return timediff(args.date1, args.date2, args.unit[0].toUpperCase())[args.unit+'s']+` ${args.unit}s`});
            a(['date.check', 'date.check - context:date-check', 'date.day_of_week', 'date.day_of_week.check', 'date.get', 'date.get - context:date-get'], async function(q) {
                const location = typeof args.location != 'object' ? (args.location || 'Chicago') : (args.location.country || args.location.city || 'Chicago');
                const id = await tz.getTimeZone(location);
                const zone = findTimeZone(id);
                const d = getZonedTime(new Date(), zone);
                const t = formatDate(new Date(d.year, d.month, d.day));
                contexts = [];
                contexts.push({
                    name: q,
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
            a('date.holiday', function() {
                let holiday = holidays[args.holiday],
                firstDay = 1,
                year = new Date(args.date.startDate).getFullYear() || new Date().getFullYear(),
                month = holiday[0],
                week = holiday[1],
                day = holiday[2],
                d = holiday[3]
                t = formatDate(new Date());
                if (d) {
                    t = formatDate(new Date(year, month, d+1));
                }  else {
                    if (week < 0) {
                        month++;
                        firstDay--;
                    }
                    let date = new Date(year, month, (week * 7) + firstDay);
                    if (day < date.getDay()) {
                        day += 7;
                    }
                    date.setDate(date.getDate() - date.getDay() + day);
                    t = formatDate(date);
                }
                return {embed: {
                    color: 0xff6300,
                    // title: args.holiday,
                    fields: [{
                        name: `${t.day}, ${t.month} ${t.date}`,
                        value: `${args.holiday} ${t.year}`
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
});

client.login(process.env.DISCORD_TOKEN);
