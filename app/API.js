// TrashBOT - TrashMatesAPI
// VERSION: 3.00
// AUTHOR: TiCubius <trashmates@protonmail.com>


const fs = require("fs")
const request = require("request")
const settings = JSON.parse(fs.readFileSync("app/config.json"))

// FIX: SSLv3 HANDSHAKE FAILURE
const tls = require('tls')
tls.DEFAULT_ECDH_CURVE = 'auto'

module.exports = class API {

	constructor() {

		this.trashmates = {}
		this.trashmates.url = settings.api.trashmates.url
		this.trashmates.token = settings.api.trashmates.token

		this.twitch = {}
		this.twitch.userid = settings.api.twitch.userid
		this.twitch.url = settings.api.twitch.url
		this.twitch.key = settings.api.twitch.key

		this.followers = []
	}


	/**
	 * POST - Adds a new Event
	 *
	 * @param {string} type Discord|Twitch
	 * @param {JSON} event {userid, type, content}
	 * @returns {Promise}
	 */
	createEvent(type, event) {

		return new Promise((resolve, reject) => {

			request.post(this.trashmates.url + type.toLowerCase() + "/events/", {method: "POST", headers: {"token": this.trashmates.token}, form: event}, (errors, response, body) => {

				if (errors || response.statusCode != 201) {
					reject({"errors": "TrashMates API: " + type + " Event creation failed"})
				} else {
					resolve(JSON.parse(body))
				}

			})

		})

	}


	/**
	 * POST - Adds a new Message
	 *
	 * @param {string} type Discord|Twitch
	 * @param {JSON} message {userid, channel, content, [id]}
	 * @returns {Promise}
	 */
	createMessage(type, message) {

		return new Promise((resolve, reject) => {

			request(this.trashmates.url + type.toLowerCase() + "/messages", {method: "POST", headers: {"token": this.trashmates.token}, form: message}, (errors, response, body) => {

				if (errors || response.statusCode != 201) {
					reject({"errors": "TrashMates API: " + type + " Message creation failed"})
				} else {
					resolve(JSON.parse(body))
				}

			})

		})

	}


	/**
	 * POST - Adds a new Viewer
	 *
	 * @param {string} type Discord|Twitch
	 * @param {JSON} viewer {userid, username, role, [discriminator]}
	 * @returns {Promise}
	 */
	createViewer(type, viewer) {

		return new Promise((resolve, reject) => {

			request(this.trashmates.url + type.toLowerCase() + "/viewers", {method: "POST", headers: {"token": this.trashmates.token}, form: viewer}, (errors, response, body) => {

				if (errors || response.statusCode != 201) {
					reject({"errors": "TrashMates API: " + type + " Viewer creation failed"})
				} else {
					let event_data = {
						"userid": viewer.userid,
						"type": "VIEWER_CREATED",
						"content": viewer.username + " was created"
					}

					if (type == "Discord") {
						event_data.type = "MEMBER_JOINED"
						event_data.content = viewer.username + "#" + viewer.discriminator + " has joined the server"
					}

					this.createEvent(type, event_data).then((event) => {
						resolve(JSON.parse(body))
					}).catch((error) => {
						resolve(JSON.parse(body))
					})
				}

			})

		})

	}


	/**
	 * GET - Retrives the Viewer
	 *
	 * @param {string} type Discord|Twitch
	 * @param {Number} viewerid
	 * @returns {Promise}
	 */
	fetchViewer(type, viewerid) {

		return new Promise((resolve, reject) => {

			request(this.trashmates.url + type.toLowerCase() + "/viewers/" + viewerid, {method: "GET", headers: {"token": this.trashmates.token}}, (errors, response, body) => {

				if (errors || response.statusCode != 200 || JSON.parse(body).hasOwnProperty("errors")) {
					reject({"errors": "TrashMates API: " + type + " Viewer retrieving failed"})
				} else {
					resolve(JSON.parse(body))
				}

			})

		})

	}


	/**
	 * PATCH - Updates the Viewer
	 *
	 * @param {string} type Discord|Twitch
	 * @param {JSON} viewer {username, role, [discriminator]}
	 * @returns {Promise}
	 */
	updateViewer(type, viewer) {

		viewer["_method"] = "patch"

		return new Promise((resolve, reject) => {

			request(this.trashmates.url + type.toLowerCase() + "/viewers/" + viewer.id, {method: "POST", headers: {"token": this.trashmates.token}, form: viewer}, (errors, response, body) => {

				if (errors || response.statusCode != 200) {
					reject({"errors": "TrashMates API: " + type + " Viewer updating failed"})
				} else {
					resolve(JSON.parse(body))
				}

			})

		})

	}


	/**
	 * GET - Fetch the 100 latest followers ID, from the Twitch API
	 */
	fetchLatestFollowersID() {

		return new Promise((resolve, reject) => {

			request(this.twitch.url + "users/follows?first=100&to_id=" + this.twitch.userid, {method: "GET", headers: {"Client-ID": this.twitch.key}}, (errors, response, body) => {

				if (errors || response.statusCode != 200) {
					reject({"errors": "Twitch API: Fetch Latest Followers ID failed"})
				} else {
					resolve(JSON.parse(body).data)
				}

			})

		})

	}

	/**
	 * GET - Fetch the 100 latest followers informations, from the Twitch API
	 */
	fetchLatestFollowers() {

		return new Promise((resolve, reject) => {

			this.fetchLatestFollowersID().then((followers) => {

				let url = this.twitch.url + "users/?id="
				followers.forEach((follower) => {
					if (this.followers.indexOf(follower.from_id) < 0) {
						this.followers.push(follower.from_id)

						url += follower.from_id + "&id="
					}
				})

				// We make a GET request to the Twitch API if the generated url
				// looks like https://twitch.tv/helix/users/?id=XXX,&id=
				// (and we remove the last 4 chars)
				let generated_url = url.slice(0, -4)

				if (generated_url != this.twitch.url + "users/") {
					request(generated_url, {method: "GET", headers: {"Client-ID": this.twitch.key}}, (errors, response, body) => {

						if (errors || response.statusCode != 200) {
							reject({"errros": "Twitch API: Fetch Latest Followers failed"})
						} else {
							resolve(JSON.parse(body).data)
						}

					})
				}

			}).catch((errors) => {
				console.log(" - " + "ERROR WHILE FETCHING LATEST FOLLOWERS ID".red)
			})

		})

	}


	/**
	 * GET - Fetch the Stream data for the Twitch User, from the Twitch API
	 */
	fetchStream() {

		return new Promise((resolve, reject) => {

			request(this.twitch.url + "streams?user_id=" + this.twitch.userid, {method: "GET", headers: {"Client-ID": this.twitch.key}}, (errors, response, body) => {

				if (errors || response.statusCode != 200) {
					reject({"errors": "Twitch API: Fetch Stream failed"})
				} else {
					let json = JSON.parse(body).data

					if (json.length > 0)
					{	
						json = json[0]
						
						this.fetchGame(json.game_id).then((game) => {
							json.game = game[0]
							resolve(json)
						}).catch((errors) => {
							reject({"errors": "Twitch API: Fetch Stream failed"})
						})
					} else {
						resolve([])
					}
				}

			})

		})

	}

	/**
	 * GET - Fetch tha Game daa for the Twitch Game ID, from the Twitch API
	 * 
	 * @param {int|string} gameid 
	 */
	fetchGame(gameid) {

		return new Promise((resolve, reject) => {

			request(this.twitch.url + "games?id=" + gameid, {method: "GET", headers: {"Client-ID": this.twitch.key}}, (errors, response, body) => {

				if (errors || response.statusCode != 200) {
					reject({"errors": "Twitch API: Fetch Game failed"})
				} else {
					resolve(JSON.parse(body).data)
				}

			})

		})

	}
}
