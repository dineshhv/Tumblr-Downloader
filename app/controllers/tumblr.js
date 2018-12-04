var express = require('express');
var router = express.Router();
var http = require('http');
var fs = require('fs');
var tumblr = require('tumblr.js');
var settings = require('../../config/env.json');
var config = require('../../config/settings.json');
var exec = require('child_process').exec;
var client = tumblr.createClient(settings);
var likes = [];
var imageURLs = [];
var images = [];
var likeCount;
var pageCount;
var fetchLimit = 5;
var completedPages = 0;
var page,ts;
var lastEntry;
module.exports = function (app) {
  app.use('/', router);
};

router.get('/pages', function (req, res, next) {
	console.log(client)
	client.likes(function (err, resp) {
	  if (err) {
	    console.log(err);
	    return;
	  }
	 

	  likeCount = resp.liked_count;

	  // Number of pages of likes that must be parsed for the full set
	  // API returns a max of 20 per request
	  pageCount = Math.ceil(likeCount / fetchLimit);

	  console.log('Total likes: ' + likeCount);
	  var data = {"likes": 'Total likes: ' + likeCount, "pages":'Page requests necessary: ' + pageCount}
	  	res.render('pagecount', {
				      title: 'Page Count',
				      blog: data
		});
	  
	});

	
});


router.get('/likes/:page', function (req, res, next) {
	page = req.params.page


	client.likes(function (err, resp) {
	  if (err) {
	    console.log(err);
	    return;
	  }
	  var mkdir = 'mkdir -p ' + config.DOWNLOAD_DIR;
	  var child = exec(mkdir, function(err, stdout, stderr) {
	      if (err){
	         throw err;
	      }
	      else {
	        if(!fs.existsSync(config.DOWNLOAD_DIR+'all_collections')){
	        fs.mkdirSync(config.DOWNLOAD_DIR+'all_collections');
	      }
	      if (!fs.existsSync(config.DOWNLOAD_DIR+'category')){
	        fs.mkdirSync(config.DOWNLOAD_DIR+'category');
	      }
	      };
	  }); 

	  likeCount = resp.liked_count;

	  // Number of pages of likes that must be parsed for the full set
	  // API returns a max of 20 per request
	  pageCount = Math.ceil(likeCount / fetchLimit);

	  console.log('Total likes: ' + likeCount);
	  console.log('Page requests necessary: ' + pageCount);
	  if(page<=pageCount)
	  {
		  var i = page*fetchLimit;
		  console.log("Offset"+i)
		  // for (var i = 0; i < likeCount; i += 20) {
		    grabLikes(i,function(err,data){
		    	console.log(data)
		    	res.render('index', {
				      title: 'Generator',
				      blog: {"state":data,"ts":resp.liked_posts[0].liked_timestamp,"page":parseInt(page)+1}
				});
		    });
		  // }
	  }
	});
	
});


function grabLikes(offset,callback) {
	console.log("offset "+offset)
	console.log("fetchLimit "+fetchLimit)
  client.likes({
    offset: offset,
    limit: fetchLimit
  }, function (err, resp) {
    if (err) {
      console.log(err);
      return;
    }
    images = [];
    console.log(resp)
    resp.liked_posts.forEach(function (post) {
      likes.push(post);
      if (post.type === 'photo') {
        post.photos.forEach(function (photo) {
          // imageURLs.push(photo.original_size.url);
          images.push({"url":photo.original_size.url,"tags":post.tags,"slug":post.slug})
        });
      }

    });

    if(images.length==0)
    {
      	callback(null, 'all the posts are videos');
    }	
    completedPages++;
    console.log('Grabbed: requested Page ' + page);

    // if (completedPages === pageCount) {
      // Store JSON cause it might be useful later
    // 
    if(offset == 0)
    {
    	var lastEntry = {"lastEntry": resp.liked_posts[0].liked_timestamp}
    	writeJSON('lastEntry.json', lastEntry);
    }
    // console.log(images)
     writeJSON('likes.json', likes);
     writeJSON('photos.json', images);

      // TODO - Make this a callback instead of hardcoding
      fetchImages(function(err,data){
      		callback(null, data);
      });
    // }
  });
}

function fetchImages(callback) {
  // console.log(images)
  images.forEach(function (imageObj, index) {
    var filename = imageObj.url.split('/').pop();

    // Make sure file doesn't already exist before fetching
    fs.exists(config.DOWNLOAD_DIR+'all_collections/' + filename, function (exists) {
      if (!exists) {
        var file = fs.createWriteStream(config.DOWNLOAD_DIR+'all_collections/' + filename);

        http.get(imageObj.url, function (response) {
          response.pipe(file);
          // console.log('Response is '+imageObj.url+'<br />'+response.statusCode);
          file.on('finish', function() {
            // pipe done here, do something with file
             console.log('Pipe done: ' + filename);
             var source = config.DOWNLOAD_DIR+'all_collections/' + filename;
              imageObj.tags.forEach(function (tags, index) {
                  var directory = config.DOWNLOAD_DIR+'category/'+tags;
                  if (!fs.existsSync(directory)){
                    fs.mkdirSync(directory);
                  }
                  var target = directory+'/'+filename;
                  copyFile(source,target)
              })
              
              console.log('Image Copied: ' + filename);
          });
          // console.log('Downloaded: ' + filename);
          
        });
      } else {
        console.log('Already have: ' + filename);
      }

      if(index == images.length-1)
      {
      	 callback(null,images.length+ ' post downloaded');
      }
    });
  });


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

function writeJSON(filename, json) {
  fs.writeFile(filename, JSON.stringify(json, null, 4), function (err) {
    if (err) {
      console.log(err);
    }
  });
}

function readJSON(filename, callback) {
  	fs.readFile(filename, 'utf8', function (err, data) {
	  if (err){
	  	throw err
	  	callback(err, null);
	  }
	  else
	  {
		  // obj = JSON.parse(data);
		callback(null, JSON.parse(data));
	  }
  	});
}

router.get('/likesAfter', function (req, res, next) {
	fetchLikesafter(function(err,data){
		res.render('likesAfter', {
			title: 'Likes After',
			blog: {"img":images,"ts":lastEntry,"state":data}
		});
	})
	
})

function fetchLikesafter(callback){
	readJSON('lastEntry.json', function(err,Data){
		lastEntry = Data.lastEntry;
		grabLikesAfterTs(lastEntry,function(err,data){
			callback(null, data);
		})
		
	});
}

function grabLikesAfterTs(ts,callback) {
  client.likes({
    after: ts,
    limit: fetchLimit+1
  }, function (err, resp) {
    if (err) {
      console.log(err);
      return;
    }
    images = [];
    resp.liked_posts.forEach(function (post) {
      likes.push(post);
      if (post.type === 'photo') {
        post.photos.forEach(function (photo) {
          // imageURLs.push(photo.original_size.url);
          images.push({"url":photo.original_size.url,"tags":post.tags,"slug":post.slug})
        });
      }
    });

    // console.log(images)


    // if (completedPages === pageCount) {
      // Store JSON cause it might be useful later
    // 
    if(resp.liked_posts.length>0)
    {
	    var lastEntry = {"lastEntry": resp.liked_posts[0].liked_timestamp}
	    writeJSON('lastEntry.json', lastEntry);
	    fetchImages(function(err,data){
      		callback(null, data);
      	});
	}
	else
	{
		callback(null, 'No Data');
	}

      // TODO - Make this a callback instead of hardcoding
      
    // }

  });
}