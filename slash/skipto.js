const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
	data: new SlashCommandBuilder().setName("skipto").setDescription("Переходит к указанному треку")
    .addNumberOption((option) => 
        option.setName("tracknumber").setDescription("Номер трека к которому необходимо перейти").setMinValue(1).setRequired(true)),
	run: async ({ client, interaction }) => {
		const queue = client.player.getQueue(interaction.guildId)

		if (!queue) return await interaction.editReply("В данный момент нет проигрываемой музыки")

        const trackNum = interaction.options.getNumber("tracknumber")
        if (trackNum > queue.tracks.length)
            return await interaction.editReply("Такого трека нет в очереди")
		queue.skipTo(trackNum - 1)

        await interaction.editReply(`Очередь пропущена до трека #${trackNum}`)
	},
}
