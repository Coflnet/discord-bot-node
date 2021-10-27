(async () => {
  const Discord = require("discord.js");
  const Database = require("easy-json-database");
  const devMode = typeof __E_IS_DEV !== "undefined" && __E_IS_DEV;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const s4d = {
    Discord,
    database: new Database(`${devMode ? S4D_NATIVE_GET_PATH : "."}/db.json`),
    joiningMember: null,
    reply: null,
    tokenInvalid: false,
    tokenError: null,
    checkMessageExists() {
      if (!s4d.client) throw new Error('You cannot perform message operations without a Discord.js client')
      if (!s4d.client.readyTimestamp) throw new Error('You cannot perform message operations while the bot is not connected to the Discord API')
    }
  };

  const myIntents = new Intents();
  myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS);

  s4d.client = new s4d.Discord.Client({
    intents: [Object.values(s4d.Discord.Intents.FLAGS).reduce((acc, p) => acc | p, 0)],
    partials: ["REACTION"]
  });
  

  s4d.client.on('message', (s4dmessage) => {

    //if (s4dmessage.channelId)
    var text = s4dmessage.content.toLowerCase();
    if (s4dmessage.author.username == "cofl bot")
      return; // that is the bot itself, don't make a loop
    console.log("-------------");
    console.log(s4d.client.channels.fetch("849462911047172096"));
    console.log("-------------");

    if (text.indexOf("mod") >= 0 && text.indexOf("bannable") >= 0) {
      s4dmessage.channel.send("The mod is not bannable\nhere is the source code if you wish to look at it https://github.com/Coflnet/HypixelSkyblock/tree/separation#get-startedusage");
    }
    if (text.indexOf("mod") >= 0 && text.indexOf("download") >= 0) {
      s4dmessage.channel.send("you can download the mod in the channel labled\n <#902240719937368104>")
    }
    if (text.indexOf("should") >= 0 && text.indexOf("buy") >= 0 && text.indexOf("premium") >= 0) {
      s4dmessage.channel.send("no dont buy\nunless you like the benifits listed on https://sky.coflnet.com/premium");
    }
    if (text.indexOf("doesnt") >= 0 && text.indexOf("make") >= 0 && text.indexOf("money") >= 0) {
      s4dmessage.channel.send("it uses medium price which means it runs on statistics aka the average price of said item");
    }
    if (text.indexOf("mod") >= 0 && text.indexOf("free") >= 0) {
      s4dmessage.channel.send("the mod is free to use for free and paid version, you can download it in mod-releases");
    }
    if (text.indexOf("whats") >= 0 && text.indexOf("tfm") >= 0) {
      s4dmessage.channel.send("theres a discord link in @ThomasW profile");
    }
    if (text.split(" ").length == 1) {
      // only one word
      s4dmessage.delete()

    } else if (text.indexOf("@everyone") >= 0) {
      s4dmessage.delete()
    }
    //console.log(s4d.client.channels.cache)
    if (s4d.client.channels.cache.find((channel) => channel.name === "mod-releases")) {
      s4dmessage.thread.create({
        name: 'food-talk',
        autoArchiveDuration: 60,
        reason: 'Needed a separate thread for food',
      })
    }
  });

  console.log("-------------");
  console.log("-------------");
  console.log("ur mom")

  s4d.client.login('OTAwMTc5ODY5NzA5NzYyNjMw.YW9j1Q.rOsh_S9Ma8OnBT4fEtNfgtxQOqc').catch((e) => { console.error(e) });
})();           

