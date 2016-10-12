//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Tools_Files.js - Files Tools
// Project home: https://github.com/doodadjs/
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

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Tools.Files'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			dependencies: [
				'Doodad.Types', 
				'Doodad.Tools',
				'Doodad',
			],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================
					
				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					files = tools.Files;
					
				//===================================
				// Internal
				//===================================
					
				// <FUTURE> Thread context
				var __Internal__ = {
				};
				
				
				//===================================
				// Options
				//===================================
					
				var __options__ = types.nullObject({
					caseSensitive: true,
					caseSensitiveUnicode: true,
				}, _options);

				__options__.caseSensitive = types.toBoolean(__options__.caseSensitive);
				__options__.caseSensitiveUnicode = types.toBoolean(__options__.caseSensitiveUnicode);

				// Some options can be changed, so we don't freeze the object.
				//types.freezeObject(__options__);

				files.getOptions = function() {
					// Because options are not frozen, we make a copy to force the use of "setOptions".
					return types.extend({}, __options__);
				};

				files.setOptions = function(options) {
					if (types.has(options, 'caseSensitive')) {
						__options__.caseSensitive = types.toBoolean(options.caseSensitive);
					};
					if (types.has(options, 'caseSensitiveUnicode')) {
						__options__.caseSensitiveUnicode = types.toBoolean(options.caseSensitiveUnicode);
					};
				};

				//===================================
				// Hooks
				//===================================

				_shared.urlParser = function urlParser(url, /*optional*/options) {
					if (types.isString(url)) {
						if (!options) {
							options = {
								noEscapes: true,
							};
						};
						url = files.Url.parse(url, options);
					};
					return url;
				};
				
				_shared.pathParser = function pathParser(path, /*optional*/options) {
					if (types.isString(path)) {
						if (!options) {
							options = {
								os: 'linux',
								dirChar: '/',
							};
						};

						path = files.Path.parse(path, options).set({
							os: null,
							dirChar: null,
						});
					};
					return path;
				};
				
				//===================================
				// Native functions
				//===================================
					
				types.complete(_shared.Natives, {
					windowRegExp: (global.RegExp || RegExp),

					windowUnescape: (global.unescape || unescape),					
					windowEncodeURIComponent: global.encodeURIComponent,
					windowDecodeURIComponent: global.decodeURIComponent,
				});
				
				//===================================
				// Paths
				//===================================
				
				files.REGISTER(root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
								returns: 'string',
								description: "Path error.",
					}
					//! END_REPLACE()
					, types.createErrorType("PathError", types.Error)
					));
					
				__Internal__.relativeToAbsolute = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									path: {
										type: 'string,array',
										optional: false,
										description: "Path to resolve",
									},
									dirRoot: {
										type: 'string,array',
										optional: true,
										description: "Path root",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Options",
									},
								},
								returns: 'object',
								description: "Resolves a relative path.",
					}
					//! END_REPLACE()
					, function relativeToAbsolute(path, /*optional*/dirRoot, /*optional*/options) {
						// WARNING: Paths should be parsed and validated according to the OS and file system and shell before calling this function.

						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isNothing(dirRoot) || types.isArray(dirRoot) || types.isString(dirRoot), "Invalid root.");
							root.DD_ASSERT(types.isArray(path) || types.isString(path), "Invalid path.");
						};
						
						var dirChar = types.get(options, 'dirChar', '/');

						if (types.isString(dirRoot)) {
							dirRoot = dirRoot.split(dirChar);
						};
						
						if (types.isString(path)) {
							path = path.split(dirChar);
						};
						
						var dontThrow = types.get(options, 'dontThrow', false);
						
						var isTrailing = function isTrailing(path) {
							var len = path.length;
							return (len > 1) && (path[len - 1] === '');
						};
						
						var rootTrailing = dirRoot && isTrailing(dirRoot),
							pathTrailing = isTrailing(path);
						
						if (dirRoot) {
							dirRoot = tools.filter(dirRoot, function (val) {
								return !!val;
							});
						};
						
						path = tools.filter(path, function (val) {
							return !!val;
						});
						
						// Resolve ".." and "."
						var pos = 0;
						while (pos < path.length) {
							var name = path[pos],   // NOTE: Don't trim because trailing spaces may be accepted by the OS and the file system. Paths must be parsed and validated before calling this function.
								count = 0;
							if (name === '.') {
								count = 1;
							} else if (name === '..') {
								count = 2;
							};
							if (count) {
								var tmp;
								if (pos <= 0) {
									if (dirRoot && (count > 1)) {
										if (dirRoot.length) {
											var tmp = dirRoot.pop();
											// "doodad/v0///removeMe/..//" will resolves to "doodad/v0"
											while (!tmp && dirRoot.length) {
												tmp = dirRoot.pop();
												if (tmp === '..') {
													tmp = dirRoot.pop();
												};
											};
										};
										if (!dirRoot.length) {
											if (dontThrow) {
												return null;
											} else {
												throw new files.PathError("Path overflow.");
											};
										};
									};
								};
								while (count && (pos >= 0)) {
									tmp = path.splice(pos, 1)[0];
									if (tmp) {
										count--;
									};
									pos--;
								};
								if (!tmp) {
									if (dontThrow) {
										return null;
									} else {
										throw new files.PathError("Path overflow.");
									};
								};
							} else {
								pos++;
							};
						};
						
						if (rootTrailing) {
							dirRoot.push('');
							if (dirRoot.length === 1) {
								dirRoot.push('');
							};
						};
						
						if (pathTrailing) {
							path.push('');
							if (path.length === 1) {
								path.push('');
							};
						};
						
						return {
							dirRoot: dirRoot,
							path: path,
						};
					});
				
				// Windows
				// NOTE: "%NAME%" resolves to variable "NAME", but "%" or "%%" are valid names !
				// NOTE: "^%" resolves to "%", but "^%NAME%" resolves to "%" plus variable "NAME" ! So we can't escape "%".
				// NOTE: Only special characters "^", "&" can be escaped to a normal char
				// NOTE: ":" is valid just for the drive letter and can't be escaped to a normal char. So this validation is done by "parsePathWindowsInvalidNamesRegEx".

				__Internal__.windowsShellSpecialCharacters = '\\^&';
				__Internal__.windowsShellVerySpecialCharacters = ' <>|\\?\\*"/';
				
				// group 1 = chars to unescape, group 2 = always invalid chars, group 3 = valid chars when escaped
				__Internal__.parsePathWindowsUnescapeShellReservedCharsRegEx = new _shared.Natives.windowRegExp('\\^([^ ' + __Internal__.windowsShellVerySpecialCharacters + '])|([' + __Internal__.windowsShellSpecialCharacters + __Internal__.windowsShellVerySpecialCharacters + ']|%[^%]+%|[\\b]|\\f|\\n|\\r|\\t|\\v)', 'gm');      // <FUTURE> thread level
				
				// group 1 = chars to escape
				__Internal__.parsePathWindowsEscapeShellReservedCharsRegEx = new _shared.Natives.windowRegExp('([' + __Internal__.windowsShellSpecialCharacters + '])', 'gm');     // <FUTURE> thread level
				
				__Internal__.parsePathWindowsInvalidNamesRegEx = /:|^(com[1-9]|lpt[1-9]|con|nul|prn)$/i;    // <FUTURE> thread level
				
				
				// Unix-like

				__Internal__.unixShellSpecialCharacters = ' <>|?*"\'&`#;~!\-()\\[\\]{}\\\\';

				// group 1 = chars to unescape, group 2 = invalid chars
				__Internal__.parsePathUnixUnescapeShellReservedCharsRegEx = new _shared.Natives.windowRegExp('\\\\(.)|([' + __Internal__.unixShellSpecialCharacters + ']|[\\b]|\\f|\\n|\\r|\\t|\\v)', 'gm');      // <FUTURE> thread level
				
				// group 1 = chars to escape
				__Internal__.parsePathUnixEscapeShellReservedCharsRegEx = new _shared.Natives.windowRegExp('([' + __Internal__.unixShellSpecialCharacters + '])', 'gm');     // <FUTURE> thread level

				//__Internal__.parsePathUnixInvalidNamesRegEx = /^()$/i;    // <FUTURE> thread level
				
				__Internal__.pathOptions = {
						os: null,		// '' = deactivate validation, 'windows', 'unix', 'linux'
						dirChar: '/',
						root: null,   // null = auto-detect
						drive: null,  // For Windows only. null = auto-detect 
						path: null,
						file: null,   // null = auto-detect. when set, changes 'extension'.
						extension: null, // when set, changes 'file'
						quote: null,  // null = auto-detect
						isRelative: false,
						noEscapes: false,
						shell: null,  // null = set to default, '' = deactivate validation, 'api' (default), 'dos', 'bash'
						forceDrive: false,
					};
				__Internal__.pathOptionsKeys = types.keys(__Internal__.pathOptions);
				
				files.Path = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									options: {
										type: 'object',
										optional: true,
										description: "Options",
									},
								},
								returns: 'Path',
								description: "Represents a system path.",
					}
					//! END_REPLACE()
					, types.INIT(types.Type.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'Path',

							parse: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 4,
											params: {
												path: {
													type: 'string,array',
													optional: false,
													description: "Path to parse",
												},
												options: {
													type: 'object',
													optional: true,
													description: "Parse options",
												},
											},
											returns: 'Path',
											description: "Parse a string to a system path.",
								}
								//! END_REPLACE()
								, function parse(path, /*optional*/options) {
									// WARNING: Validation is incomplete.
									// TODO: Windows network paths ("\\server\...")
									
									// Flags
									var dontThrow = types.get(options, 'dontThrow', false),
										pathWasNothing = types.isNothing(path),
										pathWasPath = false;
									
									if (path instanceof files.Path) {
										options = types.fill(__Internal__.pathOptionsKeys, {}, path, options);
										path = options.path;
										pathWasPath = true;
										
									} else if (path instanceof files.Url) {
										var proto = types.get(options, 'protocol', path.protocol);
										if (proto && (proto !== 'file')) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Bad url protocol.");
											};
										};
										
										var pathTmp = tools.trim(types.clone(path.path) || [], '', 1, 1);
										
										if (path.isWindows) {
											options = types.fill(__Internal__.pathOptionsKeys, {
												os: 'windows',
												drive: pathTmp.shift()[0],
												file: path.file,
												extension: path.extension,
											}, options);
										} else {
											options = types.fill(__Internal__.pathOptionsKeys, {
												os: 'linux',
												file: path.file,
												extension: path.extension,
											}, options);
										};

										path = pathTmp;
										pathWasPath = true;

									} else if (types.isArray(path)) {
										path = types.clone(path);

									} else if (!types.isNothing(path) && !types.isString(path)) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid path.");
										};
									};
									
									// Options
									var osInfo = tools.getOS();
									var os = types.get(options, 'os', null),  // Default is Auto-set
										dirChar = types.get(options, 'dirChar', null),  // Default is Auto-set
										isRelative = types.get(options, 'isRelative', null), // Default is Auto-detect
										noEscapes = types.get(options, 'noEscapes', false), // Default is False
										shell = types.get(options, 'shell', null), // Default is Auto-set
										quote = types.get(options, 'quote', null),  // Default is Auto-detect
										dirRoot = types.get(options, 'root', null),  // Default is no root
										drive = types.get(options, 'drive', null),  // Default is Auto-detect
										file = types.get(options, 'file', null),  // Default is Auto-detect
										extension = types.get(options, 'extension', null), // Default is "file" 's extension
										forceDrive = types.get(options, 'forceDrive', false);  // Default is False

									path = types.get(options, 'path', path);
									
									var pathIsString = types.isString(path),
										fileWasNothing = types.isNothing(file),
										dirRootIsString = types.isString(dirRoot);
										
									if (!dirRootIsString && !types.isNothing(dirRoot) && !types.isArray(dirRoot)) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid root.");
										};
									};
									
									if (types.isNothing(os)) {
										// Auto-set
										os = osInfo.type;
										if (types.isNothing(dirChar)) {
											dirChar = osInfo.dirChar;
										};
									};
									
									// Get default shell
									if (types.isNothing(shell)) {
										shell = 'api';
									};
									
									// Detect folder separator
									if (types.isNothing(dirChar)) {
										// Auto-set
										if (os === 'windows') {
											// Auto-set
											if (shell === '') {
												dirChar = ['\\', '/'];
											} else {
												dirChar = '\\';
											};
										} else {
											dirChar = '/';
										};
									};
									
									// Replace alternate folder separators by the first one
									if (types.isArray(dirChar)) {
										var sep = dirChar.slice(1),
											sepLen = sep.length;
										dirChar = dirChar[0];
										if (pathIsString) {
											for (var i = 0; i < sepLen; i++) {
												path = tools.replace(path, sep[i], dirChar, 'g');
											};
										};
									};
									
									// A folder separator is required
									if (!types.isStringAndNotEmpty(dirChar)) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid 'dirChar' option.");
										};
									};
										
									// Detect quotes character
									if (types.isNothing(quote)) {
										quote = '';
										if (pathIsString) {
											if ((os === 'unix') || (os === 'linux') || (os === 'windows')) {
												// Auto-detect
												if (path) {
													var tmp = path[0];
													if (
														(tmp === '"') ||
														(((os === 'unix') || (os === 'linux')) && (tmp === "'"))
													) {
														quote = tmp;
													};
												};
											};
										};
									};
									
									// If path is quoted, root must be quoted
									if (quote && dirRoot && dirRootIsString && (dirRoot[0] !== quote)) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("'root' option must be quoted.");
										};
									};
									
									// Trim quotes
									if (pathIsString && quote) {
										path = tools.trim(path, quote);
									};
									if (dirRootIsString && quote) {
										dirRoot = tools.trim(dirRoot, quote);
									};

									// Unescape and validate chars
									if (!noEscapes && shell) {
										var unescapePath = null,
											state = {
												invalid: null,
											};
										
										if (shell === 'dos') {
											unescapePath = function(path) {
												return tools.replace(path, __Internal__.parsePathWindowsUnescapeShellReservedCharsRegEx, function(matched, g1, g2, pos, str) {
													if (g1) {
														// Unescape
														if (quote) {
															// Don't unescape when quoted
															return '^' + g1;
														} else {
															return g1;
														};
													} else if (g2) {
														// Invalid characters
														if (!quote || (g2 === quote)) {
															state.invalid = g2;
														} else {
															// Allow when quoted
															return g2;
														};
													};
												})
											};
										} else if (shell === 'bash') {
											unescapePath = function(path) {
												return tools.replace(path, __Internal__.parsePathUnixUnescapeShellReservedCharsRegEx, function(matched, g1, g2, pos, str) {
													if (g1) {
														// Unescape
														if (quote) {
															// Don't unescape when quoted
															return '\\' + g1;
														} else {
															return g1;
														};
													} else if (g2) {
														// Invalid characters
														if (!quote || (g2 === quote)) {
															state.invalid = g2;
														} else {
															// Allow when quoted
															return g2;
														};
													};
												})
											};
										};

										if (unescapePath) {
											var unescapePathArray = function(path) {
												for (var i = 0; i < path.length; i++) {
													path[i] = unescapePath(path[i]);
												};
												return path;
											};
											
											if (dirRoot) {
												if (dirRootIsString) {
													dirRoot = unescapePath(dirRoot);
												} else {
													dirRoot = unescapePathArray(dirRoot);
												};
											};
											if (path) {
												if (pathIsString) {
													path = unescapePath(path);
												} else {
													path = unescapePathArray(path);
												};
											};
											if (file) {
												file = unescapePath(file);
											};

											if (state.invalid) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Invalid char: " + types.toSource(state.invalid) + ".");
												};
											};
										};
									};
										
									// Split paths
									if (dirRootIsString) {
										dirRoot = dirRoot.split(dirChar);
									};
									if (!dirRoot || !dirRoot.length || ((dirRoot.length === 1) && !dirRoot[0])) {
										dirRoot = null;
									};
									
									if (pathIsString) {
										path = path.split(dirChar);
									};
									if (!path || !path.length || ((path.length === 1) && !path[0])) {
										path = null;
									};
									
									if (types.isString(file)) {
										file = file.split(dirChar);
									};
									if (!file || !file.length || ((file.length === 1) && !file[0])) {
										file = null;
									};
									
									// Relative or absolute ?
									if (types.isNothing(isRelative)) {
										// Auto-detect
										isRelative = 
											!drive && 
											(
												(!dirRoot && !path) ||
												(!!dirRoot && !!dirRoot[0] && ((os !== 'windows') || (dirRoot[0].indexOf(':') < 0))) ||
												(!!path && !!path[0] && ((os !== 'windows') || (path[0].indexOf(':') < 0))) ||
												!!(tools.findItems(dirRoot, ['.', '..']).length) || 
												!!(tools.findItems(path, ['.', '..']).length) || 
												!!(tools.findItems(file, ['.', '..']).length)
											);
									};
									
									// Get and validate drive
									if (os === 'windows') {
										if (!isRelative && types.isNothing(drive)) {
											if (dirRoot) {
												var tmp = dirRoot[0];
												if (tmp && (tmp.length === 2) && (tmp[1] === ':')) {
													drive = dirRoot.shift()[0];
												};
											};

											if (path) {
												var tmp = path[0];
												if (tmp && (tmp.length === 2) && (tmp[1] === ':')) {
													if (dirRoot) {
														if (dontThrow) {
															return null;
														} else {
															throw new types.ParseError("'path' can't have a drive letter because 'root' is defined.");
														};
													};
													drive = path.shift()[0];
												};
											};
										};

										if (drive) {
											if (isRelative) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Relative paths can't have a drive letter.");
												};
											};
											
											// Validate drive letter
											drive = drive.toUpperCase();
											//var chr = unicode.codePointAt(drive, 0) || 0;
											var chr = drive.charCodeAt(0) || 0;
											if ((drive.length !== 1) || (chr < 65) || (chr > 90)) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Invalid drive.");
												};
											};
											
										} else if (!isRelative && forceDrive) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("A drive letter is mandatory for the absolute path.");
											};
										};
										
									} else {
										if (drive) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("'drive' option is invalid for Unix-like systems.");
											};
										};
									};
									
									if (!pathWasNothing && !pathWasPath && path && fileWasNothing) {
										// Last item, when not empty, is the file name
										if (path[path.length - 1]) {
											var tmp = path.pop();
											if (tmp) {
												// Auto-set
												file = [tmp];
											};
										};
									};
									
									if (path) {
										path = tools.trim(path, '');
										if (!path.length) {
											path = null;
										};
									};
									if (file) {
										file = tools.trim(file, '');
										if (!file.length) {
											file = null;
										};
									};
									
									if (types.isNothing(dirRoot)) {
										// Auto-set
										if (pathIsString && !isRelative) {
											dirRoot = [];
										} else {
											dirRoot = null;
										};
									} else if (isRelative) {
										if (dirRoot.length) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("'root' must be empty when relative.");
											};
										} else {
											dirRoot = null;
										};
									} else if (tools.findItems(dirRoot, ['.', '..']).length) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("'root' can't be relative.");
										};
									};

									if (!isRelative) {
										// Resolve relative paths
										if (dirRoot) {
											var abs = __Internal__.relativeToAbsolute(dirRoot, null, {
												dirChar: dirChar,
												dontThrow: dontThrow,
											});
											if (!abs) {
												return null;
											};
											dirRoot = abs.path;
										};
										
										if (path) {
											var abs = __Internal__.relativeToAbsolute(path, dirRoot || [], {
												dirChar: dirChar,
												dontThrow: dontThrow,
											});
											if (!abs) {
												return null;
											};
											dirRoot = abs.dirRoot;
											path = abs.path;
										};

										if (file) {
											var abs = __Internal__.relativeToAbsolute(file, path || [], {
												dirChar: dirChar,
												dontThrow: dontThrow,
											});
											if (!abs) {
												return null;
											};
											path = abs.dirRoot;
											file = abs.path;
										};
									};
									
									// Validate file names
									if (shell) {
										var validatePath = null,
											state = {
												invalid: null,
											};
											
										if (shell === 'dos') {
											validatePath = function(pathArray) {
												tools.forEach(pathArray, function(item, pos, items) {
													// NOTE: DOS trims spaces at the end of path and file names but keeps them at the beginning
													var tmp = tools.trim(item, ' ', -1);
													
													// NOTE: DOS also trims dots at the end
													// NOTE: More than two dots resolves to one
													if (tmp !== '..') {
														tmp = tools.trim(tmp, '.', -1, tmp.length - 1);
													};
													
													if (!isRelative) {
														if ((tmp === '.') || (tmp === '..')) {
															state.invalid = item;
														};
													};

													items[pos] = tmp;
													
													// NOTE: DOS has reserved file names
													if (__Internal__.parsePathWindowsInvalidNamesRegEx.test(tmp)) {
														state.invalid = item;
													};
												});
											};
										//} else if (shell === 'api') {
										} else {
											if (!isRelative) {
												validatePath = function(pathArray) {
													tools.forEach(pathArray, function(item, pos, items) {
														if ((item === '.') || (item === '..')) {
															state.invalid = item;
														};
													});
												};
											};
										};
										//} else {
										//	// Unix/Linux
										//	validatePath = function(pathArray) {
										//		tools.forEach(pathArray, function(item, pos, items) {
										//			if (!isRelative) {
										//				if ((item === '.') || (item === '..')) {
										//					state.invalid = item;
										//				};
										//			};
										//			if (__Internal__.parsePathUnixInvalidNamesRegEx.test(item)) {
										//				state.invalid = item;
										//			};
										//		});
										//	};
										//};
										
										if (validatePath) {
											validatePath(dirRoot);
											validatePath(path);
											validatePath(file);
											
											if (state.invalid) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Invalid path or file name: " + types.toSource(state.invalid) + ".");
												};
											};
										};
									};
									
									if (file) {
										if (file.length <= 1) {
											file = file[0];
										} else  {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Invalid file name.");
											};
										};
									};
									
									if (file) {
										var pos = file.indexOf('.');
										if (types.isNothing(extension)) {
											if (pos >= 0) {
												extension = file.slice(pos + 1);
											} else {
												extension = '';
											};
										} else if (extension) {
											if (pos >= 0) {
												file = file.slice(0, pos + 1) + extension;
											} else {
												file = file + '.' + extension;
											};
										} else if (pos >= 0) {
											// Remove trailing '.'
											file = file.slice(0, pos);
										};
									} else {
										extension = null;
									};
									
									return new this({
										os: os,
										dirChar: dirChar,
										drive: drive || '',
										root: dirRoot || [],
										path: path || [],
										file: file || null,
										extension: extension,
										quote: quote,
										isRelative: isRelative,
										noEscapes: noEscapes,
										shell: shell,
										forceDrive: forceDrive,
									});
								}),
								
						},
						/*instanceProto*/
						types.extend({
							_new: types.SUPER(function _new(options) {
								this._super();
								//if (new.target) {
								if (this instanceof files.Path) {
									var dirChar = options.dirChar,
										properties = types.fill(__Internal__.pathOptionsKeys, {}, options);
									if (types.hasDefinePropertyEnabled()) {
										tools.forEach(properties, function(value, key) {
											//if (((key === 'path') || (key === 'root')) && types.isString(value)) {
											//	value = value.split(dirChar || '/');
											//};
											properties[key] = {
												configurable: true,
												enumerable: true,
												value: value,
												writable: false,
											};
										});
										types.defineProperties(this, properties);
									} else {
										types.extend(this, properties);
									};
								};
							}),
							
							set: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 2,
											params: {
												options: {
													type: 'object',
													optional: false,
													description: "Options",
												},
											},
											returns: 'Path',
											description: "Set system path options with specified ones and returns a new Path object.",
								}
								//! END_REPLACE()
								, function set(options) {
									var newOptions = types.fill(__Internal__.pathOptionsKeys, {}, this);
									delete newOptions.extension;
									newOptions = types.fill(__Internal__.pathOptionsKeys, newOptions, options);
									return files.Path.parse(null, newOptions);
								}),
							
							toString: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 1,
											params: {
												options: {
													type: 'object',
													optional: true,
													description: "Options",
												},
											},
											returns: 'string',
											description: "Converts to a string.",
								}
								//! END_REPLACE()
								, function toString(/*optional*/options) {
									if (!(this instanceof files.Path)) {
										return '';
									};

									// Flags
									var dontValidate = types.get(options, 'dontValidate', false);
									
									if (options) {
										options = types.clone(options);
										if (types.has(options, 'os')) {
											if (!types.has(options, 'dirChar')) {
												options.dirChar = null;
											};
										};
										
										if (dontValidate) {
											options = types.extend({}, this, options);
										} else {
											// Validate
											// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
											if (!types.has(options, 'dontThrow')) {
												options.dontThrow = true;  // "parse" will returns null when invalid
											};
											options = files.Path.parse(this, options);
											if (!options) {
												// NOTE: Do not throw exceptions in "toString" because the javascript debugger doesn't like it
												//throw new files.PathError("Invalid path.");
												return '';
											};
										};
									} else {
										options = this;
									};
									
									
									var drive = options.drive,
										dirRoot = options.root,
										path = options.path,
										file = options.file,
										hasRoot = path.length && !path[0].length;
									
									
									dirRoot = dirRoot && tools.trim(dirRoot, '');
									path = path && tools.trim(path, '');
									path = types.append([], dirRoot, path, [file]);

									if (!options.noEscapes && !options.quote) {
										if (options.shell === 'bash') {
											var pathLen = path.length;
											for (var i = 0; i < pathLen; i++) {
												path[i] = path[i].replace(__Internal__.parsePathUnixEscapeShellReservedCharsRegEx, "\\$1");
											};
										} else if (options.shell === 'dos') {
											var pathLen = path.length;
											for (var i = 0; i < pathLen; i++) {
												path[i] = path[i].replace(__Internal__.parsePathWindowsEscapeShellReservedCharsRegEx, "^$1");
											};
										};
									};

									var result = path.join(options.dirChar);

									if (!options.isRelative || drive.length || hasRoot) {
										result = (options.dirChar + result);
									};
									
									if (drive.length) {
										result = (drive + ':') + result;
									};
									
									if (options.quote) {
										result = (options.quote + result + options.quote);
									};
									
									return result;
								}),
							
							combine: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 5,
											params: {
												path: {
													type: 'string,Path,Url',
													optional: true,
													description: "'Path' or 'Url' object to combine with. A string is parsed to a 'Path' object.",
												},
												options: {
													type: 'object',
													optional: true,
													description: "Options",
												},
											},
											returns: 'Path',
											description: "Combines with the specified 'Url' or 'Path' object and the provided options, then returns the result.",
								}
								//! END_REPLACE()
								, function combine(/*optional*/path, /*optional*/options) {
									root.DD_ASSERT && root.DD_ASSERT(types.isNothing(path) || types.isString(path) || types._instanceof(path, [files.Path, files.Url]), "Invalid path.");

									var dontThrow = types.get(options, 'dontThrow', false);
									
									if (types.isNothing(path) || types.isString(path)) {
										path = files.Path.parse(path, options);
										options = null;
									};
									
									var thisRoot = tools.trim(this.root || [], '');
									
									var thisPath = tools.trim(this.path || [], '');
									if (this.file) {
										thisPath.push(this.file);
									};

									var dirRoot;
										
									var dir = types.get(options, 'path', path.path);
									if (types.isString(dir)) {
										dir = dir.split(data.dirChar);
									};
									if (dir) {
										dir = tools.trim(dir, '');
									};

									var data = types.fill(__Internal__.pathOptionsKeys, {}, this);

									if (path instanceof files.Path) {
										var drive = types.get(options, 'drive', path.drive);
										if ((path.os === 'windows') && drive && ((this.os !== 'windows') || (drive !== this.drive))) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Drive mismatch.");
											};
										};
										dirRoot = types.get(options, 'root', path.root);

									} else { //if (path instanceof files.Url)
										if (path.protocol && (path.protocol !== 'file')) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Bad url protocol.");
											};
										};
										if (path.isWindows) {
											if (dir.length && ((this.os !== 'windows') || (dir[0][0] !== this.drive))) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Drive mismatch.");
												};
											};
											dir.shift();
										};
										dirRoot = types.get(options, 'root');
									};
									
									data.dontThrow = dontThrow;

									if (types.isString(dirRoot)) {
										dirRoot = dirRoot.split(data.dirChar);
									};
									if (dirRoot) {
										dirRoot = tools.trim(dirRoot, '');
									};

									var isRelative = types.get(options, 'isRelative', path.isRelative);
									if (isRelative) {
										data.root = null;
										data.path = types.append([], thisRoot, thisPath, dirRoot, dir);
									} else {
										data.root = types.append([], thisRoot, thisPath);
										data.path = types.append([], dirRoot, dir);
									};
									
									data.file = types.get(options, 'file', path.file);
									data.extension = types.get(options, 'extension', path.extension);

									path = files.Path.parse(null, data);

									return path;
								}),
							
							moveUp: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 1,
											params: {
												count: {
													type: 'integer',
													optional: true,
													description: "Number of times to move up. Default is '1'.",
												},
											},
											returns: 'Path',
											description: "Moves up to parent folder the specified number of times and returns a new Path object.",
								}
								//! END_REPLACE()
								, function moveUp(/*optional*/count) {
									if (types.isNothing(count)) {
										count = 1;
									};
									var i = this.path.length - 1;
									while ((i >= 0) && (count > 0)) {
										var tmp = this.path[i];
										if (tmp === '.') {
										} else if (tmp === '..') {
											count++;
										} else {
											count--;
										};
										i--;
									};
									var path;
									if (count > 0) {
										path = [];
										if (this.isRelative) {
											while (count > 0) {
												path.push('..');
												count--;
											};
										};
									} else {
										path = this.path.slice(0, i + 1);
									};
									return files.Path.parse(null, types.fill(__Internal__.pathOptionsKeys, {}, this, {path: path}));
								}),
							
							pushFile: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 2,
											params: null,
											returns: 'Path',
											description: "Includes file in the path and returns a new Path object. Useful after parsing path strings not including file names which are known to miss the trailing directory separator (like environment variables). It might be a parse option in the future.",
								}
								//! END_REPLACE()
								, function pushFile() {
									if (this.file) {
										return files.Path.parse(null, types.fill(__Internal__.pathOptionsKeys, {}, this, {file: null, extension: null, path: types.append([], this.path, [this.file])}));
									} else {
										return files.Path.parse(this);
									};
								}),
							
							toArray: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'arrayof(string)',
											description: "Returns the path as an array.",
								}
								//! END_REPLACE()
								, function toArray() {
									var path = types.append([], this.root, this.path);
									if (!this.isRelative) {
										if (this.drive) {
											path.unshift(this.drive + ':');
										} else {
											path.unshift('');
										};
									};
									if (this.file) {
										path.push(this.file);
									} else {
										path.push('');
									};
									return path;
								}),
								
							relative: function relative(to, /*optional*/options) {
								if (this.isRelative) {
									throw new types.ParseError("'this' must be an absolute path.");
								};
								
								if (!(to instanceof files.Path)) {
									to = files.Path.parse(to, options);
								};
								if (to.isRelative) {
									throw new types.ParseError("'to' must be an absolute path.");
								};
								
								if ((this.os === 'windows') && (to.os !== 'windows')) {
									throw new types.ParseError("Incompatible OSes.");
								};
								
								if ((this.os === 'windows') && (this.drive !== to.drive)) {
									throw new types.ParseError("'this' and 'to' must be from the same drive.");
								};
								
								var filesOptions = files.getOptions(),
									caseSensitive = types.get(options, 'caseSensitive', filesOptions.caseSensitive);

								var thisAr = this.toArray(),
									toAr = to.toArray();
								
								var pathAr = [],
									i = 0;
								
								for (; (i < thisAr.length) && (i < toAr.length); i++) {
									if (caseSensitive) {
										if (thisAr[i] !== toAr[i]) {
											break;
										};
									} else {
										if (thisAr[i].toLowerCase() !== toAr[i].toLowerCase()) {
											break;
										};
									};
								};
								
								var j = i;
								
								for (; i < toAr.length; i++) {
									pathAr.push('..');
								};
								
								if (pathAr.length === 0) {
									pathAr.push('.');
								};
								
								for (; j < thisAr.length; j++) {
									pathAr.push(thisAr[j]);
								};
								
								return files.Path.parse(pathAr, types.fill(__Internal__.pathOptions, {}, this, {isRelative: true}));
							},
						}, __Internal__.pathOptions)
					)));
				
				//===================================
				// URLs
				//===================================
				
				//files.REGISTER(types.createErrorType("UrlError", types.Error));

				__Internal__.decodeURIComponent = function(uri) {
					// <PRB> decodeURIComponent doesn't unescape "+"
					uri = tools.replace(uri || '', /\+/g,  " ");
					try {
						return _shared.Natives.windowDecodeURIComponent(uri);
					} catch(ex) {
						// <PRB> decodeURIComponent throws on invalid hex values and on invalid UTF8 sequences.
						return _shared.Natives.windowUnescape(uri);
					};
				};

				files.UrlArguments = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									args: {
										type: 'arrayof(object)',
										optional: true,
										description: "Arguments.",
									},
									options: {
										type: 'object',
										optional: true,
										description: "Arguments options.",
									},
								},
								returns: 'UrlArguments',
								description: "Represents arguments to an URL.",
					}
					//! END_REPLACE()
					, types.INIT(types.Type.$inherit( 
						/*typeProto*/
						{
							$TYPE_NAME: 'UrlArguments',

							parse: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											args: {
												type: 'string,object,array',
												optional: true,
												description: "Arguments to parse.",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Parse options.",
											},
										},
										returns: 'UrlArguments',
										description: "Parses a string and returns an 'UrlArguments' object.",
								}
								//! END_REPLACE()
								, function parse(/*optional*/args, /*optional*/options) {
									// WARNING: Validation is incomplete.
									
									if (root.DD_ASSERT) {
										root.DD_ASSERT(types.isNothing(args) || types.isString(args) || types.isJsObject(args) || types.isArray(args), "Invalid arguments.");
										root.DD_ASSERT(types.isNothing(options) || types.isJsObject(options), "Invalid options.");
									};

									if (!types.isNothing(args)) {
										var noEscapes = types.get(options, 'noEscapes', false);
										if (types.isString(args)) {
											args = args.split('&');
											for (var i = args.length - 1; i >= 0; i--) {
												var arg = tools.split(args[i], '=', 2);
												var name = arg[0];
												if (!noEscapes) {
													name = __Internal__.decodeURIComponent(name);
												};
												var value = null;
												if (arg.length === 2) {
													value = arg[1];
													if (!noEscapes) {
														value = __Internal__.decodeURIComponent(value);
													};
												};
												args[i] = {
													name: name,
													value: value,
												};
											};
										} else {
											args = tools.reduce(args, function(result, value, name) {
												if (types.isObject(value)) {
													name = value.name;
													value = value.value;
												};
												value = types.toString(value);
												if (!noEscapes) {
													name = __Internal__.decodeURIComponent(name);
												};
												if (!noEscapes) {
													value = __Internal__.decodeURIComponent(value);
												};
												result.push({
													name: name,
													value: value,
												});
												return result;
											}, []);
										};
									};
									
									return new files.UrlArguments(args, options);
								}),
						},
						/*instanceProto*/
						{
							options: null,
							__args: null,
							
							_new: types.SUPER(function(args, /*optional*/options) {
								this._super();
								//if (new.target) {
								if (this instanceof files.UrlArguments) {
									if (root.DD_ASSERT) {
										root.DD_ASSERT(types.isNothing(args) || types.isArray(args), "Invalid arguments array.");
									};

									if (types.hasDefinePropertyEnabled()) {
										types.defineProperties(this, {
											options: {
												configurable: true,
												enumerable: true,
												value: options,
												writable: false,
											},
											__args: {
												configurable: true,
												enumerable: true,
												value: args,
												writable: false,
											},
										});
									} else {
										this.options = options;
										this.__args = args;
									};
								};
							}),
							
							toString: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											options: {
												type: 'object',
												optional: true,
												description: "Options.",
											},
										},
										returns: 'string',
										description: "Converts to a string with the specified options.",
								}
								//! END_REPLACE()
								, function toString(/*optional*/options) {
									if (types.isNothing(this.__args)) {
										return '';
									};
									options = types.extend({}, this.options, options);
									var result = '',
										len = this.__args.length,
										arg,
										name, 
										val;
									var noEscapes = types.get(options, 'noEscapes', false);
									for (var i = 0; i < len; i++) {
										arg = this.__args[i];
										name = arg.name;
										val = arg.value;
										if (!types.isNothing(name) || !types.isNothing(val)) {
											if (!types.isNothing(name)) {
												if (!noEscapes) {
													name = _shared.Natives.windowEncodeURIComponent(name);
												};
												result += name;
											};
											if (!types.isNothing(val)) {
												if (!noEscapes) {
													val = _shared.Natives.windowEncodeURIComponent(val);
												};
												result += '=' + val;
											};
											result += '&';
										};
									};
									return result.slice(0, result.length - 1);
								}),
							
							has: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											name: {
												type: 'string',
												optional: false,
												description: "Name of the argument.",
											},
										},
										returns: 'bool',
										description: "Returns 'true' if there exists an argument with the specified name. Returns 'false' otherwise.",
								}
								//! END_REPLACE()
								, function has(name) {
									if (root.DD_ASSERT) {
										root.DD_ASSERT((this instanceof files.UrlArguments), "Invalid arguments object.");
										root.DD_ASSERT(types.isNothing(name) || types.isString(name), "Invalid name.");
									};
									if (this.__args) {
										for (var i = this.__args.length - 1; i >= 0; i--) {
											var arg = this.__args[i];
											if (arg.name === name) {
												return true;
											};
										};
									};
									return false;
								}),
							get: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											name: {
												type: 'string',
												optional: false,
												description: "Name of the argument.",
											},
											singleValue: {
												type: 'bool',
												optional: true,
												description: "When 'true', function will returns only the first occurrence as a single value. When 'false', all occurrences will be returned as an array. Default is 'false'.",
											},
										},
										returns: 'object',
										description: "Returns an object having 'name' and 'value' attributes. When argument doesn't exists, 'value' is 'undefined'.",
								}
								//! END_REPLACE()
								, function get(name, /*optional*/singleValue) {
									if (root.DD_ASSERT) {
										root.DD_ASSERT((this instanceof files.UrlArguments), "Invalid arguments object.");
										root.DD_ASSERT(types.isNothing(name) || types.isString(name), "Invalid name.");
									};
									var result = undefined,
										isArray = false,
										isNothing = true;
									if (types.isNothing(this.__args)) {
										return result;
									};
									for (var i = this.__args.length - 1; i >= 0; i--) {
										var arg = this.__args[i];
										if (arg.name === name) {
											if (isArray) {
												result.push(arg.value);
											} else if (isNothing) {
												result = arg.value;
												isNothing = false;
												if (singleValue) {
													break;
												};
											} else {
												result = [value, arg.value];
												isArray = true;
											};
										};
									};
									return result;
								}),
							
							set: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 1,
										params: {
											name: {
												type: 'string,arrayof(string),object',
												optional: false,
												description: "Name of the argument. When an object, it is used as name/value pairs.",
											},
											value: {
												type: 'any,arrayof(any)',
												optional: true,
												description: "Value of the argument. When value is nothing and the name is not an object, the name is parsed as a single \"name=value\" pair.",
											},
											replace: {
												type: 'bool',
												optional: true,
												description: "When 'true', function will replace every matching arguments. When 'false', function will append a new value. Default is 'true'.",
											},
										},
										returns: 'this',
										description: "Sets the specified argument with the specified value.",
								}
								//! END_REPLACE()
								, function set(name, /*optional*/value, /*optional*/replace) {
									if (root.DD_ASSERT) {
										root.DD_ASSERT((this instanceof files.UrlArguments), "Invalid arguments object.");
										root.DD_ASSERT(types.isString(name) || types.isArray(name) || types.isJsObject(name), "Invalid name.");
										root.DD_ASSERT(types.isNothing(value) || types.isString(value) || types.isArray(value), "Invalid value.");
									};
									var isObj = types.isObject(name);
									var noEscapes = types.get(this.options, 'noEscapes', false);
									if (!types.isArray(name) && !isObj) {
										name = [name];
									};
									if (types.isNothing(replace)) {
										replace = true;
									};
									if (!types.isNothing(value) && !types.isArray(value)) {
										value = [value];
									};
									var args;
									if (types.isNothing(this.__args)) {
										args = [];
									} else {
										args = types.clone(this.__args, 1);
									};
									tools.forEach(name, function(v, n) {
										if (isObj) {
											if (!types.isArray(v)) {
												v = [v];
											};
										} else {
											n = v;
											v = value;
											if (types.isNothing(v)) {
												n = tools.split(n, '=', 2);
												if (n.length < 2) {
													v = null;
												} else {
													v = n[1];
												};
												n = n[0];
												if (!noEscapes) {
													if (v) {
														v = __Internal__.decodeURIComponent(v);
													};
													n = __Internal__.decodeURIComponent(n);
												};
												v = [v];
											};
										};
										if (replace) {
											for (var i = 0; i < args.length;) {
												var arg = args[i];
												if (arg.name === n) {
													if (v.length) {
														var val = v.shift();
														if (!noEscapes) {
															val = __Internal__.decodeURIComponent(val);
														};
														args[i].value = types.toString(val);
													} else {
														args.pop(i);
														continue;
													};
												};
												i++;
											};
										};
										for (var i = 0; i < v.length; i++) {
											args.push({
												name: n,
												value: v[i],
											});
										};
									});
									if ((!args.length) && !this.__args) {
										args = null;
									};
									return new files.UrlArguments(args, types.clone(this.options));
								}),
							
							remove: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 2,
										params: {
											names: {
												type: 'string,arrayof(string)',
												optional: false,
												description: "Name of the argument(s).",
											},
										},
										returns: 'UrlArguments',
										description: "Removes every occurrences of the specified argument(s) and returns a new UrlArguments object.",
								}
								//! END_REPLACE()
								, function remove(names) {
									if (root.DD_ASSERT) {
										root.DD_ASSERT((this instanceof files.UrlArguments), "Invalid url object.");
										root.DD_ASSERT(types.isNothing(names) || types.isString(names) || types.isArray(names), "Invalid names.");
									};
									if (!types.isArray(names)) {
										names = [names || ''];
									};
									var args = [];
									if (!types.isNothing(this.__args)) {
										for (var i = 0; i < this.__args.length; i++) {
											var arg = this.__args[i],
												found = false;
											for (var j = 0; j < names.length; j++) {
												if (arg.name === names[j]) {
													found = true;
													break;
												};
											};
											if (!found) {
												args.push(types.clone(arg));
											};
										};
									};
									if (args.length === 0) {
										args = null;
									};
									return new files.UrlArguments(args, types.clone(this.options));
								}),
							
							combine: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											args: {
												type: 'string,UrlArguments,object',
												optional: false,
												description: "Argument to combine.",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Options.",
											},
										},
										returns: 'UrlArguments',
										description: "Combines arguments with other arguments and the specified options.",
								}
								//! END_REPLACE()
								, function combine(args, /*optional*/options) {
									if (root.DD_ASSERT) {
										root.DD_ASSERT((types.isString(args)) || (args instanceof files.UrlArguments) || (types.isJsObject(args)), "Invalid arguments.");
									};
									options = types.extend({}, this.options, options);
									var mode = types.get(options, 'argsMode', 'merge');
									if (types.isString(args) || types.isJsObject(args)) {
										args = files.UrlArguments.parse(args, options);
										if (mode === 'replace') {
											return args;
										};
									};
									if (mode === 'replace') {
										args = args.__args && types.clone(args.__args);
									} else if (mode === 'merge') {
										var tmp = {},
											ar1 = this.__args,
											ar1Len = ar1 && ar1.length;
										for (var i = 0; i < ar1Len; i++) {
											var item = ar1[i];
											item.order = i;
											tmp[item.name] = item;
										};
										var ar2 = args.__args,
											ar2Len = ar2 && ar2.length;
										for (var i = 0; i < ar2Len; i++) {
											var item = ar2[i];
											item.order = i + ar1Len;
											tmp[item.name] = item;
										};
										args = types.values(tmp).sort(function(item1, item2) {
											if (item1.order < item2.order) {
												return -1;
											} else if (item1.order > item2.order) {
												return 1;
											} else {
												return 0;
											};
										});
										if (!args.length) {
											args = null;
										};
									} else { // if (mode === 'append')
										args = (this.__args || args.__args) && types.append([], this.__args, args.__args);
									};
									return new files.UrlArguments(args, options);						
								}),
						}
					)));
					
				__Internal__.urlOptions = {
					protocol: null,
					user: null,
					password: null,
					domain: null,
					port: null,
					path: null,
					file: null,   // when set, changes 'extension'.
					extension: null, // when set, changes 'file'
					args: null,
					anchor: null,
					isRelative: false,
					noEscapes: false,
					isWindows: false,
				};
				__Internal__.urlOptionsKeys = types.keys(__Internal__.urlOptions);

				files.Url = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: {
									options: {
										type: 'object',
										optional: false,
										description: "URL options.",
									},
								},
								returns: 'Url',
								description: "Represents an URL.",
					}
					//! END_REPLACE()
					, types.INIT(types.Type.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'Url',

							parse: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 5,
										params: {
											url: {
												type: 'string,Url,Path',
												optional: true,
												description: "URL to parse.",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Parse options.",
											},
										},
										returns: 'Url',
										description: "Represents an URL.",
								}
								//! END_REPLACE()
								, function parse(/*optional*/url, /*optional*/options) {
									// WARNING: Validation is incomplete.
									
									if (types.isNothing(url)) {
										url = types.get(options, 'url', null);
									};
									
									// Flags
									var dontThrow = types.get(options, 'dontThrow', false),
										urlIsArray = types.isArray(url),
										path = null; // Default is Auto-detect
									
									if (urlIsArray) {
										path = url;
										url = null;
										
									} else if (url instanceof files.Url) {
										var args = types.get(options, 'args', null);
										
										options = types.fill(__Internal__.urlOptionsKeys, {}, url, options);
										
										if (types.isJsObject(args)) {
											options.args = url.args.combine(args, options);
										};
										
										url = null;
										
									} else if (url instanceof files.Path) {
										var pathTmp = url.path,
											isWindows = (url.os === 'windows');
										
										if (isWindows) {
											pathTmp = types.append([], [url.drive + ':'], pathTmp)
										};
										
										options = types.fill(__Internal__.urlOptionsKeys, {
											protocol: 'file',
											path: pathTmp,
											file: url.file,
											extension: url.extension,
											isWindows: isWindows,
										}, options);
										
										url = null;
										
									} else if (types.isNothing(url) || types.isString(url)) {
										// Valid
									} else {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid url.");
										};
									};

									// Options
									var protocol = types.get(options, 'protocol', null), // Default is Auto-detect
										domain = types.get(options, 'domain', null), // Default is Auto-detect
										user = types.get(options, 'user', null), // Default is Auto-detect
										password = types.get(options, 'password', null), // Default is Auto-detect
										port = types.get(options, 'port', null), // Default is Auto-detect
										path = types.get(options, 'path', path),
										file = types.get(options, 'file', null), // Default is Auto-detect
										extension = types.get(options, 'extension', null), // Default is "file" 's extension
										args = types.get(options, 'args', null), // Default is Auto-detect
										anchor = types.get(options, 'anchor', null), // Default is Auto-detect
										isWindows = types.get(options, 'isWindows', null), // Default is Auto-detect
										noEscapes = types.get(options, 'noEscapes', false),
										isRelative = types.get(options, 'isRelative', null); // Default is Auto-detect
									
									
									if (url) {
										url = tools.trim(url);
										
										var pos;
										
										// Auto-detect "protocol"
										//var pos = url.search(/^(?:[A-Za-z]+)\:\/\//);   // WHY IT DOESN'T RETURN THE POSITION OF /\:\/\// ???
										//var pos = /^(?:[A-Za-z]+)[:]\:\/\//.exec(url)      // WHAT IS WRONG ???
										if (/^[A-Za-z]+\:\/\//.test(url)) {
											pos = url.indexOf(':');
											if (pos >= 0) {
												if (types.isNothing(protocol)) {
													protocol = url.slice(0, pos).toLowerCase() || null;
												};
												url = url.slice(pos + 3);
											};
										};
										
										if (!protocol || (protocol === 'file')) {
											// Auto-detect "isWindows"
											if (types.isNothing(isWindows)) {
												// Workaround for Windows and IE
												isWindows = (tools.search(url, /^[/]?[A-Za-z][:]/) >= 0);
											};
										} else {
											// Auto-detect "isWindows", "domain", "user", "password", "port", "path"
											isWindows = false;
											pos = tools.search(url, /[/\?#]/);
											if (pos >= 0) {
												if (types.isNothing(domain)) {
													domain = url.slice(0, pos) || null;
												};
												url = url.slice(pos);
											} else {
												if (types.isNothing(domain)) {
													domain = url || null;
												};
												url = '';
											};
											if (domain) {
												pos = domain.indexOf('@');
												var login = null;
												if (pos >= 0) {
													login = domain.slice(0, pos);
													domain = domain.slice(pos + 1) || null;
													pos = login.indexOf(':');
													if (pos >= 0) {
														if (types.isNothing(user)) {
															user = login.slice(0, pos) || null;
														};
														if (types.isNothing(password)) {
															password = login.slice(pos + 1);
														};
													} else {
														if (types.isNothing(user)) {
															user = login || null;
														};
													};
												};
											};
											if (domain) {
												pos = tools.search(domain, /[:][0-9]+/);
												if (pos >= 0) {
													if (types.isNothing(port)) {
														port = domain.slice(pos + 1) || null;
													};
													domain = domain.slice(0, pos) || null;
												};
											};
										};

										// Auto-detect "args" and "anchor"
										var posArgs = tools.search(url, '?', 0, null, '#');
										var posAnchor = tools.search(url, '#', ((posArgs >= 0) ? posArgs + 1 : 0));
										if ((posArgs >= 0) && types.isNothing(args)) {
											args = url.slice(posArgs + 1, (posAnchor >= 0 ? posAnchor: undefined));
										};
										if ((posAnchor >= 0) && types.isNothing(anchor)) {
											anchor = url.slice(posAnchor + 1);
										};
										if (posArgs < 0) {
											posArgs = posAnchor;
										};
										if (posArgs >= 0) {
											url = url.slice(0, posArgs);
										};

										// Auto-detect "path" and "file"
										pos = url.lastIndexOf('/');
										if (pos >= 0) {
											if (types.isNothing(file)) {
												file = url.slice(pos + 1) || null;
												if (types.isNothing(path)) {
													path = url.slice(0, pos + 1);
												};
											} else {
												if (types.isNothing(path)) {
													path = url;
												};
											};
										} else {
											if (types.isNothing(file)) {
												file = url || null;
												if (types.isNothing(path)) {
													path = '';
												};
											} else {
												path = url;
											};
										};
										
									};
									
									if (!noEscapes) {
										if (domain) {
											domain = __Internal__.decodeURIComponent(domain);
										};
										if (user) {
											user =  __Internal__.decodeURIComponent(user);
										};
										if (password) {
											password = __Internal__.decodeURIComponent(password);
										};
										if (types.isString(port)) {
											port = __Internal__.decodeURIComponent(port) || null;
										};
									};
									
									if (domain) {
										domain = domain.toLowerCase();
									} else {
										if ((protocol !== 'file') || (!path && !file)) {
											protocol = null;
										};
										user = null;
										password = null;
										port = null;
									};
									
									if (!types.isNothing(port)) {
										port = types.toInteger(port);
										if ((port <= 0) || (port > 65535)) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Invalid port number.");
											};
										};
									};
									
									if (types.isNothing(args) || types.isString(args) || types.isJsObject(args)) {
										args = files.UrlArguments.parse(args, {
											noEscapes: noEscapes,
										});
									} else if (!(args instanceof files.UrlArguments)) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid url arguments.");
										};
									};

									if (!noEscapes && anchor) {
										anchor = __Internal__.decodeURIComponent(anchor);
									};
									
									if (urlIsArray) {
										if (path[path.length - 1]) {
											var tmp = path.pop();
											if (tmp) {
												// Auto-set
												file = [tmp];
											};
										};
										
									} else {
										if (types.isNothing(path)) {
											path = [];
										} else {
											if (types.isString(path)) {
												if (!noEscapes) {
													path = __Internal__.decodeURIComponent(path);
												};
												if (path.length) {
													path = path.split('/');
												} else {
													path = [];
												};
											} else {
												if (!noEscapes) {
													path = tools.map(path, __Internal__.decodeURIComponent);
												};
											};
										};
										
										if (types.isNothing(file)) {
											file = null;
										} else {
											if (types.isString(file)) {
												if (!noEscapes) {
													file = __Internal__.decodeURIComponent(file);
												};
												if (file.length) {
													file = file.split('/');
												} else {
													file = null;
												};
											} else {
												if (!noEscapes) {
													file = tools.map(file, __Internal__.decodeURIComponent);
												};
											};
										};
									};

									if (types.isNothing(isRelative)) {
										// Auto-detect
										isRelative = (!path || !path.length || !!path[0].length) ||
													!!(tools.findItems(path, ['.', '..']).length) || 
													!!(tools.findItems(file, ['.', '..']).length)
									};
									
									if (path) {
										path = tools.trim(path, '');
									};
									if (file) {
										file = tools.trim(file, '');
									};
									
									if (!isRelative) {
										if (path) {
											var abs = __Internal__.relativeToAbsolute(path, null, {
												dirChar: '/',
												dontThrow: dontThrow,
											});
											if (!abs) {
												return null;
											};
											path = abs.path;
										};
										if (file) {
											var abs = __Internal__.relativeToAbsolute(file, path || [], {
												dirChar: '/',
												dontThrow: dontThrow,
											});
											if (!abs) {
												return null;
											};
											path = abs.dirRoot;
											file = abs.path;
										};
									};
									
									if (!isRelative) {
										var state = {
												invalid: null,
											},
											validatePath = function(pathArray) {
												tools.forEach(pathArray, function(item, pos, items) {
													if ((item === '.') || (item === '..')) {
														state.invalid = item;
													};
												});
											};
										validatePath(path);
										validatePath(file);
										if (state.invalid) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Invalid path or file name: " + types.toSource(state.invalid) + ".");
											};
										};
									};
											
									if (file) {
										if (file.length <= 1) {
											file = file[0];
										} else  {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Invalid file name.");
											};
										};
									};

									if (file) {
										var pos = file.indexOf('.');
										if (types.isNothing(extension)) {
											if (pos >= 0) {
												extension = file.slice(pos + 1);
											} else {
												extension = '';
											};
										} else if (extension) {
											if (pos >= 0) {
												file = file.slice(0, pos + 1) + extension;
											} else {
												file = file + '.' + extension;
											};
										} else if (pos >= 0) {
											// Remove trailing '.'
											file = file.slice(0, pos);
										};
									} else {
										extension = null;
									};
									
									url = new files.Url({
										protocol: protocol,
										domain: domain,
										user: user,
										password: password,
										port: port,
										path: path || [],
										file: file || null,
										extension: extension,
										args: args,
										anchor: anchor,
										noEscapes: !!noEscapes,
										isRelative: !!isRelative,
										isWindows: !!isWindows,
									});

									return url;
								}),
						},
						/*instanceProto*/
						types.extend({
							_new: types.SUPER(function _new(options) {
								this._super();
								//if (new.target) {
								if (this instanceof files.Url) {
									var properties = types.fill(__Internal__.urlOptionsKeys, {}, options),
										self = this;
									if (types.hasDefinePropertyEnabled()) {
										tools.forEach(properties, function(value, key) {
											properties[key] = {
												configurable: true,
												enumerable: true,
												value: value,
												writable: false,
											};
										});
										types.defineProperties(this, properties);
									} else {
										types.extend(this, properties);
									};
								} else {
									return new files.Url(options);
								};
							}),
							
							set: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 2,
										params: {
											options: {
												type: 'object',
												optional: false,
												description: "Options.",
											},
										},
										returns: 'Url',
										description: "Sets URL options and returns a new Url object.",
								}
								//! END_REPLACE()
								, function set(options) {
									var newOptions = types.fill(__Internal__.urlOptionsKeys, {}, this);
									delete newOptions.extension;
									newOptions = types.fill(__Internal__.urlOptionsKeys, newOptions, options);
									return files.Url.parse(null, newOptions);
								}),
							
							setArgs: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 1,
										params: {
											args: {
												type: 'object',
												optional: false,
												description: "name/value pairs.",
											},
											replace: {
												type: 'bool',
												optional: true,
												description: "When 'true', function will replace every matching arguments. When 'false', function will append a new value. Default is 'true'.",
											},
										},
										returns: 'Url',
										description: "Sets URL arguments and returns a new Url object.",
								}
								//! END_REPLACE()
								, function setArgs(args, /*optional*/replace) {
									return this.set({
										args: this.args.set(args, null, replace),
									});
								}),
							
							removeArgs: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											name: {
												type: 'string,arrayof(string)',
												optional: true,
												description: "Name of the argument.",
											},
										},
										returns: 'Url',
										description: "Removes URL arguments and returns a new Url object.",
								}
								//! END_REPLACE()
								, function removeArgs(/*optional*/name) {
									if (name) {
										return this.set({
											args: this.args.remove(name),
										});
									} else {
										return this.set({
											args: files.UrlArguments.parse(),
										});
									};
								}),
							
							toString: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											options: {
												type: 'object',
												optional: true,
												description: "Options.",
											},
										},
										returns: 'string',
										description: "Converts to a string.",
								}
								//! END_REPLACE()
								, function toString(/*optional*/options) {
									if (!(this instanceof files.Url)) {
										return '';
									};

									// Flags
									var dontValidate = types.get(options, 'dontValidate', false);
									
									if (options) {
										if (dontValidate) {
											options = types.extend({}, this, options);
										} else {
											// Validate
											// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
											options = types.clone(options) || {};
											if (!types.has(options, 'dontThrow')) {
												options.dontThrow = true;  // "parse" will returns null when invalid
											};
											options = files.Url.parse(this, options);
											if (!options) {
												// NOTE: Do not throw exceptions in "toString" because the javascript debugger doesn't like it
												//throw new types.ParseError("Invalid url.");
												return '';
											};
										};
									} else {
										options = this;
									};

									
									// Options
									var noEscapes = types.get(options, 'noEscapes', false);

									
									var result = '';
									
									if (options.protocol) {
										result += options.protocol + '://';
									};
									
									if (!types.isNothing(options.domain)) {
										if (!types.isNothing(options.user) || !types.isNothing(options.password)) {
											if (!types.isNothing(options.user)) {
												result += (noEscapes ? options.user : _shared.Natives.windowEncodeURIComponent(options.user));
											};
											if (!types.isNothing(options.password)) {
												result += ':' + (noEscapes ? options.password : _shared.Natives.windowEncodeURIComponent(options.password));
											};
											result += '@';
										}
										result += (noEscapes ? options.domain : _shared.Natives.windowEncodeURIComponent(options.domain));
										if (!types.isNothing(options.port)) {
											result += ':' + options.port;
										};
									};
									
									if ((options.path && options.path.length) || !options.isRelative) {
										var path = '/' + tools.trim((noEscapes ? (options.path || []) : tools.map((options.path || []), _shared.Natives.windowEncodeURIComponent)), '').join('/');
										if (path.length > 1) {
											path += '/';
										};
										if (!noEscapes && options.isWindows) {
											// Workaround for Windows and IE (must be "/C:/", not "/C%3A/")
											path = tools.replace(path, /^\/?([A-Za-z])\%3[Aa]/, function(result, g1) {
												return '/' + g1.toUpperCase() + ':';
											});
										};
										result += path;
									};

									if (options.file) {
										if ((!options.path || !options.path.length) && options.isRelative) {
											result += '/';
										};
										result += (noEscapes ? options.file : _shared.Natives.windowEncodeURIComponent(options.file));
									};
									
									if (options.args) {
										if (!types.isNothing(options.args.__args)) {
											result += '?' + options.args.toString(options);
										};
									};
									
									if (!types.isNothing(options.anchor)) {
										result += '#' + (noEscapes ? options.anchor : _shared.Natives.windowEncodeURIComponent(options.anchor));
									};

									return result;
								}),
							
							compare: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: {
											url: {
												type: 'string,Url',
												optional: true,
												description: "URL to compare with.",
											},
										},
										returns: 'integer',
										description: "Compares URL with another URL. Returns '0' when exactly the same URL. Returns '1' when same URL, but different anchor. Returns '-1' when different URL.",
								}
								//! END_REPLACE()
								, function compare(url) {
									root.DD_ASSERT && root.DD_ASSERT(types.isString(url) || (url instanceof files.Url), "Invalid url.");
									
									if (types.isString(url)) {
										url = files.Url.parse(url);
									};
									var result = (this.toString({anchor: null}) === url.toString({anchor: null}));
									return (result ? ((this.anchor === url.anchor) ? 0 : 1) : -1); // 0=same, 1=different anchor, -1=different
								}),
							
							combine: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 3,
										params: {
											url: {
												type: 'string,Url,Path',
												optional: false,
												description: "URL to combine with.",
											},
											options: {
												type: 'object',
												optional: true,
												description: "Options.",
											},
										},
										returns: 'Url',
										description: "Combines URL with another URL, then returns the result.",
								}
								//! END_REPLACE()
								, function combine(url, /*optional*/options) {
									root.DD_ASSERT && root.DD_ASSERT(types.isString(url) || types._instanceof(url, [files.Url, files.Path]), "Invalid url.");
									
									if (types.isString(url)) {
										url = files.Url.parse(url, options);
									};

									var dontThrow = types.get(options, 'dontThrow', false);
									
									var data = types.fill(__Internal__.urlOptionsKeys, {}, this);

									var thisPath = tools.trim(this.path, '');
									if (this.file) {
										thisPath.push(this.file);
									};
									
									var pathRoot = null;

									if (url instanceof files.Url) {
										if (url.isWindows && (!this.isWindows || (data.path[0] !== thisPath[0]))) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Drive mismatch.");
											};
										};
										var domain = types.get(options, 'domain', url.domain);
										if (domain) {
											data.user = types.get(options, 'user', url.user);
											data.password = types.get(options, 'password', url.password);
											data.domain = domain;
											data.port = types.get(options, 'port', url.port);
										};
										var anchor = types.get(options, 'anchor', url.anchor);
										if (anchor) {
											data.anchor = anchor;
										};
										var args = types.get(options, 'args', url.args);
										if (args) {
											data.args = this.args.combine(args, options);
										};
									} else { // if (url instanceof files.Path)
										if (url.root) {
											pathRoot = tools.trim(url.root, '');
										};
										if ((url.os === 'windows') && url.drive && (!this.isWindows || (url.drive !== thisPath[0]))) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Drive mismatch.");
											};
										};
									};

									data.dontThrow = dontThrow;
									
									var path = types.get(options, 'path', url.path);
									if (types.isString(path)) {
										path = path.split('/');
									};
									if (path) {
										path = tools.trim(path, '');
									};
									
									var isRelative = types.get(options, 'isRelative', url.isRelative);
									if (isRelative) {
										data.path = types.append([], thisPath, pathRoot, path);
									} else {
										data.path = types.append([], pathRoot, path);
									};
									data.file = types.get(options, 'file', url.file);
									data.extension = types.get(options, 'extension', url.extension);
									
									url = files.Url.parse(null, data);

									return url;
								}),
								
							moveUp: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: {
												count: {
													type: 'integer',
													optional: true,
													description: "Number of times to move up. Default is '1'.",
												},
											},
											returns: 'Url',
											description: "Moves up to parent folder the specified number of times and returns a new Url object.",
								}
								//! END_REPLACE()
								, function moveUp(/*optional*/count) {
									if (types.isNothing(count)) {
										count = 1;
									};
									var i = this.path.length - 1;
									while ((i >= 0) && (count > 0)) {
										var tmp = this.path[i];
										if (tmp === '.') {
										} else if (tmp === '..') {
											count++;
										} else {
											count--;
										};
										i--;
									};
									var path;
									if (count > 0) {
										path = [];
										if (this.isRelative) {
											while (count > 0) {
												path.push('..');
												count--;
											};
										};
									} else {
										path = this.path.slice(0, i + 1);
									};
									return files.Url.parse(null, types.fill(__Internal__.urlOptionsKeys, {}, this, {path: path}));
								}),
							
							pushFile: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 1,
											params: null,
											returns: 'Url',
											description: "Includes file in the path and returns a new Url object. Useful after parsing path strings not including file names which are known to miss the trailing directory separator (like environment variables). It might be a parse option in the future.",
								}
								//! END_REPLACE()
								, function pushFile() {
									if (this.file) {
										return files.Url.parse(null, types.fill(__Internal__.urlOptionsKeys, {}, this, {file: null, extension: null, path: types.append([], this.path, [this.file])}));
									} else {
										return files.Url.parse(this);
									};
								}),
								
							toArray: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'arrayof(string)',
											description: "Returns the path as an array.",
								}
								//! END_REPLACE()
								, function toArray() {
									var path = types.clone(this.path);
									if (!this.isRelative) {
										path.unshift('');
									};
									if (this.file) {
										path.push(this.file);
									} else {
										path.push('');
									};
									return path;
								}),
								
						}, __Internal__.urlOptions)
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