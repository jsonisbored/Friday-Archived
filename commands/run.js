const cmd = require('node-cmd');
module.exports = (client, message, ...args) => {
    cmd.get(
        args.join(' '),
        function(err, data, stderr){
            if (err) return message.channel.send('```'+err.message.toString()+'```') || message.channel.send('```'+err.toString()+'```');
            if (stderr) return message.channel.send('```'+stderr.message.toString()+'```') || message.channel.send('```'+err.toString()+'```');
            message.channel.send('```'+data.toString()+'```');
        }
    );
};