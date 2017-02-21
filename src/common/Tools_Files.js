//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Tools_Files.js - Files Tools
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
					
				//var __options__ = types.nullObject({
				//}, _options);

				//types.freezeObject(__options__);

				//files.ADD('getOptions', function() {
				//	return __options__;
				//});

				//===================================
				// Hooks
				//===================================

				_shared.urlArgumentsParser = function urlArgumentsParser(/*optional*/args, /*optional*/options) {
					if (!types._instanceof(args, files.UrlArguments)) {
						args = files.UrlArguments.parse(args, options);
					};
					return args;
				};
				
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
								revision: 1,
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
						
						var dontThrow = types.get(options, 'dontThrow', false),
							trailing = types.get(options, 'trailing', true);
						
						var isTrailing = function isTrailing(path) {
							var len = path.length;
							return (len > 1) && (path[len - 1] === '');
						};
						
						var rootTrailing = trailing && dirRoot && isTrailing(dirRoot),
							pathTrailing = trailing && isTrailing(path);
						
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
										} else {
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
						os: types.READ_ONLY( null ),		// '' = deactivate validation, 'windows', 'unix', 'linux'
						dirChar: types.READ_ONLY( '/' ),
						root: types.READ_ONLY( null ),   // null = auto-detect
						host: types.READ_ONLY( null ), // For Windows only. null = auto-detect
						drive: types.READ_ONLY( null ),  // For Windows only. null = auto-detect 
						path: types.READ_ONLY( null ),
						file: types.READ_ONLY( null ),   // null = auto-detect. when set, changes 'extension'.
						extension: types.READ_ONLY( null ), // when set, changes 'file'
						quote: types.READ_ONLY( null ),  // null = auto-detect
						isRelative: types.READ_ONLY( false ),
						noEscapes: types.READ_ONLY( false ),
						shell: types.READ_ONLY( null ),  // null = set to default, '' = deactivate validation, 'api' (default), 'dos', 'bash', 'sh'
						forceDrive: types.READ_ONLY( false ),
					};
				__Internal__.pathOptionsKeys = types.keys(__Internal__.pathOptions);
				
				files.ADD('Path', root.DD_DOC(
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
					, types.Type.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'Path',
							$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Path')), true) */,

							parse: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 5,
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
									
									// Flags
									var dontThrow = types.get(options, 'dontThrow', false),
										pathWasNothing = types.isNothing(path),
										pathWasPath = false;
									
									if (types._instanceof(path, files.Path)) {
										options = types.fill(__Internal__.pathOptionsKeys, {}, path, options);
										path = options.path;
										pathWasPath = true;
										
									} else if (types._instanceof(path, files.Url)) {
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
										forceDrive = types.get(options, 'forceDrive', false),  // Default is False
										host = types.get(options, 'host', null); // Default is Auto-detect

									path = types.get(options, 'path', path);
									
									var pathIsString = types.isString(path),
										fileWasNothing = types.isNothing(file),
										fileIsString = !fileWasNothing && types.isString(file),
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
									};
									
									// Detect quotes character
									if (types.isNothing(quote)) {
										quote = '';
										if (shell !== 'api') {
											var ref = (dirRootIsString ? dirRoot : (pathIsString ? path : ''));
											if (ref) {
												if ((os === 'unix') || (os === 'linux') || (os === 'windows')) {
													// Auto-detect
													if (path) {
														var tmp = ref[0];
														if (
															(tmp === '"') ||
															(((os === 'unix') || (os === 'linux')) && (tmp === "'"))
														) {
															quote = tmp;
															if (types.isNothing(shell)) {
																if (os === 'windows') {
																	shell = 'dos';
																} else if (os === 'unix') {
																	shell = 'sh';
																} else {
																	shell = 'bash';
																};
															};
														};
													};
												};
											};
										};
									};
									
									// Get default shell
									if (types.isNothing(shell)) {
										shell = 'api';
									};
									
									// If quoted, path and root must be quoted
									if (quote) {
										if (dirRoot && dirRootIsString && ((path.length < 2) || (dirRoot[0] !== quote) || (dirRoot[dirRoot.length - 1] !== quote))) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("'root' option must be quoted.");
											};
										};
										if (path && pathIsString && ((path.length < 2) || (path[0] !== quote) || (path[path.length - 1] !== quote))) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("'path' option must be quoted.");
											};
										};
									};
									
									// Trim quotes
									if (dirRootIsString && quote) {
										dirRoot = tools.trim(dirRoot, quote, 0, 1);
									};
									if (pathIsString && quote) {
										path = tools.trim(path, quote, 0, 1);
									};

									// Unescape and validate chars
									if (!noEscapes && shell && (shell !== 'api')) {
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
													throw new types.ParseError("Invalid char: '~0~'.", [state.invalid]);
												};
											};
										};
									};
										
									// Detect folder separator
									if (types.isNothing(dirChar)) {
										// Auto-set
										if (os === 'windows') {
											dirChar = '\\';
										} else {
											dirChar = '/';
										};
										if (shell === 'api') {
											dirChar = [dirChar, '/', '\\']; // NOTE: 'dirChar' is first and will get selected later (see bottom).
										};
									};
									
									// Replace alternate folder separators by the first one
									if (types.isArray(dirChar)) {
										var sep = dirChar[0];
										if (sep) {
											for (var i = 1; i < dirChar.length; i++) {
												var char = dirChar[i];
												if (char && (char !== sep)) {
													if (dirRootIsString) {
														dirRoot = tools.replace(dirRoot, char, sep, 'g');
													};
													if (pathIsString) {
														path = tools.replace(path, char, sep, 'g');
													};
													if (fileIsString) {
														file = tools.replace(file, char, sep, 'g');
													};
												};
											};
										};
										dirChar = sep;
									};
									
									// A folder separator is required
									if (!types.isStringAndNotEmpty(dirChar)) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid 'dirChar' option.");
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
									
									if (fileIsString) {
										file = file.split(dirChar);
									};
									if (!file || !file.length || ((file.length === 1) && !file[0])) {
										file = null;
									};

									// Get and validate host and drive
									if (os === 'windows') {
										// NOTE: "!isRelative" means 'null' or 'false'.
										if (!isRelative && types.isNothing(host) && types.isNothing(drive)) {
											if (path) {
												var hasHost = ((path.length >= 4) && !path[0] && !path[1]);
												var tmp = tools.trim(path, '', 1)[0];
												if (hasHost || (tmp && (tmp.length === 2) && (tmp[1] === ':'))) {
													if (dirRoot) {
														if (dontThrow) {
															return null;
														} else {
															throw new types.ParseError("'path' can't have a network path or a drive letter while 'root' is set.");
														};
													};
													if (hasHost) {
														host = path.splice(0, 3)[2];
														drive = path.shift();
													} else {
														drive = path.shift()[0];
													};
												};
											};
											if (dirRoot) {
												var hasHost = ((dirRoot.length >= 4) && !dirRoot[0] && !dirRoot[1]);
												var tmp = tools.trim(dirRoot, '', 1)[0];
												if (hasHost || (tmp && (tmp.length === 2) && (tmp[1] === ':'))) {
													if (hasHost) {
														host = dirRoot.splice(0, 3)[2];
														drive = dirRoot.shift();
													} else {
														drive = dirRoot.shift()[0];
													};
												};
											};
										};
									} else {
										if (host || drive) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("'host' and 'drive' options are invalid for non-Windows systems.");
											};
										};
									};
									
									// Relative or absolute ?
									if (types.isNothing(isRelative)) {
										// Auto-detect
										if (host || drive) {
											isRelative = false;
										} else if (dirRoot) {
											isRelative = (!!dirRoot[0] || !!(tools.findItems(dirRoot, ['.', '..']).length));
										} else if (path) {
											isRelative = (!!path[0] || !!(tools.findItems(path, ['.', '..']).length));
										} else {
											isRelative = true;
										};
									};
									
									if (os === 'windows') {
										if (host || drive) {
											if (isRelative) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Relative paths can't have a network path or a drive letter.");
												};
											};
											
											// Validate host
											if (host) {
												if (!drive) {
													if (dontThrow) {
														return null;
													} else {
														throw new types.ParseError("A network path must have a shared folder.");
													};
												};

												// Validate host
												// TODO: Complete validation
												host = host.toUpperCase();
												if (tools.indexOf(host, ':') >= 0) {
													if (dontThrow) {
														return null;
													} else {
														throw new types.ParseError("Invalid host name.");
													};
												};
											};

											// Validate drive letter
											drive = drive.toUpperCase();
											if (host) {
												// TODO: Validate shared folder
											} else {
												//var chr = unicode.codePointAt(drive, 0) || 0;
												var chr = drive.charCodeAt(0) || 0;
												if ((drive.length !== 1) || (chr < 65) || (chr > 90)) {
													if (dontThrow) {
														return null;
													} else {
														throw new types.ParseError("Invalid drive.");
													};
												};
											};
											
										} else if (!isRelative && forceDrive) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("A network path or drive letter is mandatory for the absolute path.");
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

									// NOTE: Only root can be relative
									if (isRelative && !dirRoot) {
										dirRoot = path;
										path = null;
									};

									// Resolve root
									if (dirRoot) {									
										if (isRelative) {
											// Remove empty names
											// NOTE: Only root can be relative.
											dirRoot = tools.filter(dirRoot, function(val, i) {
												return !!val;
											});
											if (!dirRoot.length) {
												dirRoot = null;
											};
										} else {
											// NOTE: Root must not traverse '/'
											var abs = __Internal__.relativeToAbsolute(dirRoot, [], {
												dirChar: dirChar,
												dontThrow: dontThrow,
												trailing: false,
											});
											if (!abs) {
												return null;
											};
											dirRoot = abs.path;
										};
									};

									// Resolve path
									if (path) {
										// NOTE: Path must not traverse root
										var abs = __Internal__.relativeToAbsolute(path, [], {
											dirChar: dirChar,
											dontThrow: dontThrow,
											trailing: false,
										});
										if (!abs) {
											return null;
										};
										path = abs.path;
									};

									// Resolve file
									if (file) {
										// File may traverse path but not root
										var abs = __Internal__.relativeToAbsolute(file, path || [], {
											dirChar: dirChar,
											dontThrow: dontThrow,
											trailing: false,
										});
										if (!abs) {
											return null;
										};
										path = abs.dirRoot;
										file = abs.path;
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
													
													// NOTE: DOS also trims dots on the end
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
													throw new types.ParseError("Invalid path or file name: '~0~.", [state.invalid]);
												};
											};
										};
									};
									
									if (file) {
										if (file.length <= 1) {
											file = file[0];
										} else  {
											var tmp = file[file.length - 1];
											path = types.append([], path, file.slice(0, file.length - 1));
											file = tmp;
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
										host: host || '',
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
								var attrs = types.fill(__Internal__.pathOptionsKeys, {}, options);
								if (types.hasDefinePropertyEnabled()) {
									_shared.setAttributes(this, attrs);
								} else {
									types.extend(this, attrs);
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
									var type = types.getType(this);
									return type.parse(null, newOptions);
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
									if (!types._instanceof(this, files.Path)) {
										return '';
									};

									// Flags
									var dontValidate = types.get(options, 'dontValidate', false);
									
									if (options) {
										options = types.nullObject(options);
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
											var type = types.getType(this);
											options = type.parse(this, options);
											if (!options) {
												// NOTE: Do not throw exceptions in "toString" because the javascript debugger doesn't like it
												//throw new files.PathError("Invalid path.");
												return '';
											};
										};
									} else {
										options = this;
									};
									
									
									var host = options.host,
										drive = options.drive,
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

									if (!options.isRelative || host.length || drive.length || hasRoot) {
										result = (options.dirChar + result);
									};
									
									if (host) {
										result = (options.dirChar + options.dirChar + host + options.dirChar + drive) + result;
									} else if (drive) {
										result = (drive + ':') + result;
									};

									if (options.quote) {
										result = (options.quote + result + options.quote);
									};
									
									return result;
								}),

							toApiString: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: {
												options: {
													type: 'object',
													optional: true,
													description: "Options",
												},
											},
											returns: 'string',
											description: "Converts to a string for the APIs.",
								}
								//! END_REPLACE()
								, function toApiString(/*optional*/options) {
									return this.toString(types.extend(options || {}, {os: null, dirChar: null, shell: 'api'}));
								}),
							
							combine: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 8,
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

									var type = types.getType(this);
									var dontThrow = types.get(options, 'dontThrow', false);
									
									if (types.isNothing(path) || types.isString(path)) {
										path = type.parse(path, options);
										options = null;
									};
									
									var thisRoot = tools.trim(this.root || [], '');
									
									var thisPath = tools.trim(this.path || [], '');
									var thisFile = this.file;

									var dirRoot = types.get(options, 'root');
									if (types.isString(dirRoot)) {
										dirRoot = dirRoot.split(data.dirChar);
									};
									if (dirRoot) {
										dirRoot = tools.trim(dirRoot, '');
									};
										
									var dir = types.get(options, 'path', path.path);
									if (types.isString(dir)) {
										dir = dir.split(data.dirChar);
									};
									if (dir) {
										dir = tools.trim(dir, '');
									};

									var data = types.fill(__Internal__.pathOptionsKeys, {}, this);

									if (types._instanceof(path, files.Path)) {
										var drive = types.get(options, 'drive', path.drive);
										var host = types.get(options, 'host', path.host);
										if ((path.os === 'windows') && (host || drive) && ((this.os !== 'windows') || (host !== this.host) || (drive !== this.drive))) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Drive mismatch.");
											};
										};
										if (!dirRoot) {
											dirRoot = path.root;
										};
									} else { //if (types._instanceof(path, files.Url))
										if (path.protocol && (path.protocol !== 'file')) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Bad url protocol.");
											};
										};
										if (path.isWindows) {
											if (dir.length && ((this.os !== 'windows') || this.host || (dir[0][0] !== this.drive))) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Drive mismatch.");
												};
											};
											dir.shift();
										};
										if (!dirRoot) {
											dirRoot = dir;
											dir = null;
										};
									};
									
									data.dontThrow = dontThrow;

									if (types.isString(dirRoot)) {
										dirRoot = dirRoot.split(data.dirChar);
									};
									if (dirRoot) {
										dirRoot = tools.trim(dirRoot, '');
									};

									if (thisFile && ((dirRoot && dirRoot.length) || (dir && dir.length) || path.file)) {
										thisPath.push(thisFile);
										thisFile = null;
									};

									data.root = types.append([], thisRoot, thisPath);
									data.path = types.append([], dirRoot, dir);
									
									data.file = types.get(options, 'file', path.file || thisFile);
									data.extension = types.get(options, 'extension', path.extension);

									path = type.parse(null, data);

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
									var type = types.getType(this);
									return type.parse(null, types.fill(__Internal__.pathOptionsKeys, {}, this, {path: path}));
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
									var type = types.getType(this);
									if (this.file) {
										return type.parse(null, types.fill(__Internal__.pathOptionsKeys, {}, this, {file: null, extension: null, path: types.append([], this.path, [this.file])}));
									} else {
										return type.parse(this);
									};
								}),
							
							toArray: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 2,
											params: {
												options: {
													type: 'object',
													optional: true,
													description: "Options.",
												},
											},
											returns: 'arrayof(string)',
											description: "Returns the path as an array.",
								}
								//! END_REPLACE()
								, function toArray(/*optional*/options) {
									var isRelative = types.get(options, 'isRelative', this.isRelative),
										dirChar = types.get(options, 'dirChar', this.dirChar),
										host = types.get(options, 'host', this.host),
										drive = types.get(options, 'drive', this.drive),
										root = types.get(options, 'root', this.root),
										path = types.get(options, 'path', this.path),
										file = types.get(options, 'file', this.file),
										pathOnly = types.get(options, 'pathOnly', false),
										trim = types.get(options, 'trim', false);
									if (pathOnly) {
										host = null; 
										drive = null;
										root = null;
									};
									if (types.isString(root)) {
										root = root.split(dirChar);
									};
									if (types.isArray(root)) {
										root = tools.trim(root, '');
									} else {
										root = null;
									};
									if (types.isString(path)) {
										path = path.split(dirChar);
									};
									if (types.isArray(path)) {
										path = tools.trim(path, '');
									} else {
										path = null;
									};
									var newPath = types.append([], root, path);
									if (!isRelative) {
										if (host && drive) {
											if (trim) {
												newPath.unshift(host, drive);
											} else {
												newPath.unshift('', '', host, drive);
											};
										} else if (!host && drive) {
											newPath.unshift(drive + ':');
										} else if (!trim) {
											newPath.unshift('');
										};
									};
									if (file) {
										newPath.push(file);
									} else if (!trim) {
										newPath.push('');
									};
									return newPath;
								}),
								
							relative: function relative(to, /*optional*/options) {
								if (this.isRelative) {
									throw new types.ParseError("'this' must be an absolute path.");
								};

								var type = types.getType(this);
								
								if (!types._instanceof(to, files.Path)) {
									to = type.parse(to, options);
								};
								if (to.isRelative) {
									throw new types.ParseError("'to' must be an absolute path.");
								};
								
								if ((this.os === 'windows') && (to.os !== 'windows')) {
									throw new types.ParseError("Incompatible OSes.");
								};
								
								if ((this.os === 'windows') && ((this.host !== to.host) || (this.drive !== to.drive))) {
									throw new types.ParseError("'this' and 'to' must be from the same network share or the same drive.");
								};
								
								var os = tools.getOS(),
									caseSensitive = types.get(options, 'caseSensitive', os.caseSensitive);

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
								
								return type.parse(pathAr, types.fill(__Internal__.pathOptions, {}, this, {isRelative: true}));
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

				files.ADD('UrlArguments', root.DD_DOC(
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
					, types.Type.$inherit( 
						/*typeProto*/
						{
							$TYPE_NAME: 'UrlArguments',
							$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('UrlArguments')), true) */,

							parse: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 2,
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
												if (types.isPrimitive(value)) {
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
												};
												return result;
											}, []);
										};
									};
									
									return new this(args, options);
								}),
						},
						/*instanceProto*/
						{
							options: types.READ_ONLY( null ),
							__args: types.READ_ONLY( null ),
							
							_new: types.SUPER(function(args, /*optional*/options) {
								this._super();
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isNothing(args) || types.isArray(args), "Invalid arguments array.");
								};

								_shared.setAttribute(this, 'options', options, {});
								_shared.setAttribute(this, '__args', args, {});
							}),
							
							__toDataObject: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: null,
										returns: 'array',
										description: "INTERNAL",
								}
								//! END_REPLACE()
								, function __toDataObject() {
									return tools.reduce(this.__args, function(result, arg) {
										if (arg.name) {
											if (arg.name in result) {
												var item = result[arg.name];
												if (types.isArray(item)) {
													item.push(arg.value);
												} else {
													result[arg.name] = [item, arg.value];
												};
											} else {
												result[arg.name] = arg.value;
											};
										};
										return result;
									}, types.nullObject())
								}),

							toDataObject: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 0,
										params: null,
										returns: 'array',
										description: "Converts to a normal Javascript object.",
								}
								//! END_REPLACE()
								, function toDataObject() {
									const type = types.getType(this);

									const obj = this.__toDataObject();

									obj.toUrlArguments = function toUrlArguments() {
										return type.parse(null, this);
									};

									obj.toString = function toString() {
										return this.toUrlArguments().toString();
									};

									return obj;
								}),

							toArray: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 2,
										params: null,
										returns: 'array',
										description: "Return arguments in an array of name-value pairs.",
								}
								//! END_REPLACE()
								, function toArray() {
									return types.entries(this.__toDataObject());
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
										revision: 2,
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
									var type = types.getType(this);
									return new type(args, types.clone(this.options));
								}),
							
							remove: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 3,
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
									var type = types.getType(this);
									return new type(args, types.clone(this.options));
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
										root.DD_ASSERT((types.isString(args)) || types._instanceof(args, files.UrlArguments) || (types.isJsObject(args)), "Invalid arguments.");
									};
									options = types.extend({}, this.options, options);
									var mode = types.get(options, 'argsMode', 'merge');
									if (types.isString(args) || types.isJsObject(args)) {
										var type = types.getType(this);
										args = type.parse(args, options);
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
									var type = types.getType(this);
									return new type(args, options);						
								}),
						}
					)));

				__Internal__.urlData = {
					protocol: types.READ_ONLY( null ),
					user: types.READ_ONLY( null ),
					password: types.READ_ONLY( null ),
					domain: types.READ_ONLY( null ),
					port: types.READ_ONLY( null ),
					path: types.READ_ONLY( null ),
					file: types.READ_ONLY( null ),   // when set, changes 'extension'.
					args: types.READ_ONLY( null ),
					anchor: types.READ_ONLY( null ),
				};
				__Internal__.urlDataKeys = types.keys(__Internal__.urlData);
					
				__Internal__.urlOptions = {
					extension: types.READ_ONLY( null ), // when set, changes 'file'
					isRelative: types.READ_ONLY( false ),
					noEscapes: types.READ_ONLY( false ),
					isWindows: types.READ_ONLY( false ),
				};
				__Internal__.urlOptionsKeys = types.keys(__Internal__.urlOptions);

				__Internal__.urlAllKeys = types.append([], __Internal__.urlDataKeys, __Internal__.urlOptionsKeys);

				files.ADD('Url', root.DD_DOC(
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
					, types.Type.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'Url',
							$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Url')), true) */,

							parse: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 6,
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
										
									} else if (types._instanceof(url, files.Url)) {
										var args = types.get(options, 'args', null);
										
										options = types.fill(__Internal__.urlAllKeys, {}, url, options);
										
										if (types.isJsObject(args)) {
											options.args = url.args.combine(args, options);
										};
										
										url = null;
										
									} else if (types._instanceof(url, files.Path)) {
										var pathTmp = url.path,
											isWindows = (url.os === 'windows');
										
										if (isWindows) {
											pathTmp = types.append([], [url.drive + ':'], pathTmp)
										};
										
										options = types.fill(__Internal__.urlAllKeys, {
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
										if (/^[A-Za-z+]+\:\/\//.test(url)) {
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
									
									if (types._instanceof(args, files.UrlArguments)) {
										args = (args.toString({noEscapes: noEscapes}) || null);
									};
									if (types.isNothing(args) || types.isString(args) || types.isJsObject(args)) {
										args = _shared.urlArgumentsParser(args, {
											noEscapes: noEscapes,
										});
									};
									if (!types._instanceof(args, files.UrlArguments)) {
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
												throw new types.ParseError("Invalid path or file name: ~0~.", [state.invalid]);
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
								}),
						},
						/*instanceProto*/
						types.extend({
							_new: types.SUPER(function _new(options) {
								this._super();
								var attrs = types.fill(__Internal__.urlAllKeys, {}, options);
								if (types.hasDefinePropertyEnabled()) {
									_shared.setAttributes(this, attrs);
								} else {
									types.extend(this, attrs);
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
									var newOptions = types.fill(__Internal__.urlAllKeys, {}, this);
									delete newOptions.extension;
									newOptions = types.fill(__Internal__.urlAllKeys, newOptions, options);
									var type = types.getType(this);
									return type.parse(null, newOptions);
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
											args: _shared.urlArgumentsParser(),
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
									if (!types._instanceof(this, files.Url)) {
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
											var type = types.getType(this);
											options = type.parse(this, options);
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
									root.DD_ASSERT && root.DD_ASSERT(types.isString(url) || types._instanceof(url, files.Url), "Invalid url.");
									
									if (types.isString(url)) {
										var type = types.getType(this);
										url = type.parse(url);
									};
									var result = (this.toString({anchor: null}) === url.toString({anchor: null}));
									return (result ? ((this.anchor === url.anchor) ? 0 : 1) : -1); // 0=same, 1=different anchor, -1=different
								}),
							
							combine: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
										author: "Claude Petit",
										revision: 4,
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
									
									var type = types.getType(this);

									if (types.isString(url)) {
										url = type.parse(url, options);
									};

									var dontThrow = types.get(options, 'dontThrow', false);
									
									var data = types.fill(__Internal__.urlAllKeys, {}, this);

									var thisPath = tools.trim(this.path, '');
									if (this.file) {
										thisPath.push(this.file);
									};
									
									var pathRoot = null;

									if (types._instanceof(url, files.Url)) {
										if (url.isWindows && (!this.isWindows || (data.path[0] !== thisPath[0]))) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Drive mismatch.");
											};
										};
										var domain = types.get(options, 'domain', url.domain);
										if (domain) {
											data.protocol = types.get(options, 'protocol', url.protocol);
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
									} else { // if (types._instanceof(url, files.Path))
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
									
									return type.parse(null, data);
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
									var type = types.getType(this);
									return type.parse(null, types.fill(__Internal__.urlAllKeys, {}, this, {path: path}));
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
									var type = types.getType(this);
									if (this.file) {
										return type.parse(null, types.fill(__Internal__.urlAllKeys, {}, this, {file: null, extension: null, path: types.append([], this.path, [this.file])}));
									} else {
										return type.parse(this);
									};
								}),
								
							toArray: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 3,
											params: {
												options: {
													type: 'object',
													optional: true,
													description: "Options.",
												},
											},
											returns: 'arrayof(string)',
											description: "Returns the URL as an array.",
								}
								//! END_REPLACE()
								, function toArray(/*optional*/options) {
									var path = types.get(options, 'path', this.path),
										isRelative = types.get(options, 'isRelative', this.isRelative),
										protocol = types.get(options, 'protocol', this.protocol),
										domain = types.get(options, 'domain', this.domain),
										user = types.get(options, 'user', this.user),
										password = types.get(options, 'password', this.password),
										port = types.get(options, 'port', this.port),
										args = types.get(options, 'args', this.args),
										anchor = types.get(options, 'anchor', this.anchor),
										file = types.get(options, 'file', this.file),
										pathOnly = types.get(options, 'pathOnly', false),
										trim = types.get(options, 'trim', false);
									if (pathOnly) {
										protocol = null;
										domain = null;
										user = null;
										password = null;
										port = null;
										args = null;
										anchor = null;
									};
									if (types.isString(path)) {
										path = tools.split('/');
									} else if (types.isArray(path)) {
										path = types.clone(path);
									};
									if (!types.isArray(path)) {
										// TODO: Should we throw ?
										path = [];
									};
									path = tools.trim(path, '');
									if (types.isString(args)) {
										path = _shared.urlArgumentsParser(args);
									};
									if (!types._instanceof(args, files.UrlArguments)) {
										// TODO: Should we throw ?
										args = null;
									};
									var hasPath = !!path.length;
									if (isRelative) {
										if (hasPath && !trim) {
											path.unshift('');
										};
									} else {
										if (types.isNothing(domain)) {
											if (!trim) {
												path.unshift('');
											};
										} else {
											if (!types.isNothing(user) || !types.isNothing(password)) {
												path.unshift((types.isNothing(user) ? '' : user) + (types.isNothing(password) ? '' : ':' + password) + '@' + domain + (types.isNothing(port) ? '' : ':' + port));
											} else {
												path.unshift(domain + (types.isNothing(port) ? '' : ':' + port));
											};
											if (protocol) {
												path.unshift(protocol + ':', '', '');
											};
										};
									};

									var argsAndAnchor = (!args || types.isNothing(args.__args) ? '' : '?' + args.toString()) + (types.isNothing(anchor) ? '' : '#' + anchor);
									if (file) {
										if (!hasPath && isRelative && !trim) {
											path.push('');
										};
										path.push(file + argsAndAnchor);
									} else if (argsAndAnchor) {
										path.push(argsAndAnchor);
									};

									return path;
								}),
								
							getPath: root.DD_DOC(
								//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
											author: "Claude Petit",
											revision: 0,
											params: null,
											returns: 'Url',
											description: "Returns the path as an Url without dommain.",
								}
								//! END_REPLACE()
								, function getPath() {
									return this.set({
										protocol: null,
										domain: null,
										user: null,
										password: null,
										port: null,
									});
								}),
								
							toDataObject: root.DD_DOC(
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
										returns: 'UrlArguments',
										description: "Converts the URL to a normal Javascript object.",
								}
								//! END_REPLACE()
								, function toDataObject(/*optional*/options) {
									const obj = types.nullObject();

									types.fill(__Internal__.urlDataKeys, obj, this, options);

									if (types.isNothing(obj.domain)) {
										obj.protocol = null;
										obj.user = null;
										obj.password = null;
										obj.port = null;
									};

									if (types.isNothing(obj.args)) {
										obj.args = types.nullObject();
									} else {
										if (!types._instanceof(obj.args, files.UrlArguments)) {
											obj.args = _shared.urlArgumentsParser(obj.args);
										};
										obj.args = obj.args.toDataObject();
									};

									const type = types.getType(this);

									obj.toUrl = function toUrl(/*optional*/options) {
										if (options) {
											return type.parse(null, types.extend({}, this, options));
										} else {
											return type.parse(null, this);
										};
									};

									obj.toString = function toString(/*optional*/options) {
										return this.toUrl(options).toString()
									};

									return obj;
								}),

						}, __Internal__.urlData, __Internal__.urlOptions)
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