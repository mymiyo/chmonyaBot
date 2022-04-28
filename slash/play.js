const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player")

// const downloader = require("@discord-player/downloader").Downloader;
const fs = require("fs");

const youtubePattern = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
const soundcloudPattern = /^(?:https?:\/\/)?(?:www\.)?soundcloud\.com\/([\w-]+)\/([\w-]+)/;
const spotifyPattern = /^(?:https?:\/\/)?(?:open\.|play\.)?spotify\.com\/(?:track\/|album\/|artist\/)([\w-]{22})/;

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Включает трек из Ютуба")
		.addSubcommand(subcommand =>
			subcommand
				.setName("song")
				.setDescription("Включает трек из Ютуба по ссылке")
				.addStringOption((option) => option.setName("url").setDescription("Ссылка на песню").setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("playlist")
				.setDescription("Включает плейлист из Ютуба по ссылке")
				.addStringOption((option) => option.setName("url").setDescription("Ссылка на песню").setRequired(true))
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName("search")
				.setDescription("Ищет песню по названию или ключевым словам")
				.addStringOption((option) =>
					option.setName("searchterms").setDescription("Слова для поиска").setRequired(true)
				)
		)
        .addSubcommand(subcommand =>
        subcommand
            .setName("yandex")
            .setDescription("Включает песню из Яндекс.Музыки")
            .addStringOption((option) =>
                    option.setName("url").setDescription("Ссылка на песню").setRequired(true))
        ),
	run: async ({ client, interaction }) => {
		if (!interaction.member.voice.channel) return interaction.editReply("Ты не в голосовом канале! Зайди в голосовой канал и попробуй выполнить команду снова.")

		const queue = await client.player.createQueue(interaction.guild)
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

		let embed = new MessageEmbed()

		if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString("url")
            let result;
            if (url.match(youtubePattern)) {
                result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.YOUTUBE_VIDEO
                })
            } else if (url.match(soundcloudPattern)) {
                result = await client.player.search(url.split('?')[0], {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.SOUNDCLOUD_TRACK
                })
            } else if (url.match(spotifyPattern)) {
                result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.SPOTIFY_SONG
                })  
            } else {
                result = await client.player.search(url, {
                    requestedBy: interaction.user,
                    searchEngine: QueryType.AUTO
                })
            }
            
            if (result.tracks.length === 0)
                return interaction.editReply("Не удалось найти песню по запросу!")
            
            const song = result.tracks[0]
            console.log(song)
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** был добавлен в очередь`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Длительность: ${song.duration}`})

		} else if (interaction.options.getSubcommand() === "playlist") {
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })

            if (result.tracks.length === 0)
                return interaction.editReply("No results")
            
            const playlist = result.playlist
            await queue.addTracks(result.tracks)
            embed
                .setDescription(`**${result.tracks.length} треков из плейлиста [${playlist.title}](${playlist.url})** было добавлено в очередь`)
                .setThumbnail(playlist.thumbnail)
		} else if (interaction.options.getSubcommand() === "search") {
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            if (result.tracks.length === 0)
                return interaction.editReply("Я ничего не нашёл :(")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** был добавлен в очередь`)
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Длительность: ${song.duration}`})
		}
        if (!queue.playing) await queue.play()
        await interaction.editReply({
            embeds: [embed]
        })
	},
}
