const { SlashCommandBuilder } = require("@discordjs/builders")
const { AudioFilters } = require("discord-player");
const { findConfigFile } = require("typescript");

module.exports = {
        
	data: new SlashCommandBuilder()
        .setName("filter")
        .setDescription("Устанавливает фильтр при проигрывании музыки, список фильтров: /filter list")
        .addStringOption((option) => option.setName("filter").setDescription("Фильтр").setRequired(true)),
        // .addSubcommand(subcommand =>
        //         subcommand
        //                 .setName("list")
        //                 .setDescription("Показывает список доступных фильтров")
        // )
     
	run: async ({ client, interaction }) => {
                if (!interaction.member.voice.channel) return interaction.editReply("Ты не в голосовом канале! Зайди в голосовой канал и попробуй выполнить команду снова.")
                const queue = client.player.getQueue(interaction.guildId);
                if (!queue || !queue.playing) return void interaction.followUp({ content: "В данный момент нет проигрываемой музыки! 🔇" });
                
                // if (interaction.options.getSubcommand() === "list") {
                //         return void interaction.followUp(`Доступные фильтры: ${Object.keys(AudioFilters).join(", ")}`);
                // }
                
                if (interaction.options.getString("filter")) {
                        const filters = [];
                        queue.getFiltersEnabled().map(x => filters.push(x));
                        queue.getFiltersDisabled().map(x => filters.push(x));

                        const filtersUpdated = {};
                        queue.getFiltersEnabled().map(x => filtersUpdated[x] = true);

                        const filter = filters.find((x) => x.toLowerCase() === interaction.options.getString("filter").toLowerCase());
                        if (!filter) return interaction.followUp({content: `❌ Такого фильтра нет попробуй еще раз! \n\n\nСейчас включены ${filtersUpdated}.\n: ''} \n\n 📜 Список доступных фильтров ${filters.map(x => `**${x}**`).join(', ')}.`});


                        filtersUpdated[filter] = queue.getFiltersEnabled().includes(filter) ? false : true;
                        await queue.setFilters(filtersUpdated);
                        return void interaction.followUp({ content: `Фильтр ${filter} **${queue.getFiltersEnabled().includes(filter) ? 'включен' : 'выключен'}** ✅\n\n*Чем длиннее музыка, тем дольше будет применятся фильтр!*` });
                }
	}
}
