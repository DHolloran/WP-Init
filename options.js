var colors = require('colors');
var fs     = require('fs');
var util   = require('util');

colors.setTheme({
	silly: 'rainbow',
	prompt: 'grey',
	info: 'green',
	data: 'grey',
	help: 'cyan',
	warn: 'yellow',
	debug: 'blue',
	error: 'red'
});

// Default options
var options = require('./default-options.js');

// Set options file path option using --option=
process.argv.forEach(function (val) {
	if ( val.indexOf('--options=') !== -1) {
		var optionsUrl = val.replace('--options=','');
		if ( fs.existsSync( optionsUrl ) ) {
			options = require( optionsUrl );
		} // if()
	} // if()
});

// Set the debug options if --debug is passed in
process.argv.forEach(function (val) {
	if ( val === '--debug' ) {
		options = require('./debug-options.js');
	} // if()
});

options.values = function() {
	var site              = options.site,
			db                = options.db,
			theme             = options.theme,
			admin             = options.admin,
			github            = options.githubTheme,
			grunt             = options.grunt,
			packageJSON       = options.grunt.packageJSON,
			plugins           = options.plugins,
			pluginsUninstall  = plugins.uninstall,
			nl                = "\n",
			msg               = '',
			useGrunt          = ( grunt.useGrunt ) ? 'Y' : 'N',
			createPackageJSON = ( packageJSON.create ) ? 'Y' : 'N',
			installTheme      = ( theme.installTheme ) ? 'Y' : 'N'
	;

	msg = nl + nl + 'Your Responses:' + nl +
	'- Site Install Directory: ' + site.installDirectory + nl +
	'- Site Directory Name: ' + site.directoryName + nl +
	'- Site URL: ' + site.url + nl +
	'- Site Title: ' + site.title + nl +
	options.spacer + nl +
	'- Database Name: ' + db.name + nl +
	'- Database User: ' + db.user + nl +
	'- Database Password: ' + db.pass + nl +
	'- Database Prefix: ' + db.prefix + nl +
	'- Database Host: ' + db.host + nl +
	options.spacer + nl +
	'- Install Theme: ' + installTheme + nl;
	if ( theme.installTheme ) {
		msg = msg + ' - Theme Slug: ' + theme.slug + nl +
		' - Theme Name: ' + theme.name + nl +
		' - Theme URI: ' + theme.uri + nl +
		' - Theme Description: ' + theme.description + nl +
		' - Theme Version: ' + theme.version + nl +
		' - Theme Author: ' + theme.author + nl +
		' - Theme Author URI: ' + theme.authorUri + nl +
		' - Theme License: ' + theme.license + nl +
		' - Theme Repository: ' + github.gitRemote  + nl;
	} // if()
	msg = msg + options.spacer + nl +
	'Install Plugins: ' + plugins.installPlugins + nl +
	options.spacer + nl +
	'Uninstall Hello Dolly: ' + pluginsUninstall.hello + nl +
	'Uninstall Akismet: ' + pluginsUninstall.akismet + nl +
	options.spacer + nl +
	'- Admin User Name: ' + admin.name + nl +
	'- Admin Password: ' + admin.password + nl +
	'- Admin Email :' + admin.email + nl +
	options.spacer + nl +
	'- Use Grunt: ' + useGrunt + nl;

	if ( grunt.useGrunt) {
		msg = msg + ' - Create Pacakge JSON: ' + createPackageJSON + nl;

		if ( createPackageJSON ) {
			msg = msg + ' - Name: ' + packageJSON.name + nl +
			' - Version: ' + packageJSON.version + nl +
			' - Description: ' + packageJSON.description + nl +
			' - Entry Point: ' + packageJSON.entryPoint + nl +
			' - Test Command: ' + packageJSON.testCommand + nl +
			' - GIT Repository: ' + packageJSON.gitRepository + nl +
			' - Keywords: ' + packageJSON.keywords + nl +
			' - License: ' + packageJSON.license + nl;
		} // if()
	} // if()
	msg = msg + options.spacer + nl;

	// Double Check Responses Y/N
	options.ask( 'Double Check Responses Y/N', 'Y', function( value ) {
		var wpcli = require('./wp-cli.js');

		if ( value.toLowerCase() !== 'y' && value !== '' ) {
			msg = options.spacer +
						nl + "Your very sure of yourself now arn't ya, here we go!"  + nl;
			options.util.puts( msg );
			wpcli.startSetup( options );
		} else {
			options.util.puts( msg );
			options.ask( 'Everything look good? Y/N', 'Y', function( value ) {
				if ( value.toLowerCase() === 'y' || value === '' ) {
					options.util.puts( nl + 'Ok, here we go!' + nl );
					wpcli.startSetup( options );
				} else {
					options.util.puts( nl + 'Try again, you can use CTRL+C to exit.' + nl );
					options.init();
				}// if/else()
			}); // options.ask('Everything look good?')
		} // if/else()
	}); // options.ask('Double Check Responses Y/N')
};

