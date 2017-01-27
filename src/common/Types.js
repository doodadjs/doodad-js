//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Types.js - Types management
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
		DD_MODULES['Doodad.Types'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				var doodad = root.Doodad,  // pre-defined from Bootstrap.js
					types = doodad.Types,  // pre-defined from Bootstrap.js
					tools = doodad.Tools;  // pre-defined from Bootstrap.js
				
				//===================================
				// Internal
				//===================================
				
				var __Internal__ = {
					// "toSource"
					supportsVerticalTabEscape: ('\v' !== 'v'),
					supportsNullCharEscape: ('\0' !== '0'),
				};

				//===================================
				// Options
				//===================================
					
				var __options__ = types.nullObject({
					toSourceItemsCount: 255,		// Max number of items
				}, _options);

				__options__.toSourceItemsCount = types.toInteger(__options__.toSourceItemsCount);

				types.freezeObject(__options__);

				types.ADD('getOptions', function() {
					return __options__;
				});

				//===================================
				// Native functions
				//===================================
					
				// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.
				// NOTE: Store everything because third-parties can override them.
				
				types.complete(_shared.Natives, {
					// No polyfills

					// "toArray"
					arrayConstructor: global.Array,
					
					// "clone", "toArray", "setPromise"
					arraySlice: global.Array.prototype.slice,
					
					// "popAt", "popItem", "popItems"
					arraySplice: global.Array.prototype.splice,
					
					// "prepend"
					arrayUnshift: global.Array.prototype.unshift,
					
					objectToString: global.Object.prototype.toString,

					windowObject: global.Object,
					
					// "toString"
					windowString: global.String,

					// "isGeneratorFunction" Firefox (why "isGenerator" is in the prototype ???)
					functionIsGenerator: (global.Function && global.Function.prototype && types.isNativeFunction(global.Function.prototype.isGenerator) ? global.Function.prototype.isGenerator : undefined),

					// "toSource"
					stringCharCodeAt: global.String.prototype.charCodeAt,
					
					// "isObjectLikeAndNotEmpty", "hasIndex"
					windowNumber: global.Number,

					// "keysInherited", "symbolsInherited"
					objectPrototype: global.Object.prototype,
					
					// Polyfills
					
					// "values"
					objectValues: (types.isNativeFunction(global.Object.values) ? global.Object.values : undefined),
					
					// "entries"
					objectEntries: (types.isNativeFunction(global.Object.entries) ? global.Object.entries : undefined),
					
					// "bind"
					functionBind: (types.isNativeFunction(Function.prototype.bind) ? Function.prototype.bind : undefined),
					
					// ES6
					windowPromise: (types.isFunction(global.Promise) ? global.Promise : undefined),
					windowSet: (types.isNativeFunction(global.Set) && types.isNativeFunction(global.Set.prototype.values) && types.isNativeFunction(global.Set.prototype.keys) ? global.Set : undefined),
					windowMap: (types.isNativeFunction(global.Map) && types.isNativeFunction(global.Map.prototype.values) && types.isNativeFunction(global.Map.prototype.keys) ? global.Map : undefined),

					// "toArray"
					arrayFrom: ((global.Array && types.isNativeFunction(Array.from)) ? global.Array.from : undefined),
					
					// "isArrayBuffer"
					arrayBuffer: (types.isNativeFunction(global.ArrayBuffer) ? global.ArrayBuffer : undefined),
					
					// "hasIterators", "isIterable"
					symbolIterator: (types.isNativeFunction(global.Symbol) && (typeof global.Symbol.iterator === 'symbol') ? global.Symbol.iterator : undefined),
				});
				
				//===================================
				// Conversion
				//===================================
				
				__Internal__.returnUndefined = function() {
					return undefined;
				};
				__Internal__.returnUndefinedString = function() {
					return 'undefined';
				};
				__Internal__.returnNull = function() {
					return null;
				};
				__Internal__.returnNullString = function() {
					return 'null';
				};
				
				types.ADD('Undefined', function Undefined() {});
				types.extend(types.Undefined.prototype, {
					valueOf: __Internal__.returnUndefined,
					toString: __Internal__.returnUndefinedString,
					toSource: __Internal__.returnUndefinedString,
				});

				types.ADD('Null', function Null() {});
				types.extend(types.Null.prototype, {
					valueOf: __Internal__.returnNull,
					toString: __Internal__.returnNullString,
					toSource: __Internal__.returnNullString,
				});
				
				types.ADD('toObject', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "A value to convert.",
									},
								},
								returns: 'object',
								description: "Converts any value to its object equivalent.",
					}
					//! END_REPLACE()
					, function(val) {
						if (val === undefined) {
							return new types.Undefined();
						} else if (val === null) {
							return new types.Null();
						} else {
							return _shared.Natives.windowObject(val);
						};
					}));
				
				types.ADD('toArray', (_shared.Natives.arrayFrom || root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
								params: {
									obj: {
										type: 'string,array,arraylike',
										optional: false,
										description: "A value to convert.",
									},
									mapFn: {
										type: 'function',
										optional: true,
										description: "A transform function.",
									},
									thisObj: {
										type: 'any',
										optional: true,
										description: "When 'mapFn' is specified, specifies 'this'. Default is 'undefined'.",
									},
								},
								returns: 'array',
								description: "Converts a value to an array.",
					}
					//! END_REPLACE()
					, function toArray(obj, /*optional*/mapFn, /*optional*/thisObj) {
						if (types.isNothing(obj)) {
							throw new types.TypeError("can't convert " + ((obj === null) ? 'null' : 'undefined') + " to object");
						};
						obj = _shared.Natives.windowObject(obj);
						var result,
							fill = false;
						if (types.isString(obj)) {
							result = _shared.Natives.arraySlice.call(obj);
						} else { //if (types.isArrayLike(obj)) {
							if (obj.length === 1) {
								// <PRB> With only one integer argument to the constructor, an Array of X empty slots is created
								result = [obj[0]];
							} else {
								result = _shared.Natives.arrayConstructor.apply(null, obj);
							};
						};
						var len = result.length;
						if (mapFn) {
							for (var key = 0; key < len; key++) {
								result[key] = mapFn.call(thisObj, result[key], key);
							};
						};
						return result;
					})));
				
				//===================================
				// Shared Symbols
				//===================================
				
				_shared.NameSymbol = types.getSymbol('__NAME__');

				//===================================
				// is*
				//===================================

				types.ADD('isArrayAndNotEmpty', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the object is an array and is not empty. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isArrayAndNotEmpty(obj) {
						if (types.isArray(obj)) {
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return true;
								};
							};
						};
						return false;
					}));
				
				types.ADD('isArrayLikeAndNotEmpty', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the object is an array-like object and is not empty. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isArrayLikeAndNotEmpty(obj) {
						if (types.isArrayLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return true;
								};
							};
						};
						return false;
					}));
				
				types.ADD('isNothingOrEmpty', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the object is nothing (is 'undefined' or 'null') or empty (has no own properties). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isNothingOrEmpty(obj) {
						if (types.isNothing(obj)) {
							return true;
						} else if (types.isArrayLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return false;
								};
							};
							return true;
						} else if (types.isObjectLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							for (var key in obj) {
								if (types.has(obj, key)) {
									return false;
								};
							};
							if (types.symbols(obj).length) {
								return false;
							};
							return true;
						};
						return false;
					}));
				
				types.ADD('isEmpty', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the object is empty (has no own properties). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isEmpty(obj) {
						if (types.isArrayLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return false;
								};
							};
							return true;
						} else if (types.isObjectLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							for (var key in obj) {
								if (types.has(obj, key)) {
									return false;
								};
							};
							if (types.symbols(obj).length) {
								return false;
							};
							return true;
						};
						return false;
					}));
				
				types.ADD('isStringAndNotEmpty', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the object is a non-empty string. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isStringAndNotEmpty(obj) {
						return types.isString(obj) && !!obj.length;
					}));
				
				types.ADD('isStringAndNotEmptyTrim', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the object is a non-empty string when trimmed (spaces removed). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isStringAndNotEmptyTrim(obj) {
						return types.isString(obj) && !!root.Doodad.Tools.trim(obj).length;
					}));
				
				types.ADD('isObjectAndNotEmpty', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the value is a non-empty object (has own properties). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isObjectAndNotEmpty(obj) {
						// "Object.keys" Polyfill from Mozilla Developer Network.
						if (types.isObject(obj)) {
							for (var key in obj) {
								if (types.has(obj, key)) {
									return true;
								};
							};
							//IE8 if (__Internal__.hasDontEnumBug) {
							//IE8 	for (var i = 0; i < __Internal__.defaultNonEnumerables.length; i++) {
							//IE8 		var key = __Internal__.defaultNonEnumerables[i];
							//IE8 		if (types.has(obj, key)) {
							//IE8 			return true;
							//IE8 		};
							//IE8 	};
							//IE8 };
							if (types.symbols(obj).length) {
								return true;
							};
						};
						return false;
					}));
				
				types.ADD('isObjectLikeAndNotEmpty', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the value is like a non-empty object (has own properties). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isObjectLikeAndNotEmpty(obj) {
						if (types.isObjectLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (var key in obj) {
									var number = _shared.Natives.windowNumber(key);
									if ((types.isNaN(number) || !types.isFinite(number)) && types.has(obj, key)) {
										return true;
									};
								};
							} else {
								// "Object.keys" Polyfill from Mozilla Developer Network.
								for (key in obj) {
									if (types.has(obj, key)) {
										return true;
									};
								};
								if (types.symbols(obj).length) {
									return true;
								};
							};
							//IE8 if (__Internal__.hasDontEnumBug) {
							//IE8 	for (var i = 0; i < __Internal__.defaultNonEnumerables.length; i++) {
							//IE8 		var key = __Internal__.defaultNonEnumerables[i];
							//IE8 		if (types.has(obj, key)) {
							//IE8 			return true;
							//IE8 		};
							//IE8 	};
							//IE8 };
						};
						return false;
					}));

				//=======================================================
				// Objects
				//=======================================================
					
				types.ADD('gets', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									keys: {
										type: 'arrayof(string,symbol),string,symbol',
										optional: false,
										description: "Attribute names.",
									},
									_defaults: {
										type: 'objectof(any)',
										optional: true,
										description: "Default values.",
									},
									inherited: {
										type: 'bool',
										optional: true,
										description: "When 'true', the function look at inherited own properties. Default is 'false'.",
									},
								},
								returns: 'objectof(any)',
								description: "Returns an object with the value of each named own property. When an own property doesn't exist, gets its value from the '_defaults' parameter.",
					}
					//! END_REPLACE()
					, function gets(obj, keys, /*optional*/_defaults, /*optional*/inherited) {
						if (types.isNothing(keys)) {
							keys = [];
						};
						var result = {};
						obj = _shared.Natives.windowObject(obj);
						if (!types.isArray(keys)) {
							keys = [keys];
						};
						var keysLen = keys.length,
							hasKey = (inherited ? types.hasInherited : types.has);
						for (var i = 0; i < keysLen; i++) {
							var key = keys[i];
							if (obj && hasKey(obj, key)) {
								result[key] = obj[key];
							} else if (_defaults && types.has(_defaults, key)) {
								result[key] = _defaults[key];
							};
						};
						return result;
					}));
				
				types.ADD('set', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									key: {
										type: 'string,symbol',
										optional: false,
										description: "Attribute name.",
									},
									value: {
										type: 'any',
										optional: false,
										description: "Attribute's new value.",
									},
									inherited: {
										type: 'bool',
										optional: true,
										description: "When 'true', the function look at inherited own properties. Default is 'false'.",
									},
								},
								returns: 'any',
								description: "Sets the value of an own property and returns that value. When this own property doesn't exist, it only returns 'undefined'.",
					}
					//! END_REPLACE()
					, function set(obj, key, value, /*optional*/inherited) {
						if (types.isNothing(obj)) {
							return;
						};
						obj = _shared.Natives.windowObject(obj);
						var hasKey = (inherited ? types.hasInherited : types.has);
						if (hasKey(obj, key)) {
							return obj[key] = value;
						};
					}));
				
				types.ADD('sets', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									values: {
										type: 'objectof(any)',
										optional: false,
										description: "Values.",
									},
									inherited: {
										type: 'bool',
										optional: true,
										description: "When 'true', the function look at inherited own properties. Default is 'false'.",
									},
								},
								returns: 'objectof(any)',
								description: "Sets the value of each provided own property and returns these values. When an own property doesn't exist, does nothing.",
					}
					//! END_REPLACE()
					, function sets(obj, values, /*optional*/inherited) {
						var result = {};
						if (types.isNothing(obj)) {
							return result;
						};
						obj = _shared.Natives.windowObject(obj);
						var keys = types.append(types.keys(values), types.symbols(values)),
							keysLen = keys.length,
							hasKey = (inherited ? types.hasInherited : types.has);
						for (var i = 0; i < keysLen; i++) {
							var key = keys[i];
							if (hasKey(obj, key)) {
								result[key] = obj[key] = values[key];
							};
						};
						return result;
					}));
				
				types.ADD('getsDefault', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									keys: {
										type: 'arrayof(string,symbol),string,symbol',
										optional: false,
										description: "Attribute names.",
									},
									_defaults: {
										type: 'objectof(any)',
										optional: true,
										description: "Default values.",
									},
									inherited: {
										type: 'bool',
										optional: true,
										description: "When 'true', the function look at inherited own properties. Default is 'false'.",
									},
								},
								returns: 'objectof(any)',
								description: "Returns an object with the value of each named own property. When an own property doesn't exist, creates that own property using the value from the '_defaults' parameter.",
					}
					//! END_REPLACE()
					, function getsDefault(obj, keys, /*optional*/_defaults, /*optional*/inherited) {
						if (types.isNothing(keys)) {
							keys = [];
						};
						var result = {};
						obj = _shared.Natives.windowObject(obj);
						if (!types.isArray(keys)) {
							keys = [keys];
						};
						var keysLen = keys.length,
							hasKey = (inherited ? types.hasInherited : types.has);
						for (var i = 0; i < keysLen; i++) {
							var key = keys[i];
							if (obj && hasKey(obj, key)) {
								result[key] = obj[key];
							} else if (types.has(_defaults, key)) {
								var val = _defaults[key];
								if (obj) {
									result[key] = obj[key] = val;
								};
							};
						};
						return result;
					}));
				
				types.ADD('keysInherited', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object.",
									},
								},
								returns: 'arrayof(string)',
								description: "Returns an array of enumerable owned property names and inherited property names of an object. For array-like objects, index properties are excluded.",
					}
					//! END_REPLACE()
					, function keysInherited(obj) {
						if (types.isNothing(obj)) {
							return [];
						};
						obj = _shared.Natives.windowObject(obj);
						if (obj === _shared.Natives.objectPrototype) {
							return [];
						};
						return types.unique(types.keys(obj), types.keysInherited(types.getPrototypeOf(obj)));
					}));
				
				types.ADD('symbolsInherited', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object.",
									},
								},
								returns: 'arrayof(symbol)',
								description: "Returns an array of enumerable owned property symbols and inherited property symbols of an object. For array-like objects, index properties are excluded.",
					}
					//! END_REPLACE()
					, function symbolsInherited(obj) {
						if (types.isNothing(obj)) {
							return [];
						};
						obj = _shared.Natives.windowObject(obj);
						if (obj === _shared.Natives.objectPrototype) {
							return [];
						};
						return types.unique(types.symbols(obj), types.symbolsInherited(types.getPrototypeOf(obj)));
					}));
				
				types.ADD('depthComplete', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									depth: {
										type: 'integer',
										optional: false,
										description: "Depth.",
									},
									paramarray: {
										type: 'any',
										optional: false,
										description: "An object.",
									},
								},
								returns: 'object',
								description: "Extends the first object with owned properties of the other objects using the specified depth. Existing owned properties are excluded.",
					}
					//! END_REPLACE()
					, function depthComplete(depth, /*paramarray*/obj) {
						var result;
						if (!types.isNothing(obj)) {
							depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
							if (depth >= -1) {
								result = _shared.Natives.windowObject(obj);
								var len = arguments.length;
								for (var i = 2; i < len; i++) {
									obj = arguments[i];
									if (types.isNothing(obj)) {
										continue;
									};
									// Part of "Object.assign" Polyfill from Mozilla Developer Network.
									obj = _shared.Natives.windowObject(obj);
									var keys = types.append(types.keys(obj), types.symbols(obj)),
										keysLen = keys.length; // performance
									for (var j = 0; j < keysLen; j++) {
										var key = keys[j];
										var objVal = obj[key];
										if ((depth >= 0) && types.isObjectLike(objVal)) {
											var resultVal = result[key];
											if (types.isNothing(resultVal)) {
												result[key] = types.depthComplete(depth, {}, objVal);
											} else if (types.isObjectLike(resultVal)) {
												types.depthComplete(depth, resultVal, objVal);
											};
										} else if (!types.has(result, key)) {
											result[key] = objVal;
										};
									};
								};
							};
						};

						return result;
					}));
				
				types.ADD('fill', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									keys: {
										type: 'arrayof(string,symbol),string,symbol',
										optional: false,
										description: "Attribute names.",
									},
									paramarray: {
										type: 'any',
										optional: false,
										description: "An object.",
									},
								},
								returns: 'object',
								description: "Extends the first object with named owned properties of the other objects.",
					}
					//! END_REPLACE()
					, function fill(keys, /*paramarray*/obj) {
						var result;
						if (!types.isNothing(obj)) {
							if (types.isNothing(keys)) {
								keys = [];
							} else if (!types.isArray(keys)) {
								keys = [keys];
							};
							result = _shared.Natives.windowObject(obj);
							var argumentsLen = arguments.length,
								keysLen = keys.length;
							for (var i = 1; i < argumentsLen; i++) {
								obj = arguments[i];
								if (!types.isNothing(obj)) {
									obj = _shared.Natives.windowObject(obj);
									for (var k = 0; k < keysLen; k++) {
										if (k in keys) {
											var key = keys[k];
											if (types.has(obj, key)) {
												result[key] = obj[key];
											};
										};
									};
								};
							};
						};
						return result;
					}));
				
				// NOTE: These functions will get replaced when "Doodad.js" is loaded.
				_shared.isClonable = function isClonable(obj, /*optional*/cloneFunctions) {
					return !types.isString(obj) && (types.isArrayLike(obj) || types.isObject(obj) || types._instanceof(obj, types.Map) || types._instanceof(obj, types.Set) || (!!cloneFunctions && types.isCustomFunction(val)));
				};

				_shared.clone = function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked) {
					// NOTE: This function will get replaced when "Doodad.js" is loaded.
					var result;

					if (types.isNothing(obj)) {
						result = obj;
					} else {
						var isArray = types.isArrayLike(obj);
						depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
						cloneFunctions = (+cloneFunctions || 0) - 1;  // null|undefined|true|false|NaN|Infinity
							
						if (types.isClonable(obj)) {
							if (isArray) {
								obj = _shared.Natives.windowObject(obj);
								if (depth >= 0) {
									result = new _shared.Natives.arrayConstructor(obj.length);
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											result[key] = types.clone(obj[key], depth, cloneFunctions);
										};
									};
								} else {
									result = _shared.Natives.arraySlice.call(obj, 0);
								};
							} else if (types.isCustomFunction(obj)) {
								if (cloneFunctions >= 0) {
									//result = types.eval(_shared.Natives.functionToString.call(obj));
									result = types.eval(obj.toString());
								} else {
									return obj;
								};
							} else if (types._instanceof(obj, types.Map)) {
								result = new types.Map(obj);
							} else if (types._instanceof(obj, types.Set)) {
								result = new types.Set(obj);
							} else {  // if (types.isObject(obj))
								result = types.createObject(types.getPrototypeOf(obj));
							};
						} else {
							throw new types.Error("Object is not clonable.");
						};

						// Copy properties
						var keys = types.append(types.allKeys(obj), types.allSymbols(obj)),
							props = {};
						for (var i = 0; i < keys.length; i++) {
							var key = keys[i];
							if (isArray) {
								if (key === 'length') {
									continue;
								};
								var tmp = _shared.Natives.windowNumber(key);
								if (!types.isNaN(tmp) && !types.isInfinite(tmp)) {
									continue;
								};
							};
							var prop = types.getOwnPropertyDescriptor(result, key);
							if (!prop || prop.configurable) {
								prop = types.getOwnPropertyDescriptor(obj, key);
								if (types.has(prop, 'value') && (depth >= 0)) {
									prop.value = types.clone(prop.value, depth, cloneFunctions);
								};
								props[key] = prop;
							};
						};
						types.defineProperties(result, props);

						if (!keepUnlocked) {
							if (types.isFrozen(obj)) {
								types.freezeObject(result);
							} else if (!types.isExtensible(obj)) {
								types.preventExtensions(result);
							};
						};
					};
						
					return result;
				};

				types.ADD('isClonable', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "Object to test for.",
									},
									cloneFunctions: {
										type: 'bool',
										optional: true,
										description: "When 'true', the function will returns 'true' for custom functions. Default is 'false'.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the value is clonable.",
					}
					//! END_REPLACE()
					, function isClonable(obj, /*optional*/cloneFunctions) {
						return _shared.isClonable(obj, cloneFunctions);
					}));
				
				types.ADD('clone', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 5,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "A clonable value.",
									},
									depth: {
										type: 'integer',
										optional: true,
										description: "Depth.",
									},
									cloneFunctions: {
										type: 'bool,integer',
										optional: true,
										description: "When 'true', the function will clone custom functions. When an integer, it will specify the depth where custom functions are cloned. Default is 'false'.",
									},
									keepUnlocked: {
										type: 'bool',
										optional: true,
										description: "When 'true', the result will not get locked (frozen or not extensible) when the original object was. When 'false', the result will get locked as the original. Default is 'false'.",
									},
								},
								returns: 'any',
								description: "Clones a value.",
					}
					//! END_REPLACE()
					, function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked) {
						return _shared.clone(obj, depth, cloneFunctions, keepUnlocked);
					}));
				

				//========================================
				// Arrays
				//========================================
				
				types.ADD('hasIndex', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'arraylike',
										optional: false,
										description: "An array-like object.",
									},
									indexes: {
										type: 'arrayof(integer)',
										optional: false,
									},
								},
								returns: 'bool',
								description: "Returns 'true' when the array has a value (non-empty slot) among specified array indexes.",
					}
					//! END_REPLACE()
					, function hasIndex(obj, indexes) {
						if (types.isArrayLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							if (!types.isArray(indexes)) {
								indexes = [indexes];
							};
							var len = indexes.length;
							if (!len) {
								return false;
							};
							for (var i = 0; i < len; i++) {
								if (i in indexes) {
									var index = indexes[i],
										number = _shared.Natives.windowNumber(index);
									if (types.isNaN(number) || !types.isFinite(number) || !(index in obj)) {
										return false;
									};
								};
							};
							return true;
						} else {
							return false;
						};
					}));
				
				types.ADD('indexes', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'arraylike',
										optional: false,
										description: "An array-like object.",
									},
								},
								returns: 'arrayof(integer)',
								description: "Returns every array indexes where there is a value (non-empty slot).",
					}
					//! END_REPLACE()
					, function indexes(obj) {
						var result = [];
						if (types.isArrayLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									result.push(key);
								};
							};
						};
						return result;
					}));
				
				types.ADD('values', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'object,arraylike',
										optional: false,
										description: "An object or an array-like object.",
									},
								},
								returns: 'arrayof(any)',
								description: "Returns the values of an array-like object, or the values of the owned properties of an object.",
					}
					//! END_REPLACE()
					, function values(obj) {
						if (types.isNothing(obj)) {
							return [];
						} else {
							if (_shared.Natives.objectValues && !types.isArrayLike(obj)) {
								return _shared.Natives.objectValues(obj);
							} else {
								obj = _shared.Natives.windowObject(obj);
								var result = [];
								var keys = types.keys(obj),
									len = keys.length; // performance
								for (var i = 0; i < len; i++) {
									result.push(obj[keys[i]]);
								};
								return result;
							};
						};
					}));
				
				types.ADD('entries', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object.",
									},
								},
								returns: 'arrayof(array)',
								description: "Returns key-value pairs of the owned properties of an object. Also includes indexes of array-like objects.",
					}
					//! END_REPLACE()
					, function entries(obj) {
						if (types.isNothing(obj)) {
							return [];
						} else {
							obj = _shared.Natives.windowObject(obj);
							if (_shared.Natives.objectEntries) {
								return _shared.Natives.objectEntries(obj);
							} else {
								var result = [];
								for (var key in obj) {
									if (types.has(obj, key)) {
										result.push([key, obj[key]]);
									};
								};
								return result;
							};
						};
					}));
				
				types.ADD('items', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'object,arraylike',
										optional: false,
										description: "An object or an array-like object.",
									},
								},
								returns: 'arrayof(array)',
								description: "Returns the indexes and the values of an array-like object, or the names and values of the owned properties of an object.",
					}
					//! END_REPLACE()
					, function items(obj) {
						if (types.isNothing(obj)) {
							return [];
						} else {
							obj = _shared.Natives.windowObject(obj);
							if (types.isArrayLike(obj)) {
								var result = [];
								var len = obj.length;
								for (var key = 0; key < len; key++) {
									if (types.has(obj, key)) {
										result.push([key, obj[key]]);
									};
								};
								return result;
							} else if (_shared.Natives.objectEntries) {
								return _shared.Natives.objectEntries(obj);
							} else {
								var result = [];
								for (var key in obj) {
									if (types.has(obj, key)) {
										result.push([key, obj[key]]);
									};
								};
								return result;
							};
						};
					}));
				
				types.ADD('available', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'arraylike',
										optional: false,
										description: "An array-like object.",
									},
								},
								returns: 'integer',
								description: "Returns the first available array index (the index of the first empty slot).",
					}
					//! END_REPLACE()
					, function available(obj) {
						if (types.isArrayLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (!(key in obj)) {
									return key;
								};
							};
						};
						return -1;
					}));
				
				types.ADD('availables', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'arraylike',
										optional: false,
										description: "An array-like object.",
									},
								},
								returns: 'arrayof(integer)',
								description: "Returns all available array indexes (the indexes of every empty slots).",
					}
					//! END_REPLACE()
					, function availables(obj) {
						var keys = [];
						if (types.isArrayLike(obj)) {
							obj = _shared.Natives.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (!(key in obj)) {
									keys.push(key);
								};
							};
						};
						return keys;
					}));
				
				types.ADD('getFirstIndex', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'arraylike',
										optional: false,
										description: "An array-like object.",
									},
								},
								returns: 'integer',
								description: "Returns the index of the first available value (the index of the first non-empty slot).",
					}
					//! END_REPLACE()
					, function getFirstIndex(obj) {
						if (types.isArrayLike(obj)) {
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return key;
								};
							};
						};
					}));
				
				types.ADD('getFirstValue', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'arraylike',
										optional: false,
										description: "An array-like object.",
									},
								},
								returns: 'any',
								description: "Returns the first available value (the value of the first non-empty slot).",
					}
					//! END_REPLACE()
					, function getFirstValue(obj) {
						if (types.isArrayLike(obj)) {
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return obj[key];
								};
							};
						};
					}));
				
				types.ADD('popAt', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object,array',
										optional: false,
										description: "An object or an array.",
									},
									key: {
										type: 'string,integer',
										optional: false,
										description: "An attribute name or an array index.",
									},
								},
								returns: 'any',
								description: "Deletes the named own property of an object and returns its value. If object is an array, splices at the specified array index if 'key' is any existing array index.",
					}
					//! END_REPLACE()
					, function popAt(obj, key) {
						if (!types.isNothing(obj)) {
							obj = _shared.Natives.windowObject(obj);
							if (types.isArray(obj)) {
								if (key in obj) {
									var item = obj[key];
									_shared.Natives.arraySplice.call(obj, key, 1);
									return item;
								};
							};
							if (types.has(obj, key)) {
								var item = obj[key];
								delete obj[key];
								return item;
							};
						};
					}));
				
				types.ADD('popItem', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									obj: {
										type: 'object,array',
										optional: false,
										description: "An object or an array.",
									},
									item: {
										type: 'any,function',
										optional: false,
										description: "The value of the item to pop out. When it is a function, calls it to get the item to pop out.",
									},
									thisObj: {
										type: 'any',
										optional: true,
										description: "When 'item' is a function, specifies 'this'. Default is 'undefined'.",
									},
									includeFunctions: {
										type: 'bool',
										optional: true,
										description: "When 'true' and 'item' is a function, considers that function as a value. Default is 'false'",
									},
								},
								returns: 'any',
								description: "Search the first occurrence of the specified value among owned properties of an object, than deletes it and returns that value. When not found, returns 'undefined'. If object is an array, splices at the index of the first occurrence.",
					}
					//! END_REPLACE()
					, function popItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions) {
						if (!types.isNothing(obj)) {
							obj = _shared.Natives.windowObject(obj);
							if (!includeFunctions && types.isFunction(item)) {
								if (types.isArray(obj)) {
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var val = obj[key];
											if (item.call(thisObj, val, key, obj)) {
												_shared.Natives.arraySplice.call(obj, key, 1);
												return val;
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length; // performance
									for (var i = 0; i < len; i++) {
										var key = keys[i];
										var val = obj[key];
										if (item.call(thisObj, val, key, obj)) {
											delete obj[key];
											return val;
										};
									};
								};
							} else {
								if (types.isArray(obj)) {
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var val = obj[key];
											if (val === item) {
												_shared.Natives.arraySplice.call(obj, key, 1);
												return val;
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length; // performance
									for (var i = 0; i < len; i++) {
										var key = keys[i];
										var val = obj[key];
										if (val === item) {
											delete obj[key];
											return val;
										};
									};
								};
							};
						};
					}));
				
				types.ADD('popItems', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
								params: {
									obj: {
										type: 'object,array',
										optional: false,
										description: "An object or an array.",
									},
									items: {
										type: 'arrayof(any),function',
										optional: false,
										description: "The values of the items to pop out. When it is a function, calls it to get the items to pop out.",
									},
									thisObj: {
										type: 'any',
										optional: true,
										description: "When 'items' is a function, specifies 'this'. Default is 'undefined'.",
									},
								},
								returns: 'arrayof(any)',
								description: "Search all occurrence of the specified values among owned properties of an object, than deletes them and returns these values in an array. If object is an array, splices at the indexes of each occurrences.",
					}
					//! END_REPLACE()
					, function popItems(obj, items, /*optional*/thisObj) {
						var result = [];
						if (!types.isNothing(obj)) {
							obj = _shared.Natives.windowObject(obj);
								
							if (types.isFunction(items)) {
								if (types.isArray(obj)) {
									for (var key = obj.length - 1; key >= 0; key--) {
										if (key in obj) {
											var val = obj[key];
											if (items.call(thisObj, val, key, obj)) {
												_shared.Natives.arraySplice.call(obj, key, 1);
												result.push(val);
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length; // performance
									for (var i = 0; i < len; i++) {
										var key = keys[i];
										var val = obj[key];
										if (items.call(thisObj, val, key, obj)) {
											delete obj[key];
											result.push(val);
										};
									};
								};
							} else if (types.isArray(items)) {
								var itemsLen = items.length;
								if (types.isArray(obj)) {
									for (var key = obj.length - 1; key >= 0; key--) {
										if (key in obj) {
											var val = obj[key];
											for (var j = 0; j < itemsLen; j++) {
												if (j in items) {
													if (items[j] === val) {
														_shared.Natives.arraySplice.call(obj, key, 1);
														result.push(val);
													};
												};
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length; // performance
									for (var i = 0; i < len; i++) {
										var key = keys[i];
										var val = obj[key];
										for (var j = 0; j < itemsLen; j++) {
											if (j in items) {
												if (items[j] === val) {
													delete obj[key];
													result.push(val);
												};
											};
										};
									};
								};
							};
						};
						return result;
					}));
				
				types.ADD('prepend', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									paramarray: {
										type: 'array',
										optional: false,
										description: "An array.",
									},
								},
								returns: 'array',
								description: "Prepends the items of each array to the first array than returns that array.",
					}
					//! END_REPLACE()
					, function prepend(obj /*paramarray*/) {
						if (!types.isArrayLike(obj)) {
							return null;
						};
						
						var result,
							start = 0;
						if (types.isArray(obj)) {
							result = obj;
							start = 1;
						} else {
							result = [];
						};
						
						var len = arguments.length;
						for (var i = start; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							obj = _shared.Natives.windowObject(obj);
							_shared.Natives.arrayUnshift.apply(result, obj);
						};
						
						return result;
					}));
				
				
				//===================================
				// "toSource" function
				//===================================
				
				types.ADD('toSource', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 4,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "A value.",
									},
									depth: {
										type: 'integer',
										optional: true,
										description: "Depth.",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Options.",
									},
								},
								returns: 'string',
								description: "Converts a value to its source code equivalent.",
					}
					//! END_REPLACE()
					, function toSource(obj, /*optional*/depth, /*optional*/options) {
						// TODO: "chain" option to generate the prototypes chain with "Object.setPrototypeOf"
						if (obj === undefined) {
							return 'undefined';
						} else if (obj === null) {
							return 'null';
						} else if (types.isNaN(obj)) {
							return "NaN";
						} else {
							var primitive = types.isPrimitive(obj);
							obj = _shared.Natives.windowObject(obj);
							var val = obj.valueOf();
							if (!primitive && types.isNothing(depth) && types.isFunction(obj.toSource) && types.get(options, 'allowToSource', false)) {
								return obj.toSource();
							} else {
								depth = (+depth || 0);  // null|undefined|true|false|NaN|Infinity
								if (types.isString(obj)) {
									var str = '',
										len = val.length;
									var allowNullChar = types.get(options, 'allowNullChar', __Internal__.supportsNullCharEscape);
									var allowVerticalTab = types.get(options, 'allowVerticalTab', __Internal__.supportsVerticalTabEscape);
									//var allowCodePoint = types.get(options, 'allowCodePoint', __Internal__.supportsCodePoint);
									//for (var i = 0; i < len; ) {
									for (var i = 0; i < len; i++) {
										//var code = (allowCodePoint ? unicode.codePointAt(val, i, true) : [_shared.Natives.stringCharCodeAt.call(val, i), 1]);
										//var size = code[1];
										//code = code[0];
										var code = _shared.Natives.stringCharCodeAt.call(val, i);
										if (allowNullChar && (code === 0x0000)) { // Null
											str += '\\0';
										} else if (code === 0x0008) { // Backspace
											str += '\\b';
										} else if (code === 0x0009) { // Horizontal Tab
											str += '\\t';
										} else if (code === 0x000A) { // Line Feed
											str += '\\n';
										} else if (allowVerticalTab && (code === 0x000B)) { // Vertical Tab
											str += '\\v';
										} else if (code === 0x000C) { // Form Feed
											str += '\\f';
										} else if (code === 0x000D) { // Carriage return
											str += '\\r';
										} else if (code === 0x0027) { // Single Quote
											str += "\\'";
										} else if (code === 0x005C) { // Backslash
											str += '\\\\';
										} else if (code === 0x00A0) { // Non-breaking space
											str += '\\u00A0';
										} else if (code === 0x2028) { // Line separator
											str += '\\u2028';
										} else if (code === 0x2029) { // Paragraph separator
											str += '\\u2029';
										} else if (code === 0xFEFF) { // Byte order mark
											str += '\\uFEFF';
										//} else if (allowCodePoint && (code >= 0x10000)) {
										//	str += '\\u{' + ('0000000' + code.toString(16)).slice(-8) + '}';
										} else if (((code >= 0x0000) && (code <= 0x001F)) || ((code >= 0x007F) && (code <= 0x009F)) || ((code >= 0xD800) && (code <= 0xDFFF))) { // Other control chars
											str += '\\u' + ('000' + code.toString(16)).slice(-4);
										} else {
											//str += val.slice(i, i + size);
											str += val.slice(i, i + 1);
										};
										//i += size;
									};
									if (primitive) {
										return "'" + str + "'";
									} else {
										return "(new String('" + str + "'))";
									};
								} else if (types.isBoolean(obj)) {
									if (primitive) {
										return (val ? 'true' : 'false');
									} else {
										return (val ? '(new Boolean(true))' : '(new Boolean(false))');
									};
								} else if (types.isNumber(obj)) {
									if (primitive) {
										return val.toString();
									} else {
										return '(new Number(' + val + '))';
									};
								} else if (types.isDate(obj)) {
									return '(new Date(' + obj.getFullYear() + ', ' + obj.getMonth() + ', ' + obj.getDate() + ', ' + obj.getHours() + ', ' + obj.getMinutes() + ', ' + obj.getSeconds() + ', ' + obj.getMilliseconds() + '))';
								} else if (types.isSymbol(obj)) {
									var key = types.getSymbolKey(obj);
									return (types.symbolIsGlobal(obj) && !types.isNothing(key) ? "Symbol.for(" + types.toSource(key, null, options) + ")" : (types.isNothing(key) ? "Symbol()" : "Symbol(" + types.toSource(key, null, options) + ")"));
								} else if (types.isError(obj)) {
									return '(new Error(' + types.toSource(obj.message || obj.description, null, options) + '))';
								} else if (types.isFunction(obj)) {
									if ((depth >= 0) && types.isCustomFunction(obj)) {
										return obj.toString();
									} else {
										return '(new Function())';
									};
								} else if (types.isArray(obj)) {
									var includeFunctions = types.get(options, 'includeFunctions', true);
									if (depth < 0) {
										return '(new Array(' + obj.length + '))';
									};
									var str = '',
										len = val.length,
										continued = '';
									depth--;
									var max = __options__.toSourceItemsCount;
									if (len > max) {
										len = max;
										continued = ', ...';
									};
									for (var key = 0; key < len; key++) {
										if (key in val) {
											var item = val[key];
											if (includeFunctions || !types.isFunction(item)) {
												str += types.toSource(item, depth, options) + ', ';
											};
										} else {
											str += ', ';
										};
									};
									return '[' + str.slice(0, -2) + continued + ']';
								} else if (types.isObject(obj)) {
									var includeFunctions = types.get(options, 'includeFunctions', true);
									if (depth < 0) {
										return '{}';
									};
									var str = '',
										len = 0,
										maxLen = __options__.toSourceItemsCount;
									depth--;
									var inherited = types.get(options, 'inherited', false);
									do {
										var keys = types.append(types.keys(obj), types.symbols(obj));
										for (var i = 0; i < keys.length; i++) {
											if (len >= maxLen) {
												str += '..., ';
												break;
											};
											var key = keys[i];
											var item = obj[key];
											if (includeFunctions || !types.isFunction(item)) {
												str += types.toSource(key) + ': ' + types.toSource(item, depth, options) + ', ';
											};
											len++;
										};
									} while (inherited && (obj = types.getPrototypeOf(obj)));
									return '{' + str.slice(0, -2) + '}';
								} else if (types.isObjectLike(obj)) {
									return types.toSource(_shared.Natives.objectToString.call(obj));
								} else {
									return obj.toString();
								};
							};
						};
					}));
				
				//===================================
				// Callback base type
				//===================================
				
				types.ADD('Callback', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'undefined',
							description: "Base of every callback handlers.",
					}
					//! END_REPLACE()
					, function(/*optional*/obj, fn) {
						throw new types.NotSupported("Type is a base type.");
					}));
				
				types.ADD('isCallback', function isCallback(obj) {
					return types.isCallable(obj) && types.baseof(types.Callback, obj);
				});
				
				// NOTE: Will be replaced by "Doodad.js"
				_shared.makeInside = function makeInside(/*optional*/obj, fn) {
					fn = types.unbind(fn);
					root.DD_ASSERT && root.DD_ASSERT(types.isBindable(fn), "Invalid function.");
					return (types.isNothing(obj) ? fn : types.bind(obj, fn));
				};
				
				
				//===================================
				// ES6 Promise
				//===================================

				__Internal__.Promise = null;
				__Internal__.symbolIsPromise = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('IsPromise')), true) */ '__DD_IS_PROMISE__' /*! END_REPLACE() */, true);
				__Internal__.symbolIsPromiseExtended = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('IsPromiseExtended')), true) */ '__DD_IS_PROMISE_EXTENDED__' /*! END_REPLACE() */, true);
				
				types.ADD('isPromise', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 2,
							params: {
								obj: {
									type: 'object',
									optional: false,
									description: "An object to test for.",
								},
							},
							returns: 'bool',
							description: "Returns 'true' if object is a Promise, 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isPromise(obj) {
						if (types.isNothing(obj) || (typeof obj !== 'object')) {
							return false;
						};
						if (types.isFunction(obj.constructor) && obj.constructor[__Internal__.symbolIsPromise]) {
							return true;
						};
						return types._instanceof(obj, [__Internal__.Promise, _shared.Natives.windowPromise]);
					}));
				
				types.ADD('getPromise', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'Promise',
							description: "Returns the ES6 Promise class or a polyfill.",
					}
					//! END_REPLACE()
					, function getPromise() {
						var Promise = __Internal__.Promise;
						if (!Promise) {
							throw new types.NotSupported("ES6 Promises are not supported. You must include the polyfill 'es6-promise' or 'rsvp' in your project. You can also use another polyfill (see 'types.setPromise').");
						};
						return Promise;
					}));

				__Internal__.addPromiseBluebirdPolyfills = function addPromiseBluebirdPolyfills(Promise) {
					// <PRB> Doing ".then(samefn).catch(samefn)" or ".then(samefn, samefn)" is very annoying.
					// Bluebird "asCallback" polyfill. NOTE: "spread" option has not been implemented.
					if (!types.isFunction(Promise.prototype.asCallback) && !types.isFunction(Promise.prototype.nodeify)) {
						Promise.prototype.nodeify = Promise.prototype.asCallback = function asCallback(callback) {
							var promise = this.then(function(result) {
									var retval = callback(null, result);
									if (retval === undefined) {
										retval = result;
									};
									return retval;
								}, function(err) {
									var retval = callback(err);
									return retval;
								});
							return promise;
						};
					} else if (!types.isFunction(Promise.prototype.asCallback)) {
						Promise.prototype.asCallback = Promise.prototype.nodeify;
					} else if (!types.isFunction(Promise.prototype.nodeify)) {
						Promise.prototype.nodeify = Promise.prototype.asCallback;
					};
					
					
					// Bluebird "finally" polyfill
					if (!types.isFunction(Promise.prototype['finally'])) {
						Promise.prototype['finally'] = function _finally(callback) {
							var Promise = this.constructor;
							var promise = this.then(function(result) {
									var retval = callback();
									return Promise.resolve(retval).then(function() {
										return result;
									});
								}, function(err) {
									var retval = callback();
									return Promise.resolve(retval).then(function() {
										throw err;
									});
								});
							return promise;
						};
					};
					
					
					// Bluebird "try" polyfill
					if (!types.isFunction(Promise['try'])) {
						Promise['try'] = function _try(callback) {
							return new this(function(resolve, reject) {
								try {
									resolve(callback());
								} catch(ex) {
									reject(ex);
								};
							});
						};
					};

					// Bluebird "map" polyfill + new Doodad options
					if (!types.isFunction(Promise.map)) {
						Promise.map = function _map(ar, fn, /*optional*/options) {
							var Promise = this;

							return Promise.try(function tryMap() {
								var len = ar.length;

								options = types.nullObject({
									concurrency: Infinity,
									thisObj: undefined, // New option added by Doodad
								}, options);
							
								if ((len <= 0) || (options.concurrency <= 0)) {
									return [];
								};

								var thisObj = options.thisObj;

								if (options.concurrency >= len) {
									return Promise.all(tools.map(ar, function _mapFn(val, key, obj) {
										return Promise.resolve(fn.call(thisObj, val, key, obj));
									}));
								} else {
									var result = _shared.Natives.arrayConstructor(len);
									var state = {start: 0};
									var mapFn = function _mapFn(val, key, obj) {
										state.start++;
										return Promise.resolve(fn.call(thisObj, val, key, obj))
											.then(function(res) {
												result[key] = res;
												var pos = state.start;
												if (pos < len) {
													return mapFn(obj[pos], pos, obj);
												};
											});
									};
									return Promise.all(tools.map(ar, mapFn, null, 0, options.concurrency))
										.then(function() {
											return result;
										});
								};
							});
						};
					};
				};

				__Internal__.addPromiseDoodadExtensions = function addPromiseDoodadExtensions(Promise) {
					function getPromiseName(callback) {
						var original;
						while (original = types.get(callback, _shared.OriginalValueSymbol)) {
							callback = original;
						};
						return types.get(callback, _shared.NameSymbol) || types.getFunctionName(callback);
					};

					// Add "thisObj" argument
					// Add promise name
					Promise.create = function create(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = new _shared.PromiseCallback(thisObj, callback);
						};
						var promise = new this(callback);
						if (callback) {
							promise[_shared.NameSymbol] = getPromiseName(callback);
						};
						return promise;
					};

					// Add "thisObj" argument
					// Add promise name
					var oldTry = Promise['try'];
					Promise['try'] = function _try(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = new _shared.PromiseCallback(thisObj, callback);
						};
						var promise = oldTry.call(this, callback);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = getPromiseName(callback);
						};
						return promise;
					};
					
					// Add "thisObj" argument
					// Add promise name
					var oldMap = Promise.map;
					Promise.map = function _map(ar, callback, /*optional*/options) {
						var thisObj = types.get(options, 'thisObj');
						if (callback && thisObj) {
							callback = new _shared.PromiseCallback(thisObj, callback);
						};
						var promise = oldMap.call(this, ar, callback, options);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = getPromiseName(callback);
						};
						return promise;
					};

					// Add "thisObj" argument
					// Add promise name
					var oldThen = Promise.prototype.then;
					Promise.prototype.then = function then(/*optional*/resolvedCb, /*optional*/rejectedCb, /*optional*/thisObj) {
						if (!thisObj && !types.isFunction(rejectedCb)) {
							thisObj = rejectedCb;
							rejectedCb = null;
						};
						if (resolvedCb && thisObj) {
							resolvedCb = new _shared.PromiseCallback(thisObj, resolvedCb);
						};
						if (rejectedCb && thisObj) {
							rejectedCb = new _shared.PromiseCallback(thisObj, rejectedCb);
						};
						var promise = oldThen.call(this, resolvedCb, rejectedCb);
						if (resolvedCb) {
							resolvedCb.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(resolvedCb);
						} else if (rejectedCb) {
							rejectedCb.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(rejectedCb);
						} else {
							promise[_shared.NameSymbol] = this[_shared.NameSymbol];
						};
						return promise;
					};
					
					// Add "thisObj" argument
					// Add promise name
					// Add Bluebird polyfill for catch (must be done there).
					// NOTE: Bluebird's "catch" has additional arguments (filters) compared to ES6
					// NOTE: Bluebird's filters will get replaced by Doodad's ones (no way to add Doodad's extensions otherwise)
					var oldCatch = Promise.prototype['catch'];
					Promise.prototype['catch'] = function _catch(/*[optional paramarray]filters, [optional]callback, [optional]thisObj*/) {
						var filters = null;
						var i = 0;
						forEachArgument: for (; i < arguments.length; i++) {
							var filter = arguments[i];
							if (!types.isErrorType(filter) && !types.isJsObject(filter)) {
								if (i > 0) {
									filters = _shared.Natives.arraySlice.call(arguments, 0, i);
								};
								break forEachArgument;
							};
						};
						var callback = arguments[i++];
						var thisObj = arguments[i++];
						if (callback && thisObj) {
							callback = new _shared.PromiseCallback(thisObj, callback);
						};
						var promise;
						if (filters) {
							// Usage: .catch(IOError, NetworkError, {code: 'ENOENTITY'}, ..., function(err){...}, this)
							promise = oldCatch.call(this, function filterCatch(ex) {
								var ok = false;
								forEachType: for (var i = 0; i < filters.length; i++) {
									var type = filters[i];
									if (types.isFunction(type)) { // isErrorType
										if (types._instanceof(ex, type)) {
											ok = true;
											break forEachType;
										};
									} else { // isJsObject
										ok = true;
										var keys = types.keys(type);
										forEachKey: for (var j = 0; j < keys.length; j++) {
											var key = keys[j];
											if (ex[key] !== type[key]) {
												ok = false;
												break forEachKey;
											};
										};
										if (ok) {
											break forEachType;
										};
									};
								};
								if (ok) {
									return callback(ex);
								} else {
									throw ex;
								};
							});
						} else {
							promise = oldCatch.call(this, callback);
						};
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(callback);
						} else {
							promise[_shared.NameSymbol] = this[_shared.NameSymbol];
						};
						return promise;
					};
					
					var oldAsCallback = Promise.prototype.asCallback;
					Promise.prototype.asCallback = Promise.prototype.nodeify = function asCallback(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = new _shared.PromiseCallback(thisObj, callback);
						};
						var promise = oldAsCallback.call(this, callback);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(callback);
						} else {
							promise[_shared.NameSymbol] = this[_shared.NameSymbol];
						};
						return promise;
					};
					
					var oldFinally = Promise.prototype['finally'];
					Promise.prototype['finally'] = function _finally(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = new _shared.PromiseCallback(thisObj, callback);
						};
						var promise = oldFinally.call(this, callback);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(callback);
						} else {
							promise[_shared.NameSymbol] = this[_shared.NameSymbol];
						};
						return promise;
					};

					Promise.prototype.thenCreate = function _thenCreate(callback, /*optional*/thisObj) {
						var Promise = this.constructor;
						return this.then(function(result) {
							return Promise.create(function(resolve, reject) {
								return callback.call(thisObj, result, resolve, reject);
							}, thisObj);
						}, null, thisObj);
					};
				};
				
				types.ADD('setPromise', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 4,
							params: {
								Promise: {
									type: 'Promise',
									optional: false,
									description: "A Promise polyfill.",
								},
							},
							returns: 'Promise',
							description: "Sets a custom polyfill for ES6 Promises.",
					}
					//! END_REPLACE()
					, function setPromise(Promise) {
						if (!types.isFunction(Promise)) {
							return;
						};

						if (Promise === __Internal__.Promise) {
							// Already set
							return;
						};

						if (Promise[__Internal__.symbolIsPromise]) {
							if (Promise[__Internal__.symbolIsPromiseExtended]) {
								__Internal__.Promise = Promise;
							} else {
								throw new types.TypeError("That 'Promise' constructor has been already extended into another constructor. Set that one instead.");
							};
							return;
						};

						// Make some tests...
						if (
								!types.isFunction(Promise) || 
								!types.isFunction(Promise.resolve) || 
								!types.isFunction(Promise.reject) || 
								!types.isFunction(Promise.all) ||
								!types.isFunction(Promise.race) ||
								!types.isFunction(Promise.prototype.then) ||
								!types.isFunction(Promise.prototype['catch'])
						) {
							throw new types.TypeError("Invalid 'Promise' polyfill. It must implement: 'resolve', 'reject', 'all', 'race', 'prototype.then' and 'prototype.catch'.");
						};
						
						var DDPromise = null;
						if (types.isNativeFunction(Promise)) {
							if (types.supportsES6Classes()) {
								// NOTE: That's the only way to inherit ES6 Promise... Using the prototypes way will throw "... is not a promise" !!!
								DDPromise = types.eval("class DDPromise extends ctx.Promise {}", {Promise: Promise});
							} else {
								DDPromise = Promise;
							};
						} else {
							var DDPromise = function() {};
							DDPromise = types.setPrototypeOf(DDPromise, Promise);
							DDPromise.prototype = types.createObject(Promise.prototype, {
								constructor: {value: DDPromise},
							});
						};

						var isStillDDPromise = false;
						try {
							isStillDDPromise = (DDPromise.resolve(0).then(function() {})['catch'](function() {}) instanceof DDPromise);
						} catch(ex) {
						};

						if (!isStillDDPromise) {
							// Inheriting Promise is not supported !!!
							DDPromise = Promise;
						};

						__Internal__.addPromiseBluebirdPolyfills(DDPromise);
						__Internal__.addPromiseDoodadExtensions(DDPromise);

						_shared.setAttribute(DDPromise, __Internal__.symbolIsPromise, true, {});
						_shared.setAttribute(DDPromise, __Internal__.symbolIsPromiseExtended, true, {});

						if (Promise !== DDPromise) {
							_shared.setAttribute(Promise, __Internal__.symbolIsPromise, true, {});
							_shared.setAttribute(Promise, __Internal__.symbolIsPromiseExtended, false, {});
						};

						__Internal__.Promise = DDPromise;
					}));
				
				_shared.PromiseCallback = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 5,
							params: {
								obj: {
									type: 'object,Object',
									optional: true,
									description: "Object to bind with the callback function.",
								},
								fn: {
									type: 'function',
									optional: false,
									description: "Callback function.",
								},
								secret: {
									type: 'any',
									optional: true,
									description: "Secret.",
								},
							},
							returns: 'function',
							description: "Creates a callback handler for DDPromise.",
					}
					//! END_REPLACE()
					, types.setPrototypeOf(function PromiseCallback(/*optional*/obj, fn, /*optional*/secret) {
						// IMPORTANT: No error should popup from a callback, excepted "ScriptAbortedError".
						var attr;
						if (types.isString(fn) || types.isSymbol(fn)) {
							attr = fn;
							fn = obj[attr];
						};
						if (!obj && types.isCallback(fn)) {
							return fn;
						};
						fn = types.unbind(fn);
						root.DD_ASSERT && root.DD_ASSERT(types.isBindable(fn), "Invalid function.");
						var insideFn = _shared.makeInside(obj, fn, secret);
						var isCreatable = doodad.MixIns && types._implements(obj, doodad.MixIns.Creatable);
						var callback = function callbackHandler(/*paramarray*/) {
							var destroyed = isCreatable && obj.isDestroyed();
							if (destroyed) {
								throw new types.NotAvailable("Object has been destroyed.");
							} else {
								try {
									return insideFn.apply(obj, arguments);
								} catch(ex) {
									if (ex.bubble) {
										throw ex;
									} else {
										if (!ex.trapped) {
											ex.trapped = true;
											try {
												var tools = root.Doodad.Tools;
												tools.log(tools.LogLevels.Error, "The Promise '~0~' has been rejected due to an unhandled error.", [(types.get(callback.promise, _shared.NameSymbol) || '<anonymous>')]);
												if (ex.stack) {
													tools.log(tools.LogLevels.Error, ex.stack);
												} else {
													tools.log(tools.LogLevels.Error, ex);
												};
												//tools.log(tools.LogLevels.Debug, fn.toString().slice(0, 500));
											} catch(o) {
											};
										};
										throw ex;
									};
								};
							};
						};
						callback = types.setPrototypeOf(callback, _shared.PromiseCallback);
						callback[_shared.BoundObjectSymbol] = obj;
						callback[_shared.OriginalValueSymbol] = fn;
						callback.promise = null; // will be provided later
						return callback;
					}, types.Callback));
				
					
				//===================================
				// Iterators
				//===================================

				types.ADD('hasIterators', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'bool',
								description: "Returns 'true' if Javascript supports iterators. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, (_shared.Natives.symbolIterator ? function hasIterators(obj) {
						return true;
					} : function hasIterators(obj) {
						return false;
					})));
				
				
				types.ADD('isIterable', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' if object is iterable. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, (_shared.Natives.symbolIterator ? function isIterable(obj) {
						if (types.isNothing(obj)) {
							return false;
						};
						return (typeof obj === 'string') || ((typeof obj === 'object') && (_shared.Natives.symbolIterator in obj));
					} : function isIterable(obj) {
						return false;
					})));
				
				
				// <PRB> As usual, JS doesn't give a way to make sure an object is an iterator
				types.ADD('isIteratorLike', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' if object looks like an iterator. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isIteratorLike(obj) {
						return types.isObjectLike(obj) && types.isFunction(obj.next);
					}));
				
				
				//===================================
				// Generators
				//===================================
				
				// <PRB> "Generator" and "GeneratorFunction" are not in the global space !!!
				// <PRB> "Generator" looks like not having a class !!!
				// <PRB> Enventually, another design mistake... no official way to test if an object is a GeneratorFunction or a Generator !!! (the reason invoked again is "there is no use case")
				
				try {
					_shared.Natives.GeneratorFunction = types.getPrototypeOf(types.eval("function*(){}")).constructor;

					// <PRB> Because the GeneratorFunction constructor is not global, "_shared.getTypeSymbol" needs that Symbol.
					_shared.Natives.GeneratorFunction[_shared.UUIDSymbol] = '' /*! INJECT('+' + TO_SOURCE(UUID('Native_GeneratorFunction')), true) */ ;
				} catch(ex) {
				};

				types.ADD('hasGenerators', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'bool',
								description: "Returns 'true' if the engine supports generators. 'false' otherwise.",
					}
					//! END_REPLACE()
					, (_shared.Natives.GeneratorFunction ? function hasGenerators() {
						return true;
					} : function hasGenerators() {
						return false;
					})));
				
				types.ADD('getGeneratorFunction', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'function',
								description: "Returns the 'GeneratorFunction' constructor.",
					}
					//! END_REPLACE()
					, function getGeneratorFunction() {
						return (_shared.Natives.GeneratorFunction || null);
					}));
				
				types.ADD('isGeneratorFunction', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' if object is a generator function. Returns 'false' otherwise. Note: May not be cross-realm.",
					}
					//! END_REPLACE()
					, (_shared.Natives.functionIsGenerator ? function isGeneratorFunction(obj) {
						return _shared.Natives.functionIsGenerator.call(obj);
					} : (_shared.Natives.GeneratorFunction ? function isGeneratorFunction(obj) {
						return (typeof obj === 'function') && types._instanceof(obj, _shared.Natives.GeneratorFunction);
					} : function isGeneratorFunction(obj) {
						return false;
					}))));
				
				types.ADD('isGenerator', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' if object is a generator iterator. Returns 'false' otherwise. Note: Not cross-realm.",
					}
					//! END_REPLACE()
					, (_shared.Natives.GeneratorFunction ? function isGenerator(obj) {
						if (types.isNothing(obj)) {
							return false;
						};
						if (typeof obj !== 'object') {
							return false;
						};
						var proto = types.getPrototypeOf(obj);
						if (proto) {
							proto = types.getPrototypeOf(proto);
						};
						if (!proto || !proto.constructor) {
							return false;
						};
						return (proto.constructor.constructor === _shared.Natives.GeneratorFunction);
					} : function isGenerator(obj) {
						return false;
					})));
				
				//===================================
				// Buffers
				//===================================

				types.ADD('isArrayBuffer', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' if object is an array buffer. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, (_shared.Natives.arrayBuffer ? (function isArrayBuffer(obj) {
						return (typeof obj === 'object') && types._instanceof(obj, _shared.Natives.arrayBuffer);
					}) : (function isArrayBuffer(obj) {
						// ArrayBuffer is not implemented.
						return false;
					}))));
				
				//===================================
				// Typed Arrays
				//===================================
				
				if (global.Int8Array) {
					try {
						_shared.Natives.windowTypedArray = types.getPrototypeOf(global.Int8Array.prototype).constructor;
						
						if (_shared.Natives.windowTypedArray === global.Object) {
							// <PRB> NodeJs has no TypedArray constructor.
							delete _shared.Natives.windowTypedArray;
							__Internal__.TypedArrays = [global.Int8Array, global.Uint8Array, global.Uint8ClampedArray, global.Int16Array, 
													global.Uint16Array, global.Int32Array, global.Uint32Array, global.Float32Array, 
													global.Float64Array];
						} else {
							// <PRB> Because the TypedArray constructor is not global, "_shared.getTypeSymbol" needs that Symbol.
							_shared.Natives.windowTypedArray[_shared.UUIDSymbol] = '' /*! INJECT('+' + TO_SOURCE(UUID('Native_TypedArray')), true) */ ;
						};
					} catch(ex) {
					};
				};
					
				types.ADD('isTypedArray', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' if object is a typed array (an array buffer view). Returns 'false' otherwise. Note: May not be cross-realm.",
					}
					//! END_REPLACE()
					, (_shared.Natives.windowTypedArray ? (function isTypedArray(obj) {
						return types._instanceof(obj, _shared.Natives.windowTypedArray);
						
					}) : (__Internal__.TypedArrays ? (function isTypedArray(obj) {
						// <PRB> NodeJs has no TypedArray constructor.
						for (var i = 0; i < __Internal__.TypedArrays.length; i++) {
							var type = __Internal__.TypedArrays[i];
							if (type && types._instanceof(obj, type)) {
								return true;
							};
						};
						return false;
						
					}) : (function isTypedArray(obj) {
						// Typed arrays are not implemented.
						return false;
						
					})))));

				//===================================
				// Bind/Unbind
				//===================================

				_shared.BoundObjectSymbol = types.getSymbol('__BOUND_OBJECT__');
				
				// Test for my dream to realize !
				__Internal__.arrowIsBindable = false;
				try {
					__Internal__.arrowIsBindable = (types.eval("() => this.doodad").bind({doodad: 1})() === 1);
				} catch(ex) {
				};
				
				types.ADD('isBindable', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object to test for.",
									},
								},
								returns: 'bool',
								description: "Returns 'true' if object is a bindable function, 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isBindable(obj) {
						// NOTE: Native functions may or may not be bindable and there is no way to know it !!!
						return types.isCustomFunction(obj) && !types.has(obj, _shared.BoundObjectSymbol) && (__Internal__.arrowIsBindable || !types.isArrowFunction(obj));
					}));
				
				types.ADD('bind', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									fn: {
										type: 'function',
										optional: false,
										description: "A function.",
									},
									args: {
										type: 'arrayof(any)',
										optional: true,
										description: "Function arguments.",
									},
								},
								returns: 'object',
								description: "Binds a function to an object (so that 'this' will always be that object) and returns the resulting function. Owned properties are also preserved. Ruturns 'null' when function can't be bound.",
					}
					//! END_REPLACE()
					, function bind(obj, fn, /*optional*/args) {
						fn = types.unbind(fn);
						if (!types.isBindable(fn)) {
							return null;
						};
						var newFn;
						if (_shared.Natives.functionBind) {
							if (args) {
								newFn = _shared.Natives.functionBind.apply(fn, types.append([obj], args));
							} else {
								newFn = _shared.Natives.functionBind.call(fn, obj);
							};
						} else {
							if (args) {
								newFn = function(/*paramarray*/) {
									if (arguments.length > 0) {
										return fn.apply(obj, types.append([], args, arguments));
									} else {
										return fn.apply(obj, args);
									};
								};
							} else {
								newFn = function(/*paramarray*/) {
									return fn.apply(obj, arguments);
								};
							};
						};
						types.extend(newFn, fn);
						newFn[_shared.BoundObjectSymbol] = obj;
						newFn[_shared.OriginalValueSymbol] = fn;
						return newFn;
					}));
				
				types.ADD('unbind', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 5,
								params: {
									fn: {
										type: 'function',
										optional: false,
										description: "A function.",
									},
								},
								returns: 'object',
								description: "Unbinds a function and returns the resulting function. Owned properties are also updated. Returns 'null' when function can't be unbound.",
					}
					//! END_REPLACE()
					, function unbind(fn) {
						if (!types.isFunction(fn)) {
							return null;
						};
						if (types.has(fn, _shared.BoundObjectSymbol)) {
							var oldFn = types.get(fn, _shared.OriginalValueSymbol);
							if (!types.isBindable(oldFn)) {
								return null;
							};
							var keys = types.append(types.keys(fn), types.symbols(fn));
							for (var i = 0; i < keys.length; i++) {
								var key = keys[i];
								if ((key !== _shared.BoundObjectSymbol) && (key !== _shared.OriginalValueSymbol)) {
									if (types.has(oldFn, key)) {
										oldFn[key] = fn[key];
									};
								};
							};
							return oldFn;
						} else {
							return fn;
						};
					}));

				//=========================
				// Set / Map
				//=========================
					
				//=========================
				// Iterator
				//=========================
					
				types.ADD('Iterator', types.Type.$inherit(
					{
						$TYPE_NAME: 'Iterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Iterator')), true) */,
					},
					{
						_new: types.SUPER(function _new() {
							this._super();

							// <PRB> "Symbol.iterator" must be there for "[...iter]" and "for...of" even when we return the iterator itself.
							if (_shared.Natives.symbolIterator) {
								var self = this;
								_shared.setAttribute(this, _shared.Natives.symbolIterator, function() {
									return self;
								}, {});
							};
						}),

						close: null, // function()
						
						next: function next() {
							return {
								done: true,
							};
						},
					}));
					
				//=========================
				// Set / Map
				//=========================
					
				__Internal__.SetIterator = (!_shared.Natives.windowSet && types.INIT(types.Iterator.$inherit(
					{
						$TYPE_NAME: 'SetIterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('SetIterator')), true) */,
					},
					{
						__index: 0,
						__ar: types.READ_ONLY( null ),
						
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
							var ar = this.__ar;
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
							var ar = this.__ar;
							if (this.__index < ar.length) {
								var val = ar[this.__index++];
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
						__ar: types.CONFIGURABLE(types.READ_ONLY( null )),

						_new: types.SUPER(function _new(/*optional*/ar) {
							this._super();
							
							var ar;
							if (types.isNothing(ar)) {
								ar = [];
							} else if (types._instanceof(ar, types.Set)) {
								ar = types.clone(ar.__ar);
							} else if (types._instanceof(ar, types.Map)) {
								var mapAr = ar.__keys,
									mapVals = ar.__values,
									len = mapAr.length,
									ar = _shared.Natives.arrayConstructor(len);
								for (var i = 0; i < len; i++) {
									ar[i] = [mapAr[i], mapVals[i]];
								};
							} else if (types.isArrayLike(ar)) {
								ar = types.unique(ar);
							} else {
								throw types.TypeError("Invalid array.");
							};

							_shared.setAttribute(this, '__ar', ar);
							_shared.setAttribute(this, 'size', this.__ar.length);
						}),
						has: function has(value) {
							for (var i = 0; i < this.__ar.length; i++) {
								if (this.__ar[i] === value) {
									return true;
								};
							};
							return false;
						},
						add: function add(value) {
							if (!this.has(value)) {
								var ar = this.__ar;
								ar.push(value);
								_shared.setAttribute(this, 'size', ar.length);
							};
							return this;
						},
						'delete': function _delete(value) {
							var ar = this.__ar;
							for (var i = 0; i < ar.length; i++) {
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
							this.size = 0;
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
							var ar = this.__ar;
							for (var i = 0; i < ar.length; i++) {
								var value = ar[i];
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

				__Internal__.MapIterator = (!_shared.Natives.windowMap && types.INIT(types.Iterator.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'MapIterator',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('MapIterator')), true) */,
					},
					/*instanceProto*/
					{
						__index: 0,
						__keys: types.READ_ONLY( null ),
						__values: types.READ_ONLY( null ),
						
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
							var ar = this.__keys;
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
							var ar = this.__values;
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
							var ar = this.__keys,
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
						__keys: types.CONFIGURABLE(types.READ_ONLY( null )),
						__values: types.CONFIGURABLE(types.READ_ONLY( null )),

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

							var keys = _shared.setAttribute(this, '__keys', []);
							var vals = _shared.setAttribute(this, '__values', []);
							
							if (ar) {
								var len = ar.length;
								for (var i = 0; i < len; i++) {
									var item = ar[i];
									keys.push(item[0]);
									vals.push(item[1]);
								};
								_shared.setAttribute(this, 'size', len);
							};
						}),
						has: function has(key) {
							var keys = this.__keys,
								len = keys.length;
							for (var i = 0; i < len; i++) {
								if (keys[i] === key) {
									return true;
								};
							};
							return false;
						},
						get: function get(key) {
							var keys = this.__keys,
								len = keys.length;
							for (var i = 0; i < len; i++) {
								if (keys[i] === key) {
									return this.__values[i];
								};
							};
						},
						set: function set(key, value) {
							var found = false,
								keys = this.__keys,
								len = keys.length;
							for (var i = 0; i < len; i++) {
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
						'delete': function _delete(key) {
							var keys = this.__keys,
								len = keys.length;
							for (var i = 0; i < len; i++) {
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
							var keys = this.__keys,
								values = this.__values,
								len = keys.length;
							for (var i = 0; i < len; i++) {
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

				//===================================
				// HTTP Status Codes
				// TODO: Move elsewhere
				//===================================
				
				types.ADD('HttpStatus', types.freezeObject(types.nullObject({
					// Information
					Continue: 100,
					SwitchingProtocol: 101,
					
					// Success
					OK: 200,
					Created: 201,
					Accepted: 202,
					NonAuthoritativeInformation: 203,
					NoContent: 204,
					ResetContent: 205,
					PartialContent: 206,
					
					// Redirect
					MultipleChoices: 300,
					MovedPermanently: 301,
					Found: 302,
					SeeOther : 303,
					NotModified: 304,
					UseProxy: 305,
					TemporaryRedirect: 307,
					
					// Client errors
					BadRequest: 400,
					Unauthorized: 401,
					Forbidden: 403,
					NotFound: 404,
					MethodNotAllowed: 405,
					NotAcceptable: 406,
					ProxyAuthenticationRequired: 407,
					RequestTimeout: 408,
					Conflict: 409,
					Gone: 410,
					LengthRequired: 411,
					PreconditionFailed: 412,
					EntityTooLarge: 413,
					UrlTooLong: 414,
					UnsupportedMediaType: 415,
					RangeNotSatisfiable: 416,
					ExpectationFailed: 417,

					// Server errors
					InternalError: 500,
					NotImplemented: 501,
					BadGateway: 502,
					ServiceUnavailable: 503,
					GatewayTimeout: 504,
					VersionNotSupported: 505,

					// Utilities
					isInformative: function isInformative(status) {
						return (status >= 100) && (status < 200);
					},
					
					isSuccessful: function isSuccessful(status) {
						return (status >= 200) && (status < 300);
					},
					
					isRedirect: function isRedirect(status) {
						return (status >= 300) && (status < 400);
					},
					
					isClientError: function isClientError(status) {
						return (status >= 400) && (status < 500);
					},
					
					isServerError: function isServerError(status) {
						return (status >= 500);
					},
					
					isError: function isError(status) {
						return (status >= 400);
					},
				})));
				

				//===================================
				// Init
				//===================================
				return function init(/*optional*/options) {
					if (_shared.Natives.windowPromise) {
						try {
							types.setPromise(_shared.Natives.windowPromise);
						} catch(ex) {
						};
					};
				};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()