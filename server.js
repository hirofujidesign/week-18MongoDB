var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(express.static('public'));



//Database configuration
mongoose.connect('mongodb://localhost/hypebeast');
var db = mongoose.connection;

db.on('error', function (err) {
console.log('Mongoose Error: ', err);
});
db.once('open', function () {
console.log('Mongoose connection successful.');
});

//Require Schemas
var Note = require('./models/Note.js');
var Article = require('./models/Article.js');


// Routes
app.get('/', function(req, res) {
  res.send(index.html);
  console.log("connected");
});


app.get('/scrape', function(req, res) {
  request('https://www.hypebeast.com', function(error, response, html) {
    var $ = cheerio.load(html);
    $('.thumbnail', '#latest-posts-feed').each(function(i, element) {

				var result = {};

				result.title = $(this).attr('title')
				result.link = $(this).attr('href');

				var entry = new Article (result);

				entry.save(function(err, doc) {
				  if (err) {
				    console.log(err);
				  } else {
				    console.log(doc);
				  }
				});


    });
  });
  res.send("Scrape Complete");
});


app.get('/articles', function(req, res){
//Finish the route so it responds with all articles
	Article.find({}, function(err, doc){
		console.log("found");
		res.send(doc);
		console.log(doc)
	})

});


app.get('/articles/:id', function(req, res){
	//Finish the route so it finds one article from the req.params.id,
	Article.findOne({_id: req.params.id})
	//populates "note",
	.populate("note")
	//and then responds with the article
	.exec(function (err, doc) {
		res.send(doc);
 		if (err) throw error;
		console.log('article', doc);
		res.json(doc);
	});
});


app.post('/articles/:id', function(req, res){
	//save a new note
	var newNote = new Note (req.body)
	newNote.save(req.body, function(err, save){
		if (err) throw error
		Article.update({_id:req.params.id},
		{note: req.params.id})
	})
	//then find an article from the req.params.id

	//and updates "note" with the _id of the new note

});








app.listen(3000, function() {
  console.log('App running on port 3000!');
});
