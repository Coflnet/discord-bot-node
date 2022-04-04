const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch');
const { MessageEmbed } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config()

const COLOR_EMBEDED_MESSAGES = ('#0099ff')


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
        return replyProfitEmbed(interaction, isEphemeral, apiResponse, playerResponse)
    }


}
async function itemInputWasNotFoundEmbedReply(isEphemeral, interaction) {
    const embeded = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor('Error!')
        .setDescription('the item you searched up was not found please try again')
        .setTimestamp()

    return await interaction.reply({ embeds: [embeded], ephemeral: isEphemeral })
}

async function replyProfitEmbed(interaction, isEphemeral, apiResponse, playerResponse) {
    let lowestBinInfo = apiResponse
    const userID = (interaction.member.user.id)
    let exampleEmbed = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setURL('https://discord.js.org/')
        .setThumbnail(playerResponse[0].iconUrl)
        .setAuthor('Lowest bin')
        .setDescription(`<@${userID}>`)
        .setTimestamp()
    if (lowestBinInfo) {
        exampleEmbed = exampleEmbed.addField(`the lowest bin of ${playerResponse[0].name}`, `is **${(numberWithThousandsSeperators(lowestBinInfo.lowest))}** second lowest bin is ${(numberWithThousandsSeperators(lowestBinInfo.secondLowest))}`)
    } else {
        exampleEmbed = exampleEmbed.addField('Error!', `There was no lbin for that item`)
    }

    return await interaction.reply({ embeds: [exampleEmbed], ephemeral: isEphemeral })
}

function numberWithThousandsSeperators(number, seperator) {
    if (!number) {
        return "0";
    }
    var parts = number.toString().split(",");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, seperator || ",");
    return parts.join(",");
}

async function replyFetchingDataEmbed(interaction, isEphemeral) {
    const fetchingData = new MessageEmbed()
        .setColor(COLOR_EMBEDED_MESSAGES)
        .setAuthor(interaction.member.user.tag)
        .setDescription('Fetching data...')
        .setTimestamp()
    return await interaction.reply({ embeds: [fetchingData], ephemeral: isEphemeral })
}
