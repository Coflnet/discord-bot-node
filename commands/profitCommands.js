const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch');
const { MessageEmbed } = require('discord.js');

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
            await interaction.reply({ embeds: [playerNotFoundEmbed()] })
            return
        }
        let res = await fetch(`https://sky.coflnet.com/api/search/player/${name}`);
        let playerResponse = await res.json();
        if (playerResponse.Slug === "player_not_found") {
            await interaction.reply({ embeds: [playerNotFoundEmbed()] })
        } else {
            await interaction.reply({ embeds: [fetchingData(interaction)] })
            let response = await fetch(`https://sky.coflnet.com/api/flip/stats/player/${playerResponse[0].uuid}`);
            let playerData = await response.json();
            await interaction.editReply({ embeds: [profitEmbed(interaction, playerResponse, playerData, name)] })
        }

    }

}

function playerNotFoundEmbed() {
    const embeded = new MessageEmbed()
    .setColor('#0099ff')
    .setAuthor('Error!')
    .setDescription('The Name you entered was not found please check your spelling')
    return embeded
}

function profitEmbed(interaction, playerResponse, playerData, name) {
    const playerID = (interaction.member.user.id)
    const exampleEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setURL('https://discord.js.org/')
        .setAuthor('Flipping Profit')
        .setDescription("<@" + playerID + ">")
        .setThumbnail(String(`https://crafatar.com/renders/head/${playerResponse[0].uuid}`))
        .addField((String(name)) + " has made", (String(formatToPriceToShorten(playerData.totalProfit, 0) + " in the last 7 days")), true)
        .setTimestamp()
    return exampleEmbed
}

function fetchingData(interaction) {
    const fetchingData = new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor((String(interaction.member.user.tag)))
        .setDescription('Fetching data...')
    return fetchingData
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