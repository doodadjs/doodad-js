//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Types_WeakMap.js - WeakMap type
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

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Types/WeakMap'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			bootstrap: true,
			dependencies: [
				'Doodad.Types',
			],
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				const doodad = root.Doodad,
					types = doodad.Types;
				
				//===================================
				// Internal
				//===================================
				
				const __Internal__ = {};

				//===================================
				// Native functions
				//===================================
					
				types.complete(_shared.Natives, {
					windowWeakMap: (types.isNativeFunction(global.WeakMap) && types.isNativeFunction(global.WeakMap.prototype.get) && types.isNativeFunction(global.WeakMap.prototype.set) ? global.WeakMap : undefined),
				});
				
				types.ADD('WeakMap', (_shared.Natives.windowWeakMap || types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'WeakMap',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('WeakMap')), true) */,
					},
					/*instanceProto*/
					{
						__symbol: types.NOT_ENUMERABLE(types.READ_ONLY(null)),

						_new: types.SUPER(function _new(ar) {
							this._super();

							_shared.setAttribute(this, '__symbol', types.getSymbol('__WEAPMAP_VALUE__'));

							if (types.isNothing(ar)) {
								// Do nothing
							} else if (types._instanceof(ar, types.Map) || types._instanceof(ar, types.Set)) {
								ar.forEach(function(val, key) {
									this.set(key, val);
								}, this);
							} else if (types.isArrayLike(ar)) {
								for (let i = 0; i < ar.length; i++) {
									if (types.has(ar, i)) {
										const item = ar[i];
										this.set(item[0], item[1]);
									};
								};
							} else {
								throw types.TypeError("Invalid array.");
							};
						}),

						has: function has(key) {
							return types.has(key, this.__symbol);
						},
						get: function get(key) {
							if (types.has(key, this.__symbol)) {
								return key[this.__symbol];
							};
						},
						set: function set(key, value) {
							if ((key !== null) && ((typeof key === 'object') || (typeof key === 'function'))) {
								_shared.setAttribute(key, this.__symbol, value, {configurable: true});
							} else {
								throw new types.TypeError("'key' is not an object.");
							};
							return this;
						},
						'delete': function _delete(key) {
							if (types.has(key, this.__symbol)) {
								delete key[this.__symbol];
								return true;
							} else {
								return false;
							};
						},
					}
				)));
				

				//===================================
				// Init
				//===================================
				//return function init(/*optional*/options) {
				//};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()