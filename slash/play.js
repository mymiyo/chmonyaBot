const { SlashCommandBuilder } = require("@discordjs/builders")
const { MessageEmbed } = require("discord.js")
const { QueryType } = require("discord-player")
const { getAverageColor } = require('fast-average-color-node');

function getThumbnailColor(thumbnail) {
    if(thumbnail === 'https://upload.wikimedia.org/wikipedia/commons/2/2a/ITunes_12.2_logo.png') return '0x' + Math.floor(Math.random() * 16777215).toString(16);
    else getAverageColor(thumbnail).then(color => color.hex);
}


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
            await queue.addTrack(song)
            embed
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`[${song.title}](${song.uri})`)
                .setDescription(`**${song.author}**`)
                .setThumbnail(song.thumbnail)
                .setColor(await getThumbnailColor(song.thumbnail))
                .setFooter({  text: `${song.duration} `})
                .setTimestamp()

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
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`[${song.title}](${song.uri})`)
                .setDescription(`**${song.author}**`)
                .setThumbnail(song.thumbnail)
                .setColor(await getThumbnailColor(song.thumbnail))
                .setFooter({  text: `${song.duration} `})
                .setTimestamp()
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
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`[${song.title}](${song.uri})`)
                .setDescription(`**${song.author}**`)
                .setThumbnail(song.thumbnail)
                .setColor(await getThumbnailColor(song.thumbnail))
                .setFooter({  text: `${song.duration} `})
                .setTimestamp()
		} if (!queue.playing) await queue.play()
        await interaction.editReply({
            embeds: [embed]
        })
	},
}
