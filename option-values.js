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
		prefix : 'wp_', // $((RANDOM%123456+999999)) # Gets a random number between 123456 and 999999
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
		password : '',
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
		install : {},
		uninstall : {
			hello: true,
			akismet : true
		}
	},
	grunt : {
		useGrunt: true,
		packageJSON : {
			create: true,
			name: '',
			version: '',
			description: '',
			entryPoint: 'index.php',
			testCommand: '',
			gitRepository: '',
			keywords: '',
			author  : '',
			license: ''
		},
	}
};
module.exports = options;