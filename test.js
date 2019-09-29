require('dotenv').config();

const Discord = require('discord.js');
const client = new Discord.Client();
const database = require('./database.json');
const fs = require('fs');
const config = {
    prefix: '!',
    token: process.env.DISCORD_TOKEN
};
const { evaluate } = require('mathjs');

const currency = {
  items: {
      name: {
        price: 5
      }
  },
  checkAccount: id => {
    if (!database[id]) database[id] = {
      balance: 0,
      items: [],
      id: id
    }
    return database[id];
  },
  getBalance: id => {
    return currency.checkAccount(id).balance;
  },
  getInventory: id => {
    return currency.checkAccount(id).items;
  },
  buyItem: (id, item) => {
    let acc = database[id];
    item = currency.items[item];
    if (!item) return `Can't find item error message`;
    if (acc.balance < item.price) return `Not enough money error message`;
    acc.items.push(item);
    acc.balance -= item.price;
  }
};

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

var dice = function(d) { 
  var a = d.split('d'),
  result = 0,
  num = (typeof (a[0]-0) === 'number') ? a[0] : 1,
  min = 1,
  op = (a[1].match(/[\-\+]/)),
  max = (op === null) ? a[1] : a[1].split(op[0])[0],
  mod = (op !== null) ? op[0] + ' ' + a[1].split(op[0])[1] : '';
  for (var i = num; i >= 0; i--) { 
    result += (Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return new Function('return ' + result + mod)();
}

client.on("message", async (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  currency.checkAccount(message.author.id);
  const responses = {
    '?': `Here I am Senpai ${message.author.username}.`,
    ' how do you feel today?': `I am okay Senpai ${message.author.username}.`,
    ' who are you?': `Silly Senpai ${message.author.username}! I am DiceWaifu. I am 18 and I love to roll dice and make my Senpais happy!`,
    ' what is for dinner?': `Well, Senpai ${message.author.username}, I have prepared Wonton Soup, Ceaser Salad, and Grilled Shrimp. Does that sound good?`,
    ' that sounds delicious.': `Thank you Senpai ${message.author.username}!`,
    ' sing for me.': `B-Baka ${message.author.username}! I c-could never.`,
    'Mimic': () => {
      let text = args.join(' ');
      message.delete();
      return text;
    },
    ' roll a': () => {
      args.shift();
      let amount = args.shift() || 'd6';
      let mult = amount.split('d')[0];
      let rolled = dice(amount);
      let rest = args.join(' ');
      let bonus;
      try {
        bonus = evaluate(rest);
      } catch(e) {
        return 'I-I have failed you, I am so sorry.';
      }
      let output = `Here you go ${message.author.username}: `;
      if (bonus && mult) output += `(${rolled})(${mult}) ${rest} = ${rolled*mult+bonus}`
      else if (mult) output += `(${rolled})(${mult}) = ${rolled*mult}`;
      else if (bonus) output += `(${rolled}) ${rest} = ${rolled+bonus}`;
      else output += `${rolled}`;
      return output;
    },
    ' show me quest #F154983463.': [`On it Senpai ${message.author.username}!`, {files: ['https://imgur.com/iUjem11.jpg']}],
    ' show me the Central Kingdom\'s flag.': [`On it Senpai ${message.author.username}!`, {files: ['https://imgur.com/l9yAKc3.jpg']}],
    ' show me the Eastern Kingdom\'s flag.': [`On it Senpai ${message.author.username}!`, {files: ['https://imgur.com/NtPnQ5p.jpg']}],
    ' show me the Northern Kingdom\'s flag.': [`On it Senpai ${message.author.username}!`, {files: ['https://imgur.com/YkhN3Kj.jpg']}],
    ' show me the Western Kingdom\'s flag.': [`On it Senpai ${message.author.username}!`, {files: ['https://imgur.com/8A3LszO.jpg']}],
    ' show me the Southern Kingdom\'s flag.': [`On it Senpai ${message.author.username}!`, {files: ['https://imgur.com/6RTAVUe.jpg']}],
    ' show me the money.': [`On it Senpai ${message.author.username}!`, {files: ['https://imgur.com/tjvBIIw.jpg']}],
    ' show me the world.': [`On it Senpai ${message.author.username}!`, {files: ['https://i.imgur.com/KMZHuo6.jpg']}],
    ' what is my balance?': () => {
      const target = message.mentions.users.first() || message.author;
      return `Senpai ${target.username}, you have ${currency.getBalance(target.id)}💰`;
    },
    ' what is in my inventory?': () => {
      const target = message.mentions.users.first() || message.author;
      return `Senpai ${target.username}, you have ${currency.getInventory(target.id).join(', ') || 'nothing'}`;
    },
    ' give': () => {
      
    },
    ' buy this item': () => {
      return currency.buyItem(message.author.id, args[2]);
    },
    ' take me to the Shop': () => {
      let output = '';
      for (const name in currency.items) {
        const item = currency.items[name];
        output += `\n${name}: ${item.price}💰`;
      }
      return `**Shop** ${output}`;
    },
    ' show me the leaderboard': () => {
      let users = Object.values(database), output = '';
      users = users.sort((a, b) => b.balance-a.balance);
      for (let i = 0; i < users.length; i ++) {
        output += `\n${i+1}. ${client.users.get(users[i].id).username}: ${users[i].balance}`;
      }
      return `**Leaderboard** ${output}`;
    },
  };
  for (const i in responses) {
    if (message.content.startsWith(config.prefix + i)) {
      let r = responses[i];
      message.channel.send(typeof r == 'function' ? r(args) : typeof 'r' == 'object' ? r[0] : r, typeof r[1] == 'object' ? r[1] : {});
    }
  }
  fs.writeFile('./database.json', JSON.stringify(database), err => console.error);
 });

client.login(config.token);