//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Bootstrap.js - Bootstrap module
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

(function(getEvals) {
	var global = this;

	var exports = {};
	
	//! BEGIN_REMOVE()
	if ((typeof process === 'object') && (process !== null) && (typeof module === 'object') && (module !== null)) {
	//! END_REMOVE()
		//! IF_SET("serverSide")
			module.exports = exports;
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()

	var MODULE_NAME = 'doodad-js';
	var MODULE_VERSION;
	//! INJECT("MODULE_VERSION = " + TO_SOURCE(VERSION('doodad-js')) + ";")

	// V8: Increment maximum number of stack frames
	// Source: https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
	if (Error.stackTraceLimit < 50) {
		Error.stackTraceLimit = 50;
	};
	
	exports.createRoot = function createRoot(/*optional*/modules, /*optional*/_options, /*optional*/startup) {
		"use strict";
		
		var _shared = {
			// Secret value used to load modules, ...
			SECRET: null,

			// NOTE: Preload of immediatly needed natives.
			Natives: {
				// General
				stringReplace: global.String.prototype.replace,
				numberToString: global.Number.prototype.toString,

				// "has", "isCustomFunction", "isNativeFunction"
				objectHasOwnProperty: global.Object.prototype.hasOwnProperty,
				
				// "isCustomFunction", "isNativeFunction", "isArrowFunction", "getFunctionName"
				functionToString: global.Function.prototype.toString,

				// "supportsES6Classes"
				objectCreate: global.Object.create,
			},
		};
		
		var __Internal__ = {
			evals: getEvals(),

			// "isNativeFunction", "isCustomFunction"
			hasIncompatibleFunctionToStringBug: false,

			// "createObject", "getPrototypeOf", "setPrototypeOf"
			hasProto: !!({}.__proto__),

			// Number.MAX_SAFE_INTEGER and MIN_SAFE_INTEGER polyfill
			SAFE_INTEGER_LEN: (global.Number.MAX_VALUE ? _shared.Natives.stringReplace.call(_shared.Natives.numberToString.call(global.Number.MAX_VALUE, 2), /[(]e[+]\d+[)]|[.]|[0]/g, '').length : 53),   // TODO: Find a mathematical way

			MIN_BITWISE_INTEGER: 0,
			MAX_BITWISE_INTEGER: ((~0) >>> 0), //   MAX_BITWISE_INTEGER | 0 === -1  ((-1 >>> 0) === 0xFFFFFFFF)
			
			tempDocs: [],
			tempTypesAdded: [],  // types to ADD into Doodad.Types
			tempTypesRegistered: [],  // types to REGISTER into Doodad.Types
			tempRegisteredOthers: [],  // objects to REGISTER into other namespaces
			tempToolsAdded: [],  // tools to ADD into Doodad.Tools

			tempTypesSymbol: {},

			DD_ASSERT: null,
		};

		__Internal__.BITWISE_INTEGER_LEN = global.Math.round(global.Math.log(__Internal__.MAX_BITWISE_INTEGER) / global.Math.LN2, 0);

		// Temporary. Will get replaced.
		var types = {
			},
			
			tools = {
			};
			
		//===================================
		// Temporary DD_DOC
		//===================================
		//! REPLACE_BY("__Internal__.DD_DOC = function(d,v) {return v;}")
		__Internal__.DD_DOC = function DD_DOC(doc, value) {
			value = Object(value);
			__Internal__.tempDocs.push([doc, value]);
			return value;
		};
		//! END_REPLACE()

		//===================================
		// Temporary ADD (for Doodad.Types)
		//===================================
		__Internal__.ADD = function ADD(name, obj) {
			if (types.isType && types.isType(obj)) {
				obj = types.INIT(obj);
			};
			types[name] = obj;
			__Internal__.tempTypesAdded.push([name, obj]);
			return obj;
		};

		//===================================
		// Temporary REGISTER (for Doodad.Types)
		//===================================
		__Internal__.REGISTER = function REGISTER(type) {
			var name = (types.getTypeName && types.getTypeName(type) || types.getFunctionName(type));
			if (types.isType && types.isType(type)) {
				type = types.INIT(type);
			};
			types[name] = type;
			__Internal__.tempTypesRegistered.push(type);
			return type;
		};

		//===================================
		// Temporary ADD (for Doodad.Tools)
		//===================================
		__Internal__.ADD_TOOL = function ADD_TOOL(name, obj) {
			tools[name] = obj;
			__Internal__.tempToolsAdded.push([name, obj]);
			return obj;
		};

		//===================================
		// ES6 Classes support
		//===================================

		__Internal__.hasClasses = false;
		__Internal__.classesNotCallable = true;
		(function() {
			try {
				var cls = __Internal__.evals.eval("class A {}"); // Will throw an error if ES6 classes are not supported.
				__Internal__.hasClasses = (_shared.Natives.functionToString.call(cls).slice(0, 6) === 'class ');  // Check for Firefox's bug
				if (__Internal__.hasClasses) {
					cls.call(_shared.Natives.objectCreate(cls.prototype)); // Will throw an error if ES6 classes are not callable.
					__Internal__.classesNotCallable = false; // in case of !
				};
			} catch(o) {
			};
		})();

		__Internal__.ADD('supportsES6Classes', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 0,
					params: null,
					returns: 'bool',
					description: "Returns 'true' if the Javascript engine has ES6 classes, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function supportsES6Classes() {
				return __Internal__.hasClasses;
			}));

		//===================================
		// ES6 Arrow functions support
		//===================================

		__Internal__.hasArrows = false;
		try {
			__Internal__.evals.eval("a => a");
			__Internal__.hasArrows = true;
		} catch(ex) {
		};

		// FUTURE: Remove "supportsArrowFunctions"
		__Internal__.ADD('hasArrows', __Internal__.ADD('supportsArrowFunctions', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 0,
					params: null,
					returns: 'bool',
					description: "Returns 'true' if the Javascript engine has ES6 arrow functions, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function hasArrows() {
				return __Internal__.hasArrows;
			})));

		//===================================
		// ES7 async/await
		//===================================
			
		__Internal__.hasAsyncAwait = false;
		try {
			__Internal__.evals.eval("async function test() {}");
			__Internal__.hasAsyncAwait = true;
		} catch(ex) {
		};

		// FUTURE: Remove "supportsAsyncAwait"
		__Internal__.ADD('hasAsyncAwait', __Internal__.ADD('supportsAsyncAwait', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 0,
					params: null,
					returns: 'bool',
					description: "Returns 'true' if the Javascript engine has ES6 classes, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function hasAsyncAwait() {
				return __Internal__.hasAsyncAwait;
			})));

		//===================================
		// Native functions
		//===================================
		// <PRB> "function.prototype.toString called on incompatible object" raised with some functions (EventTarget, Node, HTMLElement, ...) ! Don't know how to test for compatibility.
		try {
			if (typeof global.Event === 'function') {
				_shared.Natives.functionToString.call(global.Event);
			};
		} catch(ex) {
			__Internal__.hasIncompatibleFunctionToStringBug = true;
		};
		
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
						description: "Returns 'true' if object is a Javascript class function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, __Internal__.hasClasses ? function isJsClass(obj) {
				if (types.isFunction(obj)) {
					return (_shared.Natives.functionToString.call(obj).slice(0, 6) === 'class ');
				};
				return false;
			} : function isJsClass(obj) {
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
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && _shared.Natives.objectHasOwnProperty.call(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = _shared.Natives.functionToString.call(obj);
					};
					var index1 = str.indexOf('{') + 1,
						index2 = str.indexOf('[native code]', index1);
					if (index2 < 0) {
						return false;
					};
					for (var i = index1; i < index2; i++) {
						var chr = str[i];
						if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
							return false;
						};
					};
					return true;
				} else {
					return false;
				};
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
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && types.has(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = _shared.Natives.functionToString.call(obj);
					};
					var index1 = str.indexOf('{') + 1,
						index2 = str.indexOf('[native code]', index1);
					if (index2 < 0) {
						return true;
					};
					for (var i = index1; i < index2; i++) {
						var chr = str[i];
						if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
							return true;
						};
					};
				};
				return false;
			}));
		
		__Internal__.ADD('isArrowFunction', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an arrow function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, __Internal__.hasArrows ? function isArrowFunction(obj) {
				if (types.isFunction(obj)) {
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && types.has(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = _shared.Natives.functionToString.call(obj);
					};
					return /^(async[ ]*)?[(]?[^)]*[)]?[ ]*[=][>]/.test(str);
				};
				return false;
			} : function isArrowFunction(obj) {
				return false;
			}));
		
		__Internal__.ADD('isAsyncFunction', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an async function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, __Internal__.hasAsyncAwait ? function isAsyncFunction(obj) {
				if (types.isFunction(obj)) {
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && types.has(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = _shared.Natives.functionToString.call(obj);
					};
					return /^(async function(\s*[(]|\s+[^\s()]*[(])|async(\s*[(][^()=]*[)]|\s+[(]?[^ ()=]+[)]?)\s*[=][>])/.test(str);
				};
				return false;
			} : function isAsyncFunction(obj) {
				return false;
			}));
		
		__Internal__.ADD('getFunctionName', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
						var str;
						if (__Internal__.hasIncompatibleFunctionToStringBug && types.has(obj, 'toString') && types.isNativeFunction(obj.toString)) {
							str = obj.toString();
						} else {
							str = _shared.Natives.functionToString.call(obj);
						};
						var result = str.match(/function\s+([^(\s]*)[^(]*\(/);
						return result && result[1] || null;
					};
				} else {
					return null;
				};
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
				return (obj == null);
			}));
		
		// FUTURE: "types.extend(_shared.Natives, {...})" when "Object.assign" will be accessible on every engine
		_shared.Natives = {
			// General
			windowFunction: global.Function,
			windowObject: global.Object,
			stringReplace: global.String.prototype.replace,
			//numberToString: global.Number.prototype.toString,

			// "hasInherited"
			objectPrototype: global.Object.prototype,
			
			// "has", "isCustomFunction", "isNativeFunction"
			// FUTURE: Remove when "Natives" will be "types.extend"ed
			objectHasOwnProperty: global.Object.prototype.hasOwnProperty,
			
			// "isCustomFunction", "isNativeFunction", "isArrowFunction", "getFunctionName"
			// FUTURE: Remove when "Natives" will be "types.extend"ed
			functionToString: global.Function.prototype.toString,
				
			// "extend"
			objectAssign: (types.isNativeFunction(global.Object.assign) ? global.Object.assign : undefined),
			
			// "createObject"
			objectCreate: global.Object.create,
			
			// "hasDefinePropertyEnabled" and "defineProperty"
			objectDefineProperty: (types.isNativeFunction(global.Object.defineProperty) ? global.Object.defineProperty : undefined),
			
			// "defineProperties"
			objectDefineProperties: (types.isNativeFunction(global.Object.defineProperties) ? global.Object.defineProperties : undefined),
			
			// "allKeys"
			objectGetOwnPropertyNames: (types.isNativeFunction(global.Object.getOwnPropertyNames) ? global.Object.getOwnPropertyNames : undefined),
			
			// "getOwnPropertyDescriptor"
			objectGetOwnPropertyDescriptor: (types.isNativeFunction(global.Object.getOwnPropertyDescriptor) ? global.Object.getOwnPropertyDescriptor : undefined),
			
			// "getPrototypeOf"
			objectGetPrototypeOf: (types.isNativeFunction(global.Object.getPrototypeOf) ? global.Object.getPrototypeOf : undefined),
			
			// "isPrototypeOf"
			objectIsPrototypeOf: (types.isNativeFunction(global.Object.prototype.isPrototypeOf) ? global.Object.prototype.isPrototypeOf : undefined),
			
			// "keys"
			objectKeys: (types.isNativeFunction(global.Object.keys) ? global.Object.keys : undefined),
			
			// "isEnumerable", "symbols"
			objectPropertyIsEnumerable: (types.isNativeFunction(global.Object.prototype.propertyIsEnumerable) ? global.Object.prototype.propertyIsEnumerable : undefined),
			
			// "setPrototypeOf"
			objectSetPrototypeOf: (types.isNativeFunction(global.Object.setPrototypeOf) ? global.Object.setPrototypeOf : undefined),
			
			// "isArray", "isObject", "isJsObject", "isCallable"
			objectToString: global.Object.prototype.toString,
			
			// "isArray"
			arrayIsArray: (types.isNativeFunction(global.Array.isArray) ? global.Array.isArray : undefined),
			arraySplice: global.Array.prototype.splice,

			// "isArray"
			windowArray: (types.isNativeFunction(global.Array) ? global.Array : undefined),
			
			// "isBoolean"
			windowBoolean: (types.isNativeFunction(global.Boolean) ? global.Boolean : undefined),
			
			// "isDate"
			windowDate: (types.isNativeFunction(global.Date) ? global.Date : undefined),
			
			// "createErrorType", "isError"
			windowError: (global.Error || Error), // NOTE: "node.js" does not include "Error" in "global".

			windowTypeError: (types.isNativeFunction(global.TypeError) ? global.TypeError : undefined),
			
			// "isNumber", "toInteger"
			windowNumber: global.Number,
			
			// "isString"
			windowString: (types.isNativeFunction(global.String) ? global.String : undefined),
			
			// "hasSymbols", "isSymbol", "getSymbol"
			windowSymbol: (types.isNativeFunction(global.Symbol) ? global.Symbol : undefined),
			
			// "getSymbolFor"
			symbolFor: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol['for']) ? global.Symbol['for'] : undefined),
			
			// "getSymbolKey", "symbolIsGlobal"
			symbolToString: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol.prototype.toString) ? global.Symbol.prototype.toString : undefined),
			symbolValueOf: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol.prototype.valueOf) ? global.Symbol.prototype.valueOf : undefined),
			symbolKeyFor: (types.isNativeFunction(global.Symbol) && types.isNativeFunction(global.Symbol.keyFor) ? global.Symbol.keyFor : undefined),
			
			// "getSymbolFor", "getSymbolKey"
			//windowWeakMap: (types.isNativeFunction(global.WeakMap) ? global.WeakMap : undefined),
			
			// "is*"
			symbolToStringTag: (types.isNativeFunction(global.Symbol) && (typeof global.Symbol.toStringTag === 'symbol') ? global.Symbol.toStringTag : undefined),
			numberValueOf: global.Number.prototype.valueOf,
			booleanValueOf: global.Boolean.prototype.valueOf,
			stringValueOf: global.String.prototype.valueOf,
			dateValueOf: global.Date.prototype.valueOf,

			// "isNaN"
			numberIsNaN: (global.Number && types.isNativeFunction(global.Number.isNaN) ? global.Number.isNaN : undefined),

			// "isFinite"
			numberIsFinite: (global.Number && types.isNativeFunction(global.Number.isFinite) ? global.Number.isFinite : undefined),
			
			// "append"
			arrayPush: (global.Array && global.Array.prototype || []).push,
			
			// "isInteger"
			numberIsInteger: (global.Number && types.isNativeFunction(global.Number.isInteger) ? global.Number.isInteger : undefined),

			// "trim"
			stringTrim: (types.isNativeFunction(global.String.prototype.trim) ? global.String.prototype.trim : undefined),
			
			// "depthExtend"
			functionBind: global.Function.prototype.bind,
			
			// "isSafeInteger"
			numberIsSafeInteger: (types.isNativeFunction(global.Number.isSafeInteger) ? global.Number.isSafeInteger : undefined),

			// "isSafeInteger", "toInteger", "toFloat"
			mathFloor: global.Math.floor,
			mathAbs: global.Math.abs,
			mathPow: global.Math.pow,
			
			// "sealObject"
			objectSeal: (types.isNativeFunction(global.Object.seal) ? global.Object.seal : undefined),
			
			// "isFrozen"
			objectIsFrozen: (types.isNativeFunction(global.Object.isFrozen) ? global.Object.isFrozen : undefined),
			
			// "freezeObject"
			objectFreeze: (types.isNativeFunction(global.Object.freeze) ? global.Object.freeze : undefined),
			
			// "isExtensible"
			objectIsExtensible: (types.isNativeFunction(global.Object.isExtensible) ? global.Object.isExtensible : undefined),

			// "preventExtensions"
			objectPreventExtensions: (types.isNativeFunction(global.Object.preventExtensions) ? global.Object.preventExtensions : undefined),
			
			// "allSymbols", "symbols"
			objectGetOwnPropertySymbols: (types.isNativeFunction(global.Object.getOwnPropertySymbols) ? global.Object.getOwnPropertySymbols : undefined),
			
			// "isSafeInteger"
			numberMaxSafeInteger: global.Number.MAX_SAFE_INTEGER || global.Math.pow(2, __Internal__.SAFE_INTEGER_LEN) - 1,
			numberMinSafeInteger: global.Number.MIN_SAFE_INTEGER || -global.Math.pow(2, __Internal__.SAFE_INTEGER_LEN) + 1,
			
			// "hasProxies", "hasProxyEnabled", "createProxy"
			windowProxy: (types.isNativeFunction(global.Proxy) ? global.Proxy : undefined),

			// generateUUID
			mathRandom: global.Math.random,

			// AssertionError
			consoleAssert: (types.isNativeFunction(global.console.assert) ? global.console.assert.bind(global.console) : undefined),
		};

		//===================================
		// For old browsers
		//===================================
		
		if (!_shared.Natives.objectGetPrototypeOf || !_shared.Natives.objectSetPrototypeOf) {
			_shared.Natives.objectGetPrototypeOf = undefined;
			_shared.Natives.objectSetPrototypeOf = undefined;
			_shared.Natives.objectIsPrototypeOf = undefined;
		};
		
