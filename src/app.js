var mongoClient				= require('mongodb').MongoClient;
var config						= require('./../config');
var co								= require('co');
var makeServer				= require('./server');
var PassportRepo			= require('./lib/passportrepo');

co(function* (){

	var mongodb = yield mongoClient.connect(config.mongodb.uri);
	var passportRepo = new PassportRepo(mongodb);
	var app = makeServer(mongodb,passportRepo);
	
	app.listen(config.server.port,function(err){
		if(err)
			console.log("Error starting app.",err);
		else
			console.log("Listening on port ",config.server.port);
	});
})
	.catch(function(err){
		console.log(err.stack);
	});
