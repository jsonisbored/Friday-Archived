module.exports = (client, message, args) => {
    const h1 = client.getHoliday(args, args.holiday1),
    h2 = client.getHoliday(args, args.holiday2);
    if (!h1 || !h2) message.channel.send(`Unkown holiday, ${!h1 ? args.holiday1 : args.holiday2}.`);
    if (h1.getTime() > h1.getTime()) {
        let h3 = h1.getTime();
        h1 = new Date(h2.getTime());
        h2 = new Date(h3.getTime());
    }
    let d1 = client.formatDate(h1), d2 = client.formatDate(h2);
    message.channel.send({embed: {
        color: client.color,
        fields: [{
            name: Math.abs(client.timediff(h1, h2, args.unit[0].toUpperCase())[args.unit+'s'])+` ${args.unit}s`,
            value: `${d1.month} ${d1.date}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
        }]
    }});
}