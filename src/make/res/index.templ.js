//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: index.js - Module startup file (server-side)
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015-2018 Claude Petit
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
//! END_REPLACE()

"use strict";

module.exports = {
	createRoot: function(/*optional*/modules, /*optional*/options, /*optional*/startup) {
		const has = function(obj, key) {
			return obj && Object.prototype.hasOwnProperty.call(obj, key);
		};
		const get = function(obj, key, /*optional*/_default) {
			return (obj && has(obj, key) ? obj[key] : _default);
		};
		const bool = function(val) {
			return (val === "true") || !!(+val);
		};

		let config = null;
		try {
			// Generated from 'doodad-js-make'
			config = require('./config.json');
		} catch(ex) {
		};
		if (!config) {
			config = {};
		};

		const pkgModules = {};

		const dev_values = get(options, 'nodeEnvDevValues', get(config.startup, 'nodeEnvDevValues', 'dev,development')).split(','),
			env = (get(options, 'node_env', get(config, 'node_env')) || process.env.node_env || process.env.NODE_ENV);
		
		let dev = false;
			
		for (let i = 0; i < dev_values.length; i++) {
			if (dev_values[i] === env) {
				dev = true;
				break;
			};
		};
			
		let bootstrap;

		const fromSource = bool(get(options, 'fromSource', get(config.startup, 'fromSource')));
		if (dev || fromSource) {
			if (dev) {
				if (!has(config, 'startup')) {
					config.startup = {};
				};
				if (!has(config, 'Doodad.Tools')) {
					config['Doodad.Tools'] = {};
				};

				// Debug mode
				config.startup.debug = true;

				// Will load modules from source
				config.startup.fromSource = true;

				// May stop in the attached Debugger.
				config.startup.enableDebugger = true;

				// Enable some validations on debug
				config.startup.enableAsserts = true;
				config.startup.enableProperties = true;

				// Ease debug
				config.startup.enableSymbols = false;

				// Enable all log levels
				config['Doodad.Tools'].logLevel = 0; // Doodad.Tools.LogLevels.Debug
			};

			//! FOR_EACH(VAR("modulesSrc"), "mod")
				//! IF(!VAR("mod.manual") && !VAR("mod.exclude"))
					require(/*! INJECT(TO_SOURCE(VAR("mod.dest"))) */).add(pkgModules);
				//! END_IF()
			//! END_FOR()

			bootstrap = require(/*! INJECT(TO_SOURCE(MAKE_MANIFEST("sourceDir") + "/common/Bootstrap.js")) */);

		} else {
			//! FOR_EACH(VAR("modules"), "mod")
				//! IF(!VAR("mod.manual") && !VAR("mod.exclude"))
					require(/*! INJECT(TO_SOURCE(VAR("mod.dest"))) */).add(pkgModules);
				//! END_IF()
			//! END_FOR()

			bootstrap = require(/*! INJECT(TO_SOURCE(MAKE_MANIFEST("buildDir") + "/common/Bootstrap.min.js")) */);
		};

		return bootstrap.createRoot(pkgModules, [config, options])
			.then(function(root) {
				return root.Doodad.Namespaces.load(modules, options, startup);
			});
	},
};
