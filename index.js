// dOOdad - Object-oriented programming framework
// File: index.js - Module startup file
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

(function() {
	var global = this;

	var exports = {};
	if (typeof process === 'object') {
		module.exports = exports;
	};
	
	var MODULE_NAME = 'doodad-js';
	
	exports.createRoot = function(/*optional*/DD_MODULES, /*optional*/options) {
		var config = null;
		try {
			// Generated from 'doodad-js-make'
			config = require('./config.json');
		} catch(ex) {
		};
		
		DD_MODULES = (DD_MODULES || {});

		options = Object.assign({}, config, options);

		if (!options.startup) {
			options.startup = {};
		};
		if (!options.startup.settings) {
			options.startup.settings = {};
		};

		var dev_values = (options.startup.settings.nodeEnvDevValues && options.startup.settings.nodeEnvDevValues.split(',') || ['development']),
			env = (options.node_env || process.env.node_env || process.env.NODE_ENV),
			dev = false;
			
		for (var i = 0; i < dev_values.length; i++) {
			if (dev_values[i] === env) {
				dev = true;
				break;
			};
		};
			
		var bootstrap;
		if (dev || (options.startup.settings.fromSource === 'true') || +options.startup.settings.fromSource) {
			if (dev) {
				options.startup.settings.fromSource = true;
				options.startup.settings.enableProperties = true;
				require("./src/common/Debug.js").add(DD_MODULES);
			};

			require("./src/common/Types.js").add(DD_MODULES);
			require("./src/common/Tools.js").add(DD_MODULES);
			require("./src/common/Tools_Files.js").add(DD_MODULES);
			require("./src/common/Tools_Config.js").add(DD_MODULES);
			require("./src/common/Namespaces.js").add(DD_MODULES);
			require("./src/common/Doodad.js").add(DD_MODULES);
			require("./src/server/Modules.js").add(DD_MODULES);
			require("./src/server/NodeJs.js").add(DD_MODULES);

			bootstrap = require("./src/common/Bootstrap.js");

		} else {
			require("./Types.min.js").add(DD_MODULES);
			require("./Tools.min.js").add(DD_MODULES);
			require("./Tools_Files.min.js").add(DD_MODULES);
			require("./Tools_Config.min.js").add(DD_MODULES);
			require("./Namespaces.min.js").add(DD_MODULES);
			require("./Doodad.min.js").add(DD_MODULES);
			require("./Modules.min.js").add(DD_MODULES);
			require("./NodeJs.min.js").add(DD_MODULES);

			bootstrap = require("./Bootstrap.min.js");
		};

		return bootstrap.createRoot(DD_MODULES, options);
	};

	
	if (typeof process !== 'object') {
		// <PRB> export/import are not yet supported in browsers
		global.DD_MODULES = exports.add(global.DD_MODULES);
	};
}).call((typeof global !== 'undefined') ? global : ((typeof window !== 'undefined') ? window : this));
