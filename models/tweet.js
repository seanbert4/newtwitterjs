var Sequelize = require('sequelize');

module.exports = function(db) {

  var Tweet = db.define('Tweet', {
    content: Sequelize.STRING
  }, {
    timestamps: false // this will deactivate the time columns
  });

  return Tweet;
}