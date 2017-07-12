(function() {

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

const DD_OPTIONS = /*! (VAR("config") ? INCLUDE(VAR("config"), 'utf-8') : INJECT("null")) */;
const DD_MODULES = {};

//! IF_SET('debug')
	(function() {
		const has = function(obj, key) {
			return obj && Object.prototype.hasOwnProperty.call(obj, key);
		};

		if (!has(DD_OPTIONS, 'startup')) {
			DD_OPTIONS.startup = {};
		};
		if (!has(DD_OPTIONS, 'Doodad.Tools')) {
			DD_OPTIONS['Doodad.Tools'] = {};
		};

		// Debug mode
		DD_OPTIONS.startup.debug = true;

		// Will load modules from source
		DD_OPTIONS.startup.fromSource = true;

		// Enable some validations on debug
		DD_OPTIONS.startup.enableAsserts = true;
		DD_OPTIONS.startup.enableProperties = true;

		// Ease debug
		DD_OPTIONS.startup.enableSymbols = false;

		// Enable all log levels
		DD_OPTIONS['Doodad.Tools'].logLevel = 0; // Doodad.Tools.LogLevels.Debug
	})();
//! END_IF()

//! INCLUDE(VAR("bundle"), 'utf-8', true)

})();