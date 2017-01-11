const peg = require('pegjs');
const fs = require('fs');
const Compiler = new require('google-closure-compiler').compiler;
const UglifyJS = require('uglify-js');
const path = require('path');

const skipParserBuild = process.env.npm_config_skip_parser;
const skipClosureBuild = process.env.npm_config_skip_closure;

function doPegJsBuild () {
	return new Promise((resolve, reject) => fs.readFile('./src/parsing/xpath.pegjs', 'utf8', (err, file) => err ? reject(err) : resolve(file)))
		.then(pegJsString => peg.generate(pegJsString, {
			cache: true,
			output: 'source',
			format: 'globals',
			exportVar: 'xPathParser'
		}))
		.then(parserString => UglifyJS.minify([parserString], { fromString: true }).code)
		.then(parserString => `export default ${JSON.stringify(parserString)};`)
		.then(parserString => new Promise((resolve, reject) => fs.writeFile('./src/parsing/xPathParser.raw.js', parserString, (err) => err ? reject(err) : resolve())))
		.then(() => console.info('Parser generator done'));
}

function doSelectorsBuild () {
	return new Promise((resolve, reject) => {
		new Compiler({
			assume_function_wrapper: true,
//			new_type_inf: true,
			language_in: 'ES6',
			language_out: 'ES5',
			create_source_map: './dist/fontoxpath.js.map',
			jscomp_warning: [
				'accessControls',
				'checkDebuggerStatement',
				'checkTypes',
				'const',
				'deprecated',
				'deprecatedAnnotations',
				'missingReturn',
				'newCheckTypes',
				'typeInvalidation',
				'uselessCode'
			],
			jscomp_error: [
				'checkVars',
				'duplicate',
				'missingProperties',
				'undefinedVars'
			],
			warning_level: 'VERBOSE',
			compilation_level: 'ADVANCED',
			externs: path.resolve('./externs/IDomFacade.js'),
			output_wrapper: `
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node, CommonJS-like
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.fontoxpath = factory();
	}
})(this, function () {
	var exports = {};
	%output%
	return exports;
});
//# sourceMappingURL=./fontoxpath.js.map`,
			js_output_file: './dist/fontoxpath.js',
			js: './src/**.js'
		})
			.run((exitCode, stdOut, stdErr) => {
				if (exitCode !== 0) {
					reject(stdErr);
					return;
				}
				resolve(stdOut + stdErr);
			});
	})
		.then((stdOut) => {
			console.info(stdOut);
		});
}

var chain = Promise.resolve();
if (!skipParserBuild) {
	chain = chain.then(doPegJsBuild);
}

if (!skipClosureBuild) {
	chain = chain.then(doSelectorsBuild);
}

chain.catch((err) => {
	console.error(err);
	process.exit(1);
});
