module.exports = (client, message, args) => {
    try {
        message.channel.send('```\n'+eval(args.join(' '))+'```');
    } catch(err) {
        message.channel.send('```'+err.message.toString()+'```') || message.channel.send('```'+err.toString()+'```')
    }
};