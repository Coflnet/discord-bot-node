
function sendAnswer(thread, text) {
    let answer = getResponseToQuestion(text);
    if (answer) {
        thread.send(answer);
    }
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
        createSuggestionVote(message);
        return true;
    }
    return false;
}

module.exports = {
checkForThreadCreation
}