//IE8		//===================================
//IE8		// IE 8 Bug
//IE8		//===================================
//IE8		
//IE8		try {
//IE8			_shared.Natives.objectDefineProperty({}, 'test', {value: 1});
//IE8		} catch(ex) {
//IE8			_shared.Natives.objectDefineProperty = undefined;
//IE8			_shared.Natives.objectDefineProperties = undefined;
//IE8			_shared.Natives.objectGetOwnPropertyDescriptor = undefined;
//IE8		};

		//===================================
		// Eval
		//===================================
		
		// WARNING: NOT to be used with arbitrary expressions.
		
		__Internal__.ADD('eval', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
						description: "Evaluates an expression accross JS engines. NOT to be used with arbitrary expressions.",
			}
			//! END_REPLACE()
			, function _eval(expr, /*optional*/ctx) {
				if (ctx) {
//					types.freezeObject(ctx);
					return __Internal__.evals.evalWithCtx(ctx, expr);
				} else {
					return __Internal__.evals.eval(expr);
				};
			}));

		__Internal__.ADD('evalStrict', __Internal__.DD_DOC(
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
			, function evalStrict(expr, /*optional*/ctx) {
				if (ctx) {
					return __Internal__.evals.evalWithCtxStrict(ctx, expr);
				} else {
					return __Internal__.evals.evalStrict(expr);
				};
			}));

		//===================================
		// String Tools
		//===================================
		
		__Internal__.ADD_TOOL('split', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							str: {
								type: 'string',
								optional: false,
								description: "String to split",
							},
							separator: {
								type: 'string,RegExp',
								optional: true,
								description: "Separator",
							},
							limit: {
								type: 'integer',
								optional: true,
								description: "Number of items.",
							},
						},
						returns: 'arrayof(string)',
						description: "Proper 'limit' argument for the 'String.prototype.split' function.",
			}
			//! END_REPLACE()
			, function split(str, /*optional*/separator, /*optional*/limit) {
				// TODO: Unit tests
				if (types.isNothing(str) || (limit === 0)) {
					return [];
				};
				if (types.isNothing(separator) || (limit === 1)) {
					return [str];
				};
				if (types.isNothing(limit)) {
					return str.split(separator);
				};
				var result;
				if (separator === '') {
					// Char array
					limit--;
					result = str.slice(0, limit).split('');
					if (result.length < str.length) {
						// Remaining
						result[result.length] = str.slice(limit);
					};
				} else if (types.isString(separator)) {
					var last = 0,
						sepLen = separator.length,
						index;
					result = [];
					while ((limit > 1) && ((index = str.indexOf(separator, last)) >= 0)) {
						result[result.length] = str.slice(last, index);
						last = index + sepLen;
						limit--;
					};
					if ((limit > 0) && (last <= str.length)) {
						// Remaining
						result[result.length] = str.slice(last);
					};
				} else { // RegExp
					var matches,
						strLen = str.length;
					result = [];
					separator.lastIndex = 0;
					while ((limit > 1) && (matches = separator.exec(str))) {
						var index = matches.index;
						result[result.length] = str.slice(0, index);
						str = str.slice(index + matches[0].length);
						limit--;
						separator.lastIndex = 0;
					};
					if ((limit > 0) && (str.length <= strLen)) {
						// Remaining
						result[result.length] = str;
					};
				};
				return result;
			}));

		__Internal__.ADD_TOOL('trim', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
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
				var isArray = types.isArray(str);

				if (types.isNothing(chr)) {
					chr = ' ';
				};
				if (types.isNothing(count)) {
					count = Infinity;
				};
				
				if (isArray || (arguments.length > 1)) {
					var strLen = str.length;
					
					var start = 0,
						x = 0;
					if (!direction || direction > 0) {
						for (; start < strLen; start++, x++) {
							if ((x >= count) || (str[start] !== chr)) {
								break;
							};
						};
					};

					var end = strLen - 1;
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
						return (isArray ? [] : '');
					};
					
				} else if (_shared.Natives.stringTrim && (chr === ' ') && !direction && (count === Infinity)) {
					return _shared.Natives.stringTrim.call(str);
				} else {
					var i = 0,
						x = 0,
						chrLen = chr.length;
					if (chrLen <= 0) {
						chrLen = 1;
					};
					if (!direction || (direction > 0)) {
						while ((x < count) && (i < str.length) && (str.slice(i, i + chrLen) === chr)) {
							i += chrLen;
							x++;
						};
					};
					var j = str.length - chrLen,
						x = 0;
					if (!direction || (direction < 0)) {
						while ((x < count) && (j > i) && (j >= 0) && (str.slice(j, j + chrLen) === chr)) {
							j -= chrLen;
							x++;
						};
					};
					return str.slice(i, j + chrLen);
				};
			}));

		//===================================
		// Array Tools
		//===================================
	
		__Internal__.ADD_TOOL('map', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
					author: "Claude Petit",
					revision: 1,
					params: {
						obj: {
							type: 'arraylike,object,Map,Set',
							optional: false,
							description: "An object to scan.",
						},
						fn: {
							type: 'function',
							optional: false,
							description: 
								"A function to call. Arguments passed to the function are : \n" +
								"  value (any): The current value\n" +
								"  key (integer,string): The current index or attribute name\n" +
								"  obj (arraylike,object,Map,Set): A reference to the object"
						},
						thisObj: {
							type: 'any',
							optional: true,
							description: "Value of 'this' when calling the function. Default is 'undefined'.",
						},
					},
					returns: 'array,object',
					description: "For each item of the array (or the object), maps the value to another value than returns a new array (or a new object instance).",
			}
			//! END_REPLACE()
			, function map(obj, fn, /*optional*/thisObj) {
				if (!types.isNothing(obj)) {
					obj = Object(obj);
					if (types._instanceof(obj, types.Set)) {
						var len = obj.length,
							result = new types.Set();
						obj.forEach(function(value, key, obj) {
							result.add(fn.call(thisObj, value, key, obj));
						});
						return result;
					} else if (types._instanceof(obj, types.Map)) {
						var len = obj.length,
							result = new types.Map();
						obj.forEach(function(value, key, obj) {
							result.set(key, fn.call(thisObj, value, key, obj));
						});
						return result;
					} else if (types.isArrayLike(obj)) {
						if (_shared.Natives.arrayMap) {
							return _shared.Natives.arrayMap.call(obj, fn, thisObj);
						} else {
							var len = obj.length,
								result = Array(len);
							for (var key = 0; key < len; key++) {
								if (key in obj) {
									result[key] = fn.call(thisObj, obj[key], key, obj);
								};
							};
							return result;
						};
					} else {
						var result = types.createObject(types.getPrototypeOf(obj));
						var keys = types.keys(obj),
							len = keys.length, // performance
							i, 
							key;
						for (i = 0; i < len; i++) {
							key = keys[i];
							result[key] = fn.call(thisObj, obj[key], key, obj);
						};
						return result;
					};
				};
			}));

		//==================================
		// Conversion
		//==================================
		
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

		__Internal__.ADD('toInteger', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
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
				// Source: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/from
				var number = _shared.Natives.windowNumber(obj);
				if (types.isNaN(number)) {
					return 0;
				};
				if ((number === 0) || !types.isFinite(number)) {
					return number;
				};
				return (number > 0 ? 1 : -1) * _shared.Natives.mathFloor(_shared.Natives.mathAbs(number));
			}));
		
		__Internal__.ADD('toFloat', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
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
				var number = _shared.Natives.windowNumber(obj);
				if (types.isNaN(number)) {
					return 0.0;
				} else {
					if (!types.isNothing(precision)) {
						precision = _shared.Natives.mathPow(10, precision);
						number = _shared.Natives.mathFloor(number * precision) / precision;
					};
					return number;
				};
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
				var result = '',
					pos,
					lastPos = 0,
					isKey = false;
				while ((pos = message.indexOf('~', lastPos)) >= 0) {
					var key = message.slice(lastPos, pos);
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
			
		var __ASSERT__ = __Internal__.DD_DOC(
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
					debugger;
					throw new types.AssertionError(message);
				};
			});
		
		//==================
		// Utilities
		//==================
		
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
				var type = (typeof obj);
				return (type !== "object") && (type !== "function");
			}));
		
		__Internal__.ADD('isNumber', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a number (integer or float). Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isNumber(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOf.call(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				return (obj === obj); // Not NaN
			}));
		
		__Internal__.ADD('isInteger', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 6,
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
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOf.call(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (obj !== obj) {
					// NaN
					return false;
				};
				if (_shared.Natives.numberIsInteger) {
					// <PRB> "Number.isInteger(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
					return _shared.Natives.numberIsInteger(obj);
				} else {
					if (!types.isFinite(obj)) {
						return false;
					};
					return (obj === _shared.Natives.mathFloor(obj));
				};
			}));
		
		__Internal__.ADD('isSafeInteger', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an integer that correctly fits into 'Number'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isSafeInteger(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOf.call(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (obj !== obj) {
					// NaN
					return false;
				};
				if (_shared.Natives.numberIsSafeInteger) {
					// <PRB> "Number.isSafeInteger(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
					return _shared.Natives.numberIsSafeInteger(obj);
				} else {
					return (obj >= _shared.Natives.numberMinSafeInteger) && (obj <= _shared.Natives.numberMaxSafeInteger);
				};
			}));
		
		// <FUTURE> Remove "getSafeIntegerLen".
		__Internal__.ADD('getSafeIntegerBounds', __Internal__.ADD('getSafeIntegerLen', __Internal__.DD_DOC(
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
					__Internal__.safeIntegerLen = types.freezeObject(types.nullObject({
						len: __Internal__.SAFE_INTEGER_LEN, 
						min: _shared.Natives.numberMinSafeInteger, 
						max: _shared.Natives.numberMaxSafeInteger,
					}));
				};
				return __Internal__.safeIntegerLen;
			})));
		
		// <FUTURE> Remove "getBitwiseIntegerLen".
		__Internal__.ADD('getBitwiseIntegerBounds', __Internal__.ADD('getBitwiseIntegerLen', __Internal__.DD_DOC(
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
					__Internal__.bitwiseIntegerLen = types.freezeObject(types.nullObject({
						len: __Internal__.BITWISE_INTEGER_LEN, 
						min: __Internal__.MIN_BITWISE_INTEGER, 
						max: __Internal__.MAX_BITWISE_INTEGER,
					}));
				};
				return __Internal__.bitwiseIntegerLen;
			})));
		
		__Internal__.ADD('isFinite', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a finite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFinite(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOf.call(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (obj !== obj) {
					// NaN
					return false;
				};
				if (_shared.Natives.numberIsFinite) {
					// <PRB> "Number.isFinite(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
					return _shared.Natives.numberIsFinite(obj);
				} else {
					if (types.isDate(obj)) {
						return false;
					};
					// Source: http://es6-features.org/#NumberTypeChecking
					return (obj === obj) && (obj !== Infinity) && (obj !== -Infinity);
				};
			}));
		
		__Internal__.ADD('isInfinite', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an infinite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isInfinite(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOf.call(obj);
					};
				};
				return (obj === Infinity) || (obj === -Infinity);
			}));
		
		__Internal__.ADD('isFloat', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a float. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFloat(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOf.call(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (obj !== obj) {
					// NaN
					return false;
				};
				if (!types.isFinite(obj)) {
					return false;
				};
				return (obj !== (obj | 0));
			})),
		
		// <PRB> JS has no function to test for booleans
		__Internal__.ADD('isBoolean', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a boolean. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isBoolean(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Boolean')) {
						try {
							obj = _shared.Natives.booleanValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object Boolean]') {
						return false;
					} else {
						obj = _shared.Natives.booleanValueOf.call(obj);
					};
				};
				return (typeof obj === 'boolean');
			}));
		
		// <PRB> JS has no function to test for strings
		__Internal__.ADD('isString', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a string. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isString(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'String')) {
						try {
							obj = _shared.Natives.stringValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object String]') {
						return false;
					} else {
						obj = _shared.Natives.stringValueOf.call(obj);
					};
				};
				return (typeof obj === 'string');
			}));
		
		// <PRB> JS has no function to test for dates
		__Internal__.ADD('isDate', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a date. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isDate(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj !== 'object') {
					return false;
				};
				if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Date')) {
					try {
						_shared.Natives.dateValueOf.call(obj);
						return true;
					} catch(o) {
						return false;
					};
				} else {
					return (_shared.Natives.objectToString.call(obj) === '[object Date]');
				};
			}));
		
		__Internal__.ADD('isArray', (_shared.Natives.arrayIsArray || __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an array. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isArray(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj !== 'object') {
					return false;
				};
				if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Array')) {
					try {
						_shared.Natives.arraySplice.call(obj, 0, 0);
					} catch(o) {
						return false;
					};
				};
				return (_shared.Natives.objectToString.call(obj) === '[object Array]');
			})));

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
					var len = obj.length;
					return (typeof len === 'number') && ((len >>> 0) === len);
				} else if (types.isString(obj)) {
					return true;
				} else {
					return false;
				};
			}));
		
		// <PRB> JS has no function to test for errors
		__Internal__.ADD('isError', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an error. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isError(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj !== 'object') {
					return false;
				};
				//if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Error')) {
				//	????
				//};
				// <PRB> Object.prototype.toString ignores custom errors inherited from Error.
				return (_shared.Natives.objectToString.call(obj) === '[object Error]') || types.isErrorType(obj.constructor);
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
				//     Unbelievable : There was no official way to detect NaN before ES6 !!!!
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Number')) {
						try {
							obj = _shared.Natives.numberValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object Number]') {
						return false;
					} else {
						obj = _shared.Natives.numberValueOf.call(obj);
					};
				};
				if (typeof obj !== 'number') {
					return false;
				};
				if (_shared.Natives.numberIsNaN) {
					return _shared.Natives.numberIsNaN(obj);
				} else {
					// Explanation: NaN is the only object not equal to itself.
					return (obj !== obj); // NaN
				};
			}));
		
		__Internal__.ADD('isCallable', __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is callable. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isCallable(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'function') {
					return true;
				};
				if (typeof obj !== 'object') {
					return false;
				};
				if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Function')) {
					try {
						_shared.Natives.functionToString.call(obj);
					} catch(o) {
						return false;
					};
				} else {
					return (_shared.Natives.objectToString.call(obj) === '[object Function]');
				};
			}));
			
		
		//===================================
		// Stack functions
		//===================================
		// <PRB> JS has no official stack trace. They are non-standardized strings.
		
		__Internal__.stackToString = function stackToString() {
			var str = '';
			var len = this.length;
			for (var i = 0; i < len; i++) {
				var trace = this[i];
				str += (i + ': function "' + (trace.functionName || '<unknown>') + '" in file "' + (trace.path || '<unknown>') + '" at line ' + (trace.lineNumber < 0 ? '<unknown>' : trace.lineNumber) + ', column ' + (trace.columnNumber < 0 ? '<unknown>' : trace.columnNumber) + '\n');
			};
			return str;
		};

		// NOTE: It removes native functions from the stack
		// <FUTURE> thread level
		__Internal__.parseStackRegEx = / at ([^\[(@ ]+)?( [\[]as [^\]]+[\]])? ?[(@]?(([a-zA-Z]+[:][\/][\/][\/]?[^\/]+[\/][^: ]+)|([A-Z][:][\\][^\\]+[\\][^:]+)|([\/][^\/]+[\/][^:]+)|eval code)( line ([0-9]+) [>] eval)?(([:])([0-9]+)([:])([0-9]+))?/gm;

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
				
				var stack = ex;
				if (types.isError(ex)) {
					stack = ex.stack || null;
				};
				
				if (!stack) {
					return null;
				};
				
				// Google Chrome 39: "Error\n    at Object.Doodad.Tools.getCurrentScript (file:///F:/Doodad/test.html:38:72)\n    at file:///F:/Doodad/debug.js:17:25"
				// Firefox 34: "Doodad.Tools.getCurrentScript<@file:///F:/Doodad/test.html:38:72@file:///F:/Doodad/debug.js:17:18"
				// IE 11: "Error\n   at Doodad.Tools.getCurrentScript (file:///F:/Doodad/test.html:38:66)\n   at Global code (file:///F:/Doodad/debug.js:7:1)"
				// Opera 26: "Error: file:///F:/Doodad/debug.js\n    at Object.Doodad.Tools.getCurrentScript (file:///F:/Doodad/test.html:37:78)\n    at file:///F:/Doodad/debug.js:33:21"
				// Safari 5 (win): undefined
				
				// NOTE: Internet Explorer 11 doesn't return more than 10 call levels.
				
				var rawFunctionName,
					functionName, 
					pos,
					calls = [];
				//stack = 'Error\n    at D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:83:122\n    at D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:83:160\n    at D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Types.js:1866:18\n    at Function._try (D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Types.js:1864:15)\n    at Function._try [as try] (D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Types.js:1933:28)\n    at Object.locate (D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:81:28)\n    at Namespace.loadTypes (D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:153:42)\n    at ModuleEntry.init [as objectInit] (D:\\Doodad\\node_modules\\doodad-js-mime\\src\\common\\Tools_Mime.js:184:18)\n    at Object.initNamespace (D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Namespaces.js:567:28)\n    at loopInitModules (D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Namespaces.js:767:33)\n    at D:\\Doodad\\node_modules\\doodad-js\\src\\common\\Namespaces.js:773:17'
				__Internal__.parseStackRegEx.lastIndex = 0;
				var call = __Internal__.parseStackRegEx.exec(stack);
				
				if (!call) {
					return null;
				};
				
				do {
					functionName = call[1] || '';
					pos = functionName.indexOf(' at '); // Not Firefox beginning of function name
					if (pos >= 0) {
						functionName = functionName.slice(pos + 4);
					};
					rawFunctionName = functionName + (call[2] || '');
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
					var path = call[4],
						url,
						isSystemPath = false;
					if (!path) {
						// File system path
						isSystemPath = true;
						path = call[5];
						if (!path) {
							path = call[6];
						};
					};
					calls.push({
						rawFunctionName: rawFunctionName,
						functionName: ((functionName === "eval code") ? '' : functionName),
						path: (path || ''),
						lineNumber: types.toInteger(call[8] || call[11] || -1),
						columnNumber: types.toInteger(call[13] || -1),
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
						revision: 0,
						params: null,
						returns: 'object',
						description: "Returns the current stack trace, already parsed.",
			}
			//! END_REPLACE()
			, function getStackTrace() {
				try {
					throw new _shared.Natives.windowError("");
				} catch(ex) {
					var stack = null;
					if (ex.stack) {
						stack = tools.parseStack(ex.stack);
						if (stack) {
							stack.splice(0, 1);  // remove "getStackTrace" call entry
						};
					};
					return stack;
				};
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
						return _shared.Natives.objectHasOwnProperty.call(obj, keys);
					};
					var len = keys.length;
					if (!len) {
						return false;
					};
					for (var i = 0; i < len; i++) {
						if (i in keys) {
							var key = keys[i];
							if (_shared.Natives.objectHasOwnProperty.call(obj, key)) {
								return true;
							};
						};
					};
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
				var hasKey = (inherited ? types.hasInherited : types.has);
				if (hasKey(obj, key)) {
					return obj[key];
				} else {
					return _default;
				};
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
				var hasKey = (inherited ? types.hasInherited : types.has);
				if (hasKey(obj, key)) {
					return obj[key];
				} else {
					var descriptor = types.getPropertyDescriptor(obj, key);
					if (descriptor && !types.get(descriptor, 'writable') && !types.get(descriptor, 'get') && !types.get(descriptor, 'set') && types.get(descriptor, 'configurable')) {
						descriptor.value = _default;
						types.defineProperty(obj, key, descriptor);
					} else {
						obj[key] = _default;
					};
					return _default;
				};
			}));
		
		
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
			, (_shared.Natives.objectPropertyIsEnumerable ? function isEnumerable(obj, key) {
				return _shared.Natives.objectPropertyIsEnumerable.call(obj, key);
			} : function isEnumerable(obj, key) {
				return true;
			})));
		
