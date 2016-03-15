var co = require('co');

function fbrepo(db){
	this.db=db;
}

fbrepo.prototype.fetchAndUpdateRecord = function(profile){
	that	= this;
	return co(function*(){
		var doc = yield that.db.collection('userinfo')
			.findOne({
				'username': profile.displayName
			});
		if(doc)
			return doc;
		else
		{
			doc={};
			doc.username=profile.displayName;
			doc.avatar = "http://bootdey.com/img/Content/avatar/avatar1.png";
			var res = that.db.collection('userinfo').insert(doc);
			return doc;
		}
	});
};

module.exports = fbrepo;
