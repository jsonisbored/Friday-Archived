module.exports = async (client, message, args) => {
    const location = typeof args.location != 'object' ? (args.location || 'Chicago') : (args.location.country || args.location.city || 'Chicago'),
    id = client.cityTimezones.lookupViaCity(location)[0].timezone,
    zone = client.findTimeZone(id),
    d = client.getZonedTime(new Date(), zone),
    t = client.formatDate(new Date(d.year, d.month, d.day, d.hours, d.minutes, d.seconds));
    message.channel.send({embed: {
        color: client.color,
        title: `Time in ${location}`,
        fields: [{
            name: `${t.hours}:${t.minutes} ${t.ampm}`,
            value: `${t.day}, ${t.month} ${t.date}, ${t.year}`
        }]
    }});
}