//IE8		// "Object.keys" Polyfill from Mozilla Developer Network.
//IE8		// NOTE: "hasDontEnumBug" is "true" when a property in "defaultNonEnumerables" is still non-enumerable with "for (... in ...)" while being changed to an own property.
//IE8		__Internal__.hasDontEnumBug = !types.isEnumerable({ toString: null }, 'toString');
//IE8		__Internal__.defaultNonEnumerables = [
//IE8		  'toString',
//IE8		  'toLocaleString',
//IE8		  'valueOf',
//IE8		  'hasOwnProperty',
//IE8		  'isPrototypeOf',
//IE8		  'propertyIsEnumerable',
//IE8		  'constructor',
//IE8		  'length',
//IE8		];
		
		__Internal__.isArrayIndex = /^(0|[1-9][0-9]*)$/;

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
				// Returns enumerable own properties (those not inherited).
				// Doesn't not include array items.
				if (types.isNothing(obj)) {
					return [];
				};
				
				obj = _shared.Natives.windowObject(obj);

				var result,
					key;
					
				if (types.isArrayLike(obj)) {
					result = [];
					for (key in obj) {
						if (types.has(obj, key) && !__Internal__.isArrayIndex.test(key)) {
							result.push(key);
						};
					};
				} else if (_shared.Natives.objectKeys) {
					 result = _shared.Natives.objectKeys(obj);
				} else {
					// Polyfill from Mozilla Developer Network.
					result = [];
					for (key in obj) {
						if (types.has(obj, key)) {
							result.push(key);
						};
					};
				};
				
//IE8				if (__Internal__.hasDontEnumBug) {
//IE8					for (var i = 0; i < __Internal__.defaultNonEnumerables.length; i++) {
//IE8						key = __Internal__.defaultNonEnumerables[i];
//IE8						if (types.has(obj, key)) {
//IE8							result.push(key);
//IE8						};
//IE8					};
//IE8				};

				return result;
			}));
		
		__Internal__.ADD('allKeys', (_shared.Natives.objectGetOwnPropertyNames || __Internal__.DD_DOC(
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
						description: "Returns every own property of an object.",
			}
			//! END_REPLACE()
			, (function allKeys(obj) {
				// NOTE: Can't get non-enumerables from the polyfill
				if (types.isNothing(obj)) {
					return [];
				};
				obj = _shared.Natives.windowObject(obj);
				var result = [];
				for (var key in obj) {
					if (types.has(obj, key)) {
						result.push(key);
					};
				};
				return result;
			}))));

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
				return types.unique(types.allKeys(obj), types.allKeysInherited(types.getPrototypeOf(obj)));
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
				var all = types.allSymbols(obj);
				var symbols = [];
				for (var i = 0; i < all.length; i++) {
					var symbol = all[i];
					if (types.isEnumerable(obj, symbol)) {
						symbols.push(symbol);
					};
				};
				return symbols;
			}));
		
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
			, (_shared.Natives.objectGetOwnPropertySymbols ? 
			function symbols(obj) {
				if (types.isNothing(obj)) {
					return [];
				};
				return _shared.Natives.objectGetOwnPropertySymbols(obj);
			}
			:
			function symbols(obj) {
				// Not supported
				return [];
			})));

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
				return types.unique(types.allSymbols(obj), types.allSymbolsInherited(types.getPrototypeOf(obj)));
			}));
		
		__Internal__.ADD('extend', (_shared.Natives.objectAssign || __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
						params: {
							paramarray: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'object',
						description: "Extends the first object with owned properties of the other objects.",
			}
			//! END_REPLACE()
			, function extend(/*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					var len = arguments.length;
					for (var i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// Part of "Object.assign" Polyfill from Mozilla Developer Network.
						obj = _shared.Natives.windowObject(obj);
						var keys = types.append(types.keys(obj), types.symbols(obj));
						for (var j = 0; j < keys.length; j++) {
							var key = keys[j];
							result[key] = obj[key];
						};
					};
				};
				return result;
			})));
			
		__Internal__.hasDefinePropertyBug = (function() {
			// Safari 5
			if (_shared.Natives.objectDefineProperty) {
				var o = {};
				delete o.doodad; // in case of "doodad" is in "Object.prototype"
				_shared.Natives.objectDefineProperty(o, 'doodad', {value: 1, configurable: true});
				_shared.Natives.objectDefineProperty(o, 'doodad', {value: 2, configurable: true});
				return (o.doodad !== 2);
			} else {
				return false;
			};
		})();
		
		__Internal__.hasGetOwnPropertyRestrictionOnCaller = false;
		(function() {
			// Edge
			var ctx = {
				getOwnPropertyDescriptor: _shared.Natives.objectGetOwnPropertyDescriptor,
			};
			ctx.f = types.eval(
				"function() {" +
					"return ctx.getOwnPropertyDescriptor(ctx.f, 'caller');" +
				"}", ctx);
			try {
				ctx.f();
			} catch(o) {
				__Internal__.hasGetOwnPropertyRestrictionOnCaller = true;
			};
		})();

		__Internal__.ADD('hasProperties', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'boolean',
						description: "Returns 'true' if properties are available. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (!__Internal__.hasDefinePropertyBug && _shared.Natives.objectDefineProperty ? (function hasProperties() {
				return true;
			}) : (function hasProperties() {
				return false;
			}))));
		
		__Internal__.ADD('defineProperty', __Internal__.DD_DOC(
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
			, (!__Internal__.hasDefinePropertyBug && _shared.Natives.objectDefineProperty ? (function defineProperty(obj, name, descriptor) {
				// <PRB> "Object.defineProperty" stupidly takes inherited properties instead of just own properties. So we fix that because of "Object.prototype".
				descriptor = types.extend(types.createObject(null), descriptor);
				types.getDefault(descriptor, 'configurable', false);
				types.getDefault(descriptor, 'enumerable', false);
				if (!types.get(descriptor, 'get') && !types.get(descriptor, 'set')) {
					types.getDefault(descriptor, 'writable', false);
				};
				return _shared.Natives.objectDefineProperty(obj, name, descriptor);
			}) : (function defineProperty(obj, name, descriptor) {
				descriptor = types.extend(types.createObject(null), descriptor);
				if (descriptor.get || descriptor.set || !descriptor.enumerable || !descriptor.writable || !descriptor.configurable) {
					throw new global.Error("Properties are not supported.");
				} else {
					if (!types.isObjectLike(obj)) {
						throw new global.Error("Not an object.");
					};
					obj[name] = descriptor.value;
				};
			})))),

		__Internal__.ADD('defineProperties', (!__Internal__.hasDefinePropertyBug && _shared.Natives.objectDefineProperties ? _shared.Natives.objectDefineProperties : __Internal__.DD_DOC(
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
							props: {
								type: 'object',
								optional: false,
								description: "An object of properties with their descriptor.",
							},
						},
						returns: 'undefined',
						description: "Defines properties of the object.",
			}
			//! END_REPLACE()
			, (function defineProperties(obj, props) {
				if (!types.isObject(props)) {
					throw new types.TypeError("Invalid properties.");
				};
				var keys = types.append(types.keys(props), types.symbols(props));
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					types.defineProperty(obj, key, props[key]);
				};
			}))));

		if (_shared.Natives.objectGetOwnPropertyDescriptor && !__Internal__.hasDefinePropertyBug && !__Internal__.hasGetOwnPropertyRestrictionOnCaller) {
			__Internal__.ADD('getOwnPropertyDescriptor', _shared.Natives.objectGetOwnPropertyDescriptor);
		} else {
			__Internal__.ADD('getOwnPropertyDescriptor', __Internal__.DD_DOC(
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
				, (_shared.Natives.objectGetOwnPropertyDescriptor ? function getOwnPropertyDescriptor(obj, key) {
					var desc;
					if (__Internal__.hasGetOwnPropertyRestrictionOnCaller && (key === 'caller')) {
						desc = {
							configurable: false,
							enumerable: false,
							value: null,
							writable: false,
						};
					} else {
						desc = _shared.Natives.objectGetOwnPropertyDescriptor(obj, key);
						if (__Internal__.hasDefinePropertyBug) {
							if (desc && !desc.writable && !desc.get && !desc.set) {
								desc.configurable = false;
							};
						};
					};
					return desc;
				} : function getOwnPropertyDescriptor(obj, key) {
					if (types.has(obj, key)) {
						return {
							writable: true,
							configurable: true,
							enumerable: true,
							value: obj[key],
						};
					} else {
						return undefined;
					};
				})));
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
				obj = _shared.Natives.windowObject(obj);
				var proto = obj,
					descriptor = undefined;
				if (key in obj) {
					do {
						descriptor = types.getOwnPropertyDescriptor(proto, key);
					} while (!descriptor && (proto = types.getPrototypeOf(proto)));
				};
				return descriptor;
			}));
		
		__Internal__.ADD('createObject', (_shared.Natives.objectCreate || __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							proto: {
								type: 'object',
								optional: false,
								description: "An object defining the prototype of the new object.",
							},
							properties: {
								type: 'object',
								optional: true,
								description: "Properties, with their descriptor, to append to the new object.",
							},
						},
						returns: 'object',
						description: "Creates an object with the specified prototype. Optionally appends properties.",
			}
			//! END_REPLACE()
			, (__Internal__.hasProto ? 
					// Enhanced polyfill taken from Mozilla Developer Network. 
					(function() {
						var tmp = function Object() {};
						return (function createObject(proto, /*optional*/properties) {
							tmp.prototype = proto;
							var obj = new tmp();
							tmp.prototype = null; // free memory

							if (properties) {
								types.defineProperties(obj, properties);
							};
							
							return obj;
						});
					})()
				:
					(function createObject(proto, /*optional*/properties) {
						var tmp = function Object() {};
						tmp.prototype = proto;
						var obj = new tmp();

						if (properties) {
							types.defineProperties(obj, properties);
						};

//IE8						if (!_shared.Natives.objectGetPrototypeOf) {
//IE8							types.defineProperty(obj, '__dd_proto__', {value: proto, configurable: true, enumerable: true, writable: true});
//IE8						};
						
						return obj;
					})
			))));

		__Internal__.ADD('newInstance', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
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
						description: "Instantiates an object from the specified object type with provided constructor arguments.",
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
				var obj;
				if (args && args.length) {
					if (__Internal__.classesNotCallable && types.isJsClass(type)) {
						obj = types.eval("new ctx.type(...ctx.args)", {type: type, args: args});
					} else {
						obj = types.createObject(type.prototype, {
							constructor: {
								value: type,
							},
						});
						obj.constructor.apply(obj, args);
					};
				} else {
					obj = new type();
				};
				return obj;
			}));
		
		__Internal__.ADD('getPrototypeOf', (_shared.Natives.objectGetPrototypeOf || __Internal__.DD_DOC(
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
						returns: 'object',
						description: "Returns the prototype of an object.",
			}
			//! END_REPLACE()
			, (__Internal__.hasProto ? 
					// For browsers implementing "__proto__".
					(function getPrototypeOf(obj) {
						return _shared.Natives.windowObject(obj).__proto__;
					})
				:
					(function getPrototypeOf(obj) {
						throw new global.Error("Browser not supported.");
					})
//IE8					// For very old browsers.
//IE8					(function getPrototypeOf(obj) {
//IE8						if ((obj === __Internal__.fnProto) || (obj === __Internal__.objProto)) {
//IE8							return null;
//IE8						};
//IE8						// "__dd_proto__" is injected by "types.createObject" and "types.setPrototypeOf"
//IE8						if (types.isFunction(obj)) {
//IE8							return types.get(obj, '__dd_proto__') || __Internal__.fnProto;
//IE8						} else {
//IE8							obj = _shared.Natives.windowObject(obj);
//IE8							return types.get(obj, '__dd_proto__') || (obj.constructor && obj.constructor.prototype) || __Internal__.objProto;
//IE8						};
//IE8					})
			))));
		
		__Internal__.fnProto = (_shared.Natives.objectGetPrototypeOf ? types.getPrototypeOf(function(){}) : (function(){}).constructor.prototype);
