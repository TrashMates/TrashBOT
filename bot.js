// TrashBOT
// VERSION: V3.05
// AUTHOR: TiCubius <trashmates@protonmail.com>

console.log('\033c');
console.log(" ")
console.log(" *** ")
console.log(" * TrashBOT")
console.log(" * VERSION: V3.05")
console.log(" *** ")
console.log(" ")


// LIBRARIES
const fs = require("fs")
const colors = require("colors")

const TwitchJS = require('twitch-js')
const APIjs = require("./app/API.js")
const discordjs = require("discord.js")

// SETTINGS
let isStreaming = false
let streamTitle = null
let saveNewFollowers = false
const settings = JSON.parse(fs.readFileSync("app/config.json"))

// CLIENTS
const Discord = new discordjs.Client()
const Twitch = TwitchJS.client(settings.twitch)
const Event = require("./app/Events.js")
const API = new APIjs()


Twitch.on("message", Event.onTwitchMessage)
Twitch.on("subscription", Event.onTwitchSubscription)
Twitch.on("resub", (channel, username, months, message, userstate, method) => {Event.onTwitchSubscription(channel, username, method, message, userstate)})
Twitch.on("subgift", (channel, username, recipient, method, userstate) => {Event.onTwitchSubscription(channel, recipient, method, "Gifted by: " + username, userstate)})
Twitch.on('cheer', Event.onTwitchCheer)
Twitch.on('hosted', Event.onTwitchHosted)
Twitch.on('ban', Event.onTwitchBan)

Discord.on("message", Event.onDiscordMessage)
Discord.on("guildMemberAdd", Event.onDiscordMemberAdd)
Discord.on("guildMemberUpdate", Event.onDiscordMemberUpdate)
Discord.on("guildMemberRemove", Event.onDiscordMemberRemove)

Discord.login(settings.discord.token)
Twitch.connect()


// TWITCH FOLLOWERS + STREAM ALERT
setInterval(() => {
    API.fetchLatestFollowers().then((followers) => {
        // ON BOT START
        // Probably is duplicate
        if (saveNewFollowers) {
            followers.forEach((follower) => {
                Event.onTwitchFollows(follower)
            })
        } else {
            saveNewFollowers = true
        }
    }).catch((errors) => {
        console.log(" - " + "ERROR WHILE FETCHING LATEST FOLLOWERS".red)
    })

    API.fetchStream().then((stream) => {

        // CASE 1: LOCAL: OFF; DISTANT: OFF - NO CHANGE
        // CASE 2: LOCAL: OFF; DISTANT: ON; - ALERT + CHANGE STATUS
        // CASE 3: LOCAL: ON; DISTANT OFF;  - CHANGE STATUS
        // CASE 4: LOCAL: ON; DISTAN ON;    - NO CHANGE

        if (!isStreaming && Object.keys(stream).length == 0) {
            // console.log(" - NOT STREAMING")
        } else if (!isStreaming && Object.keys(stream).length > 0 && stream.title !== streamTitle) {
            isStreaming = true
            streamTitle = stream.title

            Event.onTwitchStream(stream, settings, Discord)
			console.log(" - " + "DETECTED NEW STREAM: ".green + (stream.title).cyan + " on ".green + (stream.game.name).cyan)
        } else if (isStreaming && Object.keys(stream).length == 0) {
			isStreaming = false

            console.log(" - " + "YOUR PREVIOUS STREAM HAS ENDED".green)
        } else if (isStreaming && Object.keys(stream).length > 0) {
            // console.log(" - CONTINUE STREAM")
        } else {
            console.log(" -- THIS SHOULDN'T HAVE HAPPEND".red)
        }

    }).catch(() => {})

}, 30000)
