/* global process, DD_BOOTSTRAP */

//! IF_SET("serverSide")
	//! IF_SET("mjs")
		//! INJECT("const exports = {};")
	//! END_IF()

//! ELSE()
	//! INJECT("const global = window, exports = {};")

//! END_IF()


//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Bootstrap.js - Bootstrap module
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
	//! INJECT("import {default as nodeUUID} from 'uuid';");
//! END_IF()


// WARNING: It is NOT to be used with arbitrary expressions.
// WARNING: Do not declare any variable and parameter inside these functions.
exports.eval = function _eval(/*expr*/) {
	/* eslint no-eval: "off" */
	/* eslint prefer-rest-params: "off" */

	// <PRB> "{...}" and "function ..." need parentheses.
	return eval('(' + arguments[0] + ')');
};

exports.evalWithCtx = function evalWithCtx(ctx /*, expr*/) {
	/* eslint no-eval: "off" */
	/* eslint prefer-rest-params: "off" */

	// NOTE: "ctx" is to be used by the expression
	ctx = ctx || {}; // force variable to be preserved
	// <PRB> "{...}" and "function ..." need parentheses.
	return eval('(' + arguments[1] + ')');
};

exports.generateCreateEval = function generateCreateEval() {
	return "(function createEval(/*locals*/) {" +
		"return eval(" +
			'"(function(" + arguments[0].join(",") + ") {" + ' +
				'"return function(/*expression*/) {" + ' +
					'\'"use strict";\' + ' +
					'"return eval(arguments[0]);" + ' +
				'"};" + ' +
			'"})"' +
		");" +
	"})";
};

exports.createEval = exports.eval(exports.generateCreateEval());


