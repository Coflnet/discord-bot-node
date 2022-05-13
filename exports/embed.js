const { MessageEmbed } = require('discord.js');
const fetch = require('cross-fetch');
const {
    formatToPriceToShorten,
    numberWithThousandsSeperators
} = require('./formatFunctions')

// embed color
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

function getProfitOrLossString(worstFlip) {
    // checks if profit is positive or negitive
    if (worstFlip.profit > 0) {
        return `total profit being`
    }
    return `total loss being`
}

function getTotalProfitString(flipData, days) {
    // grammar check for profit embed
    if (flipData.totalProfit > 0) {
        return `**${formatToPriceToShorten(flipData.totalProfit, 0)}** in the last ${days} days`
    }
    return `**Nothing** in the last ${days} days`
}

function getProfitOrLossString(totalProfit) {
    if (totalProfit > 0) {
        return `will **make**`
    }
    return `will **lose**`
}

async function replyProfitEmbed(interaction, playerUUID, playerName, days, flipData, isEphemeral) {
    let worstFlip = flipData.flips[flipData.flips.length - 1]
    let bestFlip = flipData.flips[0]
    let profitEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setAuthor('Flipping Profit')
        // command users id
        .setDescription(`<@${interaction.member.user.id}>`)
        .setThumbnail(`https://crafatar.com/renders/head/${playerUUID}`)
        .addField(`${playerName} has made`, getTotalProfitString(flipData, days))
        .setTimestamp()
    // checks if there are flips or not
    if (flipData.flips.length === 0) {
        profitEmbed = profitEmbed.addField('Error!', `There where no flips found :frowning2:`)
    } else {
        // adds the highest profit and lowest profit flips to the embed
        profitEmbed = profitEmbed.addField(`The highest profit flip was`, `${bestFlip.itemName} bought for ${formatToPriceToShorten(bestFlip.pricePaid)} sold for ${formatToPriceToShorten(bestFlip.soldFor)} profit being **${formatToPriceToShorten(bestFlip.profit)}**`)
        profitEmbed = profitEmbed.addField(`**Worst Buy -> Sell**`, `${worstFlip.itemName} bought for ${formatToPriceToShorten(worstFlip.pricePaid)} sold for ${(formatToPriceToShorten(worstFlip.soldFor))} ${getProfitOrLossString(worstFlip)} **${formatToPriceToShorten(worstFlip.profit)}**`)
    }
    return await interaction.editReply({ embeds: [profitEmbed], ephemeral: isEphemeral })
}

async function replyLowestBinEmbed(interaction, isEphemeral, apiResponse, playerResponse) {
    let lowestBinEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setThumbnail(playerResponse[0].iconUrl)
        .setAuthor('Lowest bin')
        // command users id
        .setDescription(`<@${interaction.member.user.id}>`)
        .setTimestamp()
    // makes sure theres a lowest bin for the item
    if (playerResponse) {
        // adds the lowest bin of the item to the embed
        lowestBinEmbed = lowestBinEmbed.addField(`The lowest bin of ${playerResponse[0].name}`, `is **${(numberWithThousandsSeperators(apiResponse.lowest))}** second lowest bin is ${(numberWithThousandsSeperators(apiResponse.secondLowest))}`)
    } else {
        // or adds an error saying there was no lbin for the item
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
    let exampleEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        // command users id
        .setDescription(`<@${interaction.member.user.id}>`)
        .setTimestamp()
    // goes through all of the api response to add the bids to the embed
    for (let i = 0; i < apiResponse.length; i++) {
        exampleEmbed = exampleEmbed.addField(`${i + 1}.`, `**${apiResponse.itemName}** | Highest bid:  **${numberWithThousandsSeperators(apiResponse.highestBid)}** Coins | BIN: ${apiResponse.bin}`)
    }
    return await interaction.editReply({ embeds: [exampleEmbed], ephemeral: isEphemeral })
}


async function profitAferSellEmbedReply(interaction, isEphemeral, apiResponse, playerResponse, processUidList, itemTag, auctionPrice) {
    let promises = [];
    let auctionUuid = [];
    for (let i = 0; i < processUidList.length; i++) {
        let promise = fetch(`${process.env.API_ENDPOINT}/auctions/uid/${processUidList[i]}/sold`)
        promises.push(promise)
    }
    try {
        let soldAuctions = await Promise.all(promises);
        promises = [];
        for (let i = 0; i < soldAuctions.length; i++) {
            let promise = soldAuctions[i].json()
            promises.push(promise)
        }
        soldAuctions = await Promise.all(promises);

        for (let i = 0; i < soldAuctions.length; i++) {
            if (soldAuctions[i].length === 0) {
                soldAuctions.splice(i, 1)
                apiResponse.splice(i, 1)
                processUidList.splice(i, 1)
                auctionPrice.splice(i, 1)
                continue
            }
            let e = soldAuctions[i]
            auctionUuid.push(e[0].uuid)
        }
        promises = [];
        for (let i = 0; i < auctionUuid.length; i++) {
            let res = await fetch(`${process.env.API_ENDPOINT}/auction/${auctionUuid[i]}`)
            promises.push(res)
        }
        let auctionList = await Promise.all(promises)
        promises = [];
        for (let i = 0; i < auctionList.length; i++) {
            let res = auctionList[i].json()
            promises.push(res);
        }
        auctionList = await Promise.all(promises)

        let itemName = [];
        let boughtPrice = [];
        for (let i = 0; i < auctionList.length; i++) {
            boughtPrice.push(auctionList[i].startingBid)
            itemName.push(auctionList[i].itemName)
        }
        let auctionProfit = [];
        for (let i = 0; i < boughtPrice.length; i++) {
            auctionProfit.push(auctionPrice[i] - boughtPrice[i])
        }
        totalProfit = 0;
        for (let i = 0; i < auctionProfit.length; i++) {
            totalProfit += Number(auctionProfit[i])
        }

        let profitAfterSellEmbed = new MessageEmbed()
            .setColor(COLOR_EMBEDED_MESSAGES)
            .setAuthor('Profit after sell')
            // command users id
            .setDescription(`<@${interaction.member.user.id}>`)
            .setThumbnail(`https://crafatar.com/renders/head/${playerResponse[0].uuid}`)
            .addField(`${playerResponse[0].name} ${getProfitOrLossString(totalProfit)}`, `**${formatToPriceToShorten(totalProfit)}** from there actions`)
            .setTimestamp()
            for (let i = 0; i < boughtPrice.length; i++) {
                profitAferSellEmbed = profitAfterSellEmbed.addField(`${itemName[i]} was bought for`, `**${formatToPriceToShorten(boughtPrice[i])}** and it will sell for **${formatToPriceToShorten(auctionPrice[i])}**`)
            }
        return await interaction.editReply({ embeds: [profitAfterSellEmbed], ephemeral: isEphemeral })
    } catch (error) {
        console.error(error)
    }

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
    bidsReplyEmbed,
    profitAferSellEmbedReply
}
