const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch');
const dotenv = require('dotenv')
dotenv.config()

const { 
    replyProfitEmbed,
    replyFetchingDataEmbed,
    nanErrorReplyEmbed,
    replyDaysOutOfBoundsEmbed,
    replyNoSpacesInNameEmbed,
    replyPlayerNameNotFoundOrInvalidEmbed
} = require('../exports/embed.js')


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
