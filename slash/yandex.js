const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player")
const { getAverageColor } = require('fast-average-color-node');


function getThumbnailColor(thumbnail) {
    if(thumbnail === 'https://upload.wikimedia.org/wikipedia/commons/2/2a/ITunes_12.2_logo.png') return '0x' + Math.floor(Math.random() * 16777215).toString(16);
    else return getAverageColor(thumbnail).then(color => color.hex);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName("yandex")
		.setDescription("Включает трек из Яндекс.Музыки")
		.addSubcommand(subcommand =>
			subcommand
				.setName("query")
				.setDescription("Включает трек из Яндекс.Музыки по ссылке")
				.addStringOption((option) => option.setName("query").setDescription("Ссылка на трек").setRequired(true))
		),
	run: async ({ client, interaction }) => {

		if (!interaction.member.voice.channel) return interaction.editReply("Ты не в голосовом канале! Зайди в голосовой канал и попробуй выполнить команду снова.")

		const queue = await client.player.createQueue(interaction.guild, {
            leaveOnEnd: true,
            leaveOnStop: true,
            initialVolume: 80,
            leaveOnEmptyCooldown: 1000,
            bufferingTimeout: 200,
            leaveOnEmpty: true,
            spotifyBridge: false,
        })
        
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

		let embed = new MessageEmbed()

		if (interaction.options.getSubcommand() === "query") {

            const url = interaction.options.getString("query")
            if (!url.split('album/')[1]) return interaction.editReply("Неверная ссылка, попробуй ещё раз :x:"); 

            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            if (result.tracks.length === 0)
                return interaction.editReply("Я ничего не нашёл :x:")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`**${song.title}**`)
                .setURL(song.uri)
                .setDescription(`${song.author}`)
                .setThumbnail(song.thumbnail)
                .setColor(await getThumbnailColor(song.thumbnail))
                .setFooter({  text: `${song.duration} `})
                .setTimestamp()
        }  if (!queue.playing) await queue.play()
        await interaction.editReply({
            embeds: [embed]
        })
	},
}
