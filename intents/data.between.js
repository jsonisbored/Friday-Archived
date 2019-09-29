module.exports = (client, message, args) => {
    const d1 = client.formatDate(new Date(args.date1)), d2 = client.formatDate(new Date(args.date2));
    message.channel.send({embed: {
        color: client.color,
        fields: [{
            name: client.timediff(args.date1, args.date2, args.unit[0].toUpperCase())[args.unit+'s']+` ${args.unit}s`,
            value: `${d1.month} ${d1.date}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
        }]
    }});
}