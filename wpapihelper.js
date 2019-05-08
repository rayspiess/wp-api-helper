
var WPAPI = require('wpapi');

var wpapi = new WPAPI({
    // SUBSCRIBER READ ONLY INFO 
    // endpoint: 'http://localhost:63756/wp-json',
     endpoint: '/wp-json',
    // endpoint: 'https://it.wisc.edu/wp-json',
 
  //   endpoint: 'https://wwwtest.doitnet.doit.wisc.edu/wp-json',
    // endpoint: 'https://doitnet.doit.wisc.edu/wp-json',
     // username: 'wpapisubscriber',
     // password: 'XfK#%GO#!$$E2L1z!3dHPDz3'
 });

function WPAPIHELPER(endpointurl) {

    var endPoint = endpoint;
    var wp = new WPAPI({
        endpoint: endpointurl,
     });

    this.hello = function () {
        console.log('hello mars! 2');
    }

    this.dateRange = [
        // new Date(cnxn.lastThursday()),
        // new Date(cnxn.thisThursday())
        new Date('2017-12-30T01:01:00'),
        new Date('2018-01-26T11:59:00')];

this.postToGetId = '';

this.postArray = [{
postid: '',
title: 'Title',
postdate: '',
category: '',
categoryids: [{
catid: 0
}],
categoryslugs: [],
excerpt: 'excerpt',
fullcontent: '',
imageid: '',
imageurl: '',
imageset: {
alttext: "",
thumbnail: "",
medium: "", 
full: "", 
},
section: 9, 
sectionname: ''
}];

this.getPostsFromId = function (postId) {

console.log('row getPostsFromId: ' + postId);

var thisDoc = this;

this.postToGetId = postId;

return this.wpPostsFromId()
.then(function (result1) {
    return Promise.all([result1, thisDoc.imagePosts(result1), thisDoc.catPosts()]);
})
.then(function (results) {
    // do something with results[0] and results[1]
    console.log('getPostsFromId promise.all');
    return thisDoc.postArray;
})
.catch(function (e) {
    console.log('getPostsFromId  trouble: ' + e);
});
};

this.getPosts = function (startdate, enddate) {
var thisDoc = this;

this.dateRange[0] = new Date(startdate);
this.dateRange[1] = new Date(enddate);

return this.wpPosts()
.then(function (result1) {
    return Promise.all([result1, thisDoc.imagePosts(result1), thisDoc.catPosts()]);
})
.then(function (results) {
    // do something with results[0] and results[1]
    console.log('getPosts promise.all');
    return thisDoc.postArray;
})
.catch(function (e) {
    console.log('set wpPosts trouble: ' + e);
});
};

// first async
this.wpPosts = function () {

var thisDoc = this;
return wp.posts().perPage(100).after(this.dateRange[0]).before(this.dateRange[1])

.then(function (response) {
    thisDoc.postArray.pop();
    for (var i = 0; i < response.length; i++) {
        var postrow = response[i];
        console.log("getPost: " + postrow.title.rendered);
        if (postrow.id !== undefined) {
            thisDoc.postArray.push({
                postid: postrow.id,
                title: postrow.title.rendered,
             //   link: '<a href="' + postrow.link + '">' + postrow.title.rendered + '</a>',
                link: postrow.link,
                postdate: postrow.date,
                categoryids: postrow.categories,
                categoryslugs: [],
                section: 9,
                sectionname: '',
                excerpt: postrow.excerpt.rendered,
                fullcontent: postrow.content.rendered,
                imageid: postrow.featured_media,
                image: 'image',
                imageset: {
                    alttext: 'alttext!', 
                    thumbnail: 'thumbnail',
                    medium: 'medium',
                    full: 'full'
                }
            });
        }
    }
    // return thisDoc.postArray;
});
};

this.wpPostsFromId = function () {

console.log('row wpPostsFromId: ' + this.postToGetId);

var thisDoc = this;
return wp.posts().id(this.postToGetId)

.then(function (response) {

   // console.log('row length: ' + JSON.stringify(response));

    thisDoc.postArray.pop();
    //for (var i = 0; i < response.length; i++) {

        var postrow = response;
        console.log("getPost: " + postrow.title.rendered);
        if (postrow.id !== undefined) {
            thisDoc.postArray.push({
                postid: postrow.id,
                title: postrow.title.rendered,
             //   link: '<a href="' + postrow.link + '">' + postrow.title.rendered + '</a>',
                link: postrow.link,
                postdate: postrow.date,
                categoryids: postrow.categories,
                categoryslugs: [],
                section: 9,
                sectionname: '',
                excerpt: postrow.excerpt.rendered,
                fullcontent: postrow.content.rendered,
                imageid: postrow.featured_media,
                image: 'image',
                imageset: {
                    alttext: 'alttext!', 
                    thumbnail: 'thumbnail',
                    medium: 'medium',
                    full: 'full'
                }
            });
        }
   // }
    // return thisDoc.postArray;
});
};

this.imagePosts = function () {
var thisDoc2 = this;
console.log('then set images');
var promiseArray = []; // make list of setImage promise to do in .all
for (var i = 0; i < thisDoc2.postArray.length; i++) {
var mediaId = thisDoc2.postArray[i].imageid;
// console.log('set image: ' + mediaId);
if (mediaId > 0) {
    console.log('set image: ' + mediaId);
    promiseArray[i] = thisDoc2.setImage(i, mediaId);
}
else {
    // no media id? set to bucky
    promiseArray[i] = thisDoc2.setImage(i, 8843);
}
}
return Promise.all(promiseArray)  // do somehing with the images promise array
.then(function (results) {
    var thisDoc = this;
    console.log("images promise array");
    for (var i = 0; i < results.length; i++) {
        var image = results[i];
        if (image.id !== undefined) {
            console.log("set images results: " + image.index + "-" + image.id + "-" + image.url);
            thisDoc2.postArray[image.index].image = image.url;
            thisDoc2.postArray[image.index].imageset.alttext = image.alttext;
            thisDoc2.postArray[image.index].imageset.thumbnail = image.thumbnail;
            thisDoc2.postArray[image.index].imageset.medium = image.medium;
            thisDoc2.postArray[image.index].imageset.full  = image.full;
        }
        //console.log(typeof results[i]);
    }
    // return thisDoc.postArray;
});
};

this.catPosts = function () {
var thisDoc = this;
console.log("then set category slug:" + thisDoc.postArray.length);
var promiseCatSlugArray = [];
for (var i = 0; i < thisDoc.postArray.length; i++) {
var catIdArray = thisDoc.postArray[i].categoryids;
for (var c = 0; c < catIdArray.length; c++) {
    var catId = catIdArray[c];
    promiseCatSlugArray.push(thisDoc.setCatSlug(i, c, catId));
}
}
return Promise.all(promiseCatSlugArray)
.then(function (results) {
    console.log("categories promise array");
    for (var i = 0; i < results.length; i++) {
        var cat = results[i];
        if (cat.id !== undefined) {
            console.log("set category results: " + cat.index + "-" + cat.indexcat + "-" + cat.slug);
            thisDoc.postArray[cat.index].categoryslugs[cat.indexcat] = cat.slug;
        }
        //console.log(typeof results[i]);
    }
    // return thisDoc.postArray;
});
};

this.setImage = function (index, mediaId) {
console.log("setImage :: " + mediaId);
var thisDoc = this;
return wp.media().id(mediaId)
.then(function (response) {
    // thisDoc.postArray[index].imageurl = response.media_details.sizes.medium_large.source_url;

    var imgObj = {
        index: index,
        id: mediaId,
        alttext: response.alt_text,
        thumbnail: response.media_details.sizes.thumbnail.source_url,
        medium: response.media_details.sizes.medium.source_url,
        mediumlarge: response.media_details.sizes.medium_large.source_url,
        full: response.media_details.sizes.full.source_url,
        url: response.source_url
    };

    // return response.media_details.sizes.medium_large.source_url;
    return imgObj;
})
.catch(function (e) {
    console.log('image trouble:: ' + e); // "oh, no!"
    var imgObj = {
        index: index,
        id: mediaId,
        url: '/wp-content/uploads/no-image-found.jpg'
    };

    // return response.media_details.sizes.medium_large.source_url;
    return imgObj;
});
};

this.setCatSlug = function (index, indexCat, catId) {
if (catId !== undefined) {
var thisDoc = this;
return wp.categories().id(catId)
    .then(function (response) {
        console.log("setSlug: " + indexCat + " " + response.name);
        //thisDoc.postArray[index].categoryslugs[catSlugIndex] = response.name;

        var categoryObj = {
            index: index,
            indexcat: indexCat, 
            id: catId,
            slug: response.name
        };
        return categoryObj;
    })
    .catch(function (e) {
        console.log('set catslug trouble: ' + e); // "oh, no!"

        var categoryObj = {
            index: index,
            id: catId,
            slug: response.response.name
        };

        return categoryObj;

     });
}
};

// Not used... but good example of js Promise all
this.getImagePosts = function () {
var thisDoc = this;

Promise.all([firstThingAsync, secondThingAsync])
.then(function (results) {1.3
    // do something with result1 and result2
    // available as results[0] and results[1] respectively
})
.catch(function (err) { /* ... */ });
};

}

module.exports = WPAPIHELPER;