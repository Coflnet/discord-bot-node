const { Client, Intents, ThreadChannel, Channel } = require('discord.js');
const dotenv = require('dotenv')
dotenv.config()
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
let answers = require('./answer.json');

// Options to create a new thread

const client = new Client({ intents: myIntents });

const messageTimes = [];

client.on('messageCreate', (message) => {



    let hour = new Date().getHours() 
    if (hour > 23 && hour < 5){
    if (message.author == (process.env.AKWAV)){
        message.author.send("Please go to Sleep")
    }
}
    



    var text = message.content.toLowerCase();
    if (message.author.bot) {
        return;
    }
    if (text.split(" ").length == 1) {


        if (new Date() - messageTimes[message.author.id] < 10000) {
            message.author.send('Your message was was deleted due one word message spamming. Please do not send 1 word messages')
            message.delete();
        }
        messageTimes[message.author.id] = new Date();
    }
    if (text.indexOf("@everyone") >= 0) {
        return message.delete();
    }

    if (message.channel.id === process.env.CHANNEL_ID_SUPPORT) {
        message.channel.threads.create({
            name: 'Support Help',
            autoArchiveDuration: 1440,
            startMessage: message.id,
            reason: 'Needed a separate thread for moderation',
        }).then(thread => {
            let answer = getResponseToQuestion(text);
            if (answer) {
                thread.send(answer);
            }
        })
        return;
    }

    if (message.channel.id === process.env.CHANNEL_ID_BUGREPORT) {
        message.channel.threads.create({
            name: 'Bug Help',
            autoArchiveDuration: 1440,
            startMessage: message.id,
            reason: 'help with bug',
        }).then(thread => {
            thread.send("Thank you for making a ticket\nPlease state the below\n- What you did\n- What you entented to do\n- what happened (even better if you make a screenshot/video of it\n- What you expected\nTry to be as precise and complete as possible. (Its faster to read some duplicate text than to ask you something)\nIf you use the mod please also use /cofl report (optional message) to easily create a report.)");
            let answer = getResponseToQuestion(text);
            if (answer) {
                thread.send(answer);
            }
        })
        return;
    }

    if (message.channel.id === process.env.CHANNEL_ID_SUGGESTIONS) {
        message.channel.threads.create({
            name: 'Suggestion Idea',
            autoArchiveDuration: 1440,
            startMessage: message.id,
            reason: 'To help someone with their suggestion',
        }).then(thread => {
            let answer = getResponseToQuestion(text);
            if (answer) {
                thread.send(answer);
            }
        })
        return;
    }

    let answer = getResponseToQuestion(text);
    if (answer) {

        message.channel.send(answer);
    }

})


function getResponseToQuestion(question) {
    for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        let isBlacklist = answer.blacklist && answer.blacklist.some(blacklistWord => question.indexOf(blacklistWord) !== -1);
        if (isBlacklist) {
            continue;
        }

        let found = answer.question.every(questionWord => question.indexOf(questionWord) !== -1);
        if (found) {

            //client.channels.cache.get(process.env.REPLY_CHANNEL_ID).send(String((answer.answer)));

            //client.channels.cache.get(process.env.REPLY_CHANNEL_ID).send(String((question)));

            return answer.answer;
        }

    }
}


client.login(process.env.TOKEN).catch((e) => { console.error(e) });
