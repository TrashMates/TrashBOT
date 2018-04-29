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
const request = require("request")

const tmijs = require("twitch-js")
const APIjs = require("./app/API.js")
const discordjs = require("discord.js")
// const TwitchWebhook = require('twitch-webhook')

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


Discord.login(settings.discord.token)
Twitch.connect()
