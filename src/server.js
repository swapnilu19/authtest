var express 					=require('express');
var co 								=require('co');
var bodyParser 				=require('body-parser');
var redis							=require('redis');
var exphbs 						=require('express-handlebars');
var session 					=require('express-session');
var SessRedis 				=require('connect-redis')(session);
var config 						=require('./../config');
var passport					=require('passport');
var LocalStrategy 		=require('passport-local');
var FacebookStrategy	=require('passport-facebook').Strategy;
var TwitterStrategy		=require('passport-twitter');
var GoogleStrategy    =require('passport-google-oauth').OAuth2Strategy;
var wrap							=require('co-express');

var redisClient=redis.createClient({
			host 			: config.redis.host,
			port 			: config.redis.port,
			password	: config.redis.password,
			db				:	config.redis.db
	});
 

module.exports= function(db,passportRepo,fbrepo,twitterrepo,googlerepo,croprepo){
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
	
	passport.use('google',new GoogleStrategy({
		clientID					:	config.google.appid,
		clientSecret			:	config.google.appsecret,
		callbackURL				:	config.google.callbackurl
	},wrap(function* (token,refreshToken,profile,done){
		var user = yield googlerepo.fetchAndUpdateRecord(profile);
    if(user)
    {
      console.log(user);
      done(null,user);
    }
    else
    {
      done(null,null);
    }
	})));

	passport.use('facebook',new FacebookStrategy({
		clientID					: config.fb.appid,
		clientSecret			: config.fb.appsecret,
		callbackURL				:	config.fb.callbackurl,
		profileFields			:	['id','displayName','picture.type(large)','emails']
	},wrap(function* (access_token, refresh_token, profile,done){
		
		var user = yield fbrepo.fetchAndUpdateRecord(profile);
		if(user)
		{
			console.log(user);
			done(null,user);
		}
		else
		{
			done(null,null);
		}
	})	
	));

	passport.use('twitter',new TwitterStrategy({
		consumerKey				:	config.twitter.appkey,
		consumerSecret		:	config.twitter.appsecret,
		callbackURL				:	config.twitter.callbackurl,
		profileFields			:	['username','avatar','emails']
	},wrap(function* (token,tokenSecret,profile,done){
		console.log("profile");
		var user = yield twitterrepo.fetchAndUpdateRecord(profile);
		if(user)
		{
			console.log(user);
			done(null,user);	
		}
		else
		{
			done(null,null);
		}
	})
	));

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
				req.user=doc;
			}
			done(null,req.user);
		}
		else
		{
			console.log("could not log in");
			req.session.error = "email does not exists . Please try again";
			done(null,req.user);
		}
	})));

	passport.use('local-signup', new LocalStrategy({passReqToCallback:true},wrap(function* (req,username,password,done){
		var doc = yield passportRepo.localReg(username,password);
		var user= {
			'username' 	:username,
			'password' 	:password,
			'avatar'	 	:"http://bootdey.com/img/Content/avatar/avatar1.png"
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
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		res.render('home',req.user);
	});

	////////////////////////////////////////////////////////////////////

	app.get('/dashboard',function(req,res){
		res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
		console.log(req.user);
		if(req.user)
		{
			if(req.user.role)
			{
				console.log("role= ",req.user.role);
				switch(req.user.role){
					case 'fi':
						res.render('fi',req.user);
						break;
	
					case 'sd'	:
						res.render('sd',req.user);
						break;
					
					case 'admin':
						res.render('admin',req.user);
						break;
	
					default	:
						next('bad_role');
				}		
			}
			else
				res.render('dashboard',req.user);
		}
		else
			res.redirect('/signin');
	});

	////////////////////////////////////////////////////////////////////

	app.get('/add_requirement',function(req,res){
		if(req.user && req.user.role=="fi")
		{
			res.render('add_requirement',req.user);
		}
		else
			res.redirect('/');
	});

	///////////////////////////////////////////////////////////////////

	app.get('/requirements',wrap(function* (req,res){
		if(req.user && req.user.role=="fi")
		{
			var requirements = yield croprepo.fetchRequirements(req.user);
			var usr = req.user;
			usr.requirements=requirements;
			res.render('requirements',usr);
		}
		else
			res.redirect('/');
	}));

	///////////////////////////////////////////////////////////////////

	app.post('/add_requirement',wrap(function* (req,res){
		if(req.user && req.user.role=="fi")
		{
			var requirement = {
				askedby					:	req.user,
				seekeremail			:	req.user.email,
				crop						:	req.body.req_crop,
				items						:	req.body.items,
				region					:	req.body.req_region,
				fulfilled				:	"No",
				time_fullfilled	:	null,
				timeofrequest		:	(new Date()).getTime(),
			};
			var result	=	yield croprepo.addRequirement(requirement);
			res.redirect('/requirements');
		}  
		else
			res.redirect('/');
	}));

 ////////////////////////////////////////////////////////////////////

  app.get('/crops',wrap(function* (req,res){
    if(req.user && req.user.role=="fi")
    {
      var crops = yield croprepo.fetchCrops(req.user);
			var usr = req.user;
			usr.crops=crops;
      res.render('crops',usr);
    }
    else
      res.redirect('/');
  }));

  ///////////////////////////////////////////////////////////////////

  app.post('/add_crop',wrap(function* (req,res){
    if(req.user && req.user.role=="fi")
    {
      var crop = {
        crop        : req.body.crop_name,
        region      : req.body.region,
        area        : req.body.area,
        time        : (new Date()).getTime(),
        time_sowed  : req.body.seed_time,
        harvesttime : req.body.harvesttime,
        stage       : req.body.stage,
        updatedBy   : req.user,
        useremail   : req.user.email
      };
      var result  = yield croprepo.addCrop(crop);
      res.redirect('/crops');
    }
    else
      res.redirect('/');
  }));

	///////////////////////////////////////////////////////////////////
	app.get('/signin',function(req,res){
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
	console.log(req.user);
		if(req.user)
			res.redirect('/');
		else
			res.render('signin');
	});

	////////////////////////////////////////////////////////////////////

	app.post('/local-reg',passport.authenticate('local-signup',{
		successRedirect: '/dashboard',
		failureRedirect: '/signin'
	}));

	//////////////////////////////////////////////////////////////////

	app.post('/login',passport.authenticate('local-signin',{
		successRedirect: '/dashboard',
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

	app.get('/auth/facebook',passport.authenticate('facebook',{scope:'email'}));

	app.get('/auth/facebook/callback',passport.authenticate('facebook',{
		successRedirect	: '/dashboard',
		failureRedirect	: '/signin'
	}));
	
	/////////////////////////////////////////////////////////////////

	app.get('/auth/twitter',passport.authenticate('twitter'));

	app.get('/auth/twitter/callback',passport.authenticate('twitter',{
		successRedirect	:	'/dashboard',
		failureRedirect	:	'/signin'
	}));

	/////////////////////////////////////////////////////////////////

	app.get('/auth/google',passport.authenticate('google',{ scope : ['profile', 'email'] }));

  app.get('/auth/google/callback',passport.authenticate('google',{
    successRedirect : '/dashboard',
    failureRedirect : '/signin'
  }));

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
