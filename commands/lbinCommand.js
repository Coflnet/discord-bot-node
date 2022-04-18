const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch');
const dotenv = require('dotenv');
dotenv.config()

const {
    replyFetchingDataEmbed,
    itemInputWasNotFoundEmbedReply,
    replyLowestBinEmbed
} = require('../exports/embed.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lowestbin')
        .setDescription('tells you the lowest bin of an item')
        .addStringOption(option =>
            option.setName('item')
                .setDescription('the name of the item')
                .setRequired(true)
        ),
    async execute(interaction, isEphemeral) {
        let itemName = interaction.options.getString('item');

        await replyFetchingDataEmbed(interaction, isEphemeral)

        let res = await fetch(`${process.env.API_ENDPOINT}/item/search/${itemName}`);

        let playerResponse = await res.json();
        if (playerResponse.length === 0) {
            return itemInputWasNotFoundEmbedReply(interaction, isEphemeral)
        }

        let response = await fetch(`${process.env.API_ENDPOINT}/item/price/${playerResponse[0].id}/bin`);
        let apiResponse = await response.json();
        return replyLowestBinEmbed(interaction, isEphemeral, apiResponse, playerResponse)
    }


}



