// doodad-js - Object-oriented programming framework
// File: index.js - Temporary startup file. Will get replaced on build.
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

"use strict";

module.exports = {
	createRoot: function(/*optional*/modules, /*optional*/options, /*optional*/startup) {
		const packageDir = '@doodad-js/core/';
		const sourceDir = packageDir + 'src/';

		let config = null;
		try {
			config = require(packageDir + 'config.json');
		} catch(ex) {
		};
		
		const pkgModules = {};
		require(sourceDir + "common/Types.js").add(pkgModules);
		require(sourceDir + "common/Types_Bind.js").add(pkgModules);
		require(sourceDir + "common/Types_Generators.js").add(pkgModules);
		require(sourceDir + "common/Types_Iterators.js").add(pkgModules);
		require(sourceDir + "common/Types_HttpStatus.js").add(pkgModules);
		require(sourceDir + "common/Types_DDPromise.js").add(pkgModules);
		require(sourceDir + "common/Types_DDCancelable.js").add(pkgModules);
		require(sourceDir + "common/Types_Buffers.js").add(pkgModules);
		require(sourceDir + "common/Tools.js").add(pkgModules);
		require(sourceDir + "common/Tools_Files.js").add(pkgModules);
		require(sourceDir + "common/Tools_Config.js").add(pkgModules);
		require(sourceDir + "common/Tools_Html.js").add(pkgModules);
		require(sourceDir + "common/Tools_JSON5.js").add(pkgModules);
		require(sourceDir + "common/Tools_Scripts.js").add(pkgModules);
		require(sourceDir + "common/Tools_Version.js").add(pkgModules);
		require(sourceDir + "common/Tools_ToSource.js").add(pkgModules);
		require(sourceDir + "common/Namespaces.js").add(pkgModules);
		require(sourceDir + "common/Doodad.js").add(pkgModules);
		require(sourceDir + "server/Modules.js").add(pkgModules);
		require(sourceDir + "server/NodeJs_Base.js").add(pkgModules);
		require(sourceDir + "server/NodeJs.js").add(pkgModules);
		require(sourceDir + "server/NodeJs_Platform.js").add(pkgModules);
		require(sourceDir + "common/Resources.js").add(pkgModules);

		const bootstrap = require(sourceDir + "common/Bootstrap.js");

		return bootstrap.createRoot(pkgModules, [config, options])
			.then(function(root) {
				return root.Doodad.Namespaces.load(modules, options, startup);
			});
	},
};