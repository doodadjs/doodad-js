//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Tools_Files.js - Files Tools
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

exports.add = function add(modules) {
	modules = (modules || {});
	modules['Doodad.Tools.Files'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Types',
			'Doodad.Tools',
			'Doodad',
		],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools,
				files = tools.Files;

			//===================================
			// Internal
			//===================================

			// <FUTURE> Thread context
			const __Internal__ = {
			};


			//===================================
			// Options
			//===================================

			//const __options__ = tools.nullObject({
			//}, _options);

			//types.freezeObject(__options__);

			//files.ADD('getOptions', function getOptions() {
			//	return __options__;
			//});

			//===================================
			// Hooks
			//===================================

			_shared.urlArgumentsParser = function urlArgumentsParser(/*optional*/args, /*optional*/options) {
				if (/* !types.isNothing(args) &&*/ !types._instanceof(args, files.UrlArguments)) {
					args = files.UrlArguments.parse(args, options);
				};
				return args;
			};

			_shared.urlParser = function urlParser(url, /*optional*/options) {
				if (!types.isNothing(url)) {
					if (!types._instanceof(url, files.Url)) {
						//options = tools.extend({
						//}, options);
						url = files.Url.parse(url, options);
					};
					if (types.get(options, 'noEscapes', false)) {
						return url.set({
							noEscapes: false,
						});
					};
				};
				return url;
			};

			_shared.pathParser = function pathParser(path, /*optional*/options) {
				if (!types.isNothing(path)) {
					if (!types._instanceof(path, files.Path)) {
						if (types.get(options, 'isRelative', false)) {
							options = tools.extend({
								os: 'linux',
								dirChar: '/',
							}, options);
						};

						path = files.Path.parse(path, options);
					};
					if (types.get(options, 'os', null) || types.get(options, 'dirChar', null) || types.get(options, 'noEscapes', false)) {
						return path.set({
							os: null, // switch to default
							dirChar: null, // switch to default
							noEscapes: false, // switch to default
						});
					};
				};
				return path;
			};

			__Internal__.detectUrlRegexp = /^[a-zA-Z]+:\/\//;

			files.ADD('parseUrl', function parseUrl(url, /*optional*/options) {
				return _shared.urlParser(url, options);
			});

			files.ADD('parsePath', function parsePath(path, /*optional*/options) {
				return _shared.pathParser(path, options);
			});

			files.ADD('parseLocation', function parseLocation(location, /*optional*/options) {
				if (types.isNothing(location)) {
					return location;
				} else if (types.isString(location)) {
					if (__Internal__.detectUrlRegexp.test(location)) {
						return _shared.urlParser(location, options);
					} else {
						return _shared.pathParser(location, options);
					}
				} else if (types._instanceof(location, [files.Path, files.Url])) {
					return location;
				} else {
					throw new types.ValueError("Invalid file location object.");
				}
			});

			//===================================
			// Native functions
			//===================================

			tools.complete(_shared.Natives, {
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
				, types.Error.$inherit(
					{
						$TYPE_NAME: 'PathError',
						$TYPE_UUID: /*! REPLACE_BY(TO_SOURCE(UUID('PathError')), true) */ null /*! END_REPLACE() */,

						[types.Constructor](message, /*optional*/params) {
							return [message || 'Path error.', params];
						}
					})));

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

					const dirChar = types.get(options, 'dirChar', '/');

					if (types.isString(dirRoot)) {
						dirRoot = dirRoot.split(dirChar);
					};

					if (types.isString(path)) {
						path = path.split(dirChar);
					};

					const dontThrow = types.get(options, 'dontThrow', false),
						trailing = types.get(options, 'trailing', true);

					const isTrailing = function isTrailing(path) {
						const len = path.length;
						return (len > 1) && (path[len - 1] === '');
					};

					const rootTrailing = trailing && dirRoot && isTrailing(dirRoot),
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
					let pos = 0;
					while (pos < path.length) {
						const name = path[pos];   // NOTE: Don't trim because trailing spaces may be accepted by the OS and the file system. Paths must be parsed and validated before calling this function.
						let count = 0;
						if (name === '.') {
							count = 1;
						} else if (name === '..') {
							count = 2;
						};
						if (count) {
							let tmp = null;
							if (pos <= 0) {
								if (dirRoot && (count > 1)) {
									if (dirRoot.length) {
										tmp = dirRoot.pop();
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
										}
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
								}
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

			__Internal__.unixShellSpecialCharacters = ' <>|?*"\'&`#;~!-()\\[\\]{}\\\\';

			// group 1 = chars to unescape, group 2 = invalid chars
			__Internal__.parsePathUnixUnescapeShellReservedCharsRegEx = new _shared.Natives.windowRegExp('\\\\(.)|([' + __Internal__.unixShellSpecialCharacters + ']|[\\b]|\\f|\\n|\\r|\\t|\\v)', 'gm');      // <FUTURE> thread level

			// group 1 = chars to escape
			__Internal__.parsePathUnixEscapeShellReservedCharsRegEx = new _shared.Natives.windowRegExp('([' + __Internal__.unixShellSpecialCharacters + '])', 'gm');     // <FUTURE> thread level

			//__Internal__.parsePathUnixInvalidNamesRegEx = /^()$/i;    // <FUTURE> thread level

			__Internal__.pathData = {
				drive: types.READ_ONLY( null ),  // For Windows only. null = auto-detect
				host: types.READ_ONLY( null ), // For Windows only. null = auto-detect
				root: types.READ_ONLY( null ),   // null = auto-detect
				path: types.READ_ONLY( null ),
				file: types.READ_ONLY( null ),   // null = auto-detect. when set, changes 'extension'.
				isNull: types.READ_ONLY( false ), // Read-only
			};
			__Internal__.pathDataKeys = types.keys(__Internal__.pathData);

			__Internal__.pathOptions = {
				os: types.READ_ONLY( null ),		// '' = deactivate validation, 'windows', 'unix', 'linux'
				dirChar: types.READ_ONLY( '/' ),
				extension: types.READ_ONLY( null ), // when set, changes 'file'
				quote: types.READ_ONLY( null ),  // null = auto-detect
				isRelative: types.READ_ONLY( false ),
				noEscapes: types.READ_ONLY( false ),
				shell: types.READ_ONLY( null ),  // null = set to default, '' = deactivate validation, 'api' (default), 'dos', 'bash', 'sh'
				forceDrive: types.READ_ONLY( false ),
				allowTraverse: types.READ_ONLY( false ),
			};
			__Internal__.pathOptionsKeys = types.keys(__Internal__.pathOptions);

			__Internal__.pathNonStoredKeys = ['dontThrow'];

			__Internal__.pathAllKeys = tools.append([], __Internal__.pathDataKeys, __Internal__.pathOptionsKeys);
			__Internal__.pathAllKeysAndNonStoredKeys = tools.append([], __Internal__.pathAllKeys, __Internal__.pathNonStoredKeys);

			// NOTE: To prevent using "delete"
			__Internal__.pathSetExcludedKeys = ['extension'];
			__Internal__.pathAllKeysForSet = tools.filter(__Internal__.pathAllKeys, function(key) {
				return (tools.indexOf(__Internal__.pathSetExcludedKeys, key) < 0);
			});

			files.REGISTER(root.DD_DOC(
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
									revision: 8,
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
								const dontThrow = types.get(options, 'dontThrow', false);

								if (types._instanceof(path, files.Path)) {
									const data = tools.fill(__Internal__.pathAllKeys, {}, path);
									options = tools.fill(__Internal__.pathAllKeysAndNonStoredKeys, data, {extension: null}, options);
									path = null;

								} else if (types._instanceof(path, files.Url)) {
									const proto = types.get(options, 'protocol', path.protocol);
									if (proto && (proto !== 'file')) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Bad url protocol.");
										}
									};

									const pathTmp = tools.trim(types.clone(path.path) || [], '', 1, 1);

									if (path.isWindows) {
										options = tools.fill(__Internal__.pathAllKeysAndNonStoredKeys, {
											os: 'windows',
											drive: pathTmp.shift()[0],
											file: path.file,
											extension: null,
										}, options);
									} else {
										options = tools.fill(__Internal__.pathAllKeysAndNonStoredKeys, {
											os: 'linux',
											file: path.file,
											extension: null,
										}, options);
									};

									path = null;

								} else if (types.isArray(path)) {
									path = types.clone(path);

								} else if (!types.isNothing(path) && !types.isString(path)) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("Invalid path.");
									}
								};

								// Options
								let os = types.get(options, 'os', null),  // Default is Auto-set
									dirChar = types.get(options, 'dirChar', null),  // Default is Auto-set
									isRelative = types.get(options, 'isRelative', null), // Default is Auto-detect
									shell = types.get(options, 'shell', null), // Default is Auto-set
									quote = types.get(options, 'quote', null),  // Default is Auto-detect
									dirRoot = types.get(options, 'root', null),  // Default is no root
									drive = types.get(options, 'drive', null),  // Default is Auto-detect
									file = types.get(options, 'file', null),  // Default is Auto-detect
									extension = types.get(options, 'extension', null), // Default is "file" 's extension
									host = types.get(options, 'host', null); // Default is Auto-detect

								const noEscapes = types.get(options, 'noEscapes', false), // Default is False
									forceDrive = types.get(options, 'forceDrive', false),  // Default is False
									allowTraverse = types.get(options, 'allowTraverse', false);  // Default is False

								path = types.get(options, 'path', path);

								const pathIsString = types.isString(path),
									fileIsString = types.isString(file),
									dirRootIsString = types.isString(dirRoot);

								if (!dirRootIsString && !types.isNothing(dirRoot) && !types.isArray(dirRoot)) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("Invalid root.");
									}
								};

								if (types.isNothing(os)) {
									// Auto-set
									const osInfo = tools.getOS();
									os = osInfo.type;
								};

								// Detect quotes character
								if (types.isNothing(quote)) {
									quote = '';
									if (shell !== 'api') {
										const ref = (dirRootIsString ? dirRoot : (pathIsString ? path : ''));
										if (ref) {
											if ((os === 'unix') || (os === 'linux') || (os === 'windows')) {
												// Auto-detect
												if (path) {
													const tmp = ref[0];
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
										}
									};
									if (path && pathIsString && ((path.length < 2) || (path[0] !== quote) || (path[path.length - 1] !== quote))) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("'path' option must be quoted.");
										}
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
									const state = {
										invalid: null,
									};

									let unescapePath = null;

									if (shell === 'dos') {
										unescapePath = function unescapePathDos(path) {
											return tools.replace(path, __Internal__.parsePathWindowsUnescapeShellReservedCharsRegEx, function(matched, g1, g2, pos, str) {
												if (g1) {
													// Unescape
													if (quote) {
														// Don't unescape when quoted
														return '^' + g1;
													} else {
														return g1;
													}
												} else if (g2) {
													// Invalid characters
													if (!quote || (g2 === quote)) {
														state.invalid = g2;
													} else {
														// Allow when quoted
														return g2;
													};
												};
												return undefined; // "consistent-return"
											});
										};
									} else if (shell === 'bash') {
										unescapePath = function unescapePathBash(path) {
											return tools.replace(path, __Internal__.parsePathUnixUnescapeShellReservedCharsRegEx, function(matched, g1, g2, pos, str) {
												if (g1) {
													// Unescape
													if (quote) {
														// Don't unescape when quoted
														return '\\' + g1;
													} else {
														return g1;
													}
												} else if (g2) {
													// Invalid characters
													if (!quote || (g2 === quote)) {
														state.invalid = g2;
													} else {
														// Allow when quoted
														return g2;
													}
												};
												return undefined; // "consistent-return"
											});
										};
									};

									if (unescapePath) {
										const unescapePathArray = function unescapePathArray(path) {
											for (let i = 0; i < path.length; i++) {
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
											}
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
									const sep = dirChar[0];
									if (sep) {
										for (let i = 1; i < dirChar.length; i++) {
											const char = dirChar[i];
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
									}
								};

								// Split paths
								if (dirRootIsString) {
									if (dirRoot) {
										dirRoot = dirRoot.split(dirChar);
									};
								} else if (types.isArray(dirRoot)) {
									dirRoot = tools.append([], dirRoot);
								};

								if (pathIsString) {
									if (path) {
										path = path.split(dirChar);
									};
								} else if (types.isArray(path)) {
									path = tools.append([], path);
								};

								if (fileIsString) {
									file = file.split(dirChar);
								} else if (types.isArray(file)) {
									file = tools.append([], file);
								};

								// Get and validate host and drive
								if (os === 'windows') {
									// NOTE: "!isRelative" means 'null' or 'false'.
									if (!isRelative && types.isNothing(host) && types.isNothing(drive)) {
										if (path) {
											const hasHost = ((path.length >= 4) && !path[0] && !path[1]);
											const tmp = tools.trim(path, '', 1)[0];
											if (hasHost || (tmp && (tmp.length === 2) && (tmp[1] === ':'))) {
												if (dirRoot) {
													if (dontThrow) {
														return null;
													} else {
														throw new types.ParseError("'path' can't have a network path or a drive letter while 'root' is set.");
													}
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
											const hasHost = ((dirRoot.length >= 4) && !dirRoot[0] && !dirRoot[1]);
											const tmp = tools.trim(dirRoot, '', 1)[0];
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
										}
									};
								};

								if (os === 'windows') {
									if (host || drive) {
										isRelative = false;
										if (!dirRoot || !dirRoot.length || (dirRoot[0] !== '')) {
											dirRoot = tools.append([''], dirRoot);
										};

										// Validate host
										if (host) {
											if (!drive) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("A network path must have a shared folder.");
												}
											};

											// Validate host
											// TODO: Complete validation
											host = host.toUpperCase();
											if (tools.indexOf(host, ':') >= 0) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Invalid host name.");
												}
											};
										};

										// Validate drive letter
										drive = drive.toUpperCase();
										if (host) {
											// TODO: Validate shared folder
										} else {
											//const chr = unicode.codePointAt(drive, 0) || 0;
											const chr = drive.charCodeAt(0) || 0;
											if ((drive.length !== 1) || (chr < 65) || (chr > 90)) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Invalid drive.");
												}
											};
										};

									} else if (!isRelative && forceDrive) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("A network path or drive letter is mandatory for the absolute path.");
										}
									};
								};

								let trailingSlash = false;

								if (types.isNothing(file) && path && path.length) {
									// Auto-detect
									const tmp = path[path.length - 1];
									if ((tmp === '') || (tmp === '.') || (tmp === '..')) {
										file = [];
										trailingSlash = true;
									} else {
										path.pop();
										file = [tmp];
									};
								} else if (file && file.length) {
									const tmp = file[file.length - 1];
									if ((tmp === '') || (tmp === '.') || (tmp === '..')) {
										trailingSlash = true;
									};
								} else if (path && path.length) {
									file = [];
									trailingSlash = true;
								};

								if (types.isNothing(isRelative)) {
									// Auto-detect
									isRelative = ((!dirRoot || !dirRoot.length || !!dirRoot[0].length) && (!path || !path.length || !!path[0].length));
								};

								if (path) {
									path = tools.trim(path, '');
								};

								if (file) {
									file = tools.trim(file, '');
								};

								if (!isRelative) {
									// Resolve file
									if (file) {
										// File can traverse path but not root.
										const abs = __Internal__.relativeToAbsolute(file, path || [], {
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

									// Resolve path
									if (path) {
										if (allowTraverse) {
											// Path can traverse root
											const abs = __Internal__.relativeToAbsolute(path, dirRoot || [], {
												dirChar: dirChar,
												dontThrow: dontThrow,
												trailing: false,
											});
											if (!abs) {
												return null;
											};
											dirRoot = abs.dirRoot;
											path = abs.path;
										} else {
											// Path must not traverse root
											const abs = __Internal__.relativeToAbsolute(path, [], {
												dirChar: dirChar,
												dontThrow: dontThrow,
												trailing: false,
											});
											if (!abs) {
												return null;
											};
											path = abs.path;
										};
									};
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
										const abs = __Internal__.relativeToAbsolute(dirRoot, [], {
											dirChar: dirChar,
											dontThrow: dontThrow,
											trailing: false,
										});
										if (!abs) {
											return null;
										};
										dirRoot = (abs.path.length ? abs.path : null);
									};
								};

								// Validate file names
								if (shell) {
									const state = {
										invalid: null,
									};

									let validatePath = null;

									if (shell === 'dos') {
										validatePath = function validatePathDos(pathArray) {
											tools.forEach(pathArray, function(item, pos, items) {
												// NOTE: DOS trims spaces at the end of path and file names but keeps them at the beginning
												let tmp = tools.trim(item, ' ', -1);

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
											validatePath = function validatePathApi(pathArray) {
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
									//	validatePath = function validatePathNix(pathArray) {
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
											}
										};
									};
								};

								if (file) {
									if (trailingSlash || !file.length) {
										file = '';
									} else if (file.length === 1) {
										file = file[0];
									} else {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid file name.");
										}
									};
								} else {
									file = null;
								};

								if (types.isNothing(file)) {
									extension = null;
								} else {
									const pos = file.indexOf('.');
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
								};


								return new this({
									os: os,
									dirChar: dirChar,
									host: host || null,
									drive: drive || null,
									root: dirRoot && types.freezeObject(dirRoot) || null,
									path: types.freezeObject(path || []),
									file: file,
									extension: extension,
									quote: quote || null,
									isRelative: isRelative,
									noEscapes: noEscapes,
									shell: shell,
									forceDrive: forceDrive,
									isNull: !host && !drive && (!root || !root.length) && (!path || !path.length) && !file,
								});
							}),

						fromJSON: function fromJSON(value) {
							return this.parse(null, value);
						},

					},
					/*instanceProto*/
					tools.extend({
						_new: types.SUPER(function _new(options) {
							this._super();
							const attrs = tools.fill(__Internal__.pathAllKeys, {}, options);
							if (types.hasDefinePropertyEnabled()) {
								types.setAttributes(this, attrs);
							} else {
								tools.extend(this, attrs);
							};
						}),

						set: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 3,
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
								let newOptions = tools.fill(__Internal__.pathAllKeysForSet, {}, this);
								//delete newOptions.extension;
								newOptions = tools.fill(__Internal__.pathAllKeysAndNonStoredKeys, newOptions, options);
								const type = types.getType(this);
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
								const dontValidate = types.get(options, 'dontValidate', false);

								if (options) {
									options = tools.nullObject(options);
									if (types.has(options, 'os')) {
										if (!types.has(options, 'dirChar')) {
											options.dirChar = null;
										};
									};

									if (dontValidate) {
										options = tools.extend({}, this, options);
									} else {
										// Validate
										// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
										if (!types.has(options, 'dontThrow')) {
											options.dontThrow = true;  // "parse" will returns null when invalid
										};
										const type = types.getType(this);
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


								let dirRoot = options.root,
									path = options.path;

								const host = options.host,
									drive = options.drive,
									file = options.file,
									hasRoot = path.length && !path[0].length;

								if (dirRoot) {
									dirRoot = tools.trim(dirRoot, '');
								};

								if (path) {
									path = tools.trim(path, '');
								};

								path = tools.append([], dirRoot, path, [file]);

								if (!options.noEscapes && !options.quote) {
									if (options.shell === 'bash') {
										const pathLen = path.length;
										for (let i = 0; i < pathLen; i++) {
											path[i] = path[i].replace(__Internal__.parsePathUnixEscapeShellReservedCharsRegEx, "\\$1");
										};
									} else if (options.shell === 'dos') {
										const pathLen = path.length;
										for (let i = 0; i < pathLen; i++) {
											path[i] = path[i].replace(__Internal__.parsePathWindowsEscapeShellReservedCharsRegEx, "^$1");
										};
									};
								};

								let result = path.join(options.dirChar);

								if (!options.isRelative || host || drive || hasRoot) {
									result = (options.dirChar + result);
								};

								if (host && drive) {
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
									revision: 1,
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
								return this.toString(tools.extend({}, options, {os: null, dirChar: null, shell: 'api'}));
							}),

						combine: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 12,
									params: {
										location: {
											type: 'string,Path,Url',
											optional: true,
											description: "'Path' or 'Url' object to combine with.",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options",
										},
									},
									returns: 'Path',
									description: "Combines the Path with the specified Path or Url, then returns the result.",
								}
							//! END_REPLACE()
							, function combine(/*optional*/location, /*optional*/options) {
								//options = tools.extend({isRelative: true}, options);

								location = files.parseLocation(location, options);

								if (types.isNothing(location)) {
									return this;
								};

								const type = types.getType(this);
								const dontThrow = types.get(options, 'dontThrow', false),
									allowTraverse = types.get(options, 'allowTraverse', false);

								let includePathInRoot = types.get(options, 'includePathInRoot', null);

								const data = tools.fill(__Internal__.pathAllKeys, {}, this);

								const thisRoot = tools.trim(this.root || [], '');

								const thisPath = tools.trim(this.path || [], '');

								let dirRoot = types.get(options, 'root');
								if (types.isString(dirRoot)) {
									dirRoot = dirRoot.split(data.dirChar);
								};
								if (dirRoot) {
									dirRoot = tools.trim(dirRoot, '');
								};

								let dir = types.get(options, 'path', location.path);
								if (types.isString(dir)) {
									dir = dir.split(data.dirChar);
								};
								if (dir) {
									dir = tools.trim(dir, '');
								};

								let isRelative = false;
								if (types._instanceof(location, files.Path)) {
									const host = types.get(options, 'host', location.host);
									const drive = types.get(options, 'drive', location.drive);
									isRelative = !host && !drive && types.get(options, 'isRelative', location.isRelative);
									if ((location.os === 'windows') && (host || drive) && ((this.os !== 'windows') || (host !== this.host) || (drive !== this.drive))) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Drive mismatch.");
										}
									};
									if (!dirRoot) {
										dirRoot = location.root;
									};
								} else { //if (types._instanceof(location, files.Url))
									isRelative = !types.get(options, 'domain', location.domain) && types.get(options, 'isRelative', location.isRelative);
									if (location.protocol && (location.protocol !== 'file')) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Bad url protocol.");
										}
									};
									if (location.isWindows) {
										if (dir.length && ((this.os !== 'windows') || this.host || (dir[0][0] !== this.drive))) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Drive mismatch.");
											}
										};
										dir.shift();
									};
									if (!dirRoot) {
										dirRoot = dir;
										dir = null;
									};
								};

								data.dontThrow = dontThrow;
								data.allowTraverse = allowTraverse;

								let thisFile = this.file;
								if (thisFile && ((dirRoot && dirRoot.length) || (dir && dir.length) || location.file)) {
									thisPath.push(thisFile);
									thisFile = null;
								};

								if (types.isNothing(includePathInRoot)) {
									// Auto-detect
									includePathInRoot = !isRelative && (!thisRoot || !thisRoot.length);
								};

								if (includePathInRoot) {
									data.root = tools.append([], thisRoot, thisPath);
									data.path = tools.append([], dirRoot, dir);
								} else if (isRelative) {
									data.root = thisRoot;
									data.path = tools.append([], thisPath, dirRoot, dir);
								} else {
									data.root = thisRoot;
									data.path = tools.append([], dirRoot, dir);
								};

								data.file = types.get(options, 'file', location.file || thisFile);

								data.extension = types.get(options, 'extension', null);

								location = type.parse(null, data);

								return location;
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
								let i = this.path.length - 1;
								while ((i >= 0) && (count > 0)) {
									const tmp = this.path[i];
									if (tmp === '.') {
										// Do nothing
									} else if (tmp === '..') {
										count++;
									} else {
										count--;
									};
									i--;
								};
								let path;
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
								const type = types.getType(this);
								return type.parse(null, tools.fill(__Internal__.pathAllKeys, {}, this, {path: path}));
							}),

						pushFile: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 4,
									params: null,
									returns: 'Path',
									description: "Includes file in the path and returns a new Path object. Useful after parsing path strings not including the trailing directory separator (like environment variables).",
								}
							//! END_REPLACE()
							, function pushFile() {
								if (this.file) {
									return this.set({file: '', path: tools.append([], this.path, [this.file])});
								} else {
									return this;
								}
							}),

						popFile: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'Path',
									description: "Excludes file from the path and returns a new Path object. Will returns 'null' when there is no file that can be extracted from the path.",
								}
							//! END_REPLACE()
							, function popFile() {
								if (this.file) {
									return this;
								} else if (this.path && this.path.length) {
									const newPath = tools.append([], this.path);
									const newFile = newPath.pop();
									return this.set({file: newFile, path: newPath});
								} else {
									return null;
								}
							}),

						toArray: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 4,
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
								const isRelative = types.get(options, 'isRelative', this.isRelative),
									dirChar = types.get(options, 'dirChar', this.dirChar),
									pathOnly = types.get(options, 'pathOnly', false),
									trim = types.get(options, 'trim', false),
									pushFile = types.get(options, 'pushFile', false);

								let file = types.get(options, 'file', this.file),
									host = types.get(options, 'host', this.host),
									drive = types.get(options, 'drive', this.drive),
									root = types.get(options, 'root', this.root),
									path = types.get(options, 'path', this.path);

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

								const newPath = tools.append([], root, path);

								if (pushFile && file) {
									newPath.push(file);
									file = '';
								};

								if (!trim && (file === '')) {
									newPath.push('');
								} else if (file) {
									newPath.push(file);
								};

								if (!isRelative) {
									if (host && drive) {
										if (trim) {
											newPath.unshift(host, drive);
										} else {
											newPath.unshift('', '', host, drive);
										};
									} else if (!host && drive) {
										newPath.unshift(drive + ':');
									} else if (!trim && newPath.length) {
										newPath.unshift('');
									};
								};

								return newPath;
							}),

						relative: function relative(to, /*optional*/options) {
							if (this.isRelative) {
								throw new types.ParseError("Path is not absolute.");
							};

							const type = types.getType(this);

							if (!types._instanceof(to, files.Path)) {
								to = type.parse(to, options);
							};
							if (to.isRelative) {
								throw new types.ParseError("Target must be an absolute path.");
							};

							if ((this.os === 'windows') && (to.os !== 'windows')) {
								throw new types.ParseError("Incompatible OSes.");
							};

							if ((this.os === 'windows') && ((this.host !== to.host) || (this.drive !== to.drive))) {
								throw new types.ParseError("Paths must be from the same network share or the same drive.");
							};

							const os = tools.getOS(),
								caseSensitive = types.get(options, 'caseSensitive', os.caseSensitive);

							const thisAr = this.toArray({trim: true}),
								toAr = to.toArray({trim: true, pushFile: true});

							const pathAr = [];

							let i = 0;

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

							let j = i;

							for (; i < toAr.length; i++) {
								pathAr.push('..');
							};

							if (pathAr.length === 0) {
								pathAr.push('.');
							};

							for (; j < thisAr.length; j++) {
								pathAr.push(thisAr[j]);
							};

							return type.parse(null, tools.extend(tools.fill(__Internal__.pathOptions, {}, this), {path: pathAr, file: null, extension: null, isRelative: true}));
						},

						toDataObject: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 1,
									params: {
										options: {
											type: 'object',
											optional: true,
											description: "Options.",
										},
									},
									returns: 'object',
									description: "Converts the Path to a normal Javascript object.",
								}
							//! END_REPLACE()
							, function toDataObject(/*optional*/options) {
								const type = types.getType(this);
								const functions = types.get(options, 'functions', false);

								const obj = tools.nullObject();

								tools.fill(__Internal__.pathDataKeys, obj, this, options);

								if (functions) {
									obj.toPath = function toPath(/*optional*/options) {
										if (options) {
											return type.parse(null, tools.extend({}, this, options));
										} else {
											return type.parse(null, this);
										}
									};

									obj.toString = function toString(/*optional*/options) {
										return this.toPath(options).toString();
									};

									obj.toApiString = function toString(/*optional*/options) {
										return this.toPath(options).toApiString();
									};
								};

								return obj;
							}),

						// NOTE: 'toJSON' is a documented function for "JSON.stringify".
						toJSON: function toJSON(key) {
							return this.toDataObject(null);
						},
					}, __Internal__.pathOptions)
				)));

			//===================================
			// URLs
			//===================================

			__Internal__.decodeURIComponent = function(uri) {
				// <PRB> decodeURIComponent doesn't unescape "+"
				uri = tools.replace(uri || '', /\+/g,  " ");
				try {
					return _shared.Natives.windowDecodeURIComponent(uri);
				} catch(ex) {
					// <PRB> decodeURIComponent throws on invalid hex values and on invalid UTF8 sequences.
					return _shared.Natives.windowUnescape(uri);
				}
			};

			files.REGISTER(root.DD_DOC(
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
									const noEscapes = types.get(options, 'noEscapes', false);
									if (types.isString(args)) {
										args = args.split('&');
										for (let i = args.length - 1; i >= 0; i--) {
											const arg = tools.split(args[i], '=', 2);
											let name = arg[0];
											if (!noEscapes) {
												name = __Internal__.decodeURIComponent(name);
											};
											let value = null;
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

						fromJSON: function fromJSON(value) {
							return this.parse(null, value);
						},

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

							types.setAttribute(this, 'options', options, {});
							types.setAttribute(this, '__args', types.freezeObject(args), {});
						}),

						toDataObject: root.DD_DOC(
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
									returns: 'object',
									description: "Converts to a normal Javascript object.",
								}
							//! END_REPLACE()
							, function toDataObject(/*optional*/options) {
								const type = types.getType(this);
								const functions = types.get(options, 'functions', false);

								const obj = tools.reduce(this.__args, function(result, arg) {
									if (arg.name) {
										if (arg.name in result) {
											const item = result[arg.name];
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

								}, tools.nullObject());

								if (functions) {
									obj.toUrlArguments = function toUrlArguments() {
										return type.parse(null, this);
									};

									obj.toString = function toString() {
										return this.toUrlArguments().toString();
									};
								};

								return obj;
							}),

						// NOTE: 'toJSON' is a documented function for "JSON.stringify".
						toJSON: function toJSON(key) {
							return this.toDataObject(null);
						},

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
								return types.entries(this.toDataObject(null));
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

								options = tools.extend({}, this.options, options);

								const len = this.__args.length;

								let result = '';

								const noEscapes = types.get(options, 'noEscapes', false);

								for (let i = 0; i < len; i++) {
									const arg = this.__args[i];
									let name = arg.name;
									let val = arg.value;
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
									for (let i = this.__args.length - 1; i >= 0; i--) {
										const arg = this.__args[i];
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
									revision: 1,
									params: {
										name: {
											type: 'string',
											optional: false,
											description: "Name of the argument.",
										},
										singleValue: {
											type: 'boolean',
											optional: true,
											description: "When 'true', function will returns only the first occurrence as a single value. When 'false', all occurrences will be returned as an array. Default is 'false'.",
										},
									},
									returns: 'string,arrayof(string)',
									description: "Return the argument's value(s) if it exists. Returns 'undefined' otherwise.",
								}
							//! END_REPLACE()
							, function get(name, /*optional*/singleValue) {
								if (root.DD_ASSERT) {
									root.DD_ASSERT(types.isNothing(name) || types.isString(name), "Invalid name.");
								};

								let result = undefined,
									isArray = false,
									isNothing = true;

								if (types.isNothing(this.__args)) {
									return result;
								};

								for (let i = this.__args.length - 1; i >= 0; i--) {
									const arg = this.__args[i];
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
											result = [arg.value];
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

								const isObj = types.isObject(name),
									noEscapes = types.get(this.options, 'noEscapes', false);

								if (!types.isArray(name) && !isObj) {
									name = [name];
								};

								if (types.isNothing(replace)) {
									replace = true;
								};

								if (!types.isNothing(value) && !types.isArray(value)) {
									value = [value];
								};

								let args;
								if (types.isNothing(this.__args)) {
									args = [];
								} else {
									args = this.__args.slice(0);
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
										for (let i = 0; i < args.length;) {
											const arg = args[i];
											if (arg.name === n) {
												if (v.length) {
													let val = v.shift();
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

									for (let i = 0; i < v.length; i++) {
										args.push({
											name: n,
											value: v[i],
										});
									};
								});

								if ((!args.length) && !this.__args) {
									args = null;
								};

								const type = types.getType(this);

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

								let args = [];

								if (!types.isNothing(this.__args)) {
									for (let i = 0; i < this.__args.length; i++) {
										const arg = this.__args[i];
										let found = false;
										for (let j = 0; j < names.length; j++) {
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

								const type = types.getType(this);

								return new type(args, types.clone(this.options));
							}),

						combine: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 1,
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
								const type = types.getType(this);

								options = tools.extend({}, this.options, options);

								const mode = types.get(options, 'argsMode', 'merge');

								if (!types._instanceof(args, files.UrlArguments)) {
									args = type.parse(args, options);
									if (mode === 'replace') {
										return args;
									};
									options = null;
								};

								if (mode === 'replace') {
									args = args.__args;

								} else if (mode === 'merge') {
									const tmp = {},
										ar1 = this.__args,
										ar1Len = ar1 && ar1.length;

									for (let i = 0; i < ar1Len; i++) {
										const item = ar1[i];
										item.order = i;
										tmp[item.name] = item;
									};

									const ar2 = args.__args,
										ar2Len = ar2 && ar2.length;

									for (let i = 0; i < ar2Len; i++) {
										const item = ar2[i];
										item.order = i + ar1Len;
										tmp[item.name] = item;
									};

									args = types.values(tmp);

									args.sort(function(item1, item2) {
										if (item1.order < item2.order) {
											return -1;
										} else if (item1.order > item2.order) {
											return 1;
										} else {
											return 0;
										}
									});

									if (!args.length) {
										args = null;
									};

								} else { // if (mode === 'append')
									args = tools.append([], this.__args, args.__args);

								};

								return new type(args, options);
							}),
					}
				)));

			__Internal__.urlData = {
				protocol: types.READ_ONLY( null ),
				user: types.READ_ONLY( null ),
				password: types.READ_ONLY( null ),
				domain: types.READ_ONLY( null ), // when set, changes 'host'
				port: types.READ_ONLY( null ), // when set, changes 'host'
				path: types.READ_ONLY( null ),
				file: types.READ_ONLY( null ),   // when set, changes 'extension'.
				args: types.READ_ONLY( null ),
				anchor: types.READ_ONLY( null ),
				isNull: types.READ_ONLY( false ), // Read-only
			};
			__Internal__.urlDataKeys = types.keys(__Internal__.urlData);

			__Internal__.urlOptions = {
				host: types.READ_ONLY( null ), // when set, changes 'domain' and 'port'
				extension: types.READ_ONLY( null ), // when set, changes 'file'
				isRelative: types.READ_ONLY( false ),
				noEscapes: types.READ_ONLY( false ),
				isWindows: types.READ_ONLY( false ),
			};
			__Internal__.urlOptionsKeys = types.keys(__Internal__.urlOptions);

			__Internal__.urlNonStoredKeys = ['dontThrow', 'url', 'href', 'origin', 'username', 'pathname', 'search', 'query', 'hash'];

			__Internal__.urlAllKeys = tools.append([], __Internal__.urlDataKeys, __Internal__.urlOptionsKeys);
			__Internal__.urlAllKeysAndNonStoredKeys = tools.append([], __Internal__.urlAllKeys, __Internal__.urlNonStoredKeys);

			// NOTE: To prevent using "delete"
			__Internal__.urlSetExcludedKeys = ['host', 'path', 'file', 'extension'];
			__Internal__.urlAllKeysForSet = tools.filter(__Internal__.urlAllKeys, function(key) {
				return (tools.indexOf(__Internal__.urlSetExcludedKeys, key) < 0);
			});

			__Internal__.defaultPorts = tools.nullObject({
				http: 80,
				https: 443,
				ftp: 21,
				ftps: 990,
				sftp: 22,
				// ...
			});

			files.REGISTER(root.DD_DOC(
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
									revision: 9,
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

								// TODO: Domain encoding/decoding to/from Punycode

								if (types.isNothing(url)) {
									url = types.get(options, 'url', types.get(options, 'href', null));
								};

								// Flags
								const dontThrow = types.get(options, 'dontThrow', false);

								let path = null; // Default is Auto-detect

								if (types.isArray(url)) {
									path = url;
									url = null;

								} else if (types._instanceof(url, files.Url)) {
									const args = types.get(options, 'args', null);

									const data = tools.fill(__Internal__.urlAllKeys, {}, url);
									options = tools.fill(__Internal__.urlAllKeysAndNonStoredKeys, data, {host: null, extension: null}, options);

									if (types.isJsObject(args)) {
										options.args = url.args.combine(args, options);
									};

									url = null;

								} else if (types._instanceof(url, files.Path)) {
									const isWindows = (url.os === 'windows');

									let pathTmp = url.path;
									if (isWindows) {
										pathTmp = tools.append([], [url.drive + ':'], pathTmp);
									};

									options = tools.fill(__Internal__.urlAllKeysAndNonStoredKeys, {
										protocol: 'file',
										host: null,
										path: pathTmp,
										file: url.file,
										extension: null,
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
									}
								};

								let tmpPath = types.get(options, 'path', null);
								if (types.isNothing(tmpPath)) {
									tmpPath = types.get(options, 'pathname', null);
								};
								if (!types.isNothing(tmpPath)) {
									path = tmpPath;
								};

								let domain = types.get(options, 'domain', types.get(options, 'hostname', null)), // Default is Auto-detect
									port = types.get(options, 'port', null); // Default is Auto-detect

								if (types.isNothing(domain)) {
									const host = types.get(options, 'host', null); // Default is Auto-set
									if (host) {
										const tmp = tools.split(host, ':', 2);
										domain = tmp[0] || null;
										port = tmp[1] || null;
									};
								};

								// Options
								let protocol = types.get(options, 'protocol', null), // Default is Auto-detect
									user = types.get(options, 'user', types.get(options, 'username', null)), // Default is Auto-detect
									password = types.get(options, 'password', null), // Default is Auto-detect
									file = types.get(options, 'file', null), // Default is Auto-detect
									extension = types.get(options, 'extension', null), // Default is "file" 's extension
									args = types.get(options, 'args', types.get(options, 'query', null)), // Default is Auto-detect
									anchor = types.get(options, 'anchor', null), // Default is Auto-detect
									isWindows = types.get(options, 'isWindows', null), // Default is Auto-detect
									isRelative = types.get(options, 'isRelative', null); // Default is Auto-detect

								const noEscapes = types.get(options, 'noEscapes', false);

								if (types.isNothing(args)) {
									args = types.get(options, 'search', null);
									if (types.isString(args)) {
										args = tools.trim(args, '?', 1, 1);
									};
								};

								if (types.isNothing(anchor)) {
									anchor = types.get(options, 'hash', null);
									if (types.isString(anchor)) {
										anchor = tools.trim(anchor, '#', 1, 1);
									};
								};


								if (url) {
									url = tools.trim(url);

									// Auto-detect "protocol"
									if (/^[A-Za-z+]+:\/\//.test(url)) {
										const pos = url.indexOf(':');
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
										const posUrl = tools.search(url, /[/?#]/);
										if (posUrl >= 0) {
											if (types.isNothing(domain)) {
												domain = url.slice(0, posUrl) || null;
											};
											url = url.slice(posUrl);
										} else {
											if (types.isNothing(domain)) {
												domain = url || null;
											};
											url = '';
										};
										if (domain) {
											const posDomain = domain.indexOf('@');
											if (posDomain >= 0) {
												const login = domain.slice(0, posDomain);
												domain = domain.slice(posDomain + 1) || null;
												const posLogin = login.indexOf(':');
												if (posLogin >= 0) {
													if (types.isNothing(user)) {
														user = login.slice(0, posLogin) || null;
													};
													if (types.isNothing(password)) {
														password = login.slice(posLogin + 1);
													};
												} else {
													if (types.isNothing(user)) {
														user = login || null;
													};
												};
											};
										};
										if (domain) {
											const posDomain = tools.search(domain, /[:][0-9]+/);
											if (posDomain >= 0) {
												if (types.isNothing(port)) {
													port = domain.slice(posDomain + 1) || null;
												};
												domain = domain.slice(0, posDomain) || null;
											};
										};
									};

									// Auto-detect "path" and "file"
									// TODO: Create "tools.searchLast" instead of slicing.
									const posArgs = url.indexOf('?');
									const posFile = url.slice(0, posArgs < 0 ? undefined : posArgs).lastIndexOf('/');
									if (posFile >= 0) {
										if (types.isNothing(file)) {
											file = url.slice(posFile + 1) || null;
										};
										if (types.isNothing(path)) {
											path = url.slice(0, posFile + 1);
										};
									} else {
										if (types.isNothing(file)) {
											file = url || null;
										};
										if (types.isNothing(path)) {
											path = [];
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
									isRelative = false;
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
										}
									};
								};

								if (!types.isNothing(file)) {
									// Auto-detect "args" and "anchor"
									let posArgs = tools.search(file, '?', 0, null, '#');
									const posAnchor = tools.search(file, '#', ((posArgs >= 0) ? posArgs + 1 : 0));
									if ((posArgs >= 0) && types.isNothing(args)) {
										args = file.slice(posArgs + 1, (posAnchor >= 0 ? posAnchor : undefined));
									};
									if ((posAnchor >= 0) && types.isNothing(anchor)) {
										anchor = file.slice(posAnchor + 1);
									};
									if (posArgs < 0) {
										posArgs = posAnchor;
									};
									if (posArgs >= 0) {
										file = file.slice(0, posArgs) || null;
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
									}
								};

								if (!noEscapes && anchor) {
									anchor = __Internal__.decodeURIComponent(anchor);
								};

								if (types.isNothing(path)) {
									path = [];
								} else if (types.isString(path)) {
									if (!noEscapes) {
										path = __Internal__.decodeURIComponent(path);
									};
									if (path) {
										path = path.split('/');
									} else {
										path = [];
									};
								} else { // isArray
									if (noEscapes) {
										//path = tools.append([], path);
									} else {
										path = tools.map(path, __Internal__.decodeURIComponent);
									};
								};

								if (types.isNothing(file)) {
									file = null;
									extension = null;
								} else if (types.isString(file)) {
									if (!noEscapes) {
										file = __Internal__.decodeURIComponent(file);
									};
									file = file.split('/');
								} else { // isArray
									if (noEscapes) {
										file = tools.append([], file);
									} else {
										file = tools.map(file, __Internal__.decodeURIComponent);
									};
								};

								let trailingSlash = false;

								if (types.isNothing(file) && path && path.length) {
									// Auto-detect
									const tmp = path[path.length - 1];
									if ((tmp === '') || (tmp === '.') || (tmp === '..')) {
										file = [];
										trailingSlash = true;
									} else {
										path.pop();
										file = [tmp];
									};
								} else if (file && file.length) {
									const tmp = file[file.length - 1];
									if ((tmp === '') || (tmp === '.') || (tmp === '..')) {
										trailingSlash = true;
									};
								} else if (path && path.length) {
									file = [];
									trailingSlash = true;
								};

								if (types.isNothing(isRelative)) {
									// Auto-detect
									isRelative = !path || !path.length || !!path[0].length;
								};

								if (path) {
									path = tools.trim(path, '');
								};

								if (file) {
									file = tools.trim(file, '');
								};

								if (!isRelative) {
									if (file) {
										const abs = __Internal__.relativeToAbsolute(file, path || [], {
											dirChar: '/',
											dontThrow: dontThrow,
											trailing: false,
										});
										if (!abs) {
											return null;
										};
										path = abs.dirRoot;
										file = abs.path;
									};

									if (path) {
										const abs = __Internal__.relativeToAbsolute(path, [], {
											dirChar: '/',
											dontThrow: dontThrow,
											trailing: false,
										});
										if (!abs) {
											return null;
										};
										path = abs.path;
									};
								};

								if (!isRelative && (path || file)) {
									const state = {
										invalid: null,
									};

									const validatePath = function validatePath(pathArray) {
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
										}
									};
								};

								if (file) {
									if (trailingSlash || !file.length) {
										file = '';
									} else if (file.length === 1) {
										file = file[0];
									} else {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid file name.");
										}
									};
								} else {
									file = null;
								};

								if (types.isNothing(file)) {
									extension = null;
								} else {
									const pos = file.indexOf('.');
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
								};

								return new this({
									protocol: protocol,
									domain: domain,
									user: user,
									password: password,
									port: port,
									path: types.freezeObject(path || []),
									file: file,
									extension: extension,
									args: args,
									anchor: anchor,
									noEscapes: !!noEscapes,
									isRelative: !!isRelative,
									isWindows: !!isWindows,
									host: (domain ? domain + (port ? ':' + port : (protocol && (protocol in __Internal__.defaultPorts) ? ':' + __Internal__.defaultPorts[protocol] : '')) : null),
									isNull: !protocol && !domain && (!path || !path.length) && !file && (!args || !args.__args || !args.__args.length) && !anchor,
								});
							}),

						fromJSON: function fromJSON(value) {
							return this.parse(null, value);
						},

					},
					/*instanceProto*/
					tools.extend({
						_new: types.SUPER(function _new(options) {
							this._super();
							const attrs = tools.fill(__Internal__.urlAllKeys, {}, options);
							if (types.hasDefinePropertyEnabled()) {
								types.setAttributes(this, attrs);
							} else {
								tools.extend(this, attrs);
							};
						}),

						set: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 3,
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
								let newOptions = tools.fill(__Internal__.urlAllKeysForSet, {}, this);
								//delete newOptions.extension;
								//delete newOptions.host;
								if (!types.has(options, 'url')) {
									newOptions.path = this.path;
									newOptions.file = this.file;
									//delete newOptions.path;
									//delete newOptions.file;
								};
								newOptions = tools.fill(__Internal__.urlAllKeysAndNonStoredKeys, newOptions, options);
								const type = types.getType(this);
								return type.parse(null, newOptions);
							}),

						hasArg: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 0,
									params: {
										name: {
											type: 'string',
											optional: false,
											description: "Argument name.",
										},
									},
									returns: 'boolean',
									description: "Return 'true' if argument exists. Returns false otherwise.",
								}
							//! END_REPLACE()
							, function hasArg(name) {
								return !!this.args && this.args.has(name);
							}),

						getArg: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 0,
									params: {
										name: {
											type: 'string',
											optional: false,
											description: "Argument name.",
										},
										singleValue: {
											type: 'boolean',
											optional: true,
											description: "When 'true', function will returns only the first occurrence as a single value. When 'false', all occurrences will be returned as an array. Default is 'false'.",
										},
									},
									returns: 'string,arrayof(string)',
									description: "Return the argument's value(s) if it exists. Returns 'undefined' otherwise.",
								}
							//! END_REPLACE()
							, function getArg(name, /*optional*/singleValue) {
								if (this.args) {
									return this.args.get(name, singleValue);
								};
								return undefined; // "consistent-return"
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
								}
							}),

						toString: root.DD_DOC(
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
									returns: 'string',
									description: "Converts to a string.",
								}
							//! END_REPLACE()
							, function toString(/*optional*/options) {
								if (!types._instanceof(this, files.Url)) {
									return '';
								};

								// Flags
								const dontValidate = types.get(options, 'dontValidate', false);

								if (options) {
									if (dontValidate) {
										options = tools.extend({}, this, options);
									} else {
										// Validate
										// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
										options = types.clone(options) || {};
										if (!types.has(options, 'dontThrow')) {
											options.dontThrow = true;  // "parse" will returns null when invalid
										};
										const type = types.getType(this);
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
								const noEscapes = types.get(options, 'noEscapes', false);


								let result = '';

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

								if (options.path && options.path.length) {
									let path = '';
									if (!types.isNothing(options.domain) || !options.isRelative || options.isWindows) {
										path += '/';
									};
									path += tools.trim((noEscapes ? (options.path || []) : tools.map((options.path || []), _shared.Natives.windowEncodeURIComponent)), '').join('/');
									if (path.length > 1) {
										path += '/';
									};
									if (!noEscapes && options.isWindows) {
										// Workaround for Windows and IE (must be "/C:/", not "/C%3A/")
										path = tools.replace(path, /^\/?([A-Za-z])%3[Aa]/, function(result, g1) {
											return '/' + g1.toUpperCase() + ':';
										});
									};
									result += path;
								};

								if (!types.isNothing(options.file)) {
									if ((!options.path || !options.path.length) && (!types.isNothing(options.domain) || !options.isRelative)) {
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

						toApiString: root.DD_DOC(
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
									description: "Converts to a string for the APIs.",
								}
							//! END_REPLACE()
							, function toApiString(/*optional*/options) {
								return this.toString(tools.extend({}, options, {noEscapes: true}));
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
									const type = types.getType(this);
									url = type.parse(url);
								};
								const result = (this.toString({anchor: null}) === url.toString({anchor: null}));
								return (result ? ((this.anchor === url.anchor) ? 0 : 1) : -1); // 0=same, 1=different anchor, -1=different
							}),

						combine: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 9,
									params: {
										location: {
											type: 'string,Url,Path',
											optional: false,
											description: "Url or Path to combine with.",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options.",
										},
									},
									returns: 'Url',
									description: "Combines the Url with another Url or Path, then returns the result.",
								}
							//! END_REPLACE()
							, function combine(location, /*optional*/options) {
								//options = tools.extend({isRelative: true}, options);

								location = files.parseLocation(location, options);

								if (types.isNothing(location)) {
									return this;
								};

								const type = types.getType(this);

								const dontThrow = types.get(options, 'dontThrow', false);

								const data = tools.fill(__Internal__.urlAllKeys, {}, this);

								const thisPath = tools.trim(this.path || [], '');
								const thisFile = this.file;

								if (thisFile) {
									thisPath.push(thisFile);
								};

								let pathRoot = null;

								let isRelative = false;
								if (types._instanceof(location, files.Url)) {
									const domain = types.get(options, 'domain', location.domain);
									isRelative = !domain && types.get(options, 'isRelative', location.isRelative);
									if (location.isWindows && (!this.isWindows || (data.path[0] !== thisPath[0]))) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Drive mismatch.");
										}
									};
									if (domain) {
										data.protocol = types.get(options, 'protocol', location.protocol);
										data.user = types.get(options, 'user', location.user);
										data.password = types.get(options, 'password', location.password);
										data.domain = domain;
										data.port = types.get(options, 'port', location.port);
									};
									const anchor = types.get(options, 'anchor', location.anchor);
									if (anchor) {
										data.anchor = anchor;
									};
									const args = types.get(options, 'args', location.args);
									if (args) {
										data.args = this.args.combine(args, options);
									};
								} else { // if (types._instanceof(location, files.Path))
									const host = types.get(options, 'host', location.host);
									const drive = types.get(options, 'drive', location.drive);
									isRelative = !host && !drive && types.get(options, 'isRelative', location.isRelative);
									if (location.root) {
										pathRoot = tools.trim(location.root, '');
									};
									if ((location.os === 'windows') && drive && (!this.isWindows || (drive !== thisPath[0]))) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Drive mismatch.");
										}
									};
								};

								data.dontThrow = dontThrow;

								let path = types.get(options, 'path', location.path);
								if (types.isString(path)) {
									path = path.split('/');
								};
								if (path) {
									path = tools.trim(path, '');
								};

								let file = types.get(options, 'file', location.file);
								if (types.isString(file)) {
									file = file.split('/');
								};
								if (file && file.length) {
									const tmp = file.pop();
									file = tools.trim(file, '');
									path = tools.append(path, file);
									file = tmp;
								};

								if (isRelative) {
									data.path = tools.append([], thisPath, pathRoot, path);
								} else if ((pathRoot && pathRoot.length) || (path && path.length)) {
									data.path = tools.append([], pathRoot, path);
								} else {
									data.path = [];
									if (!file) {
										file = '';
									};
								};

								data.file = file;

								data.extension = types.get(options, 'extension', null);

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
								let i = this.path.length - 1;
								while ((i >= 0) && (count > 0)) {
									const tmp = this.path[i];
									if (tmp === '.') {
										// Do nothing
									} else if (tmp === '..') {
										count++;
									} else {
										count--;
									};
									i--;
								};
								let path;
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
								const type = types.getType(this);
								return type.parse(null, tools.fill(__Internal__.urlAllKeys, {}, this, {path: path}));
							}),

						pushFile: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 3,
									params: null,
									returns: 'Url',
									description: "Includes file in the path and returns a new Url object. Useful after parsing path strings not including file names which are known to miss the trailing directory separator (like environment variables). It might be a parse option in the future.",
								}
							//! END_REPLACE()
							, function pushFile() {
								if (this.file) {
									return this.set({file: '', path: tools.append([], this.path, [this.file])});
								} else {
									return this;
								}
							}),

						popFile: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'Path',
									description: "Excludes file from the path and returns a new Url object. Will returns 'null' when there is no file that can be extracted from the url.",
								}
							//! END_REPLACE()
							, function popFile() {
								if (this.file) {
									return this;
								} else if (this.path && this.path.length) {
									const newPath = tools.append([], this.path);
									const newFile = newPath.pop();
									return this.set({file: newFile, path: newPath});
								} else {
									return null;
								}
							}),

						toArray: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 4,
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
								const isRelative = types.get(options, 'isRelative', this.isRelative),
									pushFile = types.get(options, 'pushFile', false),
									trim = types.get(options, 'trim', false),
									pathOnly = types.get(options, 'pathOnly', false);

								let path = types.get(options, 'path', this.path),
									protocol = types.get(options, 'protocol', this.protocol),
									domain = types.get(options, 'domain', this.domain),
									user = types.get(options, 'user', this.user),
									password = types.get(options, 'password', this.password),
									port = types.get(options, 'port', this.port),
									args = types.get(options, 'args', this.args),
									anchor = types.get(options, 'anchor', this.anchor),
									file = types.get(options, 'file', this.file);

								if (pathOnly) {
									protocol = null;
									domain = null;
									user = null;
									password = null;
									port = null;
									args = null;
									anchor = null;
								};

								if (types.isNothing(path)) {
									path = [];
								} else {
									if (types.isString(path)) {
										path = tools.split('/');
									} else if (types.isArray(path)) {
										path = tools.append([], path);
									};

									path = tools.trim(path, '');
								};

								if (types.isNothing(args)) {
									args = null;
								} else if (types.isString(args)) {
									args = _shared.urlArgumentsParser(args);
								};

								file = (file || '') + (!args || types.isNothing(args.__args) ? '' : '?' + args.toString()) + (types.isNothing(anchor) ? '' : '#' + anchor);

								if (pushFile && file) {
									path.push(file);
									file = '';
								};

								if (!trim && (file === '')) {
									path.push('');
								} else if (file) {
									path.push(file);
								};

								if (!isRelative) {
									if (domain) {
										if (!types.isNothing(user) || !types.isNothing(password)) {
											path.unshift((types.isNothing(user) ? '' : user) + (types.isNothing(password) ? '' : ':' + password) + '@' + domain + (types.isNothing(port) ? '' : ':' + port));
										} else {
											path.unshift(domain + (types.isNothing(port) ? '' : ':' + port));
										};
										if (protocol) {
											path.unshift(protocol + ':', '', '');
										};
									} else {
										if (!trim && path.length) {
											path.unshift('');
										};
									};
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

						relative: function relative(to, /*optional*/options) {
							if (this.isRelative) {
								throw new types.ParseError("Url is not absolute.");
							};

							const type = types.getType(this);

							if (!types._instanceof(to, files.Url)) {
								to = type.parse(to, options);
							};

							if (to.isRelative) {
								throw new types.ParseError("Target must be an absolute url.");
							};

							if (this.isWindows && !to.isWindows) {
								throw new types.ParseError("Incompatible OSes.");
							};

							if (this.isWindows && (this.path[0] !== to.path[0])) {
								throw new types.ParseError("Urls must be from the same network share or the same drive.");
							};

							if ((this.domain !== to.domain) && (this.port !== to.port)) {
								throw new types.ParseError("Urls must be from the same domain and have the same port number.");
							};

							if ((this.user !== to.user) || (this.password !== to.password)) {
								throw new types.ParseError("Urls must be from the same credentials.");
							};

							const caseSensitive = types.get(options, 'caseSensitive', false);

							const thisAr = this.toArray({trim: true, domain: null, args: null, anchor: null}),
								toAr = to.toArray({trim: true, pushFile: true, domain: null, args: null, anchor: null});

							const pathAr = [];

							let i = 0;

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

							let j = i;

							for (; i < toAr.length; i++) {
								pathAr.push('..');
							};

							if (pathAr.length === 0) {
								pathAr.push('.');
							};

							for (; j < thisAr.length; j++) {
								pathAr.push(thisAr[j]);
							};

							return type.parse(null, tools.extend(tools.fill(__Internal__.urlOptions, {}, this), {path: pathAr, file: null, extension: null, args: this.args, anchor: this.anchor, isRelative: true, isWindows: false}));
						},

						toDataObject: root.DD_DOC(
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
									returns: 'object',
									description: "Converts the URL to a normal Javascript object.",
								}
							//! END_REPLACE()
							, function toDataObject(/*optional*/options) {
								const type = types.getType(this);
								const functions = types.get(options, 'functions', false);

								const obj = tools.nullObject();

								tools.fill(__Internal__.urlDataKeys, obj, this, options);

								if (types.isNothing(obj.domain)) {
									obj.protocol = null;
									obj.user = null;
									obj.password = null;
									obj.port = null;
								};

								if (types.isNothing(obj.args)) {
									obj.args = tools.nullObject();
								} else {
									if (!types._instanceof(obj.args, files.UrlArguments)) {
										obj.args = _shared.urlArgumentsParser(obj.args);
									};
									obj.args = obj.args.toDataObject( { functions } );
								};

								if (functions) {
									obj.toUrl = function toUrl(/*optional*/options) {
										if (options) {
											return type.parse(null, tools.extend({}, this, options));
										} else {
											return type.parse(null, this);
										}
									};

									obj.toString = function toString(/*optional*/options) {
										return this.toUrl(options).toString();
									};
								};

								return obj;
							}),

						// NOTE: 'toJSON' is a documented function for "JSON.stringify".
						toJSON: function toJSON(key) {
							return this.toDataObject(null);
						},

					}, __Internal__.urlData, __Internal__.urlOptions)
				)));


			//===================================
			// Init
			//===================================
			//return function init(/*optional*/options) {
			//};
		},
	};
	return modules;
};

//! END_MODULE()
