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
        ),
    async execute(interaction) {
        let name = interaction.options.getString('name');
        if (name.split(" ").length > 1) {
            return await replyPlayerNameNotFoundOrInvalidEmbed(interaction);
        }
        let res = await fetch(`${process.env.API_ENDPOINT}/search/player/${name}`);
        let playerResponse = await res.json();
        if (playerResponse.Slug === "player_not_found") {
            return await replyPlayerNameNotFoundOrInvalidEmbed(interaction);
        } else {
            await replyFetchingDataEmbed(interaction);
            let response = await fetch(`${process.env.API_ENDPOINT}/flip/stats/player/${playerResponse[0].uuid}`);
            let playerData = await response.json();
            return await replyProfitEmbed(interaction, playerResponse[0].uuid, name, playerData.totalProfit);
        }
    }
}

async function replyPlayerNameNotFoundOrInvalidEmbed(interaction) {
    const embeded = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('The Name you entered was not found please check your spelling')
    return interaction.reply({ embeds: [embeded]})
}

function replyFetchingDataEmbed(interaction) {
    const fetchingData = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor(interaction.member.user.tag)
        .setDescription('Fetching data...')
    return interaction.reply({ embeds: [fetchingData]})
}

async function replyProfitEmbed(interaction, playerUUID, playerName, totalProfit) {
    const userID = (interaction.member.user.id)
    const exampleEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setAuthor('Flipping Profit')
        .setDescription(`<@${userID}>`)
        .setThumbnail(`https://crafatar.com/renders/head/${playerUUID}`)
        .addField(`${playerName} has made ${formatToPriceToShorten(totalProfit, 0)} in the last 7 days`, true)
        .setTimestamp()
    return interaction.editReply({ embeds: [exampleEmbed]})
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