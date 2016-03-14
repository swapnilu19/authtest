var co = require('co');
var bcrypt = require('bcryptjs');

function passportrepo(db){
	this.db= db;
}

passportrepo.prototype.localReg = function(username,password){
	var that =this;
	var hash = bcrypt.hashSync(password, 8);
	var user = {
		"username"	: username,
		"password"	: hash,
		"avatar"		: "http://bootdey.com/img/Content/avatar/avatar1.png"
	}; 
	return co(function* (){
		
		var doc = yield that.db.collection('userinfo')
			.findOne({
				'username' : username
			});
		if(doc)
		{
			console.log("username already exists");
		}
		else
		{
			console.log("username is free for use");
			var ins = yield that.db.collection('userinfo').insert(user);
			if(!ins)
				console.log("failed to insert");
			doc=null;
		}
		return doc;
	});
};

passportrepo.prototype.localAuth = function(username,password){
	var that =this;
	return co(function* (){
		var doc = yield that.db.collection('userinfo')
			.findOne({
				'username': username
			});
		if(doc)
		{
			console.log("Found User");
			var hash = doc.password;
			console.log(hash);
			console.log(bcrypt.compareSync(password,hash));
			if(bcrypt.compareSync(password,hash))
			{
				console.log("password match");
			}
			else
			{
				doc.pass = true;
				console.log("Wrong password");
			}
		}
		else
		{
			doc=null;
			console.log("user does not exist");
		}
		return doc;

	});
};

module.exports = passportrepo;


