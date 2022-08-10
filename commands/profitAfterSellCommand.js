const { SlashCommandBuilder } = require('@discordjs/builders')
const fetch = require('cross-fetch')
const dotenv = require('dotenv')
dotenv.config()

const { replyFetchingDataEmbed, replyNoSpacesInNameEmbed, replyPlayerNameNotFoundOrInvalidEmbed, profitAferSellEmbedReply } = require('../exports/embed.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellprofit')
        .setDescription('how much profit you will make after your ah sells')
        .addStringOption(option => option.setName('name').setDescription('the username of the player').setRequired(true)),
    async execute(interaction, isEphemeral) {
        let name = interaction.options.getString('name')

        if (name.split(' ').length > 1) {
            return replyNoSpacesInNameEmbed(interaction, isEphemeral)
        }

        let res = await fetch(`${process.env.API_ENDPOINT}/search/player/${name}`)
        let playerSearchResponse = await res.json()
        if (playerSearchResponse.Slug === 'player_not_found') {
            return replyPlayerNameNotFoundOrInvalidEmbed(interaction, isEphemeral)
        }

        await replyFetchingDataEmbed(interaction, isEphemeral)
        // Fetches the most recent auctions plus all active
        let response = await fetch(`https://api.hypixel.net/skyblock/auction?key=${process.env.API_KEY}&player=${playerSearchResponse[0].uuid}`)
        let hypixelPlayerResponse = await response.json()

        try {
            let auctionDetailsList = await fetchApiRequests(
                hypixelPlayerResponse.auctions.map(auction => fetch(`${process.env.API_ENDPOINT}/auction/${auction.uuid}`))
            )
            // puts the end dates of these auctions into var
            auctionDetailsList = auctionDetailsList.filter(auction => new Date(auction.end) > new Date())
            // get all past sells of the auctions from the "auctionDetailsList"
            let soldAuctions = await fetchApiRequests(
                auctionDetailsList.map(auction => fetch(`${process.env.API_ENDPOINT}/auctions/uid/${auction.flatNbt.uid}/sold`))
            )

            soldAuctions.sort(function (x, y){
                return y.timestamp - x.timestamp
            })

            auctionDetailsList.forEach((auctionDetails, index) => {
                auctionDetails.lastSoldAuctionUUID = soldAuctions[index] && soldAuctions[index].length > 0 ? soldAuctions[index][0].uuid : undefined
            })
            
            auctionDetailsList = auctionDetailsList.filter(auctionDetails => !!auctionDetails.lastSoldAuctionUUID)

            let soldAuctionsDetails = await fetchApiRequests(
                auctionDetailsList.map(auctionDetails => fetch(`${process.env.API_ENDPOINT}/auction/${auctionDetails.lastSoldAuctionUUID}`))
            )

            let totalProfit = 0
            for (let i = 0; i < soldAuctionsDetails.length; i++) {
                auctionDetailsList[i].purchasePrice = soldAuctionsDetails[i].startingBid
                auctionDetailsList[i].itemName = soldAuctionsDetails[i].itemName
                totalProfit += Number(auctionDetailsList[i].startingBid - soldAuctionsDetails[i].startingBid)
            }

            let player = {
                uuid: playerSearchResponse[0].uuid,
                name: playerSearchResponse[0].name
            }
            return profitAferSellEmbedReply(interaction, isEphemeral, player, auctionDetailsList, totalProfit)
        } catch (error) {
            console.error(error)
        }
    }
}

async function fetchApiRequests(fetchPromises) {
    let responses = await Promise.all(fetchPromises)
    let promises = []
    responses.forEach(res => {
        if (res.status < 400 && res.status !== 204) {
            promises.push(res.json())
        }
    })
    return Promise.all(promises)
}
