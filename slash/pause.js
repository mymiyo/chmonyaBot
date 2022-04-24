const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder().setName("pause").setDescription("Останавливает проигрывание музыки"),
	run: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guildId)

		if (!queue) return await interaction.editReply("В данный момент нет проигрываемой музыки")

		queue.setPaused(true)
        await interaction.editReply("Музыка остановлена!")
	},
}
