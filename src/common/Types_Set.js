//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Types_Set.js - Set polyfill
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
		DD_MODULES['Doodad.Types/Set'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			dependencies: ['Doodad.Tools'],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools;
				
				//===================================
				// Internal
				//===================================
				
				const __Internal__ = {
				};

				//===================================
				// Native functions
				//===================================
					
				// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.
				// NOTE: Store everything because third-parties can override them.
				
				tools.complete(_shared.Natives, {
					windowSet: (types.isNativeFunction(global.Set) && types.isNativeFunction(global.Set.prototype.values) && types.isNativeFunction(global.Set.prototype.keys) ? global.Set : undefined),
					symbolIterator: (types.isNativeFunction(global.Symbol) && (typeof global.Symbol.iterator === 'symbol') ? global.Symbol.iterator : undefined),
				});

				//=========================
				// Set
				//=========================
					
				__Internal__.SetIterator = (!_shared.Natives.windowSet && types.INIT(types.Iterator.$inherit(
					{
						$TYPE_NAME: 'SetIterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('SetIterator')), true) */,
					},
					{
						__index: types.NOT_ENUMERABLE(0),
						__ar: types.NOT_ENUMERABLE(types.READ_ONLY( null )),
						
						_new: types.SUPER(function _new(setObj) {
							this._super();
							_shared.setAttribute(this, '__ar', types.clone(setObj.__ar));
						}),
					})));
					
				__Internal__.SetValuesIterator = (!_shared.Natives.windowSet && types.INIT(__Internal__.SetIterator.$inherit(
					{
						$TYPE_NAME: 'SetValuesIterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('SetValuesIterator')), true) */,
					},
					{
						next: function next() {
							const ar = this.__ar;
							if (this.__index < ar.length) {
								return {
									value: ar[this.__index++],
								};
							} else {
								return {
									done: true,
								};
							};
						},
					})));
					
				__Internal__.SetEntriesIterator = (!_shared.Natives.windowSet && types.INIT(__Internal__.SetIterator.$inherit(
					{
						$TYPE_NAME: 'SetEntriesIterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('SetEntriesIterator')), true) */,
					},
					{
						next: function next() {
							const ar = this.__ar;
							if (this.__index < ar.length) {
								const val = ar[this.__index++];
								return {
									value: [val, val],
								};
							} else {
								return {
									done: true,
								};
							};
						},
					})));
					
					
				types.ADD('Set', (_shared.Natives.windowSet || types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Set',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Set')), true) */,
					},
					/*instanceProto*/
					{
						size: types.CONFIGURABLE(types.READ_ONLY( 0 )),
						__ar: types.CONFIGURABLE(types.NOT_ENUMERABLE(types.READ_ONLY( null ))),

						_new: types.SUPER(function _new(/*optional*/ar) {
							this._super();
							
							if (types.isNothing(ar)) {
								ar = [];
							} else if (types._instanceof(ar, types.Set)) {
								ar = types.clone(ar.__ar);
							} else if (types._instanceof(ar, types.Map)) {
								const mapAr = ar.__keys,
									mapVals = ar.__values,
									len = mapAr.length;
								ar = tools.createArray(len);
								for (let i = 0; i < len; i++) {
									ar[i] = [mapAr[i], mapVals[i]];
								};
							} else if (types.isArrayLike(ar)) {
								ar = tools.unique(ar);
							} else {
								throw types.TypeError("Invalid array.");
							};

							_shared.setAttribute(this, '__ar', ar);
							_shared.setAttribute(this, 'size', this.__ar.length);
						}),
						has: function has(value) {
							for (let i = 0; i < this.__ar.length; i++) {
								if (this.__ar[i] === value) {
									return true;
								};
							};
							return false;
						},
						add: function add(value) {
							if (!this.has(value)) {
								const ar = this.__ar;
								ar.push(value);
								_shared.setAttribute(this, 'size', ar.length);
							};
							return this;
						},
						delete: function _delete(value) {
							const ar = this.__ar;
							for (let i = 0; i < ar.length; i++) {
								if (ar[i] === value) {
									ar.splice(i, 1);
									_shared.setAttribute(this, 'size', ar.length);
									return true;
								};
							};
							return false;
						},
						clear: function clear() {
							_shared.setAttribute(this, '__ar', []);
							_shared.setAttribute(this, 'size', 0);
						},
						keys: function keys() {
							return new __Internal__.SetValuesIterator(this);
						},
						values: function values() {
							return new __Internal__.SetValuesIterator(this);
						},
						entries: function entries() {
							return new __Internal__.SetEntriesIterator(this);
						},
						forEach: function forEach(callbackFn, /*optional*/thisObj) {
							const ar = this.__ar;
							for (let i = 0; i < ar.length; i++) {
								const value = ar[i];
								callbackFn.call(thisObj, value, value, this);
							};
						},
					}
				)));
				
				if (!_shared.Natives.windowSet && _shared.Natives.symbolIterator) {
					_shared.setAttribute(types.Set.prototype, _shared.Natives.symbolIterator, function() {
						return this.entries();
					}, {});
				};

				__Internal__.oldTypesIsClonable = _shared.isClonable;
				_shared.isClonable = function isClonable(obj, /*optional*/cloneFunctions) {
					return types._instanceof(obj, types.Set) || __Internal__.oldTypesIsClonable.call(this, obj, cloneFunctions);
				};

				__Internal__.oldTypesClone = _shared.clone;
				_shared.clone = function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked, /*optional*/keepNonClonable) {
					if (types._instanceof(obj, types.Set)) {
						// TODO: Depth cloning
						depth = +depth || 0;  // null|undefined|true|false|NaN|Infinity
						if (depth > 0) {
							throw new types.NotSupported("Depth cloning a Set is not supported.");
						};
						return new types.Set(obj);
					} else {
						return __Internal__.oldTypesClone.call(this, obj, depth, cloneFunctions, keepUnlocked, keepNonClonable);
					};
				};

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