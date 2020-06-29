//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Templates_Html.js - Load client resources for "doodadjs-templates".
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

//! IF_SET("mjs")
//! ELSE()
	"use strict";
//! END_IF()

exports.add = function add(modules) {
	modules = (modules || {});
	modules['Doodad/Doodad.Templates.Html'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,

		dependencies: [
			'Doodad.Templates.Html',
		],

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				//tools = doodad.Tools,
				//types = doodad.Types,
				templatesHtml = doodad.Templates.Html;

			//===================================
			// Internal
			//===================================

			//const __Internal__ = {
			//};

			//===================================
			// Native functions
			//===================================

			//tools.complete(_shared.Natives, {
			//});


			//===================================
			// Init
			//===================================
			return function init(/*optional*/options) {
				templatesHtml.registerClientScript(root.getOptions().fromSource ? "@doodad-js/core/lib/uuid/uuid.js" : "@doodad-js/core/lib/uuid/uuid.min.js", true);
				templatesHtml.registerClientScript(root.getOptions().fromSource ? "@doodad-js/core/lib/json5/json5.js" : "@doodad-js/core/lib/json5/json5.min.js", true);
			};
		},
	};
	return modules;
};

//! END_MODULE()
