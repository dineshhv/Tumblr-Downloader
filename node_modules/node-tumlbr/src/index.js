// @flow
const got = require('got');
const Oauth = require('oauth-1.0a');
const crypto = require('crypto');
const qs = require('qs');
const tunnel = require('tunnel');
const GET_URL = require('../config/get');

type TumblrProps = {
	consumer_key: string,
	consumer_secret: string,
	token: string,
	token_secret: string
}

type TumblrToken = {
	key: string,
	secret: string
}

type TypeConfig = {
	limit?: number,
	offset?: ?number,
	type?: string, //'text, photo, quote, link, chat, audio, video, answer',
	since_id?: number,
	reblog_info?: boolean,
	notes_info?: boolean,
	before?: number,
	after?: number,
	api_key?: string,
	type?: string,
	filter?: string
}

class Tumblr {
	consumer: TumblrToken;
	token: TumblrToken;
	oauth: Oauth;
	proxy: ?null;

	constructor(token: TumblrProps) {
		this.consumer = {
			key: token.consumer_key,
			secret: token.consumer_secret
		}
		this.token = {
			key: token.token,
			secret: token.token_secret
		}

		this.initOauth();
	}

	/**
	 * init token
	 */
	initOauth() {
		this.oauth = Oauth({
			consumer: this.consumer,
			signature_method: 'HMAC-SHA1',
			hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
		});
	}

	/**
	 * setting proxy
	 * @param {host port} proxy 
	 */
	setProxy(proxy: {
		host: string,
		port: string
	}) {
		this.proxy = tunnel.httpOverHttp({
			proxy: {
				host: proxy.host,
				port: proxy.port
			}
		});
	}

	/**
	 * handle get url
	 * @param {string} name url name
	 * @param {TypeConfig} querys querys
	 * @param {object} params params
	 */
	handleGetUrl(name: string, querys?: TypeConfig, params?: Object) {
		const querysValue = qs.stringify(querys);
		let url = '';

		if (typeof GET_URL[name].url === 'function') {
			url = GET_URL[name].url(params);
		} else {
			url = GET_URL[name].url;
		}

		if (querysValue !== '') {
			url = `${url}?${querysValue}`;
		}

		if (querys && querys.limit && (querys.limit < 1 || querys.limit > 20)) {
			throw('The number of results to return: 1–20, inclusive');
		}

		return url;
	}

	/**
	 * check querys.
	 */
	checkQuerysLimitBeforeAfter(querys: Object) {
		if (
			(querys.limit && querys.before) ||
			(querys.limit && querys.after) ||
			(querys.before && querys.after)
		) {
			throw(`1.You can only provide either before, after, or offset. If you provide more than one of these options together you will get an error.\n2.You can still use limit with any of those three options to limit your result set.\n3.When using the offset parameter the maximum limit on the offset is 1000. If you would like to get more results than that use either before or after.`);
		}

		if (querys.filter && ['raw', 'text'].indexOf(querys.filter) < 0) {
			throw('Specifies the post format to return, other than HTML:text,raw.');
		}
	}

	/**
	 * Assemble the data execution request
	 * @param {string} name 
	 * @param {object} querys - limit,offset .... or null
	 * 
	 * @return {Promise} Promise return
	 */
	getRequest(url: string, isRemoveToken?: boolean) {
		let	options = {
			json: true,
			timeout: 10000
		};

		if (this.proxy) {
			options = Object.assign({}, options, {
				agent: this.proxy
			});
		}
		if (!isRemoveToken) {
			options = Object.assign({}, options, {
				headers: this.oauth.toHeader(this.oauth.authorize({url, method: 'GET'}, this.token)),
			});
		}

		return got(url, options).then(res => {
			if (res.body && res.body.response) {
				return res.body.response;
			}

			return res.meta;
		})
	}

	/**
	 * Use this method to retrieve the user's account information that matches the OAuth credentials submitted with the request.
	 */
	userInfo() {
		const url = this.handleGetUrl('userInfo');
		return this.getRequest(url);
	}

	/**
	 * Use this method to retrieve the dashboard that matches the OAuth credentials submitted with the request.
	 * @param {object} GET_URL.dashBoard.defaultConfig
	 * 
	 * @method dashBoard
	 * @return {Promise} Promise return
	 */
	dashBoard(config?: TypeConfig) {
		const querys = Object.assign({}, GET_URL.dashBoard.defaultConfig, config);
		const url = this.handleGetUrl('dashBoard', querys);

		return this.getRequest(url);
	}

