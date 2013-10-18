var fs = require('fs');
var execSync = require('exec-sync');
var git = require('gift');
var util = require('util');

var colors = require('colors');
colors.setTheme({
	prompt: 'grey',
	success: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

var wpcli = {
	options       : require('./options.js'),
	exec          : require('child_process').exec,
	isInstalled   : false,
	version       : undefined,
	wpIsInstalled : undefined
};



/**
 * Checks to see if WP CLI tools exist
 *
 * @todo Offer to install WP CLI and set them up for the user
 *
 * @return boolean false
 */
wpcli.checkIsInstalled = function() {
	var error = execSync('wp');

	var isWin = !!process.platform.match(/^win/),
			isInstalled = ( typeof error === 'string' ),
			errorMsg
	;

	if ( isWin ) {
		errorMsg = "Sorry, this will not work on a Windows box since a UNIX\n environment is required for WP CLI. \n";
		util.puts(errorMsg);
	} else if ( !isInstalled ) {
		errorMsg = "WP CLI is not installed please visit http://wp-cli.org/ for installation information. \n";
		util.puts(errorMsg);
		util.puts(error);
	} else {
		wpcli.isInstalled = isInstalled;
		wpcli.options.init();
	} // if/elseif/else()

	return false;
};



/**
 * Makes sure the call back is not undefined before executing it.
 *
 * @param  Function callback Callback to be executed
 *
 * @return Function          Callback to be executed
 */
wpcli.callback = function( callback ) {
	if ( typeof callback !== 'undefined' ) {
		callback();
		return false;
	} // if()

	return false;
};



/**
 * mkdir Synchronously
 *
 * @param  string  directory File directory path to make.
 *
 * @return boolean           false
 */
wpcli.mkdirSync = function( directory ) {
	if ( fs.existsSync( directory ) ) {
		return false;
	} // if()

	fs.mkdirSync( directory );

	return false;
};



/**
 * Checks if the current directory has WordPress installed.
 *
 * @param Function callback Function to execute after wp is installed check has completed.
 *
 * @return boolean false
 */
wpcli.checkWpIsInstalled = function( callback ) {
	var error = execSync("wp core is-installed",true);
	var isInstalled = ( error.stderr.indexOf('wp core download') === -1 );
	wpcli.wpIsInstalled = isInstalled;
	wpcli.callback( callback( isInstalled ) );
	return false;
};



/**
 * Handles the installation of WordPress
 *
 * @todo Add install progress notification
 * @todo Add overwrite flag
 *
 * @return boolean false
 */
wpcli.installWordPress = function( callback ) {
	var options          = wpcli.options,
			installDirectory = options.site.installDirectory,
			directoryName    = options.site.directoryName,
			siteDirectory    = installDirectory + '/' + directoryName
	;

	// CD into new directory
	try {
		process.chdir(installDirectory);
	}
	catch (err) {
		console.log( err.error );
		process.exit();
	} // try/catch()

	var successMsg = 'Success: Current directory is now ' + installDirectory;
	util.puts( successMsg.success );

	// Check/Make new directory
	wpcli.mkdirSync( siteDirectory );
	successMsg = 'Success: New directory created ' + siteDirectory;
	util.puts( successMsg.success );

	// CD into new directory
	try {
		process.chdir( siteDirectory );
	}
	catch (err) {
		console.error( err.error );
	} // try/catch()
	successMsg = 'Success: Current directory is now ' + siteDirectory;
	util.puts( successMsg.success );

	// Check for WordPress install
	wpcli.checkWpIsInstalled(function( isInstalled ){
		if ( isInstalled ) {
			// Move on to wp-config.php
			var existsMsg = 'WordPress already exists in ' + siteDirectory;
			util.puts( existsMsg.warn );
			wpcli.callback( callback );

			return;
		} // if()

		// Install WordPress
		var downloadMsg = 'Installing WordPress to ' + siteDirectory + ' this can take awhile depending on your connection speed...';
		util.puts( downloadMsg.warn );

		var error = execSync("wp core download");
		if ( typeof error === 'string' ) {
			var successMsg = 'Success: WordPress was installed to ' + siteDirectory + ' successfully!';
			util.puts( successMsg.success );
			wpcli.callback( callback );
		} else {
			var errorMsg = "I'm sorry something went wrong, please try again. \n" + error;
			console.error( errorMsg.error );
			process.exit();
		} // if/else
	});

	return false;
};



/**
 * Adds and fills out WordPress wp-config.php file
 *
 * @todo Figure out why this doesn't work correctly
 * @todo Fix config already exists checking
 *
 * @return boolean false
 */
wpcli.addWpConfig = function( callback ) {
	util.puts( 'Creating wp-config.php...' );
	var db = wpcli.options.db;
	var initWpConfig = 'wp core config ' +
	'--dbname=' + db.name + ' ' +
	'--dbuser=' + db.user + ' ' +
	'--dbpass=' + db.pass + ' ' +
	'--dbprefix=' + db.prefix + ' ' +
	'--dbhost=' + db.host;

	var error = execSync(initWpConfig,true);
	if ( error.stderr === '' ) {
		util.puts( 'Success: wp-config.php created!'.success );
		wpcli.callback( callback );
	} else if( error.stderr.toString().indexOf('file already exists') !== -1 ) {
		util.puts( 'Warning: wp-config.php already exists'.warn );
		wpcli.callback( callback );
	} else {
		var errorMsg = "I'm sorry something went wrong creating wp-config.php, please try again. \n" + error;
		console.error( errorMsg.error );
		process.exit();
	} // if/elseif/else()

	return false;
};



/**
 * Adds a MySQL database for the WordPress install
 *
 * @return boolean false
 */
wpcli.addDatabase = function( callback ) {
	util.puts( 'Creating database...' );
	var mysql      = require('mysql');
	var db         = wpcli.options.db;
	var connection = mysql.createConnection({
		host     : db.host,
		user     : db.user,
		password : db.pass,
	});
	connection.connect();
	connection.query('CREATE DATABASE IF NOT EXISTS ' + db.name, function(err) {
		if ( err !== null ) {
			var errorMsg =  'There was an issue accessing the database.\n' + err;
			console.error( errorMsg.error );
			process.exit();
		} else {
			util.puts( 'Database created...' );
			wpcli.callback( callback );
		} // if/else()
	});

	return false;
};



/**
 * Runs the WordPress database install
 *
 * @todo use wp core install it was having some issues with MAMP
 *
 * @return boolean false
 */
wpcli.databaseInstall = function( callback ) {
		var site = wpcli.options.site,
				admin = wpcli.options.admin
		;
	var coreInstall = 'wp core install ' +
	'--url=' + site.url + ' ' +
	'--title=' + site.title + ' ' +
	'--admin_name=' + admin.name + ' ' +
	'--admin_password=' + admin.password + ' ' +
	'--admin_email=' + admin.email + ' ';
	util.puts( 'Installing WordPress database tables...' );

	var error = execSync(coreInstall,true);
	var wpAlreadyInstalled = ( error.stdout.toLowerCase().indexOf('already installed') === -1 );
	var installSuccess = ( error.stdout.toLowerCase().indexOf('installed successfully') === -1 );

	if ( installSuccess ) {
		util.puts( 'Success: WordPress database tables successfully installed!'.success );
		wpcli.callback( callback );
	} else if( wpAlreadyInstalled ) {
		util.puts( 'Warning: WordPress database tables already installed.'.warn );
		wpcli.callback( callback );
	} else {
		var errorMsg = 'Something went wrong when installing WordPress database tables ' + error;
		util.puts( errorMsg.error );
		process.exit();
	} // if/else()

	return false;
};


wpcli.execOutput = function( stdout, stderr ) {
	if ( stdout !== '' ) {
		var successMsg = 'Success: '+stdout;
		util.puts( successMsg.success );
	} else {
		util.puts( stderr.warn );
	} // if/else()

	return;
};


/**
 * Installs some suggested development plugins
 *
 * @todo Add options/select which ones should be installed
 * @todo Add some way to allow user to include more by plugin slug
 * @todo Look into a way to install and activate gravity forms and other plugins not in the directory
 * @todo Add option to totally disable
 *
 * @return {[type]} [description]
 */
wpcli.installPlugins = function(callback) {
	var execResponse;
	util.puts( 'Installing Plugins...' );

	// Regenerate Thumbnails
	execResponse = execSync( 'wp plugin install regenerate-thumbnails --activate', true);
	wpcli.execOutput( execResponse.stdout, execResponse.stderr );

	// Database Reset
	execResponse = execSync( 'wp plugin install wordpress-database-reset', true);
	wpcli.execOutput( execResponse.stdout, execResponse.stderr );

	// Debug Bar
	execResponse = execSync( 'wp plugin install debug-bar --activate' ,true);
	wpcli.execOutput( execResponse.stdout, execResponse.stderr );

	// Debug Bar Console
	execResponse = execSync( 'wp plugin install debug-bar-console --activate' ,true);
	wpcli.execOutput( execResponse.stdout, execResponse.stderr );

	// Theme Check
	execResponse = execSync( 'wp plugin install theme-check --activate' ,true);
	wpcli.execOutput( execResponse.stdout, execResponse.stderr );

	// WordPress Importer
	execResponse = execSync( 'wp plugin install wordpress-importer --activate', true);
	wpcli.execOutput( execResponse.stdout, execResponse.stderr );

	// Developer
	execResponse = execSync( 'wp plugin install developer --activate', true);
	wpcli.execOutput( execResponse.stdout, execResponse.stderr );

	wpcli.callback( callback );
};



/**
 * Un-installs default plugins
 *
 * @return boolean false
 */
wpcli.uninstallPlugins = function( callback ) {
	var uninstallHello   = wpcli.options.plugins.uninstall.hello,
			uninstallAkismet = wpcli.options.plugins.uninstall.akismet,
			execResponse
	;
	// Uninstall Hello World
	if ( uninstallHello ) {
		util.puts( 'Uninstalling Hello World...' );
		execResponse = execSync( 'wp plugin uninstall hello', true);
		wpcli.execOutput( execResponse.stdout, execResponse.stderr );
	} // if()

	// Uninstall Akismet
	if ( uninstallAkismet ) {
		util.puts( 'Uninstalling Akismet...' );
		execResponse = execSync( 'wp plugin uninstall akismet', true);
		wpcli.execOutput( execResponse.stdout, execResponse.stderr );
	} // if()

	wpcli.callback( callback );

	return false;
};



/**
 * Installs WordPress theme from external source
 *
 * @return boolean false
 */
wpcli.installTheme = function( callback ) {
	if ( !wpcli.options.theme.installTheme ) {
		wpcli.callback( callback );
		return;
	} // if()

	var options          = wpcli.options,
			theme            = options.theme,
			github           = options.githubTheme,
			installDirectory = options.site.installDirectory,
			directoryName    = options.site.directoryName,
			siteDirectory    = installDirectory + '/' + directoryName,
			themesDirectory  = siteDirectory + '/wp-content/themes/',
			themeSlug        = theme.slug,
			themeDirectory   = themesDirectory+themeSlug+'/'
	;

	// CD into themes directory
	try {
		process.chdir(themesDirectory);
		var successMsg = 'Success: Current directory is now '+themesDirectory;
		util.puts( successMsg.success );
	}
	catch (err) {
		console.log( err.error );
		process.exit();
	} // try/catch()

	// Clone Repository
	util.puts( 'Cloning '+github.gitRemote+' to /wp-content/themes/'+themeSlug+'...' );
	git.clone( github.gitRemote, themeDirectory, function(error, repo) {
		var alreadyExists;
		if ( error !== null ) {
			alreadyExists = ( error.toString().toLowerCase().indexOf('already exists') !== -1 );
		} else {
			alreadyExists = false;
		} // if/else()

		if ( alreadyExists ) {
			var warningMsg = 'Warning: '+themeDirectory+' already exists!';
			util.puts( warningMsg.warn );
			wpcli.callback( callback );
			return;
		} else if( error ) {
			throw error;
		} else {
			// CD into cloned theme directory
			try {
				process.chdir(themeDirectory);
			}
			catch (err) {
				console.log( err.error );
				process.exit();
			} // try/catch()

			var successMsg = 'Success: Current directory is now ' + themeDirectory;
			util.puts( successMsg.success );
			util.puts( 'Removing GitHub remote');
			execSync('rm -Rf .git');
			successMsg = 'Success: GitHub remote removed.';
			util.puts( successMsg.success);
			wpcli.callback( callback );
			return;
		} // if/elseif/else()
	});

	return false;
};



/**
 * Fills out themes style.css
 *
 * @todo Make this work on an empty file
 * @todo License information
 *
 * @return boolean false
 */
wpcli.themeStyleSheet = function( callback ) {
	if ( !wpcli.options.theme.installTheme ) {
		wpcli.callback( callback );
		return;
	} // if()

	var options          = wpcli.options,
			theme            = options.theme,
			installDirectory = options.site.installDirectory,
			directoryName    = options.site.directoryName,
			siteDirectory    = installDirectory + '/' + directoryName,
			themesDirectory  = siteDirectory + '/wp-content/themes/',
			themeSlug        = theme.slug,
			themeDirectory   = themesDirectory+themeSlug+'/'
	;

	// CD into cloned theme directory
	try {
		process.chdir(themeDirectory);
	}
	catch (err) {
		console.log( err.error );
		process.exit();
	} // try/catch()

	var styleCSS       = themeDirectory+'/style.css';
	var styleCSSExists = fs.existsSync( styleCSS );
	var linesFound     = 0;
	if ( styleCSSExists ) {
		util.puts( 'Writing theme information to style.css...');
		var styleCssLines = fs.readFileSync(styleCSS).toString().split("\n");
		for(var i in styleCssLines) {
			var line = styleCssLines[i];

			// Theme Name
			if ( line.indexOf('Theme Name:') !== -1 ) {
				styleCssLines[i] = 'Theme Name: ' + theme.name;
				linesFound = linesFound + 1;
			} // if()

			// Theme URI
			if ( line.indexOf('Theme URI:') !== -1 ) {
				styleCssLines[i] = 'Theme URI: ' + theme.uri;
				linesFound = linesFound + 1;
			} // if()

			// Description
			if ( line.indexOf('Description:') !== -1 ) {
				styleCssLines[i] = 'Description: ' + theme.description;
				linesFound = linesFound + 1;
			} // if()

			// Version
			if ( line.indexOf('Version:') !== -1 ) {
				styleCssLines[i] = 'Version: ' + theme.version;
				linesFound = linesFound + 1;
			} // if()

			// Author
			if ( line.indexOf('Author:') !== -1 ) {
				styleCssLines[i] = 'Author: ' + theme.author;
				linesFound = linesFound + 1;
			} // if()

			// Author URI
			if ( line.indexOf('Author URI:') !== -1 ) {
				styleCssLines[i] = 'Author URI: ' + theme.authorUri;
				linesFound = linesFound + 1;
			} // if()

			styleCssLines[i] = styleCssLines[i] + "\n";
		} // for()

		fs.writeFileSync( styleCSS, styleCssLines.join('') );
		var successMsg = 'Success: Theme information written to style.css...';
		util.puts( successMsg.success);

		wpcli.callback( callback );
		return;
	} else {
		util.puts( 'Warning: style.css is missing!'.warn);
		wpcli.callback( callback );
		return;
	}
	return false;
};


/**
 * Activates the WordPress theme
 *
 * @param  Function callback
 *
 * @return function            callback
 */
wpcli.activateTheme = function( callback ) {
	if ( !wpcli.options.theme.installTheme ) {
		wpcli.callback( callback );
		return;
	} // if()

	var options          = wpcli.options,
			theme            = options.theme
	;

	// Activate Theme
	util.puts( 'Activating theme...');
	var activateThemeResponse = execSync( 'wp theme activate '+theme.slug,true );
	wpcli.execOutput(activateThemeResponse.stdout, activateThemeResponse.stderr);
	wpcli.callback( callback );
	return;
};


/**
 * Initializes an empty git repository
 *
 * @todo add options to option.js for this method
 *
 * @return {[type]} [description]
 */
wpcli.initGit = function() {

};


wpcli.getGruntDevDependencies = function() {
	var options          = wpcli.options,
			theme            = options.theme,
			installDirectory = options.site.installDirectory,
			directoryName    = options.site.directoryName,
			siteDirectory    = installDirectory + '/' + directoryName,
			themesDirectory  = siteDirectory + '/wp-content/themes/',
			themeSlug        = theme.slug,
			themeDirectory   = themesDirectory+themeSlug+'/',
			gruntJsFile      = themeDirectory+'Gruntfile.js'
	;
	if ( !fs.existsSync( gruntJsFile ) ) {
		return '{}';
	}

	var GruntJsLines = fs.readFileSync(gruntJsFile).toString().split("\n");
	var devDependencies = '{\n';
	for(var i in GruntJsLines) {
		var line = GruntJsLines[i];
		console.log(line);
		if ( line.indexOf('grunt.loadNpmTasks') !== -1 ) {
			line.remove(' ');
			line.remove('grunt.loadNpmTasks(');
			line.remove(');');
			devDependencies = devDependencies + '\n' + line.trim();
		}
	} // for()
	devDependencies = devDependencies + '}';
	console.log(devDependencies);
};


/**
 * Create package.json just like npm init
 *
 * @return {[type]} [description]
 */
wpcli.packageJSON = function( callback ) {
	if ( !wpcli.options.grunt.useGrunt || !wpcli.options.grunt.packageJSON.create ) {
		wpcli.callback( callback );
		return;
	} // if()

	util.puts('Creating package.json...');
	var options          = wpcli.options,
			theme            = options.theme,
			installDirectory = options.site.installDirectory,
			directoryName    = options.site.directoryName,
			siteDirectory    = installDirectory + '/' + directoryName,
			themesDirectory  = siteDirectory + '/wp-content/themes/',
			themeSlug        = theme.slug,
			themeDirectory   = themesDirectory+themeSlug+'/',
			nl               = "\n",
			grunt            = options.grunt,
			packageJSON      = grunt.packageJSON
	;

	// CD into cloned theme directory
	try {
		process.chdir(themeDirectory);
	}
	catch (err) {
		console.log( err.error );
		process.exit();
	} // try/catch()

	var packageJSONContent = '{' + nl +
				' "name": "' + packageJSON.name + '",' + nl +
				' "version": "' + packageJSON.version + '",' + nl +
				' "description": "' + packageJSON.desciption + '",' + nl +
				' "main": "' + packageJSON.entryPoint + '",' + nl +
				' "devDependencies": ' + wpcli.getGruntDevDependencies() + ',' + nl +
				' "scripts": {' + nl +
					'  "test": "' + packageJSON.testCommand + '"' + nl +
				' },' + nl +
				' "author": "' + packageJSON.author + '",' + nl +
				' "license": "' + packageJSON.license + '"' + nl +
			'}'
	;
	fs.writeFileSync( themeDirectory+'package.json', packageJSONContent);
// "underscore": "*"
	util.puts('Success: package.json created!'.success);
	util.puts('Warning: You may want to check your devDependencies for correct version number'.warn);
};



/**
 * Initialize/Setup Grunt Task runner
 * Grunt Info: http://gruntjs.com/
 *
 * @return {[type]} [description]
 */
wpcli.initGrunt = function() {
// npm install
};


wpcli.openBrowser = function() {};

/**
 * Starts the setup
 *
 *
 *
 * @return boolean false
 */
wpcli.startSetup = function( options ) {
	wpcli.options = options;
	util.puts(options.spacer);
	wpcli.installWordPress(function(){
		util.puts(options.spacer);
		wpcli.addWpConfig(function(){
			util.puts(options.spacer);
			wpcli.addDatabase(function(){
				util.puts(options.spacer);
				wpcli.databaseInstall(function(){
					util.puts(options.spacer);
					wpcli.installPlugins(function(){
						util.puts(options.spacer);
						wpcli.uninstallPlugins(function(){
							util.puts(options.spacer);
							wpcli.installTheme(function(){
								util.puts(options.spacer);
								wpcli.themeStyleSheet(function(){
									util.puts(options.spacer);
									wpcli.activateTheme(function(){
										util.puts(options.spacer);
										wpcli.packageJSON(function(){

										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
};



/**
 * Initializes WP CLI functionality
 * WP CLI Info: http://wp-cli.org/
 *
 * @return boolean false
 */
wpcli.init = function() {
	wpcli.checkIsInstalled();

	return false;
};

// Export Options
module.exports = wpcli;