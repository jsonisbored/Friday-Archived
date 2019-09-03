const apiaiApp = require('apiai')('40db44ec5f964c57a1b03a3bd9d637e5');
const Discord = require('discord.js');
const client = new Discord.Client();
const botId = '615996099416817704';
client.on('ready', function (evt) {
    console.log(evt, 'Connected');
});

require('dotenv').config()
const timediff = require('timediff');
const getTimeDiffAndTimeZone = require('city-country-timezone');


const prefixes = [`<@${botId}> `, '/', 'friday', 'ok friday', 'hey friday'];
const formatDate = function(d) {
    minutes = d.getMinutes().toString().length == 1 ? '0'+d.getMinutes() : d.getMinutes(),
    hours = d.getHours().toString().length == 1 ? '0'+d.getHours() : d.getHours(),
    ampm = d.getHours() >= 12 ? 'PM' : 'AM',
    months = ['January','February','March','April','May','June','July','August','September','October','November','December'],
    days = ['Sunday','Monday','Tuesday','Wednesdar','Thursday','Fridar','Saturday'];
    return {
        day: days[d.getDay()],
        month: months[d.getMonth()],
        date: d.getDate(),
        year: d.getFullYear(),
        hours: hours%12,
        minutes: minutes,
        ampm: ampm
    };
};

let contexts = [];
client.on('message', message => {
    if (message.author.bot) return;
    let prefix = false;
    for (const i of prefixes) {
        if (message.content.toLowerCase().startsWith(i)) prefix = i;
    }
    if (message.content.toLowerCase().indexOf(prefix) !== 0 && message.channel.type !== 'dm') return;
    if (prefix == '/') {
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
    message.channel.startTyping();
try {
    let text = message.content.substring(prefix.length);
    let request = apiaiApp.textRequest(text, {
        sessionId: message.author.id,
        contexts: contexts
    });
    request.on('response', (response) => {
        console.log(response);
        message.channel.stopTyping();
        let args = response.result.parameters, text = response.result.fulfillment.speech, res = '';
        if (text == 'code') {
            let a = function(q, value) {
                if (response.result.metadata.intentName === q) {
                    res = typeof value === 'function' ? value() : value;
                }
            };
            a('date.between', function() {return timediff(args.date1, args.date2, args.unit[0].toUpperCase())[args.unit+'s']+` ${args.unit}s`});
            a('date.check', function() {
                const { timezone, time_diff } = getTimeDiffAndTimeZone(args.location);
                let time = new Date();
                let tzDifference = time_diff * 60;
                let t = formatDate(new Date(time.getTime() + tzDifference * 60 * 1000));
                contexts.push({
                    name: 'date.check',
                    parameters: args
                });
                return {embed: {
                    color: 0xff6300,
                    title: `Time in ${args.location}`,
                    fields: [{
                        name: `${t.hours}:${t.minutes} ${t.ampm}`,
                        value: `${t.day}, ${t.month} ${t.date}, ${t.year}`
                    }]
                }};
            });
            a('date.check - context:date-check', function() {
                const { timezone, time_diff } = getTimeDiffAndTimeZone(args.location);
                // let time = new Date();
                // let tzDifference = time_diff * 60;
                // let t = formatDate(new Date(time.getTime() + tzDifference * 60 * 1000));
                // contexts = [];
                // return {embed: {
                //     color: 0xff6300,
                //     title: `Time in ${args.location}`,
                //     fields: [{
                //         name: `${t.hours}:${t.minutes} ${t.ampm}`,
                //         value: `${t.day}, ${t.month} ${t.date}, ${t.year}`
                //     }]
                // }};
            });
        } else res = text;
        message.channel.send(res);
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