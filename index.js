var Crawler = require("crawler");
var url = require('url');
var moment = require('moment');
var algoliasearch = require('algoliasearch');

var client = algoliasearch('NQRZ4B0S4E', '01c0c02e962e08fc4a3133ded4473114');
var index = client.initIndex('trails');
index.clearIndex(function(err, content) {
    console.log(content);
});

var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
            console.log(error);
        }else{
            var $ = res.$;
            var trails = [];

            $(".calendar .vevent").each(function(i, line) {
                var trail = {
                    'name': $(line).find('.description a').attr('title'),
                    'date': moment($(line).find('.dtstart > span').attr('title'), 'YYYY-MM-DD').unix(),
                    'type': $(line).find('.sport_distance').text(),
                    'location': $(line).find('.location').text()
                };

                trails.push(trail);
            });

            index.addObjects(trails, function(err, content) {
                if (err) {
                    console.error(err);
                }
            });
        }
        done();
    }
});

c.queue({
    uri:"http://www.calendrier.dusportif.fr/agenda-trail",
    rotateUA: true,
    userAgent: [
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36'
    ]
});