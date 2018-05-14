//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Tools_JSON5.js - JSON5 parser/serializer
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

//! IF(IS_SET("serverSide") && IS_SET("mjs"))
	//! INJECT("import {default as nodeJSON5} from 'json5';");
//! END_IF()

exports.add = function add(modules) {
	modules = (modules || {});
	modules['Doodad.Tools.JSON5'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		//dependencies: [
		//],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools,
				JSON5 = tools.JSON5;

			//! IF(IS_UNSET("serverSide") || IS_UNSET("mjs"))
				// NOTE: Client-side 'json5' is browserified to "lib/json5/json5.js" and "lib/json5/json5.min.js", and made available in JS through "require".
				//       Also it works with Node.js and bundlers.
				/* eslint global-require: "off" */
				const nodeJSON5 = ((typeof require === 'function') ? require('json5') : undefined);
			//! END_IF()

			//===================================
			// Internal
			//===================================

			// <FUTURE> Thread context
			//const __Internal__ = {
			//};

			//===================================
			// JSON5
			//===================================

			JSON5.ADD('isAvailable', function isAvailable() {
				return !!nodeJSON5;
			});

			JSON5.ADD('parse', function parse(text, /*optional*/reviver) {
				if (nodeJSON5) {
					return nodeJSON5.parse(text, reviver);
				} else {
					throw new types.NotAvailable("Package 'json5' is missing.");
				};
			});

			JSON5.ADD('stringify', function stringify(value, /*optional*/replacer, /*optional*/space) {
				if (nodeJSON5) {
					return nodeJSON5.stringify(value, replacer, space);
				} else {
					throw new types.NotAvailable("Package 'json5' is missing.");
				};
			});


			//===================================
			// Init
			//===================================
			//return function init(/*optional*/options) {
			//};
		},
	};
	return modules;
};

//! END_MODULE()
