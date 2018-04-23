//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: package.js - Module startup file (client-side)
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

(function(/*global*/) {
	const global = arguments[0];

	global.createRoot = function(/*optional*/modules, /*optional*/options, /*optional*/startup) {
		"use strict";

		let DD_MODULES = {},
			DD_BOOTSTRAP = {},
			DD_EXPORTS = undefined;
	
		// NOTE: The bundle will fill "DD_MODULES" and "DD_BOOTSTRAP".
		//! INCLUDE(VAR("bundle"), 'utf-8', true)
	
		return DD_BOOTSTRAP.createRoot((function() {
				const modules = DD_MODULES;
				DD_MODULES = null; // Free memory
				DD_BOOTSTRAP = null; // Free memory
				return modules;
			})(), [(function() {
				const config = /*! (VAR("config") ? INCLUDE(VAR("config"), 'utf-8') : INJECT("null")) */;
	
				const has = function(obj, key) {
					return obj && Object.prototype.hasOwnProperty.call(obj, key);
				};
				
				if (!has(config, 'startup')) {
					config.startup = {};
				};
			
				// Can't load modules from source on the client
				config.startup.fromSource = false;
			
				//! IF_SET('debug')
					if (!has(config, 'Doodad.Tools')) {
						config['Doodad.Tools'] = {};
					};
	
					// Debug mode
					config.startup.debug = true;
			
					// May stop in the attached Debugger.
					config.startup.enableDebugger = true;

					// Enable some validations on debug
					config.startup.enableAsserts = true;
					config.startup.enableProperties = true;
			
					// Ease debug
					config.startup.enableSymbols = false;
			
					// Enable all log levels
					config['Doodad.Tools'].logLevel = 0; // Doodad.Tools.LogLevels.Debug
				//! END_IF()

				return config;
			})(), options])
			.then(function(root) {
				return root.Doodad.Namespaces.load(modules, options, startup);
			});
	};
}).call(undefined, ((typeof global === 'object') && (global !== null) ? global : window));
