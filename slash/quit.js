const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder().setName("quit").setDescription("Останавливает проигрывание музыки и выходит из голосового канала"),
	run: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guildId)

		if (!queue) return await interaction.editReply("В данный момент нет проигрываемой музыки")

		queue.destroy()
        await interaction.editReply("пока")
	},
}
