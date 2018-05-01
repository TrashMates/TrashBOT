// TrashBOT
// VERSION: V3.00
// AUTHOR: TiCubius <trashmates@protonmail.com>

console.log('\033c');
console.log(" ")
console.log(" *** ")
console.log(" * TrashBOT")
console.log(" * VERSION: V3.00")
console.log(" *** ")
console.log(" ")


// LIBRARIES
const fs = require("fs")
const colors = require("colors")

const tmijs = require("twitch-js")
const APIjs = require("./app/API.js")
const discordjs = require("discord.js")

// SETTINGS
const settings = JSON.parse(fs.readFileSync("app/config.json"))

// CLIENTS
const Discord = new discordjs.Client()
const Twitch = new tmijs.client(settings.twitch)
const Event = require("./app/Events.js")
const API = new APIjs()


Twitch.on("message", Event.onTwitchMessage)
Twitch.on("subscription", Event.onTwitchSubscription)
Twitch.on("resub", (channel, username, months, message, userstate, method) => {Event.onTwitchSubscription(channel, username, method, message, userstate)})
Twitch.on("subgift", (channel, username, recipient, method, userstate) => {Event.onTwitchSubscription(channel, username, method, message, userstate)})

Discord.on("message", Event.onDiscordMessage)
Discord.on("guildMemberAdd", Event.onDiscordMemberAdd)
Discord.on("guildMemberUpdate", Event.onDiscordMemberUpdate)
Discord.on("guildMemberRemove", Event.onDiscordMemberRemove)

Discord.login(settings.discord.token)
Twitch.connect()
