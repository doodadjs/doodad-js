// dOOdad - Object-oriented programming framework
// File: main.js - Module startup file for 'browserify'.
// Project home: https://sourceforge.net/projects/doodad-js/
// Trunk: svn checkout svn://svn.code.sf.net/p/doodad-js/code/trunk doodad-js-code
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2016 Claude Petit
//
//	Licensed under the Apache License, Version 2.0 (the "License");
//	you may not use this file except in compliance with the License.
//	You may obtain a copy of the License at
//
//		http://www.apache.org/licenses/LICENSE-2.0
//
//	Unless required by applicable law or agreed to in writing, software
//	distributed under the License is distributed on an "AS IS" BASIS,
//	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//	See the License for the specific language governing permissions and
//	limitations under the License.

"use strict";

module.exports = {
	createRoot: function(/*optional*/DD_MODULES, /*optional*/options) {
		var config = null;
		try {
			// Generated from 'doodad-js-make'
			config = require('./dist/doodad-js/config.json');
		} catch(ex) {
		};
		
		DD_MODULES = (DD_MODULES || {});
		
		if (Object.assign) {
			options = Object.assign({}, config, options);
		} else {
			var tmp = {};
			for (var key in config) {
				if (Object.prototype.hasOwnProperty.call(config, key)) {
					tmp[key] = config[key];
				};
			};
			for (var key in options) {
				if (Object.prototype.hasOwnProperty.call(options, key)) {
					tmp[key] = options[key];
				};
			};
			options = tmp;
		};

		if (!options.startup) {
			options.startup = {};
		};
		if (!options.startup.settings) {
			options.startup.settings = {};
		};

		var dev_values = options.startup.settings.nodeEnvDevValues && options.startup.settings.nodeEnvDevValues.split(',') || ['development'],
			env = options.node_env;

		if ((options.startup.debug === "true") || +options.startup.debug) {
			console.warn("warning: The 'startup.debug' flag is obsolete. Please set the environment variable 'NODE_ENV' to 'development' instead.");
			env = dev_values[0];
		};

		var dev = (dev_values.indexOf(env) >= 0),
			bootstrap;
			
		if (dev || (options.startup.settings.fromSource === 'true') || +options.startup.settings.fromSource) {
			if (dev) {
				options.startup.settings.fromSource = true;
				options.startup.settings.enableProperties = true;
				require("./dist/doodad-js/Debug.js").add(DD_MODULES);
			};

			require("./dist/doodad-js/Types.js").add(DD_MODULES);
			require("./dist/doodad-js/Tools.js").add(DD_MODULES);
			require("./dist/doodad-js/Namespaces.js").add(DD_MODULES);
			require("./dist/doodad-js/Doodad.js").add(DD_MODULES);
			require("./dist/doodad-js/Modules.js").add(DD_MODULES);
			require("./dist/doodad-js/Client.js").add(DD_MODULES);
			require("./dist/doodad-js/Browserify.js").add(DD_MODULES);

			bootstrap = require("./dist/doodad-js/Bootstrap.js");

		} else {
			// TODO: Find a way to prevent browserify to bundle both versions.
			//require("./dist/doodad-js/Types.min.js").add(DD_MODULES);
			//require("./dist/doodad-js/Tools.min.js").add(DD_MODULES);
			//require("./dist/doodad-js/Namespaces.min.js").add(DD_MODULES);
			//require("./dist/doodad-js/Doodad.min.js").add(DD_MODULES);
			//require("./dist/doodad-js/Modules.min.js").add(DD_MODULES);
			//require("./dist/doodad-js/Client.min.js").add(DD_MODULES);
			//require("./dist/doodad-js/Browserify.min.js").add(DD_MODULES);

			require("./dist/doodad-js/Types.js").add(DD_MODULES);
			require("./dist/doodad-js/Tools.js").add(DD_MODULES);
			require("./dist/doodad-js/Namespaces.js").add(DD_MODULES);
			require("./dist/doodad-js/Doodad.js").add(DD_MODULES);
			require("./dist/doodad-js/Modules.js").add(DD_MODULES);
			require("./dist/doodad-js/Client.js").add(DD_MODULES);
			require("./dist/doodad-js/Browserify.js").add(DD_MODULES);
			
			// TODO: Find a way to prevent browserify to bundle both versions.
			//bootstrap = require("./dist/doodad-js/Bootstrap.min.js");
			
			bootstrap = require("./dist/doodad-js/Bootstrap.js");
		};

		return bootstrap.createRoot(DD_MODULES, options);
	},
};