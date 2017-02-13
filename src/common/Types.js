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
					
					// "clone", "toArray"
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
								revision: 1,
								params: {
									obj: {
										type: 'arraylike',
										optional: false,
										description: "Target array.",
									},
									paramarray: {
										type: 'arrayof(arraylike)',
										optional: true,
										description: "An array.",
									},
								},
								returns: 'array',
								description: "Prepends the items of each array to the first argument than returns that array.",
					}
					//! END_REPLACE()
					, function prepend(obj /*paramarray*/) {
						if (!types.isArrayLike(obj)) {
							return null;
						};
						var len = arguments.length;
						for (var i = 1; i < len; i++) {
							var arg = arguments[i];
							if (!types.isNothing(arg)) {
								_shared.Natives.arrayUnshift.apply(obj, arg);
							};
						};
						return obj;
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
							var val = obj;
							if (types.isFunction(obj.valueOf)) {
								try {
									val = obj.valueOf();
								} catch(o) {
								};
							};
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
				//return function init(/*optional*/options) {
				//};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()