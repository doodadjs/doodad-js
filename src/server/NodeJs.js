/* global process */

//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: NodeJs.js - Node.js Tools
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
	//! INJECT("import {default as nodeOs} from 'os';");
	//! INJECT("import {default as nodeChildProcess} from 'child_process';");
	//! INJECT("import {default as nodeFs} from 'fs';");
	//! INJECT("import {default as nodeHttp} from 'http';");
	//! INJECT("import {default as nodeConsole} from 'console';");
//! ELSE()
	"use strict";

	const nodeOs = require('os'),
		nodeChildProcess = require('child_process'),
		nodeFs = require('fs'),
		nodeHttp = require('http'),
		nodeConsole = require('console');
//! END_IF()

const nodeOsTmpdir = nodeOs.tmpdir,

	nodeChildProcessSpawn = nodeChildProcess.spawn,
	nodeChildProcessSpawnSync = nodeChildProcess.spawnSync,

	nodeFsClose = nodeFs.close,
	nodeFsCloseSync = nodeFs.closeSync,
	nodeFsLstat = nodeFs.lstat,
	nodeFsLstatSync = nodeFs.lstatSync,
	nodeFsMkdir = nodeFs.mkdir,
	nodeFsMkdirSync = nodeFs.mkdirSync,
	nodeFsOpen = nodeFs.open,
	nodeFsOpenSync = nodeFs.openSync,
	nodeFsRead = nodeFs.read,
	nodeFsReaddir = nodeFs.readdir,
	nodeFsReaddirSync = nodeFs.readdirSync,
	nodeFsReadFile = nodeFs.readFile,
	nodeFsReadFileSync = nodeFs.readFileSync,
	nodeFsReadlink = nodeFs.readlink,
	nodeFsReadlinkSync = nodeFs.readlinkSync,
	nodeFsReadSync = nodeFs.readSync,
	nodeFsRmdir = nodeFs.rmdir,
	nodeFsRmdirSync = nodeFs.rmdirSync,
	nodeFsStat = nodeFs.stat,
	nodeFsStatSync = nodeFs.statSync,
	nodeFsSymlink = nodeFs.symlink,
	nodeFsSymlinkSync = nodeFs.symlinkSync,
	nodeFsUnlink = nodeFs.unlink,
	nodeFsUnlinkSync = nodeFs.unlinkSync,
	nodeFsUtimes = nodeFs.utimes,
	nodeFsUtimesSync = nodeFs.utimesSync,
	nodeFsWatch = nodeFs.watch,
	nodeFsWrite = nodeFs.write,
	nodeFsWriteFile = nodeFs.writeFile,
	nodeFsWriteSync = nodeFs.writeSync,

	nodeHttpRequest = nodeHttp.request,

	nodeConsoleConsole = nodeConsole.Console;


