//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Tools.js - Useful tools
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
		DD_MODULES['Doodad.Tools'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE() */,
			dependencies: [
				'Doodad.Types',
			],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================
					
				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					files = tools.Files,
					config = tools.Config;
					
				//===================================
				// Internal
				//===================================
					
				// <FUTURE> Thread context
				var __Internal__ = {
					oldSetOptions: null,
				};
				
				
				//===================================
				// Options
				//===================================
					
				__Internal__.oldSetOptions = tools.setOptions;
				tools.setOptions = function setOptions(/*paramarray*/) {
					var options = __Internal__.oldSetOptions.apply(this, arguments);
						
					options.logLevel = parseInt(types.get(options, 'logLevel'));
				};
				
				tools.setOptions({
					logLevel: -1,
					hooks: {
						console: function(level, message) {
							if (global.console) {
								var fn;
								if ((level === tools.LogLevels.Info) && global.console.info) {
									//! BEGIN_REMOVE()
										if ((typeof process === 'object') && (typeof module === 'object')) {
											fn = 'warn'; // force stderr
										} else {
											fn = 'info';
										};
									//! END_REMOVE()
									
									//! IF_DEF("serverSide")
										//! INJECT("fn = 'warn'") // force stderr
									//! ELSE()
										//! INJECT("fn = 'info'")
									//! END_IF()
								} else if ((level === tools.LogLevels.Warning) && global.console.warn) {
									fn = 'warn';
								} else if ((level === tools.LogLevels.Error) && (global.console.error || global.console.exception)) {
									fn = 'error';
								} else {
									//! BEGIN_REMOVE()
										if ((typeof process === 'object') && (typeof module === 'object')) {
											fn = 'warn'; // force stderr
										} else {
											fn = 'log';
										};
									//! END_REMOVE()
									
									//! IF_DEF("serverSide")
										//! INJECT("fn = 'warn'") // force stderr
									//! ELSE()
										//! INJECT("fn = 'log'")
									//! END_IF()
								};
								global.console[fn](message);
							};
						},
					},
				}, _options);
				

				//===================================
				// Native functions
				//===================================
					
				// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.

				var __Natives__ = {
					windowXMLHttpRequest: global.XMLHttpRequest,

					// Prototype functions
					stringIndexOf: global.String.prototype.indexOf,
					stringLastIndexOf: global.String.prototype.lastIndexOf,
					stringReplace: global.String.prototype.replace,
					stringSearch: global.String.prototype.search,
				
					windowError: (global.Error || Error), // NOTE: "node.js" does not include "Error" in "global".
					
					windowRegExp: (global.RegExp || RegExp),
					
					windowObject: global.Object,

					// Polyfills

					mathSign: (types.isNativeFunction(global.Math.sign) ? global.Math.sign : undefined),

					//windowComponents: (types.isNativeFunction(global.Components) ? global.Components : undefined),
					
					// ES5
					stringRepeat: (types.isNativeFunction(global.String.prototype.repeat) ? global.String.prototype.repeat : undefined),
					arrayIndexOf: (types.isNativeFunction(global.Array.prototype.indexOf) ? global.Array.prototype.indexOf : undefined),
					arrayLastIndexOf: (types.isNativeFunction(global.Array.prototype.lastIndexOf) ? global.Array.prototype.lastIndexOf : undefined),
					arrayForEach: (types.isNativeFunction(global.Array.prototype.forEach) ? global.Array.prototype.forEach : undefined),
					arrayMap: (types.isNativeFunction(global.Array.prototype.map) ? global.Array.prototype.map : undefined),
					arrayFilter: (types.isNativeFunction(global.Array.prototype.filter) ? global.Array.prototype.filter : undefined),
					arrayEvery: (types.isNativeFunction(global.Array.prototype.every) ? global.Array.prototype.every : undefined),
					arraySome: (types.isNativeFunction(global.Array.prototype.some) ? global.Array.prototype.some : undefined),
					arrayReduce: (types.isNativeFunction(global.Array.prototype.reduce) ? global.Array.prototype.reduce : undefined),
					arrayReduceRight: (types.isNativeFunction(global.Array.prototype.reduceRight) ? global.Array.prototype.reduceRight : undefined),
					
					// ES7
					regExpEscape: (types.isNativeFunction(global.RegExp.escape) ? global.RegExp.escape : undefined),
				};
				
				//===================================
				// Search functions
				//===================================
					
				tools.findItem = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "Object to scan",
									},
									item: {
										type: 'any',
										optional: false,
										description: "Value to find. If item is a function, call this function to find item.",
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
								returns: 'integer,string',
								description: "Returns the array index or the attribute name of the specified item. Returns 'null' when item is not found.",
					}
					//! END_REPLACE()
					, function findItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions) {
						if (!types.isNothing(obj)) {
							obj = __Natives__.windowObject(obj);
							var key;
							if (!includeFunctions && types.isFunction(item)) {
								if (types.isArrayLike(obj)) {
									var len = obj.length;
									for (key = 0; key < len; key++) {
										if (key in obj) {
											if (item.call(thisObj, obj[key], key, obj)) {
												return key;
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length, // performance
										i;
									for (i = 0; i < len; i++) {
										key = keys[i];
										if (item.call(thisObj, obj[key], key, obj)) {
											return key;
										};
									};
								};
							} else {
								if (types.isArrayLike(obj)) {
									var len = obj.length;
									for (key = 0; key < len; key++) {
										if (key in obj) {
											if (obj[key] === item) {
												return key;
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length, // performance
										i;
									for (i = 0; i < len; i++) {
										key = keys[i];
										if (obj[key] === item) {
											return key;
										};
									};
								};
							};
						};
						return null;
					});
				
				tools.findLastItem = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "Object to scan",
									},
									item: {
										type: 'any',
										optional: false,
										description: "Value to find. If item is a function, call this function to find item.",
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
								returns: 'integer,string',
								description: "Returns the array index or the attribute name of the specified item, by searching from the end. Returns 'null' when item is not found.",
					}
					//! END_REPLACE()
					, function findLastItem(obj, item, /*optional*/thisObj, /*optional*/includeFunctions) {
						if (!types.isNothing(obj)) {
							obj = Object(obj);
							var key;
							if (!includeFunctions && types.isFunction(item)) {
								if (types.isArrayLike(obj)) {
									for (key = obj.length - 1; key >= 0; key--) {
										if (key in obj) {
											if (item.call(thisObj, obj[key], key, obj)) {
												return key;
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										i;
									for (i = keys.length - 1; i >= 0; i--) {
										key = keys[i];
										if (item.call(thisObj, obj[key], key, obj)) {
											return key;
										};
									};
								};
							} else {
								if (types.isArrayLike(obj)) {
									for (key = obj.length - 1; key >= 0; key--) {
										if (key in obj) {
											if (obj[key] === item) {
												return key;
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										i;
									for (i = keys.length - 1; i >= 0; i--) {
										key = keys[i];
										if (obj[key] === item) {
											return key;
										};
									};
								};
							};
						};
						return null;
					});
				
				tools.findItems = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									obj: {
										type: 'any',
										optional: false,
										description: "Object to scan",
									},
									items: {
										type: 'any,arrayof(any)',
										optional: false,
										description: "Values to find. If items is a function, call this function to find items.",
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
								returns: 'arrayof(integer,string)',
								description: "Returns the array indexes or the attribute names of the specified items.",
					}
					//! END_REPLACE()
					, function findItems(obj, items, /*optional*/thisObj, /*optional*/includeFunctions) {
						var result = [];
						if (!types.isNothing(obj)) {
							obj = Object(obj);
							var key;
							if (!includeFunctions && types.isFunction(items)) {
								if (types.isArrayLike(obj)) {
									var len = obj.length;
									for (key = 0; key < len; key++) {
										if (key in obj) {
											if (items.call(thisObj, obj[key], key, obj)) {
												result.push(key);
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length, // performance
										i;
									for (i = 0; i < len; i++) {
										key = keys[i];
										if (items.call(thisObj, obj[key], key, obj)) {
											result.push(key);
										};
									};
								};
							} else {
								if (!types.isArray(items)) {
									items = [items];
								};
								if (types.isArrayLike(obj)) {
									var len = obj.length;
									for (key = 0; key < len; key++) {
										if (key in obj) {
											if (tools.findItem(items, obj[key], undefined, true) !== null) {
												result.push(key);
											};
										};
									};
								} else {
									var keys = types.keys(obj),
										len = keys.length, // performance
										i;
									for (i = 0; i < len; i++) {
										key = keys[i];
										if (tools.findItem(items, obj[key], undefined, true) !== null) {
											result.push(key);
										};
									};
								};
							};
						};
						return result;
					});
				
				
				//===================================
				// String functions
				//===================================

				tools.repeat = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									str: {
										type: 'string',
										optional: false,
										description: "String to repeat",
									},
									n: {
										type: 'integer',
										optional: false,
										description: "Number of string occurrences.",
									},
								},
								returns: 'string',
								description: "Returns the string repeated 'n' occurrences.",
					}
					//! END_REPLACE()
					, function repeat(str, n) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isString(str), "Invalid string.");
							root.DD_ASSERT(types.isInteger(n), "Invalid number.");
						};
						if (__Natives__.stringRepeat) {
							return __Natives__.stringRepeat.call(str, n);
						} else {
							// Source: Stackoverflow
							// TODO: Optimize me (join is slow)
							if (n <= 0) {
								return "";
							} else if (n === 1) {
								return str;
							} else {
								return Array(n + 1).join(str);
							};
						};
					});

				tools.replace = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									text: {
										type: 'string,arrayof(string)',
										optional: false,
										description: "String or array to search into",
									},
									from: {
										type: 'string,RegExp',
										optional: false,
										description: "Value to search for.",
									},
									to: {
										type: 'string',
										optional: false,
										description: "String to replace with.",
									},
									options: {
										type: 'string',
										optional: true,
										description: "Search options. Options are 'RegExp' ones.",
									},
								},
								returns: 'string',
								description: "Replaces 'from' with 'to' and returns the result.",
					}
					//! END_REPLACE()
					, function replace(text, from, to, /*optional*/options) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isArrayLike(text), "Invalid text.");
							root.DD_ASSERT(types.isString(from) || (from instanceof RegExp), "Invalid 'from'.");
							root.DD_ASSERT(types.isString(to) || types.isFunction(to), "Invalid 'to'.");
							root.DD_ASSERT(types.isNothing(options) || types.isString(options), "Invalid options.");
						};
						if (options) {
							var regexp = tools.escapeRegExp(from);
							from = new __Natives__.windowRegExp(regexp, options);
						};
						if (types.isString(text)) {
							return __Natives__.stringReplace.call(text, from, to);
						} else {
							for (var i = 0; i < text.length; i++) {
								text[i] = __Natives__.stringReplace.call(text[i], from, to);
							};
							return text;
						};
					});
				
				tools.search = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									str: {
										type: 'string',
										optional: false,
										description: "String to search into",
									},
									text: {
										type: 'string,RegExp',
										optional: false,
										description: "Value to search for.",
									},
									start: {
										type: 'integer',
										optional: true,
										description: "Position from which to start searching.",
									},
									end: {
										type: 'integer',
										optional: true,
										description: "Position from which to stop searching.",
									},
									stopStr: {
										type: 'string,RegExp',
										optional: true,
										description: "Value from which to stop searching.",
									},
									getText: {
										type: 'bool',
										optional: true,
										description: "'true' will returns the text found. 'false' will returns its position. Default is 'false'.",
									},
								},
								returns: 'undefined,null,NaN,integer,string',
								description: "Returns the position of 'text' in 'str'. If 'text' is not found, return '-1' (when 'getText' is 'false') or 'undefined' (when 'getText' is 'true'). If 'stopStr' is met before 'text', returns 'NaN' (when 'getText' is 'false') or 'null' (when 'getText' is 'true').",
					}
					//! END_REPLACE()
					, function search(str, text, /*optional*/start, /*optional*/end, /*optional*/stopStr, /*optional*/getText) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isString(str), "Invalid string.");
							root.DD_ASSERT(types.isString(text) || (text instanceof RegExp), "Invalid text.");
							root.DD_ASSERT(types.isNothing(start) || types.isInteger(start), "Invalid 'start'.");
							root.DD_ASSERT(types.isNothing(end) || types.isInteger(end), "Invalid 'end'.");
							root.DD_ASSERT(types.isNothing(stopStr) || types.isString(stopStr) || (stopStr instanceof RegExp), "Invalid stop string.");
						};

						if (types.isNothing(start)) {
							start = 0;
						};
						if (types.isNothing(end)) {
							end = str.length;
						};
						
						var posText;
						if (types.isString(text)) {
							posText = str.indexOf(text, start);
						} else {
							text.lastIndex = start;
							//var posText = __Natives__.stringSearch.call(str, text);
							posText = text.exec(str);
							if (!text.global && (start > 0)) {
								throw new types.TypeError("Regular expression must have the global flag set.");
							};
							if (posText) {
								posText = posText.index;
							} else {
								posText = -1;
							};
						};

						var posStopStr = -1;
						if (stopStr) {
							if (types.isString(stopStr)) {
								posStopStr = str.indexOf(stopStr, start);
							} else {
								stopStr.lastIndex = start;
								//posStopStr = __Natives__.stringSearch.call(str, stopStr);
								var posStopStr = stopStr.exec(str);
								if (!stopStr.global && (start > 0)) {
									throw new types.TypeError("Regular expression must have the global flag set.");
								};
								if (posStopStr) {
									posStopStr = posStopStr.index;
								} else {
									posStopStr = -1;
								};
							};
						};
						
						if (((posText < 0) && (posStopStr < 0)) || (posText > end)) {
							// No match
							if (getText) {
								return undefined;
							} else {
								return -1;
							};
						} else if ((posStopStr >= 0) && (posStopStr < posText)) {
							// Stop
							if (getText) {
								return null;
							} else {
								return NaN;
							};
						} else {
							// Match
							if (getText) {
								if (posStopStr >= 0) {
									return str.slice(posText, Math.min(posStopStr, end));
								} else {
									return str.slice(posText);
								};
							} else {
								return posText;
							};
						};
					});

				tools.join = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									ar: {
										type: 'array',
										optional: false,
										description: "Array to join",
									},
									str: {
										type: 'string',
										optional: true,
										description: "String separator. Default is none.",
									},
								},
								returns: 'string',
								description: "Returns a string with joined values.",
					}
					//! END_REPLACE()
					, function join(ar, /*optional*/str) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isArray(ar), "Invalid array.");
							root.DD_ASSERT(types.isNothing(str) || types.isString(str), "Invalid string.");
						};
						var result = '',
							arLen = ar.length,
							count = 0;
						for (var i = 0; i < arLen; i++) {
							if (i in ar) {
								if (str && (count > 0)) {
									result += str;
								};
								result += (ar[i] + '');
								count++;
							};
						};
						return result;
					});
					
				tools.title = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									str: {
										type: 'string',
										optional: false,
										description: "String value",
									},
									separator: {
										type: 'string',
										optional: true,
										description: "Word separator. Default is a space.",
									},
								},
								returns: 'string',
								description: "Returns a string with separated lowered-case words each beginning with an upper-case.",
					}
					//! END_REPLACE()
					, function title(str, /*optional*/separator) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isString(str), "Invalid string.");
							root.DD_ASSERT(types.isNothing(separator) || types.isString(separator), "Invalid separator.");
						};
						var retval = '';
						if (!separator) {
							separator = ' ';
						};
						str = str.split(separator);
						var len = str.length;
						for (var i = 0; i < len; i++) {
							var word = str[i];
							if (i > 0) {
								retval += separator;
							};
							if (word) {
								retval += word[0].toUpperCase() + word.slice(1).toLowerCase();
							};
						};
						return retval;
					});
				
				//===================================
				// Log functions
				//===================================
					
				tools.LogLevels = {
					Debug: 0,
					Info: 1,
					Warning: 2,
					Error: 3,
				};
				
				var __logLevelsName__ = [
					'debug',
					'info',
					'warning',
					'error',
				];
					
				tools.log = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									leval: {
										type: 'integer',
										optional: false,
										description: "Log level",
									},
									message: {
										type: 'any',
										optional: false,
										description: "Error message or value",
									},
									params: {
										type: 'arrayof(any),objectof(any)',
										optional: true,
										description: "Parameters of the error message",
									},
								},
								returns: 'string',
								description: "Writes message in the console only when the log level is greater or equal to the active one.",
					}
					//! END_REPLACE()
					, function log(level, message, /*optional*/params) {
						// WARNING: Don't use "root.DD_ASSERT" inside this function !!!
						if (level >= tools.getOptions().logLevel) {
							if (params) {
								message = tools.format(message + '', params);
							};
							if (types.isString(message) && types.hasIndex(__logLevelsName__, level)) {
								message = __logLevelsName__[level] + ': ' + message;
							};
							var hook = tools.getOptions().hooks.console;
							if (hook) {
								hook(level, message);
							};
						};
					});

				
				//===================================
				// Escape functions
				//===================================
					
				tools.escape = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									text: {
										type: 'string',
										optional: false,
										description: "Text to escape",
									},
									reserved: {
										type: 'string',
										optional: false,
										description: "Reserved characters to substitute",
									},
									substitutions: {
										type: 'arrayof(string)',
										optional: false,
										description: "Substitutions of the reserved characters in their string position order",
									},
								},
								returns: 'string',
								description: "Escapes a string by replacing reserved characters with their substitution.",
					}
					//! END_REPLACE()
					, function escape(text, reserved, substitutions) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isNothing(text) || types.isString(text), "Invalid text.");
							root.DD_ASSERT(types.isNothing(reserved) || types.isString(reserved), "Invalid reserved characters string.");
							root.DD_ASSERT(types.isNothing(substitutions) || types.isArray(substitutions), "Invalid reserved characters string.");
							if (reserved) {
								root.DD_ASSERT(substitutions && (reserved.length === substitutions.length), "Reserved characters substitutions length mismatch.");
							};
						};
						if (!text || !reserved) {
							return text;
						};
						var result = '',
							textLen = text.length,
							lastPos = 0,
							reservedLen = reserved.length;
						for (var i = 0; i < textLen; i++) {
							var chr = text[i];
							for (var j = 0; j < reservedLen; j++) {
								if (chr === reserved[j]) {
									result += text.slice(lastPos, i) + substitutions[j];
									lastPos = (i + 1);
									break;
								};
							};
						};
						if (lastPos === 0) {
							result = text;
						} else {
							result += text.slice(lastPos);
						};
						return result;
					});
				
				// See "http://stackoverflow.com/questions/2083754/why-shouldnt-apos-be-used-to-escape-single-quotes"
				__Internal__.htmlReserved = "<>\"'&",
				__Internal__.htmlReservedSubstitutions = ['&lt;', '&gt;', '&quot;', '&#39;', '&amp;'];

				tools.escapeHtml = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									text: {
										type: 'string',
										optional: false,
										description: "String to escape",
									},
								},
								returns: 'string',
								description: "Escapes a string to HTML.",
					}
					//! END_REPLACE()
					, function escapeHtml(text) {
						return tools.escape(text, __Internal__.htmlReserved, __Internal__.htmlReservedSubstitutions);
					});
				
				__Internal__.regExpReserved = "\\^$*+?()|{}[].",
				__Internal__.regExpReservedSubstitutions = ['\\\\', '\\^', '\\$', '\\*', '\\+', '\\?', '\\(', '\\)', '\\|', '\\{', '\\}', '\\[', '\\]', '\\.'];
					
				tools.escapeRegExp = root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									text: {
										type: 'string',
										optional: false,
										description: "String to escape",
									},
								},
								returns: 'string',
								description: "Escapes a string to a regular expression.",
					}
					//! END_REPLACE()
					, (__Natives__.regExpEscape || function escapeRegExp(text) {
						return tools.escape(text, __Internal__.regExpReserved, __Internal__.regExpReservedSubstitutions);
					}));
				
				//===================================
				// Compare functions
				//===================================
					
				tools.compareNumbers = root.DD_DOC(
						//! REPLACE_BY("null")
						{
								author: "Claude Petit",
								revision: 0,
								params: {
									value1: {
										type: 'any',
										optional: false,
										description: "Value to compare from.",
									},
									value2: {
										type: 'any',
										optional: false,
										description: "Value to compare to.",
									},
								},
								returns: 'integer',
								description:
									"Usable ascendant comparer function. Returns '0' when values are equals. Returns '1' when 'value1' is greater than 'value2'. Returns '-1' when 'value1' is lower than 'value2'.\n" +
									"NOTE: This changes the default behavior of \"sort\" so \"null/NaN/String/Object/Array\" are all evaluated to 0 and \"-1 is > -Infinity\"",
						}
						//! END_REPLACE()
					, function compareNumbers(value1, value2) {
						// null/NaN/undefined/String/Object/Array  are   0
						value1 = ((+value1 === value1) ? value1 : (value1 | 0));
						value2 = ((+value2 === value2) ? value2 : (value2 | 0));
						if (value1 > value2) {
							return 1;
						} else if (value1 < value2) {
							return -1;
						} else {
							return 0;
						};
					});
				
				tools.compareNumbersInverted = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								value1: {
									type: 'any',
									optional: false,
									description: "Value to compare from.",
								},
								value2: {
									type: 'any',
									optional: false,
									description: "Value to compare to.",
								},
							},
							returns: 'integer',
							description:
								"Usable descendant comparer function. Returns '0' when values are equals. Returns '-1' when 'value1' is greater than 'value2'. Returns '1' when 'value1' is lower than 'value2'.\n" +
								"NOTE: This changes the default behavior of \"sort\" so \"null/NaN/String/Object/Array\" are all evaluated to 0 and \"-1 is > -Infinity\"",
					}
					//! END_REPLACE()
					, function compareInverted(value1, value2) {
						// Usable comparer function
						// null/NaN/undefined/String/Object/Array  are   0
						value1 = ((+value1 === value1) ? value1 : (value1 | 0));
						value2 = ((+value2 === value2) ? value2 : (value2 | 0));
						if (value1 < value2) {
							return 1;
						} else if (value1 > value2) {
							return -1;
						} else {
							return 0;
						};
					});

				

				//===================================
				// Object functions
				//===================================
					
				types.allKeys = root.DD_DOC(
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
								description: "Returns an array of all enumerable and not enumerable property names of an object.",
					}
					//! END_REPLACE()
					, function allKeys(obj) {
						return obj && types.unique(types.getOwnPropertyNames(obj), types.allKeys(types.getPrototypeOf(obj)));
					});
				
				tools.indexOf = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'arraylike',
									optional: false,
									description: "Array value.",
								},
								item: {
									type: 'any',
									optional: false,
									description: "Value to search for.",
								},
								from: {
									type: 'integer',
									optional: true,
									description: "Index to start searching from. Default is '0'.",
								},
							},
							returns: 'integer',
							description: "Returns the index of the first occurrence of the item. Returns '-1' when item is not found.",
					}
					//! END_REPLACE()
					, function indexOf(obj, item, /*optional*/from) {
						if (types.isArrayLike(obj)) {
							from = (+from || 0);
							if (types.isString(obj)) {
								return __Natives__.stringIndexOf.call(obj, item, from);
							} else {
								if (__Natives__.arrayIndexOf) {
									// JS 1.6
									return __Natives__.arrayIndexOf.call(obj, item, from);
								} else {
									obj = Object(obj);
									var len = obj.length;
									from = Math.max(from >= 0 ? from : len - Math.abs(from), 0);
									for (var key = from; key < len; key++) {
										if (key in obj) {
											if (obj[key] === item) {
												return key;
											};
										};
									};
								};
							};
						};
						return -1;
					});
				
				tools.lastIndexOf = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'arraylike',
									optional: false,
									description: "Array value.",
								},
								item: {
									type: 'any',
									optional: false,
									description: "Value to search for.",
								},
								from: {
									type: 'integer',
									optional: true,
									description: "Index to start searching from. Default is 'end of array'.",
								},
							},
							returns: 'integer',
							description: "Returns the index of the last occurrence of the item. Returns '-1' when item is not found.",
					}
					//! END_REPLACE()
					, function lastIndexOf(obj, item, /*optional*/from) {
						if (types.isArrayLike(obj)) {
							var len = obj.length;
							from = (+from || (len - 1));
							if (types.isString(obj)) {
								return __Natives__.stringLastIndexOf.call(obj, item, from);
							} else {
								if (__Natives__.arrayLastIndexOf) {
									// JS 1.6
									return __Natives__.arrayLastIndexOf.call(obj, item, from);
								} else {
									obj = Object(obj);
									from = Math.min(from >= 0 ? from : len - Math.abs(from), len - 1);
									for (var key = len - 1; key >= from; key--) {
										if (key in obj) {
											if (obj[key] === item) {
												return key;
											};
										};
									};
								};
							};
						};
						return -1;
					});
				
				tools.map = root.DD_DOC(
					//! REPLACE_BY("null")
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
						root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function");

						if (!types.isNothing(obj)) {
							obj = Object(obj);
							if (obj instanceof types.Set) {
								var len = obj.length,
									result = new types.Set();
								obj.forEach(function(value, key, obj) {
									result.add(fn.call(thisObj, value, key, obj));
								});
								return result;
							} else if (obj instanceof types.Map) {
								var len = obj.length,
									result = new types.Map();
								obj.forEach(function(value, key, obj) {
									result.set(key, fn.call(thisObj, value, key, obj));
								});
								return result;
							} else if (types.isArrayLike(obj)) {
								if (__Natives__.arrayMap) {
									return __Natives__.arrayMap.call(obj, fn, thisObj);
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
					});
				
				tools.forEach = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								obj: {
									type: 'arraylike,object,Map,Set',
									optional: false,
									description: "An object to browse.",
								},
								fn: {
									type: 'function',
									optional: false,
									description: 
										"A function to call. Arguments passed to the function are : \n" +
										"  value (any): The current value\n" +
										"  key (integer,string): The current index or attribute name\n" +
										"  obj (arraylike,object): A reference to the object"
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "Value of 'this' when calling the function. Default is 'undefined'.",
								},
							},
							returns: 'undefined',
							description: "For each item of the array (or the object), simply calls the specified function.",
					}
					//! END_REPLACE()
					, function forEach(obj, fn, /*optional*/thisObj) {
						root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function");
						
						if (!types.isNothing(obj)) {
							if ((obj instanceof types.Map) || (obj instanceof types.Set)) {
								// "Map" and "Set" have their own "forEach" method.
								return obj.forEach.call(obj, fn, thisObj);
							} else if (types.isArrayLike(obj)) {
								if (__Natives__.arrayForEach) {
									// JS 1.6
									return __Natives__.arrayForEach.call(obj, fn, thisObj);
								} else {
									obj = Object(obj);
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											fn.call(thisObj, obj[key], key, obj);
										};
									};
								};
							} else {
								// "Object.assign" Polyfill from Mozilla Developer Network.
								obj = Object(obj);
								var keys = types.keys(obj),
									len = keys.length, // performance
									i, 
									key;
								for (i = 0; i < len; i++) {
									key = keys[i];
									fn.call(thisObj, obj[key], key, obj);
								};
							};
						};
					});
				
				tools.filter = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								obj: {
									type: 'arraylike,object,Map,Set',
									optional: false,
									description: "An object to filter.",
								},
								items: {
									type: 'any,arrayof(any),function',
									optional: false,
									description: 
										"Values to filter with, or a function used to filter. Arguments passed to the function are : \n" +
										"  value (any): The current value\n" +
										"  key (integer,string): The current index or attribute name\n" +
										"  obj (arraylike,object): A reference to the object"
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "Value of 'this' when calling the function. Default is 'undefined'.",
								},
								invert: {
									type: 'bool',
									optional: true,
									description: "'true' will inverts filtering. Default is 'false'.",
								},
								includeFunctions: {
									type: 'bool',
									optional: true,
									description: "When 'true' and 'items' is a function, the function will be considered like a value.",
								},
							},
							returns: 'array,object',
							description: "Filters array (or object) with the specified items, and returns a new array (or object) with matching items.",
					}
					//! END_REPLACE()
					, function filter(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions) {
						var result;
						if (!types.isNothing(obj)) {
							obj = Object(obj);
							invert = !!invert;
							var keys,
								len,
								i, 
								key,
								val;
							if (!includeFunctions && types.isFunction(items)) {
								if (obj instanceof types.Map) {
									result = new types.Map();
									obj.forEach(function(val, key) {
										if (invert === !items.call(thisObj, val, key, obj)) {
											result.set(key, val);
										};
									});
								} else if (obj instanceof types.Set) {
									result = new types.Set();
									obj.forEach(function(val, key) {
										if (invert === !items.call(thisObj, val, key, obj)) {
											result.add(val);
										};
									});
								} else if (types.isArrayLike(obj)) {
									if (__Natives__.arrayFilter && !invert) {
										// JS 1.6
										result = __Natives__.arrayFilter.call(obj, items, thisObj);
									} else {
										result = [];
										len = obj.length;
										for (var key = 0; key < len; key++) {
											if (key in obj) {
												var val = obj[key];
												if (invert === !items.call(thisObj, val, key, obj)) {
													result.push(val);
												};
											};
										};
									};
								} else {
									// "Object.assign" Polyfill from Mozilla Developer Network.
									result = {};
									keys = types.keys(obj);
									len = keys.length;
									for (i = 0; i < len; i++) {
										key = keys[i];
										val = obj[key];
										if (invert === !items.call(thisObj, val, key, obj)) {
											result[key] = val;
										};
									};
								};
							} else {
								if (obj instanceof types.Map) {
									result = new types.Map();
									obj.forEach(function(val, key) {
										if (invert === (tools.findItem(items, val, undefined, true) === null)) {
											result.set(key, val);
										};
									});
								} else if (obj instanceof types.Set) {
									result = new types.Set();
									obj.forEach(function(val, key) {
										if (invert === (tools.findItem(items, val, undefined, true) === null)) {
											result.add(val);
										};
									});
								} else if (types.isArrayLike(obj)) {
									result = [];
									len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											val = obj[key];
											if (invert === (tools.findItem(items, val, undefined, true) === null)) {
												result.push(val);
											};
										};
									};
								} else {
									// "Object.assign" Polyfill from Mozilla Developer Network.
									result = {};
									keys = types.keys(obj);
									len = keys.length;
									for (i = 0; i < len; i++) {
										key = keys[i];
										val = obj[key];
										if (invert === (tools.findItem(items, val, undefined, true) === null)) {
											result[key] = val;
										};
									};
								};
							};
						};
						return result;
					});
				
				tools.filterKeys = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'arraylike,object',
									optional: false,
									description: "An object to filter.",
								},
								items: {
									type: 'any,arrayof(any),function',
									optional: false,
									description: 
										"Keys to filter with, or a function used to filter. Arguments passed to the function are : \n" +
										"  value (any): The current value\n" +
										"  key (integer,string): The current index or attribute name\n" +
										"  obj (arraylike,object): A reference to the object"
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "Value of 'this' when calling the function. Default is 'undefined'.",
								},
								invert: {
									type: 'bool',
									optional: true,
									description: "'true' will invert filtering. Default is 'false'.",
								},
								includeFunctions: {
									type: 'bool',
									optional: true,
									description: "When 'true' and 'items' is a function, the function will be considered like a value.",
								},
							},
							returns: 'array,object',
							description: "Filters array (or object) with the specified keys, and returns a new array (or object) with matching items.",
					}
					//! END_REPLACE()
					, function filterKeys(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions) {
						var result;
						if (!types.isNothing(obj)) {
							obj = Object(obj);
							invert = !!invert;
							var keys,
								len,
								i, 
								key,
								val;
							if (!includeFunctions && types.isFunction(items)) {
								if (types.isArrayLike(obj)) {
									result = [];
									len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var val = obj[key];
											if (invert === !items.call(thisObj, val, key, obj)) {
												result.push(val);
											};
										};
									};
								} else {
									// "Object.assign" Polyfill from Mozilla Developer Network.
									result = {};
									keys = types.keys(obj);
									len = keys.length;
									for (i = 0; i < len; i++) {
										key = keys[i];
										val = obj[key];
										if (invert === !items.call(thisObj, val, key, obj)) {
											result[key] = val;
										};
									};
								};
							} else {
								if (types.isArrayLike(obj)) {
									result = [];
									len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											val = obj[key];
											if (invert === (tools.findItem(items, key, undefined, true) === null)) {
												result.push(val);
											};
										};
									};
								} else {
									// "Object.assign" Polyfill from Mozilla Developer Network.
									result = {};
									keys = types.keys(obj);
									len = keys.length;
									for (i = 0; i < len; i++) {
										key = keys[i];
										val = obj[key];
										if (invert === (tools.findItem(items, key, undefined, true) === null)) {
											result[key] = val;
										};
									};
								};
							};
						};
						return result;
					});
				
				tools.every = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								obj: {
									type: 'arraylike,object,Map,Set',
									optional: false,
									description: "An object to analyze.",
								},
								items: {
									type: 'any,arrayof(any),function',
									optional: false,
									description: 
										"A list of values to filter with, or a filter function. Arguments passed to the function are : \n" +
										"  value (any): The current value\n" +
										"  key (integer,string): The current index or attribute name\n" +
										"  obj (arraylike,object): A reference to the object"
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "Value of 'this' when calling the function. Default is 'undefined'.",
								},
								invert: {
									type: 'bool',
									optional: true,
									description: "'true' will invert the filter. Default is 'false'.",
								},
								includeFunctions: {
									type: 'bool',
									optional: true,
									description: "When 'true' and 'items' is a function, the function will be considered like a value.",
								},
							},
							returns: 'bool',
							description: "Returns 'true' when every items of an array (or an object) match the filter. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function every(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions) {
						if (types.isNothing(obj)) {
							return false;
						};
						obj = Object(obj);
						invert = !!invert;
						if (!includeFunctions && types.isFunction(items)) {
							if (types.isArrayLike(obj)) {
								if (__Natives__.arrayEvery && !invert) {
									// JS 1.6
									return __Natives__.arrayEvery.call(obj, items, thisObj);
								} else {
									obj = Object(obj);
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var value = obj[key];
											if (invert === !!items.call(thisObj, value, key, obj)) {
												return false;
											};
										};
									};
								};
							} else if ((obj instanceof types.Set) || (obj instanceof types.Map)) {
								var ar = obj.entries(),
									len = ar.length; // performance
								for (i = 0; i < len; i++) {
									var val = ar[i];
									if (invert === !!items.call(thisObj, val[1], val[0], obj)) {
										return false;
									};
								};
							} else {
								// "Object.assign" Polyfill from Mozilla Developer Network.
								var keys = types.keys(obj),
									len = keys.length, // performance
									i; 
									key; 
								for (i = 0; i < len; i++) {
									key = keys[i];
									if (invert === !!items.call(thisObj, obj[key], key, obj)) {
										return false;
									};
								};
							};
						} else {
							if (types.isArrayLike(obj)) {
								var len = obj.length;
								for (var key = 0; key < len; key++) {
									if (key in obj) {
										var val = obj[key];
										if (invert === (tools.findItem(items, val, undefined, true) !== null)) {
											return false;
										};
									};
								};
							} else if ((obj instanceof types.Set) || (obj instanceof types.Map)) {
								obj = obj.entries();
								var len = obj.length; // performance
								for (i = 0; i < len; i++) {
									var val = obj[i];
									if (invert === (tools.findItem(items, val[1], undefined, true) !== null)) {
										return false;
									};
								};
							} else {
								// "Object.assign" Polyfill from Mozilla Developer Network.
								var keys = types.keys(obj),
									len = keys.length, // performance
									i, 
									key; 
								for (i = 0; i < len; i++) {
									key = keys[i];
									if (invert === (tools.findItem(items, obj[key], undefined, true) !== null)) {
										return false;
									};
								};
							};
						};
						return true;
					});
				
				tools.some = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								obj: {
									type: 'arraylike,object,Map,Set',
									optional: false,
									description: "An object to analyze.",
								},
								items: {
									type: 'any,arrayof(any),function',
									optional: false,
									description: 
										"A list of values to filter with, or a filter function. Arguments passed to the function are : \n" +
										"  value (any): The current value\n" +
										"  key (integer,string): The current index or attribute name\n" +
										"  obj (arraylike,object): A reference to the object"
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "Value of 'this' when calling the function. Default is 'undefined'.",
								},
								invert: {
									type: 'bool',
									optional: true,
									description: "'true' will invert the filter. Default is 'false'.",
								},
								includeFunctions: {
									type: 'bool',
									optional: true,
									description: "When 'true' and 'items' is a function, the function will be considered like a value.",
								},
							},
							returns: 'bool',
							description: "Returns 'true' when at least one item of an array (or an object) matches the filter. Returns 'false' otherwise.",
					}
					//! END_REPLACE()
					, function some(obj, items, /*optional*/thisObj, /*optional*/invert, /*optional*/includeFunctions) {
						if (!types.isNothing(obj)) {
							obj = Object(obj);
							invert = !!invert;
							if (!includeFunctions && types.isFunction(items)) {
								if (types.isArrayLike(obj)) {
									if (__Natives__.arraySome && !invert) {
										// JS 1.6
										return __Natives__.arraySome.call(obj, items, thisObj);
									} else {
										obj = Object(obj);
										var len = obj.length;
										for (var key = 0; key < len; key++) {
											if (key in obj) {
												var val = obj[key];
												if (invert === !items.call(thisObj, val, key, obj)) {
													return true;
												};
											};
										};
									};
								} else if ((obj instanceof types.Set) || (obj instanceof types.Map)) {
									var ar = obj.entries(),
										len = ar.length; // performance
									for (i = 0; i < len; i++) {
										var val = ar[i];
										if (invert === !items.call(thisObj, val[1], val[0], obj)) {
											return true;
										};
									};
								} else {
									// "Object.assign" Polyfill from Mozilla Developer Network.
									var keys = types.keys(obj),
										len = keys.length, // performance
										i, 
										key, 
										val;
									for (i = 0; i < len; i++) {
										key = keys[i];
										val = obj[key];
										if (invert === !items.call(thisObj, val, key, obj)) {
											return true;
										};
									};
								};
							} else {
								if (types.isArrayLike(obj)) {
									var len = obj.length;
									for (var key = 0; key < len; key++) {
										if (key in obj) {
											var val = obj[key];
											if (invert === (tools.findItem(items, val, undefined, true) === null)) {
												return true;
											};
										};
									};
								} else if ((obj instanceof types.Set) || (obj instanceof types.Map)) {
									obj = obj.entries();
									var len = obj.length; // performance
									for (i = 0; i < len; i++) {
										var val = obj[i];
										if (invert === (tools.findItem(items, val[1], undefined, true) === null)) {
											return true;
										};
									};
								} else {
									// "Object.assign" Polyfill from Mozilla Developer Network.
									var keys = types.keys(obj),
										len = keys.length, // performance
										i, 
										key, 
										val;
									for (i = 0; i < len; i++) {
										key = keys[i];
										val = obj[key];
										if (invert == (tools.findItem(items, val, undefined, true) === null)) {
											return true;
										};
									};
								};
							};
						};
						return false;
					});
				
				tools.reduce = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 1,
							params: {
								obj: {
									type: 'arraylike,object,Map,Set',
									optional: false,
									description: "An object to reduce.",
								},
								fn: {
									type: 'function',
									optional: false,
									description: 
										"A function used to reduce. Arguments passed to the function are : \n" +
										"  result (any): The result of the previous call, or the initial value, or the first item\n" +
										"  value (any): The current value\n" +
										"  key (integer,string): The current index or attribute name\n" +
										"  obj (arraylike,object): A reference to the object"
								},
								initialValue: {
									type: 'any',
									optional: true,
									description: "Initial value. Default is the first item of the array (or object).",
								},
							},
							returns: 'any',
							description: "Reduces every items of an array (or object) to a single value.",
					}
					//! END_REPLACE()
					, function reduce(obj, fn, /*optional*/initialValue) {
						root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");

						if (types.isNothing(obj)) {
							return initialValue;
						} else if (types.isArrayLike(obj) && __Natives__.arrayReduce) {
							// JS 1.8
							if (arguments.length > 2) {
								return __Natives__.arrayReduce.call(obj, fn, initialValue);
							} else {
								return __Natives__.arrayReduce.call(obj, fn);
							};
						} else {
							obj = Object(obj);
							var result,
								hasInitial = false;
							if (arguments.length > 2) {
								result = initialValue;
								hasInitial = true;
							};
							tools.forEach(obj, function(val, key) {
								if (!hasInitial) {
									result = val;
									hasInitial = true;
								};
								result = fn(result, val, key, obj);
							});
							if (!hasInitial) {
								throw new types.TypeError("Reduce of empty object with no initial value.");
							};
							return result;
						};
					});
				
				tools.reduceRight = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'arraylike,object',
									optional: false,
									description: "An object to reduce.",
								},
								fn: {
									type: 'function',
									optional: false,
									description: 
										"A function used to reduce. Arguments passed to the function are : \n" +
										"  result (any): The result of the previous call, or the initial value, or the first item\n" +
										"  value (any): The current value\n" +
										"  key (integer,string): The current index or attribute name\n" +
										"  obj (arraylike,object): A reference to the object"
								},
								initialValue: {
									type: 'any',
									optional: true,
									description: "Initial value. Default is the last item of the array (or object).",
								},
							},
							returns: 'any',
							description: "Reduces every items of an array (or object) to a single value, starting from the last item.",
					}
					//! END_REPLACE()
					, function reduceRight(obj, fn, /*optional*/initialValue) {
						root.DD_ASSERT && root.DD_ASSERT(types.isFunction(fn), "Invalid function.");

						if (types.isNothing(obj)) {
							return initialValue;
						} else {
							root.DD_ASSERT && root.DD_ASSERT(types.isArrayLike(obj), "Invalid array.");

							if (__Natives__.arrayReduceRight) {
								// JS 1.8
								if (arguments.length > 2) {
									return __Natives__.arrayReduceRight.call(obj, fn, initialValue);
								} else {
									return __Natives__.arrayReduceRight.call(obj, fn);
								};
							} else {
								obj = Object(obj);
								var value = initialValue,
									hasItem = false,
									key = obj.length - 1;
								for (; key >= 0; key--) {
									if (key in obj) {
										hasItem = true;
										if (arguments.length < 3) {
											value = 0;
										};
										value = fn(value, obj[key], key, obj);
										key--;
										break;
									};
								};
								if (!hasItem && (arguments.length < 3)) {
									throw new types.TypeError("Reduce of empty array with no initial value.");
								};
								for (; key >= 0; key--) {
									if (key in obj) {
										value = fn(value, obj[key], key, obj);
									};
								};
								return value;
							};
						};
					});
				
				//===================================
				// Math functions
				//===================================

				tools.sign = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								obj: {
									type: 'any',
									optional: false,
									description: "A value",
								},
							},
							returns: 'integer',
							description: "Returns '-1' for negative values. Returns '1' for positive values. Returns '0' for neutral values. Otherwise, returns 'NaN'.",
					}
					//! END_REPLACE()
					, (__Natives__.mathSign || (function sign(obj) {
						obj = +obj;
						return (obj < 0 ? -1 : (obj > 0 ? 1 : obj)); 
					})));
				
				
				//===================================
				// Abort functions
				//===================================
				
				types.ScriptAbortedError = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'error',
							description: "Signals that script has been aborted. Every \"try...catch\" statements must unconditionally re-throw this error.",
					}
					//! END_REPLACE()
					, types.createErrorType("ScriptAbortedError", types.Error, function _new() {
						return types.Error.call(this, "Script aborted.");
					}));
				
				tools.abortScript = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'error',
							description: "Emits \"script aborted\" signal.",
					}
					//! END_REPLACE()
					, function abortScript() {
						throw new types.ScriptAbortedError();
					});
				
				//===================================
				// Version functions
				//===================================

				tools.Version = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								data: {
									type: 'array',
									optional: false,
									description: "Version data",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options",
								},
							},
							returns: 'error',
							description: "Represents a software version.",
					}
					//! END_REPLACE()
					, types.INIT(types.Type.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'Version',
							
							__parse: function __parse(val, identifiers, trimSpaces) {
								var ar = [];
								var valLen = val.length;
								var regexps = [/([^0-9]|[ ])/g, /([0-9]|[ ])/g],
									alt = false;
								var result = [];
								var start = 0,
									end;
								do {
									end = tools.search(val, regexps[alt + 0], start);
									if ((end === start) && (val[end] !== ' ')) {
										alt = !alt;
										end = tools.search(val, regexps[alt + 0], start);
									};
									if (end >= 0) {
										while (val[end] === ' ') {
											end++;
											if (end >= valLen) {
												end = -1;
												break;
											};
										};
									};
									var subval = val.slice(start, (end >= 0 ? end: undefined));
									var subvalTrim = tools.trim(subval);
									var subvalNumber;
									if (identifiers && types.hasKey(identifiers, subvalTrim)) {
										subvalNumber = parseInt(identifiers[subvalTrim]);
									} else {
										subvalNumber = parseInt(subvalTrim);
									};
									ar.push(subvalNumber, (trimSpaces ? subvalTrim : subval));
									start = end;
									alt = !alt;
								} while (end >= 0);
								return ar;
							},
							
							parse: root.DD_DOC(
								//! REPLACE_BY("null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											str: {
												type: 'string',
												optional: false,
												description: "A string",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Options",
											},
										},
										returns: 'Version',
										description: "Parses a string to a 'Version' object with the specified options.",
								}
								//! END_REPLACE()
								, function parse(str, /*optional*/options) {
									if (str instanceof tools.Version) {
										return str;
									};
									
									root.DD_ASSERT && root.DD_ASSERT(types.isNothing(options) || types.isObject(options), "Invalid options.");
									
									if (!options) {
										options = {};
									};
									
									//var dontThrow = types.getDefault(options, 'dontThrow', false);

									// Force to string
									str += '';
									
									var identifiers = types.getDefault(options, 'identifiers', {});
									var trimSpaces = types.getDefault(options, 'trimSpaces', false);

									// Doodad.Tools.Version.parse('1.1.23 beta', {identifiers: {alpha: 0, beta: 1, release: 2}}) --> [1, 1, 23, 1]
									// Doodad.Tools.Version.parse('1.1.23 build 1324') --> [1, 1, 23, 1324]
									// Doodad.Tools.Version.parse('major: 1, minor: 1, revision: 23 beta', {identifiers: {beta: 1}}) --> [1, 1, 23, 1]
										
									var ar = this.__parse(str, identifiers, trimSpaces);
									
									return new this(ar, options);
								}),
							
							compare: root.DD_DOC(
								//! REPLACE_BY("null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											version1: {
												type: 'string,Version',
												optional: false,
												description: "A version to compare from",
											},
											version2: {
												type: 'string,Version',
												optional: false,
												description: "A version to compare to",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Options",
											},
										},
										returns: 'integer',
										description: "Compares two software versions together. Returns '1' if 'version1' is greater than 'version2'. Returns '-1' if 'version1' is lower than 'version2'. Returns '0' if versions are equal.",
								}
								//! END_REPLACE()
								, function compare(version1, version2, /*optional*/options) {
									if (!(version1 instanceof tools.Version)) {
										version1 = this.parse(version1, options);
									};
									return version1.compare(version2, options);
								}),
						},
						/*instanceProto*/
						{
							data: null,
							options: null,
							
							_new: types.SUPER(function _new(data, /*optional*/options) {
								//if (new.target) {
								if (this instanceof tools.Version) {
									this._super();
									this.data = data;
									this.options = (options || {});
								};
							}),
							
							compare: root.DD_DOC(
								//! REPLACE_BY("null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											version: {
												type: 'string,Version',
												optional: false,
												description: "A version to compare to",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Options",
											},
										},
										returns: 'integer',
										description: "Compares software version with another software version. Returns '1' if 'version1' is greater than 'version2'. Returns '-1' if 'version1' is lower than 'version2'. Returns '0' if versions are equal.",
								}
								//! END_REPLACE()
								, function compare(version, /*optional*/options) {
									options = types.extend({}, this.options, options);
									if (!(version instanceof tools.Version)) {
										version = types.getType(this).parse(version, options);
									};
									var data1 = this.data,
										data1Len = data1.length,
										data2 = version.data,
										data2Len = data2.length,
										count = types.get(options, 'count', (Math.max(data1Len, data2Len) / 2)),
										j = 0,
										k = 0;
									for (var i = 0; i < count; i++) {
										var number1 = NaN;
										while (isNaN(number1) && (j < data1Len)) {
											if ((j in data1) && ((j + 1) in data1)) {
												number1 = data1[j];
											};
											j += 2;
										};
										var number2 = NaN;
										while (isNaN(number2) && (k < data2Len)) {
											if ((k in data2) && ((k + 1) in data2)) {
												number2 = data2[k];
											};
											k += 2;
										};
										number1 = (+number1 || 0);
										number2 = (+number2 || 0);
										if (number2 > number1) {
											return 1;
										} else if (number2 < number1) {
											return -1;
										};
									};
									return 0;
								}),
							
							toString: root.DD_DOC(
								//! REPLACE_BY("null")
								{
										author: "Claude Petit",
										revision: 0,
										params: null,
										returns: 'string',
										description: "Converts to string.",
								}
								//! END_REPLACE()
								, function toString(/*optional*/options) {
									if (!options) {
										options = {};
									};
									var identifiers = types.get(options, 'identifiers', this.options.identifiers);
									var result = '';
									var data = this.data,
										dataLen = data.length;
									for (var i = 1; i < dataLen; i += 2) {
										if (((i - 1) in data) && (i in data)) {
											result += data[i];
										};
									};
									return result;
								}),
						}
					)));
				
				//===================================
				// Misc functions
				//===================================
				
				tools.generateUUID = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'string',
							description: "Generates and returns a UUID.",
					}
					//! END_REPLACE()
					, function generateUUID() {
						// Source: https://gist.github.com/LeverOne
						var a, b;
						for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a^15 ? 8^Math.random() * (a^20 ? 16 : 4) : 4).toString(16) : '-');
						return b
					});

				//===================================
				// Init
				//===================================
				return function init(/*optional*/options) {
					// For production
					tools.setOptions({
						logLevel: tools.LogLevels.Error,
					});
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