	/**
	 * Use this method to retrieve the liked posts that match the OAuth credentials submitted with the request.
	 * @param {object} GET_URL.userLikes.defaultConfig 
	 * 
	 * @method userLikes
	 * @return {Promise} Promise return
	 */
	userLikes(config?: TypeConfig) {
		const querys = Object.assign({}, GET_URL.userLikes.defaultConfig, config);
		const url = this.handleGetUrl('userLikes', querys);
		
		this.checkQuerysLimitBeforeAfter(querys);

		return this.getRequest(url);
	}

	/**
	 * Use this method to retrieve the blogs followed by the user whose OAuth credentials are submitted with the request.
	 * @param {object} config 
	 * 
	 * @method userFollowing
	 * @return {Promise} Promise return
	 */
	userFollowing(config?: TypeConfig) {
		const querys = Object.assign({}, GET_URL.userFollowing.defaultConfig, config);
		const url = this.handleGetUrl('userFollowing', querys);

		return this.getRequest(url);
	}

	/**
	 * This method returns general information about the blog, such as the title, number of posts, and other high-level data.
	 * @param {string} blogIdentifier - blogIdentifier id must give.
	 */
	blogInfo(blogIdentifier: string) {
		const querys = {
			api_key: this.consumer.key
		};
		const url = this.handleGetUrl('blogInfo', querys, {blogIdentifier});

		return this.getRequest(url);
	}

	/**
	 * You can get a blog's avatar in 9 different sizes. The default size is 64x64.
	 * @param {string} blogIdentifier blog id
	 * @param {number} size image size
	 */
	blogAvatar(blogIdentifier: string, size?: number) {
		if (typeof size !== 'undefined' && [16, 24, 30, 40, 48, 64, 96, 128, 512].indexOf(size) < 0) {
			throw('size value must in [16, 24, 30, 40, 48, 64, 96, 128, 512] and type is number.');
		}
		const url = this.handleGetUrl('blogAvatar', {}, {blogIdentifier, size});

		return new Promise((resolve) => {
			resolve(url);
		});
	}

	/**
	 * This method can be used to retrieve the publicly exposed likes from a blog.
	 * @param {string} blogIdentifier 
	 */
	blogLikes(blogIdentifier: string, config?: TypeConfig) {
		const querys = Object.assign({}, config, {
			api_key: this.consumer.key
		});
		this.checkQuerysLimitBeforeAfter(querys);
		const url = this.handleGetUrl('blogLikes', querys, {blogIdentifier});

		return this.getRequest(url);
	}

	/**
	 * get posts in blog
	 * @param {string} blogIdentifier 
	 * @param {object} config 
	 */
	blogPosts(blogIdentifier: string, config?: TypeConfig){
		const querys = Object.assign({}, config, {
			api_key: this.consumer.key
		});
		const params: {
			blogIdentifier: string,
			type?: string
		} = { blogIdentifier };

		if (config && config.type) {
			params.type = config.type;
		}

		const url = this.handleGetUrl('blogPosts', querys, params);

		return this.getRequest(url);
	}

	/**
	 * Retrieve Queued Posts
	 * @param {string} blogIdentifier 
	 * @param {TypeConfig} config 
	 */
	blogQueue(blogIdentifier: string, config?: TypeConfig) {
		const querys = Object.assign({}, GET_URL.blogQueue.defaultConfig, config);
		const url = this.handleGetUrl('blogQueue', querys, {blogIdentifier});

		this.checkQuerysLimitBeforeAfter(querys);

		return this.getRequest(url);
	}

	/**
	 * get drafts
	 * @param {string} blogIdentifier 
	 * @param {object} config 
	 */
	blogDrafts(blogIdentifier: string, config?: { before_id?: number, filter?: string }) {
		const querys = Object.assign({}, GET_URL.blogDrafts.defaultConfig, config);
		const url = this.handleGetUrl('blogDrafts', querys, {blogIdentifier});

		this.checkQuerysLimitBeforeAfter(querys);

		return this.getRequest(url);
	}

	/**
	 * Retrieve Submission Posts
	 * @param {string} blogIdentifier 
	 * @param {object} config 
	 */
	blogSubmissions(blogIdentifier: string, config?: { offset?: number, filter?: string }) {
		const querys = Object.assign({}, GET_URL.blogSubmissions.defaultConfig, config);
		const url = this.handleGetUrl('blogSubmissions', querys, {blogIdentifier});

		this.checkQuerysLimitBeforeAfter(querys);

		return this.getRequest(url);	
	}

	/**
	 * Get Posts with Tag
	 * @param {string} tag 
	 * @param {object} config 
	 */
	blogTag(tag: string, config?: {limit?: number, before?: number, filter?: string}) {
		const querys = Object.assign({}, GET_URL.blogTag.defaultConfig, config, {tag});
		const url = this.handleGetUrl('blogTag', querys);

		this.checkQuerysLimitBeforeAfter(querys);

		return this.getRequest(url);		
	}
}

module.exports = Tumblr;