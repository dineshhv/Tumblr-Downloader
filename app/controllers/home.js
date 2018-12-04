var express = require('express'),
  router = express.Router(),
  Article = require('../models/article'),
  // tmblr = require('tumblr-auto-auth'),
  fs = require('fs'),
  https = require('https'),
  request = require('request'),
  url = require('url'),
  exec = require('child_process').exec,
  spawn = require('child_process').spawn,
  sleep = require('sleep'),
  ProgressBar = require('progress');
const Tumblr = require('node-tumlbr');

var tumblr = require('tumblr.js');
var DOWNLOAD_DIR = 'safe/';
var mkdir = 'mkdir -p ' + DOWNLOAD_DIR;

var child = exec(mkdir, function(err, stdout, stderr) {
	    if (err){
	    	 throw err;
	    }
	    else {
	    	if(!fs.existsSync(DOWNLOAD_DIR+'all_collections')){
				fs.mkdirSync(DOWNLOAD_DIR+'all_collections');
			}
			if (!fs.existsSync(DOWNLOAD_DIR+'category')){
				fs.mkdirSync(DOWNLOAD_DIR+'category');
			}
	    };
});

var current =  0;
var bData = [];
module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  var articles = [new Article(), new Article()];
    res.render('index', {
      title: 'Generator-Express MVC',
      articles: articles
    });
});