exports.createRoot = function createRoot(/*optional*/modules, /*optional*/_options, /*optional*/startup) {
	/* eslint global-require: "off" */

	(function checkRuntime() {
		// <PRB> Firefox's "Function.prototype.toString" bug #1 : "incompatible object" error message raised with some constructors (EventTarget, Node, HTMLElement, ...) ! Don't know how to test for compatibility.
		try {
			if (typeof global.Event === 'function') {
				global.Function.prototype.toString.call(global.Event);
			};
		} catch(ex) {
			throw new global.Error("Browser version not supported.");
		};

		// <PRB> Firefox's "Function.prototype.toString" bug #2: Returns class's constructor function instead of the class.
		if ((class{}).toString().slice(0, 5) !== 'class') {
			throw new global.Error("Browser version not supported.");
		};
	})();

	//! IF_SET('debug')
		// V8: Increment maximum number of stack frames
		// Source: https://github.com/v8/v8/wiki/Stack-Trace-API
		if (global.Error.stackTraceLimit < 50) {
			global.Error.stackTraceLimit = 50;
		};
	//! END_IF()

	//! IF(IS_UNSET("serverSide") || IS_UNSET("mjs"))
		// NOTE: Client-side 'uuid' is browserified to "lib/uuid/uuid.js" and "lib/uuid/uuid.min.js", and made available in JS through "require".
		//       Also it works with Node.js and bundlers.
		const nodeUUID = ((typeof require === 'function') ? require('uuid') : undefined);
	//! END_IF()


	let __options__ = {
		//! IF_SET('debug')
			debug: true,                        // When 'true', will be in 'debug mode'.
			fromSource: true,                   // When 'true', loads source code instead of built code.
			enableDebugger: true,               // When 'true', enables 'types.DEBUGGER'.
			enableProperties: true,             // When 'true', enables 'types.defineProperty'.
			enableAsserts: true,                // When 'true', enables 'root.DD_ASSERT'.
		//! ELSE()
			//!	INJECT("debug: false,                       // When 'true', will be in 'debug mode'.\n")
			//!	INJECT("fromSource: false,                  // When 'true', loads source code instead of built code.\n")
			//!	INJECT("enableDebugger: false,              // When 'true', enables 'types.DEBUGGER'.\n")
			//!	INJECT("enableProperties: false,            // When 'true', enables 'types.defineProperty'.\n")
			//!	INJECT("enableAsserts: false,               // When 'true', enables 'root.DD_ASSERT'.\n")
		//! END_IF()

		enableSymbols: true,					// (Read-Only) When 'true', symbols are enabled.
		enableSafeObjects: false,				// When 'true', safe objects are enabled. NOTE: When enabled, it will significatively slow down everything. For intensive debug only.
	};

	const {types, tools, _shared, __Internal__} = (function(_shared, __Internal__) {
		const types = {},
			tools = {};


		//===================================
		// Temporary DD_DOC
		//===================================
		__Internal__.tempDocs = [];

		__Internal__.DD_DOC = function DD_DOC(doc, value) {
			__Internal__.tempDocs.push([doc, value]);
			return value;
		};

		//===================================
		// Temporary ADD (for Doodad.Types)
		//===================================
		__Internal__.tempTypesAdded = [];

		__Internal__.ADD = function ADD(name, obj) {
			types[name] = obj;
			__Internal__.tempTypesAdded.push([name, obj]);
			return obj;
		};

		//===================================
		// Temporary ADD (for Doodad.Tools)
		//===================================
		__Internal__.tempToolsAdded = [];

		__Internal__.ADD_TOOL = function ADD_TOOL(name, obj) {
			tools[name] = obj;
			__Internal__.tempToolsAdded.push([name, obj]);
			return obj;
		};


		//===================================
		// Define "depthExtend" functions
		//===================================
		__Internal__.ADD('toBoolean', __Internal__.DD_DOC(
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
					returns: 'bool',
					description: "Converts a value to a boolean.",
				}
			//! END_REPLACE()
			, function toBoolean(obj) {
				return (obj === 'true') || !!(+obj);
			}));

		__Internal__.ADD('isNothing', __Internal__.DD_DOC(
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
					description: "Returns 'true' if object is 'null' or 'undefined'. Returns 'false' otherwise.",
				}
			//! END_REPLACE()
			, function isNothing(obj) {
				return (obj == null); // Yes, "==", not "==="
			}));

		// <PRB> JS has no function to test for strings
		__Internal__.ADD('isString', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
					author: "Claude Petit",
					revision: 4,
					params: {
						obj: {
							type: 'any',
							optional: false,
							description: "An object to test for.",
						},
					},
					returns: 'bool',
					description: "Returns 'true' if object is a string. Returns 'false' otherwise.",
				}
			//! END_REPLACE()
			, function isString(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				const type = typeof obj;
				if (type === 'object') {
					if (obj[_shared.Natives.symbolToStringTag] === 'String') {
						try {
							_shared.Natives.stringValueOfCall(obj);
							return true;
						} catch(o) {
							// Do nothing
						};
					} else if (_shared.Natives.objectToStringCall(obj) === '[object String]') {
						return true;
					};
				} else if (type === 'string') {
					return true;
				};
				return false;
			}));

		__Internal__.ADD('isFunction', __Internal__.DD_DOC(
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
					description: "Returns 'true' if object is a function, 'false' otherwise.",
				}
			//! END_REPLACE()
			, function isFunction(obj) {
				return (typeof obj === 'function');
			}));

		// <PRB> JS has no function to test for objects ( new Object() )
		__Internal__.ADD('isObject', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
					author: "Claude Petit",
					revision: 4,
					params: {
						obj: {
							type: 'any',
							optional: false,
							description: "An object.",
						},
					},
					returns: 'boolean',
					description: "Returns 'true' if the object is a Javascript user object. Returns 'false' otherwise.",
				}
			//! END_REPLACE()
			, function isObject(obj) {
				if (obj && (typeof obj === 'object')) {
					if (obj[_shared.Natives.symbolToStringTag] === 'Object') {
						const proto = types.getPrototypeOf(obj);
						if (proto) {
							return types.isObject(proto);
						} else {
							// Null object
							return true;
						}
					} else if (_shared.Natives.objectToStringCall(obj) === '[object Object]') {
						return true;
					};
				};
				return false;
			}));

		__Internal__.ADD('isObjectLike', __Internal__.DD_DOC(
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
					returns: 'boolean',
					description: "Returns 'true' if the object is a direct instance of 'Object' or an instance of a type which inherits 'Object'. Returns 'false' otherwise.",
				}
			//! END_REPLACE()
			, function isObjectLike(obj) {
				const type = typeof obj;
				return !!obj && ((type === 'object') || (type === 'function'));
			}));

		__Internal__.ADD('isArray', _shared.Natives.arrayIsArray);

		__Internal__.ADD('isArrayLike', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
					author: "Claude Petit",
					revision: 3,
					params: {
						obj: {
							type: 'any',
							optional: false,
							description: "An object to test for.",
						},
					},
					returns: 'bool',
					description: "Returns 'true' if object is an array-like object. Returns 'false' otherwise.",
				}
			//! END_REPLACE()
			, function isArrayLike(obj) {
				// Unbelievable : There is not an official way to detect an array-like object !!!!
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					const len = obj.length;
					return (typeof len === 'number') && ((len >>> 0) === len);
				} else if (types.isString(obj)) {
					return true;
				} else {
					return false;
				}
			}));

		__Internal__.ADD('has', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
					author: "Claude Petit",
					revision: 2,
					params: {
						obj: {
							type: 'any',
							optional: false,
							description: "An object.",
						},
						keys: {
							type: 'arrayof(string,Symbol),string,Symbol',
							optional: false,
							description: "Key(s) to test for.",
						},
					},
					returns: 'bool',
					description: "Returns 'true' if one of the specified keys is an owned property of the object.",
				}
			//! END_REPLACE()
			, function has(obj, keys) {
				if (!types.isNothing(obj)) {
					obj = _shared.Natives.windowObject(obj);
					if (!types.isArray(keys)) {
						return _shared.Natives.objectHasOwnPropertyCall(obj, keys);
					};
					const len = keys.length;
					if (!len) {
						return false;
					};
					for (let i = 0; i < len; i++) {
						if (_shared.Natives.objectHasOwnPropertyCall(keys, i)) {
							const key = keys[i];
							if (_shared.Natives.objectHasOwnPropertyCall(obj, key)) {
								return true;
							};
						};
					};
				};
				return false;
			}));

		__Internal__.ADD('keys', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					description: "Returns an array of enumerable owned property names of an object. For array-like objects, index properties are excluded.",
				}
			//! END_REPLACE()
			, function keys(obj) {
				/* eslint no-restricted-syntax: "off", guard-for-in: "off" */ // for...in

				// Returns enumerable own properties (those not inherited).
				// Doesn't not include array items.
				if (types.isNothing(obj)) {
					return [];
				};

				obj = _shared.Natives.windowObject(obj);

				let result;

				if (types.isArrayLike(obj)) {
					result = [];
					for (const key in obj) {
						if (types.has(obj, key) && !__Internal__.isArrayIndexRegExp.test(key)) {
							result.push(key);
						};
					};
				} else {
					result = _shared.Natives.objectKeys(obj);
				};

				return result;
			}));

		__Internal__.ADD('symbols', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					returns: 'arrayof(symbol)',
					description: "Returns an array of enumerable own property symbols.",
				}
			//! END_REPLACE()
			, function symbols(obj) {
				// FUTURE: "Object.symbols" ? (like "Object.keys")
				// FUTURE: Use "filter"
				if (types.isNothing(obj)) {
					return [];
				};
				const all = _shared.Natives.objectGetOwnPropertySymbols(obj);
				const symbols = [];
				for (let i = 0; i < all.length; i++) {
					const symbol = all[i];
					if (types.isEnumerable(obj, symbol)) {
						symbols.push(symbol);
					};
				};
				return symbols;
			}));

		__Internal__.ADD_TOOL('createObject', _shared.Natives.objectCreate);

		__Internal__.ADD_TOOL('extend', _shared.Natives.objectAssign);

		__Internal__.ADD_TOOL('append', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
					author: "Claude Petit",
					revision: 2,
					params: {
						obj: {
							type: 'arraylike',
							optional: false,
							description: "Target array.",
						},
						paramarray: {
							type: 'arrayof(arraylike)',
							optional: true,
							description: "Arrays to append.",
						},
					},
					returns: 'array',
					description: "Appends the items of each array to the first argument then returns that array. Skips undefined or null values. Better than 'concat' because it accepts array-likes. But for large array, it's probably better to use 'concat'.",
				}
			//! END_REPLACE()
			, function append(obj, /*paramarray*/...args) {
				if (!types.isArrayLike(obj)) {
					return null;
				};
				const argsLen = args.length;
				for (let i = 0; i < argsLen; i++) {
					const arg = args[i];
					if (!types.isNothing(arg)) {
						_shared.Natives.arrayPushApply(obj, arg);
					};
				};
				return obj;
			}));

		__Internal__.ADD_TOOL('nullObject', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
					author: "Claude Petit",
					revision: 1,
					params: {
						paramarray: {
							type: 'object',
							optional: true,
							description: "List of objects.",
						},
					},
					returns: 'object',
					description: "Returns a null object extended by the provided objects.",
				}
			//! END_REPLACE()
			, function nullObject(/*paramarray*/...args) {
				return tools.extend.apply(tools, tools.append([tools.createObject(null)], args));
			}));

		__Internal__.ADD_TOOL('depthExtend', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
					author: "Claude Petit",
					revision: 6,
					params: {
						depth: {
							type: 'integer,function',
							optional: false,
							description: "Depth, or extender function.",
						},
						obj: {
							type: 'object',
							optional: false,
							description: "An object.",
						},
						paramarray: {
							type: 'object',
							optional: false,
							description: "An object.",
						},
					},
					returns: 'object',
					description: "Extends the first object with owned properties of the other objects using the specified depth.",
				}
			//! END_REPLACE()
			, function depthExtend(depth, obj, /*paramarray*/...args) {
				let result;
				if (!types.isNothing(obj)) {
					let extender;
					if (types.isFunction(depth)) {
						extender = depth;
						depth = Infinity;
					} else {
						depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
						extender = function(result, val, key, extend) {
							if ((extender.depth >= 0) && types.isObject(val)) {
								const resultVal = result[key];
								if (types.isNothing(resultVal)) {
									extender.depth--;
									if (extender.depth >= -1) {
										result[key] = extend({}, val);
									};
								} else if (types.isObjectLike(resultVal)) {
									extender.depth--;
									if (extender.depth >= -1) {
										extend(resultVal, val);
									};
								} else if (resultVal !== val) {
									result[key] = val;
								};
							} else {
								result[key] = val;
							};
						};
						extender.depth = depth;
					};
					if (depth >= -1) {
						result = _shared.Natives.windowObject(obj);
						const argsLen = args.length;
						for (let i = 0; i < argsLen; i++) {
							let arg = args[i];
							if (!types.isNothing(arg)) {
								// Part of "Object.assign" Polyfill from Mozilla Developer Network.
								arg = _shared.Natives.windowObject(arg);
								const keys = types.keys(arg);
								const keysLen = keys.length; // performance
								for (let j = 0; j < keysLen; j++) {
									const key = keys[j];
									extender(result, arg[key], key, _shared.Natives.functionBindCall(tools.depthExtend, types, extender));
								};
								const symbols = types.symbols(arg);
								const symbolsLen = symbols.length; // performance
								for (let j = 0; j < symbolsLen; j++) {
									const key = symbols[j];
									extender(result, arg[key], key, _shared.Natives.functionBindCall(tools.depthExtend, types, extender));
								};
							};
						};
					};
				};
				return result;
			}));

		//===================================
		// Options
		//===================================

		__Internal__.enableAsserts = null; // Will be set at "root" creation.
		__Internal__.disableAsserts = null; // Will be set at "root" creation.

		__Internal__._setOptions = function setOptions(...args) {
			const newOptions = tools.nullObject(__options__, ...args);

			newOptions.debug = types.toBoolean(newOptions.debug);
			newOptions.fromSource = types.toBoolean(newOptions.fromSource);
			newOptions.enableProperties = types.toBoolean(newOptions.enableProperties);
			newOptions.enableAsserts = types.toBoolean(newOptions.enableAsserts);
			newOptions.enableSymbols = types.toBoolean(newOptions.enableSymbols);
			newOptions.enableSafeObjects = types.toBoolean(newOptions.enableSafeObjects);

			return newOptions;
		};

		if (global.Array.isArray(_options)) {
			_options = tools.depthExtend.apply(null, Array.prototype.concat.apply([__Internal__.OPTIONS_DEPTH, {}], _options));
		};

		__options__ = __Internal__._setOptions(_options.startup);

		//===================================
		// "safeObject"
		//===================================

		const natives = _shared.Natives;

		// NOTE: Proxies are too slow. Please enable "safeObject" just when needed then disable it.
		_shared.safeObject = function _safeObject(obj) {
			if (__options__.enableSafeObjects && natives.windowProxy) {
				return new natives.windowProxy(obj || {}, {
					get: function(target, property, receiver) {
						if (property === _shared.TargetSymbol) {
							return target;
						};
						if (!natives.objectHasOwnPropertyCall(target, property)) {
							throw new natives.windowTypeError("Unknown safe object attribute : " + natives.windowString(property));
						};
						return target[property];
					},
					set: function(target, property, value, receiver) {
						if (property === _shared.TargetSymbol) {
							throw new natives.windowTypeError("The target symbol can't be set.");
						};
						if (value === undefined) {
							throw new natives.windowTypeError("The attribute '" + natives.windowString(property) + "' was set to 'undefined'.");
						};
						target[property] = value;
						return true;
					}
				});
			} else {
				return obj || {};
			}
		};


		//===================================
		// Return modified module constants
		//===================================

		_shared.Natives = _shared.safeObject(natives);

		return {
			types,
			tools,
			_shared: _shared.safeObject(_shared),
			__Internal__: _shared.safeObject(__Internal__),
		};
	})(
		/*_shared*/
		{
			// Secret value used to load modules, ...
			SECRET: undefined,

			// NOTE: Preload of immediatly needed natives.
			Natives: {
				// General
				windowObject: global.Object,
				stringReplaceCall: global.String.prototype.replace.call.bind(global.String.prototype.replace),
				numberToStringCall: global.Number.prototype.toString.call.bind(global.Number.prototype.toString),
				windowFunction: global.Function,
				windowMap: global.Map,
				windowWeakMap: global.WeakMap,
				windowSet: global.Set,
				windowWeakSet: global.WeakSet,

				// "eval"
				windowEval: global.eval,

				// "hasInherited"
				objectPrototype: global.Object.prototype,

				// "createObject"
				objectCreate: global.Object.create,

				// "hasDefinePropertyEnabled" and "defineProperty"
				objectDefineProperty: global.Object.defineProperty,

				// "defineProperties"
				objectDefineProperties: global.Object.defineProperties,

				// "allKeys"
				objectGetOwnPropertyNames: global.Object.getOwnPropertyNames,

				// "getOwnPropertyDescriptor"
				objectGetOwnPropertyDescriptor: global.Object.getOwnPropertyDescriptor,

				// "getPrototypeOf"
				objectGetPrototypeOf: global.Object.getPrototypeOf,

				// "isProtoOf"
				objectIsPrototypeOfCall: global.Object.prototype.isPrototypeOf.call.bind(global.Object.prototype.isPrototypeOf),

				// "setPrototypeOf"
				objectSetPrototypeOf: global.Object.setPrototypeOf,

				// "isArray"
				arrayIsArray: global.Array.isArray,
				arraySpliceCall: global.Array.prototype.splice.call.bind(global.Array.prototype.splice),

				arraySliceCall: global.Array.prototype.slice.call.bind(global.Array.prototype.slice),

				// "createArray"
				windowArray: global.Array,
				//arrayFrom: global.Array.from,
				arrayFillCall: global.Array.prototype.fill.call.bind(global.Array.prototype.fill),

				// "isError"
				windowError: global.Error,

				// "isNumber", "toInteger"
				windowNumber: global.Number,

				// "hasSymbols", "isSymbol", "getSymbol"
				windowSymbol: global.Symbol,

				// "getSymbolFor"
				symbolFor: global.Symbol.for,

				// "getSymbolKey", "symbolIsGlobal"
				symbolToStringCall: global.Symbol.prototype.toString.call.bind(global.Symbol.prototype.toString),
				symbolValueOfCall: global.Symbol.prototype.valueOf.call.bind(global.Symbol.prototype.valueOf),
				symbolKeyFor: global.Symbol.keyFor,

				// "createType", "_instanceof"
				symbolHasInstance: global.Symbol.hasInstance,
				functionHasInstance: global.Function.prototype[global.Symbol.hasInstance],

				// "is*"
				numberValueOfCall: global.Number.prototype.valueOf.call.bind(global.Number.prototype.valueOf),
				booleanValueOfCall: global.Boolean.prototype.valueOf.call.bind(global.Boolean.prototype.valueOf),
				dateValueOfCall: global.Date.prototype.valueOf.call.bind(global.Date.prototype.valueOf),

				// "isNaN"
				numberIsNaN: global.Number.isNaN,

				// "isFinite"
				numberIsFinite: global.Number.isFinite,

				// "concat"
				arrayConcatApply: global.Array.prototype.concat.apply.bind(global.Array.prototype.concat),

				// "concat"
				arrayPushCall: global.Array.prototype.push.call.bind(global.Array.prototype.push),

				// "trim"
				stringTrimCall: global.String.prototype.trim.call.bind(global.String.prototype.trim),

				// "depthExtend"
				functionBindCall: global.Function.prototype.bind.call.bind(global.Function.prototype.bind),

				// "isInteger", "isSafeInteger", "toInteger", "toFloat"
				mathFloor: global.Math.floor,
				mathAbs: global.Math.abs,

				// "isInteger"
				numberIsInteger: global.Number.isInteger,

				// "isSafeInteger"
				numberIsSafeInteger: global.Number.isSafeInteger,

				// "toFloat"
				mathPow: global.Math.pow,

				// "sealObject"
				objectSeal: global.Object.seal,

				// "isFrozen"
				objectIsFrozen: global.Object.isFrozen,

				// "freezeObject"
				objectFreeze: global.Object.freeze,

				// "isExtensible"
				objectIsExtensible: global.Object.isExtensible,

				// "preventExtensions"
				objectPreventExtensions: global.Object.preventExtensions,

				// "isSafeInteger", "getSafeIntegerBounds"
				numberMaxSafeInteger: global.Number.MAX_SAFE_INTEGER,
				numberMinSafeInteger: global.Number.MIN_SAFE_INTEGER,

				// generateUUID
				mathRandom: global.Math.random,

				// AssertionError
				//consoleAssert: (global.console.assert ? global.console.assert.bind(global.console) : undefined),

				// "createEval"
				arrayJoinCall: global.Array.prototype.join.call.bind(global.Array.prototype.join),

				// "safeObject"
				windowProxy: global.Proxy,
				windowTypeError: global.TypeError,

				// "toString"
				windowString: global.String,

				// "has", "isCustomFunction", "isNativeFunction"
				objectHasOwnPropertyCall: global.Object.prototype.hasOwnProperty.call.bind(global.Object.prototype.hasOwnProperty),

				// "is*"
				symbolToStringTag: global.Symbol.toStringTag,
				stringValueOfCall: global.String.prototype.valueOf.call.bind(global.String.prototype.valueOf),

				// "isArray", "isObject", "isJsObject", "isCallable"
				objectToStringCall: global.Object.prototype.toString.call.bind(global.Object.prototype.toString),

				// "isEnumerable", "symbols"
				objectPropertyIsEnumerableCall: global.Object.prototype.propertyIsEnumerable.call.bind(global.Object.prototype.propertyIsEnumerable),

				// "allSymbols", "symbols"
				objectGetOwnPropertySymbols: global.Object.getOwnPropertySymbols,

				// "keys"
				objectKeys: global.Object.keys,

				// "append", "concat"
				arrayPushApply: global.Array.prototype.push.apply.bind(global.Array.prototype.push),

				// "extend"
				objectAssign: global.Object.assign,

				// "isCustomFunction", "isNativeFunction", getFunctionName"
				functionToStringCall: global.Function.prototype.toString.call.bind(global.Function.prototype.toString),
			},
		},

		/*__Internal__*/
		{
			SAFE_INTEGER_LEN: global.Math.log2(global.Number.MAX_SAFE_INTEGER),

			MIN_BITWISE_INTEGER: 0,
			MAX_BITWISE_INTEGER: ((~0) >>> 0), //   MAX_BITWISE_INTEGER | 0 === -1  ((-1 >>> 0) === 0xFFFFFFFF)

			DD_ASSERT: null,

			safeIntegerLen: null,
			bitwiseIntegerLen: null,

			OPTIONS_DEPTH: 15,

			isArrayIndexRegExp: /^(0|[1-9][0-9]*)$/,
		}
	);

	__Internal__.BITWISE_INTEGER_LEN = global.Math.round(global.Math.log(__Internal__.MAX_BITWISE_INTEGER) / global.Math.LN2, 0);


	//===================================
	// Debugger
	//===================================

	__Internal__.ADD('DEBUGGER', function() {
		/* eslint no-debugger: "off" */

		// Something weird just happened. Please see the call stack.

		// <PRB> "debugger" de-optimizes the function containing it. So we isolate it in "types.DEBUGGER".
		if (__options__.enableDebugger) {
			debugger;
		};
	});

	//===================================
	// Eval
	//===================================

	// WARNING: NOT to be used with arbitrary expressions.

	__Internal__.ADD_TOOL('eval', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					expr: {
						type: 'string',
						optional: false,
						description: "Expression",
					},
					ctx: {
						type: 'any',
						optional: true,
						description: "Context, accessible by the expression from the variable 'ctx'.",
					},
				},
				returns: 'string',
				description: "Evaluates an expression accross JS engines in strict mode. NOT to be used with arbitrary expressions.",
			}
		//! END_REPLACE()
		, function _eval(expr, /*optional*/ctx) {
			if (ctx) {
				return exports.evalWithCtx(ctx, expr);
			} else {
				return exports.eval(expr);
			}
		}));


	__Internal__.ADD_TOOL('generateCreateEval', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: null,
				returns: 'string',
				description: "Generates a 'createEval' function string to be evaluated so that it inherits desired scoped variables.",
			}
		//! END_REPLACE()
		, exports.generateCreateEval));


	__Internal__.ADD_TOOL('createEval', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 3,
				params: {
					locals: {
						type: 'object',
						description: "Variables to be passed to the executed code.",
					},
				},
				returns: 'function',
				description: "Create a function to evaluate expressions with the given variables.",
			}
		//! END_REPLACE()
		, exports.createEval));


	//==================================
	// Collection Objects
	//==================================

	__Internal__.ADD('Map', _shared.Natives.windowMap);
	__Internal__.ADD('WeakMap', _shared.Natives.windowWeakMap);
	__Internal__.ADD('Set', _shared.Natives.windowSet);
	__Internal__.ADD('WeakSet', _shared.Natives.windowWeakSet);


	//==================================
	// String Tools
	//==================================

	__Internal__.ADD_TOOL('trim', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					str: {
						type: 'string,array',
						optional: false,
						description: "String or array to trim",
					},
					chr: {
						type: 'string',
						optional: true,
						description: "Value used to trim. Default is a space.",
					},
					direction: {
						type: 'integer',
						optional: true,
						description: "'-1' to trim from the end. '1' to trim from the beginning. '0' for bidirectional. Default is '0'.",
					},
					count: {
						type: 'integer',
						optional: true,
						description: "Number of occurrences of 'chr' to trim from both sides.",
					},
				},
				returns: 'string',
				description: "Returns the trimmed string or array.",
			}
		//! END_REPLACE()
		, function trim(str, /*optional*/chr, /*optional*/direction, /*optional*/count) {
			const isArray = types.isArray(str);

			if (types.isNothing(chr)) {
				chr = ' ';
			};
			if (types.isNothing(count)) {
				count = Infinity;
			};

			if (isArray) {
				const strLen = str.length;

				let start = 0,
					x = 0;
				if (!direction || direction > 0) {
					for (; start < strLen; start++, x++) {
						if ((x >= count) || (str[start] !== chr)) {
							break;
						};
					};
				};

				let end = strLen - 1;
				x = 0;
				if (!direction || direction < 0) {
					for (; end >= 0; end--, x++) {
						if ((x >= count) || (str[end] !== chr)) {
							break;
						};
					};
				};

				if (end >= start) {
					return str.slice(start, end + 1);
				} else {
					return [];
				}
			} else if ((chr === ' ') && !direction && (count === Infinity)) {
				return _shared.Natives.stringTrimCall(str);
			} else {
				let i = 0,
					x = 0;
				let chrLen = chr.length;
				if (chrLen <= 0) {
					chrLen = 1;
				};
				if (!direction || (direction > 0)) {
					while ((x < count) && (i < str.length) && (str.slice(i, i + chrLen) === chr)) {
						i += chrLen;
						x++;
					};
				};
				let j = str.length - chrLen;
				x = 0;
				if (!direction || (direction < 0)) {
					while ((x < count) && (j > i) && (j >= 0) && (str.slice(j, j + chrLen) === chr)) {
						j -= chrLen;
						x++;
					};
				};
				return str.slice(i, j + chrLen);
			}
		}));

	//==================================
	// Conversion
	//==================================

	__Internal__.ADD('toInteger', __Internal__.DD_DOC(
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
				returns: 'number',
				description: "Converts the value to an integer.",
			}
		//! END_REPLACE()
		, function toInteger(obj) {
			obj = _shared.Natives.windowNumber(obj);
			if ((obj === 0) || types.isNaN(obj)) {
				return 0;
			};
			if (!types.isFinite(obj)) {
				return obj;
			};
			return (obj < 0 ? -1 : 1) * _shared.Natives.mathFloor(_shared.Natives.mathAbs(obj));
		}));

	__Internal__.ADD('toFloat', __Internal__.DD_DOC(
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
					precision: {
						type: 'integer',
						optional: true,
						description: "Float precision",
					},
				},
				returns: 'number',
				description: "Converts the value to a float.",
			}
		//! END_REPLACE()
		, function toFloat(obj, /*optional*/precision) {
			obj = _shared.Natives.windowNumber(obj);
			if ((obj === 0.0) || types.isNaN(obj) || !types.isFinite(obj)) {
				return 0.0;
			} else {
				if (!types.isNothing(precision)) {
					precision = _shared.Natives.mathPow(10, precision);
					obj = ((obj < 0.0 ? -1.0 : 1.0) * _shared.Natives.mathFloor(_shared.Natives.mathAbs(obj) * precision)) / precision;
				};
				return obj;
			}
		}));

	__Internal__.ADD('toString', __Internal__.DD_DOC(
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
				returns: 'string',
				description: "Converts the value to a string.",
			}
		//! END_REPLACE()
		, function toString(obj) {
			return _shared.Natives.windowString(obj);
		}));

	//===================================
	// Format functions
	//===================================

	__Internal__.ADD_TOOL('format', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					message: {
						type: 'string',
						optional: false,
						description: "Error message",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: false,
						description: "Parameters of the message",
					},
				},
				returns: 'string',
				description: "Formats message with parameters.",
			}
		//! END_REPLACE()
		, function format(message, params) {
			// WARNING: Don't use "root.DD_ASSERT" inside this function !!!
			if (!types.isString(message) || (!types.isNothing(params) && !types.isArrayLike(params) && !types.isObjectLike(params))) {
				// Invalid parameters. DO NOT CALL root.DD_ASSERT
				return '';
			};
			let result = '',
				pos,
				lastPos = 0,
				isKey = false;
			while ((pos = message.indexOf('~', lastPos)) >= 0) {
				const key = message.slice(lastPos, pos);
				if (isKey) {
					if (params && key.length) {
						result += types.toString(params[key]);
					} else {
						result += '~';
					};
					isKey = false;
				} else {
					result += key;
					isKey = true;
				};
				lastPos = pos + 1;
			};
			return isKey ? result : result + message.slice(lastPos);
		}));

	//===================================
	// ASSERTS functions
	//===================================

	__Internal__.ASSERT = __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					expr: {
						type: 'any',
						optional: false,
						description: "Expression",
					},
					message: {
						type: 'string',
						optional: true,
						description: "Error message",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'undefined',
				description: "Throws 'AssertionError' when expression resolves to 'false'. Does nothing otherwise.",
			}
		//! END_REPLACE()
		, function ASSERT(expr, /*optional*/message, /*optional*/params) {
			// IMPORTANT: You must use it like this :
			//          root.DD_ASSERT && root.DD_ASSERT(expr, message, params);

			// WARNING: Don't use "root.DD_ASSERT" inside this function !!!
			if (!expr) {
				if (types.isString(message)) {
					message = tools.format(message, params || []);
				};
				types.DEBUGGER();
				throw new types.AssertionError(message);
			};
		});

	//==================
	// Utilities
	//==================

	__Internal__.ADD('isJsClass', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 3,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is an ES6 class, 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isJsClass(obj) {
			if (types.isFunction(obj)) {
				return (_shared.Natives.functionToStringCall(obj).slice(0, 6) === 'class ');
			};
			return false;
		}));

	__Internal__.ADD('isNativeFunction', __Internal__.DD_DOC(
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
				description: "Returns 'true' if object is a native function, 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isNativeFunction(obj) {
			if (types.isJsClass(obj)) {
				return true;
			} else if (types.isFunction(obj)) {
				const str = _shared.Natives.functionToStringCall(obj),
					index1 = str.indexOf('{') + 1,
					index2 = str.indexOf('[native code]', index1);
				if (index2 < 0) {
					return false;
				};
				for (let i = index1; i < index2; i++) {
					const chr = str[i];
					if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
						return false;
					};
				};
				return true;
			} else {
				return false;
			}
		}));

	__Internal__.ADD('isCustomFunction', __Internal__.DD_DOC(
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
				description: "Returns 'true' if object is a custom function (non-native), 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isCustomFunction(obj) {
			if (types.isJsClass(obj)) {
				return false;
			} else if (types.isFunction(obj)) {
				const str = _shared.Natives.functionToStringCall(obj),
					index1 = str.indexOf('{') + 1,
					index2 = str.indexOf('[native code]', index1);
				if (index2 < 0) {
					return true;
				};
				for (let i = index1; i < index2; i++) {
					const chr = str[i];
					if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
						return true;
					};
				};
			};
			return false;
		}));

	// <PRB> JS has no function to test for primitives
	__Internal__.ADD('isPrimitive', __Internal__.DD_DOC(
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
				description: "Returns 'true' if object is a primitive value. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isPrimitive(obj) {
			if (types.isNothing(obj)) {
				return true;
			};
			// Source: http://cwestblog.com/2011/08/02/javascript-isprimitive-function/
			const type = (typeof obj);
			return (type !== "object") && (type !== "function");
		}));

	__Internal__.ADD('isNumber', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is a number. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isNumber(obj) {
			/* eslint no-self-compare: "off" */

			if (types.isNothing(obj)) {
				return false;
			};
			const type = typeof obj;
			if (type === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Number') {
					try {
						obj = _shared.Natives.numberValueOfCall(obj);
						return (obj === obj); // Not NaN
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Number]') {
					obj = _shared.Natives.numberValueOfCall(obj);
					return (obj === obj); // Not NaN
				};
			} else if (type === 'number') {
				return (obj === obj); // Not NaN
			};
			return false;
		}));

	__Internal__.numberIsFinite = function numberIsFinite(num) {
		/* eslint no-self-compare: "off" */

		if (_shared.Natives.numberIsFinite) {
			return _shared.Natives.numberIsFinite(num);
		} else {
			if (types.isDate(num)) {
				return false;
			};
			// Source: http://es6-features.org/#NumberTypeChecking
			return (num === num) && (num !== Infinity) && (num !== -Infinity);
		}
	};

	__Internal__.numberIsInteger = function numberIsInteger(num) {
		/* eslint no-self-compare: "off" */

		if (num !== num) {
			// NaN
			return false;
		} else if (_shared.Natives.numberIsInteger) {
			return _shared.Natives.numberIsInteger(num);
		} else {
			if (!__Internal__.numberIsFinite(num)) {
				return false;
			};
			const abs = _shared.Natives.mathAbs(num);
			return (abs === _shared.Natives.mathFloor(abs));
		}
	};

	__Internal__.ADD('isInteger', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 8,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is an integer. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isInteger(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			const type = typeof obj;
			if (type === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Number') {
					try {
						obj = _shared.Natives.numberValueOfCall(obj);
						return __Internal__.numberIsInteger(obj);
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Number]') {
					obj = _shared.Natives.numberValueOfCall(obj);
					return __Internal__.numberIsInteger(obj);
				};
			} else if (type === 'number') {
				return __Internal__.numberIsInteger(obj);
			};
			return false;
		}));

	__Internal__.numberIsSafeInteger = function numberIsSafeInteger(num) {
		/* eslint no-self-compare: "off" */

		if (num !== num) {
			// NaN
			return false;
		} else if (_shared.Natives.numberIsSafeInteger) {
			return _shared.Natives.numberIsSafeInteger(num);
		} else {
			if (!__Internal__.numberIsFinite(num)) {
				// Not a finite number
				return false;
			};
			const abs = _shared.Natives.mathAbs(num);
			if (abs !== _shared.Natives.mathFloor(abs)) {
				// Not an integer
				return false;
			};
			return (num >= _shared.Natives.numberMinSafeInteger) && (num <= _shared.Natives.numberMaxSafeInteger);
		}
	};

	__Internal__.ADD('isSafeInteger', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 5,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is an integer that correctly fits into 'Number'. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isSafeInteger(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			const type = typeof obj;
			if (type === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Number') {
					try {
						obj = _shared.Natives.numberValueOfCall(obj);
						return __Internal__.numberIsSafeInteger(obj);
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Number]') {
					obj = _shared.Natives.numberValueOfCall(obj);
					return __Internal__.numberIsSafeInteger(obj);
				};
			} else if (type === 'number') {
				return __Internal__.numberIsSafeInteger(obj);
			};
			return false;
		}));

	__Internal__.ADD('isFinite', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is a finite number. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isFinite(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			const type = typeof obj;
			if (type === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Number') {
					try {
						obj = _shared.Natives.numberValueOfCall(obj);
						return __Internal__.numberIsFinite(obj);
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Number]') {
					obj = _shared.Natives.numberValueOfCall(obj);
					return __Internal__.numberIsFinite(obj);
				};
			} else if (type === 'number') {
				return __Internal__.numberIsFinite(obj);
			};
			return false;
		}));

	__Internal__.ADD('isInfinite', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is an infinite number. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isInfinite(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			const type = typeof obj;
			if (type === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Number') {
					try {
						obj = _shared.Natives.numberValueOfCall(obj);
						return (obj === Infinity) || (obj === -Infinity);
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Number]') {
					obj = _shared.Natives.numberValueOfCall(obj);
					return (obj === Infinity) || (obj === -Infinity);
				};
			} else if (type === 'number') {
				return (obj === Infinity) || (obj === -Infinity);
			};
			return false;
		}));

	__Internal__.numberIsFloat = function numberIsFloat(num) {
		/* eslint no-self-compare: "off" */

		if (num !== num) {
			// NaN
			return false;
		} else {
			return __Internal__.numberIsFinite(num);
		}
	};

	__Internal__.ADD('isFloat', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 5,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is a float. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isFloat(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			const type = typeof obj;
			if (type === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Number') {
					try {
						obj = _shared.Natives.numberValueOfCall(obj);
						return __Internal__.numberIsFloat(obj);
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Number]') {
					obj = _shared.Natives.numberValueOfCall(obj);
					return __Internal__.numberIsFloat(obj);
				};
			} else if (type === 'number') {
				return __Internal__.numberIsFloat(obj);
			};
			return false;
		}));

	// <PRB> JS has no function to test for booleans
	__Internal__.ADD('isBoolean', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 5,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is a boolean. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isBoolean(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			const type = typeof obj;
			if (type === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Boolean') {
					try {
						_shared.Natives.booleanValueOfCall(obj);
						return true;
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Boolean]') {
					return true;
				};
			} else if (type === 'boolean') {
				return true;
			};
			return false;
		}));

	// <PRB> JS has no function to test for dates
	__Internal__.ADD('isDate', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 5,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is a date. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isDate(obj) {
			if (obj && (typeof obj === 'object')) {
				if (obj[_shared.Natives.symbolToStringTag] === 'Date') {
					try {
						_shared.Natives.dateValueOfCall(obj);
						return true;
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Date]') {
					return true;
				};
			};
			return false;
		}));

	// <PRB> JS has no function to test for errors
	__Internal__.ADD('isError', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 5,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is an error. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isError(obj) {
			if (obj && (typeof obj === 'object')) {
				if (obj[_shared.Natives.symbolToStringTag] === 'Error') {
					return types._instanceof(obj, _shared.Natives.windowError);
				};
				// <PRB> Object.prototype.toString ignores custom errors inherited from Error.
				return (_shared.Natives.objectToStringCall(obj) === '[object Error]') || types.isErrorType(obj.constructor);
			};
			return false;
		}));

	__Internal__.ADD('isNaN', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is 'NaN'. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isNaN(obj) {
			/* eslint no-self-compare: "off" */

			if (types.isNothing(obj)) {
				return false;
			};
			const type = typeof obj;
			if (type === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Number') {
					try {
						obj = _shared.Natives.numberValueOfCall(obj);
						// Explanation: NaN is the only value not equal to itself.
						return obj !== obj;
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Number]') {
					obj = _shared.Natives.numberValueOfCall(obj);
					// Explanation: NaN is the only value not equal to itself.
					return obj !== obj;
				};
			} else if (type === 'number') {
				// Explanation: NaN is the only value not equal to itself.
				return obj !== obj;
			};
			return false;
		}));

	__Internal__.ADD('isCallable', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is callable. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isCallable(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			const type = typeof obj;
			if (type === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Function') {
					try {
						_shared.Natives.functionToStringCall(obj);
						return true;
					} catch(o) {
						// Do nothing
					};
				} else if (_shared.Natives.objectToStringCall(obj) === '[object Function]') {
					return true;
				};
			} else if (type === 'function') {
				return true;
			};
			return false;
		}));

	//===================================
	// Arrays
	//===================================

	__Internal__.emptyArray = []; // Avoids to create a new array each time we call 'tools.concat'.
	__Internal__.ADD_TOOL('concat', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					paramarray: {
						type: 'arrayof(any)',
						optional: false,
						description: "Values or arrays to concatenate.",
					},
				},
				returns: 'array',
				description: "Concatenates the arrays (non-arrays are pushed) to a new array then returns that array.",
			}
		//! END_REPLACE()
		, function concat(/*paramarray*/...args) {
			return _shared.Natives.arrayConcatApply(__Internal__.emptyArray, args);
		}));

	__Internal__.ADD_TOOL('unique', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
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
		, function unique(/*paramarray*/...args) {
			let start = 1;
			let comparer = args[0];
			if (!types.isFunction(comparer)) {
				comparer = null;
				start = 0;
			};

			const result = [];

			const argsLen = args.length;

			if (comparer) {
				for (let i = start; i < argsLen; i++) {
					let obj = args[i];
					if (types.isNothing(obj)) {
						continue;
					};
					obj = _shared.Natives.windowObject(obj);
					const objLen = obj.length;
					for (let key1 = 0; key1 < objLen; key1++) {
						if (types.has(obj, key1)) {
							const value1 = obj[key1];
							const resultLen = result.length;
							let found = false;
							for (let key2 = 0; key2 < resultLen; key2++) {
								const res = comparer(value1, result[key2]);
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
				for (let i = start; i < argsLen; i++) {
					let obj = args[i];
					if (types.isNothing(obj)) {
						continue;
					};
					obj = _shared.Natives.windowObject(obj);
					const objLen = obj.length;
					for (let key1 = 0; key1 < objLen; key1++) {
						if (types.has(obj, key1)) {
							const value1 = obj[key1];
							const resultLen = result.length;
							let found = false;
							for (let key2 = 0; key2 < resultLen; key2++) {
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
		}));

	__Internal__.ADD_TOOL('createArray', function(length, /*optional*/defaultValue) {
		length = +length || 0;
		if ((length <= 0) || types.isInfinite(length)) {
			return [];
		};
		const ar = new _shared.Natives.windowArray(length);
		if (arguments.length > 1) {
			if (_shared.Natives.arrayFillCall) {
				_shared.Natives.arrayFillCall(ar, defaultValue);
			} else {
				for (let i = 0; i < length; i++) {
					ar[i] = defaultValue;
				};
			};
		};
		return ar;
	});

	//===================================
	// Stack functions
	//===================================
	// <PRB> JS has no official stack trace. They are non-standardized strings.

	__Internal__.stackToString = function stackToString() {
		let str = '';
		const len = this.length;
		for (let i = 0; i < len; i++) {
			const trace = this[i];
			str += (i + ': function "' + (trace.functionName || '<unknown>') + '" in file "' + (trace.path || '<unknown>') + '" at line ' + (trace.lineNumber < 0 ? '<unknown>' : trace.lineNumber) + ', column ' + (trace.columnNumber < 0 ? '<unknown>' : trace.columnNumber) + '\n');
		};
		return str;
	};

	// NOTE: It removes native functions from the stack
	// <FUTURE> thread level
	__Internal__.parseStackRegEx = /( at )?([^[(@ ]+)?( [[]as [^\]]+[\]])? ?[(@]?(([a-zA-Z]+[:][/][/][/]?[^/]+[/][^: ]+)|(([A-Z][:]|[\\])[\\][^:]+)|([/][^:]+)|eval code)( line ([0-9]+) [>] eval)?(([:])([0-9]+)([:])([0-9]+))?/gm;

	__Internal__.ADD_TOOL('parseStack', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					ex: {
						type: 'error, string',
						optional: false,
						description: "An error object.",
					},
				},
				returns: 'object',
				description: "Parses a stack trace and returns the result.",
			}
		//! END_REPLACE()
		, function parseStack(ex) {
			if (!types.isError(ex) && !types.isString(ex)) {
				throw new types.ParseError("Invalid error object or stack trace.");
			};

			let stack = ex;
			if (types.isError(ex)) {
				stack = ex.stack || null;
			};

			if (!stack) {
				return null;
			};

			__Internal__.parseStackRegEx.lastIndex = 0;
			let call = __Internal__.parseStackRegEx.exec(stack);

			if (!call) {
				return null;
			};

			const calls = [];

			do {
				let functionName,
					pos;

				functionName = call[2] || '';
				pos = functionName.indexOf(' at '); // Not Firefox beginning of function name
				if (pos >= 0) {
					functionName = functionName.slice(pos + 4);
				};
				const rawFunctionName = functionName + (call[3] || '');
				pos = functionName.lastIndexOf('@'); // Firefox beginning of file name
				if (pos >= 0) {
					functionName = functionName.slice(0, pos);
				} else {
					pos = functionName.lastIndexOf('('); // Not Firefox beginning of file name
					if (pos >= 0) {
						functionName = functionName.slice(0, pos);
					};
				};
				pos = functionName.indexOf('[as '); // Chrome name aliases
				if (pos >= 0) {
					functionName = functionName.slice(0, pos);
				};
				pos = functionName.lastIndexOf('/'); // Firefox namespaces
				if (pos >= 0) {
					functionName = functionName.slice(pos + 1);
				};
				pos = functionName.lastIndexOf('.'); // Chrome namespaces
				if (pos >= 0) {
					functionName = functionName.slice(pos + 1);
				};
				functionName = tools.trim(functionName);
				if (functionName.slice(0, 4) === 'new ') { // Chrome "new" operator
					functionName = functionName.slice(4);
				};
				let path = call[5],
					isSystemPath = false;
				if (!path) {
					// File system path
					path = call[6];
					if (!path) {
						path = call[8];
					};
					if (path) {
						isSystemPath = true;
					};
				};
				calls.push({
					rawFunctionName: rawFunctionName,
					functionName: ((functionName === "eval code") ? '' : functionName),
					path: (path || ''),
					lineNumber: types.toInteger(call[10] || call[13] || -1), // Starts at 1. Number -1 is for "unknown".
					columnNumber: types.toInteger(call[15] || -1), // Starts at 1. Number -1 is for "unknown".
					isSystemPath: isSystemPath,
				});

				call = __Internal__.parseStackRegEx.exec(stack);
			} while (call);

			calls.toString = __Internal__.stackToString;

			return calls;
		}));

	__Internal__.ADD_TOOL('getStackTrace', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: null,
				returns: 'object',
				description: "Returns the current stack trace, already parsed.",
			}
		//! END_REPLACE()
		, function getStackTrace() {
			const ex = new _shared.Natives.windowError("");
			const stack = tools.parseStack(ex.stack);
			if (stack) {
				stack.splice(0, 1);  // remove "getStackTrace" call entry
			};
			return stack;
		}));

	//===================================
	// Objects
	//===================================

	__Internal__.ADD('hasInherited', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object.",
					},
					keys: {
						type: 'arrayof(string,Symbol),string,Symbol',
						optional: false,
						description: "Array of keys to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' when the object has or inherits one of the provided keys as own property. Object's prototype is ignored. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function hasInherited(obj, keys) {
			if (!types.isNothing(obj)) {
				obj = _shared.Natives.windowObject(obj);
				do {
					if (obj === _shared.Natives.objectPrototype) {
						break;
					};
					if (types.has(obj, keys)) {
						return true;
					};
					obj = types.getPrototypeOf(obj);
				} while (obj);
			};

			return false;
		}));

	__Internal__.ADD('get', __Internal__.DD_DOC(
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
						type: 'string,Symbol',
						optional: false,
						description: "Attribute name.",
					},
					_default: {
						type: 'any',
						optional: true,
						description: "Default value.",
					},
					inherited: {
						type: 'bool',
						optional: true,
						description: "When 'true', the function look at inherited own properties. Default is 'false'.",
					},
				},
				returns: 'any',
				description: "Returns the value of an own property. If the own property doesn't exist, returns the value of the '_default' parameter.",
			}
		//! END_REPLACE()
		, function get(obj, key, /*optional*/_default, /*optional*/inherited) {
			if (types.isNothing(obj)) {
				return _default;
			};
			obj = _shared.Natives.windowObject(obj);
			const hasKey = (inherited ? types.hasInherited : types.has);
			if (hasKey(obj, key)) {
				return obj[key];
			} else {
				return _default;
			}
		}));

	__Internal__.ADD('getDefault', __Internal__.DD_DOC(
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
					key: {
						type: 'string,Symbol',
						optional: false,
						description: "Attribute name.",
					},
					_default: {
						type: 'any',
						optional: true,
						description: "Default value.",
					},
					inherited: {
						type: 'bool',
						optional: true,
						description: "When 'true', the function look at inherited own properties. Default is 'false'.",
					},
				},
				returns: 'any',
				description: "Returns the value of an own property. If the own property doesn't exist, creates that own property with the value of the '_default' parameter and returns that value.",
			}
		//! END_REPLACE()
		, function getDefault(obj, key, /*optional*/_default, /*optional*/inherited) {
			if (types.isNothing(obj)) {
				return _default;
			};
			obj = _shared.Natives.windowObject(obj);
			const hasKey = (inherited ? types.hasInherited : types.has);
			if (hasKey(obj, key)) {
				return obj[key];
			} else {
				const descriptor = types.getPropertyDescriptor(obj, key);
				if (descriptor && !types.get(descriptor, 'writable') && !types.get(descriptor, 'get') && !types.get(descriptor, 'set') && types.get(descriptor, 'configurable')) {
					descriptor.value = _default;
					types.defineProperty(obj, key, descriptor);
				} else {
					obj[key] = _default;
				};
				return _default;
			}
		}));

	__Internal__.ADD('allKeys', _shared.Natives.objectGetOwnPropertyNames);

	__Internal__.ADD('allSymbols', __Internal__.DD_DOC(
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
				description: "Returns an array of enumerable and non-enumerable own property symbols.",
			}
		//! END_REPLACE()
		, function allSymbols(obj) {
			if (types.isNothing(obj)) {
				return [];
			};
			return _shared.Natives.objectGetOwnPropertySymbols(obj);
		}));

	__Internal__.ADD('allKeysInherited', __Internal__.DD_DOC(
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
				returns: 'arrayof(string)',
				description: "Returns an array of all inherited enumerable and not enumerable property names of an object.",
			}
		//! END_REPLACE()
		, function allKeysInherited(obj) {
			if (types.isNothing(obj)) {
				return [];
			};
			obj = _shared.Natives.windowObject(obj);
			return tools.unique(types.allKeys(obj), types.allKeysInherited(types.getPrototypeOf(obj)));
		}));

	__Internal__.ADD('allSymbolsInherited', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
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
			obj = _shared.Natives.windowObject(obj);
			return tools.unique(types.allSymbols(obj), types.allSymbolsInherited(types.getPrototypeOf(obj)));
		}));

	__Internal__.hasGetOwnPropertyRestrictionOnCaller = false;
	(function() {
		// Edge
		const ctx = {
			getOwnPropertyDescriptor: _shared.Natives.objectGetOwnPropertyDescriptor,
		};
		ctx.f = tools.eval(
			"function() {" +
				"return ctx.getOwnPropertyDescriptor(ctx.f, 'caller');" +
			"}", ctx);
		try {
			ctx.f();
		} catch(o) {
			__Internal__.hasGetOwnPropertyRestrictionOnCaller = true;
		};
	})();

	__Internal__.ADD('hasDefinePropertyEnabled', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: null,
				returns: 'boolean',
				description: "Returns 'true' if 'defineProperty' is enabled. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, (__options__.enableProperties ? function hasDefinePropertyEnabled() {
			return true;
		} : function hasDefinePropertyEnabled() {
			return false;
		})));

	__Internal__.ADD('defineProperty', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 6,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object.",
					},
					name: {
						type: 'string',
						optional: false,
						description: "The property name.",
					},
					descriptor: {
						type: 'object',
						optional: false,
						description: "The property descriptor.",
					},
				},
				returns: 'undefined',
				description: "Defines a property of the object.",
			}
		//! END_REPLACE()
		, function defineProperty(obj, name, descriptor) {
			// <PRB> "Object.defineProperty" stupidly takes inherited properties instead of just own properties. So we fix that because of "Object.prototype".
			descriptor = tools.nullObject(descriptor);
			return _shared.Natives.objectDefineProperty(obj, name, descriptor);
		}));

	__Internal__.ADD('defineProperties', _shared.Natives.objectDefineProperties);

	if (!__Internal__.hasGetOwnPropertyRestrictionOnCaller) {
		__Internal__.ADD('getOwnPropertyDescriptor', _shared.Natives.objectGetOwnPropertyDescriptor);
	} else {
		__Internal__.ADD('getOwnPropertyDescriptor', __Internal__.DD_DOC(
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
						key: {
							type: 'string',
							optional: false,
							description: "Property name.",
						},
					},
					returns: 'object',
					description: "Returns the descriptor of an own property of an object.",
				}
			//! END_REPLACE()
			, function getOwnPropertyDescriptor(obj, key) {
				let desc;
				if (key === 'caller') {
					desc = {
						configurable: false,
						enumerable: false,
						value: null,
						writable: false,
					};
				} else {
					desc = _shared.Natives.objectGetOwnPropertyDescriptor(obj, key);
				};
				return desc;
			}));
	};

	__Internal__.ADD('getPropertyDescriptor', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object.",
					},
					key: {
						type: 'string,Symbol',
						optional: false,
						description: "Property name.",
					},
				},
				returns: 'object',
				description: "Returns the current descriptor of a property of an object.",
			}
		//! END_REPLACE()
		, function getPropertyDescriptor(obj, key) {
			/* eslint no-cond-assign: "off" */
			obj = _shared.Natives.windowObject(obj);
			let proto = obj,
				descriptor = undefined;
			if (key in obj) {
				do {
					descriptor = types.getOwnPropertyDescriptor(proto, key);
				} while (!descriptor && (proto = types.getPrototypeOf(proto)));
			};
			return descriptor;
		}));

	__Internal__.ADD('newInstance', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					type: {
						type: 'type',
						optional: false,
						description: "An object type.",
					},
					properties: {
						type: 'arrayof(any)',
						optional: true,
						description: "Constructor arguments.",
					},
				},
				returns: 'object',
				description: "Instantiates an object from the specified constructor with provided arguments.",
			}
		//! END_REPLACE()
		, function newInstance(type, /*optional*/args) {
			if (!types.isFunction(type)) {
				return null;
			};
			if (args && !types.isArrayLike(args)) {
				return null;
			};
			if (!__Internal__.prototypeIsConfigurable && types.isType(type)) {
				// <PRB> If "prototype" is not configurable, we can't set it to read-only
				// Prototype will get fixed by the constructor if it has been changed. Just make sure it is an object...
				if (!types.isObject(type.prototype)) {
					type.prototype = {};
				};
			};
			let obj;
			if (args && (args.length > 0)) {
				obj = new type(...args);
			} else {
				obj = new type();
			};
			return obj;
		}));

	__Internal__.ADD('getPrototypeOf', _shared.Natives.objectGetPrototypeOf);

	__Internal__.ADD('setPrototypeOf', __Internal__.DD_DOC(
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
					proto: {
						type: 'object',
						optional: false,
						description: "An object defining the new prototype.",
					},
					forceNative: {
						type: 'boolean',
						optional: true,
						description: "Force use of the native function 'Object.setPrototypeOf'. Defaults to 'false'. Always 'true' if object is a function.",
					},
				},
				returns: 'object',
				description: "Returns a clone of the provided object attached to the specified prototype.",
			}
		//! END_REPLACE()
		, function setPrototypeOf(obj, proto, /*optional*/forceNative) {
			// NOTE: Functions can't be created using "createObject".
			// TODO: How to prevent the use of "setPrototypeOf" (which MDN doesn't like) for "functions" ?
			const enabled = (forceNative || types.isFunction(obj));
			if (enabled) {
				return _shared.Natives.objectSetPrototypeOf(obj, proto);
			} else {
				if ((obj === undefined) || (obj === null)) {
					return obj;
				};

				let tmp;
				if (types.isFunction(obj)) {
					throw new global.Error("Browser not supported.");
				} else {
					tmp = tools.createObject(proto, {
						constructor: {
							configurable: true,
							value: obj.constructor,
							writable: true,
						},
					});
					tools.extend(tmp, obj);
				};

				return tmp;
			}
		}));

	__Internal__.ADD('isProtoOf', function isProtoOf(protoObj, obj) {
		// NOTE: Why does this function is part of Object prototype ?
		return _shared.Natives.objectIsPrototypeOfCall(protoObj, obj);
	});

	__Internal__.ADD_TOOL('safeObject', _shared.safeObject);

	__Internal__.ADD('getIn', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					obj: {
						type: 'nullobject',
						optional: false,
						description: "A null object.",
					},
					key: {
						type: 'string,Symbol',
						optional: false,
						description: "Attribute name.",
					},
					_default: {
						type: 'any',
						optional: true,
						description: "Default value.",
					},
				},
				returns: 'any',
				description: "Returns the value of the attribute of an object. If the attribute doesn't exist, returns the value of the '_default' parameter.",
			}
		//! END_REPLACE()
		, function getIn(obj, key, /*optional*/_default) {
			if (types.isNothing(obj)) {
				return _default;
			};
			obj = _shared.Natives.windowObject(obj);
			if (key in obj) {
				return obj[key];
			} else {
				return _default;
			}
		}));

	__Internal__.ADD('hasIn', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					obj: {
						type: 'nullobject',
						optional: false,
						description: "A null object.",
					},
					keys: {
						type: 'arrayof(string,Symbol),string,Symbol',
						optional: false,
						description: "Key(s) to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if one of the specified keys is a property of an object.",
			}
		//! END_REPLACE()
		, function hasIn(obj, keys) {
			if (!types.isNothing(obj)) {
				obj = _shared.Natives.windowObject(obj);
				if (!types.isArray(keys)) {
					return (keys in obj);
				};
				const len = keys.length;
				if (!len) {
					return false;
				};
				for (let i = 0; i < len; i++) {
					if (types.has(keys, i)) {
						const key = keys[i];
						if (key in obj) {
							return true;
						};
					};
				};
			};
			return false;
		}));

	__Internal__.ADD_TOOL('extendProperties', __Internal__.DD_DOC(
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
					paramarray: {
						type: 'object',
						optional: false,
						description: "An object.",
					},
				},
				returns: 'object',
				description: "Extends the first object with owned properties of the other objects.",
			}
		//! END_REPLACE()
		, function extendProperties(obj, /*paramarray*/...args) {
			let result;
			const loopKeys = function _loopKeys(arg, keys) {
				const keysLen = keys.length;
				for (let j = 0; j < keysLen; j++) {
					const key = keys[j];
					const descriptor = types.getOwnPropertyDescriptor(arg, key);
					types.defineProperty(result, key, descriptor);
				};
			};
			if (!types.isNothing(obj)) {
				result = _shared.Natives.windowObject(obj);
				const argsLen = args.length;
				for (let i = 0; i < argsLen; i++) {
					let arg = args[i];
					if (types.isNothing(arg)) {
						continue;
					};
					// Part of "Object.assign" Polyfill from Mozilla Developer Network.
					arg = _shared.Natives.windowObject(arg);
					loopKeys(arg, types.keys(arg));
					loopKeys(arg, types.symbols(arg));
				};
			};
			return result;
		}));

	__Internal__.ADD_TOOL('complete', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					obj: {
						type: 'object',
						optional: false,
						description: "An object.",
					},
					paramarray: {
						type: 'any',
						optional: false,
						description: "An object.",
					},
				},
				returns: 'object',
				description: "Extends the first object with owned properties of the other objects. Existing owned properties are excluded.",
			}
		//! END_REPLACE()
		, function complete(obj, /*paramarray*/...args) {
			let result;
			const loopKeys = function _loopKeys(arg, keys) {
				const keysLen = keys.length; // performance
				for (let j = 0; j < keysLen; j++) {
					const key = keys[j];
					if (!types.has(result, key)) {
						result[key] = arg[key];
					};
				};
			};
			if (!types.isNothing(obj)) {
				result = _shared.Natives.windowObject(obj);
				const argsLen = args.length;
				for (let i = 0; i < argsLen; i++) {
					let arg = args[i];
					if (types.isNothing(arg)) {
						continue;
					};
					// Part of "Object.assign" Polyfill from Mozilla Developer Network.
					arg = _shared.Natives.windowObject(arg);
					loopKeys(arg, types.keys(arg));
					loopKeys(arg, types.symbols(arg));
				};
			};

			return result;
		}));

	__Internal__.ADD_TOOL('completeProperties', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 3,
				obj: {
					type: 'object',
					optional: false,
					description: "An object.",
				},
				params: {
					paramarray: {
						type: 'any',
						optional: false,
						description: "An object.",
					},
				},
				returns: 'object',
				description: "Extends the first object with owned properties of the other objects. Existing owned properties are excluded.",
			}
		//! END_REPLACE()
		, function completeProperties(obj, /*paramarray*/args) {
			let result;
			const loopKeys = function _loopKeys(arg, keys) {
				const keysLen = keys.length; // performance
				for (let j = 0; j < keysLen; j++) {
					const key = keys[j];
					if (!types.has(result, key)) {
						const descriptor = types.getOwnPropertyDescriptor(arg, key);
						types.defineProperty(result, key, descriptor);
					};
				};
			};
			if (!types.isNothing(obj)) {
				result = _shared.Natives.windowObject(obj);
				const argsLen = args.length;
				for (let i = 0; i < argsLen; i++) {
					let arg = args[i];
					if (types.isNothing(arg)) {
						continue;
					};
					// Part of "Object.assign" Polyfill from Mozilla Developer Network.
					arg = _shared.Natives.windowObject(arg);
					loopKeys(arg, types.keys(arg));
					loopKeys(arg, types.symbols(arg));
				};
			};
			return result;
		}));

	__Internal__.ADD('isExtensible', _shared.Natives.objectIsExtensible);

	__Internal__.ADD('isEnumerable', __Internal__.DD_DOC(
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
					key: {
						type: 'string,Symbol',
						optional: false,
						description: "A property name to test for.",
					},
				},
				returns: 'boolean',
				description: "Returns 'true' if the property of the object is enumerable. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isEnumerable(obj, key) {
			return _shared.Natives.objectPropertyIsEnumerableCall(obj, key);
		}));

	__Internal__.ADD('preventExtensions', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					obj: {
						type: 'object,arraylike',
						optional: false,
						description: "An object.",
					},
					depth: {
						type: 'integer',
						optional: true,
						description: "Depth.",
					},
				},
				returns: 'object',
				description: "Prevent extensions of the object returns that same object. Note that it can't be reverted for the moment (ES5).",
			}
		//! END_REPLACE()
		, function preventExtensions(obj, /*optional*/depth) {
			depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
			const isArray = types.isArrayLike(obj);
			const isObject = types.isJsObject || types.isObject;
			if (isArray || isObject(obj)) {
				if (depth >= 0) {
					if (isArray) {
						const len = obj.length;
						for (let i = 0; i < len; i++) {
							if (types.has(obj, i)) {
								types.preventExtensions(obj[i], depth);
							};
						};
					} else {
						const loopKeys = function _loopKeys(keys) {
							const keysLen = keys.length;
							for (let i = 0; i < keysLen; i++) {
								types.preventExtensions(obj[keys[i]], depth);
							};
						};
						loopKeys(types.keys(obj));
						loopKeys(types.symbols(obj));
					};
				};
				_shared.Natives.objectPreventExtensions(obj);
			};
			return obj;
		}));

	__Internal__.ADD('sealObject', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					obj: {
						type: 'object,arraylike',
						optional: false,
						description: "An object.",
					},
					depth: {
						type: 'integer',
						optional: true,
						description: "Depth.",
					},
				},
				returns: 'object',
				description: "Seals the object and returns that same object. Note that it can't be reverted for the moment (ES5).",
			}
		//! END_REPLACE()
		, function sealObject(obj, /*optional*/depth) {
			depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
			const isArray = types.isArrayLike(obj);
			const isObject = types.isJsObject || types.isObject;
			if (isArray || isObject(obj)) {
				if (depth >= 0) {
					if (isArray) {
						const len = obj.length;
						for (let i = 0; i < len; i++) {
							if (types.has(obj, i)) {
								types.sealObject(obj[i], depth);
							};
						};
					} else {
						const loopKeys = function _loopKeys(keys) {
							const keysLen = keys.length;
							for (let i = 0; i < keysLen; i++) {
								types.sealObject(obj[keys[i]], depth);
							};
						};
						loopKeys(types.keys(obj));
						loopKeys(types.symbols(obj));
					};
				};
				return _shared.Natives.objectSeal(obj);
			} else {
				return obj;
			}
		}));

	__Internal__.ADD('isFrozen', _shared.Natives.objectIsFrozen);

	__Internal__.ADD('freezeObject', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					obj: {
						type: 'object,arraylike',
						optional: false,
						description: "An object.",
					},
					depth: {
						type: 'integer',
						optional: true,
						description: "Depth.",
					},
				},
				returns: 'object',
				description: "Freezes the object and returns that same object. Note that it can't be reverted for the moment (ES5).",
			}
		//! END_REPLACE()
		, function freezeObject(obj, /*optional*/depth) {
			depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
			const isArray = types.isArrayLike(obj);
			const isObject = types.isJsObject(obj);
			if (isArray || isObject) {
				if (depth >= 0) {
					if (isArray) {
						const len = obj.length;
						for (let i = 0; i < len; i++) {
							if (types.has(obj, i)) {
								types.freezeObject(obj[i], depth);
							};
						};
					} else {
						const loopKeys = function _loopKeys(keys) {
							const keysLen = keys.length;
							for (let i = 0; i < keysLen; i++) {
								types.freezeObject(obj[keys[i]], depth);
							};
						};
						loopKeys(types.keys(obj));
						loopKeys(types.symbols(obj));
					};
				};
				return _shared.Natives.objectFreeze(obj);
			} else {
				return obj;
			}
		}));

	//===================================
	// Bounds
	//===================================

	__Internal__.ADD('getSafeIntegerBounds', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: null,
				returns: 'object',
				description: "Returns 'len' (in bits), 'min' and 'max' values of a safe integer.",
			}
		//! END_REPLACE()
		, function getSafeIntegerBounds() {
			if (!__Internal__.safeIntegerLen) {
				__Internal__.safeIntegerLen = types.freezeObject(tools.nullObject({
					len: __Internal__.SAFE_INTEGER_LEN,
					min: _shared.Natives.numberMinSafeInteger,
					max: _shared.Natives.numberMaxSafeInteger,
				}));
			};
			return __Internal__.safeIntegerLen;
		}));

	__Internal__.ADD('getBitwiseIntegerBounds', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: null,
				returns: 'object',
				description: "Returns 'len' (in bits), 'min' and 'max' values of a bitwise integer.",
			}
		//! END_REPLACE()
		, function getBitwiseIntegerBounds() {
			if (!__Internal__.bitwiseIntegerLen) {
				__Internal__.bitwiseIntegerLen = types.freezeObject(tools.nullObject({
					len: __Internal__.BITWISE_INTEGER_LEN,
					min: __Internal__.MIN_BITWISE_INTEGER,
					max: __Internal__.MAX_BITWISE_INTEGER,
				}));
			};
			return __Internal__.bitwiseIntegerLen;
		}));

	//===================================
	// UUIDs
	//===================================

	__Internal__.ADD_TOOL('generateUUID', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: null,
				returns: 'string',
				description: "Generates and returns a UUID.",
			}
		//! END_REPLACE()
		, function generateUUID() {
			if (nodeUUID) {
				return nodeUUID();
			} else {
				throw new types.NotAvailable("Package 'uuid' is missing.");
			}
		}
	));

	//===================================
	// Symbols
	//===================================

	__Internal__.ADD('hasSymbolsEnabled', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: null,
				returns: 'bool',
				description: "Returns 'true' if symbols are enabled. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, (__options__.enableSymbols ? function hasSymbolsEnabled() {
			return true;
		} : function hasSymbolsEnabled() {
			return false;
		})));

	__Internal__.ADD('isSymbol', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 3,
				params: {
					obj: {
						type: 'any',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if object is a Symbol. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isSymbol(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			if (typeof obj === 'object') {
				if (obj[_shared.Natives.symbolToStringTag] === 'Symbol') {
					try {
						obj = _shared.Natives.symbolValueOfCall(obj);
					} catch(o) {
						return false;
					};
				} else if (_shared.Natives.objectToStringCall(obj) !== '[object Symbol]') {
					return false;
				} else {
					obj = _shared.Natives.symbolValueOfCall(obj);
				};
			};
			return (typeof obj === 'symbol');
		}));

	if (!__options__.enableSymbols) {
		// eslint-disable-next-line semi-spacing
		__Internal__.globalSymbolsUUID = /*! REPLACE_BY(TO_SOURCE(UUID('Symbol')), true) */ tools.generateUUID() /*! END_REPLACE() */;
	};

	__Internal__.ADD('getSymbol', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 6,
				params: {
					key: {
						type: 'string',
						optional: false,
						description: "Symbol key.",
					},
					isGlobal: {
						type: 'bool',
						optional: true,
						description: "When 'true', gets or creates a global symbol. Otherwise, returns a new unique symbol.",
					},
				},
				returns: 'symbol',
				description: "Gets or creates a Symbol.",
			}
		//! END_REPLACE()
		, (__options__.enableSymbols ? function getSymbol(key, /*optional*/isGlobal) {
			key = _shared.Natives.windowString(key);
			let symbol;
			if (isGlobal) {
				symbol = _shared.Natives.symbolFor(key);
			} else {
				symbol = _shared.Natives.windowSymbol(key);
			};
			return symbol;
		} : function getSymbol(key, /*optional*/isGlobal) {
			const genKey = (isGlobal ? __Internal__.globalSymbolsUUID : tools.generateUUID());
			if (!isGlobal && types.isNothing(key)) {
				return genKey;
			} else {
				return _shared.Natives.windowString(key) + '$' + genKey;
			}
		})
	));

	__Internal__.extractSymbolKeyRegExp = /^Symbol[(]((.|\n)*)[)]$/gm;  // <FUTURE> Per thread

	__Internal__.ADD('getSymbolKey', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 5,
				params: {
					symbol: {
						type: 'symbol',
						optional: false,
						description: "Symbol value.",
					},
				},
				returns: 'string',
				description: "Returns the key of the specified Symbol.",
			}
		//! END_REPLACE()
		, function getSymbolKey(symbol) {
			if (typeof symbol === 'object') {
				symbol = symbol.valueOf();
			};
			if (!types.isSymbol(symbol)) {
				return undefined;
			};
			const key = _shared.Natives.symbolKeyFor(symbol);
			if (types.isNothing(key)) {
				let key = _shared.Natives.symbolToStringCall(symbol);
				__Internal__.extractSymbolKeyRegExp.lastIndex = 0;
				key = __Internal__.extractSymbolKeyRegExp.exec(key);
				return key && key[1];
			} else {
				return key;
			}
		}));

	__Internal__.ADD('symbolIsGlobal', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					symbol: {
						type: 'symbol',
						optional: false,
						description: "Symbol value.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' if 'obj' is a global Symbol. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function symbolIsGlobal(symbol) {
			if (typeof symbol === 'object') {
				symbol = symbol.valueOf();
			};
			if (!types.isSymbol(symbol)) {
				return false;
			};
			return (_shared.Natives.symbolKeyFor(symbol) !== undefined);
		}));

	//===================================
	// "safeObject"
	//===================================

	_shared.TargetSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_TARGET')), true) */ '__DD_TARGET' /*! END_REPLACE() */, true);

	//===================================
	// Functions
	//===================================

	__Internal__.ADD('getFunctionName', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					obj: {
						type: 'function',
						optional: false,
						description: "A function.",
					},
				},
				returns: 'string',
				description: "Returns function name.",
			}
		//! END_REPLACE()
		, function getFunctionName(obj) {
			if (types.isFunction(obj)) {
				if ('name' in obj) {
					return obj.name;
				} else {
					// Internet Explorer
					const str = _shared.Natives.functionToStringCall(obj);
					const result = str.match(/(function\s+)?([^(\s]*)[^(]*\(/);
					return result && result[2] || null;
				}
			} else {
				return null;
			}
		}));

	//===================================
	// Temporary REGISTER (for Doodad.Types)
	//===================================
	__Internal__.tempTypesRegistered = [];

	__Internal__.REGISTER = function REGISTER(type) {
		const name = (types.getTypeName && types.getTypeName(type) || types.getFunctionName(type));
		if (types.isType(type)) {
			type = types.INIT(type);
		};
		types[name] = type;
		__Internal__.tempTypesRegistered.push(type);
		return type;
	};

	//===================================
	// Box/Unbox
	//===================================

	_shared.OriginalValueSymbol =  types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ORIGINAL_VALUE')), true) */ '__DD_ORIGINAL_VALUE' /*! END_REPLACE() */, true);

	__Internal__.ADD('box', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
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
		, function box(value) {
			if (types._instanceof(this, types.box)) {
				if (types._instanceof(value, types.box)) {
					value.setAttributes(this);
					value = value[_shared.OriginalValueSymbol];
				};
				this[_shared.OriginalValueSymbol] = value;
				return this;
			} else {
				return new types.box(value);
			}
		}));

	tools.extend(types.box.prototype, {
		setAttributes: function setAttributes(dest, /*optional*/override) {
			const loopKeys = function _loopKeys(self, keys) {
				const keysLen = keys.length;
				for (let i = 0; i < keysLen; i++) {
					const key = keys[i];
					if ((key !== _shared.OriginalValueSymbol) && (override || !types.has(dest, key))) {
						dest[key] = self[key];
					};
				};
			};
			loopKeys(this, types.keys(this));
			loopKeys(this, types.symbols(this));
			return dest;
		},
		valueOf: function valueOf() {
			return this[_shared.OriginalValueSymbol];
		},
		setValue: function setValue(value, /*optional*/override) {
			// NOTE: "OriginalValueSymbol" is immutable
			const type = this.constructor;
			const newBox = new type(value);
			return this.setAttributes(newBox, override);
		},
		clone: function clone() {
			return this.setValue(this[_shared.OriginalValueSymbol]);
		},
	});

	__Internal__.ADD('unbox', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
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
			return (types._instanceof(value, types.box) ? value.valueOf() : value);
		}));

	//===================================
	// Reserved attributes
	//===================================

	// TODO: Find another way
	_shared.reservedAttributes = tools.nullObject({
		//name: null,
		//apply: null,
		//call: null,
		//bind: null,
		arguments: null,
		caller: null,
		length: null,
		prototype: null,

		//__proto__: null,   must be handled conditionally
		constructor: null,

		__defineGetter__: null,
		__lookupGetter__: null,
		__defineSetter__: null,
		__lookupSetter__: null,
	});

	//===================================
	// Clone
	//===================================

	_shared.isClonable = function isClonable(obj, /*optional*/cloneFunctions) {
		// NOTE: This function will get overriden when "Doodad.js" is loaded.
		// NOTE: Don't forget to also change '_shared.clone' !!!
		return types.isArray(obj) || types.isObject(obj) || types._instanceof(obj, [types.Map, types.Set]) || (!!cloneFunctions && types.isCustomFunction(obj));
	};

	_shared.clone = function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked, /*options*/keepNonClonables) {
		// NOTE: This function will get overriden when "Doodad.js" is loaded.
		// NOTE: Don't forget to also change '_shared.isClonable' !!!

		let result;

		if (types.isNothing(obj)) {
			result = obj;
		} else {
			const isArray = types.isArray(obj);
			depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
			cloneFunctions = (+cloneFunctions || 0) - 1;  // null|undefined|true|false|NaN|Infinity

			if (isArray) {
				if (depth >= 0) {
					result = tools.createArray(obj.length);
					const len = obj.length;
					for (let key = 0; key < len; key++) {
						if (types.has(obj, key)) {
							result[key] = _shared.clone(obj[key], depth, cloneFunctions, keepUnlocked, keepNonClonables);
						};
					};
				} else {
					result = _shared.Natives.arraySliceCall(obj, 0);
				};
			} else if ((cloneFunctions >= 0) && types.isCustomFunction(obj)) {
				result = tools.eval(_shared.Natives.functionToStringCall(obj));
			} else if (types.isObject(obj)) {
				result = tools.createObject(types.getPrototypeOf(obj));
			} else if (types._instanceof(obj, [types.Map, types.Set])) {
				result = new obj.constructor(obj);
			} else if (keepNonClonables) {
				return obj;
			} else {
				throw new types.Error("Object is not clonable.");
			};

			// Copy properties
			const keys = tools.append(types.allKeys(obj), types.allSymbols(obj)),
				arrayLen = isArray && obj.length,
				props = {};
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];
				if (isArray) {
					if (key === 'length') {
						continue;
					};
					const tmp = _shared.Natives.windowNumber(key);
					if ((tmp >= 0) && (tmp < arrayLen)) {
						// Skip array items
						continue;
					};
				};
				let prop = types.getOwnPropertyDescriptor(result, key);
				if (!prop || prop.configurable) {
					prop = types.getOwnPropertyDescriptor(obj, key);
					if (types.has(prop, 'value') && (depth >= 0)) {
						prop.value = _shared.clone(prop.value, depth, cloneFunctions, keepUnlocked, keepNonClonables);
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

	__Internal__.ADD('isClonable', __Internal__.DD_DOC(
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

	__Internal__.ADD('clone', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 10,
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
					keepNonClonables: {
						type: 'bool',
						optional: true,
						description: "When 'true', will keep non-clonable values instead of throwing. When 'false', will throw an error on a non-clonable value. Default is 'false'.",
					},
				},
				returns: 'any',
				description: "Clones a value.",
			}
		//! END_REPLACE()
		, function clone(obj, /*optional*/depth, /*optional*/cloneFunctions, /*optional*/keepUnlocked, /*optional*/keepNonClonables) {
			return _shared.clone(obj, depth, cloneFunctions, keepUnlocked, keepNonClonables);
		}));

	//===================================
	// Type functions
	//===================================

	__Internal__.ADD('INIT', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					type: {
						type: 'type',
						optional: false,
						description: "A Doodad type.",
					},
					args: {
						type: 'arrayof(any)',
						optional: true,
						description: "Arguments of the constructor.",
					},
				},
				returns: 'type',
				description: "Initialize a Doodad type. Returns that type.",
			}
		//! END_REPLACE()
		, function INIT(type, /*optional*/args) {
			if (types.isInitialized(type)) {
				return type;
			} else {
				type = type[types.NewSymbol](args) || type;
				if (types.isSingleton(type)) {
					type = types.newInstance(type, args);
				};
				return type;
			}
		}));

	// "types.DESTROY" Hook
	_shared.DESTROY = function DESTROY(obj) {
		if (types.isInitialized(obj)) {
			types.invoke(obj, '_delete', null, _shared.SECRET);
		};
	};

	__Internal__.ADD('DESTROY', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					obj: {
						type: 'object,type',
						optional: false,
						description: "A Doodad object or type.",
					},
				},
				returns: 'undefined',
				description: "Destroys a Doodad object or type.",
			}
		//! END_REPLACE()
		, function DESTROY(obj) {
			_shared.DESTROY(obj);
		}));


	// "types.DESTROYED" Hook
	_shared.DESTROYED = function DESTROYED(obj) {
		return types.isNothing(obj) || ( !!(types.isLike(obj, types.Type) && !types.get(obj, __Internal__.symbolInitialized)) );
	};

	__Internal__.ADD('DESTROYED', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					obj: {
						type: 'object,type',
						optional: false,
						description: "A Doodad object or type.",
					},
				},
				returns: 'bool',
				description: "Returns 'true' is object is destroyed. Otherwise, returns 'false'.",
			}
		//! END_REPLACE()
		, function DESTROYED(obj) {
			return _shared.DESTROYED(obj);
		}));

	__Internal__.ADD('isInitialized', function isInitialized(obj) {
		return !!(types.isLike(obj, types.Type) && types.get(obj, __Internal__.symbolInitialized));
	});

	__Internal__.ADD('isType', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					obj: {
						type: 'object',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'boolean',
				description: "Returns 'true' when object is a Doodad type (created using 'Types.createType'). Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isType(obj) {
			return types.isFunction(obj) && types.has(obj, __Internal__.symbolIsType);
		}));

	__Internal__.ADD('isErrorType', function isErrorType(obj) {
		return types.isType(obj) && !!obj[__Internal__.symbolIsErrorType];
	});

	__Internal__.ADD('isJsFunction', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 5,
				params: {
					obj: {
						type: 'object',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'boolean',
				description: "Returns 'true' if object is a function, and not a JS class and not a Doodad type. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isJsFunction(obj) {
			return types.isFunction(obj) && !types.isJsClass(obj) && !types.isType(obj) && !types.isErrorType(obj);
		}));

	__Internal__.ADD('isJsObject', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					obj: {
						type: 'object',
						optional: false,
						description: "An object to test for.",
					},
				},
				returns: 'boolean',
				description: "Returns 'true' if object is a normal Javascript object, so not created from a Doodad type. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isJsObject(obj) {
			return types.isObject(obj) && !types.getType(obj);
		}));

	_shared.getUUID = function getUUID(obj) {
		if (!types.isObjectLike(obj)) {
			return null;
		};
		let type;
		if (types.isFunction(obj)) {
			type = obj;
		} else {
			type = obj.constructor;
			if (!types.isFunction(type)) {
				// Invalid constructor
				return null;
			};
		};
		let uuid;
		const isType = types.isType(type);
		if (isType) {
			uuid = types.get(type, __Internal__.symbolTypeUUID);
			// TODO: Is the following necessary ?
			//if (uuid && (types.get(type.prototype, __Internal__.symbolTypeUUID) !== uuid)) {
			//	// Invalid type
			//	return null;
			//};
		} else {
			uuid = types.get(type, _shared.UUIDSymbol);
			// TODO: Is the following necessary ?
			//if (uuid && (types.get(type.prototype, _shared.UUIDSymbol) !== uuid)) {
			//	// Invalid type
			//	return null;
			//};
		};
		if (uuid && !isType && !types.isNativeFunction(type) && !types.isErrorType(type)) {
			uuid = /*! REPLACE_BY(TO_SOURCE(UUID('JS_TYPE')), true) */ '__JS_TYPE__' /*! END_REPLACE() */ + uuid;
		};
		return (uuid || null);
	};

	__Internal__.ADD('baseof', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 8,
				params: {
					base: {
						type: 'type,arrayof(type)',
						optional: false,
						description: "A type.",
					},
					type: {
						type: 'type',
						optional: false,
						description: "A type.",
					},
				},
				returns: 'boolean',
				description: "Returns 'true' if a type derivates from base. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function baseof(base, type) {
			if (!types.isFunction(type)) {
				return false;
			};
			type = _shared.Natives.windowObject(type);
			let crossRealm = !(type instanceof _shared.Natives.windowFunction);
			if (types.isArray(base)) {
				let i = 0;
				if (!crossRealm) {
					for (; i < base.length; i++) {
						if (types.has(base, i)) {
							let b = base[i];
							if (types.isFunction(b)) {
								b = _shared.Natives.windowObject(b);
								if (b instanceof _shared.Natives.windowFunction) {
									if (types.isProtoOf(b, type)) {
										return true;
									};
								} else {
									// Cross-realm
									crossRealm = true;
									break;
								};
							};
						};
					};
				};
				if (crossRealm) {
					//type = types.getPrototypeOf(type);
					type = (type.prototype ? types.getPrototypeOf(type.prototype) : null);
					type = (type && (type.constructor !== type) ? type.constructor : null);
					const start = i;
					while (!types.isNothing(type)) {
						const tuuid = _shared.getUUID(type);
						for (; i < base.length; i++) {
							if (types.has(base, i)) {
								const b = base[i];
								if (types.isFunction(b)) {
									if (tuuid) {
										if (tuuid === _shared.getUUID(b)) {
											return true;
										};
									} else {
										if (type === b) {
											return true;
										};
									};
								};
							};
						};
						//type = types.getPrototypeOf(type);
						type = (type.prototype ? types.getPrototypeOf(type.prototype) : null);
						type = (type && (type.constructor !== type) ? type.constructor : null);
						i = start;
					};
				};
			} else if (types.isFunction(base)) {
				base = _shared.Natives.windowObject(base);
				if (!crossRealm) {
					if (base instanceof _shared.Natives.windowFunction) {
						if (types.isProtoOf(base, type)) {
							return true;
						};
					} else {
						// Cross-realm
						crossRealm = true;
					};
				};
				if (crossRealm) {
					const uuid = _shared.getUUID(base);
					//type = types.getPrototypeOf(type);
					type = (type.prototype ? types.getPrototypeOf(type.prototype) : null);
					type = (type && (type.constructor !== type) ? type.constructor : null);
					while (!types.isNothing(type)) {
						const tuuid = _shared.getUUID(type);
						if (tuuid) {
							if (tuuid === uuid) {
								return true;
							};
						} else {
							if (type === base) {
								return true;
							};
						};
						//type = types.getPrototypeOf(type);
						type = (type.prototype ? types.getPrototypeOf(type.prototype) : null);
						type = (type && (type.constructor !== type) ? type.constructor : null);
					};
				};
			};

			return false;
		}));

	__Internal__.ADD('is', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 7,
				params: {
					obj: {
						type: 'object,type',
						optional: false,
						description: "An object to test for. A type can be provided.",
					},
					type: {
						type: 'type,object,arrayof(type,object)',
						optional: false,
						description: "A type. If an object is provided, its type will be used.",
					},
				},
				returns: 'boolean',
				description: "Returns 'true' if object is from the specified type. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function is(obj, type) {
			if (types.isNothing(obj)) {
				return false;
			};
			obj = _shared.Natives.windowObject(obj);
			if (!types.isFunction(obj)) {
				obj = obj.constructor;
				if (!types.isFunction(obj)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj);
			};
			let crossRealm = !(obj instanceof _shared.Natives.windowFunction);
			if (types.isArray(type)) {
				let i = 0;
				if (!crossRealm) {
					for (; i < type.length; i++) {
						if (types.has(type, i)) {
							let t = type[i];
							if (!types.isNothing(t)) {
								t = _shared.Natives.windowObject(t);
								if (!types.isFunction(t)) {
									t = t.constructor;
									if (!types.isFunction(t)) {
										continue;
									};
									t = _shared.Natives.windowObject(t);
								};
								if (t instanceof _shared.Natives.windowFunction) {
									if (obj === t) {
										return true;
									};
								} else {
									// Cross-realm
									crossRealm = true;
									break;
								};
							};
						};
					};
				};
				if (crossRealm) {
					const uuid = _shared.getUUID(obj);
					if (uuid) {
						for (; i < type.length; i++) {
							if (types.has(type, i)) {
								let t = type[i];
								if (!types.isNothing(t)) {
									t = _shared.Natives.windowObject(t);
									if (!types.isFunction(t)) {
										t = t.constructor;
										if (!types.isFunction(t)) {
											continue;
										};
									};
									if (uuid === _shared.getUUID(t)) {
										return true;
									};
								};
							};
						};
					};
				};
			} else if (!types.isNothing(type)) {
				type = _shared.Natives.windowObject(type);
				if (!types.isFunction(type)) {
					type = type.constructor;
					if (!types.isFunction(type)) {
						return false;
					};
					type = _shared.Natives.windowObject(type);
				};
				if (!crossRealm) {
					if (type instanceof _shared.Natives.windowFunction) {
						if (obj === type) {
							return true;
						};
					} else {
						// Cross-realm
						crossRealm = true;
					};
				};
				if (crossRealm) {
					const tuuid = _shared.getUUID(type);
					if (tuuid) {
						if (tuuid === _shared.getUUID(obj)) {
							return true;
						};
					} else {
						if (type === obj) {
							return true;
						};
					};
				};
			};

			return false;
		}));

	__Internal__.ADD('isLike', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 9,
				params: {
					obj: {
						type: 'object,type',
						optional: false,
						description: "An object to test for. A type can be provided.",
					},
					type: {
						type: 'type,object,arrayof(type,object)',
						optional: false,
						description: "A Doodad type. If an object is provided, its type will be used.",
					},
				},
				returns: 'boolean',
				description: "Returns 'true' if object is from or inherits from the specified type. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isLike(obj, type) {
			if (types.isNothing(obj)) {
				return false;
			};
			obj = _shared.Natives.windowObject(obj);
			if (!types.isFunction(obj)) {
				obj = obj.constructor;
				if (!types.isFunction(obj)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj);
			};
			let crossRealm = !(obj instanceof _shared.Natives.windowFunction);
			if (types.isArray(type)) {
				let i = 0;
				if (!crossRealm) {
					for (; i < type.length; i++) {
						if (types.has(type, i)) {
							let t = type[i];
							if (!types.isNothing(t)) {
								t = _shared.Natives.windowObject(t);
								if (!types.isFunction(t)) {
									t = t.constructor;
									if (!types.isFunction(t)) {
										continue;
									};
									t = _shared.Natives.windowObject(t);
								};
								if (t instanceof _shared.Natives.windowFunction) {
									if ((obj === t) || types.isProtoOf(t, obj)) {
										return true;
									};
								} else {
									// Cross-realm
									crossRealm = true;
									break;
								};
							};
						};
					};
				};
				if (crossRealm) {
					const start = i;
					do {
						const uuid = _shared.getUUID(obj);
						for (; i < type.length; i++) {
							if (types.has(type, i)) {
								let t = type[i];
								if (!types.isNothing(t)) {
									t = _shared.Natives.windowObject(t);
									if (!types.isFunction(t)) {
										t = t.constructor;
										if (!types.isFunction(t)) {
											continue;
										};
									};
									const tuuid = _shared.getUUID(t);
									if (tuuid) {
										if (tuuid === uuid) {
											return true;
										};
									} else {
										if (obj === type) {
											return true;
										};
									};
								};
							};
						};
						//obj = types.getPrototypeOf(obj);
						obj = (obj.prototype ? types.getPrototypeOf(obj.prototype) : null);
						obj = obj && obj.constructor;
						i = start;
					} while (!types.isNothing(obj));
				};
			} else if (!types.isNothing(type)) {
				type = _shared.Natives.windowObject(type);
				if (!types.isFunction(type)) {
					type = type.constructor;
					if (!types.isFunction(type)) {
						return false;
					};
					type = _shared.Natives.windowObject(type);
				};
				if (!crossRealm) {
					if (type instanceof _shared.Natives.windowFunction) {
						if ((obj === type) || types.isProtoOf(type, obj)) {
							return true;
						};
					} else {
						// Cross-realm
						crossRealm = true;
					};
				};
				if (crossRealm) {
					const tuuid = _shared.getUUID(type);
					do {
						if (tuuid) {
							if (tuuid === _shared.getUUID(obj)) {
								return true;
							};
						} else {
							if (obj === type) {
								return true;
							};
						};
						//obj = types.getPrototypeOf(obj);
						obj = (obj.prototype ? types.getPrototypeOf(obj.prototype) : null);
						obj = obj && obj.constructor;
					} while (!types.isNothing(obj));
				};
			};

			return false;
		}));

	__Internal__.ADD('_instanceof', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 10,
				params: {
					obj: {
						type: 'object',
						optional: false,
						description: "An object.",
					},
					type: {
						type: 'type,arrayof(type)',
						optional: false,
						description: "A type.",
					},
				},
				returns: 'boolean',
				description: "Returns 'true' if an object inherits from type. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function _instanceof(obj, type) {
			// Uses prototypes chain like the operator "instanceof", but doesn't raise an exception when 'type' is not a type.
			// NOTE: With Doodad objects it is recommended to use this function instead of the operator.
			if (types.isNothing(obj)) {
				return false;
			};
			obj = _shared.Natives.windowObject(obj);
			// NOTE: "null objects" will appear "cross-realm"
			let crossRealm = !(obj instanceof _shared.Natives.windowObject);
			if (types.isArray(type)) {
				let i = 0;
				if (!crossRealm) {
					for (; i < type.length; i++) {
						if (types.has(type, i)) {
							const t = type[i];
							if (types.isFunction(t)) {
								if (_shared.Natives.windowObject(t) instanceof _shared.Natives.windowFunction) {
									const hasInstance = t[_shared.Natives.symbolHasInstance];
									if (!types.isNothing(hasInstance) && (hasInstance !== _shared.Natives.functionHasInstance)) {
										// "hasInstance" has been messed, switch to cross-realm mode
										crossRealm = true;
										break;
									} else if (obj instanceof t) {
										return true;
									};
								} else {
									// Cross-realm
									crossRealm = true;
									break;
								};
							};
						};
					};
				};
				if (crossRealm) {
					const start = i;
					do {
						const uuid = _shared.getUUID(obj);
						for (; i < type.length; i++) {
							if (types.has(type, i)) {
								const t = type[i];
								if (types.isFunction(t)) {
									const tuuid = _shared.getUUID(t);
									if (tuuid) {
										if (tuuid === uuid) {
											return true;
										};
									} else {
										if (obj.constructor === type) {
											return true;
										};
									};
								};
							};
						};
						obj = types.getPrototypeOf(obj);
						i = start;
					} while (!types.isNothing(obj));
				};
			} else if (types.isFunction(type)) {
				if (!crossRealm) {
					if (_shared.Natives.windowObject(type) instanceof _shared.Natives.windowFunction) {
						const hasInstance = type[_shared.Natives.symbolHasInstance];
						if (!types.isNothing(hasInstance) && (hasInstance !== _shared.Natives.functionHasInstance)) {
							// "hasInstance" has been messed, switch to cross-realm mode
							crossRealm = true;
						} else {
							return (obj instanceof type);
						};
					} else {
						// Cross-realm
						crossRealm = true;
					};
				};
				if (crossRealm) {
					const tuuid = _shared.getUUID(type);
					do {
						if (tuuid) {
							if (tuuid === _shared.getUUID(obj)) {
								return true;
							};
						} else {
							if (obj.constructor === type) {
								return true;
							};
						};
						obj = types.getPrototypeOf(obj);
					} while (!types.isNothing(obj));
				};
			};

			return false;
		}));

	__Internal__.ADD('isSingleton', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					obj: {
						type: ['object', 'type'],
						optional: false,
						description: "A Doodad object, or its type.",
					},
				},
				returns: 'boolean',
				description: "Returns 'true' if a object is a singleton. Returns 'false' otherwise.",
			}
		//! END_REPLACE()
		, function isSingleton(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			obj = types.getType(obj);
			if (!obj) {
				return false;
			};
			return !!obj[__Internal__.symbol$IsSingleton];
		}));


	__Internal__.ADD('getType', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					obj: {
						type: ['object', 'type'],
						optional: false,
						description: "A Doodad object, or a Doodad type.",
					},
				},
				returns: 'type',
				description: "Returns the type of an object. Returns 'null' if not a Doodad object.",
			}
		//! END_REPLACE()
		, function getType(obj) {
			if (types.isNothing(obj)) {
				return null;
			};
			obj = _shared.Natives.windowObject(obj);
			if (types.isType(obj)) {
				return obj;
			};
			const ctr = obj.constructor;
			if (types.isType(ctr) || types.isErrorType(ctr)) {
				return ctr;
			};
			return null;
		}));

	__Internal__.ADD('getTypeName', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 3,
				params: {
					obj: {
						type: ['object', 'type'],
						optional: false,
						description: "A Doodad object, or a Doodad type.",
					},
				},
				returns: 'string',
				description: "Returns the name of the type of an object. Returns 'null' if not a Doodad object.",
			}
		//! END_REPLACE()
		, function getTypeName(obj) {
			obj = _shared.Natives.windowObject(obj);
			obj = types.getType(obj);
			if (!obj) {
				return null;
			};
			return types.getFunctionName(obj) || null;
		}));

	__Internal__.ADD('getBase', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 3,
				params: {
					obj: {
						type: ['object', 'type'],
						optional: false,
						description: "A Doodad object, or a Doodad type.",
					},
				},
				returns: 'type',
				description: "Returns the base type of an object. Returns 'null' if not a Doodad object.",
			}
		//! END_REPLACE()
		, function getBase(obj) {
			obj = _shared.Natives.windowObject(obj);
			obj = types.getType(obj);
			if (!obj) {
				return null;
			};
			obj = (obj.prototype ? types.getPrototypeOf(obj.prototype) : null);
			if (!obj) {
				return null;
			};
			return obj.constructor;
		}));

	_shared.invoke = function invoke(obj, fn, /*optional*/args, /*optional*/secret, /*optional*/thisObj) {
		if (types.isString(fn) || types.isSymbol(fn)) {
			fn = types.getAttribute(obj, fn, {direct: true}, secret);
		};
		if (types.isNothing(thisObj)) {
			thisObj = obj;
		};
		if (args) {
			return fn.apply(thisObj, args);
		} else {
			return fn.call(thisObj);
		}
	};

	__Internal__.ADD('invoke', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 4,
				params: {
					obj: {
						type: 'object',
						optional: false,
						description: "The object from where comes 'fn'.",
					},
					fn: {
						type: 'string,Symbol,function',
						optional: false,
						description: "Method name or function.",
					},
					args: {
						type: 'arrayof(any)',
						optional: true,
						description: "Method or function arguments.",
					},
					secret: {
						type: 'any',
						optional: true,
						description: "The secret.",
					},
					thisObj: {
						type: 'any',
						optional: true,
						description: "The value to pass to 'this'. Default is the 'obj' argument.",
					},
				},
				returns: 'any',
				description: "Invokes a method or a function as from inside the object.",
			}
		//! END_REPLACE()
		, function invoke(obj, fn, /*optional*/args, /*optional*/secret, /*optional*/thisObj) {
			return _shared.invoke(obj, fn, args, secret, thisObj);
		}));

	_shared.getAttribute = function getAttribute(obj, attr, /*optional*/options, /*optional*/secret) {
		return obj[attr];
	};

	__Internal__.ADD('getAttribute', __Internal__.DD_DOC(
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
					attr: {
						type: 'string,Symbol',
						optional: false,
						description: "Attribute name.",
					},
					options: {
						type: 'object',
						optional: true,
						description: "Options",
					},
					secret: {
						type: 'any',
						optional: true,
						description: "Secret.",
					},
				},
				returns: 'any',
				description: "Gets the value of an attribute as from inside the object.",
			}
		//! END_REPLACE()
		, function getAttribute(obj, attr, /*optional*/options, /*optional*/secret) {
			return _shared.getAttribute(obj, attr, options, secret);
		}));

	_shared.getAttributes = function getAttributes(obj, attrs, /*optional*/options, /*optional*/secret) {
		const attrsLen = attrs.length,
			result = {};
		const optsDirect = (types.get(options, 'direct', false) ? options : tools.extend({}, options, {direct: true}));
		for (let i = 0; i < attrsLen; i++) {
			if (types.has(attrs, i)) {
				const attr = attrs[i];
				result[attr] = _shared.getAttribute(obj, attr, optsDirect, secret);
			};
		};
		return result;
	};

	__Internal__.ADD('getAttributes', __Internal__.DD_DOC(
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
					attrs: {
						type: 'arrayof(string,Symbol)',
						optional: false,
						description: "Attribute names.",
					},
					options: {
						type: 'object',
						optional: true,
						description: "Options",
					},
					secret: {
						type: 'any',
						optional: true,
						description: "Secret.",
					},
				},
				returns: 'object',
				description: "Gets the value of multiple attributes as from inside the object.",
			}
		//! END_REPLACE()
		, function getAttributes(obj, attrs, /*optional*/options, /*optional*/secret) {
			return _shared.getAttributes(obj, attrs, options, secret);
		}));

	_shared.setAttribute = function setAttribute(obj, attr, value, /*optional*/options, /*optional*/secret) {
		options = options && tools.nullObject(options);
		const hasOwn = types.has(obj, attr),
			hasAll = options && ('all' in options),
			newDescriptor = !!options && (('configurable' in options) || ('enumerable' in options) || ('writable' in options) || hasAll);
		let descriptor = types.getPropertyDescriptor(obj, attr);
		const descConfigurable = !hasOwn || !descriptor || types.get(descriptor, 'configurable', false),
			descEnumerable = !descriptor || types.get(descriptor, 'enumerable', false),
			descWritable = !descriptor || types.get(descriptor, 'writable', false),
			descGet = types.get(descriptor, 'get'),
			descSet = types.get(descriptor, 'set');
		if (descSet && !newDescriptor) {
			if (!options || !options.ignoreWhenSame || !descGet || (descGet.call(obj) !== value)) {
				descSet.call(obj, value);
			};
		} else if (descGet && !newDescriptor) {
			if (!options || (!options.ignoreWhenReadOnly && (!options.ignoreWhenSame || (descGet.call(obj) !== value)))) {
				// NOTE: Use native error because something might be wrong
				throw new _shared.Natives.windowError(tools.format("Attribute '~0~' is read-only.", [attr]));
			};
		} else if (hasOwn && descWritable && (!newDescriptor || ((!!options.configurable === descConfigurable) && (!!options.enumerable === descEnumerable) && (!!options.writable === descWritable)))) {
			if (!options || !options.ignoreWhenSame || (obj[attr] !== value)) {
				obj[attr] = value;
			};
		} else if (descConfigurable) {
			if (newDescriptor && types.hasDefinePropertyEnabled()) {
				if (hasAll) {
					descriptor = {
						configurable: ('configurable' in options ? options.configurable : options.all),
						enumerable: ('enumerable' in options ? options.enumerable : options.all),
						writable: ('writable' in options ? options.writable : options.all),
					};
				} else {
					descriptor = options;
				};
			} else if (!descriptor) {
				descriptor = {configurable: true, enumerable: true, writable: true};
			};
			descriptor.value = value;
			types.defineProperty(obj, attr, descriptor);
		} else {
			if (!newDescriptor || !options || (!options.ignoreWhenReadOnly && (!options.ignoreWhenSame || (obj[attr] !== value)))) {
				// NOTE: Use native error because something might be wrong
				throw new _shared.Natives.windowError(tools.format("Attribute '~0~' is read-only.", [attr]));
			};
		};
		return value;
	};

	__Internal__.ADD('setAttribute', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 11,
				params: {
					obj: {
						type: 'object',
						optional: false,
						description: "An object.",
					},
					attr: {
						type: 'string,Symbol',
						optional: false,
						description: "Attribute name.",
					},
					value: {
						type: 'any',
						optional: false,
						description: "New value.",
					},
					options: {
						type: 'object',
						optional: true,
						description: "Options.",
					},
					secret: {
						type: 'any',
						optional: true,
						description: "Secret.",
					},
				},
				returns: 'object',
				description: "Sets the value of an attribute as from inside the object.",
			}
		//! END_REPLACE()
		, function setAttribute(obj, attr, value, /*optional*/options, /*optional*/secret) {
			return _shared.setAttribute(obj, attr, value, options, secret);
		}));

	_shared.setAttributes = function setAttributes(obj, values, /*optional*/options, /*optional*/secret) {
		const loopKeys = function _loopKeys(keys) {
			const keysLen = keys.length;
			const optsDirect = (types.get(options, 'direct', false) ? options : tools.extend({}, options, {direct: true}));
			for (let i = 0; i < keysLen; i++) {
				const key = keys[i];
				_shared.setAttribute(obj, key, values[key], optsDirect, secret);
			};
		};
		loopKeys(types.keys(values));
		loopKeys(types.symbols(values));
		return values;
	};

	__Internal__.ADD('setAttributes', __Internal__.DD_DOC(
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
					values: {
						type: 'object',
						optional: false,
						description: "name/value pairs.",
					},
					options: {
						type: 'object',
						optional: true,
						description: "Options.",
					},
					secret: {
						type: 'any',
						optional: true,
						description: "Secret.",
					},
				},
				returns: 'object',
				description: "Sets the value of multiple attributes as from inside the object.",
			}
		//! END_REPLACE()
		, function setAttributes(obj, values, /*optional*/options, /*optional*/secret) {
			return _shared.setAttributes(obj, values, options, secret);
		}));

	//===================================
	// "createType"
	//===================================

	__Internal__.symbolIsType = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_IS_TYPE')), true) */ '__DD_IS_TYPE' /*! END_REPLACE() */, true);
	__Internal__.symbolTypeUUID = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_TYPE_UUID')), true) */ '__DD_TYPE_UUID' /*! END_REPLACE() */, true);
	__Internal__.symbolInitialized = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_INITIALIZED')), true) */ '__DD_INITIALIZED' /*! END_REPLACE() */, true);
	__Internal__.symbol$IsSingleton = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_$IS_SINGLETON')), true) */ '__DD_$IS_SINGLETON' /*! END_REPLACE() */, true);
	__Internal__.symbolSingleton = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_SINGLETON')), true) */ '__DD_SINGLETON' /*! END_REPLACE() */, true);

	_shared.UUIDSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_JS_TYPE_UUID')), true) */ '__DD_JS_TYPE_UUID' /*! END_REPLACE() */, true);
	_shared.SuperEnabledSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_SUPER_ENABLED')), true) */ '__DD_SUPER_ENABLED' /*! END_REPLACE() */, true);
	_shared.EnumerableSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_ENUMERABLE')), true) */ '__DD_ENUMERABLE' /*! END_REPLACE() */, true);
	_shared.ReadOnlySymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_READ_ONLY')), true) */ '__DD_READ_ONLY' /*! END_REPLACE() */, true);
	_shared.ConfigurableSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CONFIGURABLE')), true) */ '__DD_CONFIGURABLE' /*! END_REPLACE() */, true);
	_shared.GetterSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_GETTER')), true) */ '__DD_GETTER' /*! END_REPLACE() */, true);
	_shared.SetterSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_SETTER')), true) */ '__DD_SETTER' /*! END_REPLACE() */, true);

	__Internal__.ADD('ConstructorSymbol', types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_CONSTRUCTOR')), true) */ '__DD_CONSTRUCTOR' /*! END_REPLACE() */, true));
	__Internal__.ADD('NewSymbol', types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_NEW')), true) */ '__DD_NEW' /*! END_REPLACE() */, true));

	tools.extend(_shared.reservedAttributes, {
		_super: null,

		$TYPE_NAME: null,
		$TYPE_UUID: null,
		[types.ConstructorSymbol]: null,
		[types.NewSymbol]: null,

		[__Internal__.symbolInitialized]: null,
		[__Internal__.symbol$IsSingleton]: null,
		[__Internal__.symbolSingleton]: null,
	});

	__Internal__.ADD('INHERIT', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					base: {
						type: 'type',
						optional: false,
						description: "A type used as a base type.",
					},
					type: {
						type: 'type',
						optional: false,
						description: "A type to inherit.",
					},
				},
				returns: 'type',
				description: "Makes type inherits the base type.",
			}
		//! END_REPLACE()
		, function INHERIT(base, type) {
			if (types.baseof(base, type)) {
				// Already inherits base
				return type;
			};

			// console.log(Object.prototype.isPrototypeOf.call(Error.prototype, TypeError.prototype));
			// >>> true
			// let t1 = function(){};
			// let t2 = function(){};
			// t2.prototype = t1.prototype;
			// console.log(Object.prototype.isPrototypeOf.call(t1.prototype, t2.prototype));
			// >>> false   // BAD
			// t1 = function(){};
			// t2 = function(){};
			// t2.prototype = Object.setPrototypeOf(t2.prototype, t1.prototype);
			// console.log(Object.prototype.isPrototypeOf.call(t1.prototype, t2.prototype));
			// >>> true    // OK

			type = types.setPrototypeOf(type, base);

			type.prototype = tools.createObject(base.prototype, {
				constructor: {
					value: type,
				},
			});

			const values = {
				apply: type.apply,
				call: type.call,
				bind: type.bind,
			};
			types.setAttributes(type, values, {});

			return type;
		}));

	__Internal__.ADD('AttributeBox', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					value: {
						type: 'any',
						optional: false,
						description: "A value to box.",
					},
				},
				returns: 'AttributeBox',
				description: "Creates an attribute box with the specified value.",
			}
		//! END_REPLACE()
		, types.INHERIT(types.box, function AttributeBox(value) {
			if (types._instanceof(this, types.AttributeBox)) {
				if (types._instanceof(value, types.box)) {
					value.setAttributes(this);
					value = value[_shared.OriginalValueSymbol];
				};
				this[_shared.OriginalValueSymbol] = value;
				return this;
			} else {
				return new types.AttributeBox(value);
			}
		})));

	//tools.extend(types.AttributeBox.prototype, {
	//});

	__Internal__.emptyFunction = function empty() {};

	__Internal__.ADD('SUPER', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					fn: {
						type: 'function',
						optional: false,
						description: "A method.",
					},
				},
				returns: 'AttributeBox',
				description: "Flags a method so it will override instead of replace. Returns an AttributeBox.",
			}
		//! END_REPLACE()
		, function SUPER(fn) {
			fn = types.AttributeBox(fn);
			fn[_shared.SuperEnabledSymbol] = true;
			return fn;
		}));

	__Internal__.ADD('NOT_ENUMERABLE', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					val: {
						type: 'any',
						optional: false,
						description: "A value.",
					},
				},
				returns: 'AttributeBox',
				description: "Flags an attribute as not enumerable. Returns an AttributeBox.",
			}
		//! END_REPLACE()
		, function NOT_ENUMERABLE(val) {
			val = types.AttributeBox(val);
			val[_shared.EnumerableSymbol] = false;
			return val;
		}));

	__Internal__.ADD('ENUMERABLE', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					val: {
						type: 'any',
						optional: false,
						description: "A value.",
					},
				},
				returns: 'AttributeBox',
				description: "Flags an attribute as enumerable. Returns an AttributeBox.",
			}
		//! END_REPLACE()
		, function ENUMERABLE(val) {
			val = types.AttributeBox(val);
			val[_shared.EnumerableSymbol] = true;
			return val;
		}));

	__Internal__.ADD('NOT_CONFIGURABLE', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					val: {
						type: 'any',
						optional: false,
						description: "A value.",
					},
				},
				returns: 'AttributeBox',
				description: "Flags an attribute as not configurable. Returns an AttributeBox.",
			}
		//! END_REPLACE()
		, function NOT_CONFIGURABLE(val) {
			val = types.AttributeBox(val);
			val[_shared.ConfigurableSymbol] = false;
			return val;
		}));

	__Internal__.ADD('CONFIGURABLE', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					val: {
						type: 'any',
						optional: false,
						description: "A value.",
					},
				},
				returns: 'AttributeBox',
				description: "Flags an attribute as configurable. Returns an AttributeBox.",
			}
		//! END_REPLACE()
		, function CONFIGURABLE(val) {
			val = types.AttributeBox(val);
			val[_shared.ConfigurableSymbol] = true;
			return val;
		}));

	__Internal__.ADD('READ_ONLY', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					val: {
						type: 'any',
						optional: false,
						description: "A value.",
					},
				},
				returns: 'AttributeBox',
				description: "Flags an attribute as read-only. Returns an AttributeBox.",
			}
		//! END_REPLACE()
		, function READ_ONLY(val) {
			val = types.AttributeBox(val);
			if (val[_shared.GetterSymbol] || val[_shared.SetterSymbol]) {
				throw new types.Error("'READ_ONLY' can't be applied on a get/set attribute.");
			};
			val[_shared.ReadOnlySymbol] = true;
			return val;
		}));

	__Internal__.ADD('WRITABLE', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					val: {
						type: 'any',
						optional: false,
						description: "A value.",
					},
				},
				returns: 'AttributeBox',
				description: "Flags an attribute as writable. Returns an AttributeBox.",
			}
		//! END_REPLACE()
		, function WRITABLE(val) {
			val = types.AttributeBox(val);
			if (val[_shared.GetterSymbol] || val[_shared.SetterSymbol]) {
				throw new types.Error("'WRITABLE' can't be applied on a get/set attribute.");
			};
			val[_shared.ReadOnlySymbol] = false;
			return val;
		}));

	__Internal__.ADD('GET_SET', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					getter: {
						type: 'function',
						optional: true,
						description: "The getter function.",
					},
					setter: {
						type: 'function',
						optional: true,
						description: "The setter function.",
					},
				},
				returns: 'AttributeBox',
				description: "Creates a get/set attribute.",
			}
		//! END_REPLACE()
		, function GET_SET(getter, setter) {
			const val = types.AttributeBox();
			val[_shared.GetterSymbol] = getter;
			val[_shared.SetterSymbol] = setter;
			return val;
		}));

	__Internal__.ADD('GET', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					getter: {
						type: 'function',
						optional: true,
						description: "The getter function.",
					},
				},
				returns: 'AttributeBox',
				description: "Creates a get attribute.",
			}
		//! END_REPLACE()
		, function GET(getter) {
			const val = types.AttributeBox();
			val[_shared.GetterSymbol] = getter;
			return val;
		}));

	__Internal__.ADD('SET', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					setter: {
						type: 'function',
						optional: true,
						description: "The setter function.",
					},
				},
				returns: 'AttributeBox',
				description: "Creates a set attribute.",
			}
		//! END_REPLACE()
		, function SET(setter) {
			const val = types.AttributeBox();
			val[_shared.SetterSymbol] = setter;
			return val;
		}));

	// <PRB> If "prototype" is not configurable, we can't set it to read-only
	__Internal__.prototypeIsConfigurable = false;
	(function() {
		const f = function() {};
		const desc = types.getOwnPropertyDescriptor(f, 'prototype');
		__Internal__.prototypeIsConfigurable = desc.configurable;
	})();

	// <PRB> Proxy checks existence of the property in the target AFTER the handler instead of BEFORE. That prevents us to force non-configurable and non-writable on a NEW NON-EXISTING property with a different value.
	//       Error given is "TypeError: 'set' on proxy: trap returned truish for property 'doodad' which exists in the proxy target as a non-configurable and non-writable data property with a different value"
	/*
	_shared.proxyHasSetHandlerBug = false;
	(function() {
		if (types.hasProxies()) {
			const proxy = tools.createProxy(tools.createObject(null), {
				set: function(target, prop, val) {
					// Should set NEW NON-EXISTING property as non-configurable and non-writable with a different value.
					types.defineProperty(target, prop, {
						//configurable: false,  'FALSE' is the default
						value: val + 1,
						//writable: false,  'FALSE' is the default
					});
					return true;
				},
			});
			try {
				proxy.doodad = 1;
			} catch(ex) {
				_shared.proxyHasSetHandlerBug = true;
			};
		};
	})();
	*/

	__Internal__.createCaller = __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					attr: {
						type: 'string,Symbol',
						optional: false,
						description: "The method name.",
					},
					fn: {
						type: 'function',
						optional: false,
						description: "The new function.",
					},
					superFn: {
						type: 'function',
						optional: true,
						description: "The old function from base.",
					},
				},
				returns: 'method',
				description: "Returns a new method which is the result of the override.",
			}
		//! END_REPLACE()
		, function createCaller(attr, fn, /*optional*/superFn) {
			superFn = superFn || __Internal__.emptyFunction;
			const _caller = types.INHERIT(types.SUPER, function caller(/*paramarray*/...args) {
				const oldSuper = types.getAttribute(this, '_super', {direct: true});
				types.setAttribute(this, '_super', superFn);
				try {
					return fn.apply(this, args);
				} catch (ex) {
					throw ex;
				} finally {
					types.setAttribute(this, '_super', oldSuper);
				}
			});
			types.setAttribute(_caller, _shared.OriginalValueSymbol, fn, {});
			return _caller;
		});

	__Internal__.applyProto = function applyProto(target, base, proto, preApply, skipExisting, skipConfigurables, functionName) {
		//const forType = types.isType(target);

		let code = '';

		const loopKeys = function _loopKeys(keys, isSymbol) {
			for (let i = 0; i < keys.length; i++) {
				const key = keys[i];

				if ((key !== '__proto__') && !(key in _shared.reservedAttributes)) {
					let keyStr;
					if (functionName) {
						if (isSymbol) {
							code += "key = protoSymbols[" + types.toString(i) + "];";
						} else {
							keyStr = "'" + key.replace(/[']/g, "\\'") + "'";
							code += "key = " + keyStr + ";";
						};
					};

					let hasKey = false;

					if (functionName) {
						code += "hasKey = types.has(target, key);";
					} else {
						hasKey = types.has(target, key);
					};

					if (functionName) {
						if (skipExisting) {
							code += "ok = !hasKey;";
						} else {
							code += "ok = true;";
						};
					} else {
						if (hasKey && skipExisting) {
							continue;
						};
					};

					code += "if (ok) {";

					const attr = types.AttributeBox(proto[key]),
						g = types.get(attr, _shared.GetterSymbol),
						s = types.get(attr, _shared.SetterSymbol);

					if (functionName) {
						code += "attr = types.AttributeBox(proto[key]);";
					};

					let value = attr,
						isFunction = false;

					if (functionName) {
						code += "value = attr;" +
								"isFunction = false;";
					};

					if (!g && !s) {
						if (functionName) {
							code += "if (hasKey) {" +
										"value = target[key];" +
									"};" +
									"value = types.unbox(value);" +
									"isFunction = types.isJsFunction(value);";
						} else {
							if (hasKey) {
								value = target[key];
							};
							value = types.unbox(value);
							isFunction = types.isJsFunction(value);
						};
					};

					let cf = types.get(attr, _shared.ConfigurableSymbol);
					if (types.isNothing(cf)) {
						cf = !isFunction;
					};

					if (functionName) {
						if (cf && skipConfigurables) {
							code += "ok = types.hasIn(target, key);";
						} else {
							code += "ok = true;";
						};
					} else {
						if (cf && skipConfigurables && !types.hasIn(target, key)) {
							continue;
						};
					};

					if (functionName) {
						code += "if (ok) {";
					};

					if (functionName) {
						if (types.get(attr, _shared.SuperEnabledSymbol)) {
							code += "const createSuper = !hasKey && isFunction;" +
									"if (createSuper) {" +
										"const _super = base && types.getAttribute(base, key, {direct: true});" +
										"value = __Internal__.createCaller(key, value, _super);" +
									"};";
						};
					} else {
						const createSuper = !hasKey && isFunction && types.get(attr, _shared.SuperEnabledSymbol);
						if (createSuper) {
							const _super = base && types.getAttribute(base, key, {direct: true});
							value = __Internal__.createCaller(key, value, _super);
						};
					};

					if (functionName) {
						code += "if (isFunction) {" +
									"types.setAttributes(value, {" +
										"apply: value.apply," +
										"call: value.call," +
										"bind: value.bind," +
									"}, {ignoreWhenReadOnly: true});" +
								"};";
					} else {
						if (isFunction) {
							types.setAttributes(value, {
								apply: value.apply,
								call: value.call,
								bind: value.bind,
							}, {ignoreWhenReadOnly: true});
						};
					}

					if (preApply) {
						if (functionName) {
							code += "types.setAttribute(target, key, value, {all: true, direct: true});";
						} else {
							types.setAttribute(target, key, value, {all: true, direct: true});
						};
					} else {
						let enu = types.get(attr, _shared.EnumerableSymbol);
						if (types.isNothing(enu)) {
							enu = true;
						};

						if (g || s) {
							// TODO: SUPER
							if (functionName) {
								code += "types.defineProperty(target, key, {" +
											"configurable: " + (cf ? 'true' : 'false') + "," +
											"enumerable: " + (enu ? 'true' : 'false') + "," +
											"get: types.get(attr, _shared.GetterSymbol) || undefined," +
											"set: types.get(attr, _shared.SetterSymbol) || undefined," +
										"});";
							} else {
								types.defineProperty(target, key, {
									configurable: !!cf,
									enumerable: !!enu,
									get: g || undefined,
									set: s || undefined,
								});
							};
						} else {
							let ro = types.get(attr, _shared.ReadOnlySymbol);

							if (functionName) {
								if (types.isNothing(ro)) {
									code += "ro = isFunction;";
								} else {
									code += "ro = " + (ro ? 'true' : 'false') + ";";
								};

								if (cf && enu) {
									code += "if (!ro && " + (isSymbol ? "!(key in target)" : "!(" + keyStr + " in target)") + ") {" +
												(isSymbol ?
													"target[key] = value;"
													:
													"target[" + keyStr + "] = value;"
												) +
											"} else {" +
												"types.setAttribute(target, key, value, {" +
													"configurable: true," +
													"enumerable: true," +
													"writable: !ro," +
													"ignoreWhenReadOnly: true," +
													"direct: true," +
												"});" +
											"};";
								} else {
									code += "types.setAttribute(target, key, value, {" +
												"configurable: " + (cf ? 'true' : 'false') + "," +
												"enumerable: " + (enu ? 'true' : 'false') + "," +
												"writable: !ro," +
												"ignoreWhenReadOnly: true," +
												"direct: true," +
											"});";
								};
							} else {
								if (types.isNothing(ro)) {
									ro = isFunction;
								};

								if (cf && enu && !ro && !(key in target)) {
									target[key] = value;
								} else {
									types.setAttribute(target, key, value, {
										configurable: !!cf,
										enumerable: !!enu,
										writable: !ro,
										ignoreWhenReadOnly: true,
										direct: true,
									});
								};
							};
						};
					};

					if (functionName) {
						code +=		"};" +
								"};";
					};
				};
			};
		};

		if (functionName) {
			code +=	"(function " + functionName + "(target, base, proto) {" +
						"let key, hasKey, attr, value, isFunction, ok, ro;";
		};

		const protoSymbols = types.symbols(proto);

		loopKeys(types.keys(proto), false);
		loopKeys(protoSymbols, true);

		if (functionName) {
			code += "types.defineProperty(target, '_super', {value: null, writable: true});";
		} else {
			types.defineProperty(target, '_super', {value: null, writable: true});
		};

		if (functionName) {
			code += "})";
		};

		let fn = null;

		if (functionName) {
			const evalFn = tools.createEval(['types', 'tools', '_shared', '__Internal__', 'protoSymbols'], true)(types, tools, _shared, __Internal__, protoSymbols);
			fn = evalFn(code);
		};

		return fn;
	};

	__Internal__._createType = function(ctx) {
		if (ctx.base) {
			return (
				class extends ctx.base {
					// <PRB> grrrr, "this" is not available before we call "super" !!!
					constructor(/*paramarray*/...args) {
						const constructorThis = {};
						const constructorArgs = ctx.constructor.apply(constructorThis, args) || args;
						let obj = super(...constructorArgs) || this;
						ctx.tools.extend(obj, constructorThis);
						if (ctx.types.getType(this) === ctx.type) {
							obj = ctx.type[ctx.types.NewSymbol].call(obj, args) || obj;
						};
						return obj;
					}
				}
			);
		} else {
			return (
				class {
					constructor(/*paramarray*/...args) {
						let obj = this;
						if (ctx.types.getType(this) === ctx.type) {
							obj = ctx.type[ctx.types.NewSymbol].call(obj, args) || obj;
						};
						return obj;
					}
				}
			);
		}
	};

	__Internal__._createTypeNew  = function(ctx) {
		return (function(args) {
			const forType = types.isFunction(this);

			if (forType) {
				if ((this !== ctx.type) && (!types.baseof(ctx.type, this))) {
					throw new types.Error('Wrong constructor.');
				};
			} else {
				if (!types.get(ctx.type, __Internal__.symbolInitialized)) {
					throw new types.Error("Type '~0~' is not initialized.", [types.getTypeName(ctx.type)]);
				};
				if (!types._instanceof(this, ctx.type)) {
					throw new types.Error("Wrong constructor. Did you forget the 'new' operator ?");
				};
			};

			if (!__Internal__.prototypeIsConfigurable) {
				// <PRB> "prototype" is not configurable, so we can't set it to read-only
				if (!forType) {
					if (ctx.type.prototype !== ctx.proto) {
						// Something has changed the prototype. Set it back to original and recreate the object.
						ctx.type.prototype = ctx.proto;
						return types.newInstance(ctx.type, args);
					};
				};
			};

			let obj;
			if (types.get(this, __Internal__.symbolInitialized)) {
				obj = this;
			} else {
				if (!forType) {
					if (types.get(ctx.type, __Internal__.symbolSingleton)) {
						throw new types.Error('Singleton object has already been created.');
					};

					types.setAttribute(this, 'constructor', ctx.type, {ignoreWhenSame: true, direct: true});
				};

				// <PRB> Symbol.hasInstance: We force default behavior of "instanceof" by setting Symbol.hasInstance to 'undefined'.
				types.setAttribute(this, _shared.Natives.symbolHasInstance, undefined, {direct: true});

				types.setAttribute(this, __Internal__.symbolInitialized, true, {configurable: true, direct: true});
				obj = ctx._new.apply(this, args) || this; // _new

				const isSingleton = !!ctx.type[__Internal__.symbol$IsSingleton];
				types.setAttribute(obj, __Internal__.symbol$IsSingleton, isSingleton, {direct: true});
				if (isSingleton) {
					if (!forType) {
						types.setAttribute(ctx.type, __Internal__.symbolSingleton, obj, {direct: true});
					};
				} else {
					types.setAttribute(obj, __Internal__.symbolSingleton, null, {direct: true});
				};
			};

			if (ctx.typeProto && types.hasDefinePropertyEnabled()) {
				if (forType) {
					ctx.applyProtoToType(obj, ctx.base, ctx.typeProto);
				};
			};

			if (ctx.instanceProto && types.hasDefinePropertyEnabled()) {
				if (!forType) {
					ctx.applyProtoToInstance(obj, ctx.instanceBase, ctx.instanceProto);
				};
			};

			if (ctx.baseIsType) {
				ctx.base[types.NewSymbol].call(obj, args);
			};

			if (ctx.baseIsType) {
				if ((obj !== this) && !types.get(obj, __Internal__.symbolInitialized)) {
					types.setAttribute(obj, __Internal__.symbolInitialized, true, {configurable: true, direct: true});
				};
			};

			return obj;
		});
	};

	__Internal__.ADD('createType', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 14,
				params: {
					name: {
						type: 'string',
						optional: true,
						description: "Name of the new type.",
					},
					base: {
						type: 'type',
						optional: true,
						description: "A Doodad type to inherit.",
					},
					constructor: {
						type: 'function',
						optional: true,
						description: "The constructor function.",
					},
					_new: {
						type: 'function',
						optional: true,
						description: "The creator function.",
					},
					typeProto: {
						type: 'object',
						optional: true,
						description: "An object to be used as the prototype of the new type.",
					},
					instanceProto: {
						type: 'object',
						optional: true,
						description: "An object to be used as the prototype of the instances of the new type.",
					},
					uuid: {
						type: 'string',
						optional: true,
						description: "UUID of the new type.",
					},
				},
				returns: 'type',
				description: "Creates and returns a new Doodad type. N.B.: You should always use methods '$inherit' and '$extend' instead of this function.",
			}
		//! END_REPLACE()
		, function createType(/*optional*/name, /*optional*/base, /*optional*/constructor, /*optional*/_new, /*optional*/typeProto, /*optional*/instanceProto, /*optional*/uuid) {
			if (types.isNothing(name)) {
				name = '';
			};

			name = _shared.Natives.stringReplaceCall(name, /[^a-zA-Z0-9$_]/g, "_");

			const baseIsType = types.isType(base);
			if (baseIsType) {
				if (!types.get(base, __Internal__.symbolInitialized)) {
					throw new _shared.Natives.windowError("Base type '" + (types.getTypeName(base) || '<anonymous>') + "' is not initialized.");
				};
			};

			/* eslint no-useless-concat: "off" */
			uuid = (uuid ? /*! REPLACE_BY(TO_SOURCE(UUID('DD_TYPE')), true) */ '__DD_TYPE__' /*! END_REPLACE() */ + '-' + uuid : null);

			const instanceBase = (base ? base.prototype : null);

			const ctx = tools.nullObject({
				_shared: _shared,
				types: types,
				tools: tools,

				base: base,
				baseIsType: baseIsType,
				typeProto: typeProto,
				instanceProto: instanceProto,
				instanceBase: instanceBase,
				applyProtoToType: typeProto && types.hasDefinePropertyEnabled() && __Internal__.applyProto(null, base, typeProto, false, true, false, 'applyProtoToType'),
				applyProtoToInstance: instanceProto && types.hasDefinePropertyEnabled() && __Internal__.applyProto(null, instanceBase, instanceProto, false, true, true, 'applyProtoToInstance'),

				constructor: null, // Will be set after creation
				_new: null, // Will be set after creation
				type: null, // will be set after type creation
				proto: null, // will be set after type creation
			});

			const type = __Internal__._createType(ctx);

			const proto = type.prototype;

			// <FUTURE> "Public static fields"
			//tools.extend(type, {
			//});

			const typeValues = {
				name: name,

				call: type.call,
				apply: type.apply,
				bind: type.bind,

				[__Internal__.symbolIsType]: true,
				[__Internal__.symbolTypeUUID]: uuid,

				[types.NewSymbol]: __Internal__._createTypeNew(ctx),
			};
			types.setAttributes(type, typeValues, {direct: true});

			// <FUTURE> "Public instance fields"
			//tools.extend(proto, {
			//});

			const protoValues = {
				constructor: type,
				[__Internal__.symbolIsType]: true,
				[__Internal__.symbolTypeUUID]: uuid,
			};
			types.setAttributes(proto, protoValues, {direct: true});

			ctx.type = type;
			ctx.proto = proto;

			if (types.isNothing(constructor)) {
				constructor = (function(/*paramarray*/...args) {
					return args;
				});
			} else if (types.isString(constructor)) {
				constructor = tools.eval("function(/*paramarray*/...args) {" + constructor + "}", ctx);
			};
			ctx.constructor = constructor;

			if (types.isNothing(_new)) {
				_new = (function(/*paramarray*/...args) {
					return this._new && this._new(...args) || this;
				});
			} else if (types.isString(_new)) {
				_new = tools.eval("function(/*paramarray*/...args) {" + _new + "}", ctx);
			};
			ctx._new = _new;

			if (typeProto) {
				__Internal__.applyProto(type, base, typeProto, true, false, false, '');
			};

			if (instanceProto) {
				__Internal__.applyProto(proto, ctx.instanceBase, instanceProto, false, false, false, '');
			};

			// Return type
			return type;
		}));

	__Internal__.$inherit = __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					typeProto: {
						type: 'object',
						optional: true,
						description: "An object to be used as the prototype of the new type.",
					},
					instanceProto: {
						type: 'object',
						optional: true,
						description: "An object to be used as the prototype of the instances of the new type.",
					},
					_super: {
						type: 'function',
						optional: true,
						description: "The super function.",
					},
					constructor: {
						type: 'function',
						optional: true,
						description: "The constructor constructor function. Defaults to a call to the method '_new'.",
					},
				},
				returns: 'type',
				description: "Creates and returns a new Doodad type that inherits from 'this'.",
			}
		//! END_REPLACE()
		, function $inherit(/*optional*/typeProto, /*optional*/instanceProto) {
			// <PRB> "fn.call(undefined, ...)" can automatically set "this" to "window" !
			const base = ((this === global) ? undefined : this);

			let name = null,
				constructor = null,
				_new = null,
				uuid = null;

			if (typeProto) {
				name = types.get(typeProto, '$TYPE_NAME');
				constructor = types.get(typeProto, types.ConstructorSymbol);
				_new = types.get(typeProto, types.NewSymbol);
				uuid = types.get(typeProto, '$TYPE_UUID');

				name = (types.isNothing(name) ? '' : types.toString(name));
				uuid = (types.isNothing(uuid) ? '' : types.toString(uuid));
			};

			const type = types.createType(
				/*name*/
				name,

				/*base*/
				base,

				/*constructor*/
				constructor,

				/*_new*/
				_new,

				/*typeProto*/
				typeProto,

				/*instanceProto*/
				instanceProto,

				/*uuid*/
				uuid
			);

			return type;
		});

	//===================================
	// Errors
	//===================================

	__Internal__.symbolIsErrorType = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_IS_ERROR_TYPE')), true) */ '__DD_IS_ERROR_TYPE' /*! END_REPLACE() */, true);

	// Change the prototype of Error so that these properties do not fall back to Object.prototype (yes, I do that !)

	global.Error.prototype.bubble = false;
	global.Error.prototype.critical = false;
	global.Error.prototype.trapped = false;
	global.Error.prototype.promiseName = '';
	global.Error.prototype.innerStack = '';

	//! IF_SET('serverSide')
		// For Node.Js
		global.Error.prototype.code = '';
	//! END_IF()


	types.Error = __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 3,
				params: {
					message: {
						type: 'string',
						optional: false,
						description: "Error message",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'undefined',
				description: "Generic error with message formatting.",
			}
		//! END_REPLACE()
		, __Internal__.$inherit.call(_shared.Natives.windowError,
			/*typeProto*/
			{
				$TYPE_NAME: 'Error',
				$TYPE_UUID: /*! REPLACE_BY(TO_SOURCE(UUID('Error')), true) */ null /*! END_REPLACE() */,

				[__Internal__.symbolIsErrorType]: types.NOT_CONFIGURABLE(types.READ_ONLY(true)),

				[types.ConstructorSymbol]: function constructor(message, /*optional*/params) {
					message = tools.format(message, params);
					return [message];
				},

				$inherit: __Internal__.$inherit,

				_new: types.NOT_CONFIGURABLE(types.READ_ONLY(null)),

				_delete() {
					if (this[__Internal__.symbolInitialized]) {
						types.setAttribute(this, __Internal__.symbolInitialized, false, {direct: true});
					} else {
						// Object already deleted, should not happens.
						types.DEBUGGER();
					};
				},

				toString() {
					return '[type ' + types.getTypeName(this) + ']';
				},
			},
			/*instanceProto*/
			{
				[__Internal__.symbolIsErrorType]: types.NOT_CONFIGURABLE(types.READ_ONLY(true)),
				[_shared.Natives.symbolToStringTag]: types.NOT_CONFIGURABLE(types.READ_ONLY('Error')),

				name: types.NOT_CONFIGURABLE(types.READ_ONLY(false)),
				bubble: types.NOT_CONFIGURABLE(types.READ_ONLY(false)),
				critical: types.NOT_CONFIGURABLE(types.READ_ONLY(false)),

				parsed: false,
				parsedStack: null,
				trapped: false,

				_new(/*paramarray*/...args) {
					types.setAttribute(this, 'name', types.getTypeName(this), {direct: true});
				},

				_delete() {
					if (this[__Internal__.symbolInitialized]) {
						types.setAttribute(this, __Internal__.symbolInitialized, false, {direct: true});
					} else {
						// Object already deleted, should not happens.
						types.DEBUGGER();
					};
				},

				toString(/*paramarray*/...args) {
					return this.message;
				},

				toLocaleString(/*paramarray*/...args) {
					return this.toString(...args);
				},

				parse() {
					// Call this method before accessing "this.stack", "this.fileName", "this.lineNumber" and "this.columnNumber".
					if (!this.parsed) {
						let stack;
						if (this.stack) {
							stack = tools.parseStack(this.stack);
							if (stack) {
								// Internet Explorer (tested with version 11) and Chrome (tested with version 42) doesn't return more than 10 call levels, so the stack may be empty after "splice".
								if (!stack.length) {
									stack = null;
								};
							};
							this.parsedStack = stack;
						};

						let fileName,
							lineNumber,
							columnNumber,
							functionName;
						if (this.fileName) {
							// <FUTURE> Firefox
							// NOTE: "this.lineNumber" and "this.columnNumber" should be already set
							fileName = this.fileName;
							lineNumber = this.lineNumber;
							functionName = "";
						} else if (this.sourceURL) {
							// Safari 5
							// NOTE: "this.line" should be already set
							fileName = this.sourceURL;
							lineNumber = this.line;
							columnNumber = 0;
							functionName = "";
						} else {
							// Other browsers
							// Set attributes from the stack.
							if (stack) {
								const trace = stack[0];
								fileName = trace.path;
								columnNumber = trace.columnNumber;
								lineNumber = trace.lineNumber;
								functionName = trace.functionName;
							} else {
								fileName = "";
								columnNumber = 0;
								lineNumber = 0;
								functionName = "";
							};
						};
						this.fileName = fileName;
						this.sourceURL = fileName;
						this.line = lineNumber;
						this.lineNumber = lineNumber;
						this.columnNumber = columnNumber;
						this.functionName = functionName;
						this.parsed = true;
					};
				}
			}
		));

	__Internal__.REGISTER(types.Error);

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: null,
				returns: 'error',
				description: "Raised on invalid value type.",
			}
		//! END_REPLACE()
		, types.Error.$inherit(
			{
				$TYPE_NAME: "ValueError",
				$TYPE_UUID: /*! REPLACE_BY(TO_SOURCE(UUID('TypeError')), true) */ null /*! END_REPLACE() */,
			})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					message: {
						type: 'string',
						optional: false,
						description: "A message explaining the assertion.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Raised when an assertion fail.",
			}
		//! END_REPLACE()
		, types.Error.$inherit(
			{
				$TYPE_NAME: "AssertionError",
				$TYPE_UUID: /*! REPLACE_BY(TO_SOURCE(UUID('AssertionError')), true) */ null /*! END_REPLACE() */,

				[types.ConstructorSymbol](message, /*optional*/params) {
					if (message) {
						return ["Assertion failed: " + message, params];
					} else {
						return ["Assertion failed."];
					}
				},
			})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					message: {
						type: 'string',
						optional: true,
						description: "A message explaining that something has failed to parse.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Raised on parse error.",
			}
		//! END_REPLACE()
		, types.Error.$inherit({
			$TYPE_NAME: "ParseError",
			$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('ParseError')), true) */ null /*! END_REPLACE() */,

			[types.ConstructorSymbol](message, /*optional*/params) {
				return [message || "Parse error.", params];
			},
		})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					message: {
						type: 'string',
						optional: true,
						description: "A message explaining what is not supported.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Raised when something is not supported.",
			}
		//! END_REPLACE()
		, types.Error.$inherit({
			$TYPE_NAME: "NotSupported",
			$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('NotSupported')), true) */ null /*! END_REPLACE() */,

			[types.ConstructorSymbol](message, /*optional*/params) {
				return [message || "Not supported.", params];
			},
		})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					message: {
						type: 'string',
						optional: true,
						description: "A message explaining what is not available.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Raised when something is not available.",
			}
		//! END_REPLACE()
		, types.Error.$inherit({
			$TYPE_NAME: "NotAvailable",
			$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('NotAvailable')), true) */ null /*! END_REPLACE() */,

			[types.ConstructorSymbol](message, /*optional*/params) {
				return [message || "Not available.", params];
			},
		})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 3,
				params: {
					code: {
						type: 'integer',
						optional: false,
						description: "HTTP status code.",
					},
					message: {
						type: 'string',
						optional: false,
						description: "A message explaining the error.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Raised on HTTP error.",
			}
		//! END_REPLACE()
		, types.Error.$inherit({
			$TYPE_NAME: "HttpError",
			$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('HttpError')), true) */ null /*! END_REPLACE() */,

			[types.ConstructorSymbol](code, /*optional*/message, /*optional*/params) {
				this.code = types.toInteger(code);
				return [message || 'HTTP error. The status code is : ~0~.', params || [code]];
			},
		})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					message: {
						type: 'string',
						optional: true,
						description: "A message explaining that something has overflowed.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Raised on buffer overflow.",
			}
		//! END_REPLACE()
		, types.Error.$inherit({
			$TYPE_NAME: "BufferOverflow",
			$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('BufferOverflow')), true) */ null /*! END_REPLACE() */,

			[types.ConstructorSymbol](message, /*optional*/params) {
				return [message || "Buffer overflow.", params];
			},
		})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					message: {
						type: 'string',
						optional: true,
						description: "A message explaining that something has timed out.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Raised on timeout.",
			}
		//! END_REPLACE()
		, types.Error.$inherit({
			$TYPE_NAME: "TimeoutError",
			$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('TimeoutError')), true) */ null /*! END_REPLACE() */,

			[types.ConstructorSymbol](message, /*optional*/params) {
				return [message || "Operation timed out.", params];
			},
		})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					message: {
						type: 'string',
						optional: true,
						description: "A message explaining that something has been canceled.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Raised on cancel.",
			}
		//! END_REPLACE()
		, types.Error.$inherit({
			$TYPE_NAME: "CanceledError",
			$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('CanceledError')), true) */ null /*! END_REPLACE() */,

			[types.ConstructorSymbol](message, /*optional*/params) {
				return [message || "Operation canceled.", params];
			},
		})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					message: {
						type: 'string',
						optional: true,
						description: "A message explaining that something is denied or not allowed.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Raised on access denied or not allowed operation.",
			}
		//! END_REPLACE()
		, types.Error.$inherit({
			$TYPE_NAME: "AccessDenied",
			$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('AccessDenied')), true) */ null /*! END_REPLACE() */,

			[types.ConstructorSymbol](message, /*optional*/params) {
				return [message || "Access denied.", params];
			},
		})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					message: {
						type: 'string',
						optional: true,
						description: "A message explaining that the script execution has been interrupted.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Signals that script execution has been interrupted, but not aborted.",
			}
		//! END_REPLACE()
		, types.Error.$inherit(
			/*typeProto*/
			{
				$TYPE_NAME: "ScriptInterruptedError",
				$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('ScriptInterruptedError')), true) */ null /*! END_REPLACE() */,

				[types.ConstructorSymbol](message, /*optional*/params) {
					return [message || "Script interrupted.", params];
				},
			},
			/*instanceProto*/
			{
				bubble: types.NOT_CONFIGURABLE(types.READ_ONLY(true)),
			})));

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 3,
				params: {
					exitCode: {
						type: 'integer',
						optional: true,
						description: "Exit code.",
					},
					message: {
						type: 'string',
						optional: true,
						description: "A message explaining that the script has been aborted.",
					},
					params: {
						type: 'arrayof(any),objectof(any)',
						optional: true,
						description: "Parameters of the error message",
					},
				},
				returns: 'error',
				description: "Signals that the script has been aborted. Every \"try...catch\" statements must unconditionally re-throw this error.",
			}
		//! END_REPLACE()
		, types.ScriptInterruptedError.$inherit(
			/*typeProto*/
			{
				$TYPE_NAME: "ScriptAbortedError",
				$TYPE_UUI: /*! REPLACE_BY(TO_SOURCE(UUID('ScriptAbortedError')), true) */ null /*! END_REPLACE() */,

				[types.ConstructorSymbol](/*optional*/exitCode, /*optional*/message, /*optional*/params) {
					this.exitCode = types.toInteger(exitCode) || 0;
					return [message || "Script aborted.", params];
				},
			},
			/*instanceProto*/
			{
				critical: types.NOT_CONFIGURABLE(types.READ_ONLY(true)),
			})));

	//===================================
	// DD_DOC
	//===================================

	__Internal__.symbolDD_DOC = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_DOCUMENTATION')), true) */ '__DD_DOC' /*! END_REPLACE() */, true);

	_shared.reservedAttributes[__Internal__.symbolDD_DOC] = null;

	__Internal__.DD_DOC = __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					doc: {
						type: 'object',
						optional: false,
						description: "Document to apply.",
					},
					value: {
						type: 'any',
						optional: false,
						description: "Target value",
					},
				},
				returns: 'object',
				description: "Applies a document to an object and returns that object.",
			}
		//! END_REPLACE()
		, function DD_DOC(doc, value) {
			value = _shared.Natives.windowObject(value);
			if (types.hasDefinePropertyEnabled()) {
				types.defineProperty(value, __Internal__.symbolDD_DOC, {
					value: doc && types.freezeObject(doc),
				});
			} else {
				value[__Internal__.symbolDD_DOC] = doc && types.freezeObject(doc);
			};
			return value;
		});

	__Internal__.GET_DD_DOC = __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: null,
				returns: 'object',
				description: "Gets the document applied to an object.",
			}
		//! END_REPLACE()
		, function GET_DD_DOC(value) {
			return value[__Internal__.symbolDD_DOC];
		});

	(function() {
		for (let i = 0; i < __Internal__.tempDocs.length; i++) {
			__Internal__.DD_DOC.apply(null, __Internal__.tempDocs[i]);
		};
		//delete __Internal__.tempDocs;
		__Internal__.tempDocs = null;
	})();

	//===================================
	// Type
	//===================================

	__Internal__.ADD('SINGLETON', __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				paramsDirection: 'rightToLeft',
				params: {
					type: {
						type: 'type',
						optional: false,
						description: "A Doodad type.",
					},
				},
				returns: 'type',
				description: "Transforms a Doodad type to a singleton object. Returns that singleton object.",
			}
		//! END_REPLACE()
		, function SINGLETON(type) {
			if (!types.isType(type)) {
				throw new types.Error("Invalid type.");
			};

			if (!types.isSingleton(type)) {
				types.setAttribute(type, __Internal__.symbol$IsSingleton, true, {configurable: true, direct: true});
			};

			return type;
		}));

	types.Type = __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: null,
				returns: 'object',
				description: "Base type of every Doodad types.",
			}
		//! END_REPLACE()
		, __Internal__.$inherit.call(undefined,
			/*typeProto*/
			{
				$TYPE_NAME: 'Type',
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Type')), true) */,

				[__Internal__.symbol$IsSingleton]: types.READ_ONLY(false),
				[__Internal__.symbolSingleton]: types.READ_ONLY(null),

				_super: null,

				$inherit: __Internal__.$inherit,

				_new: types.NOT_CONFIGURABLE(types.READ_ONLY(null)),

				_delete() {
					if (this[__Internal__.symbolInitialized]) {
						types.setAttribute(this, __Internal__.symbolInitialized, false, {direct: true});
					} else {
						// Object already deleted, should not happens.
						types.DEBUGGER();
					};
				},

				toString(/*paramarray*/...args) {
					return '[type ' + (types.getTypeName(this) || '<anonymous>') + ']';
				},

				toLocaleString(/*paramarray*/...args) {
					return this.toString(...args);
				},
			},

			/*instanceProto*/
			{
				[_shared.Natives.symbolToStringTag]: types.NOT_CONFIGURABLE(types.READ_ONLY('Object')),

				_super: null,

				_new: types.NOT_CONFIGURABLE(types.READ_ONLY(null)), //__Internal__.typeNew,

				_delete() {
					if (this[__Internal__.symbolInitialized]) {
						types.setAttribute(this, __Internal__.symbolInitialized, false, {direct: true});
					} else {
						// Object already deleted, should not happens.
						types.DEBUGGER();
					};
				},

				toString(/*paramarray*/...args) {
					return '[object ' + (types.getTypeName(this) || '<anonymous>') + ']';
				},

				toLocaleString(/*paramarray*/...args) {
					return this.toString(...args);
				},
			}
		));

	__Internal__.REGISTER(types.Type);

	//===================================
	// Event functions
	//===================================

	// NOTE: 2015/04/16 We can't inherit from the actual implementations of Event and CustomEvent !
	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 0,
				params: {
					type: {
						type: 'string',
						optional: false,
						description: "Event name.",
					},
					init: {
						type: 'object',
						optional: true,
						description: "Object to initialize event with.",
					},
				},
				returns: 'object',
				description: "Custom event type for custom event targets.",
			}
		//! END_REPLACE()
		, types.Type.$inherit(
			/*typeProto*/
			{
				$TYPE_NAME: 'CustomEvent',
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('CustomEvent')), true) */,
			},
			/*instanceProto*/
			{
				type: types.READ_ONLY(null),
				bubbles: types.READ_ONLY(false),
				cancelable: types.READ_ONLY(false),
				detail: types.READ_ONLY(null),

				canceled: false,   // preventDefault
				bubbling: false,   // stopPropagation
				stopped: false,    // stopImmediatePropagation

				_new: types.SUPER(function _new(type, /*optional*/init) {
					this._super();
					init = tools.nullObject(init);
					types.setAttributes(this, {
						type: type,
						// NOTE: Event targets are responsible to bubble events to their parent when "bubbling" is true.
						bubbles: !!init.bubbles,
						cancelable: !!init.cancelable,
						detail: init.detail,
					});
					this.bubbling = this.bubbles;
				}),

				preventDefault: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'undefined',
							description: "Prevents default behavior of the object that raises the event.",
						}
					//! END_REPLACE()
					, function() {
						// NOTE: "preventDefault" should be "cancel".
						if (this.cancelable) {
							this.canceled = true;
						};
					}),

				stopPropagation: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'undefined',
							description: "Stops propagation of the event.",
						}
					//! END_REPLACE()
					, function stopPropagation() {
						// NOTE: "stopPropagation" should be "preventBubbling".
						this.bubbling = false;
					}),

				stopImmediatePropagation: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'undefined',
							description: "Stops propagation of the event and breaks the listeners chain.",
						}
					//! END_REPLACE()
					, function stopImmediatePropagation() {
						// NOTE: "stopImmediatePropagation" should be "stopPropagation".
						this.bubbling = false;
						this.stopped = true;
					}),
			}
		)));

	__Internal__.symbolEventListeners = types.getSymbol('__EVENT_LISTENERS__');

	__Internal__.REGISTER(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: null,
				returns: 'object',
				description: "Custom event target.",
			}
		//! END_REPLACE()
		, types.Type.$inherit(
			/*typeProto*/
			{
				$TYPE_NAME: 'CustomEventTarget',
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('CustomEventTarget')), true) */,
			},
			/*instanceProto*/
			{
				_new: types.SUPER(function _new() {
					this._super();
					types.setAttribute(this, __Internal__.symbolEventListeners, tools.nullObject(), {configurable: true});
				}),

				_delete: types.SUPER(function _delete() {
					delete this[__Internal__.symbolEventListeners];
					this._super();
				}),

				addEventListener: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 1,
							params: {
								type: {
									type: 'string',
									optional: false,
									description: "Event name.",
								},
								handler: {
									type: 'function',
									optional: false,
									description: "Callback function",
								},
								options: {
									type: 'boolean,object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'undefined',
							description: "Adds an event listener for the specified event name.",
						}
					//! END_REPLACE()
					, function addEventListener(type, handler, /*optional*/options) {
						type = type.toLowerCase();
						const opts = options && (typeof options === 'object'),
							useCapture = !!(opts ? types.get(opts, 'capture', false) : options),
							once = types.get(opts, 'once', false);
						let listeners = this[__Internal__.symbolEventListeners][type];
						if (!types.isArray(listeners)) {
							listeners = [];
							this[__Internal__.symbolEventListeners][type] = listeners;
						};
						let found = false;
						for (let i = 0; i < listeners.length; i++) {
							const value = listeners[i];
							if ((value[0] === handler) && (value[1] === useCapture)) {
								found = true;
								break;
							};
						};
						if (!found) {
							listeners.push([handler, useCapture, once]);
						};
					}),

				removeEventListener: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 2,
							params: {
								type: {
									type: 'string',
									optional: false,
									description: "Event name.",
								},
								handler: {
									type: 'function',
									optional: false,
									description: "Original callback function",
								},
								options: {
									type: 'boolean,object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'undefined',
							description: "Removes an event listener for the specified event name.",
						}
					//! END_REPLACE()
					, function removeEventListener(type, /*optional*/handler, /*optional*/options) {
						type = type.toLowerCase();
						if (type in this[__Internal__.symbolEventListeners]) {
							const opts = options && (typeof options === 'object'),
								useCapture = (opts ? types.get(opts, 'capture') : options);
							const listeners = this[__Internal__.symbolEventListeners][type];
							if (types.isArray(listeners)) {
								if (types.isNothing(useCapture)) {
									for (let i = listeners.length - 1; i >= 0; i--) {
										const value = listeners[i];
										if (!handler || (value[0] === handler)) {
											listeners.splice(i, 1);
										};
									};
								} else {
									const capture = !!useCapture;
									for (let i = listeners.length - 1; i >= 0; i--) {
										const value = listeners[i];
										if ((!handler || (value[0] === handler)) && (value[1] === capture)) {
											listeners.splice(i, 1);
										};
									};
								};
							};
						};
					}),

				dispatchEvent: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 2,
							params: {
								event: {
									type: 'string',
									optional: false,
									description: "Event name.",
								},
							},
							returns: 'any',
							description: "Raises an event by its name.",
						}
					//! END_REPLACE()
					, function dispatchEvent(event) {
						// TODO: What should I do with "useCapture" ???
						// TODO: Implement "wantsUntrusted" ?
						const type = event.type.toLowerCase();

						let res = true;

						if (!event.stopped) {
							const events = this[__Internal__.symbolEventListeners];
							const listeners = types.get(events, type);
							if (listeners) {
								if (listeners.__locked) {
									return res;
									//throw new types.Error("Listeners locked for event '~0~'.", [type]);
								};

								const ar = types.clone(listeners);

								let arLen = ar.length,
									changed = false;

								try {
									listeners.__locked = true;  // prevents infinite loop

									let i = 0;
									while (i < arLen) {
										const listener = ar[i];
										const handler = listener[0];
										//const useCapture = listener[1];
										const once = listener[2];
										if (once) {
											ar.splice(i, 1);
											arLen--;
											changed = true;
										};
										const retval = handler.call(this, event);
										if (event.canceled) {
											res = false;
										};
										if (retval === false) {
											event.stopImmediatePropagation();
										};
										if (event.stopped) {
											break;
										};
										if (!once) {
											i++;
										};
									};
								} catch(ex) {
									throw ex;
								} finally {
									listeners.__locked = false;
									if (changed) {
										if (arLen > 0) {
											events[type] = ar;
										} else {
											delete events[type];
										};
									};
								};

								const name = 'on' + type;
								if (!event.stopped && types.has(this, name)) {
									const fn = this[name];
									if (types.isFunction(fn)) {
										const retval = fn.call(this, event);
										if (event.canceled) {
											res = false;
										};
										if (retval === false) {
											event.stopImmediatePropagation();
										};
									};
								};
							};
						};

						return res;
					}),

				clearListeners: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 1,
							params: null,
							returns: 'undefined',
							description: "Removes every event listeners.",
						}
					//! END_REPLACE()
					, function clearListeners() {
						types.setAttribute(this, __Internal__.symbolEventListeners, tools.nullObject());
					}),
			}
		)));

	//===================================
	// Namespace
	//===================================

	_shared.ADD = function ADD(name, obj, /*optional*/protect, /*optional*/args) {
		// NOTE: "name" is a String or a Symbol.
		// NOTE: "obj" is a Doodad Type, a Doodad Error Type, or any object.
		if (types.isNothing(protect)) {
			protect = true;
		};

		if (types.isObjectLike(obj) && types.isString(name) && !types.has(obj, 'DD_FULL_NAME') && types.isExtensible(obj)) {
			types.setAttributes(obj, {
				DD_PARENT: this,
				DD_NAME: name,
				DD_FULL_NAME: (this.DD_FULL_NAME + '.' + name),
			}, {direct: true});
		};

		if (types.isType(obj) && !types.isInitialized(obj)) {
			obj = types.INIT(obj, args);
		};

		if (protect && types.isFunction(obj)) {
			const values = {
				apply: obj.apply,
				call: obj.call,
				bind: obj.bind,
			};
			types.setAttributes(obj, values, {ignoreWhenReadOnly: true, direct: true});
		};

		types.setAttribute(this, name, obj, {
			configurable: !protect,
			enumerable: true,
			writable: !protect,
			ignoreWhenSame: true,
		});

		return obj;
	};

	_shared.REMOVE = function REMOVE(name) {
		delete this[name];
	};

	// Temporary, and not for registering classes.
	__Internal__.tempRegisteredOthers = [];
	__Internal__.registerOthers = function REGISTER(type, args, protect) {
		// NOTE: "type" is a Doodad Type, or a Doodad Error Type.
		const name = (types.getTypeName(type) || types.getFunctionName(type) || null),
			fullName = (name ? this.DD_FULL_NAME + '.' + name : null);

		if (!types.has(type, 'DD_FULL_NAME') && types.isExtensible(type)) {
			types.setAttributes(type, {
				DD_PARENT: this,
				DD_NAME: name,
				DD_FULL_NAME: fullName,
			}, {direct: true});
		};

		if (!types.isErrorType(type) && !types.isInitialized(type)) {
			type = types.INIT(type, args);
		};

		// NOTE: Will get protected when the real REGISTER will get called.
		types.setAttribute(this, name, type, {
			configurable: true,
			direct: true,
		});

		__Internal__.tempRegisteredOthers.push([this, [type, args, protect]]);
	};

	_shared.REGISTER = __Internal__.registerOthers;

	// NOTE: Will get overriden by Doodad.js
	_shared.UNREGISTER = function(type) {
		throw new types.NotSupported("Module 'Doodad.js' is not loaded.");
	};

	types.Namespace = __Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 1,
				params: {
					parent: {
						type: 'Doodad.Types.Namespace',
						optional: false,
						description: "Parent namespace.",
					},
					name: {
						type: 'string',
						optional: false,
						description: "Short name.",
					},
					fullName: {
						type: 'string',
						optional: false,
						description: "Full name.",
					},
				},
				returns: 'Namespace',
				description: "Namespace object.",
			}
		//! END_REPLACE()
		, types.CustomEventTarget.$inherit(
			/*typeProto*/
			{
				$TYPE_NAME: 'Namespace',
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Namespace')), true) */,
			},
			/*instanceProto*/
			{
				DD_PARENT: types.READ_ONLY(null),
				DD_NAME: types.READ_ONLY(null),
				DD_FULL_NAME: types.READ_ONLY(null),

				ADD: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 1,
							params: {
								name: {
									type: 'string',
									optional: false,
									description: "Name of the object.",
								},
								obj: {
									type: 'object,Type',
									optional: false,
									description: "Object to add.",
								},
								protect: {
									type: 'bool',
									optional: true,
									description: "'true' will protect the object. 'false' will not. Default is 'true'."
								},
								args: {
									type: 'arrayof(any)',
									optional: true,
									description: "Arguments of the constructor.",
								},
							},
							returns: 'object',
							description: "Adds the specified object to the current namespace object and returns that object. Also intialize if 'obj' is a Type.",
						}
					//! END_REPLACE()
					, function ADD(name, obj, /*optional*/protect, /*optional*/args) {
						return _shared.ADD.call(this, name, obj, protect, args);
					}),

				REMOVE: __Internal__.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
							author: "Claude Petit",
							revision: 0,
							params: {
								name: {
									type: 'string',
									optional: false,
									description: "Name of the object.",
								},
							},
							returns: 'undefined',
							description: "Removes the object from the current namespace object.",
						}
					//! END_REPLACE()
					, function REMOVE(name) {
						return _shared.REMOVE.call(this, name);
					}),

				REGISTER: function REGISTER(/*<<< optional*/protect, /*optional*/args, type) {
					if (arguments.length < 2) {
						type = protect;
						protect = true;
					} else if (arguments.length < 3) {
						type = args;
						args = protect;
						protect = true;
					};
					return _shared.REGISTER.call(this, type, args, protect);
				},

				UNREGISTER: function UNREGISTER(type) {
					return _shared.UNREGISTER.call(this, type);
				},

				_new: types.SUPER(function _new(/*optional*/parent, /*optional*/name, /*optional*/fullName) {
					this._super();

					types.setAttributes(this, {
						DD_PARENT: parent,
						DD_NAME: name,
						DD_FULL_NAME: fullName,
					});
				}),
			}
		));

	types.setAttribute(types.Namespace, __Internal__.symbolInitialized, true, {all: true});
	__Internal__.ADD('Namespace', types.Namespace);

	//==============
	// SECRET
	//==============

	_shared.SECRET = types.get(__options__, 'secret');
	delete __options__.secret;
	//__options__.secret = null;

	//===================================
	// Root
	//===================================

	types.freezeObject(__options__);

	types.preventExtensions(__Internal__[_shared.TargetSymbol] || __Internal__);

	const root = types.INIT(__Internal__.DD_DOC(
		//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
				author: "Claude Petit",
				revision: 2,
				params: {
					modules: {
						type: 'object',
						optional: true,
						description: "Object of modules to load.",
					},
					options: {
						type: 'object',
						optional: true,
						description: "Module options.",
					},
				},
				returns: 'object',
				description: "Namespace root.",
			}
		//! END_REPLACE()
		, types.SINGLETON(types.Namespace.$inherit(
			/*typeProto*/
			{
				$TYPE_NAME: 'Root',
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('RootNamespace')), true) */,
			},
			/*instanceProto*/
			{
				Namespace: types.NOT_CONFIGURABLE(types.READ_ONLY(  types.Namespace  )),

				createRoot: exports.createRoot,
				DD_DOC: __Internal__.DD_DOC,
				GET_DD_DOC: __Internal__.GET_DD_DOC,

				_new: types.SUPER(function _new(/*optional*/modules, /*optional*/options) {
					this._super(null, 'Root', 'Root');

					options = tools.nullObject(options);

					const root = this;

					// Prebuild "Doodad", "Doodad.Types" and "Doodad.Tools"
					// NOTE: 'Doodad' is the parent of 'Types', 'Tools' and 'Namespaces', but it depends on them. I should have put these namespaces at Root, but it's too late now.
					root.Doodad = new types.Namespace(root, 'Doodad', 'Doodad');
					root.Doodad.Tools = new types.Namespace(root.Doodad, 'Tools', 'Doodad.Tools');

					// NOTE: "types" replaces "toString". It's too late to rename it.
					const __typesTmp = types.INIT(types.Namespace.$inherit({
						$TYPE_NAME: '__TypesNamespace',
					},
					{
						toString: types.CONFIGURABLE(null),  // Will get set later by "tempTypesAdded"
					}));
					root.Doodad.Types = new __typesTmp(root.Doodad, 'Types', 'Doodad.Types');

					for (let i = 0; i < __Internal__.tempTypesAdded.length; i++) {
						const type = __Internal__.tempTypesAdded[i],
							name = type[0],
							obj = type[1];
						root.Doodad.Types.ADD(name, obj);
					};
					for (let i = 0; i < __Internal__.tempTypesRegistered.length; i++) {
						const type = __Internal__.tempTypesRegistered[i];
						// Temporary... will get registered later.
						root.Doodad.Types.ADD(types.getTypeName(type) || types.getFunctionName(type), type, false);
					};
					for (let i = 0; i < __Internal__.tempToolsAdded.length; i++) {
						const tool = __Internal__.tempToolsAdded[i],
							name = tool[0],
							obj = tool[1];
						root.Doodad.Tools.ADD(name, obj);
					};
					//delete __Internal__.tempTypesAdded;
					//delete __Internal__.tempToolsAdded;
					//delete __Internal__.ADD;
					//delete __Internal__.REGISTER;
					//delete __Internal__.ADD_TOOL;
					__Internal__.tempTypesAdded = null;
					__Internal__.tempToolsAdded = null;
					__Internal__.ADD = null;
					__Internal__.REGISTER = null;
					__Internal__.ADD_TOOL = null;

					const nsObjs = tools.nullObject({
						'Doodad': root.Doodad,
						'Doodad.Types': root.Doodad.Types,
						'Doodad.Tools': root.Doodad.Tools,
					});

					if (types.hasDefinePropertyEnabled()) {
						types.defineProperty(root, 'DD_ASSERT', {
							get: function() {
								return __Internal__.DD_ASSERT;
							},
						});
					};

					// Options

					__Internal__.enableAsserts = function enableAsserts() {
						if (types.hasDefinePropertyEnabled()) {
							__Internal__.DD_ASSERT = __Internal__.ASSERT;
						} else {
							root.DD_ASSERT = __Internal__.ASSERT;
						};
					};

					__Internal__.disableAsserts = function disableAsserts() {
						if (types.hasDefinePropertyEnabled()) {
							__Internal__.DD_ASSERT = null;
						} else {
							root.DD_ASSERT = null;
						};
					};

					if (__options__.enableAsserts) {
						__Internal__.enableAsserts();
					} else {
						__Internal__.disableAsserts();
					};

					// Load bootstrap modules

					if (!modules) {
						modules = {};
					};

					let MODULE_VERSION;
					//! INJECT("MODULE_VERSION = " + TO_SOURCE(VERSION('@doodad-js/core')) + ";")

					modules['@doodad-js/core'] = {
						type: 'Package',
						version: MODULE_VERSION,
					};

					const names = types.keys(modules),
						inits = tools.nullObject();

					let namespaces = null,
						entries = null;

					let name = names.shift();
					while (name) {
						const spec = modules[name];
						spec.name = name;
						let ok = true;
						if (spec.bootstrap) {
							const deps = (types.get(spec, 'dependencies') || []);
							for (let i = 0; i < deps.length; i++) {
								if (types.has(deps, i)) {
									let dep = deps[i],
										optional = false;
									if (types.isObject(dep)) {
										optional = dep.optional;
										dep = dep.name;
									};
									let loading = (dep in inits);
									if (!types.has(modules, dep) && !loading) {
										if (optional) {
											loading = true;
										} else {
											throw new types.Error("Missing bootstrap module '~0~'.", [dep]);
										};
									};
									if (!loading) {
										names.push(name);
										ok = false;
										break;
									};
								};
							};

							if (ok) {
								const baseName = name.split('/', 2)[0],
									shortNames = baseName.split('.'),
									proto = types.get(spec, 'proto');

								let nsObj = null,
									parent = root,
									fullName = '';

								for (let k = 0; k < shortNames.length; k++) {
									const shortName = shortNames[k];
									fullName += '.' + shortName;
									const fn = fullName.slice(1);
									const prevNsObj = types.get(parent, shortName);
									if ((k === (shortNames.length - 1)) && (proto || (prevNsObj && !types._instanceof(prevNsObj, types.Namespace)))) {
										let nsType = types.getType(prevNsObj) || types.Namespace;
										if (proto) {
											let args = proto;
											// Extend namespace object
											if (types.isFunction(args)) {
												args = args(root);
											};
											if (!types.isArray(args)) {
												args = [
													/*typeProto*/
													{
														$TYPE_NAME: types.getTypeName(nsType),
													},
													/*instanceProto*/
													args
												];
											};
											nsType = types.INIT(nsType.$inherit.apply(nsType, args));
										};
										nsObj = new nsType(parent, shortName, fn);
									} else if (!prevNsObj) {
										nsObj = new types.Namespace(parent, shortName, fn);
									} else {
										nsObj = prevNsObj;
									};
									nsObjs[fn] = nsObj;
									if ((parent !== root) || (!entries && (spec.type !== 'Package')) || (entries && !types._instanceof(entries[spec.type || 'Module'], entries.Package))) {
										parent[shortName] = nsObj;
									};
									parent = nsObj;
								};

								nsObjs[name] = nsObj;

								const nsList = (types.get(spec, 'namespaces') || []);
								for (let j = 0; j < nsList.length; j++) {
									if (types.has(nsList, j)) {
										const shortNames = nsList[j].split('.');
										let name = '.' + baseName;
										for (let k = 0; k < shortNames.length; k++) {
											const shortName = shortNames[k];
											name += '.' + shortName;
											const fn = name.slice(1);
											if (!(fn in nsObjs)) {
												const nsObj = new types.Namespace(parent, shortName, fn);
												nsObjs[fn] = nsObj;
												parent[shortName] = nsObj;
											};
											parent = parent[shortName];
										};
										parent = nsObj;
									};
								};

								const opts = options[name];
								const create = types.get(spec, 'create');
								if (create) {
									if (!types.isFunction(create)) {
										throw new types.NotSupported();
									};
									inits[name] = create(root, opts, _shared);
								};

								if (!namespaces && (name === 'Doodad.Namespaces')) {
									namespaces = nsObj;
									entries = namespaces.Entries;
								};
							};
						};

						name = names.shift();
					};

					const initsNames = types.keys(inits),
						nsOptions = {secret: _shared.SECRET};

					for (let i = 0; i < initsNames.length; i++) {
						const name = initsNames[i];
						const spec = modules[name];
						const baseName = name.split('/', 2)[0];
						const entryType = entries[spec.type || 'Module'];
						const entry = new entryType(root, spec, nsObjs[name]);
						const opts = options[baseName];
						entry.objectCreated = true;
						entry.objectInit = inits[name];
						if (entry.objectInit) {
							const retVal = entry.objectInit(opts);
							if (!types.isNothing(retVal)) {
								throw new types.NotSupported();
							};
						};
						entry.init(opts);
						namespaces.add(name, entry, nsOptions);
						//delete nsObjs[name];
						nsObjs[name] = null;
					};

					const nsNames = types.keys(nsObjs);
					for (let i = 0; i < nsNames.length; i++) {
						const name = nsNames[i];
						const namespace = nsObjs[name];
						if (namespace) {
							const baseName = name.split('/', 2)[0];
							const entry = new entries.Namespace(root, null, namespace);
							const opts = options[baseName];
							entry.init(opts);
							namespaces.add(name, entry, nsOptions);
						};
					};

					//delete types.Namespace[__Internal__.symbolInitialized];
					types.setAttribute(types.Namespace, __Internal__.symbolInitialized, null, {configurable: true});
					_shared.REGISTER.call(root.Doodad.Types, types.Namespace, null, true);

					for (let i = 0; i < __Internal__.tempTypesRegistered.length; i++) {
						const type = __Internal__.tempTypesRegistered[i];
						_shared.REGISTER.call(root.Doodad.Types, type, null, true);
					};
					//delete __Internal__.tempTypesRegistered;
					__Internal__.tempTypesRegistered = null;

					if (_shared.REGISTER !== __Internal__.registerOthers) {
						for (let i = 0; i < __Internal__.tempRegisteredOthers.length; i++) {
							const type = __Internal__.tempRegisteredOthers[i],
								namespace = type[0],
								args = type[1];
							_shared.REGISTER.apply(namespace, args);
						};
					} else {
						// "_shared.REGISTER" should have been replaced by "Doodad.js" !!!
						types.DEBUGGER();
					};
					//delete __Internal__.registerOthers;
					//delete __Internal__.tempRegisteredOthers;
					__Internal__.registerOthers = null;
					__Internal__.tempRegisteredOthers = null;
				}),

				//! BEGIN_REMOVE()
					serverSide: types.NOT_CONFIGURABLE(types.READ_ONLY((typeof process === 'object') && (process !== null) && !process.browser && (typeof module === 'object') && (module !== null))),
				//! END_REMOVE()
				//! IF(IS_SET("serverSide") && !IS_SET("browserify"))
					//!		INJECT("serverSide: types.NOT_CONFIGURABLE(types.READ_ONLY(true)),")
				//! ELSE()
					//!		INJECT("serverSide: types.NOT_CONFIGURABLE(types.READ_ONLY(false)),")
				//! END_IF()

				getOptions: function() {
					return __options__;
				},

				setOptions: function(...args) {
					const root = this,
						doodad = root.Doodad,
						types = doodad.Types,
						tools = doodad.Tools;

					const newOptions = __Internal__._setOptions(...args);

					if (newOptions.secret !== _shared.SECRET) {
						throw new types.AccessDenied("Secrets mismatch.");
					};

					delete newOptions.secret;

					if (tools.some(args, arg => types.has(arg, 'enableAsserts'))) {
						if (newOptions.enableAsserts) {
							__Internal__.enableAsserts();
						} else {
							__Internal__.disableAsserts();
						};
					};

					// Read-Only
					newOptions.debug = __options__.debug;
					newOptions.enableProperties = __options__.enableProperties;
					newOptions.enableSymbols = __options__.enableSymbols;

					__options__ = types.freezeObject(newOptions);

					return __options__;
				},
			}
		))), [modules, _options]);

	_shared.REGISTER.call(root.Doodad.Types, types.getType(root), null, true);

	return root.Doodad.Namespaces.load(modules, _options, startup)
		.catch(root.Doodad.Tools.catchAndExit);
};

//! BEGIN_REMOVE()
	if ((typeof process === 'object') && (process !== null) && (typeof module === 'object') && (module !== null)) {
	//! END_REMOVE()

	//! IF_SET("serverSide")
		//! IF_SET('mjs')
			//!	INJECT('export default exports;')
		//! END_IF()
	//! END_IF()

	//! BEGIN_REMOVE()
	} else {
	//! END_REMOVE()

	//! IF_UNSET("serverSide")
		//! IF_SET('mjs')
			//!	INJECT('export default exports;')
		//! ELSE()
			if ((typeof DD_BOOTSTRAP === 'object') && (DD_BOOTSTRAP !== null)) {
				DD_BOOTSTRAP.createRoot = exports.createRoot;
			} else {
				global.createRoot = exports.createRoot;
			};
		//! END_IF()
	//! END_IF()

	//! BEGIN_REMOVE()
	};
//! END_REMOVE()
