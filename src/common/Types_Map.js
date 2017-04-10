//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Types_Map.js - Map polyfill
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
		DD_MODULES['Doodad.Types/Map'] = {
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
				
				types.complete(_shared.Natives, {
					windowMap: (types.isNativeFunction(global.Map) && types.isNativeFunction(global.Map.prototype.values) && types.isNativeFunction(global.Map.prototype.keys) ? global.Map : undefined),
					symbolIterator: (types.isNativeFunction(global.Symbol) && (typeof global.Symbol.iterator === 'symbol') ? global.Symbol.iterator : undefined),
				});

				//=========================
				// Map
				//=========================
					
				__Internal__.MapIterator = (!_shared.Natives.windowMap && types.INIT(types.Iterator.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'MapIterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('MapIterator')), true) */,
					},
					/*instanceProto*/
					{
						__index: types.NOT_ENUMERABLE(0),
						__keys: types.NOT_ENUMERABLE(types.READ_ONLY( null )),
						__values: types.NOT_ENUMERABLE(types.READ_ONLY( null )),
						
						_new: types.SUPER(function _new(mapObj) {
							this._super();
							_shared.setAttribute(this, '__keys', types.clone(mapObj.__keys));
							_shared.setAttribute(this, '__values', types.clone(mapObj.__values));
						}),
					})));
					
				__Internal__.MapKeysIterator = (!_shared.Natives.windowMap && types.INIT(__Internal__.MapIterator.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'MapKeysIterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('MapKeysIterator')), true) */,
					},
					/*instanceProto*/
					{
						next: function next() {
							const ar = this.__keys;
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
					
				__Internal__.MapValuesIterator = (!_shared.Natives.windowMap && types.INIT(__Internal__.MapIterator.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'MapValuesIterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('MapValuesIterator')), true) */,
					},
					/*instanceProto*/
					{
						next: function next() {
							const ar = this.__values;
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
					
				__Internal__.MapEntriesIterator = (!_shared.Natives.windowMap && types.INIT(__Internal__.MapIterator.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'MapEntriesIterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('MapEntriesIterator')), true) */,
					},
					/*instanceProto*/
					{
						next: function next() {
							const ar = this.__keys,
								vals = this.__values;
							if (this.__index < ar.length) {
								return {
									value: [ar[this.__index], vals[this.__index++]],
								};
							} else {
								return {
									done: true,
								};
							};
						},
					})));
					
					
				types.ADD('Map', (_shared.Natives.windowMap || types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Map',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Map')), true) */,
					},
					/*instanceProto*/
					{
						size: types.CONFIGURABLE(types.READ_ONLY( 0 )),
						__keys: types.CONFIGURABLE(types.NOT_ENUMERABLE(types.READ_ONLY( null ))),
						__values: types.CONFIGURABLE(types.NOT_ENUMERABLE(types.READ_ONLY( null ))),

						_new: types.SUPER(function _new(ar) {
							this._super();
							
							if (types.isNothing(ar)) {
								// Do nothing
							} else if (types._instanceof(ar, types.Map)) {
								_shared.setAttribute(this, '__keys', types.clone(ar.__keys));
								_shared.setAttribute(this, '__values', types.clone(ar.__values));
								_shared.setAttribute(this, 'size', ar.size);
								return;
							} else if (types._instanceof(ar, types.Set)) {
								ar = ar.__ar;
							} else if (types.isArrayLike(ar)) {
								// Do nothing
							} else {
								throw types.TypeError("Invalid array.");
							};

							const keys = _shared.setAttribute(this, '__keys', []);
							const vals = _shared.setAttribute(this, '__values', []);
							
							if (ar) {
								const len = ar.length;
								for (let i = 0; i < len; i++) {
									if (types.has(ar, i)) {
										const item = ar[i];
										keys.push(item[0]);
										vals.push(item[1]);
									};
								};
								_shared.setAttribute(this, 'size', keys.length);
							};
						}),
						has: function has(key) {
							const keys = this.__keys,
								len = keys.length;
							for (let i = 0; i < len; i++) {
								if (keys[i] === key) {
									return true;
								};
							};
							return false;
						},
						get: function get(key) {
							const keys = this.__keys,
								len = keys.length;
							for (let i = 0; i < len; i++) {
								if (keys[i] === key) {
									return this.__values[i];
								};
							};
						},
						set: function set(key, value) {
							const keys = this.__keys,
								len = keys.length;
							let found = false;
							for (let i = 0; i < len; i++) {
								if (keys[i] === key) {
									this.__values[i] = value;
									found = true;
									break;
								};
							};
							if (!found) {
								keys.push(key);
								this.__values.push(value);
								_shared.setAttribute(this, 'size', this.size + 1);
							};
							return this;
						},
						delete: function _delete(key) {
							const keys = this.__keys,
								len = keys.length;
							for (let i = 0; i < len; i++) {
								if (keys[i] === key) {
									keys.splice(i, 1);
									this.__values.splice(i, 1);
									_shared.setAttribute(this, 'size', this.size - 1);
									return true;
								};
							};
							return false;
						},
						clear: function clear() {
							_shared.setAttribute(this, '__keys', []);
							_shared.setAttribute(this, '__values', []);
							_shared.setAttribute(this, 'size', 0);
						},
						keys: function keys() {
							return new __Internal__.MapKeysIterator(this);
						},
						values: function values() {
							return new __Internal__.MapValuesIterator(this);
						},
						entries: function entries() {
							return new __Internal__.MapEntriesIterator(this);
						},
						forEach: function forEach(callbackFn, /*optional*/thisObj) {
							const keys = this.__keys,
								values = this.__values,
								len = keys.length;
							for (let i = 0; i < len; i++) {
								callbackFn.call(thisObj, values[i], keys[i], this);
							};
						},
					}
				)));
				
				if (!_shared.Natives.windowMap && _shared.Natives.symbolIterator) {
					_shared.setAttribute(types.Map.prototype, _shared.Natives.symbolIterator, function() {
						return this.entries();
					}, {});
				};

				__Internal__.oldTypesIsClonable = _shared.isClonable;
				_shared.isClonable = function isClonable(obj, /*optional*/cloneFunctions) {
					return types._instanceof(obj, types.Map) || __Internal__.oldTypesIsClonable.call(this, obj, cloneFunctions);
				};

				__Internal__.oldTypesClone = _shared.clone;
				_shared.clone = function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked, /*optional*/keepNonClonable) {
					if (types._instanceof(obj, types.Map)) {
						// TODO: Depth cloning
						depth = +depth || 0;  // null|undefined|true|false|NaN|Infinity
						if (depth > 0) {
							throw new types.NotSupported("Depth cloning a Map is not supported.");
						};
						return new types.Map(obj);
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