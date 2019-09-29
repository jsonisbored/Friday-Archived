const alarm = require('../tools/alarm.js');
module.exports = async (client, message, args) => {
    args.date = new Date().getDate();
    alarm.set(message.author.id, args);
    await message.channel.send('Created new alarm');
    message.channel.send({ embed: {
        color: client.color,
        fields: [{
            name: args.alarmName+'' || 'Alarm',
            value: args.time+''
        }]
    }});
}