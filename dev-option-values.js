var options = {
	util : require('util'),
	spacer : "-----------------------------------------------------".prompt,

	site : {
		installDirectory : process.cwd(),
		directoryName    : 'site-test',
		url              : 'http://localhost',
		title            : 'Site Test'
	},
	db : {
		name   : 'wp_site_test',
		user   : 'root',
		pass   : 'root',
		prefix : 'wp_', // $((RANDOM%123456+999999)) # Gets a random number between 123456 and 999999
		host   : '127.0.0.1'
	},
	theme: {
		installTheme : true,
		slug         : 'site-test',
		name         : 'Site Test',
		uri          : 'http://matchboxdesigngroup.com/contact-us/',
		description  : 'Site test description.',
		version      : '0.0.1',
		author       : 'Matchbox Design Group',
		authorUri    : 'http://matchboxdesigngroup.com/',
		license      : 'GNU General Public License v2 or later'
	},
	admin : {
		name     : 'matchbox',
		password : 'test',
		email    : 'info@sitename.com',
	},
	githubTheme : {
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
			name: 'Site Test',
			version: '0.0.1',
			description: 'Site test description.',
			entryPoint: 'index.php',
			testCommand: 'test',
			gitRepository: '',
			keywords: 'keywor1, keyword2, keyword3',
			author  : 'Matchbox Design Group',
			license      : 'GNU General Public License v2 or later'
		},
	}
};
module.exports = options;