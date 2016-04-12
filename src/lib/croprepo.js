var co = require('co');
var ObjectId  = require('mongodb').ObjectId;

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

//////////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.fetchRequirementsByEmail = function(email){
  that = this;
  return co(function* (){
    var requirements = yield that.mongodb.collection('requirements').find({seekeremail:email}).toArray();
    return requirements;
  });
};

///////////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.fetchAllRequirements = function(user){
  that = this;
  return co(function* (){
    var requirements = yield that.mongodb.collection('requirements').find({region:user.region}).toArray();
    return requirements;
  });
};

///////////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.fetchFulfilledRequirements = function(user){
	that=this;
	return co(function* (){
		var requirements = yield that.mongodb.collection('requirements')
			.find({
				region			:	user.region,
				fulfilled		:	"Yes"
		}).toArray();
		return requirements;
	});
};

///////////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.fetchPendingRequirements = function(user){
	that=this;
  return co(function* (){
    var requirements = yield that.mongodb.collection('requirements')
      .find({
        region      : user.region,
        fulfilled   : "No"
    }).toArray();
    return requirements;
  });
};

/////////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.fetchRegionRequirements = function(user){
	that=this;
  return co(function* (){
    var requirements = yield that.mongodb.collection('requirements')
      .find({
        seekeremail : user.email,
        region      : user.region,
    }).toArray();
    return requirements;
  });
};

///////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.updateRequirementStatus = function(tor,se,stat){
	that = this;
	var tof;
	if(stat=="Yes")
		tof=(new Date()).getTime();
	else
		tof=null;
	return co(function* (){
		var res = yield that.mongodb.collection('requirements')
			.update({
				timeofrequest:parseInt(tor,10),
				seekeremail:se
			},
			{
				$set:{fulfilled:stat,time_fulfilled:tof}
			});
		return res;
	});
};

//////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.updateTaskStatus = function(stat,id){
	that=this;
	var doc_id = new ObjectId(id);
	var tof=null;
	if(stat=="Completed")
		tof =  (new Date()).getTime();
	return co(function* (){
		var res = yield that.mongodb.collection('tasks')
			.update({_id:doc_id},
			{
				$set:{taskStatus:stat,completedOn:tof}
			});
			return res;
	});
};

//////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.addTaskByCrop	=	function(user,task,crop){
	that=this;
	return co(function*	(){
		var tasks=[];
		var crops = yield that.mongodb.collection('crops').find({'crop':crop}).toArray();
		for(var i=0;i<crops.length;i++)
		{
			var task = {
				'task'							:task,
				'crop'							:crop,							
  			'region'						:crops[i].region,
  			'assignedOn'				:(new Date()).getTime(),
  			'taskStatus'				:"Pending",
  			'completedOn'				:0,
  			'assignedBy'				:user,
  			'assignedTo'				:crops[i].updatedBy,
  			'assignerEmail'			:user.email,
  			'assigneeEmail'			:crops[i].useremail,
			}
			tasks.push(task);
		}
		var res = yield that.mongodb.collection('tasks').insert(tasks);
		return res;
	});
};

////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.addTaskbyFi	=	function(user,task,crop,fi){
	that=this;
	var taskk={
		'task'							:task,
		'crop'							:crop,
		'region'						:fi.region,
		'assignedOn'				:(new Date()).getTime(),
		'taskStatus'				:"Pending",
		'completedOn'				:0,
		'assignedBy'				:user,
		'assignedTo'				:fi,
		'assignerEmail'			:user.email,
		'assigneeEmail'			:fi.email,
	};
	return co(function* (){
		var res	= yield that.mongodb.collection('tasks').insert(taskk);
		return res;
	});
};

///////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.fetchTasks	=	function(user){
	that =this;
	return co(function* (){
		var tasks = yield that.mongodb.collection('tasks').find({assigneeEmail:user.email}).toArray();
		return tasks;
	});
};

//////////////////////////////////////////////////////////////////////////////////////

cropRepo.prototype.fetchFis = function(region){
	that=this;
	return co(function* (){
		var fis = yield that.mongodb.collection('userinfo').find({region:region,role:'fi'}).toArray();
		return fis;
	});
};
//////////////////////////////////////////////////////////////////////////////////////
module.exports= cropRepo;
