var co = require('co');

function cropRepo(mongodb)
{
	this.mongodb=mongodb;
}

///////////////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.addCrop = function(crop){
	that=this;
	return co(function* (){
		var res = yield that.mongodb.collection('crops').insert(crop);
		return res;
	});
};

/////////////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.fetchCrops = function(user){
	that = this;
	return co(function* (){
		var crops =yield that.mongodb.collection('crops').find({useremail:user.email}).toArray();
		return crops;
	});
};

////////////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.addRequirement = function(requirement){
	that =this;
	return co(function* (){
		var res = yield that.mongodb.collection('requirements').insert(requirement);
		return res;
	});
};

///////////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.fetchRequirements = function(user){
	that = this;
	return co(function* (){
		var requirements = yield that.mongodb.collection('requirements').find({seekeremail:user.email}).toArray();
		return requirements;
	});
};

///////////////////////////////////////////////////////////////////////////////////////////
module.exports= cropRepo;
