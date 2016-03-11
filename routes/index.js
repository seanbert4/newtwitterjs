'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank.js');
var models = require('../models');
var Tweet = models.Tweet;
var User = models.User;

module.exports = function makeRouterWithSockets (io) {

// a reusable function
  function respondWithAllTweets (req, res, next){
    Tweet.findAll({include: [User]}).then(function(tweets) {
      
      tweets = tweets.map(function(tweet) {
        return {
          name: tweet.User.name,
          content: tweet.content,
          id: tweet.id
        };
      });

      res.render('index', {
        title: 'Twitter.js',
        tweets: tweets,
        showForm: true
      });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    User.findOne({where: {name: req.params.username}, include: [Tweet]}).then(function(user) {
      
      var tweets = user.Tweets;
      tweets = tweets.map(function(tweet) {
        return {
          name: user.name,
          content: tweet.content,
          id: tweet.id
        };
      });

      res.render('index', {
        title: user.name + "'s Tweets",
        tweets: tweets,
        showForm: true
      });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    console.log('Got to the get route');
    Tweet.findOne({where: {id: req.params.id}, include: [User]}).then(function(tweet) {
      
      tweet = [{
          name: tweet.User.name,
          content: tweet.content,
          id: tweet.id
        }
      ];

      res.render('index', {
        title: 'Twitter.js',
        tweets: tweet,
        showForm: true
      });
    });
  });

  router.delete('/tweets/:id', function(req, res, next){
    console.log("got to the delete route");
    Tweet.findOne({where: {id: req.params.id}, include: [User]}).then(function(tweet) {
      return tweet.destroy();
    }).then(function(){
      io.sockets.emit('delete_tweet', req.params.id);
      res.redirect('/');
    });
  });

  // create a new tweet
  router.post('/tweets', function(req, res, next){

    // Find user's ID number based on the username that was passed in the body of the post request

    User.findOrCreate({where: {name: req.body.name}}).spread(function(user) {
      Tweet.create({content: req.body.text, UserId: user.id}).then(function(tweet){
        io.sockets.emit('new_tweet', tweet.dataValues);
        res.redirect('/');
      })
    });


    // User.findOne({where: {name: req.body.name}}).then(function(user) {
    //   Tweet.create({content: req.body.text, UserId: user.id}).then(function(tweet){
    //     io.sockets.emit('new_tweet', tweet.dataValues);
    //     res.redirect('/');
    //   })
    // });
  });

  return router;
}
