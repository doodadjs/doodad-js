//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
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
//! END_REPLACE()

//! IF_UNDEF("debug")
	//! DEFINE("debug", false)
//! END_IF()

"use strict";

exports.createRoot = function(/*optional*/DD_MODULES, /*optional*/options) {
	let config = null;
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

	const dev_values = (options.startup.nodeEnvDevValues && options.startup.nodeEnvDevValues.split(',') || ['development']),
		env = (options.node_env || process.env.node_env || process.env.NODE_ENV);
	
	let dev = false;
		
	for (let i = 0; i < dev_values.length; i++) {
		if (dev_values[i] === env) {
			dev = true;
			break;
		};
	};
		
	let bootstrap;

	if (dev || (options.startup.fromSource === 'true') || +options.startup.fromSource) {
		if (dev) {
			options.startup.fromSource = true;
			options.startup.enableProperties = true;
			require(/*! INJECT(TO_SOURCE(MAKE_MANIFEST("sourceDir") + "/common/Debug.js")) */).add(DD_MODULES);
		};

		//! FOR_EACH(VAR("modulesSrc"), "mod")
			//! IF(!VAR("mod.manual"))
				require(/*! INJECT(TO_SOURCE(VAR("mod.dest"))) */).add(DD_MODULES);
			//! END_IF()
		//! END_FOR()

		bootstrap = require(/*! INJECT(TO_SOURCE(MAKE_MANIFEST("sourceDir") + "/common/Bootstrap.js")) */);

	} else {
		//! FOR_EACH(VAR("modules"), "mod")
			//! IF(!VAR("mod.manual"))
				require(/*! INJECT(TO_SOURCE(VAR("mod.dest"))) */).add(DD_MODULES);
			//! END_IF()
		//! END_FOR()

		bootstrap = require(/*! INJECT(TO_SOURCE(MAKE_MANIFEST("buildDir") + "/common/Bootstrap.min.js")) */);
	};

	return bootstrap.createRoot(DD_MODULES, options);
};
