var _ = require('lodash');

function Requirement(){
	this.askedBy					="",
	this.seekeremail			="",
	this.crop							="",
	this.items						="",
	this.region						="",
	this.locat						="",
	this.fulfilled				="No",
	this.time_fulfilled	="",
	this.timeofrequest		=""
}

Requirement.fromSrc = function(src, data){
	var requirement = new Requirement();
	
	switch(src){
		case 'mongo':
			_.each([
				'askedby',
				'seekeremail',
				'crop',
				'items',
				'region',
				'locat',
				'fullilled',
				'time_fullfilled',
				'timeofrequest'
			],function(key){
				if(data[key])
					requirement[key]= data[key];
			});
	}
	return	requirement;
}

module.exports=Requirement;  	
