const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profit')
        .setDescription('how much profit some has made in the last 7 days')
        .addStringOption(option =>
            option.setName('name')
            .setDescription('the username of the player')
            .setRequired(true)
        ),
    async execute(interaction, isEphemeral) {
        let name = interaction.options.getString('name');
        let res = await fetch(`https://sky.coflnet.com/api/search/player/${name}`);
        let playerResponse = await res.json();
        if (playerResponse.Slug === "player_not_found") {
            // Sends using InteractionReplyOptions, making it ephemeral (only user can see) if isEphemeral is true
            await interaction.reply({content: "The name you provided was not found please check your spelling",
                ephemeral: isEphemeral});
        } else {
            await interaction.reply({content: "fetching data...", ephemeral: isEphemeral})
            let response = await fetch(`https://sky.coflnet.com/api/flip/stats/player/${playerResponse[0].uuid}`);
            let data = await response.json();
            await interaction.editReply((name) + ' has made ' + formatToPriceToShorten(data.totalProfit, 0) + " In the last 7 days")
        }
    }
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