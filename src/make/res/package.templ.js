//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: package.js - Module startup file (client-side)
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015-2017 Claude Petit
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

module.exports.add = function(DD_MODULES) {
	DD_MODULES = (DD_MODULES || {});

	const has = function(obj, key) {
		return obj && Object.prototype.hasOwnProperty.call(obj, key);
	};

	const config = /*! INCLUDE(VAR("config"), 'utf-8') */;

	//! IF_SET('debug')
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

		// Enable some validations on debug
		config.startup.enableAsserts = true;
		config.startup.enableProperties = true;

		// Ease debug
		config.startup.enableSymbols = false;

		// Enable all log levels
		config['Doodad.Tools'].logLevel = 0; // Doodad.Tools.LogLevels.Debug
	//! END_IF()

	DD_MODULES.options = config;

	//! INCLUDE(VAR("bundle"), 'utf-8', true)

	return DD_MODULES
};

//! END_MODULE();