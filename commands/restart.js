module.exports = (client, message, args) => {
    message.channel.send('Bot restarting...');
    client.destroy();
    process.exit(1);
};