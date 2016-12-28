//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Types_UUIDS.js - UUIDS database file loader.
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
//! END_REPLACE()

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Types/uuids'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			dependencies: [],
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================
					
				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools;
					
				//===================================
				// Internal
				//===================================
					
				//// <FUTURE> Thread context
				//var __Internal__ = {
				//};
				
				
				//===================================
				// Options
				//===================================
					
				//var __options__ = types.nullObject({
				//}, _options);

				//__options__. = types.to...(__options__.);

				//types.freezeObject(__options__);

				//config.ADD('getOptions', function() {
				//	return __options__;
				//});
				

				//===================================
				// Native functions
				//===================================
					
				//types.complete(_shared.Natives, {
				//});
				
				//===================================
				// Init
				//===================================
				return function init(/*optional*/options) {
					var tempNatives = [
							//! IF(IS_SET("serverSide") && !IS_SET("browserify"))
								//! INCLUDE("%SOURCEDIR%/make/res/Natives_Node.inc.js", 'utf-8')
							//! ELSE()
								//! INCLUDE("%SOURCEDIR%/make/res/Natives.inc.js", 'utf-8')
							//! END_IF()
						],

						uuids = types.nullObject();

					for (var i = 0; i < tempNatives.length; i++) {
						var item = tempNatives[i],
							name = item[0],
							native = global[name];
						if (types.isFunction(native)) {
							if (!types.has(native, _shared.UUIDSymbol)) { // Some natives are aliases
								var uuid = item[1];
								if (types.has(uuids, uuid)) {
									throw new types.Error("Duplicated UUID : ~0~.", [uuid]);
								};
								uuids[uuid] = true;
								if (types.hasProperties()) {
									types.defineProperty(native, _shared.UUIDSymbol, {value: uuid});
								} else {
									native[_shared.UUIDSymbol] = uuid;
								};
							};
						};
					};
				};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()