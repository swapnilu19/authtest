var co = require('co');
var User = require('./../models/user');
function fbrepo(db){
	this.db=db;
}

fbrepo.prototype.fetchAndUpdateRecord = function(profile){
	that	= this;
	return co(function*(){
		var doc = yield that.db.collection('userinfo')
			.findOne({
				'email': profile.emails[0].value
			});
		if(doc)
		{
			console.log("user found");
		
		}
		else
		{
			doc={};
			doc.email=profile.emails[0].value;
			doc.username=profile.displayName;
			doc.avatar = profile.photos	? profile.photos[0].value : "http://bootdey.com/img/Content/avatar/avatar1.png";
			var res = that.db.collection('userinfo').insert(doc);
		}
		return doc ? User.fromSrc('mongo',doc) : null;
	});
};

module.exports = fbrepo;
