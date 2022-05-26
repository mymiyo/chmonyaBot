const Discord = require("discord.js")
const dotenv = require("dotenv")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v9")
const { Player } = require("discord-player")
const { yandex, vk } = require("./extractors/index");
const fs = require("fs")

dotenv.config()
const TOKEN = process.env.TOKEN

const LOAD_SLASH = process.argv[2] == "load"
const DELETE_SLASH = process.argv[2] == "delete"

const CLIENT_ID = "871620531416338452"
const GUILD_ID = "524692087765991424"

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_VOICE_STATES"
    ]
})

client.slashcommands = new Discord.Collection()
client.player = new Player(client, {
    ytdlOptions: {
        filter: "audioonly",
        opusEncoded: "true",
        quality: 'highestaudio',
        highWaterMark: 1 << 30, // DONT TOUCH
    }
})

client.player.use("vk", vk);
client.player.use("yandex", yandex);

let commands = []

const slashFiles = fs.readdirSync("./slash").filter(file => file.endsWith(".js"))
for (const file of slashFiles){
    const slashcmd = require(`./slash/${file}`);
    client.slashcommands.set(slashcmd.data.name, slashcmd);
    if (LOAD_SLASH) commands.push(slashcmd.data.toJSON());
}

if (LOAD_SLASH) {
    const rest = new REST({ version: "9" }).setToken(TOKEN)
    console.log("Deploying slash commands")
    rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {body: commands})
    .then(() => {
        console.log("Successfully loaded")
        process.exit(0)
    })
    .catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
} else if (DELETE_SLASH) {
    const rest = new REST().setToken(TOKEN);
    rest.get(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)).then((data) => {
        const promises = [];
        for (const command of data) {
            const deleteUrl = `${Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)}/${command.id}`;
            promises.push(rest.delete(deleteUrl));
            console.log(`Deleted command ${command.id} ${command.name}`);
        }
        return Promise.all(promises).then(() => {
            console.log("All commands deleted");
            process.exit(0)
        });
    }).catch((err) => {
        if (err){
            console.log(err)
            process.exit(1)
        }
    })
} else {
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`)
    })
    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return

            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply("Not a valid slash command")
            
            await interaction.deferReply()
            await slashcmd.run({ client, interaction })
        }
        handleCommand()
    })
    
    client.login(TOKEN)
}
