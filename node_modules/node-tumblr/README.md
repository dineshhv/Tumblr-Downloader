# node-tumblr

use tumblr token access api, can set proxy.

**This repository is still in the test development phase, please do not download it, otherwise the consequences will be conceited.**

## Install

```
npm install node-tumblr
```

## Usage

```js
const Tumblr = require('node-tumlbr');

const api = new Tumblr({
	consumer_key: '',
	consumer_secret: '',
	token: '',
	token_secret: ''
});

api.dashBoard().then(res => {
	console.log(res);
});

// or use async and await
const res = await api.dashBoard();
console.log(res);
```

## Proxy

```js
api.setProxy({
	host: 'localhost', // url like sample.com
	port: '1087'
});
```

## API

> Now only API with get method can be used. If you find any problems in the process, please let me know.

```js
blogInfo
blogAvatar
blogLikes
blogFollowers
blogPosts
blogQueue
blogDrafts
blogSubmissions
userInfo
userDashboard
userFollowing
userLikes
taggedPosts
```

## Test

1. install [parcel](https://github.com/parcel-bundler/parcel)

```
// yarn
yarn global add parcel-bundler

// npm
npm install -g parcel-bundler
```

`npm run test` or `yarn test`

## Development

```
yarn build
```

## LICENSE

MIT
