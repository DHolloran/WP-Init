#This is a work in progress 0.0.1-alpha

It is a simple Node.js module that helps initializing WordPress more information to come. For the time being I would suggest you don't use it. If you think it will solve you issue please contact me at [dtholloran@gmail.com](dtholloran@gmail.com) I can help get you up and running.

###Requirements
- Node.js [http://nodejs.org/](http://nodejs.org/)
- WP CLI [http://wp-cli.org/](http://wp-cli.org/)
- Grunt.js CLI [http://gruntjs.com/](http://gruntjs.com/) *(optional)*

###Installation(For now I may add to NPM IDK)
- Clone repo to a /bin, your home directory, or some where else you wan't to keep it.
- If you want to use the `wp-init` command add  `alias wp-init="node /path/to/wp-init.js"` to .zshrc, .bashrc, etc. if not just execute `node /path/to/wp-init.js`

###Usage
- In a terminal run `cd path/to/install/wordpress`
- Then run `wp-init`
- Follow all prompts.

###Options
- `--debug`: Allows for using the options in ./debug-options.js, probably not very useful for anyone but me.
- `--options`: With no parameters it will create a file wp-init-custom-options.js in your current working directory.
- `--options=/full/path/to/wp-init-custom-options.js`: Allows using a custom options file, please run `wp-init --options` first since you will ned a base to start from. **For the time being you should redo everything after updating in case an option has changed probably will be an addition not a removal**