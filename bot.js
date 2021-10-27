(async () => {
  const Discord = require("discord.js");
  const Database = require("easy-json-database");
  const devMode = typeof __E_IS_DEV !== "undefined" && __E_IS_DEV;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const myIntents = new Intents(32767);
  const config = require("./config.json");
  const s4d = new Discord.Client(
    intents: myIntents,
    partials: ["REACTION"]
  );


  s4d.on('message', (message) => {

    var text = message.content.toLowerCase();
    if (message.author.username == "cofl bot")
      return; // that is the bot itself, don't make a loop
    console.log("-------------");
    console.log(client.channels.fetch("849462911047172096"));
    console.log("-------------");

    if (message.content.includes("mod") && message.content.includes("bannable")) {
      message.channel.send("The mod is not bannable\nhere is the source code if you wish to look at it https://github.com/Coflnet/HypixelSkyblock/tree/separation#get-startedusage");
    }
    if message.content.includes("mod") && message.content.includes("download")) {
      message.channel.send("you can download the mod in the channel labled\n <#902240719937368104>")
    }
    if (message.content.includes("should") && message.content.includes("buy") && message.content.includes("premium")) {
      message.channel.send("no dont buy\nunless you like the benifits listed on https://sky.coflnet.com/premium");
    }
    if (message.content.includes("doesn") && message.content.includes("make") && message.content.includes("money")) {
      message.channel.send("it uses medium price which means it runs on statistics aka the average price of said item");
    }
    if (message.content.includes("mod") && message.content.includes("free")) {
      message.channel.send("the mod is free to use for free and paid version, you can download it in mod-releases");
    }
    if (message.content.includes("whats") && message.content.includes("tfm")) {
      message.channel.send("theres a discord link in @ThomasW profile");
    }
    if (message.content.length =< 1) {
      // only one word
      message.delete()

    } else if (message.content.includes("@everyone")) {
      message.delete()
    }
    if (channels.cache.find((channel) => channel.name === "mod-releases")) {
      message.thread.create({
        name: 'food-talk',
        autoArchiveDuration: 60,
        reason: 'Needed a separate thread for food',
      })
    }
  });

  console.log("-------------");
  console.log("-------------");
  console.log("ur mom")

  s4d.login(config.token).catch((e) => { console.error(e) });
})();           