//IE8		__Internal__.objProto = (_shared.Natives.objectGetPrototypeOf ? types.getPrototypeOf({}) : (({}).constructor.prototype));
		
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
				var enabled = (forceNative || types.isFunction(obj));
				if (enabled && _shared.Natives.objectSetPrototypeOf) {
					return _shared.Natives.objectSetPrototypeOf(obj, proto);
				} else if (enabled && __Internal__.hasProto) {
					// For browsers implementing "__proto__".
					if ((obj === undefined) || (obj === null)) {
						return obj;
					};
					obj.__proto__ = proto;
					return obj; 
				} else {
					if ((obj === undefined) || (obj === null)) {
						return obj;
					};

					var tmp;
					if (types.isFunction(obj)) {
						throw new global.Error("Browser not supported.");
//IE8						// Impossible to change the prototype of the function !
//IE8						var p = proto;
//IE8						while (p) {
//IE8							for (var key in p) {
//IE8								if (!types.has(obj, key) && types.has(p, key)) {
//IE8									obj[key] = p[key];
//IE8								};
//IE8							};
//IE8							p = types.getPrototypeOf(p);
//IE8						};
//IE8						tmp = obj;
					} else {
						tmp = types.createObject(proto, {
							constructor: {
								configurable: true,
								value: obj.constructor,
								writable: true,
							},
						});
						types.extend(tmp, obj);
					};
					
//IE8					if (!_shared.Natives.objectSetPrototypeOf && !__Internal__.hasProto) {
//IE8						types.defineProperty(tmp, '__dd_proto__', {value: proto, configurable: true, enumerable: true, writable: true});
//IE8					};
					
					return tmp;
				};
			}));

		__Internal__.ADD('isPrototypeOf', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							protoObj: {
								type: 'object',
								optional: false,
								description: "An object defining a prototype.",
							},
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if the prototype is the prototype of the object. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectIsPrototypeOf ? (function isPrototypeOf(protoObj, obj) {
				// NOTE: Why does this function is part of Object prototype ?
				return _shared.Natives.objectIsPrototypeOf.call(protoObj, obj);
			}) : (function isPrototypeOf(protoObj, obj) {
				obj = _shared.Natives.windowObject(obj);
				while (obj = types.getPrototypeOf(obj)) {
					if (obj === protoObj) {
						return true;
					};
				};
				return false;
			}))));
		
		__Internal__.ADD('nullObject', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
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
			, function nullObject(/*paramarray*/) {
				return types.extend.apply(types, types.append([types.createObject(null)], arguments));
			}));

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
				};
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
					var len = keys.length;
					if (!len) {
						return false;
					};
					for (var i = 0; i < len; i++) {
						if (i in keys) {
							var key = keys[i];
							if (key in obj) {
								return true;
							};
						};
					};
				};
				return false;
			}));
		
		__Internal__.ADD('extendProperties', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							paramarray: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'object',
						description: "Extends the first object with owned properties of the other objects.",
			}
			//! END_REPLACE()
			, function extendProperties(/*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					var len = arguments.length;
					if (types.hasProperties()) {
						for (var i = 1; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							// Part of "Object.assign" Polyfill from Mozilla Developer Network.
							obj = _shared.Natives.windowObject(obj);
							var keys = types.append(types.keys(obj), types.symbols(obj));
							for (var j = 0; j < keys.length; j++) {
								var key = keys[j];
								var descriptor = types.getOwnPropertyDescriptor(obj, key);
								types.defineProperty(result, key, descriptor);
							};
						};
					} else {
						for (var i = 1; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							// Part of "Object.assign" Polyfill from Mozilla Developer Network.
							obj = _shared.Natives.windowObject(obj);
							var keys = types.append(types.keys(obj), types.symbols(obj));
							for (var j = 0; j < keys.length; j++) {
								var key = keys[j];
								result[key] = obj[key];
							};
						};
					};
				};
				return result;
			}));
			
		__Internal__.ADD('depthExtend', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 4,
						params: {
							depth: {
								type: 'integer,function',
								optional: false,
								description: "Depth, or extender function.",
							},
							paramarray: {
								type: 'any',
								optional: false,
								description: "An object.",
							},
						},
						returns: 'object',
						description: "Extends the first object with owned properties of the other objects using the specified depth.",
			}
			//! END_REPLACE()
			, function depthExtend(depth, /*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					var extender;
					if (types.isFunction(depth)) {
						extender = depth;
						depth = Infinity;
					} else {
						depth = (+depth || 0) - 1;  // null|undefined|true|false|NaN|Infinity
						extender = function(result, val, key, extend) {
							if ((extender.depth >= 0) && types.isObject(val)) {
								var resultVal = result[key];
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
							} else if (resultVal !== val) {
								result[key] = val;
							};
						};
						extender.depth = depth;
					};
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
								extender(result, obj[key], key, _shared.Natives.functionBind.call(types.depthExtend, types, extender));
							};
						};
					};
				};
				return result;
			}));
				
		__Internal__.ADD('complete', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 2,
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
			, function complete(/*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					var len = arguments.length;
					for (var i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// Part of "Object.assign" Polyfill from Mozilla Developer Network.
						obj = _shared.Natives.windowObject(obj);
						var keys = types.append(types.keys(obj), types.symbols(obj));
						for (var j = 0; j < keys.length; j++) {
							var key = keys[j];
							if (!types.has(result, key)) {
								result[key] = obj[key];
							};
						};
					};
				};
				
				return result;
			}));
		
		__Internal__.ADD('completeProperties', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
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
			, function completeProperties(/*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					result = _shared.Natives.windowObject(obj);
					var len = arguments.length;
					if (types.hasProperties()) {
						for (var i = 1; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							// Part of "Object.assign" Polyfill from Mozilla Developer Network.
							obj = _shared.Natives.windowObject(obj);
							var keys = types.append(types.keys(obj), types.symbols(obj));
							for (var j = 0; j < keys.length; j++) {
								var key = keys[j];
								if (!types.has(result, key)) {
									var descriptor = types.getOwnPropertyDescriptor(obj, key);
									types.defineProperty(result, key, descriptor);
								};
							};
						};
					} else {
						for (var i = 1; i < len; i++) {
							obj = arguments[i];
							if (types.isNothing(obj)) {
								continue;
							};
							// Part of "Object.assign" Polyfill from Mozilla Developer Network.
							obj = _shared.Natives.windowObject(obj);
							var keys = types.append(types.keys(obj), types.symbols(obj));
							for (var j = 0; j < keys.length; j++) {
								var key = keys[j];
								if (!types.has(result, key)) {
									result[key] = obj[key];
								};
							};
						};
					};
				};
				
				return result;
			}));
		
		__Internal__.ADD('append', __Internal__.DD_DOC(
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
						description: "Appends the items of each array to the first array than returns that array.",
			}
			//! END_REPLACE()
			, function append(obj /*paramarray*/) {
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
					_shared.Natives.arrayPush.apply(result, obj);
				};
				
				return result;
			}));
			
		__Internal__.ADD('unique', __Internal__.DD_DOC(
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
						obj = _shared.Natives.windowObject(obj);
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
						obj = _shared.Natives.windowObject(obj);
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
			}));
			
		// <PRB> JS has no function to test for objects ( new Object() )
		__Internal__.ADD('isObject', __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if the object is a direct instance of 'Object'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isObject(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj !== 'object') {
					return false;
				};
				//if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Object')) {
				//	????
				//};
				return (_shared.Natives.objectToString.call(obj) === '[object Object]');
			}));
			
		__Internal__.ADD('isObjectLike', __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if the object is a direct instance of 'Object' or an instance of a type which inherits 'Object'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isObjectLike(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (typeof obj === 'object') || (typeof obj === 'function');
			}));
		
		__Internal__.ADD('isExtensible', (_shared.Natives.objectIsExtensible || __Internal__.DD_DOC(
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
						description: "Returns 'true' if an object is extensible. Otherwise, returns 'false'.",
			}
			//! END_REPLACE()
			, function isExtensible(obj) {
					return false;
				})));
		
		__Internal__.ADD('preventExtensions', __Internal__.DD_DOC(
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
						returns: 'object',
						description: "Prevent extensions of the object when supported and returns that same object. Otherwise, returns that object untouched. Note that it can't be reverted for the moment (ES5).",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectPreventExtensions ? 
				function preventExtensions(obj) {
					obj = _shared.Natives.windowObject(obj);
					_shared.Natives.objectPreventExtensions(obj);
					return obj;
				} : function preventExtensions(obj) {
					obj = _shared.Natives.windowObject(obj);
					return obj;
				})));
		
		__Internal__.ADD('sealObject', __Internal__.DD_DOC(
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
						returns: 'object',
						description: "Seals the object when supported and returns that same object. Otherwise returns the object untouched.",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectSeal ? 
				function sealObject(obj) {
					obj = _shared.Natives.windowObject(obj);
					return _shared.Natives.objectSeal(obj);
				} : function sealObject(obj) {
					obj = _shared.Natives.windowObject(obj);
					return obj;
				})));
		
		__Internal__.ADD('isFrozen', (_shared.Natives.objectIsFrozen || __Internal__.DD_DOC(
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
						description: "Returns 'true' if an object is frozen. Otherwise, returns 'false'.",
			}
			//! END_REPLACE()
			, function isFrozen(obj) {
					return false;
				})));
		
		__Internal__.ADD('freezeObject', __Internal__.DD_DOC(
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
						returns: 'object',
						description: "Freezes the object when supported and returns that same object. Otherwise returns the object untouched. Note that it can't be reverted for the moment (ES5).",
			}
			//! END_REPLACE()
			, (_shared.Natives.objectFreeze ? 
				function freezeObject(obj) {
					obj = _shared.Natives.windowObject(obj);
					return _shared.Natives.objectFreeze(obj);
				} : function freezeObject(obj) {
					obj = _shared.Natives.windowObject(obj);
					return obj;
				})));
		
		//==============
		// Options
		//==============
		
		if (types.isArray(_options)) {
			_options = types.depthExtend.apply(null, types.append([15, {} /*! IF_UNSET("serverSide") */ , ((typeof DD_MODULES === 'object') && (DD_MODULES !== null) ? DD_MODULES.options : undefined) /*! END_IF() */ ],  _options));
		};

		var __options__ = types.depthExtend(15, {
			//! IF(IS_SET('debug'))
				// Starting from source code...
				debug: true,					// When 'true', will be in 'debug mode'.
				fromSource: true,				// When 'true', loads source code instead of built code
				enableProperties: true,			// When 'true', enables "defineProperty"
				// SLOW enableProxies: true,	// Enables or disables ES6 Proxies
				enableAsserts: true,			// When 'true', enables asserts.
			//! END_IF()
			
			enableSymbols: true,				// When 'true', symbols are enabled.
		}, types.get(_options, 'startup'));
		
		__options__.debug = types.toBoolean(__options__.debug);
		__options__.fromSource = types.toBoolean(__options__.fromSource);
		__options__.enableProperties = types.toBoolean(__options__.enableProperties);
		__options__.enableSymbols = types.toBoolean(__options__.enableSymbols);
		__options__.enableProxies = types.toBoolean(__options__.enableProxies);
		__options__.enableAsserts = types.toBoolean(__options__.enableAsserts);
		
		_shared.SECRET = types.get(__options__, 'secret');
		delete __options__.secret;

		types.freezeObject(__options__);
		
		__Internal__.ADD('hasDefinePropertyEnabled', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'boolean',
						description: "Returns 'true' if 'defineProperty' is enabled. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__options__.enableProperties && !__Internal__.hasDefinePropertyBug && _shared.Natives.objectDefineProperty ? function hasDefinePropertyEnabled() {
				return true;
			} : function hasDefinePropertyEnabled() {
				return false;
			})));
		
		//===================================
		// UUIDs
		//===================================

		if (typeof require === 'function') {
			try {
				// NOTE: Client-side 'uuid' is browserified
				__Internal__.nodeUUID = require('uuid');
			} catch(ex) {
			};
		};

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
				if (__Internal__.nodeUUID) {
					return __Internal__.nodeUUID();
				} else {
					// Source: https://gist.github.com/LeverOne
					var a, b;
					for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a^15 ? 8^_shared.Natives.mathRandom() * (a^20 ? 16 : 4) : 4).toString(16) : '-');
					return b
				};
			})
		);

		//===================================
		// Symbols
		//===================================
		
		__Internal__.ADD('hasSymbols', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'bool',
						description: "Returns 'true' if the engine has symbols. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowSymbol ? function hasSymbols() {
				return true;
			} : function hasSymbols() {
				return false;
			})));
			
		__Internal__.ADD('hasGetSymbolEnabled', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'bool',
						description: "Returns 'true' if 'getSymbolFor' is available and enabled. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__options__.enableSymbols && _shared.Natives.windowSymbol ? function hasGetSymbolForEnabled() {
				return true;
			} : function hasGetSymbolForEnabled() {
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
			, (_shared.Natives.windowSymbol ? function isSymbol(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				if (typeof obj === 'object') {
					if (_shared.Natives.symbolToStringTag && (obj[_shared.Natives.symbolToStringTag] === 'Symbol')) {
						try {
							obj = _shared.Natives.symbolValueOf.call(obj);
						} catch(o) {
							return false;
						};
					} else if (_shared.Natives.objectToString.call(obj) !== '[object Symbol]') {
						return false;
					} else {
						obj = _shared.Natives.symbolValueOf.call(obj);
					};
				};
				return (typeof obj === 'symbol');
			} : function isSymbol(obj) {
				return false;
			})));
		
		if (!__options__.enableSymbols || !_shared.Natives.windowSymbol) {
			__Internal__.globalSymbolsUUID = /*! REPLACE_BY(TO_SOURCE(UUID('Symbol')), true) */ tools.generateUUID() /*! END_REPLACE() */;
		};
	
		__Internal__.ADD('getSymbol', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 5,
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
			, (__options__.enableSymbols && _shared.Natives.windowSymbol ? function getSymbol(key, /*optional*/isGlobal) {
				key = _shared.Natives.windowString(key);
				var symbol;
				if (isGlobal) {
					symbol = _shared.Natives.symbolFor(key);
				} else {
					symbol = _shared.Natives.windowSymbol(key);
				};
				return symbol;
			} : function getSymbol(key, /*optional*/isGlobal) {
				// Not supported
				key = _shared.Natives.windowString(key);
				key += '$' + (isGlobal ? __Internal__.globalSymbolsUUID : tools.generateUUID());
				return key;
			})));
			
		__Internal__.ADD('getSymbolKey', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
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
			, (_shared.Natives.windowSymbol ? function getSymbolKey(symbol) {
				if (!types.isSymbol(symbol)) {
					return undefined;
				};
				var key = _shared.Natives.symbolKeyFor(symbol.valueOf());
				if (types.isNothing(key)) {
					key = _shared.Natives.symbolToString.call(symbol);
					key = /^Symbol[(]((.|\n)*)[)]$/gm.exec(key) || undefined;
					key = key && key[1];
				};
				return key;
			} : function getSymbolKey(symbol) {
				// Not supported
				return undefined;
			})));
			
		__Internal__.ADD('symbolIsGlobal', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
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
			, (_shared.Natives.windowSymbol ? function symbolIsGlobal(symbol) {
				if (!types.isSymbol(symbol)) {
					return false;
				};
				return (_shared.Natives.symbolKeyFor(symbol.valueOf()) !== undefined);
			} : function symbolIsGlobal(symbol) {
				// Not supported
				return false;
			})));
			
		//===================================
		// Type functions
		//===================================
		
		__Internal__.symbolIsType = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('IS_TYPE')), true) */ '__DD_IS_TYPE__' /*! END_REPLACE() */, true);
		__Internal__.symbolTypeUUID = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('DD_TYPE_UUID')), true) */ '__DD_TYPE_UUID__' /*! END_REPLACE() */, true);
		_shared.UUIDSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('JS_TYPE_UUID')), true) */ '__JS_TYPE_UUID__' /*! END_REPLACE() */, true);

		_shared.getTypeUUID = function getTypeUUID(type) {
			if (types.isType(type)) {
				return types.get(type, __Internal__.symbolTypeUUID);
			} else if (types.isFunction(type)) {
				return types.get(type, _shared.UUIDSymbol);
			};
		};

		_shared.getTypeSymbol = function getTypeSymbol(type) {
			if (!__Internal__.typesSymbolMap && types.WeakMap) {
				__Internal__.typesSymbolMap = new types.WeakMap();
				var symbols = types.append(types.keys(__Internal__.tempTypesSymbol), types.symbols(__Internal__.tempTypesSymbol));
				for (var i = 0; i < symbols.length; i++) {
					var symbol = symbols[i];
					__Internal__.typesSymbolMap.set(__Internal__.tempTypesSymbol[symbol], symbol);
				};
				delete __Internal__.tempTypesSymbol;
			};
			if (__Internal__.typesSymbolMap && __Internal__.typesSymbolMap.has(type)) {
				return __Internal__.typesSymbolMap.get(type);
			};
			var symbol = undefined,
				ok = false;
			if (types.isType(type)) {
				var uuid = types.get(type, __Internal__.symbolTypeUUID);
				if (uuid) {
					symbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('DD_TYPE')), true) */ '__DD_TYPE__' /*! END_REPLACE() */ + '-' + uuid, true);
				};
				ok = true;
			} else if (types.isFunction(type)) {
				var uuid = types.get(type, _shared.UUIDSymbol);
				if (uuid) {
					if (types.isNativeFunction(type) && !types.isJsClass(type)) {
						symbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('NATIVE_TYPE')), true) */ '__NATIVE_TYPE__' /*! END_REPLACE() */ + '-' + uuid, true);
					} else {
						symbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('JS_TYPE')), true) */ '__JS_TYPE__' /*! END_REPLACE() */ + '-' + uuid, true);
					};
				};
				ok = true;
			};
			if (ok) {
				if (__Internal__.typesSymbolMap) {
					__Internal__.typesSymbolMap.set(type, symbol);
				} else if (symbol) {
					// Temporary
					__Internal__.tempTypesSymbol[symbol] = type;
				};
			};
			return symbol;
		};

		__Internal__.symbolInitialized = types.getSymbol('INITIALIZED');
		__Internal__.symbol$IsSingleton = types.getSymbol('$IS_SINGLETON');

		__Internal__.ADD('baseof', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 6,
						params: {
							base: {
								type: 'type',
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
						description: "Returns 'true' if a type is the derivative base of another type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function baseof(base, type) {
				// "obj" is a type that inherits "type".

				if (!types.isFunction(type)) {
					// Use "isLike"
					return false;
				};

				type = _shared.Natives.windowObject(type);
				var crossRealm = !(type instanceof _shared.Natives.windowFunction);

				if (!crossRealm) {
					if (!types.isArray(base)) {
						base = [base];
					};
					for (var i = 0; i < base.length; i++) {
						if (i in base) {
							var b = base[i];
							if (!types.isNothing(b)) {
								if (types.isFunction(b)) {
									if (_shared.Natives.windowObject(b) instanceof _shared.Natives.windowFunction) {
										if ((b !== __Internal__.fnProto) && types.isPrototypeOf(b, type)) {
											return true;
										};
									} else {
										crossRealm = true;
										break;
									};
								};
							};
						};
					};
				};
				if (crossRealm) {
					if (types.isArray(base)) {
						base = types.clone(base);
					} else {
						base = [base];
					};
					while (types.isFunction(type)) {
						var symbol = _shared.getTypeSymbol(type);
						if (symbol) {
							for (var i = 0; i < base.length; i++) {
								if (i in base) {
									var s = base[i];
									if (!types.isNothing(s)) {
										if (types.isFunction(s)) {
											base[i] = s = _shared.getTypeSymbol(s); // optimization
										};
										//if (types.isSymbol(s)) {
											if (s === symbol) {
												return true;
											};
										//};
									};
								};
							};
						};
						type = types.getPrototypeOf(type.prototype);
						if (type) {
							type = type.constructor;
						};
					};
				};
				return false;
			}));

		__Internal__.ADD('isType', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 3,
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
				if (!types.isFunction(obj)) {
					return false;
				};
				return types.has(obj, __Internal__.symbolIsType);
			}));
		
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

		__Internal__.ADD('is', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 4,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "An object to test for. A type can be provided.",
							},
							type: {
								type: ['type', 'object'],
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
					obj = _shared.Natives.windowObject(obj);
				};
				if (!types.isFunction(obj)) {
					return false;
				};
				if (!types.isArray(type)) {
					type = [type];
				};
				var crossRealm = !(obj instanceof _shared.Natives.windowFunction);
				if (!crossRealm) {
					for (var i = 0; i < type.length; i++) {
						if (i in type) {
							var t = type[i];
							if (!types.isNothing(t)) {
								if (!types.isFunction(t)) {
									t = _shared.Natives.windowObject(t);
									t = t.constructor;
								};
								if (types.isFunction(t)) {
									if (_shared.Natives.windowObject(t) instanceof _shared.Natives.windowFunction) {
										if (obj === t) {
											return true;
										};
									} else {
										crossRealm = true;
										break;
									};
								};
							};
						};
					};
				};
				if (crossRealm) {
					var symbol = _shared.getTypeSymbol(obj);
					if (symbol) {
						for (var i = 0; i < type.length; i++) {
							if (i in type) {
								var t = type[i];
								if (!types.isNothing(t)) {
									if (!types.isFunction(t)) {
										t = _shared.Natives.windowObject(t);
										t = t.constructor;
									};
									if (types.isFunction(t)) {
										if (_shared.getTypeSymbol(t) === symbol) {
											return true;
										};
									};
								};
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
						revision: 5,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "An object to test for. A type can be provided.",
							},
							type: {
								type: ['type', 'object'],
								optional: false,
								description: "A Doodad type. If an object is provided, its type will be used.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is from or inherits from the specified type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isLike(obj, type) {
				// "obj" is of or inherits type "types".
				if (types.isNothing(obj)) {
					return false;
				};
				obj = _shared.Natives.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
					obj = _shared.Natives.windowObject(obj);
				};
				if (!types.isFunction(obj)) {
					return false;
				};
				var crossRealm = !(obj instanceof _shared.Natives.windowFunction);
				if (!crossRealm) {
					if (!types.isArray(type)) {
						type = [type];
					};
					for (var i = 0; i < type.length; i++) {
						if (i in type) {
							var t = type[i];
							if (!types.isNothing(t)) {
								if (!types.isFunction(t)) {
									t = _shared.Natives.windowObject(t);
									t = t.constructor;
								};
								if (types.isFunction(t)) {
									if (_shared.Natives.windowObject(t) instanceof _shared.Natives.windowFunction) {
										if ((t === obj) || types.isPrototypeOf(t, obj)) {
											return true;
										};
									} else {
										crossRealm = true;
										break;
									};
								};
							};
						};
					};
				};
				if (crossRealm) {
					if (types.isArray(type)) {
						type = types.clone(type);
					} else {
						type = [type];
					};
					while (types.isFunction(obj)) {
						var symbol = _shared.getTypeSymbol(obj);
						if (symbol) {
							for (var i = 0; i < type.length; i++) {
								if (i in type) {
									var s = type[i];
									if (!types.isNothing(s)) {
										if (types.isObjectLike(s)) {
											s = s.constructor;
										};
										if (types.isFunction(s)) {
											type[i] = s = _shared.getTypeSymbol(s); // optimization
										};
										//if (types.isSymbol(s)) {
											if (s === symbol) {
												return true;
											};
										//};
									};
								};
							};
						};
						obj = types.getPrototypeOf(obj.prototype);
						if (obj) {
							obj = obj.constructor;
						};
					};
				};
				return false;
			}));

		__Internal__.ADD('_instanceof', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 6,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
							type: {
								type: 'type',
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
				var crossRealm = !(obj instanceof _shared.Natives.windowObject);
				if (!crossRealm) {
					if (!types.isArray(type)) {
						type = [type];
					};
					for (var i = 0; i < type.length; i++) {
						if (i in type) {
							var t = type[i];
							if (!types.isNothing(t)) {
								if (types.isFunction(t)) {
									if (_shared.Natives.windowObject(t) instanceof _shared.Natives.windowFunction) {
										if (obj instanceof t) {
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
				};
				if (crossRealm) {
					if (types.isArray(type)) {
						type = types.clone(type);
					} else {
						type = [type];
					};
					var t = obj.constructor;
					while (types.isFunction(t)) {
						var symbol = _shared.getTypeSymbol(t);
						if (symbol) {
							for (var i = 0; i < type.length; i++) {
								if (i in type) {
									var s = type[i];
									if (!types.isNothing(s)) {
										if (types.isFunction(s)) {
											type[i] = s = _shared.getTypeSymbol(s); // optimization
										};
										//if (types.isSymbol(s)) {
											if (s === symbol) {
												return true;
											};
										//};
									};
								};
							};
						};
						obj = types.getPrototypeOf(obj);
						t = obj && obj.constructor;
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
						revision: 0,
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
				if (!types.isFunction(obj)) {
					obj = types.get(obj, 'constructor');
				};
				if (!types.isType(obj)) {
					return null;
				};
				return obj;
			}));

		__Internal__.ADD('getTypeName', __Internal__.DD_DOC(
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
				return obj.$TYPE_NAME || types.getFunctionName(obj);
			}));
		
		__Internal__.ADD('getBase', __Internal__.DD_DOC(
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
						description: "Returns the base type of an object. Returns 'null' if not a Doodad object.",
			}
			//! END_REPLACE()
			, function getBase(obj) {
				obj = _shared.Natives.windowObject(obj);
				obj = types.getType(obj);
				if (!obj) {
					return null;
				};
				obj = types.getPrototypeOf(obj.prototype);
				if (!obj) {
					return null;
				};
				return obj.constructor;
			}));

		_shared.invoke = __Internal__.DD_DOC(
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
						},
						returns: 'any',
						description: "Invoke a method or a function as from inside the object.",
			}
			//! END_REPLACE()
			, function invoke(obj, fn, /*optional*/args) {
				if (types.isString(fn) || types.isSymbol(fn)) {
					fn = _shared.getAttribute(obj, fn);
				};
				if (args) {
					return fn.apply(obj, args);
				} else {
					return fn.call(obj);
				};
			});
			
		_shared.getAttribute = __Internal__.DD_DOC(
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
							attr: {
								type: 'string,Symbol',
								optional: false,
								description: "Attribute name.",
							},
						},
						returns: 'any',
						description: "Gets the value of an attribute as from inside the object.",
			}
			//! END_REPLACE()
			, function getAttribute(obj, attr) {
				return obj[attr];
			});
			
		_shared.getAttributes = __Internal__.DD_DOC(
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
							attrs: {
								type: 'arrayof(string,Symbol)',
								optional: false,
								description: "Attribute names.",
							},
						},
						returns: 'object',
						description: "Gets the value of multiple attributes as from inside the object.",
			}
			//! END_REPLACE()
			, function getAttributes(obj, attrs) {
				var attrsLen = attrs.length,
					result = {};
				for (var i = 0; i < attrsLen; i++) {
					var attr = attrs[i];
					result[attr] = _shared.getAttribute(obj, attr);
				};
				return result;
			});
			
		_shared.setAttribute = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 8,
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
							options : {
								type: 'object',
								optional: true,
								description: "Options.",
							},
						},
						returns: 'object',
						description: "Sets the value of an attribute as from inside the object.",
			}
			//! END_REPLACE()
			, function setAttribute(obj, attr, value, /*optional*/options) {
				options = options && types.nullObject(options);
				if (types.hasProperties()) {
					var hasOwn = types.has(obj, attr),
						descriptor = types.getPropertyDescriptor(obj, attr),
						descConfigurable = !hasOwn || !descriptor || types.get(descriptor, 'configurable', false),
						descEnumerable = !descriptor || types.get(descriptor, 'enumerable', false),
						descWritable = !descriptor || types.get(descriptor, 'writable', false),
						descGet = types.get(descriptor, 'get'),
						descSet = types.get(descriptor, 'set');
					if (descSet && !options) {
						descSet.call(obj, value);
					} else if (descGet && !options) {
						if (!options || (!options.ignoreWhenReadOnly && (!options.ignoreWhenSame || (descGet.call(obj) !== value)))) {
							// NOTE: Use native error because something might be wrong
							throw new _shared.Natives.windowError(tools.format("Attribute '~0~' is read-only.", [attr]));
						};
					} else if (hasOwn && descWritable && (!options || ((!!options.configurable === descConfigurable) && (!!options.enumerable === descEnumerable) && (!!options.writable === descWritable)))) {
						obj[attr] = value;
					} else if (descConfigurable) {
						if (options && types.hasDefinePropertyEnabled()) {
							if ('all' in options) {
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
						if (!options || (!options.ignoreWhenReadOnly && (!options.ignoreWhenSame || (obj[attr] !== value)))) {
							// NOTE: Use native error because something might be wrong
							throw new _shared.Natives.windowError(tools.format("Attribute '~0~' is read-only.", [attr]));
						};
					};
				} else {
					obj[attr] = value;
				};
				return value;
			});
			
		_shared.setAttributes = __Internal__.DD_DOC(
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
								type: 'object',
								optional: false,
								description: "name/value pairs.",
							},
							options : {
								type: 'object',
								optional: true,
								description: "Options.",
							},
						},
						returns: 'object',
						description: "Sets the value of multiple attribute as from inside the object.",
			}
			//! END_REPLACE()
			, function setAttributes(obj, values, /*optional*/options) {
				var keys = types.append(types.keys(values), types.symbols(values)),
					keysLen = keys.length;
				for (var i = 0; i < keysLen; i++) {
					var key = keys[i];
					_shared.setAttribute(obj, key, values[key], options);
				};
				return values;
			});

		//===================================
		// Errors
		//===================================
		
		__Internal__.symbolIsErrorType = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('IsErrorType')), true) */ '__DD_IS_ERROR_TYPE__' /*! END_REPLACE() */, true);

		__Internal__.ADD('isErrorType', function isErrorType(type) {
			return types.isFunction(type) && types.has(type, __Internal__.symbolIsErrorType);
		});
			
		// NOTE: 2015/04/16 The actual implementations of Error and other error types are not easily inheritable because their constructor always act as an instantiator.
		// NOTE: 2016: ES6 Classes are the only way to really extend an Error object.
		__Internal__.ADD('createErrorType', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 5,
						params: {
							name: {
								type: 'string',
								optional: false,
								description: "Name of the resulting error type.",
							},
							base: {
								type: 'error',
								optional: true,
								description: "Error type from which to inherit. Defaults to 'Error'.",
							},
							constructor: {
								type: 'function',
								optional: true,
								description: "A function to be called to construct a new instance. Defaults to base's constructor.",
							},
							uuid: {
								type: 'string',
								optional: true,
								description: "UUID of the resulting error type.",
							},
						},
						returns: 'error',
						description: "Creates a new error type, based on another error type.",
			}
			//! END_REPLACE()
			, function createErrorType(name, /*optional*/base, /*optional*/constructor, /*optional*/uuid) {
				if (types.isNothing(base)) {
					base = _shared.Natives.windowError;
				};
				name = _shared.Natives.stringReplace.call(name, /[.]/g, '_');
				// <FUTURE> Declare classes directly (when ES6 will be everywhere)
				if (__Internal__.hasClasses) {
					var expr = "class " + name + " extends ctx.base {" +
						"constructor(/*paramarray*/...args) {" +
							"const context = {_this: {}, superArgs: null};" +
							(constructor ? (
								"ctx.constructor.apply(context, args);"
							) : (
								""
							)) +
							"super(...(context.superArgs || args));" +
							"ctx.extend(this, context._this);" +
							"this.name = ctx.name;" +
							"this.description = this.message;" +
						"}" +
					"}";

					// NOTE: Use of "eval" to give the name to the class
					var type = types.evalStrict(expr, {
						base: base,
						constructor: constructor,
						name: name,
						extend: types.extend,
					});

				} else {
					var expr = "function " + name + "(/*paramarray*/) {" +
						"var context = {_this: {}, superArgs: null};" +
						(constructor ? (
							"var error = ctx.constructor.apply(context, arguments) || this;" +
							"ctx.extend(this, context._this);" +
							"this.throwLevel++;"
						) : (
							""
						)) +
						"var error = ctx.base.apply(this, (context.superArgs || arguments)) || this;" +
						"if (error !== this) {" +
							// <PRB> As of January 2015, "global.Error" doesn't behave like a normal constructor within any browser. This might be part of W3C specs.
							//
							//       Proof of concept :
							//          var a = new Error("hello");
							//          var b = Error.call(a, "bye");
							//          a === b  // always returns "false"
							//          a.constructor === b.constructor  // returns "true"
							//          a.constructor === Error  // returns "true"
							//          a instanceof Error  // returns "true"
							//          b instanceof Error  // returns "true"
							//
							//       Moreover :
							//          this instanceof Error  // returns "true"
							"this.message = (error.message || error.description);" +
							// NOTE: Internet Explorer doesn't fill the "stack" attribute because the "throw" operator has not been used yet.
							// NOTE: Internet Explorer doesn't have the "stack" attribute in "Error.prototype". This attribute is not part of the object, but injected by the throwing mechanism.
							// NOTE: With Internet Explorer, the "stack" attribute doesn't get filled on throwing if the attribute is present. This is to allow re-throwing the error.
							"if (error.stack) {" +
								"this.stack = error.stack;" +
							"};" +
						"};" +
						"this.throwLevel++;" +
						"this.name = ctx.name;" +
						"this.description = this.message;" +
						"return this;" +
					"}";
				
					// NOTE: Use of "eval" to give the name to the function				
					var type = types.eval(expr, {
						base: base,
						constructor: constructor,
						name: name,
						extend: types.extend,
					});
				
					// For "instanceof".
					type.prototype = types.createObject(base.prototype, {
						constructor: {
							value: type,
						},
					});
				};
				
				types.extend(type.prototype, {
					name: name,
					throwLevel: 0,
					parsed: false,
					parsedStack: null,
					bubble: false,
					critical: false,
					trapped: false,
					
					toString: function toString(/*paramarray*/) {
						return this.message;
					},
					
					parse: function parse() {
						// Call this method before accessing "this.stack", "this.fileName", "this.lineNumber" and "this.columnNumber".
						if (!this.parsed) {
							var stack;
							if (this.stack) {
								stack = tools.parseStack(this.stack);
								if (stack) {
									stack.splice(0, this.throwLevel);
									// Internet Explorer (tested with version 11) and Chrome (tested with version 42) doesn't return more than 10 call levels, so the stack may be empty after "splice".
									if (!stack.length) {
										stack = null;
									};
								};
								this.parsedStack = stack;
							};
							
							var fileName,
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
									var trace = stack[0];
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
					},
				});

				if (_shared.Natives.symbolToStringTag) {
					type.prototype[_shared.Natives.symbolToStringTag] = 'Error';
				};
				
				_shared.setAttribute(type, __Internal__.symbolIsErrorType, undefined, {});
				_shared.setAttribute(type, _shared.UUIDSymbol, !types.isNothing(uuid) && types.toString(uuid) || '', {});

				return type;
			}));
		
		__Internal__.createErrorConstructor = function() {
			return function _new(message, /*optional*/params) {
				message = tools.format(message, params);
				this.superArgs = [message];
			};
		};
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'error',
						description: "Raised on invalid value type.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowTypeError
				? types.createErrorType("TypeError", _shared.Natives.windowTypeError, __Internal__.createErrorConstructor(), /*! REPLACE_BY(TO_SOURCE(UUID('TypeError')), true) */ null /*! END_REPLACE() */)
				: types.createErrorType("TypeError", _shared.Natives.windowError, __Internal__.createErrorConstructor(), /*! REPLACE_BY(TO_SOURCE(UUID('TypeError')), true) */ null /*! END_REPLACE() */)
			)));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
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
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'undefined',
						description: "Generic error with message formatting.",
			}
			//! END_REPLACE()
			, types.createErrorType('Error', _shared.Natives.windowError, __Internal__.createErrorConstructor(), /*! REPLACE_BY(TO_SOURCE(UUID('Error')), true) */ null /*! END_REPLACE() */)));

		//! IF_SET('serverSide')
			if (typeof require === 'function') {
				try {
					__Internal__.AssertionError = require('assert').AssertionError;
				} catch(ex) {
				};
			};
		//! END_IF()

		// <FUTURE> Remove "AssertionFailed" alias
		__Internal__.ADD('AssertionFailed', __Internal__.REGISTER(__Internal__.DD_DOC(
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
			, (__Internal__.AssertionError ? 
				types.createErrorType("AssertionError", __Internal__.AssertionError, function _new(/*optional*/message, /*optional*/params) {
					if (message) {
						this.superArgs = [{
							actual: false,
							expected: true,
							operator: '==',
							message: tools.format("Assertion failed: " + message, params),
						}];
					} else {
						this.superArgs = [{
							actual: false,
							expected: true,
							operator: '==',
							message: "Assertion failed.",
						}];
					};
				}, /*! REPLACE_BY(TO_SOURCE(UUID('AssertionError')), true) */ null /*! END_REPLACE() */)
			:
				types.createErrorType("AssertionError", types.Error, function _new(message, /*optional*/params) {
					if (message) {
						this.superArgs = ["Assertion failed: " + message, params];
					} else {
						this.superArgs = ["Assertion failed."];
					};
				}, /*! REPLACE_BY(TO_SOURCE(UUID('AssertionError')), true) */ null /*! END_REPLACE() */)
			))));

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
			, types.createErrorType("ParseError", types.Error, function _new(/*optional*/message, /*optional*/params) {
				this.superArgs = [message || "Parse error.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('ParseError')), true) */ null /*! END_REPLACE() */)));
		
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
			, types.createErrorType("NotSupported", types.Error, function _new(/*optional*/message, /*optional*/params) {
				this.superArgs = [message || "Not supported.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('NotSupported')), true) */ null /*! END_REPLACE() */)));
		
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
			, types.createErrorType("NotAvailable", types.Error, function _new(/*optional*/message, /*optional*/params) {
				this.superArgs = [message || "Not available.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('NotAvailable')), true) */ null /*! END_REPLACE() */)));
		
		__Internal__.REGISTER(__Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
			, types.createErrorType('HttpError', types.Error, function _new(code, message, /*optional*/params) {
				this._this.code = code;
				this.superArgs = [message, params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('HttpError')), true) */ null /*! END_REPLACE() */)));
		
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
			, types.createErrorType('BufferOverflow', types.Error, function _new(/*optional*/message, /*optional*/params) {
				this.superArgs = [message || "Buffer overflow.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('BufferOverflow')), true) */ null /*! END_REPLACE() */)));
		
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
			, types.createErrorType('TimeoutError', types.Error, function _new(/*optional*/message, /*optional*/params) {
				this.superArgs = [message || "Operation timed out.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('TimeoutError')), true) */ null /*! END_REPLACE() */)));
		
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
			, types.createErrorType('CanceledError', types.Error, function _new(/*optional*/message, /*optional*/params) {
				this.superArgs = [message || "Operation canceled.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('CanceledError')), true) */ null /*! END_REPLACE() */)));
		
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
			, types.createErrorType('AccessDenied', types.Error, function _new(/*optional*/message, /*optional*/params) {
				this.superArgs = [message || "Access denied.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('AccessDenied')), true) */ null /*! END_REPLACE() */)));
		
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
			, types.createErrorType("ScriptInterruptedError", types.Error, function _new(/*optional*/message, /*optional*/params) {
				this._this.bubble = true;
				this.superArgs = [message || "Script interrupted.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('ScriptInterruptedError')), true) */ null /*! END_REPLACE() */)));
		
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
			, types.createErrorType("ScriptAbortedError", types.ScriptInterruptedError, function _new(/*optional*/exitCode, /*optional*/message, /*optional*/params) {
				this._this.exitCode = types.toInteger(exitCode) || 0;
				this._this.critical = true;
				this.superArgs = [message || "Script aborted.", params];
			}, /*! REPLACE_BY(TO_SOURCE(UUID('ScriptAbortedError')), true) */ null /*! END_REPLACE() */)));
				
		//===================================
		// Box/Unbox
		//===================================
		
		_shared.OriginalValueSymbol = types.getSymbol('__ORIGINAL_VALUE__');
		
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
				//if (new.target) {
				if (this instanceof types.box) {
					if (types._instanceof(value, types.box)) {
						value.setAttributes(this);
						value = value[_shared.OriginalValueSymbol];
					};
					this[_shared.OriginalValueSymbol] = value;
					return this;
				} else {
					return new types.box(value);
				};
			}));
		types.extend(types.box.prototype, {
			setAttributes: function setAttributes(dest, /*optional*/override) {
				var keys = types.append(types.keys(this), types.symbols(this));
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					if ((key !== _shared.OriginalValueSymbol) && (override || !types.has(dest, key))) {
						dest[key] = this[key];
					};
				};
				return dest;
			},
			valueOf: function valueOf() {
				return this[_shared.OriginalValueSymbol];
			},
			setValue: function setValue(value, /*optional*/override) {
				// NOTE: "OriginalValueSymbol" is immutable
				var type = this.constructor;
				var newBox = new type(value);
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
		// DD_DOC
		//===================================
		
		__Internal__.symbolDD_DOC = types.getSymbol('__DD_DOC__');
		
		//! REPLACE_BY("__Internal__.DD_DOC = function(d,v) {return v;}")
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
		//! END_REPLACE()

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
			for (var i = 0; i < __Internal__.tempDocs.length; i++) {
				__Internal__.DD_DOC.apply(null, __Internal__.tempDocs[i]);
			};
			delete __Internal__.tempDocs;
		})();
		
		//===================================
		// ES6 Proxy
		//===================================
			
		__Internal__.ADD('hasProxies', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'bool',
						description: "Returns 'true' when ES6 Proxy is available. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (_shared.Natives.windowProxy ? (function hasProxies() {
				return true;
			}) : (function hasProxies() {
				return false;
			}))));

		__Internal__.ADD('hasProxyEnabled', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'bool',
						description: "Returns 'true' when ES6 Proxy is available and if it's enabled. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__options__.enableProxies && _shared.Natives.windowProxy ? (function hasProxyEnabled() {
				return true;
			}) : (function hasProxyEnabled() {
				return false;
			}))));

/* AS USUAL, NO DETECTION AVAILABLE !!! AND WORSE, THIS TIME THERE IS NO WAY AT ALL TO IMPLEMENT ONE
		__Internal__.ADD('isProxy', (_shared.Natives.windowProxy ? (function isProxy(obj) {
			return (obj instanceof _shared.Natives.windowProxy);
		}) : (function isProxy(obj) {
			if (types.isNothing(obj)) {
				return false;
			};
			obj = _shared.Natives.windowObject(obj);
			return !!obj.__isProxy__;
		})));
*/
		
		__Internal__.ADD('createProxy', __Internal__.DD_DOC(
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
			, (_shared.Natives.windowProxy ? (function createProxy(target, handler) {
				return new _shared.Natives.windowProxy(target, handler);
				
			}) : (function createProxy(target, handler) {
				var keys = types.allKeys(handler);
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					if (key !== 'apply') {
						throw new types.TypeError("Proxies not available.");
					};
				};
				
				if (handler.apply) {
					var _caller = function caller(/*paramarray*/) {
						return handler.apply.call(handler, target, this, arguments);
					};
					//types.defineProperty(_caller, '__isProxy__', {value: true});
					return _caller;
				} else {
					// "Invisible proxy"
					//return types.createObject(target, {__isProxy__: {value: true}});
					return types.createObject(target);
				};
			}))));

		//===================================
		// Type
		//===================================
		
		_shared.SuperEnabledSymbol = types.getSymbol('__SUPER_ENABLED__');
		_shared.EnumerableSymbol = types.getSymbol('__ENUMERABLE__');
		_shared.ReadOnlySymbol = types.getSymbol('__READ_ONLY__');
		_shared.ConfigurableSymbol = types.getSymbol('__CONFIGURABLE__');
		__Internal__.symbolGetter = types.getSymbol('__GETTER__');
		__Internal__.symbolSetter = types.getSymbol('__SETTER__');
		
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
				// var t1 = function(){};
				// var t2 = function(){};
				// t2.prototype = t1.prototype;
				// console.log(Object.prototype.isPrototypeOf.call(t1.prototype, t2.prototype));
				// >>> false   // BAD
				// var t1 = function(){};
				// var t2 = function(){};
				// t2.prototype = Object.setPrototypeOf(t2.prototype, t1.prototype);
				// console.log(Object.prototype.isPrototypeOf.call(t1.prototype, t2.prototype));
				// >>> true    // OK
				
				type = types.setPrototypeOf(type, base);

				type.prototype = types.createObject(base.prototype, {
					constructor: {
						value: type,
					},
				});

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
				//if (new.target) {
				if (this instanceof types.AttributeBox) {
					if (types._instanceof(value, types.box)) {
						value.setAttributes(this);
						value = value[_shared.OriginalValueSymbol];
					};
					this[_shared.OriginalValueSymbol] = value;
					return this;
				} else {
					return new types.AttributeBox(value);
				};
			})));
			//types.extend(types.AttributeBox.prototype, {
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
				if (val[__Internal__.symbolGetter] || val[__Internal__.symbolSetter]) {
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
				if (val[__Internal__.symbolGetter] || val[__Internal__.symbolSetter]) {
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
				val = types.AttributeBox();
				val[__Internal__.symbolGetter] = getter;
				val[__Internal__.symbolSetter] = setter;
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
				val = types.AttributeBox();
				val[__Internal__.symbolGetter] = getter;
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
				val = types.AttributeBox();
				val[__Internal__.symbolSetter] = setter;
				return val;
			}));

		// <PRB> If "prototype" is not configurable, we can't set it to read-only
		__Internal__.prototypeIsConfigurable = false;
		(function() {
			if (types.hasProperties()) {
				var f = function() {};
				var desc = types.getOwnPropertyDescriptor(f, 'prototype');
				__Internal__.prototypeIsConfigurable = desc.configurable;
			};
		})();
			
		// TODO: Find another way
		_shared.reservedAttributes = types.nullObject({
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
			
			_super: null,

			$TYPE_NAME: null,
			$TYPE_UUID: null,
		});
		
		_shared.reservedAttributes[__Internal__.symbolInitialized] = null;
		_shared.reservedAttributes[__Internal__.symbol$IsSingleton] = null;
		_shared.reservedAttributes[__Internal__.symbolDD_DOC] = null;
		
		// <PRB> Proxy checks existence of the property in the target AFTER the handler instead of BEFORE. That prevents us to force non-configurable and non-writable on a NEW NON-EXISTING property with a different value.
		//       Error given is "TypeError: 'set' on proxy: trap returned truish for property 'doodad' which exists in the proxy target as a non-configurable and non-writable data property with a different value"
		/*
		_shared.proxyHasSetHandlerBug = false;
		(function() {
			if (types.hasProxies()) {
				var proxy = types.createProxy(types.createObject(null), {
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
				var superFn = superFn || __Internal__.emptyFunction;
				var _caller = function caller(/*paramarray*/) {
					var oldSuper = _shared.getAttribute(this, '_super');
					_shared.setAttribute(this, '_super', superFn);
					try {
						return fn.apply(this, arguments);
					} catch (ex) {
						throw ex;
					} finally {
						_shared.setAttribute(this, '_super', oldSuper);
					};
				};
				_caller = types.setPrototypeOf(_caller, types.SUPER);
				return _caller;
			});

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
					//var val = __Internal__.createCaller('$inherit', function $inherit(/*paramarray*/) {
					//		var obj = this._super.apply(this, arguments) || this;
					//		var type = types.getType(obj);
					//		return types.newInstance(type, args);
					//	}, type.$inherit);
					//_shared.setAttribute(type, '$inherit', val, {all: true});


					//var val = __Internal__.createCaller('$inherit', function $inherit(/*paramarray*/) {
					//		var type = this._super.apply(this, arguments) || this;
					//		type = types.getType(type);
					//		return type.$inherit.apply(type, arguments);
					//	}, type.prototype.$inherit);
					//_shared.setAttribute(type.prototype, '$inherit', val, {all: true});


					_shared.setAttribute(type, __Internal__.symbol$IsSingleton, true, {});
				};
				
				return type;
			}));
		
		__Internal__.ADD('INIT', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
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
					type = type.apply(type, args) || type;
					if (types.isSingleton(type)) {
						type = types.newInstance(type, args);
					};
					return type;
				};
			}));
			
		__Internal__.ADD('isInitialized', function isInitialized(obj) {
			return !!(types.isLike(obj, types.Type) && types.get(obj, __Internal__.symbolInitialized));
		});
		
		__Internal__.applyProto = function applyProto(target, base, proto, preApply, skipExisting, skipConfigurables) {
			var forType = types.isType(target),
				keys = types.append(types.keys(proto), types.symbols(proto));

			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];

				var hasKey = types.has(target, key);
				if (hasKey && skipExisting) {
					continue;
				};

				if ((key !== '__proto__') && !(key in _shared.reservedAttributes)) {
					var attr = types.AttributeBox(proto[key]),
						g = types.get(attr, __Internal__.symbolGetter),
						s = types.get(attr, __Internal__.symbolSetter),
						value = attr,
						isFunction = false;

					if (!g && !s) {
						if (hasKey) {
							value = target[key];
						};
						value = types.unbox(value);
						isFunction = types.isJsFunction(value);
					};

					var cf = types.get(attr, _shared.ConfigurableSymbol);
					if (types.isNothing(cf)) {
						cf = !isFunction;
					};

					if (cf && skipConfigurables && !types.hasIn(target, key)) {
						continue;
					};

					var createSuper = (!hasKey && isFunction ? types.get(attr, _shared.SuperEnabledSymbol) : false);
					if (createSuper) {
						value = __Internal__.createCaller(key, value, base && _shared.getAttribute(base, key));
					};

					if (preApply) {
						_shared.setAttribute(target, key, value, {all: true});

					} else {
						var enu = types.get(attr, _shared.EnumerableSymbol);
						if (types.isNothing(enu)) {
							enu = true;
						};

						if (g || s) {
							// TODO: SUPER
							types.defineProperty(target, key, {
								configurable: !!cf,
								enumerable: !!enu,
								get: g || undefined,
								set: s || undefined,
							});
						} else {
							var ro = types.get(attr, _shared.ReadOnlySymbol);
							if (types.isNothing(ro)) {
								ro = isFunction;
							};

							_shared.setAttribute(target, key, value, {
								configurable: !!cf,
								enumerable: !!enu,
								writable: !ro,
								ignoreWhenReadOnly: true,
							});
						};
					};
				};
			};

			types.defineProperty(target, '_super', {value: null, writable: true});
		};

		__Internal__.ADD('createType', __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 7,
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
								type: ['string', 'function'],
								optional: true,
								description: "The constructor body, or the constructor function.",
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
							constructorContext: {
								type: 'any',
								optional: true,
								description: "A variable that can be used by the constructor body.",
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
			, function createType(/*optional*/name, /*optional*/base, /*optional*/constructor, /*optional*/typeProto, /*optional*/instanceProto, /*optional*/constructorContext, /*optional*/uuid) {
				if (types.isNothing(name)) {
					name = '';
				};
				
				var baseIsType = types.isType(base);
				if (baseIsType) {
					if (!types.get(base, __Internal__.symbolInitialized)) {
						throw new _shared.Natives.windowError("Base type '" + (types.getTypeName(base) || types.getFunctionName(base)) + "' is not initialized.");
					};
				};
				
				if (types.isNothing(constructor)) {
					constructor = "return this._new && this._new.apply(this, arguments);";
				};
				
				if (types.isString(constructor)) {
					constructorContext = types.extend({}, constructorContext, {
						base: base,
					});
					// TODO: Avoid this extra function ?
					constructor = types.eval("function(/*paramarray*/) {" + constructor + "}", constructorContext);
				};
				
				// NOTE: 'eval' is the only way found to give a name to dynamicaly created functions.
				var expr = "function " + _shared.Natives.stringReplace.call(name, /[.]/g, "_") + "(/*paramarray*/) {" + 
					//"if (ctx.get(this, ctx.InitializedSymbol)) {" +
					//	"throw new ctx.Error('Object is already initialized.');" +
					//"};" +

					"var forType = ctx.isFunction(this);" +

					"if (forType) {" +
						"if ((this !== ctx.type) && (!ctx.baseof(ctx.type, this))) {" +
							"throw new ctx.Error('Wrong constructor.');" +
						"};" +
					"} else {" +
						"if (!ctx.get(ctx.type, ctx.InitializedSymbol)) {" +
							"throw new ctx.Error(\"Type '\" + ctx.getTypeName(ctx.type) + \"' is not initialized.\");" +
						"};" +
						"if (!(this instanceof ctx.type)) {" +
							"throw new ctx.Error('Wrong constructor.');" +
						"};" +
					"};" +

					(!__Internal__.prototypeIsConfigurable ?
						// <PRB> "prototype" is not configurable, so we can't set it to read-only
						"if (!forType) {" +
							"if (ctx.type.prototype !== ctx.proto) {" +
								// Something has changed the prototype. Set it back to original and recreate the object.
								"ctx.type.prototype = ctx.proto;" +
								"return ctx.newInstance(ctx.type, arguments);" +
							"};" +
						"};"
					:
						""
					) +

					"var " + (typeProto ? "skipConfigurables = true," : "") +
						"obj;" +
					"if (!ctx.get(this, ctx.InitializedSymbol)) {" +
						"if (!forType) {" +
							"ctx.setAttribute(this, 'constructor', ctx.type, {ignoreWhenSame: true});" +
						"};" +
						"ctx.setAttribute(this, ctx.InitializedSymbol, true, {});" +
						"obj = ctx.constructor.apply(this, arguments) || this;" + // _new
						(typeProto ? "skipConfigurables = false;" : "") +
					"} else {" +
						"obj = this;" +
					"};" +

					(typeProto ?
						"if (forType) {" +
							"ctx.applyProto(obj, ctx.base, ctx.typeProto, false, true, skipConfigurables);" +
						"};"
					: 
						""
					) +

					(instanceProto ?
						"if (!forType) {" +
							"ctx.applyProto(obj, ctx.instanceBase, ctx.instanceProto, false, true, true);" +
						"};"
					: 
						""
					) +

					(baseIsType ?
						"ctx.base.apply(obj, arguments);"
					:
						""
					) +

					(baseIsType ? 
						""
					:
						"if ((obj !== this) && !ctx.get(obj, ctx.InitializedSymbol)) {" +
							"ctx.setAttribute(obj, ctx.InitializedSymbol, true, {});" +
						"};"
					) +

					"return obj;" +
				"}";
				
				var ctx = {
					base: base,
					constructor: constructor,
					Error: _shared.Natives.windowError,
					isFunction: types.isFunction,
					baseof: types.baseof,
					newInstance: types.newInstance,
					get: types.get,
					setAttribute: _shared.setAttribute,
					InitializedSymbol: __Internal__.symbolInitialized,
					getTypeName: types.getTypeName,
					typeProto: typeProto, 
					instanceProto: instanceProto,
					instanceBase: (base ? base.prototype : null),
					applyProto: __Internal__.applyProto,
					type: null, // will be set after type creation
				};
				var type = types.eval(expr, ctx);
				ctx.type = type;
				
				// Inherit base
				var proto;
				var baseIsType = false;
				if (base) {
					baseIsType = types.isType(base);
					type = types.INHERIT(base, type);
					proto = type.prototype;
				} else {
//IE8					// IE 8
//IE8					proto = types.createObject({});
//IE8					type.prototype = proto;
					proto = type.prototype;
					_shared.setAttribute(proto, 'constructor', type, {});
				};
			
				ctx.type = type;
				ctx.proto = proto;
			
				_shared.setAttribute(type, '$TYPE_NAME', name, {});
				_shared.setAttribute(type, __Internal__.symbolIsType, undefined, {});

				if (uuid) {
					_shared.setAttribute(type, __Internal__.symbolTypeUUID, uuid, {});
				};
	
				if (typeProto) {
					__Internal__.applyProto(type, base, typeProto, true, false, false);
				};

				if (instanceProto) {
					__Internal__.applyProto(proto, ctx.instanceBase, instanceProto, false, false, false);
				};
				
				// Return type
				return type;
			}));
		

		__Internal__.typeInherit = __Internal__.DD_DOC(
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
							constructor: {
								type: ['string', 'function'],
								optional: true,
								description: "The constructor body, or the constructor function. Defaults to a call to the method '_new'.",
							},
							constructorContext: {
								type: 'any',
								optional: true,
								description: "A variable that can be used by the constructor body.",
							},
						},
						returns: 'type',
						description: "Creates and returns a new Doodad type that inherits from 'this'.",
			}
			//! END_REPLACE()
			, function $inherit(/*optional*/typeProto, /*optional*/instanceProto, /*optional*/constructor, /*optional*/constructorContext) {
				// <PRB> "fn.call(undefined, ...)" can automatically set "this" to "window" !
				var base = ((this === global) ? undefined: this);
				
				var name = null,
					uuid = null;

				if (typeProto) {
					name = types.unbox(types.get(typeProto, '$TYPE_NAME'));
					uuid = types.unbox(types.get(typeProto, '$TYPE_UUID'));
					delete typeProto.$TYPE_NAME;
					delete typeProto.$TYPE_UUID;
					name = !types.isNothing(name) && types.toString(name) || '';
					uuid = !types.isNothing(uuid) && types.toString(uuid) || '';
				};
	
				var type = types.createType(
						/*name*/
						name,
						
						/*base*/
						base, 
						
						/*constructor*/
						constructor, 
						
						/*typeProto*/
						typeProto, 
						
						/*instanceProto*/
						instanceProto, 
						
						/*constructorContext*/
						constructorContext,

						/*uuid*/
						uuid
					);
				
				return type;
			});
		
		//__Internal__.typeNew = __Internal__.DD_DOC(
		//	//! REPLACE_IF(IS_UNSET('debug'), "null")
		//	{
		//				author: "Claude Petit",
		//				revision: 1,
		//				params: null,
		//				returns: 'undefined',
		//				description: "Object or type creator.",
		//	}
		//	//! END_REPLACE()
		//	, function _new() {
		//	});
		
		//__Internal__.typeDelete = __Internal__.DD_DOC(
		//	//! REPLACE_IF(IS_UNSET('debug'), "null")
		//	{
		//				author: "Claude Petit",
		//				revision: 1,
		//				params: null,
		//				returns: 'undefined',
		//				description: "Object or type destructor.",
		//	}
		//	//! END_REPLACE()
		//	, function _delete() {
		//	});
		
		__Internal__.typeToString = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							paramarray: {
								type: 'arrayof(any)',
								optional: true,
								description: "Arguments.",
							},
						},
						returns: 'string',
						description: "Converts the object to a string using neutral locale and returns that string.",
			}
			//! END_REPLACE()
			, function toString(/*paramarray*/) {
				if (types.isType(this)) {
					return '[type ' + types.getTypeName(this) + ']';
				} else {
					var name = types.getTypeName(this);
					if (name) {
						return '[object ' + name + ']';
					} else {
						return this._super.apply(this, arguments);
					};
				};
			});
		
		__Internal__.typeToLocaleString = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							paramarray: {
								type: 'arrayof(any)',
								optional: true,
								description: "Arguments.",
							},
						},
						returns: 'string',
						description: "Converts the object to a string using current locale and returns that string.",
			}
			//! END_REPLACE()
			, function toLocaleString(/*paramarray*/) {
				return this.toString.apply(this, arguments);
			});

		__Internal__.typeTypeProto = {
			$TYPE_NAME: 'Type',
			$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('Type')), true) */,

			_super: null,
			
			$inherit: __Internal__.typeInherit,
			
			_new: types.NOT_CONFIGURABLE(types.READ_ONLY(null)), //__Internal__.typeNew,
			_delete: types.NOT_CONFIGURABLE(types.READ_ONLY(null)), //__Internal__.typeDelete,
			
			toString: types.SUPER(__Internal__.typeToString),
			toLocaleString: types.SUPER(__Internal__.typeToLocaleString),
		};
		
		 __Internal__.typeTypeProto[__Internal__.symbol$IsSingleton] = types.READ_ONLY(false),

		__Internal__.typeInstanceProto = {
			_super: null,
			
			_new: types.NOT_CONFIGURABLE(types.READ_ONLY(null)), //__Internal__.typeNew,
			_delete: types.NOT_CONFIGURABLE(types.READ_ONLY(null)), //__Internal__.typeDelete,
			
			toString: types.SUPER(__Internal__.typeToString),
			toLocaleString: types.SUPER(__Internal__.typeToLocaleString),
		}
		
		types.Type = __Internal__.DD_DOC(
			//! REPLACE_IF(IS_UNSET('debug'), "null")
			{
						author: "Claude Petit",
						revision: 1,
						params: null,
						returns: 'object',
						description: "Base type of every Doodad types.",
			}
			//! END_REPLACE()
			, __Internal__.typeInherit.call(undefined,
				/*typeProto*/
				__Internal__.typeTypeProto,
				
				/*instanceProto*/
				__Internal__.typeInstanceProto
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
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('CustomEvent')), true) */,
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
						init = types.nullObject(init);
						_shared.setAttributes(this, {
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
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('CustomEventTarget')), true) */,
				},
				/*instanceProto*/
				{
					_new: types.SUPER(function _new() {
						this._super();
						_shared.setAttribute(this, __Internal__.symbolEventListeners, types.nullObject(), {});
					}),
					
					addEventListener: __Internal__.DD_DOC(
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
												handler: {
													type: 'function',
													optional: false,
													description: "Callback function",
												}, 
												useCapture: {
													type: 'boolean',
													optional: true,
													description: "Reserved.",
												}, 
												wantsUntrusted: {
													type: 'boolean',
													optional: true,
													description: "Reserved.",
												},
											},
											returns: 'undefined',
											description: "Adds an event listener for the specified event name.",
								}
								//! END_REPLACE()
						, function addEventListener(type, handler, /*optional*/useCapture, /*optional*/wantsUntrusted) {
							type = type.toLowerCase();
							useCapture = !!useCapture;
							wantsUntrusted = (types.isNothing(wantsUntrusted) ? true : !!wantsUntrusted);
							
							var listeners = this[__Internal__.symbolEventListeners][type];
							if (!types.isArray(listeners)) {
								this[__Internal__.symbolEventListeners][type] = listeners = [];
							};
							var found = false;
							for (var i = 0; i < listeners.length; i++) {
								var value = listeners[i];
								if ((value[0] === handler) && (value[1] === useCapture)) {
									found = true;
									break;
								};
							};
							if (!found) {
								listeners.push([handler, useCapture, wantsUntrusted]);
							};
						}),
						
					removeEventListener: __Internal__.DD_DOC(
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
													description: "Original callback function",
												}, 
												useCapture: {
													type: 'boolean',
													optional: true,
													description: "Reserved.",
												}, 
											},
											returns: 'undefined',
											description: "Removes an event listener for the specified event name.",
								}
								//! END_REPLACE()
						, function removeEventListener(type, /*optional*/handler, /*optional*/useCapture) {
							type = type.toLowerCase();
							
							if (type in this[__Internal__.symbolEventListeners]) {
								var listeners = this[__Internal__.symbolEventListeners][type];
								if (types.isArray(listeners)) {
									if (types.isNothing(useCapture)) {
										for (var i = listeners.length - 1; i >= 0; i--) {
											var value = listeners[i];
											if (!handler || (value[0] === handler)) {
												listeners.splice(i, 1);
											};
										};
									} else {
										useCapture = !!useCapture;
										for (var i = listeners.length - 1; i >= 0; i--) {
											var value = listeners[i];
											if ((!handler || (value[0] === handler)) && (value[1] === useCapture)) {
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
											revision: 0,
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
							var type = event.type.toLowerCase();
							
							var res = true;
							
							if (!event.stopped) {
								var	listeners;
								if (type in this[__Internal__.symbolEventListeners]) {
									listeners = this[__Internal__.symbolEventListeners][type];
								} else {
									this[__Internal__.symbolEventListeners][type] = listeners = [];
								};
								
								if (listeners.__locked) {
									return res;
									//throw new types.Error("Listeners locked for event '~0~'.", [type]);
								};
								
								try {
									listeners.__locked = true;  // prevents infinite loop
									
									var listenersLen = listeners.length;
									for (var i = 0; i < listenersLen; i++) {
										var listener = listeners[i];
										var retval = listener[0].call(this, event);
										if (event.canceled) {
											res = false;
										};
										if (retval === false) {
											event.stopImmediatePropagation();
										};
										if (event.stopped) {
											break;
										};
									};
									
									type = 'on' + type;
									if (!event.stopped && types.has(this, type)) {
										var fn = this[type];
										if (types.isFunction(fn)) {
											var retval = fn.call(this, event);
											if (event.canceled) {
												res = false;
											};
											if (retval === false) {
												event.stopImmediatePropagation();
											};
										};
									};
								} catch(ex) {
									throw ex;
								} finally {
									listeners.__locked = false;
								};
							};
							
							return res;
						}),
						
					clearListeners: __Internal__.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'undefined',
											description: "Removes every event listeners.",
								}
								//! END_REPLACE()
						, function clearListeners() {
							this[__Internal__.symbolEventListeners].length = 0;
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
					_shared.setAttributes(obj, {
						DD_PARENT: this,
						DD_NAME: name,
						DD_FULL_NAME: (this.DD_FULL_NAME + '.' + name),
					}, {});
				};

				if (types.isType(obj) && !types.isInitialized(obj)) {
					obj = types.INIT(obj, args);
				};

				_shared.setAttribute(this, name, obj, {
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
		__Internal__.registerOthers = _shared.REGISTER = function REGISTER(args, protect, type) {
				// NOTE: "type" is a Doodad Type, or a Doodad Error Type.
				var name = (types.getTypeName(type) || types.getFunctionName(type) || null),
					fullName = (name ? this.DD_FULL_NAME + '.' + name : null);

				if (!types.has(type, 'DD_FULL_NAME') && types.isExtensible(type)) {
					_shared.setAttributes(type, {
						DD_PARENT: this,
						DD_NAME: name,
						DD_FULL_NAME: fullName,
					}, {});
				};

				if (!types.isErrorType(type) && !types.isInitialized(type)) {
					type = types.INIT(type, args);
				};

				// NOTE: Will get protected when the real REGISTER will get called.
				_shared.setAttribute(this, name, type, {
					configurable: true,
				});

				__Internal__.tempRegisteredOthers.push([this, [args, protect, type]]);
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
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('Namespace')), true) */,
				},
				/*instanceProto*/
				{
					DD_PARENT: types.READ_ONLY(null),
					DD_NAME: types.READ_ONLY(null),
					DD_FULL_NAME: types.READ_ONLY(null),

					ADD:  __Internal__.DD_DOC(
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
						return _shared.REMOVE.apply(this, arguments);
					}),
					
					REGISTER: function REGISTER(/*<<< optional*/args, /*optional*/protect, type) {
						var args;
						if (arguments.length <= 1) {
							type = args;
							protect = true;
							args = undefined;
						} else if (arguments.length <= 2) {
							type = protect;
							protect = args;
							args = undefined;
						};
						return _shared.REGISTER.call(this, args, protect, type);
					},
					
					UNREGISTER: function UNREGISTER(type) {
						return _shared.UNREGISTER.apply(this, arguments);
					},
					
					_new: types.SUPER(function _new(/*optional*/parent, /*optional*/name, /*optional*/fullName) {
						this._super();
						
						_shared.setAttributes(this, {
							DD_PARENT: parent,
							DD_NAME: name,
							DD_FULL_NAME: fullName,
						});
					}),
				}
			));

		_shared.setAttribute(types.Namespace, __Internal__.symbolInitialized, true, {all: true});
		__Internal__.ADD('Namespace', types.Namespace);

		//===================================
		// Root
		//===================================

		//! IF_UNSET("serverSide")
			if ((typeof DD_MODULES === 'object') && (DD_MODULES !== null)) {
				modules = types.extend({}, DD_MODULES, modules);
			};
		//! END_IF()

		var root = types.INIT(__Internal__.DD_DOC(
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
					$TYPE_UUID:  '' /*! INJECT('+' + TO_SOURCE(UUID('RootNamespace')), true) */,
				},
				/*instanceProto*/
				{
					Namespace: types.NOT_CONFIGURABLE(types.READ_ONLY(  types.Namespace  )),

					createRoot: exports.createRoot,
					DD_DOC: __Internal__.DD_DOC,
					GET_DD_DOC: __Internal__.GET_DD_DOC,
					
					_new: types.SUPER(function _new(/*optional*/modules, /*optional*/options) {
						this._super(null, 'Root', 'Root');

						options = types.nullObject(options);
						
						var root = this;

						// Prebuild "Doodad", "Doodad.Types" and "Doodad.Tools"
						// NOTE: 'Doodad' is the parent of 'Types', 'Tools' and 'Namespaces', but it depends on them. I should have put these namespaces at Root, but it's too late now.
						root.Doodad = new types.Namespace(root, 'Doodad', 'Doodad');
						root.Doodad.Tools = new types.Namespace(root.Doodad, 'Tools', 'Doodad.Tools');

						// NOTE: "types" replaces "toString". It's too late to rename it.
						var __typesTmp = types.INIT(types.Namespace.$inherit({
								$TYPE_NAME: '__TypesNamespace',
							},
							{
								toString: types.CONFIGURABLE(null),  // Will get set later by "tempTypesAdded"
							}));
						root.Doodad.Types = new __typesTmp(root.Doodad, 'Types', 'Doodad.Types');

						for (var i = 0; i < __Internal__.tempTypesAdded.length; i++) {
							var type = __Internal__.tempTypesAdded[i],
								name = type[0],
								obj = type[1];
							root.Doodad.Types.ADD(name, obj);
						};
						for (var i = 0; i < __Internal__.tempTypesRegistered.length; i++) {
							var type = __Internal__.tempTypesRegistered[i];
							// Temporary... will get registered later.
							root.Doodad.Types.ADD(types.getTypeName(type) || types.getFunctionName(type), type, false);
						};
						for (var i = 0; i < __Internal__.tempToolsAdded.length; i++) {
							var tool = __Internal__.tempToolsAdded[i],
								name = tool[0],
								obj = tool[1];
							root.Doodad.Tools.ADD(name, obj);
						};
						delete __Internal__.tempTypesAdded;
						delete __Internal__.tempToolsAdded;
						delete __Internal__.ADD;
						delete __Internal__.REGISTER;
						delete __Internal__.ADD_TOOL;

						var nsObjs = types.nullObject({
							'Doodad': root.Doodad,
							'Doodad.Types': root.Doodad.Types,
							'Doodad.Tools': root.Doodad.Tools,
						});

						types = root.Doodad.Types;
						tools = root.Doodad.Tools;

						if (types.hasDefinePropertyEnabled()) {
							types.defineProperty(root, 'DD_ASSERT', {
								get: function() {
									return __Internal__.DD_ASSERT;
								},
							});
						};
						
						if (__options__.enableAsserts) {
							this.enableAsserts();
						};
						
						// Load bootstrap modules

						if (!modules) {
							modules = {};
						};

						modules[MODULE_NAME] = {
							type: 'Package',
							version: MODULE_VERSION,
							bootstrap: true,
						};
						
						var names = types.keys(modules),
							inits = types.nullObject(),
							namespaces = null,
							entries = null,
							name;
							
						whileName: while (name = names.shift()) {
							var spec = modules[name];
							spec.name = name;
							if (spec.bootstrap) {
								var deps = (types.get(spec, 'dependencies') || []);
								for (var i = 0; i < deps.length; i++) {
									if (i in deps) {
										var dep = deps[i],
											optional = false;
										if (types.isObject(dep)) {
											optional = dep.optional;
											dep = dep.name;
										};
										var loading = (dep in inits);
										if (!types.has(modules, dep) && !loading) {
											if (optional) {
												loading = true;
											} else {
												throw new types.Error("Missing bootstrap module '~0~'.", [dep]);
											};
										};
										if (!loading) {
											names.push(name);
											continue whileName;
										};
									};
								};
								
								var baseName = name.split('/', 2)[0],
									shortNames = baseName.split('.'),
									proto = types.get(spec, 'proto'),
									nsObj = null,
									parent = root,
									fullName = '';
									
								for (var k = 0; k < shortNames.length; k++) {
									var shortName = shortNames[k];
									fullName += '.' + shortName;
									var fn = fullName.slice(1);
									var prevNsObj = types.get(parent, shortName);
									if ((k === (shortNames.length - 1)) && (proto || (prevNsObj && !(prevNsObj instanceof types.Namespace)))) {
										var nsType = types.getType(prevNsObj) || types.Namespace;
										if (proto) {
											// Extend namespace object
											if (types.isFunction(proto)) {
												proto = proto(root);
											};
											if (!types.isArray(proto)) {
												proto = [
													/*typeProto*/
													{
														$TYPE_NAME: types.getTypeName(nsType),
													},
													/*instanceProto*/
													proto
												];
											};
											nsType = types.INIT(nsType.$inherit.apply(nsType, proto));
										};
										nsObj = new nsType(parent, shortName, fn);
									} else if (!prevNsObj) {
										nsObj = new types.Namespace(parent, shortName, fn);
									} else {
										nsObj = prevNsObj;
									};
									nsObjs[fn] = nsObj;
									if ((parent !== root) || (!entries && (spec.type !== 'Package')) || (entries && !(entries[spec.type || 'Module'] instanceof entries.Package))) {
										parent[shortName] = nsObj;
									};
									parent = nsObj;
								};
								
								nsObjs[name] = nsObj;

								var nsList = (types.get(spec, 'namespaces') || []);
								for (var j = 0; j < nsList.length; j++) {
									if (j in nsList) {
										shortNames = nsList[j].split('.');
										var fullName = '.' + baseName;
										for (var k = 0; k < shortNames.length; k++) {
											var shortName = shortNames[k];
											fullName += '.' + shortName;
											var fn = fullName.slice(1);
											if (!(fn in nsObjs)) {
												nsObjs[fn] = parent[shortName] = new types.Namespace(parent, shortName, fn);
											};
											parent = parent[shortName];
										};
										parent = nsObj;
									};
								};

								var opts = options[name];
								var create = types.get(spec, 'create');
								inits[name] = create && create(root, opts, _shared);

								if (!namespaces && (name === 'Doodad.Namespaces')) {
									namespaces = nsObj;
									entries = namespaces.Entries;
								};
							};
						};

						var names = types.keys(inits),
							nsOptions = {secret: _shared.SECRET};

						for (var i = 0; i < names.length; i++) {
							var name = names[i];
							var spec = modules[name];
							var baseName = name.split('/', 2)[0];
							var entryType = entries[spec.type || 'Module'];
							var entry = new entryType(root, spec, nsObjs[name]);
							var opts = options[baseName];
							entry.objectCreated = true;
							entry.objectInit = inits[name];
							entry.objectInit && entry.objectInit(opts)
							entry.init(opts);
							namespaces.add(name, entry, nsOptions);
							delete nsObjs[name];
						};
						
						var names = types.keys(nsObjs);
						for (var i = 0; i < names.length; i++) {
							var name = names[i];
							var namespace = nsObjs[name];
							var baseName = name.split('/', 2)[0];
							var entry = new entries.Namespace(root, null, namespace);
							var opts = options[baseName];
							entry.init(opts);
							namespaces.add(name, entry, nsOptions);
						};
						
						delete types.Namespace[__Internal__.symbolInitialized];
						types.REGISTER(types.INIT(types.Namespace));

						for (var i = 0; i < __Internal__.tempTypesRegistered.length; i++) {
							var type = __Internal__.tempTypesRegistered[i];
							types.REGISTER(type);
						};
						delete __Internal__.tempTypesRegistered;

						if (_shared.REGISTER !== __Internal__.registerOthers) { 
							for (var i = 0; i < __Internal__.tempRegisteredOthers.length; i++) {
								var type = __Internal__.tempRegisteredOthers[i],
									namespace = type[0],
									args = type[1];
								_shared.REGISTER.apply(namespace, args);
							};
						} else {
							// "_shared.REGISTER" should have been replaced by "Doodad.js" !!!
							debugger;
						};
						delete __Internal__.registerOthers;
						delete __Internal__.tempRegisteredOthers;
					}),
					
					//! BEGIN_REMOVE()
						serverSide: types.READ_ONLY((typeof process === 'object') && (process !== null) && !process.browser && (typeof module === 'object') && (module !== null)),
					//! END_REMOVE()
					//! IF(IS_SET("serverSide") && !IS_SET("browserify"))
					//!		INJECT("serverSide: types.READ_ONLY(true),")
					//! ELSE()
					//!		INJECT("serverSide: types.READ_ONLY(false),")
					//! END_IF()

					enableAsserts: __Internal__.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 1,
								params: null,
								returns: 'undefined',
								description: "Enables 'DD_ASSERT'.",
						}
						//! END_REPLACE()
						, function enableAsserts() {
							if (types.hasDefinePropertyEnabled()) {
								__Internal__.DD_ASSERT = __ASSERT__;
							} else {
								var root = this;
								root.DD_ASSERT = __ASSERT__;
							};
						}),
					
					disableAsserts: __Internal__.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
								author: "Claude Petit",
								revision: 1,
								params: null,
								returns: 'undefined',
								description: "Disables 'DD_ASSERT'.",
						}
						//! END_REPLACE()
						, function disableAsserts() {
							if (types.hasDefinePropertyEnabled()) {
								__Internal__.DD_ASSERT = null;
							} else {
								var root = this;
								root.DD_ASSERT = null;
							};
						}),
						
					getOptions: function() {
						return __options__;
					},
				}
			))), [modules, _options]);

		types.REGISTER(root);

		return root.Doodad.Namespaces.load(modules, _options, startup)
			['catch'](root.Doodad.Tools.catchAndExit);
	};
	
	//! BEGIN_REMOVE()
	if ((typeof process !== 'object') || (typeof module !== 'object')) {
	//! END_REMOVE()
		//! IF_UNSET("serverSide")
			// <PRB> export/import are not yet supported in browsers
			global.createRoot = exports.createRoot;
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
}).call(
	//! BEGIN_REMOVE()
	(typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : this)
	//! END_REMOVE()
	//! IF_SET("serverSide")
	//! 	INJECT("global")
	//! ELSE()
	//! 	INJECT("window")
	//! END_IF()
,
	// WARNING: It is for compatibility purpose only. It is NOT to be used with arbitrary expressions.
	// WARNING: Do not declare any variable and parameter inside these functions.

	// getEvals
	(function() {
//IE8	return ((typeof eval("(function(){})") === 'function') ?
		return (
		
			// Recent engines
			{
				eval: function(/*expr*/) {
					// <PRB> "{...}" and "function ..." need parentheses.
					return eval('(' + arguments[0] + ')');
				},
				evalStrict: function(/*expr*/) {
					"use strict";
					// <PRB> "{...}" and "function ..." need parentheses.
					return eval('(' + arguments[0] + ')');
					
				},
				evalWithCtx: function(ctx /*, expr*/) {
					// NOTE: "ctx" is to be used by the expression
					ctx = ctx || {}; // force variable to be preserved
					// <PRB> "{...}" and "function ..." need parentheses.
					return eval('(' + arguments[1] + ')');
				},
				evalWithCtxStrict: function(ctx /*, expr*/) {
					"use strict";
					// NOTE: "ctx" is to be used by the expression
					ctx = ctx || {}; // force variable to be preserved
					// <PRB> "{...}" and "function ..." need parentheses.
					return eval('(' + arguments[1] + ')');
				},
			}
//IE8			:
//IE8			// Old engines
//IE8			{
//IE8				eval: function(/*expr*/) {
//IE8					var result;
//IE8					// <PRB> "{...}" and "function ..." need parentheses.
//IE8					eval('result=(' + arguments[0] + ')');
//IE8					return result;
//IE8				},
//IE8				evalStrict: function(/*expr*/) {
//IE8					"use strict";
//IE8					var result;
//IE8					// <PRB> "{...}" and "function ..." need parentheses.
//IE8					eval('result=(' + arguments[0] + ')');
//IE8					return result;
//IE8				},
//IE8				evalWithCtx: function(ctx /*, expr*/) {
//IE8					// NOTE: "ctx" is to be used by the expression
//IE8					ctx = ctx || {}; // force variable to be preserved
//IE8					var result;
//IE8					// <PRB> "{...}" and "function ..." need parentheses.
//IE8					eval('result=(' + arguments[1] + ')');
//IE8					return result;
//IE8				},
//IE8				evalWithCtxStrict: function(ctx /*, expr*/) {
//IE8					"use strict";
//IE8					// NOTE: "ctx" is to be used by the expression
//IE8					ctx = ctx || {}; // force variable to be preserved
//IE8					var result;
//IE8					// <PRB> "{...}" and "function ..." need parentheses.
//IE8					eval('result=(' + arguments[1] + ')');
//IE8					return result;
//IE8				},
//IE8			}
			
		);
	})
	
);