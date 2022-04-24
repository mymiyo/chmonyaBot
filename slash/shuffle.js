const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder().setName("shuffle").setDescription("Перемешивает очередь проигрываемых треков"),
	run: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guildId)

		if (!queue) return await interaction.editReply("В данный момент нет проигрываемой музыки")

		queue.shuffle()
        await interaction.editReply(`Очередь из ${queue.tracks.length} треков перемешана!`)
	},
}
