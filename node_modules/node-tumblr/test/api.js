const Tumblr = require('../dist/index');
const config = require('./config');

const api = new Tumblr(config);
		
if (config.host && config.port) {
	api.setProxy({
		host: 'localhost',
		port: '1087'
	});
}

async function Test() {
	try {
		const res = await api.blogTag('gif');
		console.log(res)
	} catch(e) {
		console.error(e);
	}
}

Test();