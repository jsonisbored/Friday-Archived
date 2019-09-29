module.exports = (client, message, args) => {
    let h1 = client.getHoliday(args, args.holiday),
    h2 = new Date();
    if (!h1) message.channel.send(`Unkown holiday, ${args.holiday1}.`);
    if (h1.getTime() < h2.getTime()) {
        h1 = client.getHoliday(args, args.holiday, new Date().getFullYear()+1);
    }
    let d1 = client.formatDate(h2), d2 = client.formatDate(h1);
    message.channel.send({embed: {
        color: client.color,
        fields: [{
            name: `${Math.abs(client.timediff(h2, h1, args.unit[0].toUpperCase())[args.unit+'s'])+1} ${args.unit}s`,
            value: `${d1.month} ${d1.date}, ${d1.year} - ${d2.month} ${d2.date}, ${d2.year}`
        }]
    }});
}