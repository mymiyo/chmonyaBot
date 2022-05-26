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
		.setName("vk")
		.setDescription("Включает трек из ВК")
		.addSubcommand(subcommand =>
			subcommand
				.setName("s")
				.setDescription("Включает трек из ВК по названию")
				.addStringOption((option) => option.setName("query").setDescription("Название трека").setRequired(true))
		),
	run: async ({ client, interaction }) => {

		if (!interaction.member.voice.channel) return interaction.editReply("Ты не в голосовом канале! Зайди в голосовой канал и попробуй выполнить команду снова.")

		const queue = await client.player.createQueue(interaction.guild, {
            leaveOnEnd: true,
            leaveOnStop: true,
            initialVolume: 80,
            leaveOnEmptyCooldown: 60000,
            bufferingTimeout: 200,
            leaveOnEmpty: true,
            spotifyBridge: false,
        })
        
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

		let embed = new MessageEmbed()

		if (interaction.options.getSubcommand() === "s") {
            const url = 'https://vrit.me/data.php?method=audio.search&count=5&offset=0&q='+interaction.options.getString("query").replace(/\s/g, '+')
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            if (result.tracks.length === 0)
                return interaction.editReply("Я ничего не нашёл :(")
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            console.log(song.thumbnail);
            embed
                .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
                .setTitle(`**${song.title}**`)
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
