// TrashBOT - Events
// VERSION: 3.00
// AUTHOR: TiCubius <trashmates@protonmail.com>

const APIjs = require("./API.js")
const API = new APIjs()

module.exports = class Events {

	/**
	 * Retrives the highest Role a Twitch User has, according to the userstate Object
	 *
	 * @param {object} userstate
	 * @returns {string} role
	 */
	static getTwitchHighestRole(userstate) {

		let role = "Viewer"

		if (userstate.subscriber) {role = "Subscriber"}
		if (userstate.mod)        {role = "Moderator"}

		return role

	}

    /**
     * Triggered when a Twitch Message has been sent to the Twitch Channel
     *
     * @param {string} channel
     * @param {object} userstate
     * @param {string} message
     * @param {boolean} self
     */
    static onTwitchMessage(channel, userstate, message, self) {

        let viewer_data = {
            "userid": userstate["user-id"],
            "username": userstate["display-name"] || userstate["username"],
            "role": Events.getTwitchHighestRole(userstate)
        }

        let message_data = {
            "userid": userstate["user-id"],
            "channel": channel,
            "content": message
        }


        API.fetchViewer("Twitch", viewer_data.userid).then((viewer) => {

            // THE USER HAS CHANGED USERNAME, UPDATE THE DATABASE
            if (viewer_data.username != viewer.username) {
                let event_data = {
                    "userid": userstate["user-id"],
                    "type": "VIEWER_MODIFIED",
                    "content": viewer.username + " has changed username: " + viewer_data.username
                }

                API.updateViewer("Twitch", viewer_data).then((viewer_updated) => {
                    API.createEvent("Twitch", event_data).then((event) => {}).catch((error) => {
                        console.log(" - " + "TrashMates API: CREATE EVENT FAILED".red)
                    })
                }).catch((error) => {
                    console.log(" - " + "TrashMates API: UPDATE VIEWER FAILED".red)
                })
            }

            API.createMessage("Twitch", message_data).then((message) => {
                console.log(" - " + (message_data.userid).cyan + ": " + message_data.content)
            }).catch((error) => {
                console.log(" - " + "TrashMates API: CREATE MESSAGE FAILED".red)
                console.log(" - " + (message_data.userid).red + ": " + message_data.content)
            })
        }).catch((error) => {
            API.createViewer("Twitch", viewer_data).then((viewer) => {
                API.createMessage("Twitch", message_data).then((message) => {
                    console.log(" - " + (message_data.userid).green + ": " + message_data.content)
                }).catch((error) => {
                    console.log(" - " + "TrashMates API: CREATE MESSAGE FAILED".red)
                    console.log(" - " + (message_data.userid).yellow + ": " + message_data.content)
                })
            }).catch((error) => {
                console.log(" - " + "TrashMates API: CREATE VIEWER FAILED".red)
                console.log(" - " + (message_data.userid).red + ": " + message_data.content)
            })
        })

    }

    /**
     * Triggered when a Twitch User has followed the Twitch Channel
     *
     * @param {JSON} follower
     */
    static onTwitchFollows(follower) {

        let viewer_data = {
            "userid": follower.id,
            "username": follower.display_name,
            "role": "Follower"
        }

        let event_data = {
            "userid": follower.id,
            "type": "VIEWER_FOLLOWED",
            "content": follower.display_name + " has followed the channel"
        }


        API.fetchViewer("Twitch", viewer_data.userid).then((viewer) => {

            if (viewer_role == "Viewer") {
                API.updateViewer("Twitch", viewer_data).then((updated_viewer) => {
                    console.log(" - " + (viewer_data.userid).green + " has followed the channel")
                }).catch((errors) => {
                    console.log(" - " + "TrashMates API: UPDATE VIEWER FAILED".red)
                    console.log(" - " + (viewer_data.userid).red + " has followed the channel")
                })
            }

            API.createEvent("Twitch", event_data).then((created_event) => {}).catch((errors) => {
                console.log(" - " + "TrashMates API: CREATE EVENT FAILED".red)
            })

        }).catch((errors) => {
            API.createViewer("Twitch", viewer_data).then((created_viewer) => {
                API.createEvent("Twitch", event_data).then((create_event) => {
                    console.log(" - " + (viewer_data.userid).green + " has followed the channel")
                }).catch((errors) => {
                    console.log(" - " + "TrashMates API: CREATE EVENT FAILED".red)
                    console.log(" - " + (viewer_data.userid).yellow + " has followed the channel")
                })
            }).catch((errors) => {
                console.log(" - " + (viewer_data.userid).red + " has followed the channel")
                console.log(" - " + "TrashMates API: CREATE VIEWER FAILED".red)
            })
        })

    }

    /**
     * Triggered when a Twitch User has subscribed to the Twitch Channel
     *
     * @param {string} channel
     * @param {string} username
     * @param {string} method
     * @param {string} message
     * @param {object} userstate
     */
    static onTwitchSubscription(channel, username, method, message, userstate) {

        let viewer_data = {
            "userid": userstate["user-id"],
            "username": userstate["display-name"] || userstate["username"],
            "role": Events.getTwitchHighestRole(userstate) == "Viewer" ? "Subscriber" : Events.getTwitchHighestRole(userstate)
        }

        let event_data = {
            "userid": userstate["user-id"],
            "type": "VIEWER_SUBSCRIBED",
            "content": username + " is now subscribed to the channel!"
        }

        if (message) {event_data.content += " [" + message + "]"}


        API.fetchViewer("Twitch", viewer_data.userid).then((viewer) => {
            API.updateViewer("Twitch", viewer_data).then((viewer) => {
                console.log(" - " + (viewer_data.userid).green + " has subscribed to the channel!")
            }).catch((error) => {
                console.log(" - " + "TrashMates API: UPDATE EVENT FAILED".red)
                console.log(" - " + (viewer_data.userid).red + " has subscribed to the channel!")
            })

            API.createEvent("Twitch", event_data).then((event) => {}).catch((error) => {
                console.log(" - " + "TrashMates API: CREATE EVENT FAILED".red)
            })
        }).catch((error) => {
            API.createViewer("Twitch", viewer_data).then((viewer) => {
                API.createEvent("Twitch", event_data).then((event) => {
                    console.log(" - " + (viewer_data.userid).green + " has subscribed to the channel!")
                }).catch((error) => {
                    console.log(" - " + "TrashMates API: CREATE EVENT FAILED".red)
                    console.log(" - " + (viewer_data.userid).yellow + " has subscribed to the channel!")
                })
            }).catch((error) => {
                console.log(" - " + "TrashMates API: CREATE VIEWER FAILED".red)
                console.log(" - " + (viewer_data.userid).red + " has subscribed to the channel!")
            })
        })

    }

    /**
     * Triggered when a Twitch Stream is launched
     *
     * @param {JSON} stream
     * @param {JSON} settings
     * @param {Discord} Discord
     */
    static onTwitchStream(stream, settings, Discord) {

        let date = new Date(stream.started_at).toISOString().replace(/T/, ' ').replace(/\..+/, '')

        settings.discord.embed.footer.text = "EN LIVE DEPUIS " + date 
        settings.discord.embed.fields[0].value = stream.title
        settings.discord.embed.fields[1].value = stream.game.name
        settings.discord.embed.image.url = "https://static-cdn.jtvnw.net/previews-ttv/live_user_" + settings.api.twitch.username + "-1280x720.jpg"
        let embed = settings.discord.embed

        // Send a Discord Message containing all the informations
        // Note: Most of the Streaem informations is 
        // displayed thanks to Discord Embeds
        Discord.guilds
          .get(settings.discord.server_id).channels
          .find("name", settings.discord.channel_name)
          .send("@everyone", { embed })
          .then()
          .catch((errors) => console.error(errors))

    }




    /**
     * Triggered when a Discord Member has been sent to a Discord Channel
     *
     * @param {Message} message
     */
    static onDiscordMessage(message) {

        let viewer_data = {
            "userid": message.author.id,
            "username": message.author.username,
            "discriminator": message.author.discriminator,
            "role": message.member.highestRole.name
        }

        let message_data = {
            "id": message.id,
            "userid": message.author.id,
            "channel": message.channel.name,
            "content": message.cleanContent
        }

        if (message.attachments) {
            message.attachments.forEach((attachement) => {
                message_data.content += "\n" + attachement.url
            })
        }

        API.fetchViewer("Discord", viewer_data.userid).then((viewer) => {
            API.createMessage("Discord", message_data).then((message) => {
                console.log(" - " + (message_data.userid).cyan + ": " + message_data.content)
            }).catch((error) => {
                console.log(" - " + "TrashMates API: CREATE MESSAGE FAILED".red)
                console.log(" - " + (message_data.userid).red + ": " + message_data.content)
            })
        }).catch((error) => {
            API.createViewer("Discord", viewer_data).then((viewer) => {
                API.createMessage("Discord", message_data).then((message) => {
                    console.log(" - " + (message_data.userid).green + ": " + message_data.content)
                }).catch((error) => {
                    console.log(" - " + "TrashMates API: CREATE MESSAGE FAILED".red)
                    console.log(" - " + (message_data.userid).red + ": " + message_data.content)
                })
            }).catch((error) => {
                console.log(" - " + "TrashMates API: CREATE VIEWER FAILED".red)
                console.log(" - " + (message_data.userid).red + ": " + message_data.content)
            })
        })

    }


    /**
     * Triggered when a Discord Member has join the Discord Server
     *
     * @param {GuildMember} member
     */
    static onDiscordMemberAdd(member) {

        let viewer_data = {
            "userid": member.user.id,
            "username": member.user.username,
            "discriminator": member.user.discriminator,
            "role": member.highestRole.name
        }

        let event_data = {
            "userid": member.user.id,
            "type": "MEMBER_JOINED",
            "content": member.user.username + "#" + member.user.discriminator + " has joined the server"
        }

        API.fetchViewer("Discord", viewer_data.userid).then((viewer) => {
            API.createEvent("Discord", event_data).then((event) => {
                console.log(" - " + (viewer_data.userid).green + ": " + event_data.content)
            }).catch((error) => {
                console.log(" - " + "TrashMates API: CREATE EVENT FAILED".red)
                console.log(" - " + (viewer_data.userid).red + ": " + event_data.content)
            })
        }).catch((error) => {
            API.createViewer("Discord", viewer_data).then((viewer) => {
                // EVENT IS AUTOMATIC
            }).catch((error) => {
                console.log(" - " + "TrashMates API: CREATE VIEWER FAILED".red)
                console.log(" - " + (viewer_data.userid).red + ": " + event_data.content)
            })
        })

    }


    /**
     * Triggered when a Discord Member has been updated
     *
     * @param {GuildMember} oldMember
     * @param {GuildMember} newMember
     */
    static onDiscordMemberUpdate(oldMember, newMember) {

        let viewer_data = {
            "userid": newMember.user.id,
            "username": newMember.user.username,
            "discriminator": newMember.user.discriminator,
            "role": newMember.highestRole.name
        }

        let event_data = {
            "userid": newMember.user.id,
            "type": "MEMBER_UPDATED",
            "content": false
        }

        // Some changes aren't THAT important...
        if ((oldMember.user.username != newMember.user.username) || (oldMember.user.discriminator != newMember.user.discriminator)) {
            event_data.content = newMember.user.username + "#" + newMember.user.discriminator + " has changed username (from " + oldMember.user.username + "#" + oldMember.user.discriminator + ")"
        }

        if (oldMember.displayName != newMember.displayName) {
            event_data.content = newMember.user.username + "#" + newMember.user.discriminator + " has changed display name (from " + oldMember.displayName + " to " + newMember.displayName + ")"
        }

        if (oldMember.highestRole.name != newMember.highestRole.name) {
            event_data.content = newMember.user.username + "#" + newMember.user.discriminator + " became " + newMember.highestRole.name + " (from " + oldMember.highestRole.name + ")"
        }

        if (event_data.content) {
            API.updateViewer("Discord", viewer_data).then((viewer_updated) => {
                API.createEvent("Discord", event_data).then((event) => {}).catch((error) => {
                    console.log(" - " + "TrashMates API: CREATE EVENT FAILED".red)
                })
            }).catch((error) => {
                console.log(" - " + "TrashMates API: UPDATE VIEWER FAILED".red)
            })
        }

    }


    /**
     * Triggered when a Discord Member leaves the Discord Server
     *
     * @param {GuildMember} member
     */
    static onDiscordMemberRemove(member) {

        let viewer_data = {
            "userid": member.user.id,
            "username": member.user.username,
            "discriminator": member.user.discriminator,
            "role": "@everyone"
        }

        let event_data = {
            "userid": member.user.id,
            "type": "MEMBER_REMOVED",
            "content": member.user.username + "#" + member.user.discriminator + " has left the server"
        }

        API.updateViewer("Discord", viewer_data).then((viewer_updated) => {
            API.createEvent("Discord", event_data).then(() => {
                console.log(" - " + (viewer_data.userid).green + ": " + event_data.content)
            }).catch((errors) => {
                console.log(" - " + "TrashMates API: CREATE EVENT FAILED")
                console.log(" - " + (viewer_data.userid).yellow + ": " + event_data.content)
            })
        }).catch((errors) => {
            console.log(" - " + "TrashMates API: UPDATE VIEWER FAILED")
            console.log(" - " + (viewer_data.userid).red + ": " + event_data.content)
        })

    }

}
