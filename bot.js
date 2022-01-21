const { Client, Intents, ThreadChannel, Channel } = require('discord.js');
const dotenv = require('dotenv').config()
let answers = require('./answer.json');

// Options to create a new thread
const client = new Client({ intents: [Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const messageTimes = [];


const nitroRegex = /((.*http.*)(.*nitro.*))|((.*nitro.*)(.*http.*))/i;


client.on('messageCreate', (message) => {

    var text = message.content.toLowerCase();
    var nitroRegexr = text.match(nitroRegex);
    if (nitroRegexr != null) {
        message.delete();
    }
    if (message.author.bot) {
        return;
    }

    let messageWasDeleted = checkForDelete(message);
    if (messageWasDeleted) {
        return;
    }

    let threadCreated = checkForThreadCreation(message);
    if (threadCreated) {
        return;
    }

    checkForSpecialMessage(message);

    let answer = getResponseToQuestion(message.content.toLowerCase());
    if (answer) {
        console.log(`message: ${message.content}`)
        console.log(`answer: ${answer}`)
        message.channel.send(answer);
    }
})
function checkForThreadCreation(message) {
    let text = message.content.toLowerCase();
    if (message.channel.id === process.env.CHANNEL_ID_SUPPORT) {
        createAnswerThread(message, 'Support Help', 'Needed a separate thread for moderation', thread => { sendAnswer(thread, text) });
        return true;
    }

    if (message.channel.id === process.env.CHANNEL_ID_BUGREPORT) {
        createAnswerThread(message, 'Bug Help', 'help with bug', thread => {
            thread.send("Thank you for making a ticket\nPlease state the below\n- What you did\n- What you intended to do\n- what happened (even better if you take a screenshot/video of it\n- What you expected\nTry to be as precise and complete as possible. (Its faster to read some duplicate text than to ask you something)\nIf you use the mod please also use /cofl report (optional message) to easily create a report.)");
            sendAnswer(thread, text);
        });
        return true;
    }

    if (message.channel.id === process.env.CHANNEL_ID_SUGGESTIONS) {
        createAnswerThread(message, 'Suggestion Idea', 'To help someone with their suggestion', thread => { sendAnswer(thread, text) });
        return true;
    }
    return false;
}

function checkForDelete(message) {
    if (message.content.toLowerCase().indexOf("@everyone") >= 0) {
        message.delete();
        return true;
    }

    if (message.content.toLowerCase().split(" ").length == 1) {
        if (new Date() - messageTimes[message.author.id] < 10000) {
            message.author.send('Your message was was deleted due one word message spamming. Please do not send 1 word messages')
            message.delete();
            return true;
        }
        messageTimes[message.author.id] = new Date();
    }
    return false;
}

function createAnswerThread(message, name, reason, callback) {
    message.channel.threads.create({
        name: name,
        autoArchiveDuration: 1440,
        startMessage: message.id,
        reason: reason,
    }).then(thread => {
        callback(thread);
    })
}

function sendAnswer(thread, text) {
    let answer = getResponseToQuestion(text);
    if (answer) {
        thread.send(answer);
    }
}

function getResponseToQuestion(question) {
    for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        let isBlacklist = answer.blacklist && answer.blacklist.some(blacklistWord => question.indexOf(blacklistWord) !== -1);
        if (isBlacklist) {
            continue;
        }
        let found = answer.question.every(questionWord => question.indexOf(questionWord) !== -1);
        if (found) {
            return answer.answer;
        }

    }
}

/**
 * Tells Akwav to go to sleep
 */
function checkForSpecialMessage(message) {
    let hour = new Date().getHours()
    if (hour >= 2 || hour <= 7) {
        if (message.author == (process.env.AKWAV)) {
            message.author.send("Please go to Sleep");
        }
    }
}


client.login(process.env.TOKEN).catch((e) => { console.error(e) });
