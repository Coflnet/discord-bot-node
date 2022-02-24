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
        let res = await fetch(`${process.env.API_ENDPOINT}/search/player/${name}`);
        days = days || 7

        if (days > 7 || days < 0.5){
            return replygreaterThan7OrSmallerThen05Embed(isEphemeral, interaction)
        }
        if (name.split(" ").length > 1) {
            return replyNoSpacesInNameEmbed(interaction, isEphemeral);
        }

        let playerResponse = await res.json();
        if (playerResponse.Slug === "player_not_found") {
            return replyPlayerNameNotFoundOrInvalidEmbed(interaction, isEphemeral);
        } else {
            await replyFetchingDataEmbed(interaction, isEphemeral);
            let response = await fetch(`${process.env.API_ENDPOINT}/flip/stats/player/${playerResponse[0].uuid}?days=${days}`);
            let playerData = await response.json();
            if (playerData === 'NaN') {
                return nanErrorReplyEmbed(isEphemeral, interaction, playerData)
            }
            return replyProfitEmbed(interaction, playerResponse[0].uuid, name, playerData.totalProfit, days, isEphemeral);
        }
    }
}


async function replygreaterThan7OrSmallerThen05Embed(isEphemeral, interaction){
    const embeded = new MessageEmbed()
    .setColor(COLOR_EMBEDED_MESSAGES)
    .setAuthor('Error!')
    .setDescription('Please dont enter a days count of bigger then 7 or smaller then 0.5')
return await interaction.reply({ embeds: [embeded], ephemeral: isEphemeral })
} 

async function replyNoSpacesInNameEmbed(interaction, isEphemeral) {
    const embeded = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('Please avoid entering a space in the username')
    return await interaction.reply({ embeds: [embeded], ephemeral: isEphemeral })
}

async function replyPlayerNameNotFoundOrInvalidEmbed(interaction, isEphemeral) {
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

async function nanErrorReplyEmbed(isEphemeral, interaction, playerData) {
    const errorreply = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription(playerData)
    return await interaction.editReply({ embeds: [errorreply], ephemeral: isEphemeral })
}

async function replyProfitEmbed(interaction, playerUUID, playerName, totalProfit, days, isEphemeral) {
    const userID = (interaction.member.user.id)
    const exampleEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setAuthor('Flipping Profit')
        .setDescription(`<@${userID}>`)
        .setThumbnail(`https://crafatar.com/renders/head/${playerUUID}`)
        .addField(`${playerName} has made`, `**${formatToPriceToShorten(totalProfit, 0)}** in the last ${days} days`)
        .setTimestamp()
    return await interaction.editReply({ embeds: [exampleEmbed], ephemeral: isEphemeral })
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
