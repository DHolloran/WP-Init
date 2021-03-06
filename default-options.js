var options = {
	util : require('util'),
	spacer : "-----------------------------------------------------".prompt,

	site : {
		installDirectory : process.cwd(),
		directoryName    : '',
		url              : 'http://localhost',
		title            : ''
	},
	db : {
		name   : '',
		user   : 'root',
		pass   : 'root',
		prefix : 'wp_', // Random 'wp'+Math.random().toString(36).substring(10)+'_'
		host   : '127.0.0.1'
	},
	theme: {
		installTheme : true,
		slug         : '',
		name         : '',
		uri          : 'http://matchboxdesigngroup.com/contact-us/',
		description  : '',
		version      : '0.0.1',
		author       : 'Matchbox Design Group',
		authorUri    : 'http://matchboxdesigngroup.com/',
		license      : 'GNU General Public License v2 or later'
	},
	admin : {
		name     : 'matchbox',
		password : 'dev',
		email    : 'info@sitename.com',
	},
	githubTheme : {
		// https://github.com/DHolloran/mdg-base.git
		base       : 'https://github.com/',
		user       : 'DHolloran',
		repository : 'mdg-base',
		gitRemote  : undefined
	},
	plugins:{
		installPlugins: true,
		install : {
			widgetSettingsImportexport: {
				slug     : 'widget-settings-importexport',
				activate : true
			},
			regenerateThumbnails: {
				slug     : 'regenerate-thumbnails',
				activate : true
			},
			wordpressDatabaseReset: {
				slug     : 'wordpress-database-reset',
				activate : true
			},
			debugBar: {
				slug     : 'debug-bar',
				activate : true
			},
			debugBarConsole: {
				slug     : 'debug-bar-console',
				activate : true
			},
			themeCheck: {
				slug     : 'theme-check',
				activate : true
			},
			wordpressImporter: {
				slug     : 'wordpress-importer',
				activate : true
			},
			developer: {
				slug     : 'developer',
				activate : true
			}
		},
		uninstall : {
			hello: true,
			akismet : true
		}
	},
	grunt : {
		useGrunt: true,
		packageJSON : {
			create: true,
			name          : '',
			version       : '',
			description   : '',
			entryPoint    : 'base.php',
			testCommand   : 'test',
			gitRepository : '',
			keywords      : 'WordPress Theme',
			author        : 'Matchbox Design Group',
			license       : 'GNU General Public License v2 or later'
		},
	}
};
module.exports = options;