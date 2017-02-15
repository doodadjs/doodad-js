//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: NodeJs.js - Node.js Tools
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
		DD_MODULES['Doodad.NodeJs/root'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			namespaces: ['MixIns', 'Interfaces'],
			dependencies: [
				'Doodad.Types', 
				'Doodad.Tools', 
				'Doodad.Tools.Config', 
				'Doodad.Tools.Files', 
				'Doodad'
			],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";
				
				const doodad = root.Doodad,
					mixIns = doodad.MixIns,
					extenders = doodad.Extenders,
					namespaces = doodad.Namespaces,
					types = doodad.Types,
					tools = doodad.Tools,
					config = tools.Config,
					files = tools.Files,
					nodejs = doodad.NodeJs,
					nodejsMixIns = nodejs.MixIns,
					nodejsInterfaces = nodejs.Interfaces,
					
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
					caseSensitive: null,
				};
				
				//===================================
				// Natives
				//===================================
				
				types.complete(_shared.Natives, {
					// "isBuffer"
					globalBuffer: global.Buffer,
					globalBufferIsBuffer: types.isFunction(global.Buffer.isBuffer) && global.Buffer.isBuffer,

					// "callAsync", "readFile"
					windowSetTimeout: global.setTimeout,
					windowClearTimeout: global.clearTimeout,

					// "callAsync"
					windowSetImmediate: global.setImmediate,
					windowClearImmediate: global.clearImmediate,
					processNextTick: global.process.nextTick,
					
					// "catchAndExit"
					process: global.process,
					processExit: global.process.exit,

					// "addAppListener", "removeAppListener"
					processOn: types.bind(global.process, global.process.on),
					processRemoveListener: types.bind(global.process, global.process.removeListener),
				});
				
				//===================================
				// Buffers
				//===================================
				
				types.ADD('isBuffer', (_shared.Natives.globalBufferIsBuffer || (function(buffer) {
					if (types.isNothing(obj)) {
						return false;
					};
					return (typeof obj === 'object') && (buffer instanceof _shared.Natives.globalBuffer);
				})));
				
				//if (global.global.Uint8Array) {
				//	// Source: http://stackoverflow.com/questions/23822724/nodejs-javascript-typedarray-to-buffer-to-string-and-back-again
				//	// TODO: Test and Check if there is a faster way
				//	types.ADD('typedArrayToBuffer', function typedArrayToBuffer(ab) {
				//		const buffer = new global.Buffer(ab.byteLength);
				//		const view = new global.Uint8Array(ab);
				//		for (let i = 0; i < buffer.length; i++) {
				//			buffer[i] = view[i];
				//		}
				//		return buffer;
				//	});
				//} else {
				//	types.ADD('typedArrayToBuffer', function typedArrayToBuffer(ab) {
				//		throw new types.NotSupported("'typedArrayToBuffer' is not supported.");
				//	});
				//};

				//===================================
				// Emitters
				//===================================
				
				types.ADD('isEmitter', function isEmitter(emitter) {
					// <PRB> Node.Js has no object models, so we must test for functions.
					return types.isFunction(emitter.prependListener) &&
						types.isFunction(emitter.prependOnceListener) &&
						types.isFunction(emitter.addListener) &&
						types.isFunction(emitter.emit) &&
						types.isFunction(emitter.getMaxListeners) &&
						types.isFunction(emitter.listenerCount) &&
						types.isFunction(emitter.listeners) &&
						types.isFunction(emitter.on) &&
						types.isFunction(emitter.once) &&
						types.isFunction(emitter.removeAllListeners) &&
						types.isFunction(emitter.removeListener) &&
						types.isFunction(emitter.setMaxListeners)
				});
				
				//===================================
				// Streams
				//===================================
				
				types.ADD('isReadableStream', function isReadableStream(stream) {
					// <PRB> Node.Js has no object models, so we must test for functions.
					return types.isEmitter(stream) &&
						types.isFunction(stream.isPaused) &&
						types.isFunction(stream.pause) &&
						types.isFunction(stream.pipe) &&
						types.isFunction(stream.read) &&
						types.isFunction(stream.resume) &&
						types.isFunction(stream.setEncoding) &&
						types.isFunction(stream.unpipe) &&
						types.isFunction(stream.push) &&
						types.isFunction(stream.unshift) &&
						types.isFunction(stream.wrap)
				});
				
				types.ADD('isWritableStream', function isWritableStream(stream) {
					// <PRB> Node.Js has no object models, so we must test for functions.
					return types.isEmitter(stream) &&
						//types.isFunction(stream.cork) &&
						//types.isFunction(stream.uncork) &&
						//types.isFunction(stream.setDefaultEncoding) &&
						types.isFunction(stream.write) &&
						types.isFunction(stream.end)
				});
				
				types.ADD('isDuplexStream', function isDuplexStream(stream) {
					// <PRB> Node.Js has no object models, so we must test for functions.
					return types.isReadableStream(stream) && types.isWritableStream(stream);
				});
				
				types.ADD('isTransformStream', function isTransformStream(stream) {
					// <PRB> Node.Js has no object models, so we must test for functions.
					return types.isReadableStream(stream) && 
						types.isWritableStream(stream) &&
						types.isFunction(stream._transform);
				});
				
				types.ADD('isStream', function isStream(stream) {
					// <PRB> Node.Js has no object models, so we must test for functions.
					return types.isReadableStream(stream) || types.isWritableStream(stream);
				});
				

				//===================================
				// types.DESTROY hook
				//===================================

				__Internal__.oldDESTROY = _shared.DESTROY;
				_shared.DESTROY = function(obj) {
					if (types.isObject(obj) && !types.getType(obj) && types.isFunction(obj.destroy)) {
						if (!obj.destroyed) {
							if (types.isEmitter(obj)) {
								// <PRB> Events may still occur even after "destroy".
								obj.removeAllListeners();
							};
							obj.destroy();
						};
					} else {
						__Internal__.oldDESTROY(obj);
					};
				};

				//===================================
				// Application events
				//===================================

				//===================================
				// Promise events
				//===================================

				__Internal__.unhandledErrorEvent = new types.Map();
				__Internal__.unhandledRejectionEvent = new types.Map();
				__Internal__.handledRejectionEvent = new types.Map();

				types.ADD('addAppEventListener', function addAppEventListener(event, listener) {
					if (event === 'unhandlederror') {
						if (!__Internal__.unhandledErrorEvent.has(listener)) {
							const handler = function(err) {
								listener(new types.CustomEvent('unhandlederror', {
									detail: {
										error: err,
									}
								}));
							};
							_shared.Natives.processOn('uncaughtException', handler);
							__Internal__.unhandledErrorEvent.set(listener, handler);
						};
					} else if (event === 'unhandledrejection') {
						// FUTURE: Use new standardized method (with the GC).
						if (!__Internal__.unhandledRejectionEvent.has(listener)) {
							const handler = function(reason, promise) {
								listener(new types.CustomEvent('unhandledrejection', {
									detail: {
										reason: reason,
										promise: promise,
									}
								}));
							};
							_shared.Natives.processOn('unhandledRejection', handler);
							__Internal__.unhandledRejectionEvent.set(listener, handler);
						};
					} else if (event === 'rejectionhandled') {
						// FUTURE: Use new standardized method (with the GC).
						if (!__Internal__.handledRejectionEvent.has(listener)) {
							const handler = function(promise) {
								listener(new types.CustomEvent('rejectionhandled', {
									detail: {
										promise: promise,
									}
								}));
							};
							_shared.Natives.processOn('rejectionHandled', handler);
							__Internal__.handledRejectionEvent.set(listener, handler);
						};
					} else {
						throw new types.Error("Unknow application event '~0~'.", [event]);
					};
				});
				
				types.ADD('removeAppEventListener', function removeAppEventListener(event, listener) {
					if (event === 'unhandlederror') {
						if (__Internal__.unhandledErrorEvent.has(listener)) {
							const handler = __Internal__.unhandledErrorEvent.get(listener);
							_shared.Natives.processRemoveListener('uncaughtException', handler);
							__Internal__.unhandledErrorEvent.delete(listener);
						};
					} else if (event === 'unhandledrejection') {
						if (__Internal__.unhandledRejectionEvent.has(listener)) {
							const handler = __Internal__.unhandledRejectionEvent.get(listener);
							_shared.Natives.processRemoveListener('unhandledRejection', handler);
							__Internal__.unhandledRejectionEvent.delete(listener);
						};
					} else if (event === 'rejectionhandled') {
						if (__Internal__.handledRejectionEvent.has(listener)) {
							const handler = __Internal__.handledRejectionEvent.get(listener);
							_shared.Natives.processRemoveListener('rejectionHandled', handler);
							__Internal__.handledRejectionEvent.delete(listener);
						};
					} else {
						throw new types.Error("Unknow application event '~0~'.", [event]);
					};
				});
				
				//===================================
				// Asynchronous functions
				//===================================
				
				tools.ADD('callAsync', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 4,
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
									cancelable: {
										type: 'bool',
										optional: true,
										description: "'true': function will return an object with a 'cancel' method. Otherwise, will return 'undefined'.",
									},
									secret: {
										type: 'any',
										optional: true,
										description: "Secret.",
									},
								},
								returns: 'undefined,object',
								description: "Asynchronously calls a function.",
					}
					//! END_REPLACE()
					, function callAsync(fn, /*optional*/delay, /*optional*/thisObj, /*optional*/args, /*optional*/cancelable, /*optional*/secret) {
						if (types.isNothing(delay)) {
							delay = -1;
						};
						fn = doodad.Callback(thisObj, fn, null, args, secret);
						if (delay === 0) {
							// Raised after events queue process and after I/O
							const id = _shared.Natives.windowSetImmediate(fn);
							return (cancelable && {
								cancel: function cancel() {
									_shared.Natives.windowClearImmediate(id);
								},
							} || undefined);
						} else if (delay < 0) {
							// Raised after events queue process and before I/O
							if (cancelable) {
								let cancelled = false;
								_shared.Natives.processNextTick(function() {
									if (!cancelled) {
										fn();
									};
								});
								return {
									cancel: function cancel() {
										cancelled = true;
									},
								};
							} else {
								_shared.Natives.processNextTick(fn);
							};
						} else {
							// Raised after X ms
							const id = _shared.Natives.windowSetTimeout(fn, delay);
							return (cancelable && {
								cancel: function cancel() {
									_shared.Natives.windowClearTimeout(id);
								},
							} || undefined);
						};
					}));
				
				//=====================================
				// Shutdown & Exit
				//=====================================
				
				__Internal__.catchAndExitCalled = false;
				
				tools.ADD('catchAndExit', function catchAndExit(err) {
					// NOTE: This is the last resort error handling.
					// NOTE: types.ScriptAbortedError should bubbles here
					
					if (!__Internal__.catchAndExitCalled) {
						__Internal__.catchAndExitCalled = true;
						
						_shared.Natives.process.exitCode = 1; // 1 = General error

						try {
							if (types._instanceof(err, types.ScriptAbortedError)) {
								_shared.Natives.process.exitCode = err.exitCode;
							} else {
								doodad.trapException(err);
							};
						} catch(o) {
							if (root.getOptions().debug) {
								debugger;
							};
						};
						
						try {
							tools.dispatchEvent(new types.CustomEvent('exit', {cancelable: false, detail: {exitCode: _shared.Natives.process.exitCode}})); // sync
						} catch(o) {
							if (root.getOptions().debug) {
								debugger;
							};
						};
						
						tools.callAsync(_shared.Natives.processExit, 0);
					};
					
					throw err;
				});
				
				//=====================================
				// "Client.js" Extension
				//=====================================
				
					//===================================
					// Location functions
					//===================================
				
					tools.ADD('getCurrentLocation', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							path = files.Path.parse(process.argv[1]),
							url = files.Url.parse(path);
						for (let i = 2; i < process.argv.length; i++) {
							args.push(process.argv[i]);
						};
						return url.set({
							args: url.args.set(args),
						});
					}));
					
					tools.ADD('setCurrentLocation', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							root.DD_ASSERT(types.isStringAndNotEmpty(url) || types._instanceof(url, files.Url), "Invalid url.");
						};
						
						if (types.isString(url)) {
							url = files.Url.parse(url);
						};
						
						if (url.protocol !== 'file') {
							throw new types.Error("Invalid url.");
						};
						
						let args;
						if (url.args) {
							args = url.args.toString(args, {
								noEscapes: false,
							});
							args = args && args.split('&');
						};
						
						url = files.Path.parse(url).toString({
							os: null,
							dirChar: null,
						});

						// Remove unwanted "node" args
						const execArgs = tools.filter(process.execArgv, function(arg) {
							return (arg.split('=')[0] !== '--debug-brk');
						});

						args = types.append([], execArgs, [url], args);

						const child = nodeChildProcess.spawn(process.execPath, args, {
							env: process.env,
							stdio: [0, 1, 2],
						});
						
						if (!dontAbort) {
							// Exit parent process. Spawned child should stay alive.
							throw new types.ScriptAbortedError();
						};
					}));
					
					//===================================
					// Script loader functions
					//===================================

					__Internal__.ScriptLoader = types.CustomEventTarget.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'ScriptLoader',
							$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('ScriptLoader')), true) */,
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
					
					tools.ADD('getJsScriptFileLoader', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						if (types._instanceof(file, files.Url)) {
							file = files.Path.parse(file);
						};

						if (types._instanceof(file, files.Path)) {
							file = file.toString({
								os: null,
								dirChar: null,
							});
						};

						root.DD_ASSERT && root.DD_ASSERT(types.isString(file), "Invalid file.");
						
						let loader = null;
						if (types.has(__Internal__.loadedScripts, file)) {
							loader = __Internal__.loadedScripts[file];
						};
						if (reload) {
							loader = null;
						};
						if (!loader) {
							__Internal__.loadedScripts[file] = loader = new __Internal__.ScriptLoader(/*file*/file, /*createOptions*/null, /*initOptions*/null);
						};
						
						return loader;
					}));
					
				
				//=====================================
				// "Tools.js" Extension
				//=====================================
				
					//===================================
					// System functions
					//===================================
					
					tools.ADD('getOS', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 3,
								params: null,
								returns: 'object',
								description: "Returns OS information.",
					}
					//! END_REPLACE()
					, function getOS() {
						let os = __Internal__.os;
						if (!os) {
							const type = nodeOs.type(),
								platform = nodeOs.platform();
							os = types.freezeObject(types.nullObject({
								name: platform,
								type: ((type === 'Windows_NT') ? 'windows' : ((type === 'Linux') ? 'linux' : 'unix')),
								//mobile: false, // TODO: "true" for Android, Windows CE, Windows Mobile, iOS, ...
								architecture: nodeOs.arch(),
								dirChar: nodePath.sep,
								newLine: nodeOs.EOL,
								caseSensitive: !!__Internal__.caseSensitive,
							}));
							if (__Internal__.caseSensitive !== null) {
								__Internal__.os = os;
							};
						};
						return os;
					}));
							
					//=====================================
					// Misc functions
					//=====================================

					tools.ADD('getDefaultLanguage', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
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
						// TODO: Windows
						const lang = process.env.LANG || '';
						return lang.split('.')[0] || 'en_US';
					}));
					
				//===================================
				// Config
				//===================================
				
				__Internal__.oldLoadConfig = _shared.loadConfig;
				
				_shared.loadConfig = function loadConfig(path, /*optional*/options, /*optional*/callbacks) {
					if (types.isString(path)) {
						path = _shared.pathParser(path, types.get(options, 'parseOptions'));
					};
					return __Internal__.oldLoadConfig(path, options, callbacks);
				};


				//=====================================
				// Files functions
				//=====================================
					
				files.ADD('rm', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							returns: 'bool,Promise(bool)',
							description: "Removes specified system file.",
				}
				//! END_REPLACE()
				, function rm(path, /*optional*/options) {
					const async = types.get(options, 'async', false);
					if (async) {
						const Promise = types.getPromise();
						return Promise.try(function tryRm() {
							const unlink = function unlink(path) {
								const name = path.toString({
									os: null,
									dirChar: null,
									shell: 'api',
								});
								return Promise.create(function doUnlink(resolve, reject) {
									nodeFs.unlink(name, function(ex) {
										if (ex) {
											if (ex.code === 'ENOENT') {
												resolve(false);
											} else {
												reject(ex);
											};
										} else {
											resolve(true);
										};
									});
								});
							};

							if (types.isString(path)) {
								path = files.Path.parse(path);
							};

							return unlink(path);
						});
					} else {
						try {
							nodeFs.unlinkSync(name);
						} catch(ex) {
							if (ex.code === 'ENOENT') {
								// Do nothing
							} else {
								throw ex;
							};
						};
						return true;
					};
				}));
					
				files.ADD('rmdir', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 3,
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
							returns: 'bool,Promise(bool)',
							description: "Removes specified system folder.",
				}
				//! END_REPLACE()
				, function rmdir(path, /*optional*/options) {
					const Promise = types.getPromise();

					const async = types.get(options, 'async', false),
						force = types.get(options, 'force', false);

					if (async) {
						return Promise.try(function tryRmDir() {
							const rmdir = function rmdir(path) {
								path = path.toString({
									os: null,
									dirChar: null,
									shell: 'api',
								});
								return Promise.create(function doRmDir(resolve, reject) {
									nodeFs.rmdir(path, function(err) {
										if (err) {
											reject(err);
										} else {
											resolve();
										};
									});
								});
							};

							const unlink = function unlink(path) {
								path = path.toString({
									os: null,
									dirChar: null,
									shell: 'api',
								});
								return Promise.create(function doUnlink(resolve, reject) {
									nodeFs.unlink(path, function(err) {
										if (err) {
											reject(err);
										} else {
											resolve();
										};
									});
								});
							};

							const readdir = function readdir(path) {
								path = path.toString({
									os: null,
									dirChar: null,
									shell: 'api',
								});
								return Promise.create(function doReadDir(resolve, reject) {
									nodeFs.readdir(path, function readdirCb(err, names) {
										if (err) {
											reject(err);
										} else {
											resolve(names);
										};
									});
								});
							};

							const deleteContent = function deleteContent(parent, names, index) {
								if (index < names.length) {
									const path = parent.combine(null, {
										file: names[index],
									});
									return unlink(path)
										.nodeify(function manageUnlinkResult(err, dummy) {
											if (err) {
												if (err.code === 'ENOENT') {
													return deleteContent(parent, names, index + 1);
												} else if (err.code === 'EPERM') {
													return proceed(path)
														.then(function deleteNextFile() {
															return deleteContent(parent, names, index + 1);
														});
												} else {
													throw err;
												};
											} else {
												return deleteContent(parent, names, index + 1);
											};
										});
								};
							};
							
							const proceed = function proceed(path) {
								return rmdir(path)
									.catch(function catchNotEmpty(err) {
										if (force && (err.code === 'ENOTEMPTY')) {
											return readdir(path)
												.then(function deletePathContent(names) {
													return deleteContent(path, names, 0);
												})
												.then(function deletePath(dummy) {
													return rmdir(path);
												});
										} else {
											throw err;
										};
									})
									.nodeify(function returnResult(err, dummy) {
										if (err) {
											if (err.code === 'ENOENT') {
												return false;
											} else {
												throw err;
											};
										} else {
											return true;
										};
									});
							};

							if (types.isString(path)) {
								path = files.Path.parse(path);
							};

							return proceed(path);
						});
					} else {
						if (types.isString(path)) {
							path = files.Path.parse(path);
						};
						const name = path.toString({
							os: null,
							dirChar: null,
							shell: 'api',
						});
						try {
							nodeFs.rmdirSync(name);
						} catch(ex) {
							if (ex.code === 'ENOENT') {
								return false;
							} else if ((ex.code === 'ENOTEMPTY') && types.get(options, 'force', false)) {
								const dirFiles = nodeFs.readdirSync(name);
								let dirFile;
								while (dirFile = dirFiles.shift()) {
									const newPath = path.combine(null, {
										file: dirFile,
									});
									const fname = newPath.toString({
										os: null,
										dirChar: null,
										shell: 'api',
									});
									try {
										nodeFs.unlinkSync(fname);
									} catch(ex) {
										if (ex.code === 'ENOENT') {
											// Do nothing
										} else if (ex.code === 'EPERM') {
											files.rmdir(newPath, options);
										} else {
											throw ex;
										};
									};
								};
								try {
									nodeFs.rmdirSync(name);
								} catch(ex) {
									if (ex.code === 'ENOENT') {
										return false;
									} else {
										throw ex;
									};
								};
							} else {
								throw ex;
							};
						};
						return true;
					};
				}));
					
				files.ADD('mkdir', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 5,
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
							returns: 'bool,Promise(bool)',
							description: "Creates specified system folder.",
				}
				//! END_REPLACE()
				, function mkdir(path, /*optional*/options) {
					const Promise = types.getPromise();
					if (types.isString(path)) {
						path = files.Path.parse(path);
					};
					path = path.pushFile();
					const async = types.get(options, 'async', false);
					const ignoreExists = types.get(options, 'ignoreExists', true);
					if (types.get(options, 'makeParents', false)) {
						const create = function(dir, index) {
							if (index < dir.length) {
								const name = path.toString({
									path: dir.slice(0, index + 1),
									os: null,
									dirChar: null,
									shell: 'api',
								});
								if (async) {
									return Promise.create(function nodeFsMkdirPromise(resolve, reject) {
										nodeFs.mkdir(name, function (ex) {
											if (ex) {
												if ((ignoreExists || (index < dir.length - 1)) && (ex.code === 'EEXIST')) {
													resolve(create(dir, ++index));
												} else {
													reject(ex);
												};
											} else {
												resolve(create(dir, ++index));
											};
										});
									});
								} else {
									try {
										nodeFs.mkdirSync(name);
									} catch(ex) {
										if ((!ignoreExists && (index === dir.length - 1)) || (ex.code !== 'EEXIST')) {
											throw ex;
										};
									};
									return create(dir, ++index);
								};
							} else {
								if (async) {
									return Promise.resolve(true);
								} else {
									return true;
								};
							};
						};
						return create(path.toArray({pathOnly: true, trim: true}), 0);
					} else {
						const name = path.toString({
							os: null,
							dirChar: null,
							shell: 'api',
						});
						if (async) {
							return Promise.create(function nodeFsMkdirPromise2(resolve, reject) {
								nodeFs.mkdir(name, function(ex) {
									if (ex) {
										if (ignoreExists && (ex.code === 'EEXIST')) {
											resolve(true);
										} else {
											reject(ex);
										};
									} else {
										resolve(true);
									};
								});
							});
						} else {
							try {
								nodeFs.mkdirSync(name);
							} catch(ex) {
								if (!ignoreExists || (ex.code !== 'EEXIST')) {
									throw ex;
								};
							};
							return true;
						};
					};
				}));
					
				files.ADD('copy', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 4,
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
							returns: 'bool,Promise(bool)',
							description: "Copies source file or folder to destination.",
				}
				//! END_REPLACE()
				, function copy(source, destination, /*optional*/options) {
					// TODO: Rewrite me
					const Promise = types.getPromise();
					if (types.isString(source)) {
						source = files.Path.parse(source);
					};
					if (types.isString(destination)) {
						destination = files.Path.parse(destination);
					};
					const async = types.get(options, 'async', false),
						bufferLength = types.get(options, 'bufferLength', 4096),
						preserveTimes = types.get(options, 'preserveTimes', true),
						override = types.get(options, 'override', false),
						recursive = types.get(options, 'recursive', false),
						skipInvalid = types.get(options, 'skipInvalid', false);
					if (async) {
						return Promise.create(function copyPromise(resolve, reject) {
							nodeFs.lstat(source.toString({os: null, dirChar: null, shell: 'api'}), function(ex, stats) {
								if (ex) {
									reject(ex);
								} else {
									if (stats.isSymbolicLink()) {
										// Copy symbolic link
										if (!destination.file) {
											destination = destination.set({ file: source.file });
										};
										nodeFs.readlink(source.toString({ os: null, dirChar: null, shell: 'api' }), function(ex, linkString) {
											if (ex) {
												reject(ex);
											} else {
												const dest = destination.toString({ os: null, dirChar: null, shell: 'api' });
												nodeFs.symlink(linkString, dest, (stats.isFile() ? 'file' : 'dir'), function(ex) {
													if (ex) {
														reject(ex);
													} else if (preserveTimes) {
														nodeFs.utimes(dest, stats.atime, stats.mtime, function(ex) {
															if (ex) {
																reject(ex);
															} else {
																resolve(true);
															};
														});
													} else {
														resolve(true);
													};
												});
											};
										});
									} else if (stats.isFile()) {
										// Copy file
										if (!destination.file) {
											destination = destination.set({ file: source.file });
										};
										const dest = destination.toString({ os: null, dirChar: null, shell: 'api' });
										const copyFile = function copyFile(buf, sourceFd, destFd) {
											nodeFs.read(sourceFd, buf, null, buf.length, null, function(ex, bytesRead, _buf) {
												if (ex) {
													reject(ex);
												} else if (bytesRead) {
													nodeFs.write(destFd, _buf, 0, bytesRead, function(ex) {
														if (ex) {
															reject(ex);
														} else {
															copyFile(buf, sourceFd, destFd);
														};
													});
												} else {
													nodeFs.close(sourceFd, function(ex1) {
														nodeFs.close(destFd, function(ex2) {
															if (ex1 || ex2) {
																reject(ex1 || ex2);
															} else if (preserveTimes) {
																nodeFs.utimes(dest, stats.atime, stats.mtime, function(ex) {
																	if (ex) {
																		reject(ex);
																	} else {
																		resolve(true);
																	};
																});
															} else {
																resolve(true);
															};
														});
													});
												};
											});
										};
										nodeFs.open(source.toString({ os: null, dirChar: null, shell: 'api' }), 'r', function(ex, sourceFd) {
											if (ex) {
												reject(ex);
											};
											nodeFs.open(dest, (override ? 'w' : 'wx'), function(ex, destFd) {
												if (ex) {
													nodeFs.close(sourceFd, function() {
														reject(ex);
													});
												} else {
													const buf = new Buffer(bufferLength);
													copyFile(buf, sourceFd, destFd);
												};
											});
										});
									} else if (stats.isDirectory() && recursive) {
										// Recurse directory
										const copyFile = function copyFile(dirFiles) {
											const dirFile = dirFiles.shift();
											if (dirFile) {
												files.copy(source.combine(null, { file: dirFile }), destination.combine(null, { file: dirFile }), options)
													.then(function() {
														copyFile(dirFiles);
													})
													['catch'](function(ex) {
														reject(ex);
													});
											} else if (preserveTimes) {
												// FIXME: Dates are not correct
												nodeFs.utimes(destination.toString({ os: null, dirChar: null, shell: 'api' }), stats.atime, stats.mtime, function(ex) {
													if (ex) {
														reject(ex);
													} else {
														resolve(true);
													};
												});
											} else {
												resolve(true);
											};
										};
										files.mkdir(destination, options).then(function() {
											nodeFs.readdir(source.toString({ os: null, dirChar: null, shell: 'api' }), function(ex, dirFiles) {
												if (ex) {
													reject(ex);
												} else {
													copyFile(dirFiles);
												};
											});
										});
											
									} else if (!skipInvalid) {
										// Invalid file system object
										let ex;
										if (stats.isDirectory()) {
											ex = new types.Error("The 'recursive' option must be set to copy folder : '~0~'.", [source.toString({ os: null, dirChar: null, shell: 'api' })]);
										} else {
											ex = new types.Error("Invalid file or folder : '~0~'.", [source.toString({ os: null, dirChar: null, shell: 'api' })]);
										};
										reject(ex);
									} else {
										// Skip invalid file system object
										resolve(false);
									};
								};
							});
						});
					} else {
						const stats = nodeFs.lstatSync(source.toString({os: null, dirChar: null, shell: 'api'}));
						if (stats.isSymbolicLink()) {
							// Copy symbolic link
							if (!destination.file) {
								destination = destination.set({ file: source.file });
							};
							const linkString = nodeFs.readlinkSync(source.toString({ os: null, dirChar: null, shell: 'api' }));
							const dest = destination.toString({ os: null, dirChar: null, shell: 'api' });
							nodeFs.symlinkSync(linkString, dest, (stats.isFile() ? 'file' : 'dir'));
							if (preserveTimes) {
								nodeFs.utimesSync(dest, stats.atime, stats.mtime);
							};
							return true;
						} else if (stats.isFile()) {
							// Copy file
							if (!destination.file) {
								destination = destination.set({ file: source.file });
							};
							const dest = destination.toString({ os: null, dirChar: null, shell: 'api' });
							let sourceFd = null,
								destFd = null;
							try {
								sourceFd = nodeFs.openSync(source.toString({ os: null, dirChar: null, shell: 'api' }), 'r');
								destFd = nodeFs.openSync(dest, (override ? 'w' : 'wx'));
								const buf = new Buffer(bufferLength);
								let bytesRead = 0;
								do {
									bytesRead = nodeFs.readSync(sourceFd, buf, null, buf.length);
									if (bytesRead) {
										nodeFs.writeSync(destFd, buf, 0, bytesRead);
									};
								} while (bytesRead);
							} catch(ex) {
								throw ex;
							} finally {
								try {
									sourceFd && nodeFs.closeSync(sourceFd);
								} catch(ex) {
									throw ex;
								} finally {
									destFd && nodeFs.closeSync(destFd);
								};
							};
							if (preserveTimes) {
								nodeFs.utimesSync(dest, stats.atime, stats.mtime);
							};
							return true;
						} else if (stats.isDirectory() && recursive) {
							// Recurse directory
							files.mkdir(destination, options);
							const dirFiles = nodeFs.readdirSync(source.toString({ os: null, dirChar: null, shell: 'api' }));
							for (let i = 0; i < dirFiles.length; i++) {
								const dirFile = dirFiles[i];
								files.copy(source.combine(null, { file: dirFile }), destination.combine(null, { file: dirFile }), options);
							};
							if (preserveTimes) {
								// FIXME: Dates are not correct
								nodeFs.utimesSync(destination.toString({ os: null, dirChar: null, shell: 'api' }), stats.atime, stats.mtime);
							};
							return true;
						} else if (!skipInvalid) {
							// Invalid file system object
							let ex;
							if (stats.isDirectory()) {
								ex = new types.Error("The 'recursive' option must be set to copy folder : '~0~'.", [source.toString({ os: null, dirChar: null, shell: 'api' })]);
							} else {
								ex = new types.Error("Invalid file or folder : '~0~'.", [source.toString({ os: null, dirChar: null, shell: 'api' })]);
							};
							throw ex;
						} else {
							// Skip invalid file system object
							return false;
						};
					};
				}));
					
				files.ADD('readdir', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 3,
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
							returns: 'arrayof(object),Promise(arrayof(object))',
							description: "Returns files and folders list with stats.",
				}
				//! END_REPLACE()
				, function readdir(path, /*optional*/options) {
					// TODO: Synchronous version
						
					const Promise = types.getPromise(),
						async = types.get(options, 'async', false),
						depth = (+types.get(options, 'depth') || 0),  // null|undefined|true|false|NaN|Infinity
						relative = types.get(options, 'relative', false),
						followLinks = types.get(options, 'followLinks', false),
						skipOnDeniedPermission = types.get(options, 'skipOnDeniedPermission', false),
						solveCanonical = types.get(options, 'solveCanonical', false);

					const addFile = function addFile(result, base, name, stats) {
						const isFolder = stats.isDirectory(),
							isFile = stats.isFile();
						if ((isFolder || isFile) && (followLinks || !stats.isSymbolicLink())) {
							const file = {
								name: name,
								path: (isFolder ? base.combine(name, {file: null}) : base.combine(null, {file: name})),
								isFolder: isFolder,
								isFile: isFile,
								size: stats.size, // bytes
								// ...
							};
							result.push(file);
							return file;
						} else {
							return null;
						};
					};

					if (async) {
						return Promise.try(function tryReadDir() {
							if (types.isString(path)) {
								path = files.Path.parse(path);
							};

							const getStats = function getStats(path) {
								return Promise.create(function tryStat(resolve, reject) {
									const statCb = function statCb(err, stats) {
										if (err) {
											reject(err);
										} else {
											resolve(stats);
										};
									};
									if (followLinks) {
										nodeFs.stat(path, statCb);
									} else {
										nodeFs.lstat(path, statCb);
									};
								});
							};
						
							const readDir = function readDir(path) {
								return Promise.create(function tryReaddir(resolve, reject) {
									nodeFs.readdir(path, function readdirCb(err, names) {
										if (err) {
											reject(err);
										} else {
											resolve(names);
										};
									});
								});
							};

							const parseNames = function parseNames(result, parent, base, names, index, depth) {
								if (index < names.length) {
									const name = names[index],
										path = parent.combine(name);
									return getStats(path.toString())
										.nodeify(function thenAddAndProceed(err, stats) {
											if (err) {
												if (!skipOnDeniedPermission || (err.code !== 'EPERM')) {
													throw err;
												};
											} else {
												const file = addFile(result, base, name, stats);
												if (file && file.isFolder) {
													return proceed(result, path, file.path, depth - 1);
												};
											};
										})
										.then(function thenParseNames(dummy) {
											return parseNames(result, parent, base, names, index + 1, depth);
										});
								};
								return result;
							};
	
							const proceed = function proceed(result, path, base, depth) {
								if (depth >= 0) {
									return readDir(path.toString())
										.then(function thenParseNames(names) {
											return parseNames(result, path, base, names, 0, depth);
										});
								};
								return result;
							};

							return proceed([], path, (relative ? files.Path.parse('./', {os: 'linux'}) : path), depth);
						});

					} else {
						if (types.isString(path)) {
							path = files.Path.parse(path);
						};
						
						const parse = function parse(result, parent, base, name, depth) {
							const path = parent.combine(name);
							let stats = null;
							try {
								if (followLinks) {
									stats = nodeFs.statSync(path.toString({
										os: null,
										dirChar: null,
										shell: 'api',
									}));
								} else {
									stats = nodeFs.lstatSync(path.toString({
										os: null,
										dirChar: null,
										shell: 'api',
									}));
								};
							} catch(ex) {
								if (!skipOnDeniedPermission || (ex.code !== 'EPERM')) {
									throw ex;
								};
							};
							if (stats) {
								const file = addFile(result, base, name, stats);
								if (file && file.isFolder) {
									return proceed(result, path, file.path, depth - 1);
								};
							};
						};

						const proceed = function proceed(result, path, base, depth) {
							if (depth >= 0) {
								const names = nodeFs.readdirSync(path.toString());
								for (let i = 0; i < names.length; i++) {
									parse(result, path, base, names[i], depth);
								};
							};
							return result;
						};

						return proceed([], path, (relative ? files.Path.parse('./', {os: 'linux'}) : path), depth);
					};
				}));
					
				files.ADD('getTempFolder', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 1,
							params: null,
							returns: 'string',
							description: "Returns system temporary folder path.",
				}
				//! END_REPLACE()
				, function getTempFolder() {
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
						folder = files.Path.parse(process.cwd()).combine('tmp/', {os: 'linux'});
						try {
							files.mkdir(folder);
						} catch(ex) {
						};
						folder = folder.toString({os: null});
					};
					const os = tools.getOS();
					if (folder[folder.length - 1] !== os.dirChar) {
						folder += os.dirChar;
					};
					__Internal__.tmpdir = folder;
					return folder;
				}));
					
				files.ADD('readFile', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 6,
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
					const async = types.get(options, 'async', false);
					if (!async) {
						throw new types.NotSupported("Synchronous read is not implemented.");
					};
					const Promise = types.getPromise();
					return Promise.try(function tryReadFile() {
						const encoding = types.get(options, 'encoding', null),
							timeout = types.get(options, 'timeout', 0) || 5000,  // Don't allow "0" (for infinite)
							maxLength = types.get(options, 'maxLength', 1024 * 1024 * 100);
						if (types.isString(path)) {
							const url = files.Url.parse(path);
							if (url.protocol) {
								path = url;
							} else {
								path = files.Path.parse(path);
							};
						};
						if (types._instanceof(path, files.Path) || (types._instanceof(path, files.Url) && ((!path.protocol) || (path.protocol === 'file')))) {
							return Promise.create(function readFile(resolve, reject) {
								if (types._instanceof(path, files.Url)) {
									path = files.Path.parse(path);
								};
								path = path.toString({
									os: null,
									dirChar: null,
									shell: 'api',
								});
								nodeFs.stat(path, function(ex, stats) {
									if (ex) {
										reject(ex);
									} else if (stats.size > maxLength) {
										reject(new types.Error("File size exceeds maximum length."));
									} else {
										nodeFs.readFile(path, {encoding: encoding}, function(ex, data) {
											if (ex) {
												reject(ex);
											} else {
												resolve(data);
											};
										});
									};
								});
							});
						// "path" is a URL
						// TODO: Test
						// TODO: HTTPS
						} else if (path.protocol === 'http') {
							return Promise.create(function remoteReadFile(resolve, reject) {
								const user = types.get(options, 'user', undefined),
									password = types.get(options, 'password', undefined);
								let auth = null;
								if (user || password) {
									auth = (user || '') + (password ? (':' + password) : '');
								};
								const state = {
									request: null,
									ready: false,
									timeoutId: null,
									data: null,
								};
								const onEnd = function onEnd(ex) {
									if (state.timeoutId) {
										_shared.Natives.windowClearTimeout(state.timeoutId);
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
												if (!state.data || ((state.data.length + chunk.length) < maxLength)) {
													if (encoding) {
														state.data = (state.data || '') + chunk;
													} else if (state.data) {
														state.data = Buffer.concat([state.data, chunk]);
													} else {
														state.data = chunk;
													};
												} else {
													state.request.abort();
												};
											});
											response.on('error', onEnd);
											response.on('end', onEnd);
											response.on('close', function() {
												onEnd(new types.Error("The transfer has been interrupted."));
											});
											response.on('abort', function() {
												onEnd(new types.Error("The transfer has been aborted."));
											});
										});
									state.request.on('error', onEnd);
									const body = types.get(options, 'body', null);
									if (body) {
										state.request.write(body);
									};
									state.timeoutId = _shared.Natives.windowSetTimeout(function(ev) {
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
								};
							});
						} else {
							throw new types.NotSupported("Unsupported protocol.");
						};
					});
				}));

				files.ADD('writeFile', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
							params: {
								path: {
									type: 'string,Url,Path',
									optional: false,
									description: "File Url or Path.",
								},
								data: {
									type: 'any',
									optional: false,
									description: "File content.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'Promise',
							description: "Writes to a remote or local file.",
				}
				//! END_REPLACE()
				, function writeFile(path, data, /*optional*/options) {
					const async = types.get(options, 'async', false);
					if (!async) {
						throw new types.NotSupported("Synchronous write is not implemented.");
					};
					const Promise = types.getPromise();
					return Promise.try(function tryWriteFile() {
						const encoding = types.get(options, 'encoding', null),
							//timeout = types.get(options, 'timeout', 0) || 5000,  // Don't allow "0" (for infinite)
							mode = types.get(options, 'mode', 'update'); // 'forceUpdate' (file must exists), 'update' (file is created if it doesn't exist), 'forceAppend' (file must exists), 'append' (file is created if it doesn't exist)
						if (types.isString(path)) {
							const url = files.Url.parse(path);
							if (url.protocol) {
								path = url;
							} else {
								path = files.Path.parse(path);
							};
						};
						if (types._instanceof(path, files.Path) || (types._instanceof(path, files.Url) && ((!path.protocol) || (path.protocol === 'file')))) {
							let wf;
							switch (mode) {
								case 'forceUpdate':
								case 'update':
									wf = 'w';
									break;
								case 'forceAppend':
								case 'append':
									wf = 'a';
									break;
								default:
									throw new types.Error("Invalid write mode : '~0~'.", [mode]);
							};
							if (types._instanceof(path, files.Url)) {
								path = files.Path.parse(path);
							};
							path = path.toString({
								os: null,
								dirChar: null,
								shell: 'api',
							});
							return Promise.create(function statFile(resolve, reject) {
									nodeFs.stat(path, function(ex, stats) {
										if (ex) {
											if (ex.code === 'ENOENT') {
												switch (mode) {
													case 'forceUpdate':
													case 'forceAppend':
														reject(new types.Error("File '~0~' doesn't exists.", [path]));
													default:
														resolve();
												};
											} else {
												reject(ex);
											};
										} else {
											resolve();
										};
									});
								})
								.thenCreate(function writeFile(stats, resolve, reject) {
									nodeFs.writeFile(path, data, {encoding: encoding, flag: wf}, function(ex) {
										if (ex) {
											reject(ex);
										} else {
											resolve();
										};
									});
								});
						} else {
							throw new types.NotSupported("Remote files are not implemented.");
						};
					});
				}));

				files.ADD('watch', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 3,
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
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'undefined',
							description: "Creates a file watcher.",
				}
				//! END_REPLACE()
				, function watch(path, callbacks, /*optional*/options) {
					if (types.isString(path)) {
						const url = files.Url.parse(path);
						if (url.protocol) {
							path = url;
						} else {
							path = files.Path.parse(path);
						};
					};
					if (!types.isArray(callbacks)) {
						callbacks = [callbacks];
					};
						
					if (types._instanceof(path, files.Path) || (types._instanceof(path, files.Url) && ((!path.protocol) || (path.protocol === 'file')))) {
						if (types._instanceof(path, files.Url)) {
							path = files.Path.parse(path);
						};
						path = path.toString({
							os: null,
							dirChar: null,
							shell: 'api',
						});
							
						let fileCallbacks;
						if (types.has(__Internal__.watchedFiles, path)) {
							fileCallbacks = __Internal__.watchedFiles[path];
						} else {
							fileCallbacks = [];
							nodeFs.watch(path, {persistent: false}, doodad.Callback(this, function(event, filename) {
								const callbacks = __Internal__.watchedFiles[path];
								for (let i = callbacks.length - 1; i >= 0; i--) {
									let callback = callbacks[i];
									if (callback) {
										try {
											callback.apply(null, arguments);
										} catch(ex) {
										};
										if (types.get(callback.__OPTIONS__, 'once', false)) {
											callback = null;
										};
									};
									if (!callback) {
										callbacks.splice(i, 1);
									};
								};
							}));
						};
							
						tools.forEach(callbacks, function(callback) {
							callback.__OPTIONS__ = options;
						});
							
						__Internal__.watchedFiles[path] = types.unique(fileCallbacks, callbacks);
							
					} else {
						throw new types.NotSupported("Remote files are not supported.");
					};
				}));
					
					
				//===================================
				// Child process extension
				//===================================
						
				nodejs.ADD('forkSync', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
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
				}));
						
				//=====================================
				// Console
				//=====================================
				
				nodejs.ADD('Console', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
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
				, types.createType(
					/*name*/
					"Console", 
					
					/*base*/
					nodeConsole, 

					/*constructor*/
					function(hook, /*optional*/stdout, /*optional*/stderr) {
						if (!types.isType(this)) {
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
						};
					},
					
					/*typeProto*/
					{
						capture: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
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
							if (!__Internal__.oldConsole) {
								this.release();
								const newConsole = new this(hook, stdout, stderr),
									oldConsole = global.console;
								types.defineProperty(global, 'console', {
									configurable: true,
									enumerable: true,
									value: newConsole,
									writable: !types.hasDefinePropertyEnabled(),
								});
								__Internal__.oldConsole = oldConsole;
							};
						}),
						
						release: root.DD_DOC(
						//! REPLACE_IF(IS_UNSET('debug'), "null")
						{
									author: "Claude Petit",
									revision: 0,
									params: null,
									returns: 'undefined',
									description: "Releases the console previously captured.",
						}
						//! END_REPLACE()
						, function release() {
							if (__Internal__.oldConsole) {
								types.defineProperty(global, 'console', {
									configurable: true,
									enumerable: true,
									value: __Internal__.oldConsole,
									writable: !types.hasDefinePropertyEnabled(),
								});
								__Internal__.oldConsole = null;
							};
						}),
					},
					
					/*instanceProto*/
					{
						__hook: null,
						__hasStd: false,
						
						log: types.SUPER(types.WRITABLE(function(/*paramarray*/) {
							const message = this.__hook('log', types.toArray(arguments));
							if (this.__hasStd) {
								if (message) {
									this._super(message);
								} else {
									this._super.apply(this, arguments);
								};
							};
						})),
						
						info: types.SUPER(types.WRITABLE(function(/*paramarray*/) {
							const message = this.__hook('info', types.toArray(arguments));
							if (this.__hasStd) {
								if (message) {
									this._super(message);
								} else {
									this._super.apply(this, arguments);
								};
							};
						})),
						
						error: types.SUPER(types.WRITABLE(function(/*paramarray*/) {
							const message = this.__hook('error', types.toArray(arguments));
							if (this.__hasStd) {
								if (message) {
									this._super(message);
								} else {
									this._super.apply(this, arguments);
								};
							};
						})),
						
						warn: types.SUPER(types.WRITABLE(function(/*paramarray*/) {
							const message = this.__hook('warn', types.toArray(arguments));
							if (this.__hasStd) {
								if (message) {
									this._super(message);
								} else {
									this._super.apply(this, arguments);
								};
							};
						})),
					}
				)));

				
				//===================================
				// doodad-js extension
				//===================================
				
				mixIns.REGISTER(root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 1,
							params: null,
							returns: null,
							description: "Class mix-in to implement for NodeJs events.",
				}
				//! END_REPLACE()
				, doodad.MIX_IN(doodad.Class.$extend({
					$TYPE_NAME: "NodeEvents",
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('NodeEvents')), true) */,
					
					__NODE_EVENTS: doodad.PROTECTED(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray, {cloneOnInit: true})))))))),
					// TODO: Do we need that ?
					//__NODE_ERROR_EVENT: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(null))))))),

					detachNodeEvents: doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function detachNodeEvents(/*optional*/emitters) {
						const events = this.__NODE_EVENTS,
							eventsLen = events.length;
						for (let i = 0; i < eventsLen; i++) {
							this[events[i]].detach(emitters);
						};
					})))),
					
					clearNodeEvents: doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function clearNodeEvents() {
						const events = this.__NODE_EVENTS,
							eventsLen = events.length;
						for (let i = 0; i < eventsLen; i++) {
							this[events[i]].clear();
						};
					})))),
				}))));
				
				doodad.REGISTER(root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 1,
								params: null,
								returns: null,
								description: "NodeJs event handler prototype.",
					}
					//! END_REPLACE()
					, doodad.EventHandler.$inherit(
						/*typeProto*/
						{
							$TYPE_NAME: 'NodeEventHandler',
							$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('NodeEventHandler')), true) */,
						},
						/*instanceProto*/
						{
							attach: types.SUPER(function attach(emitters, /*optional*/context, /*optional*/once) {
								if (!types.isArray(emitters)) {
									emitters = [emitters];
								};

								//this.detach(emitters);

								const self = this;
								let ignore = false;
								
								const createHandler = function(emitter, type) {
									const handler = doodad.Callback(self[_shared.ObjectSymbol], function nodeEventHandler(/*paramarray*/) {
										if (!ignore) {
											if (once) {
												ignore = true;
												self.detach(emitters);
											};
											const ctx = {
												emitter: emitter,
												type: type,
												data: context,
											};
											return self.apply(this, types.append([ctx], arguments));
										};
									});
									return handler;
								};
								
								const eventTypes = this[_shared.ExtenderSymbol].types;
									
								for (let i = 0; i < eventTypes.length; i++) {
									if (types.hasIndex(eventTypes, i)) {
										const type = eventTypes[i];
										for (let j = 0; j < emitters.length; j++) {
											if (types.hasIndex(emitters, j)) {
												const emitter = emitters[j],
													handler = createHandler(emitter, type);
												if (this._super(this[_shared.ObjectSymbol], this, null, [emitter, type, handler])) {
													if (once) {
														emitter.once(type, handler);
													} else {
														emitter.on(type, handler);
													};
												};
											};
										};
									};
								};
							}),
							attachOnce: function attachOnce(emitters, /*optional*/context) {
								this.attach(emitters, context, true);
							},
							detach: types.SUPER(function detach(/*optional*/emitters) {
								if (types.isNothing(emitters)) {
									const evs = this._super(this[_shared.ObjectSymbol], this);
									if (evs) {
										for (let j = 0; j < evs.length; j++) {
											const evData = evs[j][3],
												emitter = evData[0],
												type = evData[1],
												handler = evData[2];
											emitter.removeListener(type, handler);
										};
									};
								} else {
									if (!types.isArray(emitters)) {
										emitters = [emitters];
									};
									
									//root.DD_ASSERT && root.DD_ASSERT(tools.every(emitters, function(emitter) {
									//	return nodeJs.isEventEmitter(emitter);
									//}), "Invalid emitters.");
									
									for (let i = 0; i < emitters.length; i++) {
										const evs = this._super(this[_shared.ObjectSymbol], this, [emitters[i]]);
										if (evs) {
											for (let j = 0; j < evs.length; j++) {
												const evData = evs[j][3],
													emitter = evData[0],
													type = evData[1],
													handler = evData[2];
												emitter.removeListener(type, handler);
											};
										};
									};
								};
							}),
							clear: function clear() {
								this.detach();
							},
							promise: function promise(emitters, /*optional*/context) {
								// NOTE: Don't forget that a promise resolves only once, so ".promise" is like ".attachOnce".
								const canReject = this[_shared.ExtenderSymbol].canReject;
								const self = this;
								const Promise = types.getPromise();
								return Promise.create(function eventPromise(resolve, reject) {
									if (canReject) {
										self.attachOnce(emitters, context, function(context, err /*, paramarray*/) {
											if (types.isError(err)) {
												return reject(err);
											} else {
												return resolve(types.toArray(arguments));
											};
										});
									} else {
										self.attachOnce(emitters, context, function(/*paramarray*/) {
											return resolve(types.toArray(arguments));
										});
									};
								});
							},
						}
					)));
				
				extenders.REGISTER(root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 2,
							params: null,
							returns: null,
							description: "Node.Js event extender.",
				}
				//! END_REPLACE()
				, extenders.Event.$inherit({
					$TYPE_NAME: "NodeEvent",
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('NodeEventExtender')), true) */,
					
					eventsAttr: types.READ_ONLY('__NODE_EVENTS'),
					// TODO: Do we need that ?
					//errorEventAttr: types.READ_ONLY('__NODE_ERROR_EVENT'),
					errorEventAttr: types.READ_ONLY(null),
					eventsImplementation: types.READ_ONLY('Doodad.MixIns.NodeEvents'),
					eventProto: types.READ_ONLY(doodad.NodeEventHandler),

					enableScopes: types.READ_ONLY(true),
					canReject: types.READ_ONLY(true),
					types: types.READ_ONLY(null),
					
					_new: types.READ_ONLY(types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						if (!types.isType(this)) {
							_shared.setAttributes(this, {
								canReject: types.get(options, 'canReject', this.canReject),
								types: types.freezeObject(types.get(options, 'types', this.types) || []),
							});
						};
					})),
					getCacheName: types.READ_ONLY(types.SUPER(function getCacheName(/*optional*/options) {
						return this._super(options) + 
							',' + (types.get(options, 'canReject', this.canReject) ? '1' : '0') +
							',' + types.unique(types.get(options, 'types', this.types)).sort().join('|');
					})),
					overrideOptions: types.READ_ONLY(types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
						options = this._super(options, newOptions, replace);
						if (replace) {
							types.fill(['canReject', 'types'], options, this, newOptions);
						} else {
							options.canReject = !!newOptions.canReject || this.canReject;
							options.types = types.unique([], newOptions.types, this.types);
						};
						return options;
					})),
				})));

				
				doodad.ADD('NODE_EVENT', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 2,
							params: {
								eventTypes: {
									type: 'arrayof(string),string',
									optional: true,
									description: "List of event names.",
								},
								fn: {
									type: 'function',
									optional: true,
									description: "Event handler.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "NodeJs event attribute modifier.",
				}
				//! END_REPLACE()
				, function NODE_EVENT(eventTypes, /*optional*/fn) {
					if (types.isStringAndNotEmpty(eventTypes)) {
						eventTypes = eventTypes.split(',');
					};
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(eventTypes) || types.isArrayAndNotEmpty(eventTypes), "Invalid types.");
						if (eventTypes) {
							root.DD_ASSERT(tools.every(eventTypes, types.isStringAndNotEmpty), "Invalid types.");
						};
						const val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					return doodad.PROTECTED(doodad.ATTRIBUTE(fn, extenders.NodeEvent, {
						types: eventTypes,
					}));
				}));
				
