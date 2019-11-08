require('dotenv').config();
require('datejs');

const apiaiApp = require('apiai')(process.env.AI_TOKEN),
Discord = require('discord.js'),
client = new Discord.Client(),
fs = require('fs'),
db = require('./database.js'),
alarm = require('./tools/alarm.js');


const holidays = { // Values are formatted as month,week,day,*date
    "new year": [0,0,0],
    "martin luther king": [0,2,1],
    "valentine's day": [1,0,0,13],
    "washington's birthday": [1,2,1],
    "saint patrick's day": [2,0,0,16],
    "fools' day": [3,0,0],
    "mother's day": [4,1,0],
    "memorial day": [4,-1,0],
    "father's day": [5,2,0],
    "independence day": [6,0,0,3],
    "labor day": [8,0,1],
    "halloween": [9,0,0,30],
    "veterans day": [10,0,0,10],
    "thanksgiving day": [10,3,4],
    "black friday": [10,4,5],
    "easter": [10,4,7],
    "christmas eve": [11,0,0,23],
    "christmas": [11,0,0,24],
    "new year's eve": [11,-1,6],
};
const { listTimeZones, findTimeZone, getZonedTime, getUnixTime } = require('timezone-support');
client.color = parseInt(process.env.COLOR, 16);
client.timediff = require('timediff');
client.cityTimezones = require('city-timezones');
client.findTimeZone = findTimeZone;
client.getZonedTime = getZonedTime;

client.formatDate = function(d) {
    const minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
    ampm = d.getHours() >= 12 ? 'PM' : 'AM',
    months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
    days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
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
client.getHoliday = function(args, holiday, year) {
    holiday = holidays[holiday.toLowerCase()];
    if (!holiday) return 0;
    year = year || new Date(args.date ? args.date.startDate : Date.now()).getFullYear() || new Date().getFullYear();
    let firstDay = 1,
    month = holiday[0],
    week = holiday[1],
    day = holiday[2],
    d = holiday[3]
    t = new Date();
    if (d) {
        t = new Date(year, month, d+1);
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
        t = date;
    }
    return t;
};


client.on('ready', async (evt) => {
    await db.alarms.defer;

    console.log(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`);
    client.user.setActivity('Female Replacement Intelligent Digital Assistant Youth');

    alarm.init(client);
});

let contexts = [{name: '', parameters: {}}];
client.on('message', message => {
    let owner = false;
    if (~['621491278785282059', '359988404316012547'].indexOf(message.author.id)) owner = true;

    const prefixes = [`<@${client.user.id}> `, process.env.PREFIX, 'friday', 'ok friday', 'hey friday'];
    if (message.author.bot) return;
    let prefix = false;
    for (const i of prefixes) {
        if (message.content.toLowerCase().startsWith(i)) prefix = i;
    }
    if (prefix == process.env.PREFIX) {
        if (owner) {
            try {
                let args = message.content.slice(prefix.length).trim().split(/ +/g),
                command = args.shift().toLowerCase(),
                commandFile = require(`./commands/${command}.js`);
                commandFile(client, message, args);
            } catch(e) {
                message.channel.send(e.message || e);
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
        let args = response.result.parameters, txt = response.result.fulfillment.speech, intent = response.result.action;
        if (txt == 'code') {
            const alias = (cmd, aliases) => {
                if (~aliases.indexOf(intent) && intent) {
                    intent = cmd;
                }
            }
            alias('date.check', ['date.day_of_week', 'date.day_of_week.check', 'date.get', 'date.month.check', 'date.month.get', 'date.year.check', 'date.year.get', 'time.time_zones', 'time.get', 'time.check']);
            alias('date.holiday', 'date.holiday.check');
            intentFile = require(`./intents/${intent}.js`);
            intentFile(client, message, args);
        } else message.channel.send(txt);
        contexts.push({
            name: response.result.action,
            parameters: response.result.parameters
        });
    });
    request.on('error', (e) => {
        message.channel.stopTyping();
        if (owner) message.reply(e.message || e);
        else message.channel.send('Oops, there was an error on our end.');
    });
    request.end();
});

client.login(process.env.DISCORD_TOKEN);