options.ask = function( optionMsg, defaultOption, callback ) {
	var stdin = process.stdin,
			stdout = process.stdout
	;

	stdin.resume();
	var msg = '';
	if ( defaultOption === '' ) {
		stdout.write( optionMsg + "*".error + ": " );
	} else if ( defaultOption === null ) {
		stdout.write( optionMsg + ": " );
	} else {
		msg = " (" + defaultOption + ")";
		stdout.write( optionMsg + msg.info + ":" );
	} // if/else()

	stdin.once( 'data', function( data ) {
		data = data.toString().trim();

		if ( defaultOption === '' && data === '' ) {
			var errorMsg = optionMsg + ' is required!';
			console.error( errorMsg.error  );
			options.ask( optionMsg, defaultOption, callback );
		} else {
			if ( typeof callback !== 'undefined' ) {
				callback( data );
			} // if()
		} // if/else()
	});
}; // options.ask()


options.callback = function( callback ) {
	if ( typeof callback !== 'undefined' ) {
		callback();
	} // if()
};

// Site Options
options.site.callback = function( callback ) {
	var site = options.site;

	// Install Directory
	options.ask('Site Install Directory', site.installDirectory, function( option ){
		if ( option !== '' ) { site.installDirectory = option; }
		// Site URL
		options.ask('Site URl', site.url, function( option ){
			if ( option !== '' ) { site.url = option; }

			// Site Title
			options.ask('Site Title', site.title, function( option ){
				if ( option !== '' ) { site.title = option; }

				// Directory Name
				site.directoryName = site.title.replace(/\W/g, '-').toLowerCase().replace('undefined','').replace('--');
				options.ask('Site Directory Name', site.directoryName, function( option ){
					if ( option !== '' ) { site.directoryName = option; }

					options.callback( callback );
				}); // options.ask('Directory Name')
			}); // options.ask('Site Title')
		}); // options.ask('Site URl')
	}); // options.ask('Install Directory')
};

// Database Options
options.db.callback = function( callback ) {
	var db = options.db;

	// Database Name
	db.name = 'wp_' + options.site.title.replace(/\W/g, '_').toLowerCase().replace('__');
	options.ask( 'Database Name', db.name, function( option ){
		if ( option !== '' ) { db.name = option; }

		// Database User
		options.ask( 'Database User', db.user, function( option ){
			if ( option !== '' ) { db.user = option; }

			// Database Password
			options.ask( 'Database Password', db.pass, function( option ){
				if ( option !== '' ) { db.pass = option; }

				// Database Prefix
				options.ask( 'Database Prefix', db.prefix, function( option ){
					if ( option !== '' ) { db.prefix = option; }

					// Database Host
					options.ask( 'Database Host', db.host, function( option ){
						if ( option !== '' ) { db.host = option; }

						options.callback( callback );
					}); // options.ask('Database Host')
				}); // options.ask('Database Prefix')
			}); // options.ask('Database Password')
		}); // options.ask('Database User')
	}); // options.ask('Database Name')
}; // options.db.callback()

// Theme Options
options.theme.callback = function( callback ) {
	var theme = options.theme,
			site = options.site
	;

	// Install Theme
	options.ask( 'Install Theme Y/N', 'Y', function( option ) {
		if ( option !== '' ) { theme.installTheme = ( option.toLowerCase() === 'y' ); }

		// Install Theme
		if ( theme.installTheme ) {

			// Theme Name
			theme.name = site.title;
			options.ask( 'Theme Name', theme.name, function( option ) {
				if ( option !== '' ) { theme.name = option; }

				theme.slug = options.site.directoryName;

				// Theme URI
				options.ask( 'Theme URI', theme.uri, function( option ) {
					if ( option !== '' ) { theme.uri = option; }

					// Theme Description
					theme.description = 'Custom theme: ' + theme.name;
					options.ask( 'Theme Description', theme.description, function( option ) {
						if ( option !== '' ) { theme.description = option; }

						// Theme Version
						options.ask( 'Theme Version', theme.version, function( option ) {
							if ( option !== '' ) { theme.version = option; }

							// Theme Author
							options.ask( 'Theme Author', theme.author, function( option ) {
								if ( option !== '' ) { theme.author = option; }

								// Theme Author URI
								options.ask( 'Theme Author URI', theme.authorUri, function( option ) {
									if ( option !== '' ) { theme.authorUri = option; }

									if ( typeof callback !== 'undefined' ) {
										callback();
									} // if()

									// Theme License
									// options.ask( 'Theme License', theme.license, function( option ) {
									//	if ( option !== '' ) { theme.license = option; }
									// }); // options.ask('Theme License')
								}); // options.ask('Theme Author URI')
							}); // options.ask('Theme Author')
						}); // options.ask('Theme Version')
					}); // options.ask('Theme Description')
				}); // options.ask('Theme URI')
			}); // options.ask('Theme Name')
		} else {
			if ( typeof callback !== 'undefined' ) {
				callback();
			} // if()
		} // if/else()
	}); // options.ask('Install Theme')
};


