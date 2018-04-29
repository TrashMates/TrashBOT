// TrashBOT - TrashMatesAPI
// VERSION: 3.00
// AUTHOR: TiCubius <trashmates@protonmail.com>


const fs = require("fs")
const request = require("request")
const settings = JSON.parse(fs.readFileSync("app/config.json"))

module.exports = class API {

	constructor() {

		this.url = settings.api.url
		this.key = settings.api.key
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

			request.post(this.url + type.toLowerCase() + "/events/", {method: "POST", headers: {}, form: event}, (errors, response, body) => {

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

			request(this.url + type.toLowerCase() + "/messages", {method: "POST", headers: {}, form: message}, (errors, response, body) => {
				
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

			request(this.url + type.toLowerCase() + "/viewers", {method: "POST", headers: {}, form: viewer}, (errors, response, body) => {
				
				if (errors || response.statusCode != 201) {
					reject({"errors": "TrashMates API: " + type + " Viewer creation failed"})
				} else {
					let event_data = {
						"userid": viewer.userid,
						"type": "VIEWER_CREATED",
						"content": viewer.username + " was created"
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

			request(this.url + type.toLowerCase() + "/viewer/" + viewerid, {method: "GET", headers: {}}, (errors, response, body) => {

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

			request(this.url + type.toLowerCase() + "/viewer/" + viewer.userid, {method: "POST", headers: {}, form: viewer}, (errors, response, body) => {

				if (errors || response.statusCode != 201) {
					reject({"errors": "TrashMates API: " + type + " Viewer updating failed"})
				} else {
					resolve(JSON.parse(body))
				}

			})

		})

	}

}
