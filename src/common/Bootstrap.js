//! REPLACE_BY("// Copyright 2015 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Class library for Javascript (BETA) with some extras (ALPHA)
// File: Bootstrap.js - Bootstrap module
// Project home: https://sourceforge.net/projects/doodad-js/
// Trunk: svn checkout svn://svn.code.sf.net/p/doodad-js/code/trunk doodad-js-code
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015 Claude Petit
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

	// Node.js
	var exports;
	if (global.process) {
		exports = module.exports = {};
	} else {
		exports = global;
	};

	// V8: Increment maximum number of stack frames
	// Source: https://code.google.com/p/v8-wiki/wiki/JavaScriptStackTraceApi
	if (Error.stackTraceLimit < 50) {
		Error.stackTraceLimit = 50;
	};
	
	var __bootstraps__ = {},
		__recordNewBootstraps__ = true;

	var __createRoot__ = global.createRoot = exports.createRoot = function createRoot(/*optional*/modules, /*optional*/_options) {
		//! IF_DEF('PACKAGE_CONFIG')
		//! EVAL("'_options=_options||'+PACKAGE_CONFIG+';'")
		//! END_IF('PACKAGE_CONFIG')
//console.log(_options);

		var __Internal__ = {
			//! REPLACE_BY("DD_DOC:function(d,v){return v;},")
			DD_DOC: function(doc, value) {
				value = Object(value);
				value.__DD_DOC__ = doc;
				return value;
			},
			//! END_REPLACE()
		
			// "isNativeFunction", "isCustomFunction"
			hasIncompatibleFunctionToStringBug: false,
			
			// "createObject", "getPrototypeOf", "setPrototypeOf"
			hasProto: !!({}.__proto__),
		};

		var types = {
				options: {
					settings: {
						reservedAttributes: {
							$TYPE_NAME: undefined,
							INITIALIZED: undefined,
							apply: undefined, 
							call: undefined, 
							bind: undefined, 
							arguments: undefined, 
							caller: undefined, 
							length: undefined, 
							prototype: undefined, 
							__proto__: undefined, 
							constructor: undefined, 
							isPrototypeOf: undefined, 
							hasOwnProperty: undefined, 
							watch: undefined, 
							unwatch: undefined, 
							isGenerator: undefined, 
							propertyIsEnumerable: undefined, 
							__EVENT_LISTENERS__: undefined,
						},
					},
					hooks: {
						invoke: function invoke(obj, fn, /*optional*/args) {
							if (types.isString(fn)) {
								fn = obj[fn];
							};
							if (args) {
								return fn.apply(obj, args);
							} else {
								return fn.call(obj);
							};
						},
					},
				},
			},
			
			tools = {
			};
			
		//===================================
		// Native functions
		//===================================
		var __objectHasOwnProperty__ = Object.prototype.hasOwnProperty;
		var __functionToString__ = Function.prototype.toString;
			
		// <PRB> "function.prototype.toString called on incompatible object" raised with some functions (EventTarget, Node, HTMLElement, ...) ! Don't know how to test for compatibility.
		try {
			if (typeof global.Event === 'function') {
				__functionToString__.call(global.Event);
			};
		} catch(ex) {
			__Internal__.hasIncompatibleFunctionToStringBug = true;
		};
		
		types.isFunction = __Internal__.DD_DOC(
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
					description: "Returns 'true' if object is a function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFunction(obj) {
				return (typeof obj === 'function');
			});
		
		types.isNativeFunction = __Internal__.DD_DOC(
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
					description: "Returns 'true' if object is a native function, 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isNativeFunction(obj) {
				if (types.isFunction(obj)) {
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && __objectHasOwnProperty__.call(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = __functionToString__.call(obj);
					};
					var index1 = str.indexOf('{') + 1,
						index2 = str.indexOf('[native code]', index1);
					if (index2 < 0) {
						return false;
					};
					str = str.slice(index1, index2);
					var len = str.length;
					for (var i = 0; i < len; i++) {
						var chr = str[i];
						if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
							return false;
						};
					};
					return true;
				} else {
					return false;
				};
			});
		
		types.isCustomFunction = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a custom function (non-native), 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isCustomFunction(obj) {
				if (types.isFunction(obj)) {
					var str;
					if (__Internal__.hasIncompatibleFunctionToStringBug && types.hasKey(obj, 'toString') && types.isNativeFunction(obj.toString)) {
						str = obj.toString();
					} else {
						str = __functionToString__.call(obj);
					};
					var index1 = str.indexOf('{') + 1,
						index2 = str.indexOf('[native code]', index1);
					if (index2 < 0) {
						return true;
					};
					str = str.slice(index1, index2);
					var len = str.length;
					for (var i = 0; i < len; i++) {
						var chr = str[i];
						if ((chr !== '\n') && (chr !== '\r') && (chr !== '\t') && (chr !== ' ')) {
							return true;
						};
					};
				};
				return false;
			});
		
			
			
		var __Natives__ = {
			// "extend"
			objectAssign: (types.isNativeFunction(Object.assign) ? Object.assign : undefined),
			
			// "createObject"
			objectCreate: Object.create,
			
			// "hasDefinePropertyEnabled" and "defineProprty"
			objectDefineProperty: (types.isNativeFunction(Object.defineProperty) ? Object.defineProperty : undefined),
			
			// "defineProperties"
			objectDefineProperties: (types.isNativeFunction(Object.defineProperties) ? Object.defineProperties : undefined),
			
			// "getOwnPropertyNames"
			getOwnPropertyNames: (types.isNativeFunction(Object.getOwnPropertyNames) ? Object.getOwnPropertyNames : undefined),
			
			// "getOwnPropertyDescriptor"
			objectGetOwnPropertyDescriptor: (types.isNativeFunction(Object.getOwnPropertyDescriptor) ? Object.getOwnPropertyDescriptor : undefined),
			
			// "getPrototypeOf"
			objectGetPrototypeOf: (types.isNativeFunction(Object.getPrototypeOf) ? Object.getPrototypeOf : undefined),
			
			// "isPrototypeOf"
			objectIsPrototypeOf: (types.isNativeFunction(Object.prototype.isPrototypeOf) ? Object.prototype.isPrototypeOf : undefined),
			
			// "keys"
			objectKeys: (types.isNativeFunction(Object.keys) ? Object.keys : undefined),
			
			// "propertyIsEnumerable"
			objectPropertyIsEnumerable: Object.prototype.propertyIsEnumerable,
			
			// "setPrototypeOf"
			objectSetPrototypeOf: (types.isNativeFunction(Object.setPrototypeOf) ? Object.setPrototypeOf : undefined),
			
			// "isNumber", "isDate", "isArray", "isObject", "isJsObject"
			objectToString: Object.prototype.toString,
			
			// "isArray"
			arrayIsArray: (types.isNativeFunction(Array.isArray) ? Array.isArray : undefined),

			// "isArray"
			windowArray: (types.isNativeFunction(global.Array) ? global.Array : undefined),
			
			// "isBoolean"
			windowBoolean: (types.isNativeFunction(global.Boolean) ? global.Boolean : undefined),
			
			// "isDate"
			windowDate: (types.isNativeFunction(global.Date) ? global.Date : undefined),
			
			// "createErrorType"
			windowError: global.Error,

			// "isNumber"
			windowNumber: (types.isNativeFunction(global.Number) ? global.Number : undefined),
			
			// everywhere
			windowObject: global.Object,
			
			// "isString"
			windowString: (types.isNativeFunction(global.String) ? global.String : undefined),
			
			// "isSymbol"
			windowSymbol: (types.isNativeFunction(global.Symbol) ? global.Symbol : undefined),
			
			// "isNaN"
			numberIsNaN: (global.Number && types.isNativeFunction(global.Number.isNaN) ? global.Number.isNaN : undefined),

			// "isFinite"
			numberIsFinite: (global.Number && types.isNativeFunction(global.Number.isFinite) ? global.Number.isFinite : undefined),
		};
		
			
		//===================================
		// Format functions
		//===================================
			
		tools.format = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
							result += params[key];
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
			});
		
		//===================================
		// ASSERTS functions
		//===================================
			
		var __ASSERT__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
						description: "Throws 'AssertionFailed' when expression resolves to 'false'. Does nothing otherwise.",
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
					throw new types.AssertionFailed(message);
				};
			});
		
		//==================
		// Utilities
		//==================

		types.isNothing = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is 'null' or 'undefined'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isNothing(obj) {
				return (obj === null) || (obj === undefined);
			});
		
		// <PRB> JS has no function to test for primitives
		types.isPrimitive = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a primitive value. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isPrimitive(obj) {
				return !(obj instanceof __Natives__.windowObject);
			});
		
		// <PRB> JS has no function to test for numbers
		types.isNumber = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a number (integer or float). Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.windowNumber ? (function isNumber(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (obj instanceof __Natives__.windowNumber) {
					obj = obj.valueOf();
					return (obj === obj); // means "not NaN"
				} else {
					return false;
				};
			}) : (function isNumber(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj).valueOf();
				// Source: Jeremie Patonnier, MDN Documentation 
				return (+obj === obj);
			})));
		
		types.isInteger = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an integer. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isInteger(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (!types.isNumber(obj)) {
					return false;
				};
				obj = obj.valueOf();
				return (obj === (obj | 0));
			});
		
		types.isFinite = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a finite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFinite(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (__Natives__.numberIsFinite) {
					// <PRB> "Number.isFinite(Object(1)) === false", but "Object(1) instanceof Number === true" !!!
					if (obj instanceof __Natives__.windowNumber) {
						return __Natives__.numberIsFinite(obj.valueOf());
					} else {
						return false;
					};
				} else {
					if (types.isDate(obj)) {
						return false;
					};
					obj = obj.valueOf();
					// Source: http://es6-features.org/#NumberTypeChecking
					return (typeof obj === "number") && (obj === obj) && (obj !== Infinity) && (obj !== -Infinity);
				};
			});
		
		types.isInfinite = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an infinite number. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isInfinite(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj).valueOf();
				return (obj === Infinity) || (obj === -Infinity);
			});
		
		types.isFloat = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a float. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isFloat(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (!types.isFinite(obj)) {
					return false;
				};
				obj = obj.valueOf();
				return (obj !== (obj | 0));
			}),
		
		// <PRB> JS has no function to test for booleans
		types.isBoolean = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a boolean. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.windowBoolean ? (function isBoolean(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (__Natives__.windowObject(obj) instanceof __Natives__.windowBoolean);
			}) : (function isBoolean(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				obj = __Natives__.windowObject(obj).valueOf();
				return ((obj === false) || (obj === true));
			})));
		
		// <PRB> JS has no function to test for strings
		types.isString = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a string. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.windowString ? (function isString(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (__Natives__.windowObject(obj) instanceof __Natives__.windowString);
			}) : (function isString(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (typeof __Natives__.windowObject(obj).valueOf() === 'string');
			})));
		
		// <PRB> JS has no function to test for dates
		types.isDate = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a date. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.windowDate ? (function isDate(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (__Natives__.windowObject(obj) instanceof __Natives__.windowDate);
			}) : (function isDate(obj) {
				return (__Natives__.objectToString.call(obj) === '[object Date]');
			})));
		
		types.isArray = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an array. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.arrayIsArray || (__Natives__.windowArray ? (function isArray(obj) {
				return (obj instanceof __Natives__.windowArray);
			}) : (function isArray(obj) {
				return (__Natives__.objectToString.call(obj) === '[object Array]');
			}))));
		
		types.isArrayLike = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an array-like object. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isArrayLike(obj) {
				//     Unbelievable : There is not an official way to detect an array-like object !!!!
				return !types.isNothing(obj) && !types.isObject(obj) && !types.isFunction(obj) && types.isInteger(__Natives__.windowObject(obj).length);
			});
		
		types.isError = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is an error. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isError(obj) {
				return (obj instanceof Error);
			});
		
		types.isNaN = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is 'NaN'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (__Natives__.numberIsNaN || function isNaN(obj) {
				//     Unbelievable : There was not an official way to detect NaN before ES6 !!!!
				// Source: http://stackoverflow.com/questions/2652319/how-do-you-check-that-a-number-is-nan-in-javascript
				// Explanation: NaN is the only object not equal to itself.
				return (obj !== obj);
			}));
		
		types.isSymbol = __Internal__.DD_DOC(
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
						description: "Returns 'true' if object is a Symbol. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, __Natives__.windowSymbol ? function isSymbol(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return __Natives__.windowObject(obj) instanceof __Natives__.windowSymbol;
			} : function isSymbol(obj) {
				// "Symbol" not implemented.
				return false;
			});
		
		//===================================
		// Stack functions
		//===================================
		
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
		__Internal__.parseStackRegEx = /([^(@]+[(@])?(eval at [^(]+[(])?(([a-zA-Z]+[:][/][/][/]?[^/]+[/][^: ]+)|([A-Z][:][\\][^\\]+[\\][^:]+)|([/][^/]+[/][^:]+)|eval code)( line ([0-9]+) [>] eval)?(([:])([0-9]+)([:])([0-9]+))?/gm;

		tools.parseStack = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
					functionName = functionName.trim();
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
						lineNumber: parseInt(call[8] || call[11] || -1),
						columnNumber: parseInt(call[13] || -1),
						isSystemPath: isSystemPath,
					});
					
					call = __Internal__.parseStackRegEx.exec(stack);
				} while (call);
				
				calls.toString = __Internal__.stackToString;
				
				return calls;
			});

		tools.getStackTrace = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
					throw new __Natives__.windowError("");
				} catch(ex) {
					var stack = null;
					if (ex.stack) {
						stack = tools.parseStack(ex.stack);
						if (stack) {
							stack.splice(0, 1);  // remove "getStackTrace" call entry
						};
					/*
					} else {
						// Safari
						var callers = __getCallers__();
						if (callers) {
							stack = [];
							var callersLen = callers.length;
							for (var i = 0; i < callersLen; i++) {
								var caller = callers[i],
									fn = caller.toString(),
									pos = fn.indexOf("function ");
								if (pos >= 0) {
									fn = fn.slice(pos + 9, fn.indexOf('(')).trim();
								} else {
									fn = null;
								};
								stack.push({
									rawFunctionName: fn,
									functionName: fn || '<anonymous>',
									url: null,
									lineNumber: -1,
									columnNumber: -1,
								});
							};
						};
					*/
					};
					return stack;
				};
			});
		
		//===================================
		// Error functions
		//===================================
			
		// NOTE: 2015/04/16 The actual implementations of Error and other error types are not easily inheritable because their constructor always act as an instantiator.
		types.createErrorType = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
						},
						returns: 'error',
						description: "Creates a new error type, based on another error type.",
			}
			//! END_REPLACE()
			, function createErrorType(name, /*optional*/base, /*optional*/constructor) {
				if (types.isNothing(base)) {
					base = __Natives__.windowError;
				};
				name = name.replace(/[.]/g, '_');
				var type = eval("(function " + name + "(/*paramarray*/) {" +
					(constructor ? (
						"var error = constructor.apply(this, arguments) || this;" +
						"this.throwLevel++;"
					) : (
						"var error = base.apply(this, arguments) || this;"
					)) +
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
					"this.name = name;" +
					"this.description = this.message;" +
					"return this;" +
				"})");
				
				// For "instanceof".
				type.prototype = types.setPrototypeOf(type.prototype, base.prototype);
				
				types.extend(type.prototype, {
					name: null,
					throwLevel: 0,
					parsed: false,
					parsedStack: null,
					
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
								line = this.lineNumber;
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
				
				return type;
			});
		
		//===================================
		// Objects functions
		//===================================
		
		types.hasKeyInherited = __Internal__.DD_DOC(
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
							keys: {
								type: 'arrayof(string),string',
								optional: false,
								description: "Array of keys to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object has or inherits one of the provided keys as own property. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function hasKeyInherited(obj, keys) {
				if (!types.isNothing(obj)) {
					obj = __Natives__.windowObject(obj);
					
					if (!types.isArray(keys)) {
						keys = [keys];
					};
					
					var len = keys.length,
						protos = [],
						lastProto;
						
					do {
						protos.push(obj);
						if (!lastProto && types.isNativeFunction(obj.constructor)) {
							lastProto = obj.constructor.prototype;
						};
						obj = types.getPrototypeOf(obj);
					} while (obj && (obj !== lastProto));
					
					var protosLen = protos.length;
					
					if (protosLen) {
						for (var i = 0; i < len; i++) {
							if (i in keys) {
								var key = keys[i];
								for (var j = 0; j < protosLen; j++) {
									obj = protos[j];
									if (types.hasKey(obj, key)) {
										return true;
									};
								};
							};
						};
					};
				};
				
				return false;
			});
		
		types.hasKey = __Internal__.DD_DOC(
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
							keys: {
								type: 'arrayof(string),string',
								optional: false,
								description: "Key(s) to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if one of the specified keys is an owned property of the object.",
			}
			//! END_REPLACE()
			, function hasKey(obj, keys) {
				if (!types.isNothing(obj)) {
					obj = __Natives__.windowObject(obj);
					if (!types.isArray(keys)) {
						keys = [keys];
					};
					var len = keys.length;
					if (!len) {
						return false;
					};
					for (var i = 0; i < len; i++) {
						if (i in keys) {
							var key = keys[i];
							if (__objectHasOwnProperty__.call(obj, key)) {
								return true;
							};
						};
					};
				};
				return false;
			});
		
		types.get = __Internal__.DD_DOC(
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
							key: {
								type: 'string',
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
				obj = __Natives__.windowObject(obj);
				var hasKey = (inherited ? types.hasKeyInherited : types.hasKey);
				if (hasKey(obj, key)) {
					return obj[key];
				} else {
					return _default;
				};
			});
		
		types.keys = __Internal__.DD_DOC(
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
						returns: 'bool',
						description: "Returns an array of enumerable owned property names of an object. For array-like objects, index properties are excluded.",
			}
			//! END_REPLACE()
			, function keys(obj) {
				// Returns enumerable own properties (those not inherited).
				// Doesn't not include array items.
				if (types.isNothing(obj)) {
					return [];
				};
				
				var result,
					key;
					
				if (types.isArrayLike(obj)) {
					result = [];
					for (key in obj) {
						if ((isNaN(key) || !isFinite(key)) && types.hasKey(obj, key)) {
							result.push(key);
						};
					};
				} else if (__Natives__.objectKeys) {
					 result = __Natives__.objectKeys(obj);
				} else {
					// Polyfill from Mozilla Developer Network.
					obj = __Natives__.windowObject(obj);
					result = [];
					for (key in obj) {
						if (types.hasKey(obj, key)) {
							result.push(key);
						};
					};
				};
				
				if (__Natives__.hasDontEnumBug) {
					for (var i = 0; i < __Natives__.defaultNonEnumerables.length; i++) {
						key = __Natives__.defaultNonEnumerables[i];
						if (types.hasKey(obj, key)) {
							result.push(key);
						};
					};
				};
				return result;
			});
		
		types.extend = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			, (__Natives__.objectAssign || function extend(/*paramarray*/obj) {
				var result;
				if (!types.isNothing(obj)) {
					result = __Natives__.windowObject(obj);
					var len = arguments.length;
					for (var i = 1; i < len; i++) {
						obj = arguments[i];
						if (types.isNothing(obj)) {
							continue;
						};
						// "Object.assign" Polyfill from Mozilla Developer Network.
						obj = __Natives__.windowObject(obj);
						var keys = types.keys(obj),
							keysLen = keys.length, // performance
							j, 
							key;
						for (j = 0; j < keysLen; j++) {
							key = keys[j];
							result[key] = obj[key];
						};
					};
				};
				return result;
			}));
		
		types.depthExtend = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
						description: "Extends the first object with owned properties of the other objects using the specified depth.",
			}
			//! END_REPLACE()
			, function depthExtend(depth, /*paramarray*/obj) {
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
							// "Object.assign" Polyfill from Mozilla Developer Network.
							obj = __Natives__.windowObject(obj);
							var keys = types.keys(obj),
								keysLen = keys.length, // performance
								j, 
								key, 
								objVal,
								resultVal;
							for (j = 0; j < keysLen; j++) {
								key = keys[j];
								objVal = obj[key];
								if ((depth >= 0) && types.isObjectLike(objVal)) {
									resultVal = result[key];
									if (types.isNothing(resultVal)) {
										result[key] = types.depthExtend(depth, {}, objVal);
									} else if (types.isObjectLike(resultVal)) {
										types.depthExtend(depth, resultVal, objVal);
									};
								} else {
									result[key] = objVal;
								};
							};
						};
					};
				};
				return result;
			});
				
		// <PRB> JS has no function to test for objects ( new Object() )
		types.isObject = __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if the object is a direct instance of 'Object'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isObject(obj) {
				return (__Natives__.objectToString.call(obj) === '[object Object]');
			});
			
		types.isObjectLike = __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if the object is an instance of a type which inherits 'Object'. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isObjectLike(obj) {
				return (obj instanceof __Natives__.windowObject);
			});
		
		//==============
		// Options
		//==============
		
		var startupOptions = types.depthExtend(2, {
			settings: {
				enableProperties: false,		// When 'true', enables "defineProperty"
			},
		}, types.get(_options, 'startup'));
		
		startupOptions.settings.enableProperties = (startupOptions.settings.enableProperties === 'true') || !!(+startupOptions.settings.enableProperties);
		
		//==============
		// Properties
		//==============
		
		types.propertyIsEnumerable = __Internal__.DD_DOC(
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
							key: {
								type: 'string',
								optional: false,
								description: "A property name to test for.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if the property of the object is enumrable. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function(obj, key) {
				return __Natives__.objectPropertyIsEnumerable.call(obj, key);
			});
		
		types.hasDefinePropertyEnabled = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'boolean',
						description: "Returns 'true' if 'defineProperty' is natively available. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, (startupOptions.settings.enableProperties && __Natives__.objectDefineProperty ? (function hasDefinePropertyEnabled() {
				return true;
			}) : (function hasDefinePropertyEnabled() {
				return false;
			})));
		
		types.defineProperty = __Internal__.DD_DOC(
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
			, (__Natives__.objectDefineProperty || (function defineProperty(obj, name, descriptor) {
				if (!types.isObjectLike(descriptor)) {
					throw new types.TypeError("Invalid descriptor.");
				};
				if (descriptor.get || descriptor.set || !descriptor.enumerable || !descriptor.writable || !descriptor.configurable) {
					throw new types.TypeError("Properties are not supported.");
				} else {
					if (!types.isObjectLike(obj)) {
						throw new types.TypeError("Not an object.");
					};
					obj[name] = descriptor.value;
				};
			}))),

		types.defineProperties = __Internal__.DD_DOC(
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
			, (__Natives__.objectDefineProperties || (function defineProperties(obj, props) {
				if (!types.isObject(props)) {
					throw new types.TypeError("Invalid properties.");
				};
				for (var key in props) {
					if (types.hasKey(props, key)) {
						types.defineProperty(obj, key, props[key]);
					};
				};
			})));

		types.getOwnPropertyNames = __Internal__.DD_DOC(
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
						returns: 'arrayof(string)',
						description: "Returns every own property of an object.",
			}
			//! END_REPLACE()
			, (__Natives__.getOwnPropertyNames || (function getOwnPropertyNames(obj, key) {
				obj = Object(obj);
				var result = [];
				for (var key in obj) {
					if (types.hasOwnProperty(obj, key)) {
						result.push(key);
					};
				};
				return result;
			})));
		
		types.getOwnPropertyDescriptor = __Internal__.DD_DOC(
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
							key: {
								type: 'string',
								optional: false,
								description: "Property name.",
							},
						},
						returns: 'object',
						description: "Returns the descriptor of the own property of the object.",
			}
			//! END_REPLACE()
			, (__Natives__.objectGetOwnPropertyDescriptor || (function getOwnPropertyDescriptor(obj, key) {
				if (types.hasKey(obj, key)) {
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
		
		types.createObject = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			, (__Natives__.objectCreate || (function() {
				// Enhanced polyfill taken from Mozilla Developer Network. 
				if (__Internal__.hasProto) {
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
				} else {
					return (function createObject(proto, /*optional*/properties) {
						var tmp = function Object() {};
						tmp.prototype = proto;
						var obj = new tmp();

						if (properties) {
							types.defineProperties(obj, properties);
						};
						
						return obj;
					});
				};
			})()));

		types._new = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
			, function _new(type, /*optional*/args) {
				if (!types.isFunction(type)) {
					return null;
				};
				if (args && !types.isArrayLike(args)) {
					return null;
				};
				if (args && args.length) {
					var obj = types.createObject(type.prototype);
					obj.constructor = type;
					obj.constructor.apply(obj, args);
				} else {
					obj = new type();
				};
				return obj;
			});
		
		types.getPrototypeOf = __Internal__.DD_DOC(
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
						returns: 'object',
						description: "Returns the prototype of an object.",
			}
			//! END_REPLACE()
			, (__Natives__.objectGetPrototypeOf || (function getPrototypeOf(obj) {
				if (__Internal__.hasProto) {
					// For browsers implementing "__proto__".
					return function getPrototypeOf(obj) {
						return __Natives__.windowObject(obj).__proto__;
					};
				} else {
					// For very old browsers.
					// TODO: Test with old browsers.
					return function getPrototypeOf(obj) {
						return __Natives__.windowObject(obj).constructor.prototype;
					};
				};
			})()));
		
		types.setPrototypeOf = __Internal__.DD_DOC(
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
				if (enabled && __Natives__.objectSetPrototypeOf) {
					return __Natives__.objectSetPrototypeOf(obj, proto);
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

					var tmp = types.createObject(proto, {
						constructor: {
							value: obj.constructor,
							writable: true,
						},
					});

					for (var key in obj) {
						if (types.hasKey(obj, key)) {
							tmp[key] = obj[key];
						};
					};

					return tmp;
				};
			});

		types.isPrototypeOf = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			, (__Natives__.objectIsPrototypeOf ? (function isPrototypeOf(protoObj, obj) {
				// NOTE: Why does this function is part of Object prototype ?
				return __Natives__.objectIsPrototypeOf.call(protoObj, obj);
			}) : (function isPrototypeOf(protoObj, obj) {
				// TODO: Test me
				obj = __Natives__.windowObject(obj);
				while (obj = types.getPrototypeOf(obj)) {
					if (obj === protoObj) {
						return true;
					};
				};
				return false;
			})));
		
		//===================================
		// Errors
		//===================================
			
		types.TypeError = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised on invalid value type.",
			}
			//! END_REPLACE()
			, global.TypeError || types.createErrorType("TypeError", global.Error));
		
		types.Error = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
			, types.createErrorType('Error', global.Error, function _new(message, /*optional*/params) {
				message = tools.format(message, params);
				return global.Error.call(this, message);
			}));

		types.AssertionFailed = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							message: {
								type: 'string',
								optional: false,
								description: "A message explaining the assertion.",
							},
						},
						returns: 'error',
						description: "Raised when an assertion fail.",
			}
			//! END_REPLACE()
			, types.createErrorType("AssertionFailed", types.Error, function _new(message, /*optionla*/params) {
				if (message) {
					return types.Error.call(this, "Assertion failed: " + message, params);
				} else {
					return types.Error.call(this, "Assertion failed.");
				};
			}));

		types.ParseError = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised on parse error.",
			}
			//! END_REPLACE()
			, types.createErrorType("ParseError", types.Error));
		
		types.NotSupported = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised when something is not supported.",
			}
			//! END_REPLACE()
			, types.createErrorType("NotSupported", types.Error));
		
		types.HttpError = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
						},
						returns: 'error',
						description: "Raised on HTTP error.",
			}
			//! END_REPLACE()
			, types.createErrorType('HttpError', global.Error, function _new(code, message, /*optionla*/params) {
				this.code = code;
				return types.Error.call(this, message, params);
			}));
		
		types.BufferOverflow = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised on buffer overflow.",
			}
			//! END_REPLACE()
			, types.createErrorType('BufferOverflow', types.Error, function _new() {
				return types.Error.call(this, "Buffer overflow.");
			}));
		
		types.TimeoutError = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'error',
						description: "Raised on timeout.",
			}
			//! END_REPLACE()
			, types.createErrorType('TimeoutError', types.Error, function _new(message, /*optionla*/params) {
				return types.Error.call(this, message || "Timeout.", params);
			}));
		
		types.AccessDenied = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining what is denied or not allowed.",
							},
						},
						returns: 'error',
						description: "Raised on access denied or not allowed operation.",
			}
			//! END_REPLACE()
			, types.createErrorType('AccessDenied', types.Error, function _new(message, /*optionla*/params) {
				return types.Error.call(this, message || "Access denied.", params);
			}));
		
		//===================================
		// Type functions
		//===================================
		
		types.isType = __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' when object is a Doodad type (inherits from 'Doodad.Types.Type'). Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isType(obj) {
				return (obj === types.Type) || types.baseof(types.Type, obj);
			});
		
		types.isJsFunction = __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if object is a function, and not a Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isJsFunction(obj) {
				return types.isFunction(obj) && !(obj === types.Type) && (obj !== types.Type) && !types.baseof(types.Type, obj);
			});

		types.isJsObject = __Internal__.DD_DOC(
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
						returns: 'boolean',
						description: "Returns 'true' if object is a normal Javascript object, so not created from a Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isJsObject(obj) {
				return ((__Natives__.objectToString.call(obj) === '[object Object]') && !types._instanceof(obj, types.Type));
			});

		types.is = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "An object to test for. A Doodad type can be provided.",
							},
							type: {
								type: ['type', 'object'],
								optional: false,
								description: "A Doodad type. If a Doodad object is provided, its type will be used.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is from the specified Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function is(obj, type) {
				// "obj" is of type "type".
				
				if ((obj === undefined) || (obj === null)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (!(type instanceof Array)) {
					type = [type];
				};
				var typeLen = type.length,
					i,
					t;
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				for (i = 0; i < typeLen; i++) {
					if (i in type) {
						t = type[i];
						if (t) {
							if (!types.isFunction(t)) {
								t = t.constructor;
							};
							if (obj === t) {
								return true;
							};
						};
					};
				};
				return false;
			});

		types.isLike = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: ['object', 'type'],
								optional: false,
								description: "An object to test for. A Doodad type can be provided.",
							},
							type: {
								type: ['type', 'object'],
								optional: false,
								description: "A Doodad type. If a Doodad object is provided, its type will be used.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if object is from or inherits from the specified Doodad type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function isLike(obj, type) {
				// "obj" is of or inherits type "types".

				if ((obj === undefined) || (obj === null)) {
					return false;
				};
				obj = __Natives__.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if (!(type instanceof Array)) {
					type = [type];
				};
				var typeLen = type.length,
					baseName,
					i,
					t;
				obj = types.getPrototypeOf(obj);
				for (i = 0; i < typeLen; i++) {
					if (i in type) {
						t = type[i];
						if (t) {
							if (!types.isFunction(t)) {
								t = t.constructor;
							};
							t = types.getPrototypeOf(t);
							if ((t === obj) || types.isPrototypeOf(t, obj)) {
								return true;
							};
						};
					};
				};
				return false;
			});

		__Internal__.fnProto = types.getPrototypeOf(function(){});
		
		types.baseof = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							base: {
								type: 'type',
								optional: false,
								description: "A Doodad type.",
							},
							type: {
								type: 'type',
								optional: false,
								description: "A Doodad type.",
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
				if (!(base instanceof Array)) {
					base = [base];
				};
				var baseLen = base.length,
					i,
					b;
				type = types.getPrototypeOf(type);
				for (i = 0; i < baseLen; i++) {
					if (i in base) {
						b = base[i];
						if (types.isFunction(b)) {
							b = types.getPrototypeOf(b);
							if ((b !== __Internal__.fnProto) && types.isPrototypeOf(b, type)) {
								return true;
							};
						};
					};
				};
				return false;
			});

		types._instanceof = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							base: {
								type: 'object',
								optional: false,
								description: "A Doodad object.",
							},
							type: {
								type: 'type',
								optional: false,
								description: "A Doodad type.",
							},
						},
						returns: 'boolean',
						description: "Returns 'true' if a object inherits from type. Returns 'false' otherwise.",
			}
			//! END_REPLACE()
			, function _instanceof(obj, type) {
				// Uses prototypes chain like the operator "instanceof", but doesn't raise an exception when 'type' is not a type. 
				// NOTE: With Doodad objects it is recommended to use this function instead of the operator.

				obj = __Natives__.windowObject(obj);
				if (types.isFunction(obj)) {
					// Use "types.baseof"
					return false;
				};
				if (!(type instanceof Array)) {
					type = [type];
				};
				var proto = types.getPrototypeOf(obj),
					typeLen = type.length,
					baseName,
					i,
					t;
				for (i = 0; i < typeLen; i++) {
					if (i in type) {
						t = type[i];
						if (types.isFunction(t)) {
							if (obj instanceof t) {
								return true;
							};
						};
					};
				};
				
				return false;
			});

		types.isSingleton = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
				obj = __Natives__.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return false;
				};
				return !!obj.$isSingleton;
			});

		
		types.getType = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
				obj = __Natives__.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return null;
				};
				return obj;
			});

		types.getTypeName = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
						returns: 'string',
						description: "Returns the name of the type of an object. Returns 'null' if not a Doodad object.",
			}
			//! END_REPLACE()
			, function getTypeName(obj) {
				if (types.isNothing(obj)) {
					return null;
				};
				obj = __Natives__.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return null;
				};
				return obj.$TYPE_NAME || obj.name;
			});
		
		types.getBase = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
						description: "Returns the base type of an object. Returns 'null' if not a Doodad object.",
			}
			//! END_REPLACE()
			, function getBase(obj) {
				if (types.isNothing(obj)) {
					return null;
				};
				obj = __Natives__.windowObject(obj);
				if (!types.isFunction(obj)) {
					obj = obj.constructor;
				};
				if ((obj !== types.Type) && !types.baseof(types.Type, obj)) {
					return null;
				};
				return (types.getPrototypeOf(obj.prototype).constructor || null);
			});

		//===================================
		// Type
		//===================================
		
		types.INHERIT = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							base: {
								type: 'type',
								optional: false,
								description: "A Doodad type used as a base type.",
							},
							type: {
								type: 'type',
								optional: false,
								description: "A Doodad type to inherit.",
							},
						},
						returns: 'type',
						description: "Returns a new Doodad type which is the result of a Doodad type inherited from a base Doodad type.",
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
				type.prototype = types.setPrototypeOf(type.prototype, base.prototype);
				
				return type;
			});

		var __emptyFunction__ = function empty() {};
		
		types.SUPER = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							fn: {
								type: 'method',
								optional: false,
								description: "A method.",
							},
						},
						returns: 'method',
						description: "Flags a method so it will override instead of replace. Returns that method.",
			}
			//! END_REPLACE()
			, function SUPER(fn) {
				fn.superEnabled = true;
				return fn;
			});
		
		types.createSuper = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							superProto: {
								type: ['object', 'method'],
								optional: true,
								description: "The prototype where the overridden method is stored, or the method itself.",
							},
							fnProto: {
								type: ['object', 'method'],
								optional: false,
								description: "The prototype where the new method is stored, or the method itself.",
							},
							attr: {
								type: 'string',
								optional: true,
								description: "The method name. If not provided, 'superProto' and 'fnProto' must be the methods themselves.",
							},
						},
						returns: 'method',
						description: "Returns a new method which is the result of the override.",
			}
			//! END_REPLACE()
			, function createSuper(/*optional*/superProto, fnProto, /*optional*/attr, /*optional*/noGetSet) {
				if (!fnProto) {
					return null;
				};
				if (!attr) {
					attr = 'value';
					var tmp = {};
					tmp[attr] = superProto;
					superProto = tmp;
					var tmp = {};
					tmp[attr] = fnProto;
					fnProto = tmp;
				};
				if (!superProto) {
					superProto = {};
				};
				var _caller;
				if (noGetSet) {
					_caller = function caller(/*paramarray*/) {
						var oldSuper = this._super;
						//types.defineProperty(this, '_super', {value: _caller.SUPER_PROTOTYPE[attr] || __emptyFunction__, enumerable: false, writable: false, configurable: true});
						__setAttribute__.call(this, '_super', _caller.SUPER_PROTOTYPE[attr] || __emptyFunction__, {enumerable: false, writable: false, configurable: true});
						try {
							return _caller.FUNCTION_PROTOTYPE[attr].apply(this, arguments);
						} catch(ex) {
							throw ex;
						} finally {
							//types.defineProperty(this, '_super', {value: oldSuper, enumerable: false, writable: false, configurable: true});
							__setAttribute__.call(this, '_super', oldSuper, {enumerable: false, writable: false, configurable: true});
						};
					};
				} else {
					_caller = function caller(/*paramarray*/) {
						var oldSuper = types.options.hooks.invoke(this, 'getAttribute', ['_super']);
						types.options.hooks.invoke(this, 'setAttribute', ['_super', _caller.SUPER_PROTOTYPE[attr] || __emptyFunction__], {enumerable: false, writable: false, configurable: true});
						try {
							return _caller.FUNCTION_PROTOTYPE[attr].apply(this, arguments);
						} catch(ex) {
							throw ex;
						} finally {
							types.options.hooks.invoke(this, 'setAttribute', ['_super', oldSuper], {enumerable: false, writable: false, configurable: true});
						};
					};
				};
				_caller = types.setPrototypeOf(_caller, types.SUPER);
				_caller.SUPER_PROTOTYPE = superProto;
				_caller.FUNCTION_PROTOTYPE = fnProto;
				_caller.METHOD_NAME = attr;
				_caller.__DD_DOC__ = null;
				return _caller;
			});

		types.SINGLETON = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						paramsDirection: 'rightToLeft',
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
							getType: {
								type: 'boolean',
								optional: true,
								description: "If 'true', will returns the type of the singleton object.",
							},
						},
						returns: ['object', 'type'],
						description: "Transforms a Doodad type to a singleton object. Returns that singleton object.",
			}
			//! END_REPLACE()
			, function SINGLETON(/*<<< optional[getType], optional[args], type*/) {
				var argumentsLen = arguments.length,
					type = arguments[argumentsLen - 1],
					args,
					getType = false;
					
				if (argumentsLen > 1) {
					args = arguments[argumentsLen - 2];
				};
				
				if (argumentsLen > 2) {
					getType = arguments[argumentsLen - 3];
				};
				
				if (!type.$isSingleton) {
					types.options.hooks.invoke(type, 'setAttribute', ['$isSingleton', true]);
					
					var proto = types.getPrototypeOf(type);
					proto.$inherit = types.createSuper(proto.$inherit, (function $inherit(/*paramarray*/) {
						var obj = this._super.apply(this, arguments) || this;
						if (types.baseof(types.Type, obj)) {
							// Object is a type, so instantiate it
							obj = types._new(obj, args);
						};
						return obj;
					}));
					types.options.hooks.invoke(proto, 'setAttribute', ['$isSingleton', true]);
					
					var proto = type.prototype;
					proto.$inherit = types.createSuper(type.prototype.$inherit, (function $inherit(/*paramarray*/) {
						var type = this._super.apply(this, arguments) || this;
						type = types.getType(type);
						return type.$inherit.apply(type, arguments);
					})); 
					
				};
				
				type = types.INIT(type, args);

				if (getType) {
					return type;
				};
				
				var obj = types._new(type, args);
				
				return obj;
			});
		
		types.INIT = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
				if (type.INITIALIZED) {
					return type;
				} else {
					return types.options.hooks.invoke(type, '_new', args) || type;
				};
			});
		
		types.createType = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							name: {
								type: 'string',
								optional: false,
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
						},
						returns: 'type',
						description: "Creates and returns a new Doodad type. N.B.: You should always use methods '$inherit' and '$extend' instead of this function.",
			}
			//! END_REPLACE()
			, function createType(name, /*optional*/base, /*optional*/constructor, /*optional*/typeProto, /*optional*/instanceProto, /*optional*/constructorContext) {
				name = name.replace(/[.]/g, "_");
				
				var typeProtoIsFn = types.isFunction(typeProto);
				
				var expr = "[(" + (types.isFunction(constructor) ? "constructor" : "function " + name + "(/*paramarray*/) {" + (types.isString(constructor) ? constructor : (base ? "return base.apply(this, arguments) || this;" : "return this;")) + "}") + 
							"),(" + (typeProtoIsFn ? "null" : "function " + name + "_Prototype(){}") + ")];";
				
				var result = eval(expr);
				
				var type = result[0],
					proto,
					baseProto;
				
				// Attach type prototype
				if (typeProtoIsFn) {
					proto = typeProto;
				} else {
					proto = result[1];
				};

		/*
				if (!base) {
					// Create root prototype
					proto = types.setPrototypeOf({
						...
					}, proto);
				};
		*/

				// Inherit base
				var baseProto,
					baseIsType = false;
				if (base) {
					type = types.INHERIT(base, type);
					
					baseIsType = types.isType(base);
					baseProto = types.getPrototypeOf(base);
					proto = types.setPrototypeOf(proto, baseProto);
				};
			
				// Set type prototype
				type = types.setPrototypeOf(type, proto);

				// Override type prototype
				var reservedAttributes = types.options.settings.reservedAttributes;
				if (typeProto) {
					for (var key in typeProto) {
						if (types.hasKey(typeProto, key) && (!types.hasKey(reservedAttributes, key))) {
							if (types.hasKey(typeProto, key)) {
								var value = typeProto[key],
									createSuper = (types.isFunction(value) ? value.superEnabled : false);
									
								if (createSuper) {
									if (baseProto) {
										value = types.createSuper(baseProto, typeProto, key, !baseIsType);
									} else {
										value = types.createSuper(proto, typeProto, key, !baseIsType);
									};
								};
								
								if (baseProto && types.isObjectLike(value)) {
									var baseValue = baseProto[key];
									if (types.isObjectLike(baseValue)) {
										value = __Internal__.DD_DOC(baseValue.__DD_DOC__, value);
									};
								};
								
								types.defineProperty(proto, key, {
									configurable: true,
									enumerable: true,
									value: value,
									writable: true,
								});
							};
						};
					};
				};

				// Override instance prototype
				if (instanceProto) {
					if (types.isFunction(instanceProto)) {
						// var t1 = function(){};
						// t1.prototype.value1 = 1;
						// t1.prototype.value2 = 2;
						// var t2 = function(){};
						// t2.prototype = Object.types.setPrototypeOf(t2.prototype, new t1());
						// var obj1 = new t2();
						// console.log(obj1.value1);
						// >>> 1
						// console.log(obj1.value2);
						// >>> 2
						// t1.prototype.value1 = 5;
						// var obj2 = new t2();
						// console.log(obj1.value1);
						// >>> 5
						type.prototype = types.setPrototypeOf(type.prototype, new instanceProto());
						
						// var t1 = function(){};
						// console.log(t1.prototype.constructor === t1);
						// >>> true
						// var proto1 = {a: 1};
						// t1.prototype = proto1;
						// console.log(t1.prototype.constructor === t1);
						// >>> false  // BAD
						// t1.prototype.constructor = t1;
						// console.log(t1.prototype.constructor === t1);
						// >>> true   // OK
						type.prototype.constructor = type;

					} else {
						// [example: We don't know the prototype chain of the prototype object "proto"]
						// 		var t1 = function() {};
						// 		t1.prototype.junk = 'junk';
						// 		t1.prototype.toString = function() {return 'oops';};
						// 		var proto = new t1();
						// [/example]
						// proto.value = 'value';
						// var t2 = function() {};
						// t2.prototype = proto;
						// var obj1 = new t2();
						// console.log(obj1.value);
						// >>> value
						// console.log(obj1.junk);
						// >>> junk    // BAD
						// console.log(obj1.toString());
						// >>> oops    // BAD
						proto = type.prototype;
						baseProto = (base ? base.prototype : null);
						for (var key in instanceProto) {
							if (types.hasKey(instanceProto, key) && (!types.hasKey(reservedAttributes, key))) {
								if (types.hasKey(instanceProto, key)) {
									var value = instanceProto[key],
										createSuper = (types.isFunction(value) ? value.superEnabled : false);
										
									if (createSuper) {
										if (baseProto) {
											value = types.createSuper(baseProto, instanceProto, key, !baseIsType);
										} else {
											value = types.createSuper(proto, instanceProto, key, !baseIsType);
										};
									};
									
									if (baseProto && types.isObjectLike(value)) {
										var baseValue = baseProto[key];
										if (types.isObjectLike(baseValue)) {
											value = __Internal__.DD_DOC(baseValue.__DD_DOC__, value);
										};
									};

									types.defineProperty(proto, key, {
										configurable: true,
										enumerable: true,
										value: value,
										writable: true,
									});
								};
							};
						};
					};
				};
				
				// Return type
				return type;
			});
		

		var __typeInherit__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
			, function $inherit(typeProto, instanceProto, /*optional*/constructor, /*optional*/constructorContext) {
				// <PRB> "fn.call(undefined, ...)" can automatically set "this" to "window" !
				var base = ((this === global) ? undefined: this),
					type = types.createType(
						/*name*/
						typeProto.$TYPE_NAME, 
						
						/*base*/
						base, 
						
						/*constructor*/
						(constructor || "return this._new.apply(this, arguments) || this;"), 
						
						/*typeProto*/
						typeProto, 
						
						/*instanceProto*/
						instanceProto, 
						
						/*constructorContext*/
						constructorContext
					);
				if (types.hasDefinePropertyEnabled()) {
					types.defineProperty(type, '$TYPE_NAME', {
						configurable: true,
						enumerable: true,
						value: typeProto.$TYPE_NAME,
						writable: false,
					});
				} else {
					type.$TYPE_NAME = typeProto.$TYPE_NAME;
				};
				return type;
			});
		
		var __newFunction__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'undefined',
						description: "Object or type creator.",
			}
			//! END_REPLACE()
			, function _new() {
				if (!types.hasKey(this, '$isSingleton')) {
					if (types.hasDefinePropertyEnabled()) {
						types.defineProperty(this, '$isSingleton', {
								configurable: false,
								enumerable: false,
								value: false,
								writable: false,
						});
					} else {
						this.$isSingleton = false;
					};
				};
				this.setAttribute('INITIALIZED', true, {enumerable: false, writable: false, configurable: true});
			});
		
		var __deleteFunction__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'undefined',
						description: "Object or type destructor.",
			}
			//! END_REPLACE()
			, function _delete() {
				this.setAttribute('INITIALIZED', false, {enumerable: false, writable: false, configurable: true});
			});

		var __getAttribute__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							attr: {
								type: 'string',
								optional: false,
								description: "Attribute name.",
							},
						},
						returns: 'any',
						description: "Returns the value of an attribute. Returns 'undefined' if the attribute doesn't exist.",
			}
			//! END_REPLACE()
			, function getAttribute(attr) {
				return this[attr];
			});
		
		var __getAttributes__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							attrs: {
								type: 'arrayof(string)',
								optional: false,
								description: "Array of attribute names.",
							},
						},
						returns: 'object',
						description: "Returns an object with the attributes and their value.",
			}
			//! END_REPLACE()
			, function getAttributes(attrs) {
				var attrsLen = attrs.length,
					result = {};
				for (var i = 0; i < attrsLen; i++) {
					var attr = attrs[i],
						descriptor = types.getOwnPropertyDescriptor(this, attr);
					if (descriptor)
					result[attr] = this[attr];
				};
				return result;
			});
		
		var __setAttribute__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							attr: {
								type: 'string',
								optional: false,
								description: "Attribute name.",
							},
							value: {
								type: 'any',
								optional: false,
								description: "Attribute value.",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Default property options.",
							},
						},
						returns: 'any',
						description: "Set the value to the attribute and returns that value.",
			}
			//! END_REPLACE()
			, function setAttribute(attr, value, /*optional*/options) {
				var descriptor = types.getOwnPropertyDescriptor(this, attr);
				if (descriptor && !descriptor.writable && !descriptor.set && descriptor.configurable) {
					descriptor.value = value;
					types.defineProperty(this, attr, descriptor);
				} else if (!descriptor && options && types.hasDefinePropertyEnabled()) {
					descriptor = types.extend({}, options);
					descriptor.value = value;
					types.defineProperty(this, attr, descriptor);
				} else {
					this[attr] = value;
				};
				return value;
			});
		
		var __setAttributes__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 1,
						params: {
							values: {
								type: 'object',
								optional: false,
								description: "An object with the attributes and their value.",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Default property options.",
							},
						},
						returns: 'object',
						description: "Set the value to each attributes and returns that values.",
			}
			//! END_REPLACE()
			, function setAttributes(values, /*optional*/options) {
				var keys = types.keys(values),
					keysLen = keys.length;
				for (var i = 0; i < keysLen; i++) {
					var key = keys[i];
					this.setAttribute(keys[i], values[key], options);
				};
				return values;
			});
		
		var __typeToString__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
		
		var __typeToLocaleString__ = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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


		types.Type = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'object',
						description: "Base type of every Doodad types.",
			}
			//! END_REPLACE()
			, types.INIT(__typeInherit__.call(undefined,
				/*typeProto*/
				{
					$TYPE_NAME: 'Type',
					
					$isSingleton: false,
					//_super: null,
					INITIALIZED: false,
					
					$inherit: __typeInherit__,
					
					_new: __newFunction__,
					_delete: __deleteFunction__,
					
					getAttribute: __getAttribute__,
					getAttributes: __getAttributes__,
					setAttribute: __setAttribute__,
					setAttributes: __setAttributes__,
					
					toString: types.SUPER(__typeToString__),
					toLocaleString: types.SUPER(__typeToLocaleString__),
				},
				/*instanceProto*/
				{
					//_super: null,
					INITIALIZED: false,
					
					_new: __newFunction__,
					_delete: __deleteFunction__,
					
					getAttribute: __getAttribute__,
					getAttributes: __getAttributes__,
					setAttribute: __setAttribute__,
					setAttributes: __setAttributes__,
					
					toString: types.SUPER(__typeToString__),
					toLocaleString: types.SUPER(__typeToLocaleString__),
				}
			)));

		//===================================
		// Event functions
		//===================================
			
		// NOTE: 2015/04/16 We can't inherit from the actual implementations of Event and CustomEvent !
		types.CustomEvent = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
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
			, types.INIT(types.Type.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'CustomEvent',
				},
				/*instanceProto*/
				{
					type: null,
					bubbles: false,
					cancelable: false,
					detail: null,
					
					canceled: false,   // preventDefault
					bubbling: false,   // stopPropagation
					stopped: false,    // stopImmediatePropagation
					
					_new: types.SUPER(function _new(type, /*optional*/init) {
						this._super();
						this.type = type;
						// NOTE: Event targets are responsible to bubble events to their parent when "bubbling" is true.
						this.bubbling = this.bubbles = !!types.get(init, 'bubbles');
						this.cancelable = !!types.get(init, 'cancelable');
						this.detail = types.get(init, 'detail');
					}),
					
					preventDefault: __Internal__.DD_DOC(
								//! REPLACE_BY("null")
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
								//! REPLACE_BY("null")
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
								//! REPLACE_BY("null")
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
		
		types.CustomEventTarget = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'object',
						description: "Custom event target.",
			}
			//! END_REPLACE()
			, types.INIT(types.Type.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'CustomEventTarget',
				},
				/*instanceProto*/
				{
					__EVENT_LISTENERS__: null,
					
					_new: types.SUPER(function _new() {
						this._super();
						// TODO: What is the formal property name ? Where all listeners are stored ?
						if (types.hasDefinePropertyEnabled()) {
							types.defineProperty(this, '__EVENT_LISTENERS__', {
								enumerable: false,
								writable: false,
								configurable: false,
								value: {},
							});
						} else {
							// NOTE: Will enumerate
							this.__EVENT_LISTENERS__ = {};
						};
					}),
					
					addEventListener: __Internal__.DD_DOC(
								//! REPLACE_BY("null")
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
							
							var listeners = this.__EVENT_LISTENERS__[type];
							if (!types.isArray(listeners)) {
								this.__EVENT_LISTENERS__[type] = listeners = [];
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
								//! REPLACE_BY("null")
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
							
							if (types.hasKey(this.__EVENT_LISTENERS__, type)) {
								var listeners = this.__EVENT_LISTENERS__[type];
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
								//! REPLACE_BY("null")
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
								if (types.hasKey(this.__EVENT_LISTENERS__, type)) {
									listeners = this.__EVENT_LISTENERS__[type];
								} else {
									this.__EVENT_LISTENERS__[type] = listeners = [];
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
									if (!event.stopped && types.hasKey(this, type)) {
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
								//! REPLACE_BY("null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'undefined',
											description: "Removes every event listeners.",
								}
								//! END_REPLACE()
						, function clearListeners() {
							this.__EVENT_LISTENERS__.length = 0;
						}),
				}
			)));
		
		//===================================
		// Namespace
		//===================================
		
		types.Namespace = __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
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
			, types.INIT(types.CustomEventTarget.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'Namespace',
				},
				/*instanceProto*/
				{
					DD_PARENT: null,
					DD_NAME: null,
					DD_FULL_NAME: null,
					
					_new: types.SUPER(function(parent, name, fullName) {
						this._super();
						
						this.setAttributes({
							DD_PARENT: parent,
							DD_NAME: name,
							DD_FULL_NAME: fullName,
						}, {writable: false, enumerable: false, configurable: true});
					}),
				}
			)));
		
		//===================================
		// Root
		//===================================

		return __Internal__.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							modules: {
								type: 'arrayof(object)',
								optional: true,
								description: "Array of modules to load.",
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
			, types.SINGLETON([modules, _options], types.Namespace.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'Root',
				},
				/*instanceProto*/
				{
					DD_DOC: __Internal__.DD_DOC,
					DD_REGISTRY: null,  // Created by "Namespaces.js"
					Namespace: types.Namespace,
					Config: null,
					
					_new: types.SUPER(function _new(/*optional*/modules, /*optional*/options) {
						"use strict";
						
						this._super(null, '<Root>', '<Root>');

						this.Config = options;
						
						// Prebuild "Doodad.Types" and "Doodad.Tools"
						var doodadNs = this.Doodad = new types.Namespace(this, 'Doodad', 'Doodad'),
							typesNs = doodadNs.Types = new types.Namespace(doodadNs, 'Types', 'Doodad.Types'),
							toolsNs = doodadNs.Tools = new types.Namespace(doodadNs, 'Tools', 'Doodad.Tools');
							
						types.extend(typesNs, types);
						types.extend(toolsNs, tools);
						
						var self = this;
						
						if (types.hasDefinePropertyEnabled()) {
							types.defineProperties(typesNs, {
								'createRoot': {
									get: function() {
										return __createRoot__;
									},
								},
								'invoke': {
									get: function() {
										return types.options.hooks.invoke;
									},
								},
							});
						} else {
							typesNs.createRoot = __createRoot__;
							typesNs.invoke = function invoke(obj, fn, /*optional*/args) {
								return types.options.hooks.invoke(obj, fn, args);
							};
						};
						
						// Load bootstrap modules
						if (!modules) {
							modules = {};
						};
						types.extend(modules, __bootstraps__);
						
						var names = types.keys(modules);
						if (!names.length) {
							throw new Error("Missing bootstrap modules.");
						};
						
						var loading = {},
							name;
						whileName: while (name = names.shift()) {
							var mod = modules[name];
							if (mod.bootstrap) {
								var deps = (mod.dependencies || []);
								for (var i = 0; i < deps.length; i++) {
									var dep = deps[i],
										optional = false;
									if (types.isObject(dep)) {
										optional = dep.optional;
										dep = dep.name;
									};
									var bootstrapping = types.hasKey(loading, dep);
									if (!types.hasKey(modules, dep) && !bootstrapping) {
										if (optional) {
											bootstrapping = true;
										} else {
											throw new Error("Missing bootstrap module '" + dep + "'.");
										};
									};
									if (!bootstrapping) {
										names.push(name);
										continue whileName;
									};
								};
								var shortNames = name.split('.'),
									parent = this,
									fullName = '',
									shortName,
									j,
									k;
								for (k = 0; k < shortNames.length; k++) {
									shortName = shortNames[k];
									fullName += '.' + shortName;
									if (!types.hasKey(parent, shortName)) {
										parent[shortName] = new types.Namespace(parent, shortName, fullName.slice(1));
									};
									parent = parent[shortName];
								};
								
								var namespaces = (mod.namespaces || []),
									namespace = parent;
								for (j = 0; j < namespaces.length; j++) {
									shortNames = namespaces[j].split('.');
									fullName = '.' + name;
									for (k = 0; k < shortNames.length; k++) {
										shortName = shortNames[k];
										fullName += '.' + shortName;
										if (!types.hasKey(parent, shortName)) {
											parent[shortName] = new types.Namespace(parent, shortName, fullName.slice(1));
										};
										parent = parent[shortName];
									};
									parent = namespace;
								};
								
								var opts = (types.hasKey(options, name) ? options[name] : undefined);
								var init = mod.create && mod.create(this, opts);
								init && init(opts);
								
								loading[name] = mod;
								
								if (__recordNewBootstraps__) {
									__bootstraps__[name] = mod;
								};
							};
						};
						
						__recordNewBootstraps__ = false;
						
						this.Doodad.Namespaces.loadNamespaces(false, options, loading, true);
					}),
					
				enableAsserts: __Internal__.DD_DOC(
					//! REPLACE_BY("null")
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
							types.defineProperty(this, 'DD_ASSERT', {
								configurable: true, 
								enumerable: false, 
								value: __ASSERT__,
								writable: false,
							});
						} else {
							this.DD_ASSERT = __ASSERT__;
						};
					}),
				
				disableAsserts: __Internal__.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 1,
							params: null,
							returns: 'undefined',
							description: "Disables 'DD_ASSERT'.",
					}
					//! END_REPLACE()
					, function disableAsserts() {
						delete this.DD_ASSERT;
					}),

				getConfig: __Internal__.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'undefined',
							description: "Returns options passed to 'createRoot'.",
					}
					//! END_REPLACE()
					, function getConfig() {
						return this.Config;
					}),

				}
			)));
	};
})();