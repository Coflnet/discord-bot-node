const { MessageEmbed } = require('discord.js');
const {
    formatToPriceToShorten,
    numberWithThousandsSeperators
} = require('./formatFunctions')

const COLOR_EMBEDED_MESSAGES = ('#0099ff')

async function replyDaysOutOfBoundsEmbed(isEphemeral, interaction) {
    const embeded = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('Please dont enter a days count of bigger then 7 or smaller then 0.5')
        .setTimestamp()
    return await interaction.reply({ embeds: [embeded], ephemeral: isEphemeral })
}

async function replyNoSpacesInNameEmbed(interaction, isEphemeral) {
    const embeded = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('Please avoid entering a space in the username')
        .setTimestamp()
    return await interaction.reply({ embeds: [embeded], ephemeral: isEphemeral })
}

async function replyPlayerNameNotFoundOrInvalidEmbed(interaction, isEphemeral) {
    const embeded = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('The Name you entered was not found please check your spelling')
        .setTimestamp()
    return await interaction.reply({ embeds: [embeded], ephemeral: isEphemeral })
}

async function replyFetchingDataEmbed(interaction, isEphemeral) {
    const fetchingData = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor(interaction.member.user.tag)
        .setDescription('Fetching data...')
        .setTimestamp()
    return await interaction.reply({ embeds: [fetchingData], ephemeral: isEphemeral })
}

async function nanErrorReplyEmbed(isEphemeral, interaction, playerData) {
    const errorReply = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription(playerData)
        .setTimestamp()
    return await interaction.editReply({ embeds: [errorReply], ephemeral: isEphemeral })
}

function checkIfProfitIsPositiveOrNegitive(worstFlip) {
    if (worstFlip.profit > 0) {
        return `total profit being`
    }
    return `total loss being`
}

function checkIfPlayersTotalProfitIsPositive(flipData, days) {
    if (flipData.totalProfit > 0) {
        return  `**${formatToPriceToShorten(flipData.totalProfit, 0)}** in the last ${days} days`
    }
    return  `**Nothing** in the last ${days} days`
}

async function replyProfitEmbed(interaction, playerUUID, playerName, days, flipData, isEphemeral) {
    let worstFlip = flipData.flips[flipData.flips.length - 1]
    let bestFlip = flipData.flips[0]
    const userID = (interaction.member.user.id)
    let profitEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setAuthor('Flipping Profit')
        .setDescription(`<@${userID}>`)
        .setThumbnail(`https://crafatar.com/renders/head/${playerUUID}`)
        .addField(`${playerName} has made`, checkIfPlayersTotalProfitIsPositive(flipData, days))
        .setTimestamp()
    if (flipData.flips.length === 0) {
        profitEmbed = profitEmbed.addField('Error!', `There where no flips found :frowning2:`)
    } else {
        profitEmbed = profitEmbed.addField(`The highest profit flip was`, `${bestFlip.itemName} bought for ${formatToPriceToShorten(bestFlip.pricePaid)} sold for ${formatToPriceToShorten(bestFlip.soldFor)} profit being **${formatToPriceToShorten(bestFlip.profit)}**`)
        profitEmbed = profitEmbed.addField(`**Worst Buy -> Sell**`, `${worstFlip.itemName} bought for ${formatToPriceToShorten(worstFlip.pricePaid)} sold for ${(formatToPriceToShorten(worstFlip.soldFor))} ${checkIfProfitIsPositiveOrNegitive(worstFlip)} **${formatToPriceToShorten(worstFlip.profit)}**`)
    }
    return await interaction.editReply({ embeds: [profitEmbed], ephemeral: isEphemeral })
}

async function replyLowestBinEmbed(interaction, isEphemeral, apiResponse, playerResponse) {
    const userID = (interaction.member.user.id)
    let lowestBinEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setThumbnail(playerResponse[0].iconUrl)
        .setAuthor('Lowest bin')
        .setDescription(`<@${userID}>`)
        .setTimestamp()
    if (playerResponse) {
        lowestBinEmbed = lowestBinEmbed.addField(`The lowest bin of ${playerResponse[0].name}`, `is **${(numberWithThousandsSeperators(apiResponse.lowest))}** second lowest bin is ${(numberWithThousandsSeperators(apiResponse.secondLowest))}`)
    } else {
        playerResponse = lowestBinEmbed.addField('Error!', `There was no lbin for that item`)
    }
    return await interaction.editReply({ embeds: [lowestBinEmbed], ephemeral: isEphemeral })
}

async function itemInputWasNotFoundEmbedReply(interaction, isEphemeral) {
    const embeded = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('the item you searched up was not found please try again')
        .setTimestamp()

    return await interaction.reply({ embeds: [embeded], ephemeral: isEphemeral })
}

async function bidsReplyEmbed(interaction, isEphemeral, apiResponse) {
    let bids = apiResponse
    let userID = (interaction.member.user.id);
    let exampleEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setAuthor(`<@${userID}>'s bids`)
        .setTimestamp()
    for (let i = 0; i < bids.length; i++) {
        let bid = bids[i]
        exampleEmbed = exampleEmbed.addField(`${i + 1}.`, `**${bid.itemName}** | Highest bid:  **${numberWithThousandsSeperators(bid.highestBid)}** Coins | BIN: ${bid.bin}`)
    }
    return await interaction.editReply({ embeds: [exampleEmbed], ephemeral: isEphemeral })
}

module.exports = {
    replyProfitEmbed,
    replyFetchingDataEmbed,
    nanErrorReplyEmbed,
    replyDaysOutOfBoundsEmbed,
    replyNoSpacesInNameEmbed,
    replyPlayerNameNotFoundOrInvalidEmbed,
    itemInputWasNotFoundEmbedReply,
    replyLowestBinEmbed,
    bidsReplyEmbed
}
