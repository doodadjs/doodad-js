// doodad-js - Object-oriented programming framework
// File: index.js - Temporary startup file. Will get replaced on build.
// Project home: https://github.com/doodadjs/
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
	createRoot: function(/*optional*/DD_MODULES, /*optional*/_options, /*optional*/startup) {
		const packageDir = 'doodad-js/';
		const sourceDir = packageDir + 'src/';

		let config = null;
		try {
			config = require(packageDir + 'config.json')
		} catch(ex) {
		};
		
		const options = [config, _options];
		
		DD_MODULES = (DD_MODULES || {});
		require(sourceDir + "common/Types.js").add(DD_MODULES);
		require(sourceDir + "common/Tools.js").add(DD_MODULES);
		require(sourceDir + "common/Tools_Files.js").add(DD_MODULES);
		require(sourceDir + "common/Tools_Config.js").add(DD_MODULES);
		require(sourceDir + "common/Tools_Scripts.js").add(DD_MODULES);
		require(sourceDir + "common/Namespaces.js").add(DD_MODULES);
		require(sourceDir + "common/Doodad.js").add(DD_MODULES);
		require(sourceDir + "server/Modules.js").add(DD_MODULES);
		require(sourceDir + "server/NodeJs_Base.js").add(DD_MODULES);
		require(sourceDir + "server/NodeJs.js").add(DD_MODULES);

		const bootstrap = require(sourceDir + "common/Bootstrap.js");

		return bootstrap.createRoot(DD_MODULES, options, startup);
	},
};
