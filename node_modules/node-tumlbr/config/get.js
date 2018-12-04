const API_BASE_URL = 'http://api.tumblr.com/v2';

function wrapUrl(api) {
	return API_BASE_URL + api;
}

module.exports = {
	userInfo: {
		url: wrapUrl('/user/info')
	},
	dashBoard: {
    url: wrapUrl('/user/dashboard'),
    defaultConfig: {
      limit: 20,
			offset: 0,
			// type: 'text, photo, quote, link, chat, audio, video, answer',
			since_id: 0,
			reblog_info: false,
			notes_info: true
    }
  },
  userLikes: {
    url: wrapUrl('/user/likes'),
    defaultConfig: {
      limit: 20,
      offset: 0,
      // before: null,
      // after: null
    }
	},
	userFollowing: {
		url: wrapUrl('/user/following'),
		defaultConfig: {
			limit: 20,
			offset: 0
		}
	},
	blogInfo: {
		url: ({blogIdentifier}) => wrapUrl(`/blog/${blogIdentifier}/info`)
	},
	blogAvatar: {
		url: ({blogIdentifier, size = ''}) => wrapUrl(`/blog/${blogIdentifier}/avatar/${size}`),
		isRemoveToken: true
	},
	blogLikes: {
		url: ({blogIdentifier}) => wrapUrl(`/blog/${blogIdentifier}/likes`),
		defaultConfig: {
			limit: 20,
			offset: 0,
      // before: null,
      // after: null
		}
	},
	blogPosts: {
		url: ({blogIdentifier, type = ''}) => wrapUrl(`/blog/${blogIdentifier}/posts/${type}`),
		defaultConfig: {
			// id: null,
			// tag: null,
			limit: 20,
			offset: 0,
			reblog_info: false,
			notes_info: false,
			// filter: null,
			// before: null
		}
	},
	blogQueue: {
		url: ({blogIdentifier}) => wrapUrl(`/blog/${blogIdentifier}/posts/queue`),
		defaultConfig: {
			limit: 20,
			offset: 0,
			// filter: null
		}
	},
	blogDrafts: {
		url: ({blogIdentifier}) => wrapUrl(`/blog/${blogIdentifier}/posts/draft`),
		defaultConfig: {
			// before_id: null, // number
			// filter: null, // string
		}
	},
	blogSubmissions: {
		url: ({blogIdentifier}) => wrapUrl(`/blog/${blogIdentifier}/posts/submission`),
		defaultConfig: {
			offset: 0,
			// filter: null
		}
	},
	blogTag: {
		url: wrapUrl('/tagged'),
		defaultConfig: {
			tag: '',
			limit: 20,
			// before: null,
			// filter: null
		}
	}
}
