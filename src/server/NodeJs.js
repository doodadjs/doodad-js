//! REPLACE_BY("// Copyright 2015 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Class library for Javascript (BETA) with some extras (ALPHA)
// File: NodeJs.js - Node.js Tools
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

	global.DD_MODULES = (global.DD_MODULES || {});
	global.DD_MODULES['Doodad.NodeJs'] = {
		type: null,
		version: '0d',
		namespaces: null,
		dependencies: ['Doodad.Types', 'Doodad.Tools'],
		bootstrap: true,
		
		create: function create(root, /*optional*/_options) {
			"use strict";
			
			const doodad = root.Doodad,
				namespaces = doodad.Namespaces,
				types = doodad.Types,
				tools = doodad.Tools,
				config = tools.Config,
				files = tools.Files,
				nodejs = doodad.NodeJs,
				
				nodeOs = require('os'),
				nodePath = require('path'),
				nodeChildProcess = require('child_process'),
				nodeFs = require('fs'),
				nodeHttp = require('http'),
				nodeConsole = require('console').Console;

			
			//===================================
			// Internal
			//===================================
			
			// <FUTURE> Thread context
			const __Internal__ = {
				loadedScripts: {},   // <FUTURE> global to every thread
				os: null,
				watchedFiles: {},
				tmpdir: null,
			};
			
			
			//=====================================
			// Options
			//=====================================
			
			_options = types.depthExtend(2, {
				settings: {
					packageName: null,
					packageVersion: null,
				},
				hooks: {
					buildModule: null,
					distModule: null,
				},
			}, _options)
			
			
			//===================================
			// Asynchronous functions
			//===================================
			
			tools.callAsync = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								fn: {
									type: 'function',
									optional: false,
									description: "Callback function",
								},
								delay: {
									type: 'integer',
									optional: true,
									description: "Time to wait in milliseconds. Value of zero calls the function immediately after processing events. Value less than zero calls the function before processing events. Default is zero.",
								},
								thisObj: {
									type: 'any',
									optional: true,
									description: "Value of 'this' when calling the function. Default is 'undefined'.",
								},
								args: {
									type: 'arrayof(any)',
									optional: true,
									description: "Function arguments.",
								},
							},
							returns: 'undefined',
							description: "Asynchronously calls a function.",
				}
				//! END_REPLACE()
				, function callAsync(fn, /*optional*/delay, /*optional*/thisObj, /*optional*/args) {
					if (types.isNothing(delay)) {
						delay = 1;
					};
					if (!types.isNothing(thisObj) || !types.isNothing(args)) {
						fn = types.bind(thisObj, fn, args);
					};
					if (delay === 0) {
						global.setImmediate(fn);
					} else if (delay < 0) {
						process.nextTick(fn);
					} else {
						global.setTimeout(fn, delay);
					};
				});
			
			//=====================================
			// "Client.js" Extension
			//=====================================
			
				//===================================
				// Location functions
				//===================================
			
				tools.getCurrentLocation = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 1,
							params: null,
							returns: 'Url',
							description: "Returns startup script location and arguments.",
				}
				//! END_REPLACE()
				, function getCurrentLocation() {
					const args = [],
						path = tools.Path.parse(process.argv[1]),
						url = tools.Url.parse(path);
					for (let i = 2; i < process.argv.length; i++) {
						args.push(process.argv[i]);
					};
					return url.set({
						args: url.args.set(args),
					});
				});
				
				tools.setCurrentLocation = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								url: {
									type: 'string,Url',
									optional: false,
									description: "Url to script file with arguments",
								},
								dontAbort: {
									type: 'bool',
									optional: true,
									description: "'true' will not throws the ScriptAbortedError signal. 'false' will throws the signal. Default is 'false'.",
								},
							},
							returns: 'undefined',
							description: "Forks current V8 engine with the specified script file and arguments, then aborts current script.",
				}
				//! END_REPLACE()
				, function setCurrentLocation(url, /*optional*/dontAbort) {
					// FIXME: Does "nothing"
					
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isStringAndNotEmpty(url) || (url instanceof tools.Url), "Invalid url.");
					};
					
					if (types.isString(url)) {
						url = tools.Url.parse(url);
					};
					
					if (url.protocol !== 'file') {
						throw new types.Error("Invalid url.");
					};
					
					let args;
					if (url.args) {
						args = url.args.toString(args, {
							noEscapes: false,
						});
						args = args.split('&');
					};
					
					url = tools.Path.parse(url).toString({
						os: null,
						dirChar: null,
						quote: '"',
					});

					args = types.append([], process.execArgv, [url], args);

					const child = nodeChildProcess.spawn(process.execPath, args, {
						env: process.env,
						stdio: [0, 1, 2],
						detached: true,
					});
					child.unref();
					
					if (!dontAbort) {
						throw new types.ScriptAbortedError();
					};
				});
				
				//===================================
				// Script loader functions
				//===================================

				__Internal__.ScriptLoader = types.CustomEventTarget.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'ScriptLoader',
					},
					/*instanceProto*/
					{
						file: null,
						createOptions: null,
						initOptions: null,
						
						launched: false,
						ready: false,
						failed: false,
						
						oninit: null,
						onloading: null,
						onload: null,
						onerror: null,

						_new: types.SUPER(function _new(file, /*optional*/createOptions, /*optional*/initOptions) {
							this._super();

							this.file = file;
							
							this.createOptions = createOptions;
							this.initOptions = initOptions;
						}),
						
						start: function() {
							if (!this.launched) {
								this.launched = true;
								
								this.dispatchEvent(new types.CustomEvent('init'));
								tools.dispatchEvent(new types.CustomEvent('scriptinit', {
									detail: {
										loader: this,
									},
								}));

								this.dispatchEvent(new types.CustomEvent('loading'));
								tools.dispatchEvent(new types.CustomEvent('scriptloading', {
									detail: {
										loader: this,
									},
								}));

								try {
									let init;
									const mod = require(this.file);
									if (mod.create) {
										init = mod.create(root, this.createOptions);
									};

									const self = this;
									this.ready = true;
									this.dispatchEvent(new types.CustomEvent('load', {
										detail: {
											finalize: init && (function() { init(self.initOptions); }),
										},
									}));
									tools.dispatchEvent(new types.CustomEvent('scriptload', {
										detail: {
											loader: this,
										},
									}));
									
								} catch(ex) {
									if (this.ready) {
										throw ex;
									} else {
										this.ready = true;
										this.failed = true;
										this.dispatchEvent(new types.CustomEvent('error'));
										tools.dispatchEvent(new types.CustomEvent('scripterror', {
											detail: {
												loader: this,
											},
										}));
									};
								};
								
							};
						},
					}
				);
				
				tools.getJsScriptFileLoader = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								url: {
									type: 'string,Url,Path',
									optional: false,
									description: "Target file path",
								},
								async: {
									type: 'bool',
									optional: true,
									description: "Reserved.",
								},
								timeout: {
									type: 'integer',
									optional: true,
									description: "Reserved.",
								},
								reload: {
									type: 'bool',
									optional: true,
									description: "'true' will reload file when already loaded. 'false' will not reload file. Default is 'false'.",
								},
							},
							returns: 'ScriptLoader',
							description: "Load specified JS script file.",
				}
				//! END_REPLACE()
				, function getJsScriptFileLoader(file, /*optional*/async, /*optional*/timeout, /*optional*/reload) {
					if (file instanceof tools.Url) {
						file = tools.Path.parse(file);
					};

					if (file instanceof tools.Path) {
						file = file.toString({
							os: null,
							dirChar: null,
						});
					};

					root.DD_ASSERT && root.DD_ASSERT(types.isString(file), "Invalid file.");
					
					let loader = null;
					if (types.hasKey(__Internal__.loadedScripts, file)) {
						loader = __Internal__.loadedScripts[file];
					};
					if (reload) {
						loader = null;
					};
					if (!loader) {
						__Internal__.loadedScripts[file] = loader = new __Internal__.ScriptLoader(/*file*/file, /*createOptions*/null, /*initOptions*/null);
					};
					
					return loader;
				});
				
			
			//=====================================
			// "Tools.js" Extension
			//=====================================
			
				//===================================
				// System functions
				//===================================
				
				tools.getOS = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'object',
							description: "Returns OS information.",
				}
				//! END_REPLACE()
				, function() {
					let os = __Internal__.os;
					if (!os) {
						let type = nodeOs.type();
						type = ((type === 'Windows_NT') ? 'windows' : ((type === 'Linux') ? 'linux' : 'unix'));
						__Internal__.os = os = {
							//name: null,  // <FUTURE>
							type: type,
							//version: null,  // <FUTURE>
							//architecture: null,  // <FUTURE>
							dirChar: nodePath.sep,
							newLine: nodeOs.EOL,
							caseSensitive: (type !== 'windows'),
						};
					};
					return os;
				});
						
				//=====================================
				// Misc functions
				//=====================================

				tools.getDefaultLanguage = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								alt: {
									type: 'bool',
									optional: true,
									description: "'true' will returns the alternate language. 'false' will returns the default language. Default is 'false'.",
								},
							},
							returns: 'string',
							description: "Returns default or alternate language.",
				}
				//! END_REPLACE()
				, function getDefaultLanguage(/*optional*/alt) {
					// TODO: Get OS language
					return 'en_US';
				});
				
				//=====================================
				// Files functions
				//=====================================
				
				files.rmdir = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 1,
							params: {
								path: {
									type: 'string,Path',
									optional: false,
									description: "Target folder path.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'undefined',
							description: "Removes specified system folder.",
				}
				//! END_REPLACE()
				, function rmdir(path, /*optional*/options) {
					// TODO: Async
					if (types.isString(path)) {
						path = tools.options.hooks.pathParser(path);
					};
					path = path.pushFile();
					const name = path.toString({
						os: null,
						dirChar: null,
						shell: 'api',
					});
					try {
						nodeFs.rmdirSync(name);
					} catch(ex) {
						if (ex.code === 'ENOENT') {
							// Do nothing
						} else if ((ex.code === 'ENOTEMPTY') && types.get(options, 'force', false)) {
							const dirFiles = nodeFs.readdirSync(name);
							for (let i = 0; i < dirFiles.length; i++) {
								const newPath = path.combine(null, {
									file: dirFiles[i],
								});
								const fname = newPath.toString({
									os: null,
									dirChar: null,
									shell: 'api',
								});
								try {
									nodeFs.unlinkSync(fname);
								} catch(ex) {
									if (ex.code === 'EPERM') {
										files.rmdir(newPath, options);
									} else {
										throw ex;
									};
								};
							};
							nodeFs.rmdirSync(name);
						} else {
							throw ex;
						};
					};
				});
				
				files.mkdir = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 1,
							params: {
								path: {
									type: 'string,Path',
									optional: false,
									description: "Target folder path.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'undefined',
							description: "Creates specified system folder.",
				}
				//! END_REPLACE()
				, function mkdir(path, /*optional*/options) {
					// TODO: Async
					if (types.isString(path)) {
						path = tools.options.hooks.pathParser(path);
					};
					path = path.pushFile();
					if (types.get(options, 'makeParents', false)) {
						const dir = path.path;
						for (let i = 0; i < dir.length; i++) {
							const name = path.toString({
								path: dir.slice(0, i + 1),
								file: null,
								shell: 'api',
							});
							try {
								nodeFs.mkdirSync(name);
							} catch(ex) {
								if (ex.code !== 'EEXIST') {
									throw ex;
								};
							};
						};
					} else {
						const name = path.toString({
							os: null,
							dirChar: null,
							shell: 'api',
						});
						try {
							nodeFs.mkdirSync(name);
						} catch(ex) {
							if (ex.code !== 'EEXIST') {
								throw ex;
							};
						};
					};
				});
				
				files.copy = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 1,
							params: {
								source: {
									type: 'string,Path',
									optional: false,
									description: "Source folder or file path.",
								},
								destination: {
									type: 'string,Path',
									optional: false,
									description: "Destination folder or file path.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'undefined',
							description: "Copies source file or folder to destination.",
				}
				//! END_REPLACE()
				, function copy(source, destination, /*optional*/options) {
					// TODO: Async
					// TODO: Option to preserve timestamps
					if (types.isString(source)) {
						source = tools.options.hooks.pathParser(source);
					};
					if (types.isString(destination)) {
						destination = tools.options.hooks.pathParser(destination);
					};
					const stats = nodeFs.statSync(source.toString({os: null, dirChar: null, shell: 'api'}));
					if (stats.isFile()) {
						if (!destination.file) {
							destination.file = source.file;
						};
						const sourceFd = nodeFs.openSync(source.toString({os: null, dirChar: null, shell: 'api'}), 'r'),
							destFd = nodeFs.openSync(destination.toString({os: null, dirChar: null, shell: 'api'}), (types.get(options, 'override', false) ? 'w' : 'wx')),
							buf = new Buffer(4096);
						let bytesRead = 0;
						do {
							bytesRead = nodeFs.readSync(sourceFd, buf, null, buf.length);
							if (bytesRead) {
								nodeFs.writeSync(destFd, buf, 0, bytesRead);
							};
						} while (bytesRead)
						nodeFs.closeSync(sourceFd);
						nodeFs.closeSync(destFd);
					} else if (stats.isDirectory() && types.get(options, 'recursive', false)) {
						source = source.pushFile();
						destination = destination.pushFile();
						files.mkdir(destination, options);
						const dirFiles = nodeFs.readdirSync(source.toString({os: null, dirChar: null, shell: 'api'}));
						for (let i = 0; i < dirFiles.length; i++) {
							const dirFile = dirFiles[i];
							files.copy(source.combine(null, {file: dirFile}), destination.combine(null, {file: dirFile}), options);
						};
					} else if (!types.get(options, 'skipInvalid', false)) {
						throw new types.Error("Invalid file or folder : '~0~'.", [source.toString({os: null, dirChar: null, shell: 'api'})]);
					};
				});
				
				files.readdir = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								path: {
									type: 'string,Path',
									optional: false,
									description: "Target folder path.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'undefined',
							description: "Returns files and folders list with stats.",
				}
				//! END_REPLACE()
				, function readdir(path, /*optional*/options) {
					if (types.isString(path)) {
						path = tools.options.hooks.pathParser(path);
					};
					path = path.pushFile();
					const name = path.toString({
						os: null,
						dirChar: null, 
						shell: 'api',
					});
					const Promise = tools.getPromise(),
						async = types.get(options, 'async');

					return new Promise(function(resolve, reject) {
						const result = [];
						
						function proceed(files) {
							function getStats(file) {
								const filePath = path.combine(null, {
									file: file,
								});
								function addFile(stats) {
									result.push({
										name: file,
										path: filePath,
										isFolder: stats.isDirectory(), // || stats.isBlockDevice || stats.isCharacterDevice(),
										size: stats.size, // bytes
										// ...
									});
									proceed(files);
								};
								if (async) {
									nodeFs.stat(filePath.toString({os: null, dirChar: null, shell: 'api'}), function(ex, stats) {
										if (ex) {
											reject(ex);
										} else {
											addFile(stats);
										};
									});
								} else {
									addFile(nodeFs.statSync(filePath.toString({os: null, dirChar: null, shell: 'api'})));
								};
							};
							
							const file = files.shift();
							if (file) {
								getStats(file);
							} else {
								resolve(result);
							};
						};
						
						if (async) {
							nodeFs.readdir(name, function(ex, files) {
								if (ex) {
									reject(ex);
								} else {
									proceed(files);
								};
							});
						} else {
							proceed(nodeFs.readdirSync(name));
						};
					});
				});
				
				files.getTempFolder = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 1,
							params: null,
							returns: 'string',
							description: "Returns system temporary folder path.",
				}
				//! END_REPLACE()
				, function() {
					if (__Internal__.tmpdir) {
						return __Internal__.tmpdir;
					};
					let folder = nodeOs.tmpdir(); // ??? it looks like my code before revision 1
					let stats = null;
					try {
						stats = nodeFs.statSync(folder)
					} catch(ex) {
					};
					if (!stats || !stats.isDirectory()) {
						// Android or other
						folder = tools.Path.parse(process.cwd()).pushFile().combine('tmp/', {os: 'linux'});
						try {
							files.mkdir(folder);
						} catch(ex) {
						};
						folder = folder.toString({os: null});
					};
					var os = tools.getOS();
					if (folder[folder.length - 1] !== os.dirChar) {
						folder += os.dirChar;
					};
					__Internal__.tmpdir = folder;
					return folder;
				});
				
				files.readFile = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 1,
							params: {
								path: {
									type: 'string,Url,Path',
									optional: false,
									description: "File Url or Path.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'Promise',
							description: "Reads a remote or local file.",
				}
				//! END_REPLACE()
				, function readFile(path, /*optional*/options) {
					const Promise = tools.getPromise();
					return new Promise(function(resolve, reject) {
						path = tools.options.hooks.urlParser(path, types.get(options, 'parseOptions'));
						const async = types.get(options, 'async', false),
							encoding = types.get(options, 'encoding', null),
							timeout = types.get(options, 'timeout', 0) || 5000;  // Don't allow "0" (for infinite)
						if (!async) {
							// TODO: Synchronous read
							throw new types.NotSupported("Synchronous read is not implemented.");
						};
						const state = {
								request: null,
								ready: false,
								timeoutId: null,
								data: null,
						};
						if ((path instanceof tools.Path) || ((path instanceof tools.Url) && ((!path.protocol) || (path.protocol === 'file')))) {
							if (path instanceof tools.Url) {
								path = tools.Path.parse(path);
							};
							path = path.toString({
								os: null,
								dirChar: null,
								shell: 'api',
							});
			
							try {
								state.timeoutId = setTimeout(function(ev) {
									state.timeoutId = null;
									if (!state.ready) {
										state.ready = true;
										if (state.request) {
											// TODO: Call the real method when it will be implemented by NodeJs
											state.request.abort && state.request.abort();
											state.request = null;
										};
										reject(new types.TimeoutError("Request has timed out."));
									};
								}, timeout);
								// NOTE: There is no returned value like a "request" object. It has been written for the future.
								state.request = nodeFs.readFile(path, {encoding: encoding}, function(ex, data) {
									if (state.timeoutId) {
										clearTimeout(state.timeoutId);
										state.timeoutId = null;
									};
									if (!state.ready) {
										state.ready = true;
										state.request = null;
										if (ex) {
											reject(ex);
										} else {
											resolve(data);
										};
									};
								});
								//if (!async) {
								//  NOTE: We avoid the use of "readFileSync" because it has no timeout option.
								//	TODO: Wait request completion (thread lock or thread pause or something else)
								//};
							} catch(ex) {
								if (state.timeoutId) {
									clearTimeout(state.timeoutId);
									state.timeoutId = null;
								};
								if (!state.ready) {
									state.ready = true;
									state.request = null;
									reject(ex);
								};
							};
						} else {
							// "path" is a URL
							// TODO: HTTPS
							if (path.protocol === 'http') {
								if (!encoding) {
									// TODO: Implement binary
									throw new types.NotSupported("Binary data not supported.");
								};
								const onEnd = function onEnd(ex) {
									if (state.timeoutId) {
										clearTimeout(state.timeoutId);
										state.timeoutId = null;
									};
									if (!state.ready) {
										state.ready = true;
										if (ex) {
											reject(ex);
										} else {
											resolve(state.data);
										};
										state.data = null;
										state.request = null;
									};
								};
								try {
									const user = types.get(options, 'user', undefined),
										password = types.get(options, 'password', undefined);
									let auth = null;
									if (user || password) {
										auth = (user || '') + (password ? (':' + password) : '');
									};
									state.request = nodeHttp.request({
										hostname: path.domain || 'localhost',
										port: path.port || 80,
										path: (tools.trim(path.path, '/', -1) || '') + '/' + (path.file || ''),
										method: types.get(options, 'method', 'GET').toUpperCase(),
										headers: types.get(options, 'headers', undefined), // defaults to "no header"
										auth: auth,
										agent: types.get(options, 'connectionPool', false), // defaults to "no pool"
										keepAlive: types.get(options, 'keepAlive', false), // defaults to "don't keep alive"
										keepAliveMsecs: types.get(options, 'keepAliveInterval', undefined),  // defaults to nodejs's default value
									}, function(response) {
										if (encoding) {
											response.setEncoding(encoding);
										};
										response.on('data', function(chunk) {
											// TODO: Implement binary
											//if (!encoding) {
											//	chunk = chunk.????
											//};
											state.data = (state.data || '') + chunk;
										});
										response.on('error', onEnd);
										response.on('end', onEnd);
										response.on('close', function() {
											onEnd(new types.Error("The transfer has been interrupted."));
										});
									});
									state.request.on('error', onEnd);
									const body = types.get(options, 'body', null);
									if (body) {
										state.request.write(body);
									};
									state.timeoutId = setTimeout(function(ev) {
										state.timeoutId = null;
										if (!state.ready) {
											if (state.request) {
												state.request.abort();
												state.request = null;
											};
											onEnd(new types.TimeoutError("Request has timed out."));
										};
									}, timeout);
									state.request.end();
								} catch(ex) {
									onEnd(ex);
									throw ex;
								};
								
							} else {
								throw new types.NotSupported("Unsupported protocol.");
							};
						};
					});
				});

				files.watch = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 2,
							params: {
								path: {
									type: 'string,Url,Path',
									optional: false,
									description: "File Url or Path.",
								},
								callbacks: {
									type: 'arrayof(function),function',
									optional: false,
									description: "Callback functions.",
								},
							},
							returns: 'undefined',
							description: "Creates a file watcher.",
				}
				//! END_REPLACE()
				, function watch(path, callbacks, /*optional*/options) {
					if (!types.isArray(callbacks)) {
						callbacks = [callbacks];
					};
					
					if ((path instanceof tools.Path) || ((path instanceof tools.Url) && ((!path.protocol) || (path.protocol === 'file')))) {
						if (path instanceof tools.Url) {
							path = tools.Path.parse(path);
						};
						path = path.toString({
							os: null,
							dirChar: null,
							shell: 'api',
						});
						
						let fileCallbacks;
						if (types.hasKey(__Internal__.watchedFiles, path)) {
							fileCallbacks = __Internal__.watchedFiles[path];
						} else {
							fileCallbacks = [];
							// TODO: Make "doodad.Callback" available here
							//nodeFs.watch(path, {persistent: false}, new doodad.Callback(function(event, filename) {
							nodeFs.watch(path, {persistent: false}, function(event, filename) {
								try { // "try" IS TEMPORARY UNTIL "doodad.Callback" IS AVAILABLE
									const callbacks = __Internal__.watchedFiles[path];
									for (let i = callbacks.length - 1; i >= 0; i--) {
										let callback = callbacks[i];
										if (callback) {
											callback.apply(this, arguments);
											if (types.get(callback.__OPTIONS__, 'once', false)) {
												callback = null;
											};
										};
										if (!callback) {
											callbacks.splice(i, 0);
										};
									};
								} catch(ex) {
									console.error(ex.stack);
								};
							});
						};
						
						tools.forEach(callbacks, function(callback) {
							callback.__OPTIONS__ = options;
						});
						
						__Internal__.watchedFiles[path] = tools.unique(fileCallbacks, callbacks);
						
					} else {
						throw new types.NotSupported("Remote files are not supported.");
					};
				});
				
				
			//===================================
			// Child process extension
			//===================================
					
			nodejs.forkSync = root.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							modulePath: {
								type: 'string',
								optional: false,
								description: "JS script file path.",
							},
							args: {
								type: 'arrayof(string)',
								optional: true,
								description: "Script arguments.",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Spawn options.",
							},
						},
						returns: 'undefined',
						description: "Forks the current V8 engine and synchronously runs the specified JS file.",
			}
			//! END_REPLACE()
			, function forkSync(modulePath, /*optional*/args, /*optional*/options) {
				args = types.append([], process.execArgv, [modulePath], args);
				options = types.extend({}, {stdio: [0, 1, 2], env: process.env}, options);
				return nodeChildProcess.spawnSync(process.execPath, args, options);
			});
					
			//=====================================
			// Package functions
			//=====================================
			
			nodejs.getPackageInfo = root.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: null,
						returns: 'object',
						description: "Returns informations on the NodeJs package if any.",
			}
			//! END_REPLACE()
			, function getPackageInfo() {
				if (!_options.settings.packageName) {
					return null;
				};
				return {
					name: _options.settings.packageName,
					//version: tools.Version.parse(_options.settings.packageVersion),
					version: _options.settings.packageVersion,
				};
			});

	

			nodejs.requireModule = root.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							name: {
								type: 'string',
								optional: false,
								description: "Module name",
							},
						},
						returns: 'any',
						description: "Loads the specified module and returns its 'export' value.",
			}
			//! END_REPLACE()
			, function requireModule(name) {
				return _options.hooks.buildModule.require2(name);
			});
			
			
			nodejs.resolveClientModule = root.DD_DOC(
			//! REPLACE_BY("null")
			{
						author: "Claude Petit",
						revision: 0,
						params: {
							name: {
								type: 'string',
								optional: false,
								description: "Module name",
							},
						},
						returns: 'any',
						description: "Loads the specified module and returns its 'export' value.",
			}
			//! END_REPLACE()
			, function resolveClientModule(name) {
				return _options.hooks.distModule.require2.resolve(name);
			});
			
			
			//=====================================
			// Console
			//=====================================
			
			nodejs.Console = root.DD_DOC(
				//! REPLACE_BY("null")
				{
						author: "Claude Petit",
						revision: 0,
						params: {
							hook: {
								type: 'function',
								optional: false,
								description: 
									"Hook function. Arguments :\n" + 
									"  (string) name : Called function name ('log', 'info', 'warn' or 'error')\n" + 
									"  (arrayof(any)) args : Arguments passed to function\n" +
									"Hook function should returns the desired message to send to NodeJS Console, or 'undefined'.",
							}, 
							stdout: {
								type: 'object',
								optional: true,
								description: "Writable NodeJs output stream. Default is 'process.stdout'.",
							}, 
							stderr: {
								type: 'object',
								optional: true,
								description: "Writable NodeJs stream for errors. Default is 'stdout'.",
							},
						},
						returns: 'Console',
						description: "NodeJS Console with hooks.",
			}
			//! END_REPLACE()
			, types.createType("Console", nodeConsole, 
				/*constructor*/
				function(hook, /*optional*/stdout, /*optional*/stderr) {
					if (!types.isJsFunction(hook)) {
						throw new types.TypeError("Invalid hook function.");
					};
					this.__hook = hook;
					this.__hasStd = !!stdout || !!stderr;
					if (!stdout) {
						stdout = process.stdout;
					};
					if (!stderr) {
						stderr = stdout;
					};
					return nodeConsole.call(this, stdout, stderr);
				}, 
				/*typeProto*/
				{
					__oldConsole: null,
					
					capture: root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: {
									hook: {
										type: 'function',
										optional: false,
										description: 
											"Hook function. Arguments :\n" + 
											"  (string) name : Called function name ('log', 'info', 'warn' or 'error')\n" + 
											"  (arrayof(any)) args : Arguments passed to function\n" +
											"Hook function should returns the desired message to send to NodeJS Console, or 'undefined'.",
									}, 
									stdout: {
										type: 'object',
										optional: true,
										description: "Writable NodeJs output stream. Default is 'process.stdout'.",
									}, 
									stderr: {
										type: 'object',
										optional: true,
										description: "Writable NodeJs stream for errors. Default is 'stdout'.",
									},
								},
								returns: 'undefined',
								description: "Captures the console.",
					}
					//! END_REPLACE()
					, function capture(hook, /*optional*/stdout, /*optional*/stderr) {
						if (!this.__oldConsole) {
							this.release();
							const newConsole = new this(hook, stdout, stderr),
								oldConsole = global.console;
							types.defineProperty(global, 'console', {
								configurable: true,
								enumerable: true,
								value: newConsole,
								writable: !types.hasDefinePropertyEnabled(),
							});
							this.__oldConsole = oldConsole;
						};
					}),
					
					release: root.DD_DOC(
					//! REPLACE_BY("null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'undefined',
								description: "Releases the console previously captured.",
					}
					//! END_REPLACE()
					, function release() {
						if (this.__oldConsole) {
							types.defineProperty(global, 'console', {
								configurable: true,
								enumerable: true,
								value: this.__oldConsole,
								writable: !types.hasDefinePropertyEnabled(),
							});
							this.__oldConsole = null;
						};
					}),
				},
				/*instanceProto*/
				{
					__hook: null,
					__hasStd: false,
					
					log: types.SUPER(function(/*paramarray*/) {
						const message = this.__hook('log', types.toArray(arguments));
						if (this.__hasStd) {
							if (message) {
								this._super(message);
							} else {
								this._super.apply(this, arguments);
							};
						};
					}),
					
					info: types.SUPER(function(/*paramarray*/) {
						const message = this.__hook('info', types.toArray(arguments));
						if (this.__hasStd) {
							if (message) {
								this._super(message);
							} else {
								this._super.apply(this, arguments);
							};
						};
					}),
					
					error: types.SUPER(function(/*paramarray*/) {
						const message = this.__hook('error', types.toArray(arguments));
						if (this.__hasStd) {
							if (message) {
								this._super(message);
							} else {
								this._super.apply(this, arguments);
							};
						};
					}),
					
					warn: types.SUPER(function(/*paramarray*/) {
						const message = this.__hook('warn', types.toArray(arguments));
						if (this.__hasStd) {
							if (message) {
								this._super(message);
							} else {
								this._super.apply(this, arguments);
							};
						};
					}),
				}
			));

			

			return function init(/*optional*/options) {
				// ES6 Promise polyfills
				try {
					tools.getPromise();
				} catch(ex) {
					let Promise;
					try {
						// tiny Promise/A+ implementation
						Promise = require('rsvp').Promise;
					} catch(ex) {
						try {
							// subset of RSVP
							Promise = require('es6-promise').Promise;
						} catch(ex) {
						};
					};
					if (types.isFunction(Promise)) {
						tools.setPromise(Promise);
					};
				};
				

				
				if (!_options.hooks.buildModule) {
					_options.hooks.buildModule = require('../../../index.js');
					// <PRB> "module.require" gets deleted
					_options.hooks.buildModule.require2 = _options.hooks.buildModule.require;
				};
				if (!_options.hooks.distModule) {
					_options.hooks.distModule = _options.hooks.buildModule;
					// <PRB> "module.require" gets deleted
					_options.hooks.distModule.require2 = _options.hooks.distModule.require;
				};
				
				
				// <PRB> "module.require.resolve" is missing
				if (!types.isFunction(_options.hooks.distModule.require2.resolve)) {
					const distPath = tools.Path.parse(_options.hooks.distModule.filename, {file: ''});
					_options.hooks.distModule.require2.resolve = function resolve(path) {
						return require.resolve(distPath.combine(path, {os: 'linux', dirChar: ['/', '\\'], isRelative: true}).toString())
					};
				};
				
			};
		},
	};
})();