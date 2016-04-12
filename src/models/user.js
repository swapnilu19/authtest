var _ = require('lodash');

function User(){
	this.username="";
	this.email="";
	this.avatar="";
	this.role="";
	this.region="";
	this.locat="";
}

User.fromSrc = function(src,data) {
	var usr = new User();
	
	switch(src){
		case 'mongo':
			_.each([
				'username',
				'email',
				'avatar',
				'role',
				'region',
				'locat'
			],function (key){
				if(data[key]){
					usr[key] = data[key];
				}
			});
	}
	return usr;
};
module.exports = User;
