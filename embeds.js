const { MessageEmbed } = import('discord.js');
const COLOR_EMBEDED_MESSAGES = ('#0099ff')


async function replyNoSpacesInNameEmbed(interaction, isEphemeral) {
    const embeded = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('Please avoid entering a space in the username')
    return await interaction.reply({ embeds: [embeded], ephemeral: isEphemeral })
}

 export var replyPlayerNameNotFoundOrInvalidEmbed = async function (interaction, isEphemeral) {
    const embeded = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('The Name you entered was not found please check your spelling')
    return await interaction.reply({ embeds: [embeded], ephemeral: isEphemeral })
}

async function replyFetchingDataEmbed(interaction, isEphemeral) {
    const fetchingData = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor(interaction.member.user.tag)
        .setDescription('Fetching data...')
    return await interaction.reply({ embeds: [fetchingData], ephemeral: isEphemeral })
}

async function replyProfitEmbed(interaction, playerUUID, playerName, totalProfit) {
    const userID = (interaction.member.user.id)
    const exampleEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setAuthor('Flipping Profit')
        .setDescription(`<@${userID}>`)
        .setThumbnail(`https://crafatar.com/renders/head/${playerUUID}`)
        .addField(`${playerName} has made`,  '**' + `${formatToPriceToShorten(totalProfit, 0)}` + "**" +  " in the last 7 days, true")
        .setTimestamp()
    return await interaction.editReply({ embeds: [exampleEmbed] })
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

export var foo = function() {

}