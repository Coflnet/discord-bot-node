const { SlashCommandBuilder } = require('@discordjs/builders');
const fetch = require('cross-fetch');
const { MessageEmbed } = require('discord.js');
const dotenv = require('dotenv')
dotenv.config()

const COLOR_EMBEDED_MESSAGES = ('#0099ff')



module.exports = {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('links your discord to your minecraft account')
        .addStringOption(option =>
            option.setName('apikey')
                .setDescription('your hypixel api key')
                .setRequired(true)
        ),
    async execute(interaction, isEphemeral) {
        let playersapikey = interaction.options.getString('apikey')

        await fetch(`https://api.hypixel.net/key?key=${playersapikey}`)
            .then(result => result.json())
            .then(({ record }) => {
                let playersUUID = record.owner;

                fetch(`https://api.hypixel.net/player?uuid=${playersUUID}&key=${playersapikey}`)
                    .then(result => result.json())
                    .then(({ player }) => {

                    return interaction.author.setNickname(player.displayname)
                    console.log('made it')
                    })
            })
        }
    }
