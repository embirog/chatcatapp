module.exports = (passport, FacebookStrategy, config, mongoose) => {

	var chatUser = new mongoose.Schema({
		profileID:String,
		fullname:String,
		profilePic:String
	})

	var userModel = mongoose.model('chatUser', chatUser);

	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		userModel.findById(id, (err, user) => {
			done(err, user);
		})
	});

	passport.use(new FacebookStrategy({
		clientID: config.fb.appID,
		clientSecret: config.fb.appSecret,
		callbackURL: config.fb.callbackURL,
		profileFields: ['id', 'displayName', 'photos']
	}, (accessToken, refreshToken, profile, done) => {
		// check if user exist in our monggo db 
		//if not create one
		//if user exist, simply retuen the profile

		userModel.findOne({'profileID': profile.id}, (err, result) => {

			if(result){
				done(null, result);
			} else {
				var newChatUser = new userModel({
					profileID: profile.id,
					fullname: profile.displayName,
					profilePic: profile.photos[0].value || ''
				});

				newChatUser.save((err) => {
					done(null, newChatUser);
				})
			}
		})
	}))

}