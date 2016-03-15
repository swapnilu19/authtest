var co = require('co');

function fbrepo(db){
	this.db=db;
}

fbrepo.prototype.fetchAndUpdateRecord = function(profile){
	that	= this;
	return co(function*(){
		var doc = yield that.db.collection('userinfo')
			.findOne({
				'id': profile.id
			});
		if(doc)
		{
			console.log("user found");
			return doc;
		}
		else
		{
			doc={};
			doc.id=profile.id;
			doc.username=profile.displayName;
			doc.avatar = profile.photos	? profile.photos[0].value : "http://bootdey.com/img/Content/avatar/avatar1.png";
			var res = that.db.collection('userinfo').insert(doc);
			return doc;
		}
	});
};

module.exports = fbrepo;
