module.exports = (client, message, commands) => {
    if (!commands) return message.reply('Must provide a command name to reload!');
    for (var i = 0; i < commands.length; i ++) {
      var command = commands[i];
      let run = false;
      try {
        delete require.cache[require.resolve(`../intents/${command}.js`)];
        run = true;
      } catch(e) {
        try {
          delete require.cache[require.resolve(`./${command}.js`)];
          run = true;
        } catch(e) {}
      }
      if (run) {
        message.channel.send(`The command \`${command}\` has been reloaded`);
      } else {
        message.channel.send(`Could not find command \`${command}\``);
      }
    }
};