// Install Plugin Options
options.plugins.install.callback = function( callback ) {
	if ( typeof callback !== 'undefined' ) {
		callback();
	} // if()
};

// Un-Install Plugin Options
options.plugins.uninstall.callback = function( callback ) {
	var uninstall = options.plugins.uninstall;

	// Un-install Hello Dolly Y/N
	options.ask( 'Un-install Hello Dolly Y/N', 'Y', function( option ) {
		uninstall.hello = ( option.toLowerCase() === 'y' || option === '' );

		// Un-install Akismet
		options.ask( 'Un-install Akismet', 'Y', function( option ) {
			uninstall.akismet = ( option.toLowerCase() === 'y' || option === '' );

			if ( typeof callback !== 'undefined' ) {
				callback();
			} // if()
		}); // options.ask('Un-install Akismet')
	}); // options.ask('Un-install Hello Dolly Y/N')
};

// Grunt Options
options.grunt.callback = function( callback ) {
	var grunt = options.grunt,
			packageJSON = grunt.packageJSON,
			theme = options.theme,
			site = options.site
	;

	// Use Grunt
	options.ask( 'Use Grunt', 'Y', function( option ) {
		grunt.useGrunt = ( option.toLowerCase() === 'y' || option === '' );

		if ( grunt.useGrunt ) {
			// Create Package JSON
			options.ask( 'Create Package JSON: ', 'Y', function( option ) {
				packageJSON.create = ( option.toLowerCase() === 'y' || option === '' );

				if ( packageJSON.create ) {
					// Name
					var defaultValue = ( theme.name === site.title ) ? theme.name : site.title;
					defaultValue = defaultValue.replace(/\W/g, '-').toLowerCase().replace('--');
					options.ask( ' name', defaultValue, function( option ) {
						if ( option === '' ) {
							packageJSON.name = defaultValue.replace(/\W/g, '-').toLowerCase().replace('--');
						} else {
							packageJSON.name = option;
						} // if/else()

						// Version
						options.ask( ' version', theme.version, function( option ) {
							if ( option === '' ) {
								packageJSON.version = theme.version;
							} else {
								packageJSON.version = option;
							} // if/else()

							// Description
							options.ask( ' description', theme.description, function( option ) {
								if ( option === '' ) {
									packageJSON.description = theme.description;
								} else {
									packageJSON.description = option;
								} // if/else()

								// Entry Point
								options.ask( ' entry point', packageJSON.entryPoint, function( option ) {
									if ( option !== '' ) {
										packageJSON.entryPoint = option;
									} // if()

									// Test Command
									options.ask( ' test command', packageJSON.testCommand, function( option ) {
										if ( option !== '' ) {
											packageJSON.testCommand = option;
										} // if()

										// Git Repository
										options.ask( ' git repository', null, function( option ) {
											if ( option !== '' ) {
												packageJSON.gitRepository = option;
											} // if()

											// Keywords
											options.ask( ' keywords', packageJSON.keywords, function( option ) {
												if ( option !== '' ) {
													packageJSON.keywords = option;
												} // if()

													// License
												options.ask( ' author', packageJSON.author, function( option ) {
													if ( option !== '' ) {
														packageJSON.author = option;
													} // if()

													// License
													options.ask( ' license', packageJSON.license, function( option ) {
															if ( option === '' ) {
																packageJSON.license = theme.license;
															} else {
																packageJSON.license = option;
															} // if/else()

														if ( typeof callback !== 'undefined' ) {
															callback();
														} // if()
													}); // options.ask('license')
												}); // options.ask('author')
											}); // options.ask('keywords')
										}); // options.ask('git repository')
									}); // options.ask('test command')
								}); // options.ask('entry point')
							}); // options.ask('description')
						}); // options.ask('version')
					}); // options.ask('name')
				} // if()
			});
		} // if()

		if ( grunt.useGrunt === false || packageJSON.create === false ) {
			if ( typeof callback !== 'undefined' ) {
				callback();
			} // if()
		} // if()
	}); // options.ask('Use Grunt')
};

