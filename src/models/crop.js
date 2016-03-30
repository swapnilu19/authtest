var _ = require('lodash');
	
function Crop(){
	this.crop						="",
	this.region					="",
	this.area						="",
	this.time						="",
	this.time_sowed			=0,
	this.harvesttime		=0,
	this.state					="",
	this.updatedBy			="",
	this.useremail			="",
}

Crop.fromSrc=function(src,data){
	var crop = new Crop();
	switch(src){
		case 'mongo' :
			_.each([
				'crop',
				'region',
				'area',
				'time',
				'time_sowed',
				'harvesttime',
				'state',
				'updatedBy',
				'useremail'
			],function(key){
				if(data[key])
				{
					crop[key]=data[key];
				}
			}
		}
		return crop;
}
module.exports=Crop;
