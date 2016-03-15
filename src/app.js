var mongoClient				= require('mongodb').MongoClient;
var config						= require('./../config');
var co								= require('co');
var makeServer				= require('./server');
var PassportRepo			= require('./lib/passportrepo');
var fbRepo						=	require('./lib/fbrepo');
var twitterRepo				=	require('./lib/twitterrepo');

co(function* (){

	var mongodb = yield mongoClient.connect(config.mongodb.uri);
	var passportRepo = new PassportRepo(mongodb);
	var fbrepo	= new fbRepo(mongodb);
	var twitterrepo	=	new twitterRepo(mongodb);
	var app = makeServer(mongodb,passportRepo,fbrepo,twitterrepo);
	
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
