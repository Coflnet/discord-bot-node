
const { Client, Intents, ThreadChannel, Channel } = require('discord.js');
const dotenv = require('dotenv')
dotenv.config()
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);

// Options to create a new thread

const client = new Client({ intents: myIntents });

client.on('messageCreate', (message) => {

  //if (message.channelId)
  var text = message.content.toLowerCase();
  if (message.author.bot) {
    return; // the bot wont respond to itself 
  }

  if (text.split(" ").length == 1) {
    // only one word
    return message.delete()
  } else if (text.indexOf("@everyone") >= 0) {
    return message.delete()
  }

  if (text.indexOf("mod") >= 0 && text.indexOf("bannable") >= 0) {
    message.channel.send("The mod is not bannable\nhere is the source code if you wish to look at it https://github.com/Coflnet/HypixelSkyblock/tree/separation#get-startedusage");
  }
  if (text.indexOf("mod") >= 0 && text.indexOf("download") >= 0) {
    message.channel.send("you can download the mod in the channel labled\n <#902240719937368104>")
  }
  if (text.indexOf("should") >= 0 && text.indexOf("buy") >= 0 && text.indexOf("premium") >= 0) {
    message.channel.send("no dont buy\nunless you like the benifits listed on https://sky.coflnet.com/premium");
  }
  if (text.indexOf("doesnt") >= 0 && text.indexOf("make") >= 0 && text.indexOf("money") >= 0) {
    message.channel.send("it uses medium price which means it runs on statistics aka the average price of said item");
  }
  if (text.indexOf("mod") >= 0 && text.indexOf("free") >= 0) {
    message.channel.send("the mod is free to use for free and paid version, you can download it in mod-releases");
  }
  if (text.indexOf("whats") >= 0 && text.indexOf("tfm") >= 0) {
    message.channel.send("theres a discord link in @ThomasW profile");
  }

  if (message.channel.name === "support") {
    message.channel.threads
      .create({
        name: 'Support Help',
        autoArchiveDuration: 1440,
        startMessage: message.id,
        reason: 'Needed a separate thread for moderation',
      })
  }

  if (message.channel.name === "🐛bug-report") {
    channel.threads
      .create({
        name: 'Bug Help',
        autoArchiveDuration: 1440,
        startMessage: message.id,
        reason: 'help with bug',
      })
  }

  if (message.channel.name === "suggestions") {
    channel.threads
      .create({
        name: 'Suggestion Idea',
        autoArchiveDuration: 1440,
        startMessage: message.id,
        reason: 'To help someone with their suggestion',
      })
  }
})


client.login(process.env.TOKEN).catch((e) => { console.error(e) });