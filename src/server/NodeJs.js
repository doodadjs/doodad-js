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

					symbolHandler: types.getSymbol('__HANDLER__'),
					symbolHandlerExtended: types.getSymbol('__HANDLER_EXTENDED__'),
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
					processStdErrWrite: (global.process.stderr ? global.process.stderr.write.bind(global.process.stderr) : (global.process.stdout ? global.process.stdout.write.bind(global.process.stdout) : function _void() { })),

					// "addAppListener", "removeAppListener"
					processOn: global.process.on.bind(global.process),
					processRemoveListener: global.process.removeListener.bind(global.process),

					// "stringToBytes", "bytesToString"
					globalBufferFrom: global.Buffer.from.bind(global.Buffer),
					windowArrayBuffer: global.ArrayBuffer,
					windowUint16Array: global.Uint16Array,
					windowUint8Array: global.Uint8Array,
					stringFromCharCodeApply: global.String.fromCharCode.apply.bind(global.String.fromCharCode),
					stringFromCharCode: global.String.fromCharCode.bind(global.String),
					stringCharCodeAtCall: global.String.prototype.charCodeAt.call.bind(global.String.prototype.charCodeAt),
					mathMin: global.Math.min,

					// NodeEvent
					arraySliceCall: global.Array.prototype.slice.call.bind(global.Array.prototype.slice),
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
				_shared.DESTROY = function DESTROY(obj) {
					if (types.isObject(obj) && !types.getType(obj)) {
						// NOTE: Now, starting from Node v8, 'destroyed' is a getter/setter.
						if (!obj.destroyed) {
							if (types.isFunction(obj.unpipe)) {
								// <PRB> After destroy/close, pipes may still exist.
								obj.unpipe();
							};

							if (types.isFunction(obj.removeAllListeners)) {
								// <PRB> Events could still occur even after a destroy/close.
								obj.removeAllListeners();
							};

							if (types.isFunction(obj.on)) {
								// <PRB> The 'error' event could emits even after a destroy/close.
								obj.on('error', function noop() {})
							};

							if (types.isFunction(obj.close) && !obj._closed) {
								obj.close();
							};

							if (types.isFunction(obj.destroy)) {
								obj.destroy();
							};

							// <PRB> Not every NodeJs destroyable object has/maintains the "destroyed" flag.
							// <PRB> Not every NodeJs closable object has/maintains the "_closed" flag.
							// <PRB> The "_closed" flag can be a read-only property. So we use "destroyed" instead.
							// NOTE: Now, starting from Node v8, 'destroyed' is a getter/setter.
							if (!obj.destroyed) {
								obj.destroyed = true;
							};

							// <PRB> ZLib may have a callback that crashes when the stream is closed (Node.Js v7.7.1) :
							// TypeError: Cannot read property 'write' of null
							//	at Zlib.callback (zlib.js:609:32)
							if ((typeof obj.constructor === 'function') && (obj.constructor.name === 'Gzip')) {
								obj._hadError = true;
							};
						};

					} else {
						__Internal__.oldDESTROY(obj);
					};
				};

				__Internal__.oldDESTROYED = _shared.DESTROYED;
				_shared.DESTROYED = function DESTROYED(obj) {
					if (types.isObject(obj) && !types.getType(obj)) {
						// NOTE: Now, starting from Node v8, 'destroyed' is a getter/setter.
						return !!obj.destroyed;
					} else {
						return __Internal__.oldDESTROYED(obj);
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
				
				tools.ADD('catchAndExit', function catchAndExit(err) {
					if (err.trapped || (!err.critical && err.bubble)) {
						// Ignore trapped errors or errors like "ScriptInterruptedError".
						return;
					};

					// NOTE: This is the last resort error handling.
					// NOTE: types.ScriptAbortedError should bubbles here

					err.trapped = true;

					__Internal__.catchAndExitCalled = true;
						
					_shared.Natives.process.exitCode = 1; // 1 = General error

					try {
						if (types._instanceof(err, types.ScriptAbortedError)) {
							_shared.Natives.process.exitCode = err.exitCode;
						} else {
							const msg = "<FATAL ERROR> " + err.message + '\n' + err.stack + '\n';
							try {
								global.console.error(msg);
							} catch(o) {
								_shared.Natives.processStdErrWrite(msg);
							};
						};
					} catch(o) {
						if (root.getOptions().debug) {
							debugger;
						};
					};
						
					try {
						tools.dispatchEvent(new types.CustomEvent('exit', {cancelable: false, detail: {error: err, exitCode: _shared.Natives.process.exitCode}})); // sync
					} catch(o) {
						if (root.getOptions().debug) {
							debugger;
						};
					};

					_shared.Natives.processExit();

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
						
						url = files.Path.parse(url).toApiString();

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
							
							start: function start() {
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
							file = file.toApiString();
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
								const name = path.toApiString();
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
								path = path.toApiString();
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
								path = path.toApiString();
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
								path = path.toApiString();
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
						const name = path.toApiString();
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
									const fname = newPath.toApiString();
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
								const name = path.toApiString({
									path: dir.slice(0, index + 1),
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
						const name = path.toApiString();
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
							revision: 5,
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
					const Promise = types.getPromise();

					const async = types.get(options, 'async', false),
						bufferLength = types.get(options, 'bufferLength', 16384),
						preserveTimes = types.get(options, 'preserveTimes', true),
						override = types.get(options, 'override', false),
						recursive = types.get(options, 'recursive', false),
						skipInvalid = types.get(options, 'skipInvalid', false),
						makeParents = types.get(options, 'makeParents', false);

					const throwInvalid = function _throwInvalid(stats, sourceStr) {
						// Invalid file system object
						if (stats.isDirectory()) {
							throw new types.Error("The 'recursive' option must be set to copy folder : '~0~'.", [sourceStr]);
						} else {
							throw new types.Error("Invalid file or folder : '~0~'.", [sourceStr]);
						};
					};

					let COPY_FILE_BUFFER = null;

					const copyInternal = function _copyInternal(source, destination) {
						/* ASYNC */
						if (async) {
							return Promise.try(function copyPromise() {
								if (types.isString(source)) {
									source = files.Path.parse(source);
								};

								if (types.isString(destination)) {
									destination = files.Path.parse(destination);
								};

								const sourceStr = source.toApiString();

								const lstat = function _lstat(path) {
									return Promise.create(function lstatPromise(resolve, reject) {
										nodeFs.lstat(path, function(err, stats) {
											if (err) {
												reject(err);
											} else {
												resolve(stats);
											};
										});
									});
								};

								const readlink = function _readlink(path) {
									return Promise.create(function readlinkPromise(resolve, reject) {
										nodeFs.readlink(path, function(err, link) {
											if (err) {
												reject(err);
											} else {
												resolve(link);
											};
										});
									});
								};

								const symlink = function _symlink(link, path, type) {
									return Promise.create(function symlinkPromise(resolve, reject) {
										nodeFs.symlink(link, path, type, function(err) {
											if (err) {
												reject(err);
											} else {
												resolve();
											};
										});
									});
								};

								const utimes = function _utimes(path, atime, mtime) {
									return Promise.create(function utimesPromise(resolve, reject) {
										nodeFs.utimes(path, atime, mtime, function(err) {
											if (err) {
												reject(err);
											} else {
												resolve();
											};
										});
									});
								};
						
								const open = function _open(path, mode) {
									return Promise.create(function openPromise(resolve, reject) {
										nodeFs.open(path, mode, function(err, fd) {
											if (err) {
												reject(err);
											} else {
												resolve(fd);
											};
										});
									});
								};

								const close = function _close(fd) {
									return Promise.create(function closePromise(resolve, reject) {
										nodeFs.close(fd, function(err) {
											if (err) {
												reject(err);
											} else {
												resolve();
											};
										});
									});
								};

								const read = function _read(fd) {
									return Promise.create(function readPromise(resolve, reject) {
										nodeFs.read(fd, COPY_FILE_BUFFER, null, COPY_FILE_BUFFER.length, null, function(err, bytesRead) {
											if (err) {
												reject(err);
											} else {
												resolve(bytesRead);
											};
										});
									});
								};

								const write = function _write(fd, bytesCount) {
									return Promise.create(function readPromise(resolve, reject) {
										nodeFs.write(fd, COPY_FILE_BUFFER, 0, bytesCount, function(err) {
											if (err) {
												reject(err);
											} else {
												resolve();
											};
										});
									});
								};

								const readdir = function _readdir(path) {
									return Promise.create(function readdirPromise(resolve, reject) {
										nodeFs.readdir(path, function(err, files) {
											if (err) {
												reject(err);
											} else {
												resolve(files);
											};
										});
									});
								};


								const copyLink = function _copyLink(stats) {
									// TODO: Test me
									// Copy symbolic link
									return Promise.try(function() {
										if (!destination.file) {
											destination = destination.set({ file: source.file });
										};
										const destStr = destination.toApiString();
										return readlink(sourceStr)
											.then(function(link) {
												return symlink(link, destStr, (stats.isFile() ? 'file' : 'dir'));
											})
											.then(function() {
												if (preserveTimes) {
													return utimes(destStr, stats.atime, stats.mtime);
												};
											});
									});
								};

								const loopCopyFileContent = function _loopCopyFileContent(sourceFd, destFd) {
									return read(sourceFd)
										.then(function(bytesRead) {
											if (bytesRead > 0) {
												return write(destFd, bytesRead)
													.then(function(dummy) {
														return loopCopyFileContent(sourceFd, destFd);
													});
											};
										});
								};

								const copyFile = function _copyFile(stats) {
									// Copy file
									return Promise.try(function() {
										if (!destination.file) {
											destination = destination.set({ file: source.file });
										};
										const destStr = destination.toApiString();
										if (!COPY_FILE_BUFFER) {
											COPY_FILE_BUFFER = new _shared.Natives.globalBuffer(bufferLength);
										};
										let sourceFd = null;
										let destFd = null;
										return open(sourceStr, 'r')
											.then(function(fd) {
												sourceFd = fd;
												return open(destStr, (override ? 'w' : 'wx'));
											})
											.then(function(fd) {
												destFd = fd;
												if ((sourceFd !== null) && (destFd !== null)) {
													return loopCopyFileContent(sourceFd, destFd);
												};
											})
											.nodeify(function(err, dummy) {
												let promise = Promise.all([
														((sourceFd === null) ? undefined : close(sourceFd)), 
														((destFd === null) ? undefined : close(destFd))
													]);
												if (err) {
													promise = promise.then(function(dummy) {
														if (err) {
															throw err;
														};
													});
												};
												return promise;
											})
											.then(function(dummy) {
												if (preserveTimes) {
													return utimes(destStr, stats.atime, stats.mtime);
												};
											});
									});
								};

								const loopDirectoryContent = function _loopDirectoryContent(dirFiles, index) {
									return Promise.try(function() {
										const dirFile = dirFiles[index];
										if (dirFile) {
											return copyInternal(source.combine(null, { file: dirFile }), destination.combine(null, { file: dirFile }))
												.then(function() {
													return loopDirectoryContent(dirFiles, index + 1);
												});
										};
									});
								};

								const copyDirectory = function _copyDirectory(stats) {
									// Recurse directory
									return files.mkdir(destination, {makeParents: makeParents, async: true})
										.then(function(dummy) {
											return readdir(sourceStr)
										})
										.then(function(dirFiles) {
											return loopDirectoryContent(dirFiles, 0);
										})
										.then(function(dummy) {
											if (preserveTimes) {
												// FIXME: Dates are not correct
												return utimes(destination.toApiString(), stats.atime, stats.mtime);
											};
										});
								};

								return lstat(sourceStr)
									.then(function(stats) {
										if (stats.isSymbolicLink()) {
											return copyLink(stats);
										} else if (stats.isFile()) {
											return copyFile(stats);
										} else if (stats.isDirectory() && recursive) {
											return copyDirectory(stats)
										} else if (!skipInvalid) {
											// Invalid file system object
											throwInvalid(stats, sourceStr);
										};
									});
							});


						/* SYNC */
						} else {
							if (types.isString(source)) {
								source = files.Path.parse(source);
							};

							if (types.isString(destination)) {
								destination = files.Path.parse(destination);
							};

							const sourceStr = source.toApiString();

							const stats = nodeFs.lstatSync(sourceStr);

							if (stats.isSymbolicLink()) {
								// Copy symbolic link
								if (!destination.file) {
									destination = destination.set({ file: source.file });
								};

								const linkString = nodeFs.readlinkSync(sourceStr);

								const destStr = destination.toApiString();

								nodeFs.symlinkSync(linkString, destStr, (stats.isFile() ? 'file' : 'dir'));

								if (preserveTimes) {
									nodeFs.utimesSync(destStr, stats.atime, stats.mtime);
								};

							} else if (stats.isFile()) {
								// Copy file
								if (!destination.file) {
									destination = destination.set({ file: source.file });
								};

								const destStr = destination.toApiString();

								if (!COPY_FILE_BUFFER) {
									COPY_FILE_BUFFER = new _shared.Natives.globalBuffer(bufferLength);
								};

								let sourceFd = null,
									destFd = null;
								try {
									sourceFd = nodeFs.openSync(sourceStr, 'r');
									destFd = nodeFs.openSync(destStr, (override ? 'w' : 'wx'));

									let bytesRead = 0;
									do {
										bytesRead = nodeFs.readSync(sourceFd, COPY_FILE_BUFFER, null, COPY_FILE_BUFFER.length);
										if (bytesRead) {
											nodeFs.writeSync(destFd, COPY_FILE_BUFFER, 0, bytesRead);
										};
									} while (bytesRead);

								} catch(ex) {
									throw ex;

								} finally {
									try {
										if (!types.isNothing(sourceFd)) {
											nodeFs.closeSync(sourceFd);
										};
									} catch(ex) {
										throw ex;
									} finally {
										if (!types.isNothing(destFd)) {
											nodeFs.closeSync(destFd);
										};
									};
								};

								if (preserveTimes) {
									nodeFs.utimesSync(destStr, stats.atime, stats.mtime);
								};

							} else if (stats.isDirectory() && recursive) {
								// Recurse directory
								files.mkdir(destination, {makeParents: makeParents, async: false});

								const dirFiles = nodeFs.readdirSync(sourceStr);
								for (let i = 0; i < dirFiles.length; i++) {
									const dirFile = dirFiles[i];
									copyInternal(source.combine(null, { file: dirFile }), destination.combine(null, { file: dirFile }));
								};

								if (preserveTimes) {
									// FIXME: Dates are not correct
									nodeFs.utimesSync(destination.toApiString(), stats.atime, stats.mtime);
								};

							} else if (!skipInvalid) {
								// Invalid file system object
								throwInvalid(stats, sourceStr);
							};
						};
					};

					return copyInternal(source, destination);
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
					const Promise = types.getPromise(),
						async = types.get(options, 'async', false),
						depth = (+types.get(options, 'depth') || 0),  // null|undefined|true|false|NaN|Infinity
						relative = types.get(options, 'relative', false),
						followLinks = types.get(options, 'followLinks', false),
						skipOnDeniedPermission = types.get(options, 'skipOnDeniedPermission', false);

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
									stats = nodeFs.statSync(path.toApiString());
								} else {
									stats = nodeFs.lstatSync(path.toApiString());
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
					
				files.ADD('getCanonical', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 4,
							params: {
								path: {
									type: 'string,Path',
									optional: false,
									description: "Path.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
							},
							returns: 'Path',
							description: "Returns the canonical path of the specified path (for case-insensitive file systems).",
				}
				//! END_REPLACE()
				, function getCanonical(path, /*optional*/options) {
					const async = types.get(options, 'async', false);
					if (async) {
						const Promise = types.getPromise();
						return Promise.try(function tryCanonical() {
							const stat = function stat(path) {
								path = path.toApiString();
								return Promise.create(function doCanonical(resolve, reject) {
									nodeFs.stat(path, function statCb(err, stats) {
										if (err) {
											reject(err);
										} else {
											resolve(stats);
										};
									});
								});
							};
							const readdir = function readdir(path) {
								path = path.toApiString();
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
							const loopAr = function loopAr(base, ar, index) {
								if (index >= 0) {
									return readdir(base.set({path: ar.slice(0, index)}))
										.then(function resolve(names) {
											const name = ar[index];
											let resolved = names.filter(function(n) {return n === name})[0];
											if (!resolved) {
												const nameLc = name.toLowerCase();
												resolved = names.filter(function(n) {return n.toLowerCase() === nameLc})[0];
												ar[index] = resolved;
											};
											return loopAr(base, ar, index - 1);
										});
								};
								return Promise.resolve();
							};
							const proceed = function proceed(path) {
								return stat(path)
									.then(function startLoop(stats) {
										const base = path.set({path: null, file: null}),
											ar = path.toArray({pathOnly: true, trim: true});
										return loopAr(base, ar, ar.length - 1)
											.then(function assemble() {
												let file = null;
												if (stats.isFile()) {
													file = ar.pop();
												};
												return base.set({path: ar, file: file});
											});
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
						const stats = nodeFs.statSync(path.toApiString());
						const ar = path.toArray({pathOnly: true, trim: true}),
							base = path.set({path: null, file: null});
						for (let i = ar.length - 1; i >= 0; i--) {
							const newPath = base.set({path: ar.slice(0, i)}).toApiString(),
								names = nodeFs.readdirSync(newPath),
								name = ar[i],
								nameLc = name.toLowerCase();
							let resolved = names.filter(function(n) {return n === name})[0];
							if (!resolved) {
								resolved = names.filter(function(n) {return n.toLowerCase() === nameLc})[0];
							};
							ar[i] = resolved;
						};
						let file = null;
						if (stats.isFile()) {
							file = ar.pop();
						};
						return base.set({path: ar, file: file});
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
						folder = folder.toApiString();
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
								path = path.toApiString();
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
							path = path.toApiString();
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
						path = path.toApiString();
							
						let fileCallbacks;
						if (types.has(__Internal__.watchedFiles, path)) {
							fileCallbacks = __Internal__.watchedFiles[path];
						} else {
							fileCallbacks = [];
							nodeFs.watch(path, {persistent: false}, doodad.Callback(null, function(event, filename) {
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
							if (__Internal__.oldConsole) {
								throw new types.Error("'global.console' already captured.")
							};
							const newConsole = new this(hook, stdout, stderr),
								oldConsole = global.console;
							types.defineProperty(global, 'console', {
								configurable: true,
								enumerable: true,
								value: newConsole,
								writable: false,
							});
							__Internal__.oldConsole = oldConsole;
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
									writable: false,
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
							try {
								const message = this.__hook('log', types.toArray(arguments));
								if (this.__hasStd) {
									if (message) {
										this._super(message);
									} else {
										this._super.apply(this, arguments);
									};
								};
							} catch(ex) {
								if (global.console === this) {
									const type = types.getType(this);
									type.release();
									throw ex;
								};
							};
						})),
						
						info: types.SUPER(types.WRITABLE(function(/*paramarray*/) {
							try {
								const message = this.__hook('info', types.toArray(arguments));
								if (this.__hasStd) {
									if (message) {
										this._super(message);
									} else {
										this._super.apply(this, arguments);
									};
								};
							} catch(ex) {
								if (global.console === this) {
									const type = types.getType(this);
									type.release();
									throw ex;
								};
							};
						})),
						
						error: types.SUPER(types.WRITABLE(function(/*paramarray*/) {
							try {
								const message = this.__hook('error', types.toArray(arguments));
								if (this.__hasStd) {
									if (message) {
										this._super(message);
									} else {
										this._super.apply(this, arguments);
									};
								};
							} catch(ex) {
								if (global.console === this) {
									const type = types.getType(this);
									type.release();
									throw ex;
								};
							};
						})),
						
						warn: types.SUPER(types.WRITABLE(function(/*paramarray*/) {
							try {
								const message = this.__hook('warn', types.toArray(arguments));
								if (this.__hasStd) {
									if (message) {
										this._super(message);
									} else {
										this._super.apply(this, arguments);
									};
								};
							} catch(ex) {
								if (global.console === this) {
									const type = types.getType(this);
									type.release();
									throw ex;
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
				, doodad.MIX_IN(mixIns.Events.$extend({
					$TYPE_NAME: "NodeEvents",
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('NodeEvents')), true) */,
					
					__NODE_EVENTS: doodad.PROTECTED(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray, {cloneOnInit: true})))))))),

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
							attach: types.SUPER(function attach(emitters, /*optional*/context, /*optional*/once, /*optional*/prepend) {
								if (!types.isArray(emitters)) {
									emitters = [emitters];
								};

								const createHandler = function(emitter, eventType) {
									let ignore = false;
									const self = this;
									const handler = doodad.Callback(this[_shared.ObjectSymbol], function nodeEventHandler(/*paramarray*/) {
										if (!ignore) {
											if (once) {
												self.detach(emitter);

												// <PRB> Sometimes "once" is raised more than once (it might have been fixed since we wrote that patch)
												ignore = true;
											};
											const ctx = {
												emitter: emitter,
												type: eventType,
												data: context,
											};
											return self[__Internal__.symbolHandler].apply(this, types.append([ctx], arguments));
										};
									});
									return handler;
								};
								
								const eventType = this[_shared.ExtenderSymbol].eventType;
									
								for (let j = 0; j < emitters.length; j++) {
									if (types.has(emitters, j)) {
										const emitter = emitters[j],
											handler = createHandler.call(this, emitter, eventType);
										if (this._super(this[_shared.ObjectSymbol], this, (prepend ? 10 : null), [emitter, eventType, handler])) {
											if (once) {
												if (prepend) {
													emitter.prependOnceListener(eventType, handler);
												} else {
													emitter.once(eventType, handler);
												};
											} else {
												if (prepend) {
													emitter.prependListener(eventType, handler);
												} else {
													emitter.on(eventType, handler);
												};
											};
										};
									};
								};
							}),

							attachOnce: function attachOnce(emitters, /*optional*/context, /*optional*/prepend) {
								this.attach(emitters, context, true, prepend);
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
/*
							promise: function promise(emitters, /*optional* /context) {
								// NOTE: Don't forget that a promise resolves only once, so ".promise" is like ".attachOnce".
								const canReject = this[_shared.ExtenderSymbol].canReject;
								const Promise = types.getPromise();
								return Promise.create(function eventPromise(resolve, reject) {
									const self = this,
										obj = this[__Internal__.symbolObject],
										errorEvent = obj.__ERROR_EVENT,
										destroy = types.isImplemented(obj, 'onDestroy');

									let successFn = null,
										errorFn = null,
										destroyFn = null,
										detachedFn = null;

									const cleanup = function cleanup() {
										detachedFn && obj.onEventDetached.detach(null, detachedFn); // Must be first to be detached
										self.detach(null, successFn);
										errorEvent && obj[errorEvent].detach(null, errorFn);
										destroy && obj.onDestroy.detach(null, destroyFn);
									};

									this.attachOnce(emitters, context, successFn = function(context, err /*, paramarray* /) {
										cleanup();
										if (canReject && types.isError(err)) {
											reject(err);
										} else {
											resolve(types.toArray(arguments));
										};
									});

									if (errorEvent) {
										obj[errorEvent].attachOnce(null, errorFn = function onError(ev) {
											cleanup();
											reject(ev.error);
										});
									};

									if (destroy) {
										obj.onDestroy.attachOnce(null, destroyFn = function (ev) {
											cleanup();
											// NOTE: We absolutly must reject the Promise.
											reject(new types.ScriptInterruptedError("Target object is about to be destroyed."));
										});
									};

									obj.onEventDetached.attach(null, detachedFn = function(ev) {
										if (ev.data.handler === successFn) {
											tools.callAsync(cleanup, -1); // Must be async
											// NOTE: We absolutly must reject the Promise.
											reject(new types.ScriptInterruptedError("Target event has been detached."));
										};
									});

								}, this);
							},
*/
						}
					)));
				
				extenders.REGISTER([], root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 2,
							params: null,
							returns: null,
							description: "Node.Js event extender.",
				}
				//! END_REPLACE()
				, extenders.RawEvent.$inherit({
					$TYPE_NAME: "NodeEvent",
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('NodeEventExtender')), true) */,
					
					eventsAttr: types.READ_ONLY('__NODE_EVENTS'),
					eventsImplementation: types.READ_ONLY('Doodad.MixIns.NodeEvents'),
					eventProto: types.READ_ONLY(doodad.NodeEventHandler),

					enableScopes: types.READ_ONLY(true),
					canReject: types.READ_ONLY(true),
					eventType: types.READ_ONLY(null),
					
					_new: types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						if (!types.isType(this)) {
							_shared.setAttributes(this, {
								canReject: types.get(options, 'canReject', this.canReject),
								eventType: types.get(options, 'eventType', this.eventType),
							});
						};
					}),

					getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
						return this._super(options) + 
							',' + (types.get(options, 'canReject', this.canReject) ? '1' : '0') +
							',' + types.get(options, 'eventType', this.eventType);
					}),

					overrideOptions: types.SUPER(function overrideOptions(options, newOptions, /*optional*/replace) {
						options = this._super(options, newOptions, replace);
						if (replace) {
							types.fill(['canReject', 'eventType'], options, this, newOptions);
						} else {
							options.canReject = !!newOptions.canReject || this.canReject;
							options.eventType = newOptions.eventType || this.eventType;
						};
						return options;
					}),

					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
						if (sourceIsProto) {
							const handlerSrc = sourceAttribute[__Internal__.symbolHandler];
							const handlerDest = destAttribute[__Internal__.symbolHandlerExtended];
							if (handlerSrc) {
								destAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
								const extender = handlerSrc[_shared.ExtenderSymbol];
								destAttribute[__Internal__.symbolHandlerExtended] = extender.extend(attr, source, sourceProto, destAttributes, forType, handlerSrc, handlerSrc.setValue(undefined), true, proto, protoName);
								return destAttribute;
							} else {
								const extender = handlerDest[_shared.ExtenderSymbol];
								destAttribute[__Internal__.symbolHandlerExtended] = extender.extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, handlerDest, true, proto, protoName);
								return destAttribute;
							};
						} else {
							const handlerSrc = sourceAttribute[__Internal__.symbolHandlerExtended];
							const handlerDest = destAttribute[__Internal__.symbolHandlerExtended];
							const extender = handlerSrc[_shared.ExtenderSymbol];
							destAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, false, proto, protoName);
							const newHandlerSrc = (extender.getValue ? extender.getValue(attr, handlerSrc, forType) : handlerSrc);
							destAttribute[__Internal__.symbolHandlerExtended] = extender.extend(attr, source, sourceProto, destAttributes, forType, newHandlerSrc, handlerDest || newHandlerSrc.setValue(undefined), false, proto, protoName);
							return destAttribute;
						};
					}),

					postExtend: types.SUPER(function postExtend(attr, destAttributes, destAttribute) {
						const handler = destAttribute[__Internal__.symbolHandlerExtended];
						if (handler) {
							const extender = handler[_shared.ExtenderSymbol];
							destAttribute[__Internal__.symbolHandlerExtended] = extender.postExtend(attr, destAttributes, handler);
						};

						return this._super(attr, destAttributes, destAttribute);
					}),

					init: types.SUPER(function init(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto) {
						this._super(attr, obj, attributes, typeStorage, instanceStorage, forType, attribute, value, isProto);

						const handler = attribute[__Internal__.symbolHandlerExtended];
						if (handler) {
							const extender = handler[_shared.ExtenderSymbol];
							extender.init(__Internal__.symbolHandler, obj[attr], attributes, null, null, forType, handler, types.unbox(handler), isProto);
						};
					}),
				})));

				
				doodad.ADD('NODE_EVENT', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 4,
							params: {
								eventType: {
									type: 'string',
									optional: false,
									description: "Event name.",
								},
								fn: {
									type: 'function',
									optional: false,
									description: "Event handler.",
								},
							},
							returns: 'AttributeBox,Extender',
							description: "NodeJs event attribute modifier.",
				}
				//! END_REPLACE()
				, function NODE_EVENT(eventType, fn) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isStringAndNotEmpty(eventType), "Invalid type.");
						const val = types.unbox(fn);
						root.DD_ASSERT(types.isJsFunction(val), "Invalid function.");
					};
					const eventFn = doodad.PROTECTED(doodad.CALL_FIRST(doodad.NOT_REENTRANT(doodad.ATTRIBUTE(function eventHandler(/*optional*/ctx /*paramarray*/) {
						const dispatch = this[_shared.CurrentDispatchSymbol],
							stack = dispatch[_shared.StackSymbol];
						
						let clonedStack;
						if (dispatch[_shared.SortedSymbol]) {
							clonedStack = dispatch[_shared.ClonedStackSymbol];
						} else {
							if (stack.length) {
								stack.sort(function(value1, value2) {
									return tools.compareNumbers(value1[2], value2[2]);
								});
								clonedStack = types.clone(stack);
							} else {
								clonedStack = [];
							};
							dispatch[_shared.SortedSymbol] = true;
							dispatch[_shared.ClonedStackSymbol] = clonedStack;
						};
							
						const stackLen = clonedStack.length;

						for (let i = 0; i < stackLen; i++) {
							const data = clonedStack[i],
								obj = data[0],
								evDatas = data[3],
								emitter = evDatas[0];
									
							if (!ctx || (emitter === ctx.emitter)) {
								const handler = evDatas[2];

								handler.apply(obj, _shared.Natives.arraySliceCall(arguments, 1));
							};
						};

					}, extenders.NodeEvent, {enableScopes: true, eventType: eventType}))));

					eventFn[__Internal__.symbolHandler] = doodad.PROTECTED(doodad.METHOD(fn));

					return eventFn;
				}));
				
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

					__currentlyEmitted: doodad.PRIVATE(null),

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
						// <PRB> Readable stream re-emits "onerror" with the same error !!! https://github.com/nodejs/node/blob/v7.6.0/lib/_stream_readable.js#L578-L579
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							const oldCurrentlyEmitted = this.__currentlyEmitted;
							const isOnError = (event === 'error');
							if (!isOnError || (oldCurrentlyEmitted !== event)) {
								this.__currentlyEmitted = event;
								try {
									return this[name].apply(this, types.toArray(arguments).slice(1));
								} catch(ex) {
									throw ex;
								} finally {
									this.__currentlyEmitted = oldCurrentlyEmitted;
								};
							} else if (isOnError && (this.listenerCount(event) === 0)) {
								const ex = arguments[1];
								if (!ex.trapped) {
									tools.catchAndExit(ex);
								};
							};
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
							return (stack ? tools.reduce(stack, function(result, data) {
								if (data[4] > 0) {
									result++;
								};
								return result;
							}, 0) : 0);
						};
						return 0;
					}),
					
					listeners: doodad.PUBLIC(function listeners(event) {
						const name = 'on' + event;
						if (tools.indexOf(this.__EVENTS, name) >= 0) {
							const stack = this[name][_shared.StackSymbol];
							return (stack ? tools.reduce(stack, function(result, data) {
								if (data[4] > 0) {
									result.push(data[1]);
								};
								return result;
							}, []) : []);
						};
						return [];
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


				//===================================
				// Binary data
				//===================================

				// NOTE: Experimental
				types.ADD('bytesToString', function bytesToString(buf) {
					// Raw bytes array to string, without conversion.

					// TODO: Find a better solution.

					if (types.isTypedArray(buf)) {
						buf = buf.buffer;
					};

					let lastChr;
					if (buf.byteLength & 1) {
						// <PRB> Uint16Array can't be created on an odd sized array buffer.
						// NOTE : Assuming little endian.
						const ar = new _shared.Natives.windowUint8Array(buf);
						lastChr = _shared.Natives.stringFromCharCode(ar[buf.byteLength - 1]);
						buf = buf.slice(0, buf.byteLength - 1);
					};

					// Source: https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
					// NOTE: May crash with huge strings
					const str = _shared.Natives.stringFromCharCodeApply(null, new _shared.Natives.windowUint16Array(buf));
					return (lastChr ? str + lastChr : str);
				});

				// NOTE: Experimental
				types.ADD('stringToBytes', function stringToBytes(str, /*optional*/size) {
					// TODO: Find a better solution.

					// Raw string to bytes array, without conversion.

					// --- Damned, Node.Js ignores high-order bytes. ---
					//let buf = _shared.Natives.globalBufferFrom(str, "binary");
					//// <PRB> There is actually no "offset" and "size" arguments to "Buffer.from" with strings.
					//if (size < str.length * 2) {
					//	buf = buf.slice(0, size);
					//};


					// --- Damned, Uint16Array can't be created on an odd sized array buffer. ---
					//let i = 0,
					//	pos = 0;
					//let bufView = new _shared.Natives.windowUint16Array(buf);
					//for (; i < strLen - 1 && pos < size; i++) {
					//	bufView[i] = _shared.Natives.stringCharCodeAtCall(str, i);
					//	pos += 2;
					//};
					//if (size & 1) {
					//	bufView = new _shared.Natives.windowUint8Array(buf);
					//	// NOTE : Assuming little endian.
					//	bufView[pos] = (_shared.Natives.stringCharCodeAtCall(str, i) & 0xFF00) >> 8;
					//} else {
					//	bufView[i] = _shared.Natives.stringCharCodeAtCall(str, i);
					//};



					// NOTE : Assuming little endian.
					const strLen = str.length;
					size = (types.isNothing(size) ? strLen * 2 : _shared.Natives.mathMin(strLen * 2, size));
					const buf = new _shared.Natives.windowArrayBuffer(size);
					const bufView = new _shared.Natives.windowUint8Array(buf);
					let pos = 0;
					for (let i = 0; i < strLen && pos < size; i++) {
						const cc = _shared.Natives.stringCharCodeAtCall(str, i);
						bufView[pos++] = cc & 0x00FF;
						if (pos < size) {
							bufView[pos++] = (cc & 0xFF00) >> 8;
						};
					};
					return _shared.Natives.globalBufferFrom(buf);
				});



				return function init(/*optional*/options) {
					__Internal__.caseSensitive = tools.getOptions().caseSensitive;
					if (types.isNothing(__Internal__.caseSensitive)) {
						// Detect case-sensitive
						// NOTE: On some systems, the temp folder may have a different file system.
						const temp = files.getTempFolder(),
							uuid = tools.generateUUID(),
							name1 = temp + 'DoOdAd.' + uuid,
							name2 = temp + 'dOoDaD.' + uuid;
						files.mkdir(name1, {ignoreExists: false});
						try {
							files.mkdir(name2, {ignoreExists: false});
							__Internal__.caseSensitive = true;
						} catch(ex) {
							__Internal__.caseSensitive = false;
						} finally {
							try {
								files.rmdir(name1);
							} catch(ex) {
							};
							try {
								files.rmdir(name2);
							} catch(ex) {
							};
						};
					};
				};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()