/* TODO: Do we need that ?				
				doodad.ADD('NODE_ERROR_EVENT', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								eventTypes: {
									type: 'arrayof(string),string',
									optional: false,
									description: "List of event names.",
								},
								fn: {
									type: 'function',
									optional: true,
									description: "Event handler.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "Creates a node error event ('onerror').",
					}
					//! END_REPLACE()
					, function NODE_ERROR_EVENT(eventTypes, /*optional* /fn) {
						return doodad.OPTIONS({errorEvent: true}, doodad.NODE_EVENT(eventTypes, fn));
					}));
*/
				//*********************************************
				// Emitter
				//*********************************************
				
				nodejsInterfaces.REGISTER(doodad.ISOLATED(doodad.MIX_IN(doodad.Class.$extend(
										mixIns.Events,
				{
					$TYPE_NAME: 'IEmitter',
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('IEmitter')), true) */,
					
					onnewListener: doodad.RAW_EVENT(),
					onremoveListener: doodad.RAW_EVENT(),

					prependListener: doodad.PUBLIC(function prependListener(event, listener) {
						// TODO: Allow multiple times the same listener (as the behavior of Node.Js)
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							this[name].attach(null, listener, 10);
							this.emit('newListener', event, listener);
						};
						return this;
					}),
					
					prependOnceListener: doodad.PUBLIC(function prependOnceListener(event, listener) {
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							this[name].attach(null, listener, 10, null, 1);
							this.emit('newListener', event, listener);
						};
						return this;
					}),
					
					addListener: doodad.PUBLIC(function addListener(event, listener) {
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							this[name].attach(null, listener);
							this.emit('newListener', event, listener);
						};
						return this;
					}),
					
					emit: doodad.PUBLIC(function emit(event /*, paramarray*/) {
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							return this[name].apply(this, types.toArray(arguments).slice(1));
						};
						return false;
					}),
					
					getMaxListeners: doodad.PUBLIC(function getMaxListeners() {
						let max = 10; // NodeJs default value
						if (this.__EVENTS.length) {
							max = this[this.__EVENTS[0]].stackSize;
						};
						return max;
					}),
					
					listenerCount: doodad.PUBLIC(function listenerCount(event) {
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							const stack = this[name][_shared.StackSymbol];
							return stack && stack.length || 0;
						};
					}),
					
					listeners: doodad.PUBLIC(function listeners(event) {
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							const stack = this[name][_shared.StackSymbol];
							return stack && tools.map(stack, function(ev) {
								return ev[1]; // fn
							}) || [];
						};
					}),
					
					on: doodad.PUBLIC(function on(event, listener) {
						// TODO: Allow multiple times the same listener (as the behavior of Node.Js)
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							this[name].attach(null, listener);
							this.emit('newListener', event, listener);
						};
						return this;
					}),
					
					once: doodad.PUBLIC(function once(event, listener) {
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							this[name].attachOnce(null, listener);
							this.emit('newListener', event, listener);
						};
						return this;
					}),
					
					removeAllListeners: doodad.PUBLIC(function removeAllListeners(event) {
						const listeners = this.listeners(event);
						if (listeners) {
							for (let i = 0; i < listeners.length; i++) {
								this.removeListener(event, listeners[i]);
							};
						};
						return this;
					}),
					
					removeListener: doodad.PUBLIC(function removeListener(event, listener) {
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							this[name].detach(null, listener);
							this.emit('removeListener', event, listener);
						};
						return this;
					}),
					
					setMaxListeners: doodad.PUBLIC(function setMaxListeners(number) {
						for (let i = 0; i < this.__EVENTS; i++) {
							this[this.__EVENTS[i]].stackSize = number;
						};
						return this;
					}),
				}))));


				return function init(/*optional*/options) {
					// Detect case-sensitive
					// NOTE: On some systems, the temp folder may have a different file system.
					const temp = files.getTempFolder();
					try {
						files.rmdir(temp + 'DoOdAd');
					} catch(ex) {
					};
					try {
						files.rmdir(temp + 'dOoDaD');
					} catch(ex) {
					};
					try {
						files.mkdir(temp + 'DoOdAd', {ignoreExists: false});
						try {
							files.mkdir(temp + 'dOoDaD', {ignoreExists: false});
							__Internal__.caseSensitive = true;
						} catch(ex) {
							__Internal__.caseSensitive = false;
						};
					} catch(ex) {
						// Test failed
					};
					try {
						files.rmdir(temp + 'DoOdAd');
					} catch(ex) {
					};
					try {
						files.rmdir(temp + 'dOoDaD');
					} catch(ex) {
					};
				};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()