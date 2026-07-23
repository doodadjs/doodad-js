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

						if (!types.isNothing(url) && url.noEscapes) {
							url = url.set({
								noEscapes: false, // switch to default
							});
						};
					};
				};
				return url;
			};

			_shared.pathParser = function pathParser(path, /*optional*/options) {
				if (!types.isNothing(path)) {
					if (!types._instanceof(path, files.Path)) {
						path = files.Path.parse(path, options);
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

			files.ADD('parseLinuxPath', function parsePath(path, /*optional*/options) {
				options = tools.extend({}, options, {os: 'linux'});
				path = _shared.pathParser(path, options);
				return path;
			});

			files.ADD('parseLocation', function parseLocation(location, /*optional*/options) {
				if (types.isNothing(location)) {
					return location;
				} else if (types.isString(location) || types.isArray(location)) {
					if (__Internal__.detectUrlRegexp.test(location)) {
						return _shared.urlParser(location, options);
					} else {
						return this.parsePath(location, options);
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
						revision: 2,
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
					// WARNING: Paths should be parsed and validated according to the OS and file system before calling this function.

					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(dirRoot) || types.isArray(dirRoot) || types.isString(dirRoot), "Invalid root.");
						root.DD_ASSERT(types.isArray(path) || types.isString(path), "Invalid path.");
					};

					const dirChar = types.get(options, 'dirChar', '/');

					if (types.isString(path)) {
						path = path.split(dirChar);
					};

					if (types.isString(dirRoot)) {
						dirRoot = dirRoot.split(dirChar);
					};

					const dontThrow = types.get(options, 'dontThrow', false);

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
						if (count > 0) {
							let tmp = null;
							if (pos <= 0) {
								if (dirRoot && (count > 1)) {
									if (dirRoot.length > 0) {
										tmp = dirRoot.pop();
										while (!tmp && dirRoot.length) {
											tmp = dirRoot.pop();
											if (tmp === '..') {
												tmp = dirRoot.pop();
											};
										};
									};
									if (!tmp) {
										if (dontThrow) {
											return null;
										} else {
											throw new files.PathError("Path overflow.");
										}
									};
								};
							};
							while ((count > 0) && (pos >= 0)) {
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

					return {
						dirRoot: dirRoot,
						path: path,
					};
				});

			__Internal__.pathData = {
				drive: types.READ_ONLY( null ),  // For Windows only. null = auto-detect
				host: types.READ_ONLY( null ), // For Windows only. null = auto-detect
				root: types.READ_ONLY( null ),   // null = auto-detect
				path: types.READ_ONLY( null ),
				file: types.READ_ONLY( null ),   // null = auto-detect. when set, changes 'extension'.
				extension: types.READ_ONLY( null ), // null = auto-detect. when set, changes 'file'.
			};
			__Internal__.pathDataKeys = types.keys(__Internal__.pathData);

			__Internal__.pathOptions = {
				os: types.READ_ONLY( null ), // null = use current os, '' = deactivate validation, 'windows', 'unix', 'linux'
				caseSensitive: types.READ_ONLY( null ),
				dirChar: types.READ_ONLY( null ), // null = auto-detect
				quote: types.READ_ONLY( null ),  // null = auto-detect
				isRelative: types.READ_ONLY( false ), // null = auto-detect
				isFolder: types.READ_ONLY( false ), // null = auto-detect
				allowTraverse: types.READ_ONLY( false ),
			};
			__Internal__.pathOptionsKeys = types.keys(__Internal__.pathOptions);

			__Internal__.pathNonStoredKeys = ['dontThrow', 'forceDrive'];

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
									revision: 12,
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
								// Flags
								const dontThrow = types.get(options, 'dontThrow', false),
									hasOs = types.has(options, 'os'),
									hasCaseSensitive = types.has(options, 'caseSensitive'),
									hasDirChar = types.has(options, 'dirChar');

								if (types._instanceof(path, files.Path)) {
									const data = tools.fill(__Internal__.pathAllKeys, {}, path);
									options = tools.extend(data, {extension: null}, options);
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

									if (path.drive) {
										// TODO: Test network paths
										let host = null;
										let drive = path.drive;
										if (drive.startsWith('//')) {
											const tmp = drive.split('/');
											host = tmp[2];
											drive = tmp[3];
										} else {
											drive = drive[0];
										};
										options = tools.extend({
											os: 'windows',
											host,
											drive,
											file: path.file,
											extension: null,
										}, options);
									} else {
										options = tools.extend({
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
									caseSensitive = hasCaseSensitive || !hasOs ? types.get(options, 'caseSensitive', null) : null, // Default is Auto-set
									dirChar = hasDirChar || !hasOs ? types.get(options, 'dirChar', null) : null,  // Default is Auto-set
									quote = types.get(options, 'quote', null),  // Default is Auto-detect
									host = types.get(options, 'host', null), // Default is Auto-detect
									drive = types.get(options, 'drive', null),  // Default is Auto-detect
									dirRoot = types.get(options, 'root', null),  // Default is no root
									file = types.get(options, 'file', null),  // Default is Auto-detect
									extension = file ? types.get(options, 'extension', null) : null, // Default is "file" 's extension
									isRelative = types.get(options, 'isRelative', null), // Default is Auto-detect
									isFolder = types.get(options, 'isFolder', null); // Default is Auto-detect

								const forceDrive = types.get(options, 'forceDrive', false),  // Default is False
									allowTraverse = types.get(options, 'allowTraverse', false);  // Default is False

								path = types.get(options, 'path', path);

								const pathIsString = types.isString(path),
									fileIsString = types.isString(file),
									fileIsEmpty = (file === ''),
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
									const osInfo = tools.getOS();
									os = osInfo.type;
								};

								if (types.isNothing(caseSensitive)) {
									caseSensitive = ((os === 'windows') ? false : true);
								};

								// Detect quotes character
								if (types.isNothing(quote)) {
									quote = '';
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
												};
											};
										};
									};
								};

								// If quoted, path and root must be quoted
								if (quote) {
									if (dirRootIsString && dirRoot && ((path.length < 2) || (dirRoot[0] !== quote) || (dirRoot[dirRoot.length - 1] !== quote))) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("'root' option must be quoted.");
										};
									};
									if (pathIsString && ((path.length < 2) || (path[0] !== quote) || (path[path.length - 1] !== quote))) {
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

								// Detect folder separator
								if (types.isNothing(dirChar)) {
									// Auto-set
									if (os === 'windows') {
										dirChar = '\\';
									} else {
										dirChar = '/';
									};

									// Replace alternate folder separators by the first one
									const seps = [dirChar, '/', '\\']; // NOTE: 'dirChar' is first and will get selected later (see bottom).
									for (let i = 1; i < seps.length; i++) {
										const sep = seps[i];
										if (sep !== dirChar) {
											if (dirRootIsString) {
												dirRoot = tools.replace(dirRoot, sep, dirChar, 'g');
											};
											if (pathIsString) {
												path = tools.replace(path, sep, dirChar, 'g');
											};
											if (fileIsString) {
												file = tools.replace(file, sep, dirChar, 'g');
											};
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

								// Trailing slashes.
								const isTrailing = function(path, isString, side) {
									if (!types.isNothing(path) && (path.length > 0)) {
										const pos = side === 'left' ? 0 : path.length - 1;
										if (isString) {
											return (path[pos] === dirChar);
										} else {
											return (path[pos] === '');
										};
									};
									return false;
								};
								let trailingSlashLeft = (isRelative === false);
								if (!trailingSlashLeft) {
									if (types.isNothing(dirRoot)) {
										trailingSlashLeft = isTrailing(path, pathIsString, 'left');
									} else {
										trailingSlashLeft = isTrailing(dirRoot, dirRootIsString, 'left');
									};
								};
								let trailingSlashRight = (isFolder === true);
								if (!trailingSlashRight) {
									if (!types.isNothing(path) && (path.length > 0)) {
										trailingSlashRight = isTrailing(path, pathIsString, 'right');
									} else {
										trailingSlashRight = isTrailing(dirRoot, dirRootIsString, 'right');
									};
								};

								// Split paths
								if (!types.isNothing(dirRoot)) {
									if (dirRootIsString) {
										dirRoot = dirRoot.split(dirChar);
									} else if (types.isArray(dirRoot)) {
										dirRoot = tools.append([], dirRoot); // clone
									} else {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("'root' must be a string or an array.");
										};
									};
									dirRoot = tools.filter(dirRoot, function (tmp) { return !!tmp; });
									if (!dirRoot.length) {
										dirRoot = null;
									};
								}

								if (types.isNothing(path)) {
									path = [];
								} else if (pathIsString) {
									path = path.split(dirChar);
								};
								path = tools.filter(path, function (tmp) { return !!tmp; });

								if (types.isNothing(file)) {
									file = [];
								} else if (fileIsString) {
									file = file.split(dirChar);
								};
								file = tools.filter(file, function (tmp) { return !!tmp; });

								// Get and validate host and drive
								if (os === 'windows') {
									if (types.isNothing(host) && types.isNothing(drive)) {
										if (!types.isNothing(dirRoot)) {
											const tmp = dirRoot[0];
											if ((dirRoot.length >= 4) && !dirRoot[0] && !dirRoot[1]) {
												host = dirRoot.splice(0, 3)[2];
												drive = dirRoot.shift();
											} else if (tmp && (tmp.length >= 2) && (tmp[1] === ':')) {
												drive = dirRoot.shift();
												drive = drive.split(':', 2);
												const remaining = drive[1];
												drive = drive[0];
												if (remaining) {
													dirRoot.unshift(remaining);
												};
											};
										}
										const tmp = path[0];
										if ((path.length >= 4) && !tmp && !path[1]) {
											if (types.isNothing(host) && types.isNothing(drive)) {
												host = path.splice(0, 3)[2];
												drive = path.shift();
											} else {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("'path' can't have a network path or a drive letter while 'root' is set.");
												};
											}
										} else if (tmp && (tmp.length >= 2) && (tmp[1] === ':')) {
											if (types.isNothing(host) && types.isNothing(drive)) {
												drive = path.shift();
												drive = drive.split(':', 2);
												const remaining = drive[1];
												drive = drive[0];
												if (remaining) {
													path.unshift(remaining);
												};
											} else {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("'path' can't have a network path or a drive letter while 'root' is set.");
												};
											}
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

								// Detect isRelative.
								if (types.isNothing(isRelative)) {
									isRelative = !host && !drive && !trailingSlashLeft;
								};

								// Validate host and drive.
								if (os === 'windows') {
									if (host || drive) {
										if (isRelative) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Path can't be relative with a drive.");
											};
										}

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
											host = host.trim().toUpperCase();
											if (tools.indexOf(host, ':') >= 0) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Invalid host name.");
												};
											};
										};

										// Validate drive letter
										drive = drive.trim().toUpperCase();
										if (host) {
											// TODO: Validate shared folder
										} else {
											const chr = drive.charCodeAt(0);
											if ((drive.length !== 1) || (chr < 65) || (chr > 90)) {
												if (dontThrow) {
													return null;
												} else {
													throw new types.ParseError("Invalid drive.");
												};
											};
										};
									};
								};

								// Forced drive
								if (forceDrive && !isRelative && (os === 'windows') && !host && !drive) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("A network path or drive letter is mandatory for the absolute path.");
									};
								};

								// Resolve path and file.
								if (!isRelative) {
									// NOTE: Root must not traverse '/'
									if (!types.isNothing(dirRoot)) {
										const abs = __Internal__.relativeToAbsolute(dirRoot, [], {dirChar: dirChar,	dontThrow: dontThrow});
										if (!abs) {
											return null;
										};
										dirRoot = (abs.path.length ? abs.path : null);
									};

									// Resolve path
									if (allowTraverse) {
										// Path can traverse root
										const abs = __Internal__.relativeToAbsolute(path, dirRoot || [], {dirChar: dirChar,	dontThrow: dontThrow});
										if (!abs) {
											return null;
										};
										dirRoot = abs.dirRoot;
										path = abs.path;
									} else {
										// Path must not traverse root
										const abs = __Internal__.relativeToAbsolute(path, [], {dirChar: dirChar, dontThrow: dontThrow});
										if (!abs) {
											return null;
										};
										path = abs.path;
									};

									// File can traverse path but not root.
									const abs = __Internal__.relativeToAbsolute(file, path, {dirChar: dirChar, dontThrow: dontThrow});
									if (!abs) {
										return null;
									};
									path = abs.dirRoot;
									file = abs.path;
								};

								// Validate root, path and file.
								const validatePath = function validatePathDos(pathArray) {
									if (types.isNothing(pathArray)) {
										return true;
									}

									for (let pos = 0; pos < pathArray.length; pos++) {
										const item = pathArray[pos];

										let tmp = tools.trim(item, ' ', -1);

										if (os === 'windows') {
											if (tmp.indexOf(':') >= 0) {
												if (dontThrow) {
													return false;
												} else {
													throw new types.ParseError("Invalid path or file name: '~0~'.", [item]);
												};
											};
										};

										// NOTE: More than two dots resolves to one
										if (tmp !== '..') {
											tmp = tools.trim(tmp, '.', -1, tmp.length - 1);
										};

										if (!isRelative) {
											if ((tmp === '.') || (tmp === '..')) {
												if (dontThrow) {
													return false;
												} else {
													throw new types.ParseError("Invalid path or file name: '~0~'.", [item]);
												};
											};
										};

										pathArray[pos] = tmp;
									};

									return true;
								};
								if (!validatePath(dirRoot)) {
									return null; // dontThrow
								};
								if (!validatePath(path)) {
									return null; // dontThrow
								};
								if (!validatePath(file)) {
									return null; // dontThrow
								};

								// Get file name.
								if (file.length > 1) {
									if (dontThrow) {
										return null;
									} else {
										throw new types.ParseError("Invalid file name.");
									};
								} else if (isFolder === true) {
									// Make it a folder.
									path = tools.append([], path, file);
									file = null;
								} else if (file.length === 0) {
									if (!fileIsEmpty && !trailingSlashRight && (path.length > 0)) {
										file = path.pop();
										isFolder = false;
									} else if (allowTraverse && !fileIsEmpty && !trailingSlashRight && !types.isNothing(dirRoot) && (dirRoot.length > 0)) {
										file = dirRoot.pop();
										isFolder = false;
									} else if (isFolder === false) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Missing file name.");
										};
									} else {
										file = null;
										isFolder = true;
									};
								} else {
									file = file[0];
									isFolder = false;
								};

								// Get or set extension.
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
											file += '.' + extension;
										};
									} else if (pos >= 0) {
										// Remove extension
										file = file.slice(0, pos);
									};
								};

								path = {
									host: host || '',
									drive: drive || '',
									root: dirRoot ? types.freezeObject(dirRoot) : null,
									path: types.freezeObject(path),
									file: file || '',
									extension: file ? extension || '' : null,

									os,
									caseSensitive,
									dirChar,
									isFolder,
									isRelative,
									quote: quote || '',
								};

								return new this(path);
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
								types.setJsAttributes(this, attrs);
							} else {
								tools.extend(this, attrs);
							};
						}),

						set: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 4,
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
								const extra = {};
								if (types.has(options, 'os')) {
									extra.caseSensitive = types.get(options, 'caseSensitive', null);
									extra.dirChar = types.get(options, 'dirChar', null);
								};
								if (types.has(options, 'root') || types.has(options, 'path')) {
									extra.isRelative = types.get(options, 'isRelative', null);
								};
								if (types.has(options, 'file')) {
									extra.isFolder = types.get(options, 'isFolder', null);
									extra.extension = types.get(options, 'extension', null);
								};
								const newOptions = tools.extend({}, this, extra, options);
								const type = types.getType(this);
								return type.parse(null, newOptions);
							}),

						toString: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 4,
									params: {
										options: {
											type: 'object',
											optional: true,
											description: "Options",
										},
									},
									returns: 'string',
									description: "Converts Path to a string.",
								}
							//! END_REPLACE()
							, function toString(/*optional*/options) {
								// Flags
								const hasNewOptions = !types.isNothing(options),
									hasOs = types.has(options, 'os'),
									hasCaseSensitive = types.has(options, 'caseSensitive'),
									hasDirChar = types.has(options, 'dirChar');

								options = tools.fill(__Internal__.pathAllKeysAndNonStoredKeys, {}, this, options);

								if (hasOs) {
									if (!hasCaseSensitive) {
										options.caseSensitive = null;
									};
									if (!hasDirChar) {
										options.dirChar = null;
									};
								};

								// Validate against the new options.
								if (hasNewOptions) {
									// Validate
									// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
									options.dontThrow = !root.serverSide;  // "parse" will return null when invalid
									const type = types.getType(this);
									options = type.parse(null, options);
									if (!options) {
										// NOTE: Do not throw exceptions in "toString" because the javascript debugger in Chrome doesn't like it
										return '';
									};
								};

								let path = options.path;

								const dirRoot = options.root,
									file = options.file,
									host = options.host,
									drive = options.drive,
									dirChar = options.dirChar || this.dirChar,
									isRelative = options.isRelative,
									isFolder = options.isFolder;

								// Combine root, path and file.
								path = tools.append([], dirRoot, path);
								if (file) {
									path.push(file);
								}

								// Trailing slashes.
								if (!isRelative) {
									path.unshift('');
								};
								if (isFolder) {
									path.push('');
								}

								// Build string.
								let result = path.join(dirChar);

								// Insert host and drive.
								if (host && drive) {
									result = (dirChar + dirChar + host + dirChar + drive) + result;
								} else if (drive) {
									result = (drive + ':') + result;
								};

								// Insert quotes.
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
								return this.toString(tools.extend({}, options, {os: null, dirChar: null, forceDrive: true}));
							}),

						combine: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 14,
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
								const hasNewOptions = !types.isNothing(options),
									allowTraverse = types.get(options, 'allowTraverse', false),
									dontThrow = types.get(options, 'dontThrow', false),
									appendFile = types.get(options, 'appendFile', /*null*/ false);

								if (!types.isNothing(location) && !types._instanceof(location, [files.Path, files.Url])) {
									location = files.parseLocation(location, {dontThrow});
								};

								if (types.isNothing(location)) {
									if (dontThrow) {
										return null;
									} else {
										throw new files.PathError("Missing location.");
									};
								};

								/*if (!this.isFolder && location.isRelative && types.isNothing(appendFile)) {
									throw new files.PathError("The 'appendFile' option is mandatory to combine from a file path.");
								};*/

								const isFolder = types.get(options, 'isFolder', location.isFolder);

								options = tools.fill(__Internal__.pathAllKeys, {}, this); // clone

								// Validate against the new options.
								if (hasNewOptions) {
									// Validate
									// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
									const type = types.getType(this);
									options = type.parse(null, options);
									if (!options) {
										return null;
									};
									options = tools.fill(__Internal__.pathAllKeys, {}, options); // clone
								};

								const host = options.host,
									drive = options.drive,
									file = options.file,
									locFile = location.file;

								let dirRoot = options.root,
									path = options.path,
									locRoot = null,
									locPath = location.path;

								if (types._instanceof(location, files.Path)) {
									const locHost = location.host,
										locDrive = location.drive;
									if (((locHost || locDrive) && ((locHost !== host) || (locDrive !== drive)))) {
										if (dontThrow) {
											return null;
										} else {
											throw new files.PathError("Drive mismatch.");
										}
									};
									locRoot = location.root;
									if (!location.isRelative && !tools.areSimilar(dirRoot || [], locRoot || [])) {
										if (dontThrow) {
											return null;
										} else {
											throw new files.PathError("Root mismatch.");
										}
									};
								} else { //if (types._instanceof(location, files.Url))
									if (location.protocol && (location.protocol !== 'file')) {
										if (dontThrow) {
											return null;
										} else {
											throw new files.PathError("Bad URL protocol.");
										}
									};
									let locDrive = null;
									const tmp = locPath[0];
									if (tmp && (tmp.length === 2) && (tmp[1] === ':')) {
										locDrive = locPath.shift();
										locDrive = locDrive.split(':', 2);
										const remaining = locDrive[1];
										locDrive = locDrive[0].toUpperCase();
										locPath = tools.append([], remaining, locPath);
									};
									if (host && locDrive) {
										if (dontThrow) {
											return null;
										} else {
											throw new files.PathError("Host mismatch.");
										}
									}
									if (drive && locDrive) {
										if (locDrive !== drive) {
											if (dontThrow) {
												return null;
											} else {
												throw new files.PathError("Drive mismatch.");
											}
										}
									}
								};

								if (location.isRelative) {
									dirRoot = tools.append([], dirRoot || [], path, (appendFile === true) && file ? [file] : [], locRoot);
									path = tools.append([], locPath); // clone
								} else {
									path = tools.append([], locRoot, locPath);
								};

								if (locFile) {
									path.push(locFile);
								};

								options.root = dirRoot;
								options.path = path;
								options.file = null; // auto-detect
								options.extension = null; // auto-detect

								options.allowTraverse = allowTraverse;
								options.isFolder = isFolder;
								options.dontThrow = dontThrow;

								const type = types.getType(this);
								path = type.parse(null, options);

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
									if (this.isRelative && types.isFinite(count)) {
										while (count > 0) {
											path.push('..');
											count--;
										};
									};
								} else {
									path = this.path.slice(0, i + 1);
								};
								const type = types.getType(this);
								return type.parse(null, tools.fill(__Internal__.pathAllKeys, {}, this, {path}));
							}),

						toFolder: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 6,
									params: null,
									returns: 'Path',
									description: "Includes file in the path and returns a new Path object. Useful after parsing path strings not including the trailing directory separator (like environment variables).",
								}
							//! END_REPLACE()
							, function toFolder() {
								if (this.file) {
									return this.set({isFolder: true});
								} else {
									return this;
								}
							}),

						toFile: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 4,
									params: null,
									returns: 'Path',
									description: "Excludes file from the path and returns a new Path object. Will returns 'null' when there is no file that can be extracted from the path.",
								}
							//! END_REPLACE()
							, function toFile() {
								if (this.file) {
									return this;
								} else {
									return this.set({isFolder: false});
								};
							}),

						toArray: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 7,
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
								let hasNewOptions = !types.isNothing(options);

								const trim = types.get(options, 'trim', false),
									pathOnly = types.get(options, 'pathOnly', false);

								options = tools.fill(__Internal__.pathAllKeysAndNonStoredKeys, {}, this, options);

								if (pathOnly) {
									options.host = '';
									options.drive = '';
									options.file = '';
									options.extension = null;
									hasNewOptions = true;
								};

								// Validate against the new options.
								if (hasNewOptions) {
									// Validate
									// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
									const type = types.getType(this);
									options = type.parse(null, options);
									if (!options) {
										return null;
									};
								};

								const path = tools.append([], options.root, options.path);
								if (options.file) {
									path.push(options.file);
								}

								if (options.host && options.drive) {
									path.unshift(options.drive); // share name
									path.unshift('\\\\' + options.host); // host name
								} else if (options.drive) {
									path.unshift(options.drive + ':');
								} else if (!trim && !options.isRelative) {
									// Trailing slashes.
									path.unshift('');
								};

								// Trailing slashes.
								if (!trim && !options.file) {
									path.push('');
								};

								return path;
							}),

						relative: function relative(to, /*optional*/options) {
							const dontThrow = types.get(options, 'dontThrow', false);

							if (this.isRelative) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Path is not absolute.");
								};
							};

							if (!types.isNothing(to) && !types._instanceof(to, files.Path)) {
								to = files.parsePath(to, {dontThrow});
							}

							if (types.isNothing(to)) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Missing target path.");
								};
							};

							if (to.isRelative) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Target must be an absolute path.");
								};
							};

							if ((this.os === 'windows') && (to.os !== 'windows')) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Incompatible OSes.");
								};
							};

							if ((this.os === 'windows') && ((this.host !== to.host) || (this.drive !== to.drive))) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Paths must be from the same network share or the same drive.");
								};
							};

							const caseSensitive = types.get(options, 'caseSensitive', this.caseSensitive),
								isFolder = types.get(options, 'isFolder', this.isFolder);

							const thisAr = this.toArray({trim: true}),
								toAr = to.toArray({trim: true});

							let i = 0;

							while ((i < thisAr.length) && (i < toAr.length)) {
								if (caseSensitive) {
									if (thisAr[i] !== toAr[i]) {
										break;
									};
								} else {
									if (thisAr[i].toLowerCase() !== toAr[i].toLowerCase()) {
										break;
									};
								};
								i++;
							};

							const pathAr = [];

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

							const type = types.getType(this);
							options = tools.extend({}, {root: null, file: null, extension: null, isRelative: true, isFolder}, options);
							return type.parse(pathAr, options);
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

						isNull: function isNull() {
							return !this.host && !this.drive && (!this.root || !this.root.length) && (!this.path || !this.path.length) && !this.file;
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

						_new: types.SUPER(function _new(args, /*optional*/options) {
							this._super();
							if (root.DD_ASSERT) {
								root.DD_ASSERT(types.isNothing(args) || types.isArray(args), "Invalid arguments array.");
							};

							types.setJsAttribute(this, 'options', options, {});
							types.setJsAttribute(this, '__args', types.freezeObject(args), {});
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
									revision: 2,
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
			};
			__Internal__.urlDataKeys = types.keys(__Internal__.urlData);

			__Internal__.urlOptions = {
				extension: types.READ_ONLY( null ), // when set, changes 'file'
				isRelative: types.READ_ONLY( false ),
				noEscapes: types.READ_ONLY( false ),
			};
			__Internal__.urlOptionsKeys = types.keys(__Internal__.urlOptions);

			__Internal__.urlNonStoredKeys = ['dontThrow', 'url', 'href', 'host', 'username', 'pathname', 'search', 'query', 'hash', 'isFolder'];

			__Internal__.urlAllKeys = tools.append([], __Internal__.urlDataKeys, __Internal__.urlOptionsKeys);
			__Internal__.urlAllKeysAndNonStoredKeys = tools.append([], __Internal__.urlAllKeys, __Internal__.urlNonStoredKeys);

			// NOTE: To prevent using "delete"
			__Internal__.urlSetExcludedKeys = ['path', 'file', 'extension'];
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
									revision: 12,
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

									options = tools.fill(__Internal__.urlAllKeys, {}, url);
									options = tools.extend(options, {host: null, extension: null}, options);

									if (types.isJsObject(args)) {
										options.args = url.args.combine(args, options);
									};

									url = null;

								} else if (types._instanceof(url, files.Path)) {
									const pathTmp = tools.append([], url.root, url.path);

									if (url.drive) {
										pathTmp.unshift(url.host ? url.drive : url.drive + ':');
									};

									options = tools.extend({
										protocol: null,
										host: null,
										domain: url.host,
										path: pathTmp,
										file: url.file,
										extension: null,
										isRelative: url.isRelative,
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
									const host = types.get(options, 'host', null);
									if (host) {
										const tmp = tools.split(host, ':', 2);
										domain = tmp[0] || null;
										port = (tmp.length > 1) && tmp[1] || null;
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
									isRelative = types.get(options, 'isRelative', null); // Default is Auto-detect

								const noEscapes = types.get(options, 'noEscapes', false),
									isFolder = types.get(options, 'isFolder', null); // Default is Auto-detect

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
											url = url.slice(pos + 1);
											if (url.startsWith('//')) {
												url = url.slice(2);
											};
										};
									};

									if (protocol === 'file') {
										// Auto-detect "domain", "path"
										isRelative = false; // it is always absolute and it can't be relative
										if ((url[0] === '/') && (url[1] !== '/')) {
											// Local path
											if (types.isNothing(path)) {
												path = url;
											};
										} else {
											// Network path
											const isLegacy = url.startsWith('//');
											const pos = url.indexOf('/', isLegacy ? 2 : 0);
											if (pos >= 0) {
												if (types.isNothing(domain)) {
													domain = url.slice(isLegacy ? 2 : 0, pos);
												};
												if (types.isNothing(path)) {
													path = url.slice(pos);
												};
											} else {
												if (types.isNothing(domain)) {
													if (isLegacy) {
														domain = url.slice(2);
													} else {
														domain = url;
													};
												};
												if (types.isNothing(path)) {
													path = [];
												};
											};
										};

									} else if (protocol) {
										// Auto-detect "domain", "user", "password", "port"
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

									if (protocol !== 'file') {
										// Auto-detect "path" and "file"
										const posArgs = url.indexOf('?');
										const posFile = url.lastIndexOf('/', (posArgs < 0 ? url.length - 1 : posArgs - 1));
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
								};

								if (!protocol || (protocol === 'http') || (protocol === 'https')) {
									if (!types.isNothing(file)) {
										// Auto-detect "args", "anchor" and "file"
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
								};

								if (domain) {
									domain = __Internal__.decodeURIComponent(domain).toLowerCase();
									isRelative = false;
								};

								if (!domain || (protocol === 'file')) {
									user = null;
								};
								if (user) {
									user =  __Internal__.decodeURIComponent(user);
								};

								if (!domain || (protocol === 'file')) {
									password = null;
								};
								if (password) {
									password = __Internal__.decodeURIComponent(password);
								};

								if (!domain || (protocol === 'file')) {
									port = null;
								};
								if (types.isNothing(port)) {
									if (protocol && (protocol in __Internal__.defaultPorts)) {
										port = __Internal__.defaultPorts[protocol];
									};
								} else if (types.isString(port)) {
									port = types.toInteger(__Internal__.decodeURIComponent(port));
									if ((port <= 0) || (port > 65535)) {
										if (dontThrow) {
											return null;
										} else {
											throw new types.ParseError("Invalid port number.");
										};
									};
								};

								if (types.isNothing(path)) {
									path = [];
								} else if (types.isString(path)) {
									path = path.split('/');
								};
								if (!noEscapes) {
									path = path.map(__Internal__.decodeURIComponent);
								};

								if (types.isNothing(file)) {
									extension = null;
								} else if (types.isString(file)) {
									file = file.split('/');
								};
								if (file) {
									if (noEscapes) {
										file = tools.append([], file);
									} else {
										file = file.map(__Internal__.decodeURIComponent);
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
									path = tools.filter(path, (name) => !!name);
								};

								if (file) {
									file = tools.filter(file, (name) => !!name);
								};

								if (!isRelative) {
									if (file) {
										const abs = __Internal__.relativeToAbsolute(file, path || [], {dirChar: '/', dontThrow: dontThrow});
										if (!abs) {
											return null;
										};
										path = abs.dirRoot;
										file = abs.path;
									};

									if (path) {
										const abs = __Internal__.relativeToAbsolute(path, [], {dirChar: '/', dontThrow: dontThrow});
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
											throw new types.ParseError("Invalid path or file name: '~0~'.", [state.invalid]);
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
										};
									};
								} else {
									file = null;
								};

								if (!types.isNothing(isFolder)) {
									if (!isFolder && !file) {
										if (path) {
											file = path.pop();
										};
										if (!file) {
											if (dontThrow) {
												return null;
											} else {
												throw new types.ParseError("Missing file name.");
											};
										};
									};
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

								if (isFolder && file) {
									if (path) {
										path.push(file);
									} else {
										path = [file];
									};
									file = '';
									extension = '';
								};

								if (protocol && (protocol !== 'http') && (protocol !== 'https')) {
									args = null;
								};
								if (types._instanceof(args, files.UrlArguments)) {
									// Will clone "args".
									args = (args.toString() || null);
								};
								if (!types._instanceof(args, files.UrlArguments)) {
									args = _shared.urlArgumentsParser(args);
								};

								if (protocol && (protocol !== 'http') && (protocol !== 'https')) {
									anchor = null;
								};
								if (anchor) {
									anchor = __Internal__.decodeURIComponent(anchor);
								};

								return new this({
									protocol: protocol || null,
									domain: domain || null,
									user: user || null,
									password: password || null,
									port,
									path: types.freezeObject(path || []),
									file: file || '',
									extension: (file ? extension || '' : null),
									args,
									anchor: anchor || null,
									noEscapes: !!noEscapes,
									isRelative: !!isRelative,
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
								types.setJsAttributes(this, attrs);
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
								if (!types.has(options, 'url')) {
									newOptions.path = this.path;
									newOptions.file = this.file;
								};
								newOptions = tools.extend(newOptions, options);
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
									revision: 4,
									params: {
										options: {
											type: 'object',
											optional: true,
											description: "Options.",
										},
									},
									returns: 'string',
									description: "Converts Url to a string.",
								}
							//! END_REPLACE()
							, function toString(/*optional*/options) {
								// Flags
								const hasNewOptions = !types.isNothing(options);
								const dontValidate = types.get(options, 'dontValidate', false);
								let isFolder = types.get(options, 'isFolder', null);

								options = tools.fill(__Internal__.urlAllKeysAndNonStoredKeys, {}, this, options);

								// Validate against the new options.
								if (hasNewOptions && !dontValidate) {
									// Validate
									// NOTE: Use "parse" because there is too many validations and we don't want to repeat them
									const type = types.getType(this);
									options.dontThrow = !root.serverSide;  // "parse" will return null when invalid
									options = type.parse(null, options);
									if (!options) {
										// NOTE: Do not throw exceptions in "toString" because the Chrome javascript debugger doesn't like it
										//throw new types.ParseError("Invalid url.");
										return '';
									};
									// Don't execute that.
									isFolder = null;
								};


								// Options
								const noEscapes = options.noEscapes;


								let result = '';

								if (options.protocol) {
									result += options.protocol + '://';
									if (options.domain) {
										if ((options.protocol !== 'file') && (!types.isNothing(options.user) || !types.isNothing(options.password))) {
											if (!types.isNothing(options.user)) {
												result += _shared.Natives.windowEncodeURIComponent(options.user);
											};
											if (!types.isNothing(options.password)) {
												result += ':' + _shared.Natives.windowEncodeURIComponent(options.password);
											};
											result += '@';
										};
										result += _shared.Natives.windowEncodeURIComponent(options.domain);
										if ((options.protocol !== 'file') && !types.isNothing(options.port) && (!options.protocol || !(options.protocol in __Internal__.defaultPorts) || (__Internal__.defaultPorts[options.protocol] !== options.port))) {
											result += ':' + options.port;
										};
									};
								};

								let path = options.path,
									file = options.file;

								if (dontValidate) {
									// We didn't validate...
									if (types.isString(path)) {
										path = path.split('/');
									};
									if (path) {
										path = path.filter((name) => !!name);
									};
									if (types.isString(file)) {
										file = file.split('/');
									};
									if (file) {
										if (file.length > 1) {
											if (!path) {
												path = [];
											};
											const fileName = file.pop();
											file = file.filter((name) => !!name);
											tools.append(path, file);
											file = fileName;
										} else {
											file = file[0];
										};
									};
								};

								if (!types.isNothing(isFolder)) {
									// NOTE: If we are there that's because validation has been disabled.
									if (isFolder) {
										if (file) {
											if (path) {
												path.push(file);
											} else {
												path = [file];
											};
											file = '';
										};
									} else {
										if (!file && path) {
											file = path.pop() || '';
										};
										//if (!file) {
										//	// ???
										//};
									};
								};

								if (path && path.length) {
									let strPath = '';
									path = tools.filter(path, (name) => !!name);
									let drive = path[0];
									if ((options.protocol === 'file') && (drive.length === 2) && (drive[1] === ':')) {
										// Workaround for Windows ("file:///C:/...")
										drive = path.shift();
									} else {
										drive = '';
									};
									if (!noEscapes) {
										path = tools.map(path, _shared.Natives.windowEncodeURIComponent);
									};
									strPath += path.join('/');
									if (strPath.length > 0) {
										strPath += '/';
									};
									if (drive) {
										strPath = drive + '/' + strPath;
									};
									if (options.domain || !options.isRelative) {
										strPath = '/' + strPath;
									};
									result += strPath;
								} else if (options.domain || !options.isRelative) {
									result += '/';
								};

								if (file) {
									result += (noEscapes ? file : _shared.Natives.windowEncodeURIComponent(file));
								};

								if (!options.protocol || (options.protocol === 'http') || (options.protocol === 'https')) {
									if (!types._instanceof(options.args, files.UrlArguments)) {
										// We didn't validate (dontValidate is true)...
										options.args = _shared.urlArgumentsParser(options.args);
									};
									if (!types.isNothing(options.args.__args)) {
										result += '?' + options.args.toString(options);
									};

									if (!types.isNothing(options.anchor)) {
										result += '#' + _shared.Natives.windowEncodeURIComponent(options.anchor);
									};
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
									revision: 12,
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
								const dontThrow = types.get(options, 'dontThrow', false);

								location = files.parseLocation(location, {dontThrow});

								if (types.isNothing(location)) {
									if (dontThrow) {
										return null;
									} else {
										throw new files.PathError("Missing location.");
									};
								};

								const data = tools.fill(__Internal__.urlAllKeys, {}, this, options);

								const thisPath = this.path;

								let path = types.get(options, 'path', location.path);
								if (types.isString(path)) {
									path = path.split('/');
								} else {
									path = tools.append([], path); // clone
								};

								let isRelative = false;

								if (types._instanceof(location, files.Url)) {
									const domain = types.get(options, 'domain', location.domain);
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
									isRelative = !domain && types.get(options, 'isRelative', location.isRelative);
								} else { // if (types._instanceof(location, files.Path))
									const host = types.get(options, 'domain', location.host);
									let drive = location.drive;

									if (host) {
										data.domain = host.toLowerCase();

										if (!types.has(options, 'protocol')) {
											data.protocol = 'file';
										};
									} else if (types.has(options, 'domain')) {
										data.domain = null;

										if (location.host) {
											drive = null;
										};
									};

									if (!types.has(options, 'path')) {
										tools.prepend(path, location.root);

										if (drive) {
											path.unshift(host ? drive : drive + ':');

											if (!types.has(options, 'protocol')) {
												data.protocol = 'file';
											};
										};
									};

									isRelative = !host && !drive && types.get(options, 'isRelative', location.isRelative);
								};

								path = tools.filter(path, (name) => !!name);

								let file = types.get(options, 'file', location.file);
								if (file && types.isString(file)) {
									file = file.split('/');
								};
								if (file && file.length) {
									file = tools.filter(file, (name) => !!name);
									tools.append(path, file);
									file = path.pop();
								};

								if (isRelative) {
									data.path = tools.append([], thisPath, path);
								} else {
									data.path = path;
								};

								data.file = file;

								if (!types.has(options, 'extension')) {
									// Force auto-detect
									data.extension = null;
								};
								if (!types.has(options, 'isFolder')) {
									// Force auto-detect
									data.isFolder = null;
								};

								data.dontThrow = dontThrow;

								const type = types.getType(this);
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
									if (this.isRelative && types.isFinite(count)) {
										while (count > 0) {
											path.push('..');
											count--;
										};
									};
								} else {
									path = this.path.slice(0, i + 1);
								};
								const type = types.getType(this);
								return type.parse(null, tools.fill(__Internal__.urlAllKeys, {}, this, {path}));
							}),

						toFolder: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 5,
									params: null,
									returns: 'Url',
									description: "Includes file in the path and returns a new Url object. Useful after parsing path strings not including file names which are known to miss the trailing directory separator (like environment variables). It might be a parse option in the future.",
								}
							//! END_REPLACE()
							, function toFolder() {
								if (this.file) {
									return this.set({isFolder: true});
								} else {
									return this;
								}
							}),

						toFile: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 1,
									params: null,
									returns: 'Path',
									description: "Excludes file from the path and returns a new Url object. Will returns 'null' when there is no file that can be extracted from the url.",
								}
							//! END_REPLACE()
							, function toFile() {
								if (this.file) {
									return this;
								} else if (this.path && this.path.length) {
									return this.set({isFolder: false});
								} else {
									return null;
								}
							}),

						toArray: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 6,
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
									isFolder = types.get(options, 'isFolder', null),
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

									path = tools.filter(path, (name) => !!name);
								};

								if (types.isNothing(args)) {
									args = null;
								} else if (types.isString(args)) {
									args = _shared.urlArgumentsParser(args);
								};

								if (isFolder) {
									if (file) {
										path.push(file);
										file = '';
									};
									if (!trim) {
										file = (!args || types.isNothing(args.__args) ? '' : '?' + args.toString()) + (types.isNothing(anchor) ? '' : '#' + anchor);
									};
								} else {
									if (!types.isNothing(isFolder) && !file) {
										file = path.pop();
									};
									file = (file || '') + (!args || types.isNothing(args.__args) ? '' : '?' + args.toString()) + (types.isNothing(anchor) ? '' : '#' + anchor);
								};

								if (file) {
									path.push(file);
								} else if (!trim) {
									path.push('');
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
							const dontThrow = types.get(options, 'dontThrow', false);

							if (this.isRelative) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Url is not absolute.");
								};
							};

							to = files.parseUrl(to, {dontThrow});

							if (types.isNothing(to)) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Missing target url.");
								};
							};

							if (to.isRelative) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Target must be an absolute url.");
								};
							};

							if ((this.domain !== to.domain) || (this.port !== to.port)) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Urls must be from the same domain and have the same port number.");
								};
							};

							if ((this.user !== to.user) || (this.password !== to.password)) {
								if (dontThrow) {
									return null;
								} else {
									throw new files.PathError("Urls must be from the same credentials.");
								};
							};

							const caseSensitive = types.get(options, 'caseSensitive', false);

							const thisAr = this.toArray({domain: null, args: null, anchor: null}),
								toAr = to.toArray({isFolder: true, domain: null, args: null, anchor: null});

							const pathAr = [];

							let i = 0;

							for (; (i < thisAr.length - 1) && (i < toAr.length - 1); i++) {
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

							for (; i < toAr.length - 1; i++) {
								pathAr.push('..');
							};

							if (pathAr.length === 0) {
								pathAr.push('.');
							};

							for (; j < thisAr.length - 1; j++) {
								pathAr.push(thisAr[j]);
							};

							const file = (j < thisAr.length ? thisAr[j] : '');

							const type = types.getType(this);
							options = tools.fill(__Internal__.urlOptions, {}, this);
							options = tools.extend(options, {path: pathAr, file, extension: null, args: this.args, anchor: this.anchor, isRelative: true, drive: '', dontThrow});
							return type.parse(null, options);
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
										return type.parse(null, tools.fill(__Internal__.urlDataKeys, {}, this, options));
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

						isNull: function isNull() {
							return !this.protocol && !this.domain && (!this.path || !this.path.length) && !this.file && (!this.args || !this.args.__args || !this.args.__args.length) && !this.anchor;
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
