function getResponseToQuestion(question, message) {
    if (message.content.length >= 61){
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

module.exports = {
    getResponseToQuestion
}