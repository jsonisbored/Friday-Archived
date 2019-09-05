require('dotenv').config();
const apiaiApp = require('apiai')(process.env.AI_TOKEN),
Discord = require('discord.js'),
Enmap = require("enmap"),
client = new Discord.Client(),
id = require('./restart.json');
client.settings = new Enmap({
    name: "settings",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});
client.on('ready', function (evt) {
    console.log(`Ready to serve on ${client.guilds.size} servers, for ${client.users.size} users.`);
    client.user.setActivity('Female Replacement Intelligent Digital Assistant Youth');
    if (id.id == '618571488697647127') client.users.get('359988404316012547').send('Restarted!');
    else client.channels.find(x => x.id === id.id).send('Restarted!');
});


const timediff = require('timediff'),
tz = require('timezone-id'),
{ listTimeZones, findTimeZone, getZonedTime, getUnixTime } = require('timezone-support'),

formatDate = function(d) {
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
},
holidays = { // Values are formatted as month,week,day,*date
    "new year": [0,0,0],
    "martin luther ling": [0,2,1],
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
},
getHoliday = function(args, holiday, year) {
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
        contexts.push({
            name: response.result.action,
            parameters: response.result.parameters
        });
        console.log(response);
        message.channel.stopTyping();
        let args = response.result.parameters, text = response.result.fulfillment.speech, res = '';
        if (text == 'code') {
            let a = async function(q, value) {
                if (typeof q != 'object') q = [q];
                for (let i = 0; i < q.length; i ++) {
                    if (response.result.action == q[i]) {
                        res = typeof value == 'function' ? value(q[i]) : value;
                    }
                }
            };
            a('date.between', function() {
                const d1 = formatDate(new Date(args.date1)), d2 = formatDate(new Date(args.date2));
                return {embed: {
                    color: parseInt(process.env.COLOR, 16),
                    fields: [{
                        name: timediff(args.date1, args.date2, args.unit[0].toUpperCase())[args.unit+'s']+` ${args.unit}s`,
                        value: `${d1.month} ${d1.date}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
                    }]
                }};
            });
            a(['date.check', 'date.day_of_week', 'date.day_of_week.check', 'date.get', 'date.month.check', 'date.month.get', 'date.year.check', 'date.year.get', 'time.time_zones', 'time.get', 'time.check'], async function(q) {
                const location = typeof args.location != 'object' ? (args.location || 'Chicago') : (args.location.country || args.location.city || 'Chicago'),
                id = await tz.getTimeZone(location),
                zone = findTimeZone(id),
                d = getZonedTime(new Date(), zone),
                t = formatDate(new Date(d.year, d.month, d.day, d.hours, d.minutes, d.seconds));
                return {embed: {
                    color: parseInt(process.env.COLOR, 16),
                    title: `Time in ${location}`,
                    fields: [{
                        name: `${t.hours}:${t.minutes} ${t.ampm}`,
                        value: `${t.day}, ${t.month} ${t.date}, ${t.year}`
                    }]
                }};
            });
            a(['date.holiday', 'date.holiday.check'], function() {
                const h = getHoliday(args, args.holiday);
                if (!h) return `Unkown holiday, ${args.holiday}.`;
                const t = formatDate(h);
                return {embed: {
                    color: parseInt(process.env.COLOR, 16),
                    fields: [{
                        name: `${t.day}, ${t.month} ${t.date}`,
                        value: `${args.holiday} ${t.year}`
                    }]
                }};
            });
            a('date.holiday.between', function() {
                const h1 = getHoliday(args, args.holiday1),
                h2 = getHoliday(args, args.holiday2);
                if (!h1 || !h2) return `Unkown holiday, ${!h1 ? args.holiday1 : args.holiday2}.`;
                if (h1.getTime() > h1.getTime()) {
                    let h3 = h1.getTime();
                    h1 = new Date(h2.getTime());
                    h2 = new Date(h3.getTime());
                }
                let d1 = formatDate(h1), d2 = formatDate(h2);
                return {embed: {
                    color: parseInt(process.env.COLOR, 16),
                    fields: [{
                        name: Math.abs(timediff(h1, h2, args.unit[0].toUpperCase())[args.unit+'s'])+` ${args.unit}s`,
                        value: `${d1.month} ${d1.date}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
                    }]
                }};
            });
            a('date.holiday.since', function() {
                let h1 = getHoliday(args, args.holiday),
                h2 = new Date();
                if (!h1) return `Unkown holiday, ${args.holiday1}.`;
                if (h1.getTime() > h2.getTime()) {
                    h1 = getHoliday(args, args.holiday, new Date().getFullYear()-1);
                }
                let d1 = formatDate(h1), d2 = formatDate(h2);
                return {embed: {
                    color: parseInt(process.env.COLOR, 16),
                    fields: [{
                        name: `${Math.abs(timediff(h2, h1, args.unit[0].toUpperCase())[args.unit+'s'])} ${args.unit}s`,
                        value: `${d1.month} ${d1.date}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
                    }]
                }};
            });
            a('date.holiday.until', function() {
                let h1 = getHoliday(args, args.holiday),
                h2 = new Date();
                if (!h1) return `Unkown holiday, ${args.holiday1}.`;
                if (h1.getTime() < h2.getTime()) {
                    h1 = getHoliday(args, args.holiday, new Date().getFullYear()+1);
                }
                let d1 = formatDate(h2), d2 = formatDate(h1);
                return {embed: {
                    color: parseInt(process.env.COLOR, 16),
                    fields: [{
                        name: `${Math.abs(timediff(h2, h1, args.unit[0].toUpperCase())[args.unit+'s'])+1} ${args.unit}s`,
                        value: `${d1.month} ${d1.date}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
                    }]
                }};
            });
            a('date.since', function() {
                let h1 = new Date(args.date),
                h2 = new Date();
                if (h1.getTime() > h2.getTime()) {
                    h1.setMonth(h1.getMonth() - 12);
                }
                let d1 = formatDate(h1), d2 = formatDate(h2);
                return {embed: {
                    color: parseInt(process.env.COLOR, 16),
                    fields: [{
                        name: `${Math.abs(timediff(h1, h2, args.unit[0].toUpperCase())[args.unit+'s'])} ${args.unit}s`,
                        value: `${d1.month} ${d1.date+1}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
                    }]
                }};
            });
            a('date.until', function() {
                let h1 = new Date(args.date),
                h2 = new Date();
                h1.setDate(h1.getDate()+1);
                if (h1.getTime() < h2.getTime()) {
                    h1.setMonth(h1.getMonth() + 12);
                }
                let d1 = formatDate(h2), d2 = formatDate(h1);
                return {embed: {
                    color: parseInt(process.env.COLOR, 16),
                    fields: [{
                        name: `${Math.abs(timediff(h1, h2, args.unit[0].toUpperCase())[args.unit+'s'])} ${args.unit}s`,
                        value: `${d1.month} ${d1.date}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
                    }]
                }};
            });
            a('alarm.set', function() {});
            if (!res) {
                res = 'This is currently a beta feature.';
            }
        } else res = text;
        message.channel.send(await res);
    });
    request.on('error', (e) => {
        message.channel.stopTyping();
        if (message.author.id === '359988404316012547') message.reply(e.message);
        else message.channel.send('Oops, there was an error on our end.');
    });
    request.end();
});

client.login(process.env.DISCORD_TOKEN);