exports.add = function add(mods) {
	mods = (mods || {});
	mods['Doodad.NodeJs/root'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		namespaces: ['MixIns', 'Interfaces'],
		dependencies: [
			'Doodad.Types',
			'Doodad.Types/DDCancelable',
			'Doodad.Tools',
			'Doodad.Tools.Config',
			'Doodad.Tools.Files',
			'Doodad'
		],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			const doodad = root.Doodad,
				mixIns = doodad.MixIns,
				extenders = doodad.Extenders,
				//namespaces = doodad.Namespaces,
				types = doodad.Types,
				tools = doodad.Tools,
				files = tools.Files,
				nodejs = doodad.NodeJs,
				//nodejsMixIns = nodejs.MixIns,
				nodejsInterfaces = nodejs.Interfaces;


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

				symbolDestroyed: types.getSymbol('__NODE_OBJ_DESTROYED__'),

				newListener: 'newListener',
				removeListener: 'removeListener',
			};

			__Internal__.removeListenerPrefixed = _shared.EVENT_NAME_PREFIX + __Internal__.removeListener;

			//===================================
			// Natives
			//===================================

			tools.complete(_shared.Natives, {
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
				processExit: global.process.exit.bind(global.process),
				consoleError: global.console.error.bind(global.console),

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

				globalBufferAlloc: (types.isFunction(global.Buffer.alloc) ? global.Buffer.alloc : function(size) {
					return new _shared.Native.globalBuffer(size);
				}),
			});

			//===================================
			// Buffers
			//===================================

			types.ADD('isBuffer', (_shared.Natives.globalBufferIsBuffer || (function(obj) {
				if (types.isNothing(obj)) {
					return false;
				};
				return (typeof obj === 'object') && (obj instanceof _shared.Natives.globalBuffer);
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
					types.isFunction(emitter.setMaxListeners);
				//types.isFunction(emitter.eventNames) // NOTE: "eventNames" is new since Node.js v. 6.0.0
			});

			// <PRB> Some libraries don't inherit from EventEmitter, but use it internally and exposes only a few of its methods.
			types.ADD('isEmitterLike', function isEmitterLike(emitter) {
				return types.isFunction(emitter.on) &&
					types.isFunction(emitter.once) &&
					types.isFunction(emitter.removeListener);
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
					types.isFunction(stream.unpipe) &&
					types.isFunction(stream.push) &&
					types.isFunction(stream.unshift);
			});

			// <PRB> Some libraries don't inherit from EventEmitter and expose only a few of its methods.
			types.ADD('isWritableStream', function isWritableStream(stream) {
				// <PRB> Node.Js has no object models, so we must test for functions.
				return types.isEmitter(stream) &&
					types.isFunction(stream.write) &&
					types.isFunction(stream.end);
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
					/* eslint no-cond-assign: "off" */

					// NOTE: Now, starting from Node v8, 'destroyed' is a getter/setter.
					if (!obj[__Internal__.symbolDestroyed]) {
						const isEmitter = types.isEmitterLike(obj);
						const isStream = types.isStream(obj);

						// 0) Extra needed step

						if (isStream && types.isFunction(obj.unpipe)) {
							// <PRB> After destroy/close, pipes may still exist.
							obj.unpipe();
						};

						if ((isEmitter || isStream) && types.isFunction(obj.removeAllListeners)) {
							// <PRB> Events could still occur even after a destroy/close.
							obj.removeAllListeners();
						};

						if ((isEmitter || isStream) && types.isFunction(obj.on)) {
							// <PRB> The 'error' event could emits even after a destroy/close.
							obj.on('error', function noop() {});
						};


						// 1) Try "destroy"

						if (types.isFunction(obj.destroy)) {
							if (isStream) {
								// NOTE: Since Node.js v. 8, "destroy" takes an "error" argument.
								obj.destroy(new types.ScriptInterruptedError("Stream is about to be destroyed."));
							} else {
								obj.destroy();
							};
						};

						let ws = null;


						// 2) Try "end"

						if (isStream && types.isFunction(obj.end) && (!(ws = obj._writableState) || (!ws.ending && !ws.ended))) {
							// NOTE: Since Node.js v. 9, "close" in writables streams seems to be replaced by "end".
							obj.end();
						};


						// 3) Try "close"

						// <PRB> There are different flags meaning "closed" accross stream types and Node.js releases.
						// <PRB> Node.js v. 9 : A callback argument is needed to "close" when the stream is ending or ended.
						// NOTE: Since Node.js v. 9, "close" seems to be replaced by "destroy".
						if (isStream && types.isFunction(obj.close) && (!(ws = obj._writableState) || (!ws.ending && !ws.ended)) && !obj._closed && !obj.closed) {
							obj.close();
						};


						// 4) Set "destroyed" flag(s)

						// <PRB> Not every NodeJs destroyable object has/maintains the "destroyed" flag.
						// <PRB> Not every NodeJs closable object has/maintains the "_closed" or the "closed" flag.
						// <PRB> The "_closed" flag can be a read-only property. So we use "destroyed" instead.
						// NOTE: Node.js v. 8 : 'destroyed' is a getter/setter.
						obj[__Internal__.symbolDestroyed] = true;

						// <PRB> Node.Js v 7.7.1: ZLib may have a callback that crashes when the stream is closed :
						//		TypeError: Cannot read property 'write' of null
						//			at Zlib.callback (zlib.js:609:32)
						if (isStream && (typeof obj.constructor === 'function') && (obj.constructor.name === 'Gzip')) {
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
					return !!obj[__Internal__.symbolDestroyed];
				} else {
					return __Internal__.oldDESTROYED(obj);
				}
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
					/* eslint consistent-return: "off" */

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
				if (!err || err.trapped || (!err.critical && err.bubble)) {
					// Ignore trapped errors or errors like "ScriptInterruptedError".
					return;
				};

				// NOTE: This is the last resort error handling.
				// NOTE: types.ScriptAbortedError should bubbles here

				err.trapped = true;

				let exitCode = 1; // 1 = General error
				let isAborted = false;
				try {
					isAborted = types._instanceof(err, types.ScriptAbortedError);
				} catch(o) {
					if (root.getOptions().debug) {
						types.DEBUGGER();
					};
				};
				if (isAborted) {
					exitCode = err.exitCode;
				};

				let ev = null;
				try {
					ev = new types.CustomEvent('exit', {cancelable: true, detail: {error: err, exitCode: exitCode}});
					tools.dispatchEvent(ev); // sync
				} catch(o) {
					ev = null;
					if (root.getOptions().debug) {
						types.DEBUGGER();
					};
				};

				if (!ev || !ev.canceled) {
					_shared.Natives.process.exitCode = exitCode;

					if (!isAborted) {
						try {
							const msg = "<FATAL ERROR> " + err.message + '\n' + err.stack + '\n';
							_shared.Natives.consoleError(msg);
						} catch(o) {
							if (root.getOptions().debug) {
								types.DEBUGGER();
							};
						};
					};

					_shared.Natives.processExit();
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

					url = files.Path.parse(url).toApiString();

					// Remove unwanted "node" args
					const execArgs = tools.filter(process.execArgv, function(arg) {
						const val = arg.split('=')[0];
						return ((val !== '--debug-brk') && (val !== '--inspect-brk'));
					});

					args = tools.append([], execArgs, [url], args);

					/*const child =*/ nodeChildProcessSpawn(process.execPath, args, {
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

			__Internal__.ScriptLoader = types.INIT(types.CustomEventTarget.$inherit(
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
					lastError: null,

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
						/* eslint global-require: "off", import/no-dynamic-require: "off" */

						if (this.launched) {
							if (this.ready) {
								if (this.failed) {
									this.dispatchEvent(new types.CustomEvent('error', {detail: this.lastError}));
								} else {
									this.dispatchEvent(new types.CustomEvent('load'));
								};
							};
						} else {
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
								require(this.file);

								this.ready = true;

								this.dispatchEvent(new types.CustomEvent('load'));
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
									this.lastError = ex;
									this.dispatchEvent(new types.CustomEvent('error', {detail: ex}));
									tools.dispatchEvent(new types.CustomEvent('scripterror', {
										detail: {
											loader: this,
											error: ex,
										},
									}));
								};
							};

						};
					},
				}
			));

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
						loader = new __Internal__.ScriptLoader(/*file*/file, /*createOptions*/null, /*initOptions*/null);
						__Internal__.loadedScripts[file] = loader;
					};

					return loader;
				}));


			//=====================================
			// Files functions
			//=====================================

			files.ADD('existsSync', function existsSync(path, /*optional*/options) {
				path = files.parsePath(path);

				const type = types.get(options, 'type', null);

				try {
					const stats = nodeFsStatSync(path.toApiString());

					return (type === 'file' ? stats.isFile() : (type === 'folder' ? stats.isDirectory() : true));

				} catch(ex) {
					if (ex.code === 'ENOENT') {
						return false;
					} else {
						throw ex;
					}
				}
			});

			files.ADD('existsAsync', function existsAsync(path, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function tryExists() {
					const exists = function exists(path, type) {
						return Promise.create(function existsPromise(resolve, reject) {
							nodeFsStat(path, function(ex, stats) {
								if (ex) {
									if (ex.code === 'ENOENT') {
										resolve(false);
									} else {
										reject(ex);
									};
								} else {
									resolve((type === 'file' ? stats.isFile() : (type === 'folder' ? stats.isDirectory() : true)));
								};
							});
						});
					};

					path = files.parsePath(path);

					const type = types.get(options, 'type', null);

					return exists(path.toString(), type);
				});
			});

			files.ADD('exists', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
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
						returns: 'bool,Promise(bool)',
						description: "Returns 'true' if file or folder exists, returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function exists(path, /*optional*/options) {
					const async = types.get(options, 'async', false);

					if (async) {
						return files.existsAsync(path, options);
					} else {
						return files.existsSync(path, options);
					}
				}));

			files.ADD('rmSync', function rmSync(path, /*optional*/options) {
				path = files.parsePath(path);

				try {
					nodeFsUnlinkSync(path.toApiString());

				} catch(ex) {
					if (ex.code === 'ENOENT') {
						return false;
					} else {
						throw ex;
					}
				};

				return true;
			});

			files.ADD('rmAsync', function rmAsync(path, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function tryRm() {
					const unlink = function unlink(path) {
						return Promise.create(function unlinkPromise(resolve, reject) {
							nodeFsUnlink(path, function(ex) {
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

					path = files.parsePath(path);

					return unlink(path.toApiString());
				});
			});

			files.ADD('rm', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
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
						return files.rmAsync(path, options);
					} else {
						return files.rmSync(path, options);
					}
				}));

			files.ADD('rmdirSync', function rmdirSync(path, /*optional*/options) {
				const force = types.get(options, 'force', false);

				path = files.parsePath(path);

				const pathStr = path.toApiString();

				try {
					nodeFsRmdirSync(pathStr);

				} catch(ex) {
					if (ex.code === 'ENOENT') {
						return false;

					} else if ((ex.code === 'ENOTEMPTY') && force) {
						const dirFiles = nodeFsReaddirSync(pathStr);

						const count = dirFiles.length;

						for (let i = 0; i < count; i++) {
							const dirFile = dirFiles[i];

							const newPath = path.combine(dirFile);

							try {
								nodeFsUnlinkSync(newPath.toApiString());

							} catch(ex) {
								if (ex.code === 'ENOENT') {
									// Do nothing
								} else if (ex.code === 'EPERM') {
									try {
										const stats = nodeFsStat(newPath.toApiString());
										if (stats.isDirectory()) {
											files.rmdirSync(newPath, options);
										} else {
											// EPERM
											throw ex;
										};
									} catch(ex2) {
										if (ex2.code !== 'ENOENT') {
											throw ex2;
										};
									};
								} else {
									throw ex;
								};
							};
						};

						try {
							nodeFsRmdirSync(pathStr);

						} catch(ex) {
							if (ex.code !== 'ENOENT') {
								throw ex;
							};
						};

					} else {
						throw ex;

					};
				};

				return true;
			});

			files.ADD('rmdirAsync', function rmdirAsync(path, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function tryRmDir() {
					path = files.parsePath(path);

					const force = types.get(options, 'force', false),
						cancelable = types.get(options, 'cancelable', false),
						timeout = types.get(options, 'timeout', null),
						hasTimeout = types.isInteger(timeout) && (timeout > 0);

					const state = {
						timeoutId: null,
						cancelable: null,
						resolveCb: null,
						rejectCb: null,
					};

					const isFolder = function _isFolder(path) {
						return Promise.create(function stat(resolve, reject) {
							nodeFsStat(path, function(err, stats) {
								if (err) {
									reject(err);
								} else {
									resolve(stats.isDirectory());
								};
							});
						});
					};

					const rmdir = function _rmdir(path) {
						return Promise.create(function doRmDir(resolve, reject) {
							nodeFsRmdir(path, function(err) {
								if (err) {
									reject(err);
								} else {
									resolve();
								};
							});
						});
					};

					const unlink = function _unlink(path) {
						return Promise.create(function doUnlink(resolve, reject) {
							nodeFsUnlink(path, function(err) {
								if (err) {
									reject(err);
								} else {
									resolve();
								};
							});
						});
					};

					const readdir = function _readdir(path) {
						return Promise.create(function doReadDir(resolve, reject) {
							nodeFsReaddir(path, function readdirCb(err, names) {
								if (err) {
									reject(err);
								} else {
									resolve(names);
								};
							});
						});
					};

					let proceed;

					const loopDeleteContent = function _loopDeleteContent(parent, names, index) {
						/* eslint consistent-return: "off" */
						if (index < names.length) {
							const path = parent.combine(names[index]);
							const pathStr = path.toApiString();
							const promise = unlink(pathStr);
							return (state.cancelable ? state.cancelable.race(promise) : promise)
								.nodeify(function manageUnlinkResult(err, dummy) {
									if (err) {
										if (err.code === 'ENOENT') {
											return loopDeleteContent(parent, names, index + 1);
										} else if (err.code === 'EPERM') {
											return isFolder(pathStr)
												.nodeify(function(err2, isFolder) {
													if (err2) {
														if (err2.code === 'ENOENT') {
															// Ignore
														} else {
															throw err2;
														};
													} else if (isFolder) {
														return proceed(path);
													} else {
														// EPERM
														throw err;
													};
												})
												.then(function deleteNextFile() {
													return loopDeleteContent(parent, names, index + 1);
												});
										} else {
											throw err;
										}
									} else {
										return loopDeleteContent(parent, names, index + 1);
									}
								});
						};
					};

					proceed = function _proceed(path) {
						const pathStr = path.toApiString();
						return rmdir(pathStr)
							.catch(function catchNotEmpty(err) {
								if (force && (err.code === 'ENOTEMPTY')) {
									return readdir(pathStr)
										.then(function deletePathContent(names) {
											return loopDeleteContent(path, names, 0);
										})
										.then(function deletePath(dummy) {
											return rmdir(pathStr);
										});
								} else {
									throw err;
								}
							})
							.nodeify(function returnResult(err, dummy) {
								if (err) {
									if (err.code === 'ENOENT') {
										return false;
									} else {
										throw err;
									}
								} else {
									return true;
								}
							});
					};

					const startCb = function _startRmdirAsync() {
						return proceed(path)
							.nodeify(function(err, result) {
								if (state.timeoutId) {
									state.timeoutId.cancel();
									state.timeoutId = null;
								};
								if (err) {
									return state.rejectCb(err);
								} else {
									return state.resolveCb(result);
								}
							});
					};

					if (cancelable || hasTimeout) {
						const cancelCb = function _cancelCb() {
							if (state.timeoutId) {
								state.timeoutId.cancel();
								state.timeoutId = null;
							};
						};

						state.cancelable = new types.DDCancelable(function(resolveCb, rejectCb) {
							state.resolveCb = resolveCb;
							state.rejectCb = rejectCb;
							return { startCb, cancelCb };
						});

						if (hasTimeout) {
							state.timeoutId = tools.callAsync(function() {
								return state.cancelable.cancel(new types.TimeoutError());
							}, timeout, null, null, true);
						};

						return (cancelable ? state.cancelable : state.cancelable.start());
					} else {
						state.resolveCb = Promise.resolve.bind(Promise);
						state.rejectCb = Promise.reject.bind(Promise);

						return startCb();
					}
				});
			});

			files.ADD('rmdir', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
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
					const async = types.get(options, 'async', false);

					if (async) {
						return files.rmdirAsync(path, options);
					} else {
						return files.rmdirSync(path, options);
					}
				}));

			files.ADD('mkdirSync', function mkdirSync(path, /*optional*/options) {
				path = files.parsePath(path);
				path = path.pushFile();

				const ignoreExists = types.get(options, 'ignoreExists', true),
					makeParents = types.get(options, 'makeParents', false);

				if (makeParents) {
					const ar = path.toArray({pathOnly: true, trim: true}),
						count = ar.length;

					for (let i = 0; i < ar.length; i++) {
						const newPathStr = path.toApiString({
							path: ar.slice(0, i + 1),
						});

						try {
							nodeFsMkdirSync(newPathStr);

						} catch(ex) {
							if ((!ignoreExists && (i === count - 1)) || (ex.code !== 'EEXIST')) {
								throw ex;
							};
						};
					};

				} else {
					try {
						nodeFsMkdirSync(path.toApiString());

					} catch(ex) {
						if (!ignoreExists || (ex.code !== 'EEXIST')) {
							throw ex;
						};
					};

				};
			});

			files.ADD('mkdirAsync', function mkdirAsync(path, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function mkdirPromise() {
					path = files.parsePath(path);
					path = path.pushFile();

					const ignoreExists = types.get(options, 'ignoreExists', true),
						makeParents = types.get(options, 'makeParents', false);

					const mkdir = function(path) {
						return Promise.create(function mkdirPromise(resolve, reject) {
							nodeFsMkdir(path, function(err) {
								if (err) {
									if (ignoreExists && (err.code === 'EEXIST')) {
										resolve();
									} else {
										reject(err);
									};
								} else {
									resolve();
								};
							});
						});
					};

					if (makeParents) {
						const ar = path.toArray({pathOnly: true, trim: true}),
							count = ar.length;

						const createLoop = function _createLoop(index) {
							return Promise.try(function tryCreateLoop() {
								if (index < count) {
									const newPathStr = path.toApiString({
										path: ar.slice(0, index + 1),
									});

									return mkdir(newPathStr)
										.then(function(result) {
											return createLoop(index + 1);
										})
										.catch(function(err) {
											if ((ignoreExists || (index < count - 1)) && (err.code === 'EEXIST')) {
												return createLoop(index + 1);
											} else {
												throw err;
											}
										});
								};
							});
						};

						return createLoop(0);

					} else {
						return mkdir(path.toApiString());

					}
				});
			});

			files.ADD('mkdir', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 6,
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
						returns: 'undefined,Promise(unedfined)',
						description: "Creates specified system folder.",
					}
				//! END_REPLACE()
				, function mkdir(path, /*optional*/options) {
					const async = types.get(options, 'async', false);

					if (async) {
						return files.mkdirAsync(path, options);
					} else {
						return files.mkdirSync(path, options);
					}
				}));

			files.ADD('copySync', function copySync(source, destination, /*optional*/options) {
				/* eslint no-unsafe-finally: "off" */

				const bufferLength = types.get(options, 'bufferLength', 16384),
					preserveTimes = types.get(options, 'preserveTimes', true),
					override = types.get(options, 'override', false),
					recursive = types.get(options, 'recursive', false),
					skipInvalid = types.get(options, 'skipInvalid', false),
					makeParents = types.get(options, 'makeParents', false),
					followLinks = types.get(options, 'followLinks', true);

				let COPY_FILE_BUFFER = null;

				const copyInternal = function _copyInternal(source, destination) {
					source = files.parsePath(source);
					destination = files.parsePath(destination);

					const sourceStr = source.toApiString();

					let stats;
					if (followLinks) {
						stats = nodeFsStatSync(sourceStr);
					} else {
						stats = nodeFsLstatSync(sourceStr);
					};

					if (stats.isSymbolicLink()) {
						// Copy symbolic link
						if (!destination.file) {
							destination = destination.set({ file: source.file });
						};

						const linkString = nodeFsReadlinkSync(sourceStr);

						const destStr = destination.toApiString();

						nodeFsSymlinkSync(linkString, destStr, (stats.isFile() ? 'file' : 'dir'));

						if (preserveTimes) {
							nodeFsUtimesSync(destStr, stats.atime, stats.mtime);
						};

					} else if (stats.isFile()) {
						// Copy file
						if (!destination.file) {
							destination = destination.set({ file: source.file });
						};

						const destStr = destination.toApiString();

						if (!COPY_FILE_BUFFER) {
							COPY_FILE_BUFFER = _shared.Natives.globalBufferAlloc(bufferLength);
						};

						let sourceFd = null,
							destFd = null;
						try {
							sourceFd = nodeFsOpenSync(sourceStr, 'r');
							destFd = nodeFsOpenSync(destStr, (override ? 'w' : 'wx'));

							let bytesRead = 0;
							do {
								bytesRead = nodeFsReadSync(sourceFd, COPY_FILE_BUFFER, null, COPY_FILE_BUFFER.length);
								if (bytesRead) {
									nodeFsWriteSync(destFd, COPY_FILE_BUFFER, 0, bytesRead);
								};
							} while (bytesRead);

						} catch(ex) {
							throw ex;

						} finally {
							try {
								if (!types.isNothing(sourceFd)) {
									nodeFsCloseSync(sourceFd);
								};
							} catch(ex) {
								throw ex;
							} finally {
								if (!types.isNothing(destFd)) {
									nodeFsCloseSync(destFd);
								};
							};
						};

						if (preserveTimes) {
							nodeFsUtimesSync(destStr, stats.atime, stats.mtime);
						};

					} else if (stats.isDirectory() && recursive) {
						// Recurse directory
						files.mkdir(destination, {makeParents: makeParents, async: false});

						const dirFiles = nodeFsReaddirSync(sourceStr);
						for (let i = 0; i < dirFiles.length; i++) {
							const dirFile = dirFiles[i];
							copyInternal(source.combine(dirFile), destination.combine(dirFile));
						};

						if (preserveTimes) {
							// FIXME: Dates are not correct
							nodeFsUtimesSync(destination.toApiString(), stats.atime, stats.mtime);
						};

					} else if (!skipInvalid) {
						// Invalid file system object
						if (stats.isDirectory()) {
							throw new types.Error("The 'recursive' option must be set to copy folder : '~0~'.", [sourceStr]);
						} else {
							throw new types.Error("Invalid file or folder : '~0~'.", [sourceStr]);
						}
					};
				};

				return copyInternal(source, destination);
			});

			files.ADD('copyAsync', function copyAsync(source, destination, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function copyPromise() {
					const bufferLength = types.get(options, 'bufferLength', 16384),
						preserveTimes = types.get(options, 'preserveTimes', true),
						override = types.get(options, 'override', false),
						recursive = types.get(options, 'recursive', false),
						skipInvalid = types.get(options, 'skipInvalid', false),
						makeParents = types.get(options, 'makeParents', false),
						followLinks = types.get(options, 'followLinks', true),
						cancelable = types.get(options, 'cancelable', false),
						timeout = types.get(options, 'timeout', null),
						hasTimeout = types.isInteger(timeout) && (timeout > 0);

					const state = {
						timeoutId: null,
						cancelable: null,
						resolveCb: null,
						rejectCb: null,
					};

					let COPY_FILE_BUFFER = null;

					const stat = function _stat(path) {
						return Promise.create(function statPromise(resolve, reject) {
							nodeFsStat(path, function(err, stats) {
								if (err) {
									reject(err);
								} else {
									resolve(stats);
								};
							});
						});
					};

					const lstat = function _lstat(path) {
						return Promise.create(function lstatPromise(resolve, reject) {
							nodeFsLstat(path, function(err, stats) {
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
							nodeFsReadlink(path, function(err, link) {
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
							nodeFsSymlink(link, path, type, function(err) {
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
							nodeFsUtimes(path, atime, mtime, function(err) {
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
							nodeFsOpen(path, mode, function(err, fd) {
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
							nodeFsClose(fd, function(err) {
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
							nodeFsRead(fd, COPY_FILE_BUFFER, null, COPY_FILE_BUFFER.length, null, function(err, bytesRead) {
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
							nodeFsWrite(fd, COPY_FILE_BUFFER, 0, bytesCount, function(err) {
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
							nodeFsReaddir(path, function(err, files) {
								if (err) {
									reject(err);
								} else {
									resolve(files);
								};
							});
						});
					};

					const copyInternal = function _copyInternal(source, destination) {
						return Promise.try(function copyInternalPromise() {
							source = files.parsePath(source);
							destination = files.parsePath(destination);

							const sourceStr = source.toApiString();

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
								const promise = read(sourceFd)
									.then(function(bytesRead) {
										if (bytesRead > 0) {
											return write(destFd, bytesRead)
												.then(function(dummy) {
													return loopCopyFileContent(sourceFd, destFd);
												});
										};
									});
								return (state.cancelable ? state.cancelable.race(promise) : promise);
							};

							const copyFile = function _copyFile(stats) {
								// Copy file
								return Promise.try(function() {
									if (!destination.file) {
										destination = destination.set({ file: source.file });
									};
									const destStr = destination.toApiString();
									if (!COPY_FILE_BUFFER) {
										COPY_FILE_BUFFER = _shared.Natives.globalBufferAlloc(bufferLength);
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
								const promise = Promise.try(function() {
									const dirFile = dirFiles[index];
									if (dirFile) {
										return copyInternal(source.combine(dirFile), destination.combine(dirFile))
											.then(function() {
												return loopDirectoryContent(dirFiles, index + 1);
											});
									};
								});
								return (state.cancelable ? state.cancelable.race(promise) : promise);
							};

							const copyDirectory = function _copyDirectory(stats) {
								// Recurse directory
								return files.mkdir(destination, {makeParents: makeParents, async: true})
									.then(function(dummy) {
										return readdir(sourceStr);
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

							return Promise.try(function() {
								if (followLinks) {
									return stat(sourceStr);
								} else {
									return lstat(sourceStr);
								}
							})
								.then(function(stats) {
									if (stats.isSymbolicLink()) {
										return copyLink(stats);
									} else if (stats.isFile()) {
										return copyFile(stats);
									} else if (stats.isDirectory() && recursive) {
										return copyDirectory(stats);
									} else if (!skipInvalid) {
										// Invalid file system object
										if (stats.isDirectory()) {
											throw new types.Error("The 'recursive' option must be set to copy folder : '~0~'.", [sourceStr]);
										} else {
											throw new types.Error("Invalid file or folder : '~0~'.", [sourceStr]);
										}
									};
								});
						});
					};

					const startCb = function startCopyAsync() {
						return copyInternal(source, destination)
							.nodeify(function(err, result) {
								if (state.timeoutId) {
									state.timeoutId.cancel();
									state.timeoutId = null;
								};
								if (err) {
									return state.rejectCb(err);
								} else {
									return state.resolveCb(result);
								}
							});
					};

					if (cancelable || hasTimeout) {
						const cancelCb = function _cancelCb() {
							if (state.timeoutId) {
								state.timeoutId.cancel();
								state.timeoutId = null;
							};
						};

						state.cancelable = new types.DDCancelable(function(resolveCb, rejectCb) {
							state.resolveCb = resolveCb;
							state.rejectCb = rejectCb;
							return { startCb, cancelCb };
						});

						if (hasTimeout) {
							state.timeoutId = tools.callAsync(function() {
								return state.cancelable.cancel(new types.TimeoutError());
							}, timeout, null, null, true);
						};

						return (cancelable ? state.cancelable : state.cancelable.start());
					} else {
						state.resolveCb = Promise.resolve.bind(Promise);
						state.rejectCb = Promise.reject.bind(Promise);

						return startCb();
					}
				});
			});

			files.ADD('copy', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 7,
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
						returns: 'undefined,Promise(undefined)',
						description: "Copies source file or folder to destination.",
					}
				//! END_REPLACE()
				, function copy(source, destination, /*optional*/options) {
					const async = types.get(options, 'async', false);

					if (async) {
						return files.copyAsync(source, destination, options);
					} else {
						return files.copySync(source, destination, options);
					}
				}));

			__Internal__.readdirAddFile = function readdirAddFile(result, base, name, stats, followLinks, type) {
				const isFolder = stats.isDirectory(),
					isFile = stats.isFile(),
					isLink = !followLinks && stats.isSymbolicLink();
				let ok = false;
				if (isFolder && (!type || (type === 'folder'))) {
					ok = true;
				} else if (isFile && (!type || (type === 'file'))) {
					ok = true;
				} else if (isLink && (!type || (type === 'link'))) {
					ok = true;
				};
				const path = (isFolder ? base.combine(name, {file: ''}) : ok && base.combine(name));
				if (ok) {
					const file = {
						name,
						path,
						isFolder,
						isFile,
						isLink,
						size: stats.size, // bytes
						// ...
					};
					result.push(file);
				};
				return (isFolder ? path : null);
			};

			files.ADD('readdirSync', function readdirSync(path, /*optional*/options) {
				path = files.parsePath(path);

				const depth = (+types.get(options, 'depth') || 0),  // null|undefined|true|false|NaN|Infinity
					relative = types.get(options, 'relative', false),
					followLinks = types.get(options, 'followLinks', true),
					type = types.get(options, 'type', null),
					skipDenied = types.get(options, 'skipDenied', false);

				let proceed;

				const parse = function _parse(result, parent, base, name, depth) {
					const path = parent.combine(name);
					let stats = null;
					try {
						if (followLinks) {
							stats = nodeFsStatSync(path.toApiString());
						} else {
							stats = nodeFsLstatSync(path.toApiString());
						};
					} catch(ex) {
						if (!skipDenied || (ex.code !== 'EPERM')) {
							throw ex;
						};
					};
					if (stats) {
						const newBase = __Internal__.readdirAddFile(result, base, name, stats, followLinks, type);
						if (newBase) {
							return proceed(result, path, newBase, depth - 1);
						};
					};
				};

				proceed = function _proceed(result, path, base, depth) {
					if (depth >= 0) {
						const names = nodeFsReaddirSync(path.toApiString());
						for (let i = 0; i < names.length; i++) {
							parse(result, path, base, names[i], depth);
						};
					};
					return result;
				};

				return proceed([], path, (relative ? files.Path.parse('./', {os: 'linux'}) : path), depth);
			});

			files.ADD('readdirAsync', function readdirAsync(path, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function readdirPromise() {
					path = files.parsePath(path);

					const depth = (+types.get(options, 'depth') || 0),  // null|undefined|true|false|NaN|Infinity
						relative = types.get(options, 'relative', false),
						followLinks = types.get(options, 'followLinks', true),
						type = types.get(options, 'type', null),
						skipDenied = types.get(options, 'skipDenied', false),
						timeout = types.get(options, 'timeout', null),
						hasTimeout = types.isInteger(timeout) && (timeout > 0),
						cancelable = types.get(options, 'cancelable', false);

					const state = {
						timeoutId: null,
						cancelable: null,
						resolveCb: null,
						rejectCb: null,
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
								nodeFsStat(path, statCb);
							} else {
								nodeFsLstat(path, statCb);
							};
						});
					};

					const readDir = function readDir(path) {
						return Promise.create(function tryReaddir(resolve, reject) {
							nodeFsReaddir(path, function readdirCb(err, names) {
								if (err) {
									reject(err);
								} else {
									resolve(names);
								};
							});
						});
					};

					let proceed;

					const parseNames = function _parseNames(result, parent, base, names, index, depth) {
						if (index < names.length) {
							const name = names[index],
								path = parent.combine(name);
							const promise = getStats(path.toApiString());
							return (state.cancelable ? state.cancelable.race(promise) : promise)
								.nodeify(function thenAddAndProceed(err, stats) {
									if (err) {
										if (!skipDenied || (err.code !== 'EPERM')) {
											throw err;
										};
									} else {
										const newBase = __Internal__.readdirAddFile(result, base, name, stats, followLinks, type);
										if (newBase) {
											return proceed(result, path, newBase, depth - 1);
										};
									};
								})
								.then(function thenParseNames(dummy) {
									return parseNames(result, parent, base, names, index + 1, depth);
								});
						};
						return result;
					};

					proceed = function _proceed(result, path, base, depth) {
						if (depth >= 0) {
							const promise = readDir(path.toApiString());
							return (state.cancelable ? state.cancelable.race(promise) : promise)
								.then(function thenParseNames(names) {
									return parseNames(result, path, base, names, 0, depth);
								});
						};
						return result;
					};

					const startCb = function startReaddirAsync() {
						return proceed([], path, (relative ? files.Path.parse('./', {os: 'linux'}) : path), depth)
							.nodeify(function(err, result) {
								if (state.timeoutId) {
									state.timeoutId.cancel();
									state.timeoutId = null;
								};
								if (err) {
									return state.rejectCb(err);
								} else {
									return state.resolveCb(result);
								}
							});
					};

					if (cancelable || hasTimeout) {
						const cancelCb = function _cancelCb() {
							if (state.timeoutId) {
								state.timeoutId.cancel();
								state.timeoutId = null;
							};
						};

						state.cancelable = new types.DDCancelable(function(resolveCb, rejectCb) {
							state.resolveCb = resolveCb;
							state.rejectCb = rejectCb;
							return { startCb, cancelCb };
						});

						if (hasTimeout) {
							state.timeoutId = tools.callAsync(function() {
								return state.cancelable.cancel(new types.TimeoutError());
							}, timeout, null, null, true);
						};

						return (cancelable ? state.cancelable : state.cancelable.start());
					} else {
						state.resolveCb = Promise.resolve.bind(Promise);
						state.rejectCb = Promise.reject.bind(Promise);

						return startCb();
					}
				});
			});

			files.ADD('readdir', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
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
					const async = types.get(options, 'async', false);

					if (async) {
						return files.readdirAsync(path, options);
					} else {
						return files.readdirSync(path, options);
					}
				}));

			files.ADD('getCanonicalSync', function getCanonicalSync(path, /*optional*/options) {
				path = files.parsePath(path);

				const stats = nodeFsStatSync(path.toApiString());

				const ar = path.toArray({pathOnly: true, trim: true}),
					base = path.set({path: null, file: null});

				for (let i = ar.length - 1; i >= 0; i--) {
					const newPath = base.set({path: ar.slice(0, i)}).toApiString(),
						names = nodeFsReaddirSync(newPath),
						name = ar[i],
						nameLc = name.toLowerCase();

					let resolved = names.filter(function(n) {
						return n === name;
					})[0];

					if (!resolved) {
						resolved = names.filter(function(n) {
							return n.toLowerCase() === nameLc;
						})[0];
					};

					ar[i] = resolved;
				};

				let file = null;

				if (stats.isFile()) {
					file = ar.pop();
				};

				return base.set({path: ar, file: file});
			});

			files.ADD('getCanonicalAsync', function getCanonicalAsync(path, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function getCanonicalPromise() {
					path = files.parsePath(path);

					const stat = function stat(path) {
						path = path.toApiString();
						return Promise.create(function doCanonical(resolve, reject) {
							nodeFsStat(path, function statCb(err, stats) {
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
							nodeFsReaddir(path, function readdirCb(err, names) {
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
									let resolved = names.filter(function(n) {
										return n === name;
									})[0];
									if (!resolved) {
										const nameLc = name.toLowerCase();
										resolved = names.filter(function(n) {
											return n.toLowerCase() === nameLc;
										})[0];
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

					return proceed(path);
				});
			});

			files.ADD('getCanonical', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 5,
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
						return files.getCanonicalAsync(path, options);
					} else {
						return files.getCanonicalSync(path, options);
					}
				}));

			files.ADD('getTempFolder', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: null,
						returns: 'string',
						description: "Returns system temporary folder path.",
					}
				//! END_REPLACE()
				, function getTempFolder() {
					if (__Internal__.tmpdir) {
						return __Internal__.tmpdir;
					};

					let folder = nodeOsTmpdir();

					let stats = null;

					try {
						stats = nodeFsStatSync(folder);
					} catch(ex) {
						// Do nothing
					};

					if (!stats || !stats.isDirectory()) {
						// Android or other
						folder = files.Path.parse(process.cwd()).combine('tmp/', {os: 'linux'});
						try {
							files.mkdir(folder);
						} catch(ex) {
							// Do nothing
						};
					} else {
						folder = files.Path.parse(folder);
					};

					__Internal__.tmpdir = folder;

					return folder;
				}));

			files.ADD('readFileSync', function readFileSync(path, /*optional*/options) {
				if (types.isString(path)) {
					path = files.parseLocation(path);
				};

				const encoding = types.get(options, 'encoding', null);

				if (types._instanceof(path, files.Path) || (types._instanceof(path, files.Url) && ((!path.protocol) || (path.protocol === 'file')))) {
					if (types._instanceof(path, files.Url)) {
						path = files.Path.parse(path);
					};
					return nodeFsReadFileSync(path.toApiString(), {encoding: encoding});
				} else {
					throw new types.NotSupported("HTTP not supported synchronously.");
				}
			});

			files.ADD('readFileAsync', function readFileAsync(path, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function tryReadFile() {
					path = files.parseLocation(path);

					const encoding = types.get(options, 'encoding', null),
						timeout = types.get(options, 'timeout', 0) || 5000,  // Don't allow "0" (for infinite)
						maxLength = types.get(options, 'maxLength', 1024 * 1024 * 100);

					if (types._instanceof(path, files.Path) || (types._instanceof(path, files.Url) && ((!path.protocol) || (path.protocol === 'file')))) {
						return Promise.create(function readFile(resolve, reject) {
							if (types._instanceof(path, files.Url)) {
								path = files.Path.parse(path);
							};

							path = path.toApiString();

							nodeFsStat(path, function(ex, stats) {
								if (ex) {
									reject(ex);
								} else if (stats.size > maxLength) {
									reject(new types.Error("File size exceeds maximum length."));
								} else {
									nodeFsReadFile(path, {encoding: encoding}, function(ex, data) {
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
								state.request = nodeHttpRequest({
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
												state.data = global.Buffer.concat([state.data, chunk]);
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

					}
				});
			});

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

					if (async) {
						return files.readFileAsync(path, options);
					} else {
						return files.readFileSync(path, options);
					}
				}));

			files.ADD('writeFileAsync', function writeFileAsync(path, data, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function tryWriteFile() {
					path = files.parseLocation(path);

					const encoding = types.get(options, 'encoding', null),
						//timeout = types.get(options, 'timeout', 0) || 5000,  // Don't allow "0" (for infinite)
						mode = types.get(options, 'mode', 'update'); // 'forceUpdate' (file must exists), 'update' (file is created if it doesn't exist), 'forceAppend' (file must exists), 'append' (file is created if it doesn't exist)

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
							nodeFsStat(path, function(ex, stats) {
								if (ex) {
									if (ex.code === 'ENOENT') {
										switch (mode) {
										case 'forceUpdate':
										case 'forceAppend':
											reject(new types.Error("File '~0~' doesn't exists.", [path]));
											break;

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
								nodeFsWriteFile(path, data, {encoding: encoding, flag: wf}, function(ex) {
									if (ex) {
										reject(ex);
									} else {
										resolve();
									};
								});
							});

					} else {
						throw new types.NotSupported("Remote write is not implemented.");

					}
				});
			});

			files.ADD('writeFile', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
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

					if (async) {
						return files.writeFileAsync(path, data, options);
					} else {
						throw new types.NotSupported("Synchronous write is not implemented.");
					}
				}));

			files.ADD('watch', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 5,
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
					path = files.parseLocation(path);
					if (!types.isArray(callbacks)) {
						callbacks = [callbacks];
					};

					if (types._instanceof(path, files.Path) || (types._instanceof(path, files.Url) && ((!path.protocol) || (path.protocol === 'file')))) {
						if (types._instanceof(path, files.Url)) {
							path = files.Path.parse(path);
						};

						if (tools.getOptions().noWatch) {
							// NOTE: We parse location before "return".
							return;
						};

						const pathStr = path.toApiString();

						let data;
						if (types.has(__Internal__.watchedFiles, pathStr)) {
							data = __Internal__.watchedFiles[pathStr];
						} else {
							data = {
								callbacks: [],
								watcher: nodeFsWatch(pathStr, {persistent: false}, doodad.Callback(null, function(...args) {
									const data = __Internal__.watchedFiles[pathStr],
										len = data.callbacks.length;
									for (let i = len - 1; i >= 0; i--) {
										let callback = data.callbacks[i];
										if (callback) {
											try {
												callback(...args);
											} catch(ex) {
												// Do nothing
											};
											if (types.get(callback.__OPTIONS__, 'once', false)) {
												callback = null;
											};
										};
										if (!callback) {
											data.callbacks.splice(i, 1);
										};
									};
								})),
							};
							__Internal__.watchedFiles[pathStr] = data;
						};

						tools.forEach(callbacks, function(callback) {
							callback.__OPTIONS__ = options;
						});

						data.callbacks = tools.unique(data.callbacks, callbacks);

					} else {
						throw new types.NotSupported("Remote files are not supported.");
					};
				}));

			files.ADD('unwatch', root.DD_DOC(
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
							callbacks: {
								type: 'arrayof(function),function',
								optional: true,
								description: "Callback functions.",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Options.",
							},
						},
						returns: 'undefined',
						description: "Removes a file watcher.",
					}
				//! END_REPLACE()
				, function unwatch(path, /*optional*/callbacks, /*optional*/options) {
					path = files.parseLocation(path);
					if (!types.isNothing(callbacks)) {
						if (!types.isArray(callbacks)) {
							callbacks = [callbacks];
						};
					};

					if (types._instanceof(path, files.Url)) {
						path = files.Path.parse(path);
					};
					const pathStr = path.toApiString();

					if (types.has(__Internal__.watchedFiles, pathStr)) {
						const data = __Internal__.watchedFiles[pathStr];
						if (types.isNothing(callbacks)) {
							data.callbacks = null;
						} else {
							tools.popItems(data.callbacks, callbacks);
						};
						if (!data.callbacks || !data.callbacks.length) {
							data.watcher.close();
							delete __Internal__.watchedFiles[pathStr];
						};
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
					args = tools.append([], process.execArgv, [modulePath], args);
					options = tools.extend({}, {stdio: [0, 1, 2], env: process.env}, options);
					return nodeChildProcessSpawnSync(process.execPath, args, options);
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
					nodeConsoleConsole,

					/*_super*/
					function(hook, /*optional*/stdout, /*optional*/stderr) {
						if (!types.isJsFunction(hook)) {
							throw new types.ValueError("Invalid hook function.");
						};
						this.__hook = hook;
						this.__hasStd = !!stdout || !!stderr;
						if (!stdout) {
							stdout = process.stdout;
						};
						if (!stderr) {
							stderr = stdout;
						};
						return [stdout, stderr];
					},

					/*constructor*/
					null,

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
									throw new types.Error("'global.console' already captured.");
								};
								const newConsole = new this(hook, stdout, stderr);
								const oldConsole = global.console;
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

						log: types.SUPER(types.WRITABLE(function(/*paramarray*/...args) {
							try {
								const message = this.__hook('log', args);
								if (this.__hasStd) {
									if (message) {
										this._super(message);
									} else {
										this._super(...args);
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

						info: types.SUPER(types.WRITABLE(function(/*paramarray*/...args) {
							try {
								const message = this.__hook('info', args);
								if (this.__hasStd) {
									if (message) {
										this._super(message);
									} else {
										this._super(...args);
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

						error: types.SUPER(types.WRITABLE(function(/*paramarray*/...args) {
							try {
								const message = this.__hook('error', args);
								if (this.__hasStd) {
									if (message) {
										this._super(message);
									} else {
										this._super(...args);
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

						warn: types.SUPER(types.WRITABLE(function(/*paramarray*/...args) {
							try {
								const message = this.__hook('warn', args);
								if (this.__hasStd) {
									if (message) {
										this._super(message);
									} else {
										this._super(...args);
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

					__NODE_EVENTS: doodad.PROTECTED(doodad.READ_ONLY(/*doodad.NOT_INHERITED(*/doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray, {cloneOnInit: true}))))))),

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

			__Internal__.eventHandlerProto = {
				$TYPE_NAME: 'NodeEventHandler',
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('NodeEventHandler')), true) */,

				attach: doodad.OVERRIDE(function attach(emitters, /*optional*/context, /*optional*/once, /*optional*/prepend) {
					if (!types.isArray(emitters)) {
						emitters = [emitters];
					};

					const self = this,
						handler = self[__Internal__.symbolHandler];

					const createHandler = function(emitter, eventType) {
						let ignore = false;
						return doodad.Callback(self[_shared.ObjectSymbol], function nodeEventHandler(/*paramarray*/...args) {
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
								return handler.apply(this, tools.append([ctx], args));
							};
						}, null, null, _shared.SECRET);
					};

					const eventType = this[_shared.ExtenderSymbol].eventType;

					for (let j = 0; j < emitters.length; j++) {
						if (types.has(emitters, j)) {
							const emitter = emitters[j];
							root.DD_ASSERT && root.DD_ASSERT(types.isEmitter(emitter), "Invalid emitter.");
							const handler = createHandler(emitter, eventType);
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

				attachOnce: doodad.REPLACE(function attachOnce(emitters, /*optional*/context, /*optional*/prepend) {
					this.attach(emitters, context, true, prepend);
				}),

				detach: doodad.OVERRIDE(function detach(/*optional*/emitters) {
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
			};

			__Internal__.eventHandlerProto[__Internal__.symbolHandler] = doodad.PROTECTED(doodad.METHOD(null));

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
				, doodad.EventHandler.$extend(__Internal__.eventHandlerProto)));

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

					eventsPrefixed: types.READ_ONLY(false),
					eventsAttr: types.READ_ONLY('__NODE_EVENTS'),
					eventsImplementation: types.READ_ONLY('Doodad.MixIns.NodeEvents'),
					eventProto: types.READ_ONLY(doodad.NodeEventHandler),

					enableScopes: types.READ_ONLY(true),
					canReject: types.READ_ONLY(true),
					eventType: types.READ_ONLY(null),

					_new: types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						if (!types.isType(this)) {
							types.setAttributes(this, {
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
							tools.fill(['canReject', 'eventType'], options, this, newOptions);
						} else {
							options.canReject = !!newOptions.canReject || this.canReject;
							options.eventType = newOptions.eventType || this.eventType;
						};
						return options;
					}),

					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
						if (sourceIsProto) {
							const handlerSrc = sourceAttribute[__Internal__.symbolHandler];
							if (handlerSrc) {
								const extender = handlerSrc[_shared.ExtenderSymbol];
								if (extender.extend) {
									destAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
									handlerSrc[_shared.PrototypeSymbol] = sourceAttribute[_shared.PrototypeSymbol];
									destAttribute[__Internal__.symbolHandlerExtended] = extender.extend(attr, source, sourceProto, destAttributes, forType, handlerSrc, handlerSrc.setValue(undefined), true, proto, protoName);
								};
							} else {
								const handlerDest = destAttribute[__Internal__.symbolHandlerExtended];
								const extender = handlerDest[_shared.ExtenderSymbol];
								if (extender.extend) {
									destAttribute[__Internal__.symbolHandlerExtended] = extender.extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, handlerDest, true, proto, protoName);
								};
							};
						} else {
							const handlerSrc = sourceAttribute[__Internal__.symbolHandlerExtended];
							const extender = handlerSrc[_shared.ExtenderSymbol];
							if (extender.extend) {
								const handlerDest = destAttribute[__Internal__.symbolHandlerExtended];
								destAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, false, proto, protoName);
								const newHandlerSrc = (extender.getValue ? extender.getValue(attr, handlerSrc, forType) : handlerSrc);
								destAttribute[__Internal__.symbolHandlerExtended] = extender.extend(attr, source, sourceProto, destAttributes, forType, newHandlerSrc, handlerDest || newHandlerSrc.setValue(undefined), false, proto, protoName);
							};
						};
						return destAttribute;
					}),

					postExtend: types.SUPER(function postExtend(attr, destAttributes, destAttribute) {
						const handler = destAttribute[__Internal__.symbolHandlerExtended];
						if (handler) {
							const extender = handler[_shared.ExtenderSymbol];
							if (extender.postExtend) {
								destAttribute[__Internal__.symbolHandlerExtended] = extender.postExtend(attr, destAttributes, handler);
							};
						};

						return this._super(attr, destAttributes, destAttribute);
					}),

					init: types.SUPER(function init(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes) {
						this._super(attr, attributes, forType, attribute, value, generator, isProto, existingAttributes);

						const handler = attribute[__Internal__.symbolHandlerExtended];
						if (handler) {
							const extender = handler[_shared.ExtenderSymbol];
							if (extender.init) {
								const oldObjId = generator.objId;
								generator.objId = generator.vars.fromKey(attr);
								const oldKeyVars = generator.__kvars;
								generator.__kvars = tools.nullObject();
								extender.init(__Internal__.symbolHandler, attributes, forType, handler, types.unbox(handler), generator, isProto, null);
								generator.objId = oldObjId;
								generator.__kvars = oldKeyVars;
							};
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
				, function NODE_EVENT(eventType, /*optional*/fn) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isStringAndNotEmpty(eventType), "Invalid type.");
						const val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};

					const eventFn = doodad.PROTECTED(doodad.CALL_FIRST(doodad.NON_REENTRANT(doodad.ATTRIBUTE(function eventHandler(/*optional*/ctx, /*paramarray*/...args) {
						const dispatch = this[_shared.CurrentDispatchSymbol];

						const values = types.getAttributes(dispatch, [_shared.StackSymbol, _shared.SortedSymbol, _shared.ClonedStackSymbol], null, _shared.SECRET);

						const stack = values[_shared.StackSymbol];

						let clonedStack;
						if (values[_shared.SortedSymbol]) {
							clonedStack = values[_shared.ClonedStackSymbol];
						} else {
							if (stack.length) {
								stack.sort(function(value1, value2) {
									return tools.compareNumbers(value1[2], value2[2]);
								});
								clonedStack = types.clone(stack);
							} else {
								clonedStack = [];
							};
							const values = {};
							values[_shared.SortedSymbol] = true;
							values[_shared.ClonedStackSymbol] = clonedStack;
							types.setAttributes(dispatch, values, null, _shared.SECRET);
						};

						const stackLen = clonedStack.length;

						for (let i = 0; i < stackLen; i++) {
							const data = clonedStack[i],
								obj = data[0],
								evDatas = data[3],
								emitter = evDatas[0];

							if (!ctx || (emitter === ctx.emitter)) {
								const handler = evDatas[2];

								handler.apply(obj, args);
							};
						};

					}, extenders.NodeEvent, {enableScopes: true, eventType: eventType}))));

					eventFn[__Internal__.symbolHandler] = doodad.PROTECTED(doodad.OPTIONS({enableStorage: false}, doodad.METHOD(fn)));

					return (types.isNothing(fn) ? doodad.MUST_OVERRIDE(eventFn) : eventFn);
				}));

			//*********************************************
			// Emitter
			//*********************************************

			nodejsInterfaces.REGISTER(doodad.ISOLATED(doodad.MIX_IN(doodad.Class.$extend(
				mixIns.RawEvents,
				{
					$TYPE_NAME: 'IEmitter',
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('IEmitter')), true) */,

					onnewListener: doodad.RAW_EVENT(),
					onremoveListener: doodad.RAW_EVENT(),

					__currentlyEmitted: doodad.PRIVATE(null),

					prependListener: doodad.PUBLIC(function prependListener(event, listener) {
						// TODO: Allow multiple times the same listener (as the behavior of Node.Js)
						const name = _shared.EVENT_NAME_PREFIX + event;
						if (tools.indexOf(this.__RAW_EVENTS, name) >= 0) {
							this[name].attach(null, listener, 10);
							this.emit(__Internal__.newListener, event, listener);
						};
						return this;
					}),

					prependOnceListener: doodad.PUBLIC(function prependOnceListener(event, listener) {
						const name = _shared.EVENT_NAME_PREFIX + event;
						if (tools.indexOf(this.__RAW_EVENTS, name) >= 0) {
							this[name].attach(null, listener, 10, null, 1);
							this.emit(__Internal__.newListener, event, listener);
						};
						return this;
					}),

					addListener: doodad.PUBLIC(function addListener(event, listener) {
						const name = _shared.EVENT_NAME_PREFIX + event;
						if (tools.indexOf(this.__RAW_EVENTS, name) >= 0) {
							this[name].attach(null, listener);
							this.emit(__Internal__.newListener, event, listener);
						};
						return this;
					}),

					emit: doodad.PUBLIC(function emit(event, ...args) {
						// <PRB> Readable stream re-emits "onerror" with the same error !!! https://github.com/nodejs/node/blob/v7.6.0/lib/_stream_readable.js#L578-L579
						const name = _shared.EVENT_NAME_PREFIX + event;
						if (tools.indexOf(this.__RAW_EVENTS, name) >= 0) {
							const oldCurrentlyEmitted = this.__currentlyEmitted;
							const isOnError = (event === 'error');
							if (!isOnError || (oldCurrentlyEmitted !== event)) {
								this.__currentlyEmitted = event;
								try {
									return this[name](...args);
								} catch(ex) {
									throw ex;
								} finally {
									this.__currentlyEmitted = oldCurrentlyEmitted;
								}
							} else if (isOnError && (this.listenerCount(event) === 0)) {
								const ex = args[0];
								if (!ex.trapped) {
									tools.catchAndExit(ex);
								};
							};
						};
						return false;
					}),

					getMaxListeners: doodad.PUBLIC(function getMaxListeners() {
						let max = 10; // NodeJs default value
						if (this.__RAW_EVENTS.length) {
							max = this[this.__RAW_EVENTS[0]].stackSize;
						};
						return max;
					}),

					listenerCount: doodad.PUBLIC(function listenerCount(event) {
						const name = _shared.EVENT_NAME_PREFIX + event;
						if (tools.indexOf(this.__RAW_EVENTS, name) >= 0) {
							const stack = types.getAttribute(this[name], _shared.StackSymbol, null, _shared.SECRET);
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
						const name = _shared.EVENT_NAME_PREFIX + event;
						if (tools.indexOf(this.__RAW_EVENTS, name) >= 0) {
							const stack = types.getAttribute(this[name], _shared.StackSymbol, null, _shared.SECRET);
							return (stack ? tools.reduce(stack, function(result, data) {
								if (data[4] > 0) {
									result.push(data[1]);
								};
								return result;
							}, []) : []);
						};
						return [];
					}),

					off: doodad.PUBLIC(function off(event, listener) {
						return this.removeListener(event, listener);
					}),

					on: doodad.PUBLIC(function on(event, listener) {
						// TODO: Allow multiple times the same listener (as the behavior of Node.Js)
						const name = _shared.EVENT_NAME_PREFIX + event;
						if (tools.indexOf(this.__RAW_EVENTS, name) >= 0) {
							this[name].attach(null, listener);
							this.emit(__Internal__.newListener, event, listener);
						};
						return this;
					}),

					once: doodad.PUBLIC(function once(event, listener) {
						const name = _shared.EVENT_NAME_PREFIX + event;
						if (tools.indexOf(this.__RAW_EVENTS, name) >= 0) {
							this[name].attachOnce(null, listener);
							this.emit(__Internal__.newListener, event, listener);
						};
						return this;
					}),

					removeAllListeners: doodad.PUBLIC(function removeAllListeners(event) {
						const removeListeners = function _removeListeners(name) {
							const eventFn = this[name];
							const stack = types.getAttribute(eventFn, _shared.StackSymbol, null, _shared.SECRET);
							for (let j = 0; j < stack.length; j++) {
								const data = stack[j];
								if (data[4] > 0) {
									const listener = data[1];
									eventFn.detach(null, listener);
									if (name !== __Internal__.removeListenerPrefixed) {
										const event = name.slice(_shared.EVENT_NAME_PREFIX_LEN);
										this.emit(__Internal__.removeListener, event, listener);
									};
								};
							};
						};
						const events = (event ? [_shared.EVENT_NAME_PREFIX + event] : this.__RAW_EVENTS);
						for (let i = 0; i < events.length; i++) {
							const name = events[i];
							if (name !== __Internal__.removeListenerPrefixed) {
								removeListeners.call(this, name);
							};
						};
						if (!event || (event === __Internal__.removeListener)) {
							removeListeners.call(this, __Internal__.removeListenerPrefixed);
						};
						return this;
					}),

					removeListener: doodad.PUBLIC(function removeListener(event, listener) {
						const name = _shared.EVENT_NAME_PREFIX + event;
						if (tools.indexOf(this.__RAW_EVENTS, name) >= 0) {
							this[name].detach(null, listener);
							if (event !== __Internal__.removeListener) {
								this.emit(__Internal__.removeListener, event, listener);
							};
						};
						return this;
					}),

					setMaxListeners: doodad.PUBLIC(function setMaxListeners(number) {
						const events = this.__RAW_EVENTS;
						for (let i = 0; i < events.length; i++) {
							this[events[i]].stackSize = number;
						};
						return this;
					}),

					// New since Node.js v. 6.0.0
					eventNames: doodad.PUBLIC(function eventNames() {
						const names = [];
						const events = this.__RAW_EVENTS;
						for (let i = 0; i < events.length; i++) {
							const name = events[i];
							const stack = types.getAttribute(this[name], _shared.StackSymbol, null, _shared.SECRET);
							if (stack && tools.some(stack, function(data) {
								return (data[4] > 0);
							})) {
								names.push(name.slice(_shared.EVENT_NAME_PREFIX_LEN));
							};
						};
						return names;
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
						name1 = temp.combine('DoOdAd.' + uuid),
						name2 = temp.combine('dOoDaD.' + uuid);
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
							// Do nothing
						};
						try {
							files.rmdir(name2);
						} catch(ex) {
							// Do nothing
						};
					};
				};
			};
		},
	};

	return mods;
};

//! END_MODULE()
