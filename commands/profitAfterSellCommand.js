const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch');
const dotenv = require('dotenv');
dotenv.config()

const {
    replyFetchingDataEmbed,
    replyNoSpacesInNameEmbed,
    replyPlayerNameNotFoundOrInvalidEmbed,
    profitAferSellEmbedReply
} = require('../exports/embed.js')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellprofit')
        .setDescription('how much profit you will make after your ah sells')
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

        let res = await fetch(`${process.env.API_ENDPOINT}/search/player/${name}`);
        let playerResponse = await res.json();
        if (playerResponse.Slug === "player_not_found") {
            return replyPlayerNameNotFoundOrInvalidEmbed(interaction, isEphemeral);
        }

        await replyFetchingDataEmbed(interaction, isEphemeral)
        // Fetches the most recent auctions plus all active
        let response = await fetch(`https://api.hypixel.net/skyblock/auction?key=${process.env.API_KEY}&player=${playerResponse[0].uuid}`);
        let apiResponse = await response.json();
        let uidList = []
        let auctionPrice = []
        let itemTag = []
        // fetch /auction api for info about uid and bids
        try {
            let promises = []
            for (let i = 0; i < apiResponse.auctions.length; i++) {
                let promise = fetch(`${process.env.API_ENDPOINT}/auction/${apiResponse.auctions[i].uuid}`)
                promises.push(promise)
            }
            let processUidList = await Promise.all(promises);
            promises = [];
            //parses /auctions call to json

            for (let i = 0; i < processUidList.length; i++) {
                let promise = processUidList[i].json()
                promises.push(promise)
            }
            // gets the starting bid from the /auctions call
            processUidList = await Promise.all(promises);
            processUidList = processUidList.filter(element => new Date(element.end) > new Date())

            for (let i = 0; i < processUidList.length; i++) {
                // gets the uid from the /auction fetch
                uidList.push(processUidList[i].flatNbt.uid)
                // pushes the starting bid price
                auctionPrice.push(processUidList[i].startingBid)
            }
            return profitAferSellEmbedReply(interaction, isEphemeral, apiResponse, playerResponse, uidList, itemTag, auctionPrice)
        } catch (error) {
            console.error(error)
        }
    }
}