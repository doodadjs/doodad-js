//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Types.js - Types management
// Project home: https://sourceforge.net/projects/doodad-js/
// Trunk: svn checkout svn://svn.code.sf.net/p/doodad-js/code/trunk doodad-js-code
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

(function() {
	var global = this;

	var exports = {};
	
	//! BEGIN_REMOVE()
	if ((typeof process === 'object') && (typeof module === 'object')) {
	//! END_REMOVE()
		//! IF_DEF("serverSide")
			module.exports = exports;
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
	
	exports.add = function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Types'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE() */,
			bootstrap: true,
			
			proto: function(root) {
				var types = root.Doodad.Types;
				return {
					setOptions: types.SUPER(function setOptions(/*paramarray*/) {
						options = this._super.apply(this, arguments);
						options.toSourceItemsCount = types.toInteger(options.toSourceItemsCount);
						options.enableProxies = types.toBoolean(options.enableProxies);
						return options;
					}),
				};
			},
			
			create: function create(root, /*optional*/_options) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				var doodad = root.Doodad,
					types = doodad.Types;
				
				//===================================
				// Internal
				//===================================
				
				var __Internal__ = {
					// "toSource"
					supportsVerticalTabEscape: ('\v' !== 'v'),
					supportsNullCharEscape: ('\0' !== '0'),
					
					symbolOriginalValue: (types.getSymbolFor('__ORIGINAL_VALUE__') || '__ORIGINAL_VALUE__'),
					
					symbolName: (types.getSymbolFor('__NAME__') || '__NAME__'),
				};

				//===================================
				// Native functions
				//===================================
					
				// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.
				// NOTE: Store everything because third-parties can override them.
				
				__Internal__.arrayObj = global.Array && global.Array.prototype || []; // temporary
				
				var __Natives__ = {
					// No polyfills
					
					// "toArray"
					arrayConstructor: __Internal__.arrayObj.constructor,
					
					// "clone", "toArray"
					arraySlice: __Internal__.arrayObj.slice,
					//functionToString: Function.prototype.toString,
					
					// "popAt", "popItem", "popItems"
					arraySplice: __Internal__.arrayObj.splice,
					
					// "prepend"
					arrayUnshift: __Internal__.arrayObj.unshift,
					
					// "trapUnhandledRejections"
					mathAbs: global.Math.abs,

					objectToString: global.Object.prototype.toString,

					windowObject: global.Object,
					
					// "toString"
					windowString: global.String,

					// "hasIterators", "isIterable"
					windowSymbolIterator: undefined,
					
					// "hasGenerators", "getGeneratorFunction", "isGeneratorFunction", "isGenerator"
					GeneratorFunction: undefined,
					
					// "isGeneratorFunction" Firefox (why "isGenerator" is in the prototype ???)
					functionIsGenerator: (global.Function && global.Function.prototype && types.isNativeFunction(global.Function.prototype.isGenerator) ? global.Function.prototype.isGenerator : undefined),

					// "toSource"
					stringCharCodeAt: global.String.prototype.charCodeAt,
					
					// "isObjectLikeAndNotEmpty", "hasIndex"
					windowNumber: global.Number,

					
					// Polyfills
					
					// "bind"
					functionBind: (types.isNativeFunction(Function.prototype.bind) ? Function.prototype.bind : undefined),
					
					// ES6
					windowPromise: (types.isNativeFunction(global.Promise) ? global.Promise : undefined),
					windowSet: (types.isNativeFunction(global.Set) && types.isNativeFunction(global.Set.prototype.values) && types.isNativeFunction(global.Set.prototype.keys) ? global.Set : undefined),
					windowMap: (types.isNativeFunction(global.Map) && types.isNativeFunction(global.Map.prototype.values) && types.isNativeFunction(global.Map.prototype.keys) ? global.Map : undefined),
					windowProxy: (types.isNativeFunction(global.Proxy) ? global.Proxy : undefined),

					// "toArray"
					arrayFrom: ((global.Array && types.isNativeFunction(Array.from)) ? global.Array.from : undefined),
					
					// "isArrayBuffer"
					windowArrayBuffer: (types.isNativeFunction(global.ArrayBuffer) ? global.ArrayBuffer : undefined),
				};
				
				delete __Internal__.arrayObj;   // free memory

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
				
				types.Undefined = function Undefined() {};
				types.Undefined.prototype.valueOf = __Internal__.returnUndefined;
				types.Undefined.prototype.toString = __Internal__.returnUndefinedString;
				types.Undefined.prototype.toSource = __Internal__.returnUndefinedString;

				types.Null = function Null() {};
				types.Null.prototype.valueOf = __Internal__.returnNull;
				types.Null.prototype.toString = __Internal__.returnNullString;
				types.Null.prototype.toSource = __Internal__.returnNullString;
				
				types.toObject = root.DD_DOC(
					//! REPLACE_BY("null")
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
							return __Natives__.windowObject(val);
						};
					});
				
				types.toArray = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "A value to convert.",
									},
								},
								returns: 'array',
								description: "Converts a value to an array.",
					}
					//! END_REPLACE()
					, (__Natives__.arrayFrom || function toArray(obj, /*optional*/mapFn, /*optional*/thisObj) {
						if (types.isNothing(obj)) {
							throw new types.TypeError("can't convert " + ((obj === null) ? 'null' : 'undefined') + " to object");
						};
						obj = Object(obj);
						var result,
							fill = false;
						if (types.isString(obj)) {
							result = __Natives__.arraySlice.call(obj);
						} else if (types.isArrayLike(obj)) {
							if (obj.length === 1) {
								// <PRB> With only one integer argument to the constructor, an Array of X empty slots is created
								result = [obj[0]];
							} else {
								result = __Natives__.arrayConstructor.apply(null, obj);
							};
						} else {
							result = __Natives__.arrayConstructor.call(null, obj.length >>> 0);
							fill = true;
						};
						var len = result.length;
						if (mapFn) {
							for (var key = 0; key < len; key++) {
								result[key] = mapFn.call(thisObj, result[key], key);
							};
						} else if (fill) {
							for (var key = 0; key < len; key++) {
								result[key] = undefined;
							};
						};
						return result;
					}));
				
				//===================================
				// Options
				//===================================
					
				types.setOptions({
					toSourceItemsCount: 255,		// Max number of items
					enableProxies: false,			// <FUTURE> Enables or disables ECMA 6 Proxies
					trapUnhandledRejections: true,    // "true" will trap unhandled promise rejections, "false" will not
					unhandledRejectionsTimeout: 1000,
					unhandledRejectionsMaxSize: 20,
				}, _options);

				//===================================
				// Public Symbols
				//===================================
				
				if (types.hasDefinePropertyEnabled()) {
					types.defineProperties(types, {
						OriginalValueSymbol: {configurable: false, enumerable: false, value: __Internal__.symbolOriginalValue, writable: false},
						
						NameSymbol: {configurable: false, enumerable: false, value: __Internal__.symbolName, writable: false},
					});
				} else {
					types.OriginalValueSymbol = __Internal__.symbolOriginalValue;
					
					types.NameSymbol = __Internal__.symbolName;
				};

				//===================================
				// is*
				//===================================

				types.isArrayAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				types.isArrayLikeAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return true;
								};
							};
						};
						return false;
					});
				
				types.isNothingOrEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return false;
								};
							};
							return true;
						} else if (types.isObjectLike(obj)) {
							obj = __Natives__.windowObject(obj);
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
					});
				
				types.isEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									return false;
								};
							};
							return true;
						} else if (types.isObjectLike(obj)) {
							obj = __Natives__.windowObject(obj);
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
					});
				
				types.isStringAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				types.isStringAndNotEmptyTrim = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				types.isObjectAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				types.isObjectLikeAndNotEmpty = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (var key in obj) {
									var number = __Natives__.windowNumber(key);
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
					});

				//=======================================================
				// Objects
				//=======================================================
					
				types.gets = root.DD_DOC(
					//! REPLACE_BY("null")
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
						obj = __Natives__.windowObject(obj);
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
					});
				
				types.set = root.DD_DOC(
					//! REPLACE_BY("null")
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
						obj = __Natives__.windowObject(obj);
						var hasKey = (inherited ? types.hasInherited : types.has);
						if (hasKey(obj, key)) {
							obj[key] = value;
							return value;
						};
					});
				
				types.sets = root.DD_DOC(
					//! REPLACE_BY("null")
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
						obj = __Natives__.windowObject(obj);
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
					});
				
				types.getsDefault = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns an object with the value of each named own property. When an own property doesn't exist, creates that own property using the value from the '_defaults' parameter.",
					}
					//! END_REPLACE()
					, function getsDefault(obj, keys, /*optional*/_defaults, /*optional*/inherited) {
						if (types.isNothing(keys)) {
							keys = [];
						};
						var result = {};
						obj = __Natives__.windowObject(obj);
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
									obj[key] = val;
								};
								result[key] = val;
							};
						};
						return result;
					});
				
				types.keysInherited = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 2,
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
						obj = __Natives__.windowObject(obj);
						return types.unique(types.keys(obj), types.keysInherited(types.getPrototypeOf(obj)));
					});
				
				types.symbolsInherited = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
						obj = __Natives__.windowObject(obj);
						return types.unique(types.symbols(obj), types.symbolsInherited(types.getPrototypeOf(obj)));
					});
				
				types.allKeysInherited = root.DD_DOC(
					//! REPLACE_BY("null")
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
								returns: 'arrayof(string)',
								description: "Returns an array of all inherited enumerable and not enumerable property names of an object.",
					}
					//! END_REPLACE()
					, function allKeysInherited(obj) {
						if (types.isNothing(obj)) {
							return [];
						};
						obj = __Natives__.windowObject(obj);
						return types.unique(types.allKeys(obj), types.allKeysInherited(types.getPrototypeOf(obj)));
					});
				
				types.allSymbolsInherited = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "An object.",
									},
								},
								returns: 'arrayof(symbol)',
								description: "Returns an array of all inherited enumerable and not enumerable symbols of an object.",
					}
					//! END_REPLACE()
					, function allSymbolsInherited(obj) {
						if (types.isNothing(obj)) {
							return [];
						};
						obj = __Natives__.windowObject(obj);
						return types.unique(types.allSymbols(obj), types.allSymbolsInherited(types.getPrototypeOf(obj)));
					});
				
				types.depthComplete = root.DD_DOC(
					//! REPLACE_BY("null")
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
								result = __Natives__.windowObject(obj);
								var len = arguments.length;
								for (var i = 2; i < len; i++) {
									obj = arguments[i];
									if (types.isNothing(obj)) {
										continue;
									};
									// Part of "Object.assign" Polyfill from Mozilla Developer Network.
									obj = __Natives__.windowObject(obj);
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
					});
				
				types.fill = root.DD_DOC(
					//! REPLACE_BY("null")
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
							result = __Natives__.windowObject(obj);
							var argumentsLen = arguments.length,
								keysLen = keys.length;
							for (var i = 1; i < argumentsLen; i++) {
								obj = arguments[i];
								if (!types.isNothing(obj)) {
									obj = __Natives__.windowObject(obj);
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
					});
				
				types.isClonable = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
						// NOTE: This function will get replaced when "Doodad.js" is loaded.
						return !types.isString(obj) && (types.isArrayLike(obj) || types.isObject(obj) || (!!cloneFunctions && types.isCustomFunction(val)));
					});
				
				types.clone = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 3,
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
									cloneFunctions: {
										type: 'bool,integer',
										optional: true,
										description: "When 'true', the function will clone custom functions. When an integer, it will specify the depth where custom functions are cloned. Default is 'false'.",
									},
								},
								returns: 'any',
								description: "Clones a value.",
					}
					//! END_REPLACE()
					, function clone(obj, /*optional*/depth, /*optional*/cloneFunctions) {
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
									obj = __Natives__.windowObject(obj);
									if (depth >= 0) {
										result = Array(obj.length);
										var len = obj.length;
										for (var key = 0; key < len; key++) {
											if (key in obj) {
												result[key] = types.clone(obj[key], depth, cloneFunctions);
											};
										};
									} else {
										result = __Natives__.arraySlice.call(obj, 0);
									};
								} else if (types.isCustomFunction(obj)) {
									if (cloneFunctions >= 0) {
										//result = types.eval(__Natives__.functionToString.call(obj));
										result = types.eval(obj.toString());
									} else {
										return obj;
									};
								} else if (obj instanceof types.Map) {
									result = new types.Map(obj);
								} else if (obj instanceof types.Set) {
									result = new types.Set(obj);
								} else {  // if (types.isObject(obj))
									result = types.createObject(types.getPrototypeOf(obj));
								};
							} else {
								return obj;
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
									var tmp = __Natives__.windowNumber(key);
									if (!types.isNaN(tmp) && !types.isInfinite(tmp)) {
										continue;
									};
								};
								var prop = types.getOwnPropertyDescriptor(obj, key);
								if (types.has(prop, 'value') && (depth >= 0)) {
									prop.value = types.clone(prop.value, depth, cloneFunctions);
								};
								props[key] = prop;
							};
							types.defineProperties(result, props);
						};
						
						return result;
					});
				

				//========================================
				// Arrays
				//========================================
				
				types.hasIndex = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
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
										number = __Natives__.windowNumber(index);
									if (types.isNaN(number) || !types.isFinite(number) || !(index in obj)) {
										return false;
									};
								};
							};
							return true;
						} else {
							return false;
						};
					});
				
				types.indexes = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									result.push(key);
								};
							};
						};
						return result;
					});
				
				types.values = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							obj = __Natives__.windowObject(obj);
							var result = [];
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										result.push(obj[key]);
									};
								};
							} else {
								var keys = types.keys(obj),
									len = keys.length; // performance
								for (var i = 0; i < len; i++) {
									result.push(obj[keys[i]]);
								};
							};
							return result;
						};
					});
				
				types.items = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
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
							obj = __Natives__.windowObject(obj);
							var result = [];
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										result.push([key, obj[key]]);
									};
								};
							} else {
								var keys = types.keys(obj),
									len = keys.length; // performance
								for (var i = 0; i < len; i++) {
									var key = keys[i];
									result.push([key, obj[key]]);
								};
							};
							return result;
						};
					});
				
				types.available = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (!(key in obj)) {
									return key;
								};
							};
						};
						return -1;
					});
				
				types.availables =  root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							var len = obj.length;
							for (var key = 0; key < len; key++) {
								if (!(key in obj)) {
									keys.push(key);
								};
							};
						};
						return keys;
					});
				
				types.getFirstIndex =  root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				types.getFirstValue = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				types.popAt = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							if (types.isArray(obj)) {
								if (key in obj) {
									var item = obj[key];
									__Natives__.arraySplice.call(obj, key, 1);
									return item;
								};
							};
							if (types.has(obj, key)) {
								var item = obj[key];
								delete obj[key];
								return item;
							};
						};
					});
				
				types.popItem = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 1,
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
							obj = __Natives__.windowObject(obj);
							if (!includeFunctions && types.isFunction(item)) {
								if (types.isArray(obj)) {
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var val = obj[key];
											if (item.call(thisObj, val, key, obj)) {
												__Natives__.arraySplice.call(obj, key, 1);
												return val;
											};
										};
									};
								};
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
							} else {
								if (types.isArray(obj)) {
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var val = obj[key];
											if (val === item) {
												__Natives__.arraySplice.call(obj, key, 1);
												return val;
											};
										};
									};
								};
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
					});
				
				types.popItems = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 1,
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
									includeFunctions: {
										type: 'bool',
										optional: true,
										description: "When 'true' and 'items' is a function, considers that function as a value. Default is 'false'",
									},
								},
								returns: 'arrayof(any)',
								description: "Search all occurrence of the specified values among owned properties of an object, than deletes them and returns these values in an array. If object is an array, splices at the indexes of each occurrences.",
					}
					//! END_REPLACE()
					, function popItems(obj, items, /*optional*/thisObj, /*optional*/includeFunctions) {
						var result = [];
						if (!types.isNothing(obj)) {
							obj = __Natives__.windowObject(obj);
								
							if (!includeFunctions && types.isFunction(items)) {
								if (types.isArray(obj)) {
									for (var key = obj.length - 1; key >= 0; key--) {
										if (key in obj) {
											var val = obj[key];
											if (items.call(thisObj, val, key, obj)) {
												__Natives__.arraySplice.call(obj, key, 1);
												result.push(val);
											};
										};
									};
								};
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
							} else {
								var values = types.values(items),
									valuesLen = values.length;
								if (types.isArray(obj)) {
									for (var key = obj.length - 1; key >= 0; key--) {
										if (key in obj) {
											var val = obj[key];
											for (var j = 0; j < valuesLen; j++) {
												if (values[j] === val) {
													__Natives__.arraySplice.call(obj, key, 1);
													result.push(val);
												};
											};
										};
									};
								};
								var keys = types.keys(obj),
									len = keys.length; // performance
								for (var i = 0; i < len; i++) {
									var key = keys[i];
									var val = obj[key];
									for (var j = 0; j < valuesLen; j++) {
										if (values[j] === val) {
											delete obj[key];
											result.push(val);
										};
									};
								};
							};
						};
						return result;
					});
				
				types.prepend = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
							__Natives__.arrayUnshift.apply(result, obj);
						};
						
						return result;
					});
				
				
				types.unique = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								comparer: {
									type: 'function',
									optional: true,
									description: 
										"A comparer function. Arguments passed to the function are : \n" +
										"  value1 (any): The value to compare from\n" +
										"  value2 (any): The value to compare to\n" +
										"Must return boolean 'true' or integer '0' when values are equals, integer '1' when 'value1' is greater than 'value2', or integer '-1' when 'value1' is lower than 'value2'.",
								},
								paramarray: {
									type: 'arraylike',
									optional: true,
									description: "Arrays.",
								},
							},
							returns: 'arrayof(any)',
							description: "Compare every items of every arrays, and returns a new array with unique items.",
					}
					//! END_REPLACE()
					, function unique(/*optional*/comparer, /*paramarray*/obj) {
						var start = 1;
						var comparerFn = comparer;
						if (!types.isFunction(comparerFn)) {
							comparerFn = null;
							start = 0;
						};
						
						var result = [];
						
						if (comparerFn) {
							var len = arguments.length;
							for (var i = start; i < len; i++) {
								obj = arguments[i];
								if (types.isNothing(obj)) {
									continue;
								};
								obj = Object(obj);
								root.DD_ASSERT && root.DD_ASSERT(types.isArrayLike(obj), "Invalid array.");
								var objLen = obj.length;
								for (var key1 = 0; key1 < objLen; key1++) {
									if (key1 in obj) {
										var value1 = obj[key1],
											found = false,
											resultLen = result.length;
										for (var key2 = 0; key2 < resultLen; key2++) {
											var res = comparerFn(value1, result[key2]);
											if ((res === true) || (res === 0)) {
												found = true;
												break;
											};
										};
										if (!found) {
											result.push(value1);
										};
									};
								};
							};
						} else {
							var len = arguments.length;
							for (var i = start; i < len; i++) {
								obj = arguments[i];
								if (types.isNothing(obj)) {
									continue;
								};
								obj = Object(obj);
								root.DD_ASSERT && root.DD_ASSERT(types.isArrayLike(obj), "Invalid array.");
								var objLen = obj.length;
								for (var key1 = 0; key1 < objLen; key1++) {
									if (key1 in obj) {
										var value1 = obj[key1],
											found = false,
											resultLen = result.length;
										for (var key2 = 0; key2 < resultLen; key2++) {
											if (value1 === result[key2]) {
												found = true;
												break;
											};
										};
										if (!found) {
											result.push(value1);
										};
									};
								};
							};
						};
						
						return result;
					});
			
				//===================================
				// "toSource" function
				//===================================
				
				types.toSource = root.DD_DOC(
					//! REPLACE_BY("null")
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
							obj = __Natives__.windowObject(obj);
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
										//var code = (allowCodePoint ? unicode.codePointAt(val, i, true) : [__Natives__.stringCharCodeAt.call(val, i), 1]);
										//var size = code[1];
										//code = code[0];
										var code = __Natives__.stringCharCodeAt.call(val, i);
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
									return (types.symbolIsGlobal(obj) ? "Symbol.for(" + types.toSource(types.getSymbolKey(obj), null, options) + ")" : "Symbol()");
								} else if (types.isError(obj)) {
									return '(new Error(' + types.toSource(obj.message || obj.description, null, options) + '))';
								} else if (types.isFunction(obj)) {
									if ((depth >= 0) && types.isCustomFunction(obj)) {
										return obj.toString();
									} else {
										return '(new Function())';
									};
								} else if (types.isArray(obj)) {
									if (depth < 0) {
										return '(new Array(' + obj.length + '))';
									};
									var str = '',
										len = val.length,
										continued = '';
									depth--;
									var max = types.getOptions().toSourceItemsCount;
									if (len > max) {
										len = max;
										continued = ', ...';
									};
									for (var key = 0; key < len; key++) {
										if (key in val) {
											str += types.toSource(val[key], depth, options) + ', ';
										} else {
											str += ', ';
										};
									};
									return '[' + str.slice(0, -2) + continued + ']';
								} else if (types.isObject(obj)) {
									if (depth < 0) {
										return '{}';
									};
									var str = '',
										len = 0,
										maxLen = types.getOptions().toSourceItemsCount;
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
											str += types.toSource(key) + ': ' + types.toSource(obj[key], depth, options) + ', ';
											len++;
										};
									} while (inherited && (obj = types.getPrototypeOf(obj)));
									return '{' + str.slice(0, -2) + '}';
								} else if (types.isObjectLike(obj)) {
									return types.toSource(__Natives__.objectToString.call(obj));
								} else {
									return obj.toString();
								};
							};
						};
					});
				
				//===================================
				// Callback base type
				//===================================
				
				types.Callback = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				// NOTE: Will be replaced by "Doodad.js"
				types.makeInside = function(/*optional*/obj, fn) {
					return (types.isNothing(obj) ? fn : types.bind(obj, fn));
				};
				
				
				//===================================
				// ES6 Promise
				//===================================

				__Internal__.Promise = null;
				
				types.isPromise = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
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
						if (!__Internal__.Promise) {
							return false;
						};
						return (obj instanceof __Internal__.Promise);
					});
				
				types.getPromise = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
					
				types.setPromise = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 2,
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
						// Make some tests...
						if (
								!types.isFunction(Promise) || 
								!types.isFunction(Promise.resolve) || 
								!types.isFunction(Promise.reject) || 
								!types.isFunction(Promise.all) ||
								!types.isFunction(Promise.prototype.then) ||
								!types.isFunction(Promise.prototype['catch'])
						) {
							throw new types.TypeError("Invalid 'Promise' polyfill. It must implement: 'resolve', 'reject', 'all', 'prototype.then' and 'prototype.catch'.");
						};

						
						// <PRB> Doing ".then(fn).catch(fn)" or ".then(fn, fn)" is very annoying.
						// Bluebird "asCallback" polyfill
						if (!types.isFunction(Promise.prototype.asCallback) && !types.isFunction(Promise.prototype.nodeify)) {
							Promise.prototype.nodeify = Promise.prototype.asCallback = function asCallback(callback) {
								var promise = this.then(function(result) {
										var retval = callback(null, result);
										if (retval === undefined) {
											retval = result;
										//} else if (types.isError(retval)) {
										//	throw retval;
										};
										return retval;
									}, function(err) {
										var retval = callback(err);
										if (retval === undefined) {
											throw err;
										//} else if (types.isError(retval)) {
										//	throw retval;
										};
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
						
						
/*
						// <PRB> Promise has no id
						
						var getPromiseName = function(callback) {
							var original;
							while (original = types.get(callback, __Internal__.symbolOriginalValue)) {
								callback = original;
							};
							return types.get(callback, types.NameSymbol) || types.getFunctionName(callback);
						};
						
							//var newPromise = function _Promise(callback) {
							//	var promise = Promise.call(this, callback) || this;
							//	promise.name = getPromiseName(callback);
							//	return promise;
							//};
							//types.setPrototypeOf(newPromise.prototype, Promise.prototype);
							//newPromise = types.setPrototypeOf(newPromise, Promise);
						var oldThen = Promise.prototype.then;
						Promise.prototype.then = function(callback) {
							var promise = oldThen.call(this, callback);
							if (callback) {
								promise.name = getPromiseName(callback);
							};
							return promise;
						};
						var oldCatch = Promise.prototype['catch'];
						Promise.prototype['catch'] = function(callback) {
							var promise = oldCatch.call(this, callback);
							if (callback) {
								promise.name = getPromiseName(callback);
							};
							return promise;
						};
						var oldNodeify = Promise.prototype.nodeify;
						Promise.prototype.asCallback = Promise.prototype.nodeify = function asCallback(callback) {
							var promise = oldNodeify.call(this, callback);
							if (callback) {
								promise.name = getPromiseName(callback);
							};
							return promise;
						};
						var oldFinally = Promise.prototype['finally'];
						Promise.prototype['finally'] = function _finally(callback) {
							var promise = oldFinally.call(this, callback);
							if (callback) {
								promise.name = getPromiseName(callback);
							};
							return promise;
						};
						var oldTry = Promise['try'];
						Promise['try'] = function(callback) {
							var promise = oldTry.call(this, callback);
							if (callback) {
								promise.name = getPromiseName(callback);
							};
							return promise;
						};
*/
						
						__Internal__.Promise = Promise;
					});
				
				//types.PromiseRejectedError = types.createErrorType("PromiseRejectedError", types.Error, function _new(reason, /*optional*/message, /*optional*/params) {
				//	this.reason = reason;
				//	return types.Error.call(this, message || "Promise rejected.", params);
				//});

				types.PromiseCallback = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 2,
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
							},
							returns: 'function',
							description: "Creates a callback handler specially for a Promise.",
					}
					//! END_REPLACE()
					, types.setPrototypeOf(function(/*optional*/obj, fn) {
						if (types.isPrototypeOf(types.Callback, fn)) {
							return fn;
						};
						var insideFn = types.makeInside(obj, fn);
						var callback = function callbackHandler(/*paramarray*/) {
							try {
								return insideFn.apply(obj, arguments);
							} catch(ex) {
								//if (ex instanceof types.PromiseRejectedError) {
								//	throw ex.reason;
								//} else {
									try {
										var tools = root.Doodad.Tools;
										if (!(ex instanceof types.ScriptInterruptedError)) {
											tools.log(tools.LogLevels.Debug, "A Promise has been rejected due to an unhandled error :");
											tools.log(tools.LogLevels.Debug, ex.stack);
											tools.log(tools.LogLevels.Debug, fn.toString().slice(0, 500));
										};
									} catch(o) {
									};
									throw ex;
								//};
							};
						};
						callback = types.setPrototypeOf(callback, types.PromiseCallback);
						callback[__Internal__.symbolOriginalValue] = fn;
						return callback;
					}, types.Callback));
				
					
				types.trapUnhandledRejections = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'undefined',
							description: "Will trap unhandled Promise rejections and logs them.",
					}
					//! END_REPLACE()
					, function() {
						if (!__Internal__.unhandledRejections) {
							__Internal__.unhandledRejections = new types.Map();
							
							var options = types.getOptions();
							
							types.addPromiseEventListener('unhandledrejection', function(ev) {
								if (!(ev.detail.reason instanceof types.ScriptInterruptedError)) {
									if (__Internal__.unhandledRejections.size < options.unhandledRejectionsMaxSize) {
										 __Internal__.unhandledRejections.set(ev.detail.promise, {
											reason: ev.detail.reason,
											time: (new Date()).valueOf(),
										 });
									};
								};
							});
							
							types.addPromiseEventListener('rejectionhandled', function(promise) {
								if (__Internal__.unhandledRejections.has(ev.detail.promise)) {
									__Internal__.unhandledRejections['delete'](ev.detail.promise);
								};
							});
							
							var dumpRejections = function() {
								try {
									var curTime = (new Date()).valueOf(),
										iter = __Internal__.unhandledRejections.entries(),
										result;
										
									// TODO: for ... of
									while (result = iter.next()) {
										if (result.done) {
											break;
										};
										var promise = result.value[0],
											val = result.value[1];
										if (__Natives__.mathAbs(curTime - val.time) >= options.unhandledRejectionsTimeout) {
											var tools = root.Doodad.Tools;
											//tools.log(tools.LogLevels.Error, "Unhandled rejected promise : " + (types.get(promise, 'name') || '<anonymous>'));
											tools.log(tools.LogLevels.Error, "Unhandled rejected promise.");
											if (val.reason) {
												tools.log(tools.LogLevels.Error, val.reason);
												if (val.reason.stack) {
													tools.log(tools.LogLevels.Error, val.reason.stack);
												};
											};
											__Internal__.unhandledRejections['delete'](promise);
										};
									};
								} catch(o) {
									__Internal__.unhandledRejections.clear();
								};
								
								var timer = global.setTimeout(dumpRejections, options.unhandledRejectionsTimeout);
								//! IF_DEF("serverSide")
									if (types.isObject(timer) && types.isFunction(timer.unref)) {
										// Node.Js: Allows the process to exit
										timer.unref();
									};
								//! END_IF()
							}
							
							var timer = global.setTimeout(dumpRejections, options.unhandledRejectionsTimeout);
							//! IF_DEF("serverSide")
								if (types.isObject(timer) && types.isFunction(timer.unref)) {
									// Node.Js: Allows the process to exit
									timer.unref();
								};
							//! END_IF()
							
							// TEST
							//global.setTimeout(function() {
							//	Promise.try(function Promise1() {
							//		throw new types.Error("Test");
							//	});
							//	new Promise(function Promise2() {
							//		throw new types.Error("Test");
							//	});
							//}, 1000);
						};
					});
					
					
				//===================================
				// Iterators
				//===================================

				__Natives__.windowSymbolIterator = (types.isNativeFunction(global.Symbol) && types.isSymbol(global.Symbol.iterator) ? global.Symbol.iterator : undefined);
				
				types.hasIterators = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'bool',
								description: "Returns 'true' if Javascript supports iterators. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, (__Natives__.windowSymbolIterator ? function hasIterators(obj) {
						return true;
					} : function hasIterators(obj) {
						return false;
					}));
				
				
				types.isIterable = root.DD_DOC(
					//! REPLACE_BY("null")
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
					, (__Natives__.windowSymbolIterator ? function isIterable(obj) {
						return (__Natives__.windowSymbolIterator in __Natives__.windowObject(obj));
					} : function isIterable(obj) {
						return false;
					}));
				
				
				// <PRB> As usual, JS doesn't give a way to make sure an object is an iterator
				types.isIteratorLike = root.DD_DOC(
					//! REPLACE_BY("null")
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
					});
				
				
				//===================================
				// Generators
				//===================================
				
				// <PRB> "Generator" and "GeneratorFunction" are not in the global space !!!
				// <PRB> "Generator" looks like not having a class !!!
				// <PRB> Enventually, another design mistake... no official way to test if an object is a GeneratorFunction or a Generator !!! (the reason invoked again is "there is no use case")
				
				try {
					__Natives__.GeneratorFunction = types.getPrototypeOf(types.eval("function*(){}")).constructor;
				} catch(ex) {
				};

				types.hasGenerators = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'bool',
								description: "Returns 'true' if the engine supports generators. 'false' otherwise.",
					}
					//! END_REPLACE()
					, (__Natives__.GeneratorFunction ? function hasGenerators() {
						return true;
					} : function hasGenerators() {
						return false;
					}));
				
				types.getGeneratorFunction = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'function',
								description: "Returns the 'GeneratorFunction' constructor.",
					}
					//! END_REPLACE()
					, function getGeneratorFunction() {
						return (__Natives__.GeneratorFunction || null);
					});
				
				types.isGeneratorFunction = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns 'true' if object is a generator function. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, (__Natives__.functionIsGenerator ? function isGeneratorFunction(obj) {
						return __Natives__.functionIsGenerator.call(obj);
					} : (__Natives__.GeneratorFunction ? function isGeneratorFunction(obj) {
						return (__Natives__.windowObject(obj) instanceof __Natives__.GeneratorFunction);
					} : function isGeneratorFunction(obj) {
						return false;
					})));
				
				types.isGenerator = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns 'true' if object is a generator iterator. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, (__Natives__.GeneratorFunction ? function isGenerator(obj) {
						var proto = types.getPrototypeOf(Object(obj));
						if (proto) {
							proto = types.getPrototypeOf(proto);
						};
						return (proto && proto.constructor ? (proto.constructor.constructor === __Natives__.GeneratorFunction) : false);
					} : function isGenerator(obj) {
						return false;
					}));
				
				//===================================
				// ECMA 6 Proxies functions
				//===================================
					
				types.hasProxiesEnabled = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'bool',
								description: "Returns 'true' when ES6 Proxy is available.",
					}
					//! END_REPLACE()
					, (__Natives__.windowProxy ? (function hasProxiesEnabled() {
						return types.getOptions().enableProxies;
					}) : (function hasProxiesEnabled() {
						return false;
					})));
				
		/*
				types.isProxy = (__Natives__.windowProxy ? (function isProxy(obj) {
					return (obj instanceof __Natives__.windowProxy);
				}) : (function isProxy(obj) {
					if (types.isNothing(obj)) {
						return false;
					};
					obj = __Natives__.windowObject(obj);
					return !!obj.__isProxy__;
				}));
		*/
				
				types.createProxy = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'object',
										optional: false,
										description: "An object.",
									},
									handler: {
										type: 'object',
										optional: false,
										description: "Handler.",
									},
								},
								returns: 'object',
								description: "Helper function to create a ES6 Proxy for an object. When ES6 Proxy is not available, attempts to reproduce it when possible.",
					}
					//! END_REPLACE()
					, (__Natives__.windowProxy ? (function createProxy(target, handler) {
						return new __Natives__.windowProxy(target, handler);
					}) : (function createProxy(target, handler) {
						if (types.has(handler, [
								'getPrototypeOf', 'setPrototypeOf', 'isExtensible', 'preventExtensions', 
								'getOwnPropertyDescriptor', 'defineProperty', 'has', 'get', 'set', 'deleteProperty', 
								'enumerate', 'ownKeys', 'construct'
						])) {
							throw new types.TypeError("Proxies not available.");
						};
						
						if (handler.apply) {
							var _caller = function caller(/*paramarray*/) {
								return handler.apply.call(handler, target, this, arguments);
							};
							//__Types.defineProperty(_caller, '__isProxy__', {value: true});
							return _caller;
						};
						
						// "Invisible proxy"
						//return types.createObject(target, {__isProxy__: {value: true}});
						return types.createObject(target);
					})));
				
				//===================================
				// Buffers
				//===================================

				types.isArrayBuffer = root.DD_DOC(
					//! REPLACE_BY("null")
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
					, (__Natives__.windowArrayBuffer ? (function isArrayBuffer(obj) {
						return (obj instanceof __Natives__.windowArrayBuffer);
						
					}) : (function isArrayBuffer(obj) {
						// ArrayBuffer is not implemented.
						return false;
						
					})));
				
				//===================================
				// Typed Arrays
				//===================================
				
				if (global.Int8Array) {
					try {
						__Natives__.windowTypedArray = types.getPrototypeOf(global.Int8Array.prototype).constructor;
						
						if (__Natives__.windowTypedArray === global.Object) {
							// <PRB> NodeJs has no TypedArray constructor.
							delete __Natives__.windowTypedArray;
							__Internal__.TypedArrays = [global.Int8Array, global.Uint8Array, global.Uint8ClampedArray, global.Int16Array, 
													global.Uint16Array, global.Int32Array, global.Uint32Array, global.Float32Array, 
													global.Float64Array];
						};
					} catch(ex) {
					};
				};
					
				types.isTypedArray = root.DD_DOC(
					//! REPLACE_BY("null")
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
								description: "Returns 'true' if object is a typed array (an array buffer view). Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, (__Natives__.windowTypedArray ? (function isTypedArray(obj) {
						return (obj instanceof __Natives__.windowTypedArray);
						
					}) : (__Internal__.TypedArrays ? (function isTypedArray(obj) {
						// <PRB> NodeJs has no TypedArray constructor.
						for (var i = 0; i < __Internal__.TypedArrays.length; i++) {
							var type = __Internal__.TypedArrays[i];
							if (type && (obj instanceof type)) {
								return true;
							};
						};
						return false;
						
					}) : (function isTypedArray(obj) {
						// Typed arrays are not implemented.
						return false;
						
					}))));

				//===================================
				// Bind/Unbind
				//===================================
				
				types.bind = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 1,
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
								description: "Binds a function to an object (so that 'this' will always be that object) and returns the resulting function. The original function is preserved in the symbol 'types.OriginalValueSymbol'.",
					}
					//! END_REPLACE()
					, function bind(obj, fn, /*optional*/args) {
						fn = types.unbind(fn);
						if (fn === null) {
							return null;
						};
						var newFn;
						if (__Natives__.functionBind) {
							if (args) {
								newFn = __Natives__.functionBind.apply(fn, types.append([obj], args));
							} else {
								newFn = __Natives__.functionBind.call(fn, obj);
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
						newFn[__Internal__.symbolOriginalValue] = fn;
						return newFn;
					});
				
				types.unbind = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 2,
								params: {
									fn: {
										type: 'function',
										optional: false,
										description: "A function.",
									},
								},
								returns: 'object',
								description: "Unbinds a function and returns the resulting function. In fact, it returns the value of its 'types.OriginalValueSymbol' attribute. Owned properties are also copied.",
					}
					//! END_REPLACE()
					, function unbind(fn) {
						if (!types.isFunction(fn)) {
							return null;
						};
						var oldFn = types.get(fn, __Internal__.symbolOriginalValue);
						if (oldFn) {
							types.extend(oldFn, fn);
							delete oldFn[__Internal__.symbolOriginalValue];
							return oldFn;
						};
						return fn;
					});

				//===================================
				// Box/Unbox
				//===================================
				
				types.box = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									value: {
										type: 'any',
										optional: false,
										description: "A value.",
									},
								},
								returns: 'Doodad.Types.box',
								description: "Box a value inside a box object.",
					}
					//! END_REPLACE()
					, types.INIT(types.Type.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'box',
						},
						/*instanceProto*/
						{
							_new: function box(value) {
								if (value instanceof types.box) {
									value.setAttributes(this);
									value = value[__Internal__.symbolOriginalValue];
								};
								this[__Internal__.symbolOriginalValue] = value;
							},
							
							setAttributes: function setAttributes(dest, /*optional*/override) {
								var keys = types.append(types.keys(this), types.symbols(this));
								for (var i = 0; i < keys.length; i++) {
									var key = keys[i];
									if ((key !== __Internal__.symbolOriginalValue) && (override || !types.has(dest, key))) {
										dest[key] = this[key];
									};
								};
							},
							valueOf: function valueOf() {
								return this[__Internal__.symbolOriginalValue];
							},
							setValue: function setValue(value, /*optional*/override) {
								// NOTE: "box" is immutable
								var type = types.getType(this);
								var newBox = new type(value);
								this.setAttributes(newBox, override);
								return newBox;
							},
							clone: function clone() {
								return this.setValue(this[__Internal__.symbolOriginalValue]);
							},
						},
						/*constructor*/
						function box(value) {
							//if (new.target) {
							if (this instanceof types.box) {
								return (this._new(value) || this);
							} else {
								return new types.box(value);
							};
						}
					)));
				
				types.unbox = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									value: {
										type: 'Doodad.Types.box',
										optional: false,
										description: "A value.",
									},
								},
								returns: 'object',
								description: "Extract the value of a box object.",
					}
					//! END_REPLACE()
					, function unbox(value) {
						return ((value instanceof types.box) ? value.valueOf() : value);
					});
					
					
				types.Iterator = types.Type.$inherit(
					{
						$TYPE_NAME: 'Iterator',
					},
					{
						close: null, // function()
						
						next: function next() {
							return {
								done: true,
							};
						},
					})
					
				__Internal__.SetIterator = (!__Natives__.windowSet && types.Iterator.$inherit(
					{
						$TYPE_NAME: 'SetIterator',
					},
					{
						__index: 0,
						__ar: null,
						
						_new: types.SUPER(function _new(setObj) {
							this._super();
							this.__ar = types.clone(setObj.__ar);
						}),
					}))
					
				__Internal__.SetValuesIterator = (!__Natives__.windowSet && __Internal__.SetIterator.$inherit(
					{
						$TYPE_NAME: 'SetValuesIterator',
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
					}))
					
				__Internal__.SetEntriesIterator = (!__Natives__.windowSet && __Internal__.SetIterator.$inherit(
					{
						$TYPE_NAME: 'SetEntriesIterator',
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
					}))
					
					
				types.Set = (__Natives__.windowSet || types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Set',
					},
					/*instanceProto*/
					{
						size: 0,
						__ar: null,

						_new: types.SUPER(function _new(/*optional*/ar) {
							this._super();
							
							if (types.isNothing(ar)) {
								this.__ar = [];
							} else if (ar instanceof types.Set) {
								this.__ar = types.clone(ar.__ar);
							} else if (ar instanceof types.Map) {
								var mapAr = ar.__keys,
									mapVals = ar.__values,
									newAr = new Array(mapAr.length);
								for (var i = 0; i < mapAr.length; i++) {
									newAr[i] = [mapAr[i], mapVals[i]];
								};
								this.__ar = newAr;
							} else if (types.isArrayLike(ar)) {
								this.__ar = types.unique(ar);
							} else {
								throw types.TypeError("Invalid array.");
							};
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
								this.__ar.push(value);
								this.size++;
							};
							return this;
						},
						'delete': function _delete(value) {
							for (var i = 0; i < this.__ar.length; i++) {
								if (this.__ar[i] === value) {
									this.__ar.splice(i, 1);
									this.size--;
									return true;
								};
							};
							return false;
						},
						clear: function clear() {
							this.__ar = [];
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
							for (var i = 0; i < this.__ar.length; i++) {
								var value = this.__ar[i];
								callbackFn.call(thisObj, value, value, this);
							};
						},
					},
					/*constructor*/
					function _new(ar) {
						this.__ar = ar || [];
					}
				));
				
				__Internal__.MapIterator = (!__Natives__.windowMap && types.Iterator.$inherit(
					{
						$TYPE_NAME: 'MapIterator',
					},
					{
						__index: 0,
						__keys: null,
						__values: null,
						
						_new: types.SUPER(function _new(mapObj) {
							this._super();
							this.__keys = types.clone(mapObj.__keys);
							this.__values = types.clone(mapObj.__values);
						}),
					}))
					
				__Internal__.MapKeysIterator = (!__Natives__.windowMap && __Internal__.MapIterator.$inherit(
					{
						$TYPE_NAME: 'MapKeysIterator',
					},
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
					}))
					
				__Internal__.MapValuesIterator = (!__Natives__.windowMap && __Internal__.MapIterator.$inherit(
					{
						$TYPE_NAME: 'MapValuesIterator',
					},
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
					}))
					
				__Internal__.MapEntriesIterator = (!__Natives__.windowMap && __Internal__.MapIterator.$inherit(
					{
						$TYPE_NAME: 'MapEntriesIterator',
					},
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
					}))
					
					
				types.Map = (__Natives__.windowMap || types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Map',
					},
					/*instanceProto*/
					{
						size: 0,
						__keys: null,
						__values: null,

						_new: types.SUPER(function _new(ar) {
							this._super();
							
							if (types.isNothing(ar)) {
								// Do nothing
							} else if (ar instanceof types.Map) {
								this.__keys = types.clone(ar.__keys);
								this.__values = types.clone(ar.__values);
								return;
							} else if (ar instanceof types.Set) {
								ar = ar.__ar;
							} else if (types.isArrayLike(ar)) {
								// Do nothing
							} else {
								throw types.TypeError("Invalid array.");
							};

							this.__keys = [];
							this.__values = [];
							
							if (ar) {
								for (var i = 0; i < ar.length; i++) {
									var item = ar[i];
									this.__keys.push(item[0]);
									this.__values.push(item[1]);
								};
							};
						}),
						has: function has(key) {
							for (var i = 0; i < this.__keys.length; i++) {
								if (this.__keys[i] === key) {
									return true;
								};
							};
							return false;
						},
						get: function get(key) {
							for (var i = 0; i < this.__keys.length; i++) {
								if (this.__keys[i] === key) {
									return this.__values[i];
								};
							};
						},
						set: function set(key, value) {
							if (!this.has(key)) {
								this.__keys.push(key);
								this.__values.push(value);
								this.size++;
							};
							return this;
						},
						'delete': function _delete(key) {
							for (var i = 0; i < this.__keys.length; i++) {
								if (this.__keys[i] === key) {
									this.__keys.splice(i, 1);
									this.__values.splice(i, 1);
									this.size--;
									return true;
								};
							};
							return false;
						},
						clear: function clear() {
							this.__keys = [];
							this.__values = [];
							this.size = 0;
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
							for (var i = 0; i < this.__keys.length; i++) {
								callbackFn.call(thisObj, this.__values[i], this.__keys[i], this);
							};
						},
					}
				));
				
				//===================================
				// HTTP Status Codes
				// TODO: Move elsewhere
				//===================================
				
				types.HttpStatus = types.extend(types.createObject({
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
				}), {
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
				});
				

				//===================================
				// Init
				//===================================
				return function init(/*optional*/options) {
					if (__Natives__.windowPromise) {
						try {
							types.setPromise(__Natives__.windowPromise);
						} catch(ex) {
						};
					};
					
					if (types.getOptions().trapUnhandledRejections) {
						types.trapUnhandledRejections();
					};
				};
			},
		};
		
		return DD_MODULES;
	};
	
	//! BEGIN_REMOVE()
	if ((typeof process !== 'object') || (typeof module !== 'object')) {
	//! END_REMOVE()
		//! IF_UNDEF("serverSide")
			// <PRB> export/import are not yet supported in browsers
			global.DD_MODULES = exports.add(global.DD_MODULES);
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
}).call(
	//! BEGIN_REMOVE()
	(typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : this)
	//! END_REMOVE()
	//! IF_DEF("serverSide")
	//! 	INJECT("global")
	//! ELSE()
	//! 	INJECT("window")
	//! END_IF()
);