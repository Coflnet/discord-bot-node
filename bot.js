const { Client, Intents, Collection } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv')
dotenv.config()
const myIntents = new Intents();
myIntents.add(Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
let answers = require('./answer.json');

// Options to create a new thread
const client = new Client({ intents: [Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const messageTimes = [];

const nitroRegex = /((.*http.*)(.*nitro.*))|((.*nitro.*)(.*http.*))|((.*http.*)(.*gift.*))|((.*gift.*)(.*http.*))/i;

client.commands = getClientCommands();

client.on('ready', () => {
    // id of user tentamens to notify on startup
    client.users.fetch('659541857616920577').then((user) => {
        user.send('The discord bot restarted');
    });
});

client.on('messageCreate', (message) => {
    var text = message.content.toLowerCase();
    var nitroRegexr = text.match(nitroRegex);
    if (nitroRegexr != null) {
        return message.delete();
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
        message.channel.send(answer);
    }

})

client.on('interactionCreate', async interaction => {
    // Make it ephemeral (only the user can see it) if it's not in bot commands channel
    let isEphemeral = false;
    if (interaction.channelId !== process.env.CHANNEL_ID_BOT_COMMANDS) {
        isEphemeral = true;
    }
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction, isEphemeral);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
})

function getClientCommands() {

    let commands = new Collection();
    const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        // Set a new item in the Collection
        // With the key as the command name and the value as the exported module
        commands.set(command.data.name, command);
    }
    return commands;
}

function checkForThreadCreation(message) {
    let text = message.content.toLowerCase();
    if (message.channel.id === process.env.CHANNEL_ID_SUPPORT) {
        createAnswerThread(message, 'Support Help', 'Needed a separate thread for moderation', thread => { sendAnswer(thread, text) 
        thread.send("A new support ticket was made <@&933807456151285770> <@&893869139129692190>")
        });
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
        createSuggestionVote(message);
        return true;
    }
    return false;
}

// utility function to check if a one-word message is a valid url
function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}


function checkForDelete(message) {
    if (message.content.toLowerCase().indexOf("@everyone") >= 0) {
        message.delete();
        return true;
    }
    // dev, mod, helper, half-helper, tfm staff
    const exemptRoles = ["669258959495888907", "869942341442600990", "933807456151285770", "893869139129692190", "941738849808298045"]
    // check if the message was in a server (has member attribute)
    if (message.content.split(" ").length === 1 && message.member != null && !isValidHttpUrl(message.content) && message.content.length > 0) {
        // for role in member roles, if the role id is exempt, don't do this
        for (const role of message.member.roles.cache.values()) {
            if (exemptRoles.includes(role.id)) {
                return;
            }
        }
        if (new Date() - messageTimes[message.author.id] < 10000) {
            // tries to DM them the reason for message deletion
            message.author.send('Your message was was deleted due to one word message spamming. Please do not send 1 word messages')
                .catch(() => {
                    // DMing failed, send it in the chat, but delete our response after 5 seconds (so it doesn't clutter chat)
                    message.channel.send("<@" + message.author.id + ">, your message was was deleted due to " +
                            "one word message spamming. Please do not send 1 word messages")
                        .then((sentMessage) => setTimeout(() => {sentMessage.delete()}, 5000));
                })
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

function createSuggestionVote(message) {
    message.react('👍');
    message.react('👎');
}

function sendAnswer(thread, text) {
    let answer = getResponseToQuestion(text);
    if (answer) {
        thread.send(answer);
    }
}

function getResponseToQuestion(question) {
    if (question && question.length >= 61){
        return
    }
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
        //akwavs id
        if (message.author === 267680402594988033) {
            message.author.send("Please go to Sleep");
        }
    }
}


client.login(process.env.TOKEN).catch((e) => { console.error(e) });
