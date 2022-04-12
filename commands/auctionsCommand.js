const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch');
const { MessageEmbed } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config()

const { 
    replyFetchingDataEmbed,
    replyNoSpacesInNameEmbed,
    replyPlayerNameNotFoundOrInvalidEmbed,
    bidsReplyEmbed
} = require('../exports/embed.js')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('auctions')
        .setDescription('shows a players last 10 auctions')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('the username of the player')
                .setRequired(true)
        ),
    async execute(interaction, isEphemeral) {
        let name = interaction.options.getString('name')

        if (name.split(" ").length > 1) {
            return replyNoSpacesInNameEmbed(interaction, isEphemeral);
        }

        await replyFetchingDataEmbed(interaction, isEphemeral)

        let res = await fetch(`${process.env.API_ENDPOINT}/search/player/${name}`);
        let playerResponse = await res.json();
        if (playerResponse.Slug === "player_not_found") {
            return replyPlayerNameNotFoundOrInvalidEmbed(interaction, isEphemeral);
        }

        let response = await fetch(`${process.env.API_ENDPOINT}/player/${playerResponse[0].uuid}/auctions`);
        let apiResponse = await response.json();
        return bidsReplyEmbed(interaction, isEphemeral, apiResponse)
    }
}
