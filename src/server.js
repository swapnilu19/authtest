var express 			=require('express');
var co 						=require('co');
var bodyParser 		=require('body-parser');
var redis					=require('redis');
var exphbs 				=require('express-handlebars');
var session 			=require('express-session');
var SessRedis 		=require('connect-redis')(session);
var config 				=require('./../config');
var passport			=require('passport');
var LocalStrategy =require('passport-local');
var wrap					=require('co-express');

var redisClient=redis.createClient({
			host 			: config.redis.host,
			port 			: config.redis.port,
			password	: config.redis.password,
			db				:	config.redis.db
	});
 

module.exports= function(db,passportRepo){
	var app = express();
////////////////////////////////////////////////////////////////////////

	passport.serializeUser(function(user,done){
		console.log("serializing " + user.username);
		done(null,user);
	});

	passport.deserializeUser(function(obj,done){
		console.log("Deserializing " +obj);
		done(null,obj);
	});
	
	passport.use('local-signin', new LocalStrategy({passReqToCallback:true},wrap(function* (req,username,password,done){
		var doc = yield passportRepo.localAuth(username,password);
		var user={
			'username': username,
			'password': password,
		};
		if(doc)
		{
			if(doc.pass)
			{
				req.session.error= "Incorrect Password"; 
			}
			else
			{
				console.log("Logged in as : " +user.username);
				req.session.success = "You are successfully logged in " +user.username + "!";
				user.avatar = doc.avatar;
				req.user=user;
			}
			done(null,req.user);
		}
		else
		{
			console.log("could not log in");
			req.session.error = "Username does not exists . Please try again";
			done(null,req.user);
		}
	})));

	passport.use('local-signup', new LocalStrategy({passReqToCallback:true},wrap(function* (req,username,password,done){
		var doc = yield passportRepo.localReg(username,password);
		var user= {
			'username' :username,
			'password' :password,
			'avatar'	 :"http://bootdey.com/img/Content/avatar/avatar1.png"
		};
		if(doc)
		{
			console.log("username already taken");
			req.session.error = "That username is already in use. Please use a different one."
			done(null,req.user);
		}

		else
		{
			console.log("Registered: " + user.username);
			req.session.success = "You are successfully registered and logged in " + user.username + "!";
			req.user=user;
			done (null,req.user);
		}
	
	})));
 	
	/////////////////////////////////////////////////////////////////////
	
	app.use(bodyParser.urlencoded({extended:true}));
	app.use(bodyParser.json());
	
	app.set('views', __dirname + '/../views');
	app.engine('.hbs',exphbs({
		defaultLayout	: 'main',
		layoutsDir		: __dirname + '/../views/layouts',
		extname				: '.hbs'
	}));
	app.set('view engine','.hbs');

	app.use(session({
		store		: new SessRedis({client:redisClient}),
		secret	: config.session.secret
	}));

	app.use(passport.initialize());
	app.use(passport.session());

	//////////////////////////////////////////////////////////////////////

	app.use(function(req, res, next){
  	var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  	delete req.session.error;
  	delete req.session.success;
  	delete req.session.notice;

  	if (err) res.locals.error = err;
  	if (msg) res.locals.notice = msg;
  	if (success) res.locals.success = success;

  	next();
	});
	

	/////////////////////////////////////////////////////////////////////

	app.get('/',function(req,res){
		res.render('home',req.user);
	});

	////////////////////////////////////////////////////////////////////

	app.get('/signin',function(req,res){
		res.render('signin');
	});

	////////////////////////////////////////////////////////////////////

	app.post('/local-reg',passport.authenticate('local-signup',{
		successRedirect: ' /',
		failureRedirect: '/signin'
	}));

	//////////////////////////////////////////////////////////////////

	app.post('/login',passport.authenticate('local-signin',{
		successRedirect: '/',
		failureRedirect: '/signin'
	}));

	/////////////////////////////////////////////////////////////////

	app.get('/logout',function(req,res){
		var name =  req.user.username;
		console.log("Logging Out ",req.user.username);
		req.logout();
		res.redirect('/');
		req.session.notice  = "You have successfully been logged out " + name + "!";
	});

	/////////////////////////////////////////////////////////////////

	app.use(function (req, res, next) {
      next(new Error('NOT_FOUND'));
    });

	////////////////////////////////////////////////////////////////
    // Error handler
  app.use(function (err, req, res, next) {
      if (!err) {
        return next();
      }

      var predefinedErrs = {
        NOT_FOUND        : { code: 404, msg: 'Requested resource was not found'                      },
        INVALID_BROKER   : { code: 422, msg: 'Broker name missing or invalid'                        },
        INVALID_CHECKSUM : { code: 401, msg: 'Checksum mismatch'                                     },
        INVALID_IP       : { code: 422, msg: 'IP address of client does not match passed IP address' },
        MISSING_TOKEN    : { code: 422, msg: 'Broker session token missing'                          },
        MISSING_TS       : { code: 422, msg: 'Timestamp missing'                                     },
        REQ_EXPIRED      : { code: 422, msg: 'Attach request has expired'                            },
        FB_DISABLED      : { code: 400, msg: 'Facebook login has been disabled'                      },
        FB_STATE_MISMATCH: { code: 401, msg: 'State returned from FB does not match server\'s'       }
      };

      var response = {
        http_code : 500,
        error_code: 'SERVER_ERR',
        error_msg : 'Internal server error'
      };

      if (predefinedErrs[err.message]) {
        response.error_code = err.message;
        response.http_code  = predefinedErrs[err.message].code;
        response.error_msg  = predefinedErrs[err.message].msg;
      }

      res.status(response.http_code);
      res.json(response);
	});
	/////////////////////////////////////////////////////////////////

	return app;
};