router.get('/gfetch', function (req, res, next) {


  var client = tumblr.createClient({
    consumer_key: '8kkVwXXgqfnTeTgZXG0PAGqJ1GYsZnrDCAiUAulOXAjAzcNXcj',
    consumer_secret: 'lFPv0PPsfRUCOfjqyED3T5bBvG8rzwoU9E43ozmZ1CyVtltVGk',
    token: 'aoDbQm1BYfJulgXi7ryA4VulLijWpr7WfWOubNjGSzkY92JtmI',
    token_secret: 'Ty6guqPtwjXd5mjrM4ZwdOsf07Jw9hvcDF3nVlpksPfu5zhVHz'
  });



// Make the request
  client.likes( function (err, data) {
    if (!err) {
      var option = {
        "limit": 50
      }
      current = option.limit;
      bData = []
      getTumblrData(option,client, false, function (blogData) {
               // res.render('index', {
        //   title: 'Generator',
        //   blog: bData
        // });

        blogData.forEach(function(keys){
          keys.liked_posts.forEach(function(obj){

            if(obj.type == 'text'&&obj.slug!=''){
              var images = [];
              var videos = []
              var m, rex = /<img[^>]+src="http([^">]+)/g;
              while ( m = rex.exec( obj.trail[0].content_raw ) ) {
                images.push( 'http'+m[1] );
              }



              const regex = /{([^'>]+)/g;
              var m;
              while ((m = regex.exec(obj.trail[0].content_raw)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                  regex.lastIndex++;
                }

                // // The result can be accessed through the `m`-variable.
                m.forEach((match, groupIndex) => {
                  try {
                    var json = JSON.parse(match)

                    if(json && 'type' in json && json.type == "video"){
                      videos.push(json.media.url)
                    }
                  }
                  catch(err) {
                   // console.log("JSON ERROR")
                  }
                });
              }
            }
            console.log(images)
            console.log(videos)
            // else if(obj.type == 'photo'&&obj.slug!='')
            // {
            //
            //   var type = checkURL(obj.photos[0].original_size.url)
            //   if(obj.slug){
            //     if(obj.slug==' '||obj.slug==''){
            //       var name = obj.id;
            //     }
            //     else{
            //       var name = obj.slug
            //     }
            //   }
            //   else{
            //     var name = obj.id;
            //   }
            //
            //   var sourcedir = DOWNLOAD_DIR+'all_collections' ;
            //
            //   obj.photos.forEach(function(images, i){
            //     console.log(images)
            //     var source = sourcedir+'/'+name+i+'.'+type;
            //     download(images.original_size.url, source, function(e){
            //       console.log(e)
            //       obj.tags.forEach(function(tags){
            //
            //
            //
            //         var tags = tags.replace(/ /g,"_")
            //         var directory = DOWNLOAD_DIR+'category/'+tags;
            //         console.log(directory)
            //
            //         if (!fs.existsSync(directory)){
            //           fs.mkdirSync(directory);
            //         }
            //         var target = directory+'/'+name+'.'+type;
            //         copyFile(source,target)
            //
            //       })
            //       console.log('done');
            //     });
            //     console.log(images.original_size.url);
            //     sleep.usleep(500000)
            //   })
            // }
            // else if(obj.type == 'video'&&obj.slug!=''){
            //   var type = checkURL(obj.video_url)
            //   if(obj.slug){
            //     if(obj.slug==' '||obj.slug==''){
            //       var name = obj.id;
            //     }
            //     else{
            //       var name = obj.slug
            //     }
            //   }
            //   else{
            //     var name = obj.id;
            //   }
            //
            //   var sourcedir = DOWNLOAD_DIR+'all_collections' ;
            //
            //
            //   var type = obj.video_url.split('.')
            //     var source = sourcedir+'/'+obj.id+'.'+type[type.length-1];
            //     download(obj.video_url, source, function(e){
            //       console.log(e)
            //       obj.tags.forEach(function(tags){
            //
            //
            //
            //         var tags = tags.replace(/ /g,"_")
            //         var directory = DOWNLOAD_DIR+'category/'+tags;
            //         console.log(directory)
            //
            //         if (!fs.existsSync(directory)){
            //           fs.mkdirSync(directory);
            //         }
            //         var target = directory+'/'+name+'.'+type;
            //         copyFile(source,target)
            //
            //       })
            //       console.log('done');
            //     });
            //
            //
            // }
          })
        });


      })

    }
    else {
      console.log(error);
    }
  });
})


router.get('/fetch', function (req, res, next) {

 	// var mkdir = 'mkdir -p ' + DOWNLOAD_DIR;

	// var child = exec(mkdir, function(err, stdout, stderr) {
	//     if (err) throw err;
	//     else download_file_httpget(file_url);
	// });


	// tmblr.getAuthorizedClient({
	// 	userEmail: "<USERNAME>"
	// 	userPassword: "<PASSWORD>",
	// 	appConsumerKey:  "<CONSUMER KEY>",
	// 	appSecretKey: "<SECTRET KEY>",
	// 	debug: true
	// },

	// tmblr.getAuthorizedClient({ //
	// 	userEmail: "dhuvarak12@gmail.com",//"dinesh.drad@gmail.com", //
	// 	userPassword: "arundrvd10",
	// 	appConsumerKey: "8kkVwXXgqfnTeTgZXG0PAGqJ1GYsZnrDCAiUAulOXAjAzcNXcj",
	// 	appSecretKey: "lFPv0PPsfRUCOfjqyED3T5bBvG8rzwoU9E43ozmZ1CyVtltVGk",
	// 	debug: true
	// },



  var client = tumblr.createClient({
    consumer_key: '8kkVwXXgqfnTeTgZXG0PAGqJ1GYsZnrDCAiUAulOXAjAzcNXcj',
    consumer_secret: 'lFPv0PPsfRUCOfjqyED3T5bBvG8rzwoU9E43ozmZ1CyVtltVGk',
    token: 'aoDbQm1BYfJulgXi7ryA4VulLijWpr7WfWOubNjGSzkY92JtmI',
    token_secret: 'Ty6guqPtwjXd5mjrM4ZwdOsf07Jw9hvcDF3nVlpksPfu5zhVHz'
  });



  tmblr.interactiveAuthorization({ //getAuthorizedClient
		userEmail: "dhuvarak12@gmail.com",//"dinesh.drad@gmail.com", //
		//userPassword: "arundrvd10",
		appConsumerKey: "8kkVwXXgqfnTeTgZXG0PAGqJ1GYsZnrDCAiUAulOXAjAzcNXcj",
		appSecretKey: "lFPv0PPsfRUCOfjqyED3T5bBvG8rzwoU9E43ozmZ1CyVtltVGk",
		debug: true
	},
	function (error, client) {
		if (!error) {
			var option = {
				"limit": 50
			}
			current = option.limit;
			bData = []
			getTumblrData(option,client, true, function (blogData) {
				res.render('index', {
				      title: 'Generator',
				      blog: bData
				});

				blogData.forEach(function(keys){
					keys.liked_posts.forEach(function(obj){
						console.log(obj)
						if(obj.type == 'photo'&&obj.slug!='')
						{

							var type = checkURL(obj.photos[0].original_size.url)
							if(obj.slug){
								if(obj.slug==' '||obj.slug==''){
									var name = obj.id;
								}
								else{
									var name = obj.slug
								}
							}
							else{
								var name = obj.id;
							}

							var sourcedir = DOWNLOAD_DIR+'all_collections' ;

							obj.photos.forEach(function(images, i){
								sleep.sleep(1000)
								var source = sourcedir+'/'+name+i+'.'+type;
								download(images.original_size.url, source, function(e){
									console.log(e)
									obj.tags.forEach(function(tags){



										var tags = tags.replace(/ /g,"_")
										var directory = DOWNLOAD_DIR+'category/'+tags;
										console.log(directory)

										if (!fs.existsSync(directory)){
											   fs.mkdirSync(directory);
										}
										var target = directory+'/'+name+'.'+type;
										copyFile(source,target)

									})
									console.log('done');
								});
								console.log(images.original_size.url)
							})
						}
					})
				});


			})

		}
		else {
			console.log(error);
		}
	});

});

router.get('/fetch/:after', function (req, res, next) {
	var id = req.params.after
 	// var mkdir = 'mkdir -p ' + DOWNLOAD_DIR;

	// var child = exec(mkdir, function(err, stdout, stderr) {
	//     if (err) throw err;
	//     else download_file_httpget(file_url);
	// });


	// tmblr.getAuthorizedClient({
	// 	userEmail: "<USERNAME>"
	// 	userPassword: "<PASSWORD>",
	// 	appConsumerKey:  "<CONSUMER KEY>",
	// 	appSecretKey: "<SECTRET KEY>",
	// 	debug: true
	// },

	// tmblr.getAuthorizedClient({ //
	// 	userEmail: "dhuvarak12@gmail.com",//"dinesh.drad@gmail.com", //
	// 	userPassword: "arundrvd10",
	// 	appConsumerKey: "8kkVwXXgqfnTeTgZXG0PAGqJ1GYsZnrDCAiUAulOXAjAzcNXcj",
	// 	appSecretKey: "lFPv0PPsfRUCOfjqyED3T5bBvG8rzwoU9E43ozmZ1CyVtltVGk",
	// 	debug: true
	// },
	tmblr.interactiveAuthorization({ //getAuthorizedClient
		userEmail: "dhuvarak12@gmail.com",//"dinesh.drad@gmail.com", //
		//userPassword: "arundrvd10",
		appConsumerKey: "8kkVwXXgqfnTeTgZXG0PAGqJ1GYsZnrDCAiUAulOXAjAzcNXcj",
		appSecretKey: "lFPv0PPsfRUCOfjqyED3T5bBvG8rzwoU9E43ozmZ1CyVtltVGk",
		debug: true
	},
	function (error, client) {
		if (!error) {
			var option = {
				"limit": 50
			}
			current = option.limit;
			bData = []
			getTumblrData(option,client, false, function (blogData) {
				res.render('index', {
				      title: 'Generator',
				      blog: bData
				});

				blogData.forEach(function(keys){
					keys.liked_posts.forEach(function(obj){
						if(obj.type == 'photo'&&obj.slug!='')
						{

							var type = checkURL(obj.photos[0].original_size.url)
							if(obj.slug){
								if(obj.slug==' '||obj.slug==''){
									var name = obj.id;
								}
								else{
									var name = obj.slug
								}
							}
							else{
								var name = obj.id;
							}

							var sourcedir = DOWNLOAD_DIR+'all_collections' ;

							obj.photos.forEach(function(images, i){
								console.log(images)
								var source = sourcedir+'/'+name+i+'.'+type;
								download(images.original_size.url, source, function(e){
									console.log(e)
									obj.tags.forEach(function(tags){



										var tags = tags.replace(/ /g,"_")
										var directory = DOWNLOAD_DIR+'category/'+tags;
										console.log(directory)

										if (!fs.existsSync(directory)){
											   fs.mkdirSync(directory);
										}
										var target = directory+'/'+name+'.'+type;
										copyFile(source,target)

									})
									console.log('done');
								});
								console.log(images.original_size.url);
								sleep.usleep(500000)
							})
						}
					})
				});


			})

		}
		else {
			console.log(error);
		}
	});

});

function checkURL(url) {
	var parts=url.split('.')
    return parts[parts.length-1];
}

function copyFile(source, target) {
    return new Promise(function(resolve, reject) {
        var rd = fs.createReadStream(source);
        rd.on('error', reject);
        var wr = fs.createWriteStream(target);
        wr.on('error', reject);
        wr.on('finish', resolve);
        rd.pipe(wr);
    });
}



var download = function(url, dest, cb) {

  var file = fs.createWriteStream(dest);
    var request = https.get(url, function(response) {

        // check if response is success
        if (response.statusCode !== 200) {
            return cb('Response status was ' + response.statusCode);
        }

        response.pipe(file);
        file.on('response', function(res){
		  var len = parseInt(res.headers['content-length'], 10);
		  var bar = new ProgressBar('  downloading [:bar] :percent :etas', {
		    complete: '=',
		    incomplete: ' ',
		    width: 20,
		    total: len
		  })
		});
        file.on('data', function (chunk) {
		    bar.tick(chunk.length);
		});
        file.on('finish', function() {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    });

    // check for request error too
    request.on('error', function (err) {
        fs.unlink(dest);

        if (cb) {
            return cb(err.message);
        }
    });

    file.on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)

        if (cb) {
            return cb(err.message);
        }
    });
};


 function getTumblrData(option, client, recursive,callback) {
 	 client.likes(option,function (error, data) {

				var lastID = data.liked_posts[data.liked_posts.length-1];
				// console.log(data.liked_count+'>'+current)
				if(current<data.liked_count&&recursive)
				{
					current = current+option.limit
					option.after = lastID.timestamp;
					bData.push(data)
					getTumblrData(option,client, true, callback);
				}
				else
				{
					bData.push(data)
					callback(bData);
				}
	});
}


