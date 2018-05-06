//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: NodeJs_Base.js - Node.js Tools
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
	//! INJECT("import {default as nodeUtil} from 'util';");
//! ELSE()
	"use strict";

	const nodeUtil = require('util');
//! END_IF()

const nodeUtilInspect = nodeUtil.inspect;


exports.add = function add(mods) {
	mods = (mods || {});
	mods['Doodad.NodeJs'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Types', 'Doodad.Tools'],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			const doodad = root.Doodad,
				//types = doodad.Types,
				nodejs = doodad.NodeJs;


			//===================================
			// Internal
			//===================================

			const __Internal__ = {
				customInspectSymbol: ((typeof nodeUtilInspect.custom === 'symbol') ? nodeUtilInspect.custom : 'inspect'),
			};

			//===================================
			// Natives
			//===================================

			//tools.complete(_shared.Natives, {
			//});

			//===================================
			// Util Extension
			//===================================

			nodejs.ADD('getCustomInspectSymbol', function getCustomInspectSymbol() {
				return __Internal__.customInspectSymbol;
			});


			//return function init(/*optional*/options) {
			//};
		},
	};
	return mods;
};

//! END_MODULE()
