module.exports = (client, message, args) => {
    const h = client.getHoliday(args, args.holiday);
    if (!h) message.channel.send(`Unkown holiday, ${args.holiday}.`);
    const t = client.formatDate(h);
    message.channel.send({embed: {
        color: client.color,
        fields: [{
            name: `${t.day}, ${t.month} ${t.date}`,
            value: `${args.holiday} ${t.year}`
        }]
    }});
}