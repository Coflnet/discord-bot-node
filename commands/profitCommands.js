const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch');
const { MessageEmbed } = require('discord.js');
const dotenv = require('dotenv')
dotenv.config()

const COLOR_EMBEDED_MESSAGES = ('#0099ff')



module.exports = {
    data: new SlashCommandBuilder()
        .setName('profit')
        .setDescription('how much profit some has made in the last 7 days')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('the username of the player')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('days')
                .setDescription('flips in the last x days')
                .setRequired(false)
        ),
    async execute(interaction, isEphemeral) {
        let name = interaction.options.getString('name')
        let days = interaction.options.getString('days')

        days = days || 7

        if (days > 7 || days < 0.5) {
            return replyDaysOutOfBoundsEmbed(isEphemeral, interaction)
        }
        if (name.split(" ").length > 1) {
            return replyNoSpacesInNameEmbed(interaction, isEphemeral);
        }
        let res = await fetch(`${process.env.API_ENDPOINT}/search/player/${name}`);
        let playerResponse = await res.json();
        if (playerResponse.Slug === "player_not_found") {
            return replyPlayerNameNotFoundOrInvalidEmbed(interaction, isEphemeral);
        }
        await replyFetchingDataEmbed(interaction, isEphemeral);
        let response = await fetch(`${process.env.API_ENDPOINT}/flip/stats/player/${playerResponse[0].uuid}?days=${days}`);

        let flipData = await response.json();

        if (flipData.Slug === 'NaN') {
            return nanErrorReplyEmbed(isEphemeral, interaction, playerData)
        }
        return replyProfitEmbed(interaction, playerResponse[0].uuid, name, days, flipData, isEphemeral);
    }
}



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

function checkIfProfit(worstFlip){
    if(worstFlip.profit > 0){
        return `total profit being`
    }
    return `total loss being`
}

async function replyProfitEmbed(interaction, playerUUID, playerName, days, flipData, isEphemeral) {
    let worstFlip = flipData.flips[flipData.flips.length -1]
    let bestFlip = flipData.flips[0]
    const userID = (interaction.member.user.id)
    let profitEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setAuthor('Flipping Profit')
        .setDescription(`<@${userID}>`)
        .setThumbnail(`https://crafatar.com/renders/head/${playerUUID}`)
        .addField(`${playerName} has made`, `**${formatToPriceToShorten(flipData.totalProfit, 0)}** in the last ${days} days`)
        .setTimestamp()
    if (flipData.flips.length === 0) {
       profitEmbed = profitEmbed.addField('Error!', `There where no flips found :frowning2:`)
    } else {
        profitEmbed = profitEmbed.addField(`The highest profit flip was`, `${bestFlip.itemName} bought for ${formatToPriceToShorten(bestFlip.pricePaid)} sold for ${formatToPriceToShorten(bestFlip.soldFor)} profit being **${formatToPriceToShorten(bestFlip.profit)}**`)
        profitEmbed = profitEmbed.addField(`The lowest profit flip was`, `${worstFlip.itemName} bought for ${formatToPriceToShorten(worstFlip.pricePaid)} sold for ${(formatToPriceToShorten(worstFlip.soldFor))} ${checkIfProfit(worstFlip)} **${formatToPriceToShorten(worstFlip.profit)}**`)
    }

    return await interaction.editReply({ embeds: [profitEmbed], ephemeral: isEphemeral })
}

function formatToPriceToShorten(num = 0, decimals = 0) {
    // Ensure number has max 3 significant digits (no rounding up can happen)
    let i = Math.pow(10, Math.max(0, Math.log10(Math.abs(num)) - 2));
    let absNumber = Math.abs(num) / i * i;
    let realNumber = num < -1 ? absNumber * -1 : absNumber

    if (absNumber >= 1_000_000_000)
        return (realNumber / 1_000_000_000).toFixed(decimals) + "B";
    if (absNumber >= 1_000_000)
        return (realNumber / 1_000_000).toFixed(decimals) + "M";
    if (absNumber >= 1_000)
        return (realNumber / 1_000).toFixed(decimals) + "k";

    return realNumber.toFixed(0)
}
