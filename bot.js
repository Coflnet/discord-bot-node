const { Client, Intents, ThreadChannel, Channel } = require('discord.js');
const fetch = require('cross-fetch')
const dotenv = require('dotenv')
dotenv.config()
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
let answers = require('./answer.json');

// Options to create a new thread
const client = new Client({ intents: myIntents });
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

    checkForProfitCommand(message);

    let answer = getResponseToQuestion(message.content.toLowerCase());
    if (answer) {
        console.log(`message: ${message.content}`)
        console.log(`answer: ${answer}`)
        message.channel.send(answer);
    }

})

function checkForProfitCommand(message){
    if (message.channel.id === '922237524989075476')
    let split = text.split(' ');
    if (split.length >= 2 && split[0] === "c!") {
        fetch(`https://sky.coflnet.com/api/search/player/${split[1]}`).then(res => {
            if (res.status === 500) {
                message.channel.send("The name you provided was not found please check your spelling");
                return null;
            }
            return res.json()
        }).then(players => {
            if (!players) {
                return;
            }
            fetch(`https://sky.coflnet.com/api/flip/stats/player/${players[0].uuid}`).then(response => {
                return response.json();
            }).then(data => {
                message.channel.send('your profit in the last 7 days is ' + formatToPriceToShorten(data.totalProfit, 0));
            })
        })
    }
}

function formatToPriceToShorten(num, decimals) {
    // Ensure number has max 3 significant digits (no rounding up can happen)
    let i = Math.pow(10, Math.max(0, Math.log10(num) - 2));
    num = num / i * i;

    if (num >= 1_000_000_000)
        return (num / 1_000_000_000).toFixed(decimals) + "B";
    if (num >= 1_000_000)
        return (num / 1_000_000).toFixed(decimals) + "M";
    if (num >= 1_000)
        return (num / 1_000).toFixed(decimals) + "k";

    return num.toFixed(0)
}

function checkForThreadCreation(message) {
    let text = message.content.toLowerCase();
    if (message.channel.id === process.env.CHANNEL_ID_SUPPORT) {
        createAnswerThread(message, 'Support Help', 'Needed a separate thread for moderation', thread => { sendAnswer(thread, text) });
        return true;
    }

    if (message.channel.id === process.env.CHANNEL_ID_BUGREPORT) {
        createAnswerThread(message, 'Bug Help', 'help with bug', thread => {
            thread.send("Thank you for making a ticket\nPlease state the below\n- What you did\n- What you entented to do\n- what happened (even better if you make a screenshot/video of it\n- What you expected\nTry to be as precise and complete as possible. (Its faster to read some duplicate text than to ask you something)\nIf you use the mod please also use /cofl report (optional message) to easily create a report.)");
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