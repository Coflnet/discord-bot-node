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

        let auctions = []

        for (let i = 0; i < 10; i++) {    
            let data = await fetch(`${process.env.API_ENDPOINT}/player/${playerSearchResponse[0].uuid}/auctions?page=${i}`)
            data = await data.json()
            
            if (data.length === 0) {
                break
            }
            auctions = auctions.concat(data)
        }

        currentDate = new Date()
        let activeAuctions = []

        for (let i = 0; i < auctions.length; i++) {
            const item = auctions[i];
            if (currentDate > new Date(item.end)){
                continue
            }            
            activeAuctions = activeAuctions.concat(item)
        }

        let auctionDetails =[]
        for (let i = 0; i < activeAuctions.length; i++) {
            const item = activeAuctions[i];
            let data = await fetch(`${process.env.API_ENDPOINT}/auction/${item.auctionId}`)
            data = await data.json()
            auctionDetails = auctionDetails.concat(data)
        }
        let removeItems = []
        
        pastSellsOfItem = []
        for (let i = 0; i < auctionDetails.length; i++) {
            const item = auctionDetails[i];
            let response = await fetch(`${process.env.API_ENDPOINT}/auctions/uid/${item.flatNbt["uid"]}/sold`)
            response = await response.json()
            if (response.length === 0) {
                removeItems.push([])
                continue
            };
            pastSellsOfItem.push(response)
        }

        for (let i = 0; i < pastSellsOfItem.length; i++) {
            const item = pastSellsOfItem[i];
            pastSellsOfItem[i] = item.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))
        }

        // filters of the items in remove items from auctionDetails
        auctionDetails = auctionDetails.filter((_, i) => !removeItems.includes(i))
        
        let itemsPreviosSellValue = []
        for (let i = 0; i < pastSellsOfItem.length; i++) {
            const item = pastSellsOfItem[i];
            if (item.length === 0){
                continue
            }
            let response = await fetch(`${process.env.API_ENDPOINT}/auction/${item[0].uuid}`)
            response = await response.json()
            itemsPreviosSellValue = itemsPreviosSellValue.concat(response.highestBidAmount)
        }

        let totalProfit = 0
        for (let i = 0; i < itemsPreviosSellValue.length; i++) {
            const item = itemsPreviosSellValue[i];
            totalProfit += auctionDetails[i].startingBid - item
        }
        return profitAferSellEmbedReply(interaction, isEphemeral, playerSearchResponse, totalProfit)
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

