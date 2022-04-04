const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch');
const { MessageEmbed } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config()

const COLOR_EMBEDED_MESSAGES = ('#0099ff')

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


async function replyPlayerNameNotFoundOrInvalidEmbed(interaction, isEphemeral) {
    const playNotFoundEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('The Name you entered was not found please check your spelling')
        .setTimestamp()
    return await interaction.editReply({ embeds: [playNotFoundEmbed], ephemeral: isEphemeral })
}

async function bidsReplyEmbed(interaction, isEphemeral, apiResponse) {
    let userID = (interaction.member.user.id);
    let bidsEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setAuthor(`<@${userID}> bids`)
        .setTimestamp()
    for (let i = 0; i < bids.length; i++) {
        let bid = apiResponse[i]
        bidsEmbed = bidsEmbed.addField(`${i + 1}.`, `Item-Name: ${bid.itemName} | Highest bid:  ${bid.highestBid} Coins | BIN: ${bid.bin}`)
    }
    return await interaction.editReply({ embeds: [bidsEmbed], ephemeral: isEphemeral })
}

async function replyFetchingDataEmbed(interaction, isEphemeral) {
    const fetchingData = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor(interaction.member.user.tag)
        .setDescription('Fetching data...')
        .setTimestamp()
    return await interaction.reply({ embeds: [fetchingData], ephemeral: isEphemeral })
}

async function replyNoSpacesInNameEmbed(interaction, isEphemeral) {
    const replyNoSpaceEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('Please avoid entering a space in the username')
        .setTimestamp()
    return await interaction.reply({ embeds: [replyNoSpaceEmbed], ephemeral: isEphemeral })
}
