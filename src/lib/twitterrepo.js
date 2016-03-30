var co = require('co');
var User =require('./../models/user');

function twitterrepo(db){
  this.db=db;
}

twitterrepo.prototype.fetchAndUpdateRecord = function(profile){
  that  = this;
  return co(function*(){
    var doc = yield that.db.collection('userinfo')
      .findOne({
        'username': profile.displayName
      });
    if(doc)
      console.log("user found");
    else
    {
      doc={};
      doc.username=profile.displayName;
      doc.avatar = profile.photos[0].value;
      var res = that.db.collection('userinfo').insert(doc);
    }
		return doc ? User.fromSrc('mongo',doc) : null;
  });
};

module.exports = twitterrepo;