// Admin Options
options.admin.callback = function( callback ) {
	var admin = options.admin;

	// Administrator User Name
	options.ask( 'Administrator User Name', admin.name, function( option ) {
		if ( option !== '' ) { admin.name = option; }

		// Administrator Password
		options.ask( 'Administrator Password', admin.password, function( option ) {
			if ( option !== '' ) { admin.password = option; }

			// Administrator Email
			options.ask( 'Administrator Email', admin.email, function( option ) {
				if ( option !== '' ) { admin.email = option; }

				if ( typeof callback !== 'undefined' ) {
					callback();
				} // if()
			}); // options.ask('Administrator Email')
		}); // options.ask('Administrator Password')
	}); // options.ask('Administrator User Name')
};

// GitHub Theme Options
options.githubTheme.callback = function( callback ) {
	var github = options.githubTheme;

	// GitHub User
	options.ask( 'GitHub User', github.user, function( option ) {
		if ( option !== '' ) { github.user = option; }

		// GitHub Repository
		options.ask( 'GitHub Repository', github.repository, function( option ) {
			if ( option !== '' ) { github.repository = option; }

			github.gitRemote = github.base + github.user + '/' + github.repository + '.git';

			if ( typeof callback !== 'undefined' ) {
				callback();
			} // if()
		}); // options.ask('GitHub Repository')
	}); // options.ask('GitHub User')
}; // options.githubTheme.callback()

// Final Options
options.finalOptions = function() {
	if( options.theme.installTheme ) {
		options.util.puts( options.spacer );
		// GitHub Theme
		options.githubTheme.callback(function(){
			options.util.puts( options.spacer );
			// Admin
			options.admin.callback(function(){
				options.values();
			});
		});
	} else {
		options.util.puts( options.spacer );
		// Admin
		options.admin.callback(function(){
			options.values();
		});
	} // if/else()
};


/**
 * Handles adding default options template if --options exists.
 *
 * @return boolean To output the default options or not.
 */
options.outputDefaultOptionsFile = function() {
	var outputDefaults = false;
	process.argv.forEach(function (val) {
		if ( val.indexOf('--options') !== -1) {
			var optionsUrl = val.replace('--options','');
			if ( optionsUrl === '' ) {
				var home               = process.env['HOME'];
				var defaultOptionsPath = home+'/wp-init/default-options.js';
				if ( fs.existsSync(defaultOptionsPath) ) {
					outputDefaults = true;
					var defaultOptions    = fs.readFileSync(defaultOptionsPath).toString();
					var customOptionsFile = process.cwd()+'/wp-init-custom-options.js';

					var outputMsg = 'Use the file created at '+
													customOptionsFile +
													' to add your new options.\n' +
													'I would suggest moving the file to a /bin folder or your users root folder so it can be re-used.'+
													'To use a custom option file use wp-init --options=/full/path/to/wp-init-custom-options.js'
					;
					fs.writeFileSync(customOptionsFile, defaultOptions);

					util.puts( outputMsg.success );
					process.exit();
				} // if()

				// In case something goes wrong.
				console.error("I'm sorry something went wrong I could not retrieve the default options.".error);
				process.exit();
			} // if()
		} // if()
	});

	return outputDefaults;
};



/**
 * Initializes option retrieval
 *
 * @return boolean false
 */
options.init = function() {
	// Handles adding default options template if --options exists.
	options.outputDefaultOptionsFile();

	var nl = "\n";
	// options.util.puts( nl );
	options.util.puts( 'Configuration Options:' + nl +'Use ^C to exit at any time.' + nl );
	// Site
	options.site.callback(function(){
		options.util.puts( options.spacer );
		// Database
		options.db.callback(function(){
			options.util.puts( options.spacer );
			// Theme
			options.theme.callback(function(){
				options.util.puts( options.spacer );
				// Plugins Un-Install
				options.plugins.uninstall.callback(function(){
					// options.util.puts( options.spacer );
					// Plugins Install
					options.plugins.install.callback(function(){
						options.util.puts( options.spacer );
						options.grunt.callback(function(){
							options.finalOptions();
						});
					});
				}); // options.plugins.uninstall.callback(
			}); // options.theme.callback()
		}); // options.db.callback()
	}); // options.site.callback()

	return false;
};

// Export Options
module.exports = options;