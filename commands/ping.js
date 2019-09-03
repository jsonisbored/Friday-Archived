module.exports = (client, message, args) => {
    let time = Date.now();
    message.channel.send('Pinging...').then(message => message.edit(`Pong! ${Date.now()-time}ms`));
};