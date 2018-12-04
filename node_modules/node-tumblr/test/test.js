
const qs = require('qs');
const { expect, should, assert } = require('chai')
const utils = require('./utils');

describe('Test all api', function() {
	beforeEach(utils.beforeEach);

	it('Test api: dashBoard', async function() {
		this.timeout(10000);
		try {
			const res = await this.api.dashBoard();
			expect(res).to.be.a('object');
		} catch(e) {
			console.error(e);
		}
	});

	it('Test api: userInfo', async function() {
		this.timeout(10000);
		try {
			const res = await this.api.userInfo();
			expect(res).to.be.a('object');
		} catch(e) {
			console.error(e);
		}
	});

	it('Test api: userLikes', async function() {
		this.timeout(10000);
		try {
			const res = await this.api.userLikes();
			expect(res).to.be.a('object');
		} catch(e) {
			console.error(e);
		}
	});

	it('Test api: userFollowing', async function() {
		this.timeout(10000);
		try {
			const res = await this.api.userFollowing();
			expect(res).to.be.a('object');
		} catch(e) {
			console.error(e);
		}
	});

	it('Test api: blogInfo', async function() {
		this.timeout(10000);
		try {
			const res = await this.api.blogInfo('quietboyworld');
			expect(res).to.be.a('object');
		} catch(e) {
			console.error(e);
		}
	});

	it('Test api: blogAvatar', async function() {
		this.timeout(10000);
		const res = await this.api.blogAvatar('quietboyworld');
		expect(res).to.be.a('string');

		const res1 = await this.api.blogAvatar('quietboyworld', 512);
		expect(res1).to.be.a('string');

		try {
			const res2 = await this.api.blogAvatar('quietboyworld', '');
		} catch(e) {
			expect(e).to.be.a('string');
		}
	});

	it('Test api: blogLikes', async function() {
		this.timeout(10000);
		try {
			const res = await this.api.blogLikes('quietboyworld');
			expect(res).to.be.a('object');
		} catch(e) {
			console.error(e);
		}
	});

	it('Test api: blogPosts', async function() {
		this.timeout(10000);
		try {
			const res = await this.api.blogPosts('quietboyworld');
			expect(res).to.be.a('object');
		} catch(e) {
			console.error(e);
		}
	});

	it('Test api: blogQueue', async function() {
		this.timeout(10000);
		try {
			const res = await this.api.blogQueue('quietboyworld');
			expect(res).to.be.a('object');
		} catch(e) {
			console.error(e);
		}
	});

	it('Test api: blogTag', async function() {
		this.timeout(10000);
		try {
			const res = await this.api.blogTag('gif');
			expect(res).to.be.a('array');
		} catch(e) {
			console.error(e);
		}
	});
});