const Tumblr = require('../dist/index');
const config = require('./config');

module.exports = {
  beforeEach () {
		this.api = new Tumblr(config);
		
		if (config.host && config.port) {
			this.api.setProxy({
				host: 'localhost',
				port: '1087'
			});
		}
  }
}