var _ = require('lodash');

function Task(){
  this.task           	="",
  this.region         	="",
  this.assignedOn				=0,
	this.taskStatus				="Pending",
	this.completedOn			=0,
  this.assignedBy				="",
	this.assignedTo				="",
	this.assignerEmail		="",
  this.assigneeEmail		="",
}

Task.fromSrc=function(src,data){
  var task = new Task();
  switch(src){
    case 'mongo' :
      _.each([
        'task',
        'region',
        'assignedOn',
        'taskStatus',
        'completedOn',
        'assignedBy',
        'assignedTo',
        'assignerEmail',
        'assigneeEmail'
      ],function(key){
        if(data[key])
        {
          task[key]=data[key];
        }
      }
    }
    return task;
}
module.exports=Task;
~                              
