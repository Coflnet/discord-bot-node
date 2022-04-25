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
    return false
}

module.exports = {
    checkForSpecialMessage,
    checkForDelete
}