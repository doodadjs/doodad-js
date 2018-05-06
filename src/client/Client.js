//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Client.js - Client functions
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
	modules['Doodad.Client'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Types',
			'Doodad.Tools',
			'Doodad.Tools.Config',
			'Doodad.Tools.Files',
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
				files = tools.Files,
				client = doodad.Client,
				extenders = doodad.Extenders,
				mixIns = doodad.MixIns;

			//=============================
			// Internals
			//=============================

			const __Internal__ = {
				//documentHasParentWindow: (!!global.document && (global.document.parentWindow === global)),

				loadedScripts: tools.nullObject(),   // <FUTURE> global to every thread

				symbolHandler: types.getSymbol('__HANDLER__'),
				symbolHandlerExtended: types.getSymbol('__HANDLER_EXTENDED__'),

				alert: null,
			};

			//=====================
			// Options
			//=====================

			const __options__ = tools.extend({
				defaultScriptTimeout: 1000 * 60 * 2,		// milliseconds
			}, _options);

			__options__.defaultScriptTimeout = types.toInteger(__options__.defaultScriptTimeout);

			types.freezeObject(__options__);

			client.ADD('getOptions', function getOptions() {
				return __options__;
			});

			//========================
			// Natives
			//========================

			tools.complete(_shared.Natives, {
				//windowObject: global.Object,
				windowDocument: global.document,

				// DOM
				windowWindow: global.Window,
				windowNode: global.Node,
				windowHtmlDocument: global.HTMLDocument,
				windowHtmlElement: global.HTMLElement,

				// Script loader
				windowURL: (types.isFunction(global.URL) ? global.URL : null),

				// Script loader, readFile
				windowBlob: (types.isFunction(global.Blob) ? global.Blob : null),

				// readFile
				windowFileReader: (types.isFunction(global.FileReader) ? global.FileReader : null),
				windowFetch: (types.isFunction(global.fetch) ? global.fetch : null),
				windowHeaders: (types.isFunction(global.Headers) ? global.Headers : null),
				windowXMLHttpRequest: global.XMLHttpRequest,

				// isEventTarget
				windowEventTarget: (types.isFunction(global.EventTarget) ? global.EventTarget : null),

				// isEvent
				windowEvent: (types.isFunction(global.Event) ? global.Event : global.Event.constructor),

				// callAsync
				mathMax: global.Math.max,
				windowSetTimeout: global.setTimeout.bind(global),
				windowClearTimeout: global.clearTimeout.bind(global),
				windowRequestAnimationFrame: (types.isFunction(global.requestAnimationFrame) && global.requestAnimationFrame.bind(global)) ||
                                            (types.isFunction(global.mozRequestAnimationFrame) && global.mozRequestAnimationFrame.bind(global)) ||
                                            (types.isFunction(global.webkitRequestAnimationFrame) && global.webkitRequestAnimationFrame.bind(global)) ||
                                            (types.isFunction(global.msRequestAnimationFrame) && global.msRequestAnimationFrame.bind(global)) ||
											null,
				windowCancelAnimationFrame: (types.isFunction(global.cancelAnimationFrame) && global.cancelAnimationFrame.bind(global)) ||
                                            (types.isFunction(global.mozCancelAnimationFrame) && global.mozCancelAnimationFrame.bind(global)) ||
											null,
				windowMutationObserver: (types.isFunction(global.MutationObserver) ? global.MutationObserver : null),

				windowLocation: global.location,

				// catchAndExit
				consoleError: (types.isFunction(global.console.error) ? global.console.error.bind(global.console) : global.console.log.bind(global.console)),

				// stringToBytes, bytesToString
				globalBufferFrom: (types.isFunction(global.Buffer) && types.isFunction(global.Buffer.from) ? global.Buffer.from.bind(global.Buffer) : null), // For Node.Js polyfills
				windowArrayBuffer: global.ArrayBuffer,
				windowUint16Array: global.Uint16Array,
				windowUint8Array: global.Uint8Array,
				stringCharCodeAtCall: global.String.prototype.charCodeAt.call.bind(global.String.prototype.charCodeAt),
				stringFromCharCodeApply: global.String.fromCharCode.apply.bind(global.String.fromCharCode),
				stringFromCharCode: global.String.fromCharCode.bind(global.String),
				mathMin: global.Math.min,

				// alert
				windowAlert: global.alert.bind(global) || global.console.log.bind(global.console),
			});


			//===================================
			// Events
			//===================================

			client.ADD('addListener', function addListener(element, name, handler, /*optional*/capture) {
				element.addEventListener(name, handler, !!capture);
			});

			client.ADD('removeListener', function removeListener(element, name, handler, /*optional*/capture) {
				element.removeEventListener(name, handler, !!capture);
			});

			//===================================
			// Promise events
			//===================================

			__Internal__.unhandledErrorEvent = new types.WeakMap();
			__Internal__.unhandledRejectionEvent = new types.WeakMap();
			__Internal__.handledRejectionEvent = new types.WeakMap();

			types.ADD('addAppEventListener', function addAppEventListener(event, listener) {
				if (event === 'unhandlederror') {
					if (!__Internal__.unhandledErrorEvent.has(listener)) {
						const handler = function(msg, url, lineNo, columnNo, error) {
							if (!error) {
								if (!types.isString(msg)) {
									// IE
									error = msg;
								} else {
									// <PRB> Not every browsers supports the "error" argument
									error = new types.Error(msg);
									error.stack = "";
									error.fileName = url;
									error.sourceURL = url;
									error.lineNumber = lineNo;
									error.line = lineNo;
									error.columnNumber = columnNo;
									error.functionName = "";
									error.parsed = true;
								};
							};
							listener(new types.CustomEvent('unhandlederror', {
								detail: {
									error: (types.isError(error) ? error : error.error),
								}
							}));
						};
						client.addListener(global, 'error', handler);
						__Internal__.unhandledErrorEvent.set(listener, handler);
					};
				} else if (event === 'unhandledrejection') {
					// FUTURE: Use new standardized method (with the GC).
					if (!__Internal__.unhandledRejectionEvent.has(listener)) {
						const handler = function(ev) {
							listener(new types.CustomEvent('unhandledrejection', {
								detail: {
									reason: ev.reason || ev.detail.reason,
									promise: ev.promise || ev.detail.promise,
								}
							}));
						};
						client.addListener(global, event, handler);
						__Internal__.unhandledRejectionEvent.set(listener, handler);
					};
				} else if (event === 'rejectionhandled') {
					// FUTURE: Use new standardized method (with the GC).
					if (!__Internal__.handledRejectionEvent.has(listener)) {
						const handler = function(ev) {
							listener(new types.CustomEvent('rejectionhandled', {
								detail: {
									promise: ev.promise || ev.detail.promise,
								}
							}));
						};
						client.addListener(global, event, handler);
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
						client.removeListener(global, 'error', handler);
						__Internal__.unhandledErrorEvent.delete(listener);
					};
				} else if (event === 'unhandledrejection') {
					if (__Internal__.unhandledRejectionEvent.has(listener)) {
						const handler = __Internal__.unhandledRejectionEvent.get(listener);
						client.removeListener(global, event, handler);
						__Internal__.unhandledRejectionEvent.delete(listener);
					};
				} else if (event === 'rejectionhandled') {
					if (__Internal__.handledRejectionEvent.has(listener)) {
						const handler = __Internal__.handledRejectionEvent.get(listener);
						client.removeListener(global, event, handler);
						__Internal__.handledRejectionEvent.delete(listener);
					};
				} else {
					throw new types.Error("Unknow application event '~0~'.", [event]);
				};
			});

			//===================================
			// Asynchronous functions
			//===================================

			if (_shared.Natives.windowMutationObserver) {
				__Internal__.nextTickQueue = [];
				__Internal__.nextTickDone = true;
				__Internal__.nextTickValue = false;
				__Internal__.nextTickDiv = _shared.Natives.windowDocument.createElement("div");
				__Internal__.nextTickObserver = new _shared.Natives.windowMutationObserver(function () {
					try {
						const queueLen = __Internal__.nextTickQueue.length;
						for (let i = 0; i < queueLen; i++) {
							const frame = __Internal__.nextTickQueue[i];
							if (!frame.cancelled) {
								frame.callback();
							};
						};
					} catch(ex) {
						tools.catchAndExit(ex);
					} finally {
						__Internal__.nextTickDone = true;
						__Internal__.nextTickQueue.length = 0;
					};
				});
				__Internal__.nextTickObserver.observe(__Internal__.nextTickDiv, {attributes: true});
			};

			tools.ADD('callAsync', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 6,
						params: {
							fn: {
								type: 'function',
								optional: false,
								description: "Callback function",
							},
							delay: {
								type: 'integer',
								optional: true,
								description: "Time to wait in milliseconds. Values less than or equal to 0 are reserved. Default is the minimal possible value.",
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
					fn = doodad.Callback(thisObj, fn, null, args || [], secret);
					if (_shared.Natives.windowMutationObserver && (delay < 0)) {
						// Next tick
						let frame = {callback: fn, cancelled: false};
						__Internal__.nextTickQueue.push(frame);
						if (__Internal__.nextTickDone) {
							__Internal__.nextTickDone = false;
							__Internal__.nextTickValue = !__Internal__.nextTickValue;
							__Internal__.nextTickDiv.setAttribute("value", __Internal__.nextTickValue);
						};
						return (cancelable ? {
							cancel: function cancel() {
								frame.cancelled = true;
								frame = null;
							},
						} : undefined);
					} else if (_shared.Natives.windowRequestAnimationFrame && (delay <= 0)) {
						// Raised just before page re-paint
						let id = _shared.Natives.windowRequestAnimationFrame(fn);
						return (cancelable ? {
							cancel: function cancel() {
								_shared.Natives.windowCancelAnimationFrame(id);
								id = null;
							},
						} : undefined);
					} else {
						// Raised after X ms
						delay = _shared.Natives.mathMax(delay, 0);
						let id = _shared.Natives.windowSetTimeout(fn, delay);
						return (cancelable ? {
							cancel: function cancel() {
								_shared.Natives.windowClearTimeout(id);
								id = null;
							},
						} : undefined);
					}
				}));

			//=====================================
			// Shutdown & Exit
			//=====================================

			__Internal__.catchAndExitCalled = false;

			tools.ADD('catchAndExit', function catchAndExit(err) {
				if (!err || err.trapped || (!err.critical && err.bubble)) {
					// Ignore trapped errors or errors like "ScriptInterruptedError".
					return;
				};

				//_shared.Natives.windowAlert(err.message + '\r\n' + err.lineNumber + ':' + err.columnNumber);
				err.trapped = true;

				// NOTE: This is the last resort error handling.
				// NOTE: types.ScriptAbortedError should bubbles here

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
					ev = new types.CustomEvent('exit', {cancelable: false, detail: {error: err, exitCode: exitCode}});
					tools.dispatchEvent(ev); // sync
				} catch(o) {
					ev = null;
					if (root.getOptions().debug) {
						types.DEBUGGER();
					};
				};

				if (!ev || !ev.canceled) {
					if (__Internal__.catchAndExitCalled) {
						// Process didn't exit before another error happened !!! Something is wrong.
						if (root.getOptions().debug) {
							types.DEBUGGER();
						};

						try {
							_shared.Natives.windowDocument.open('text/plain', 'replace');
							_shared.Natives.windowDocument.write("");
							_shared.Natives.windowDocument.close();
						} catch(o) {
							// Do nothing
						};

					} else {
						if (!isAborted) {
							try {
								_shared.Natives.consoleError("<FATAL ERROR> " + err.message + '\n' + err.stack);
							} catch(o) {
								// Do nothing
							};
						};

						try {
							global.console.log("Page exited with code : " + types.toString(exitCode));
						} catch(o) {
							// Do nothing
						};

						if (root.getOptions().debug) {
							types.DEBUGGER();

							__Internal__.catchAndExitCalled = true;

						} else {
							//if (!__Internal__.setCurrentLocationPending) {
							try {
								let reload = false;
								let url = files.Url.parse(_shared.Natives.windowLocation.href);

								// TODO: Better user message, with translation
								_shared.Natives.windowDocument.open('text/plain', 'replace');
								if (exitCode !== 0) {
									if (types.toBoolean(url.args.get('crashReport', true))) {
										_shared.Natives.windowDocument.write("An unexpected error has occured again. We are very sorry. Please contact support. Thank you.");
									} else {
										reload = true;
										_shared.Natives.windowDocument.write("We are sorry. An unexpected error has occured. Page will now reload...");
									};
								};
								_shared.Natives.windowDocument.close();

								if (reload) {
									url = url.setArgs({crashReport: true});
									tools.setCurrentLocation(url, true);
								};

								__Internal__.catchAndExitCalled = true;

							} catch(o) {
								//if (root.getOptions().debug) {
								//	types.DEBUGGER();
								//};
							};
							//};

							if (!__Internal__.catchAndExitCalled) {
								// TODO: Better handle that case

								__Internal__.catchAndExitCalled = true;

								//if (root.getOptions().debug) {
								//	types.DEBUGGER();
								//};

								try {
									// Try to blank the page.
									_shared.Natives.windowDocument.open('text/plain', 'replace');
									_shared.Natives.windowDocument.write("");
									_shared.Natives.windowDocument.close();
								} catch(o) {
									// Do nothing
								};
							};
						};
					};
				};

				throw err;
			});

			//===================================
			// Client functions
			//===================================

			client.ADD('isEvent', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is a DOM 'event' object. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isEvent(obj) {
					return types._instanceof(obj, _shared.Natives.windowEvent);
				}));

			client.ADD('isWindow', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is a DOM 'window' object. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isWindow(obj) {
					return types._instanceof(obj, _shared.Natives.windowWindow);
				}));

			client.ADD('isDocument', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is a DOM 'document' object. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isDocument(obj) {
					return types._instanceof(obj, _shared.Natives.windowHtmlDocument);
				}));

			client.ADD('isNode', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is a DOM 'node' object. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isNode(obj) {
					return types._instanceof(obj, _shared.Natives.windowNode);
				}));

			client.ADD('isElement', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is a DOM 'element' object. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isElement(obj) {
					return types._instanceof(obj, _shared.Natives.windowHtmlElement);
				}));


			client.ADD('isEventTarget', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' when the object is an event target. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, (_shared.Natives.windowEventTarget ? (function isElement(obj) {
					return types._instanceof(obj, _shared.Natives.windowEventTarget);
				}) : (function isElement(obj) {
					return client.isDocument(obj) || client.isElement(obj);
				}))));

			client.ADD('getFirstElement', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							parent: {
								type: 'any',
								optional: false,
								description: "A node.",
							},
						},
						returns: 'HtmlElement',
						description: "Returns the first child element of a node. Returns 'null' if no element.",
					}
				//! END_REPLACE()
				, function(parent) {
					root.DD_ASSERT && root.DD_ASSERT(client.isNode(parent), "Invalid node.");

					// NOTE: Sorry for using the same variable
					parent = parent.firstChild;
					while (parent && (parent.nodeType !== 1)) {
						parent = parent.nextSibling;
					}
					return parent;
				}));


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
						description: "Class mix-in to implement for JS events.",
					}
				//! END_REPLACE()
				, doodad.MIX_IN(mixIns.Events.$extend({
					$TYPE_NAME: "JsEvents",
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('JsEvents')), true) */,

					__JS_EVENTS: doodad.PROTECTED(doodad.READ_ONLY(/*doodad.NOT_INHERITED(*/doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray, {cloneOnInit: true}))))))),

					detachJsEvents: doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function detachJsEvents(/*optional*/elements, /*optional*/useCapture) {
						const events = this.__JS_EVENTS,
							eventsLen = events.length;
						for (let i = 0; i < eventsLen; i++) {
							this[events[i]].detach(elements, useCapture);
						};
					})))),

					clearJsEvents: doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function clearJsEvents() {
						const events = this.__JS_EVENTS,
							eventsLen = events.length;
						for (let i = 0; i < eventsLen; i++) {
							this[events[i]].clear();
						};
					})))),
				}))));

			__Internal__.eventHandlerProto = {
				$TYPE_NAME: 'JsEventHandler',
				$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('JsEventHandler')), true) */,

				attach: doodad.OVERRIDE(function attach(elements, /*optional*/context, /*optional*/useCapture, /*optional*/once) {
					if (!types.isArrayLike(elements)) {
						elements = [elements];
					};

					useCapture = !!useCapture;

					const self = this;
					const handler = self[__Internal__.symbolHandler];
					const extender = self[_shared.ExtenderSymbol];

					const createHandler = function(element, eventType) {
						/* eslint consistent-return: "off" */
						let ignore = false;
						return doodad.Callback(self[_shared.ObjectSymbol], function jsEventHandler(ev) {
							if (!ignore) {
								if (once) {
									ignore = true;
									self.detach(element);
								};
								if (!ev.getUnified) {
									ev.getUnified = extender.getUnified;
									//delete ev.__unified;
									ev.__unified = null;
								};
								const ctx = {
									element: element,
									event: ev,
									type: eventType,
									data: context,
								};
								return handler.call(this, ctx);
							};
						}, null, null, _shared.SECRET);
					};

					const eventType = this[_shared.ExtenderSymbol].eventType;

					const elementsLen = elements.length;
					for (let j = 0; j < elementsLen; j++) {
						if (types.has(elements, j)) {
							const element = elements[j],
								handler = createHandler(element, eventType);
							if (this._super(this[_shared.ObjectSymbol], this, null, [element, eventType, handler])) {
								client.addListener(element, eventType, handler, useCapture);
							};
						};
					};
				}),

				attachOnce: doodad.REPLACE(function attachOnce(elements, /*optional*/context, /*optional*/useCapture) {
					this.attach(elements, context, useCapture, true);
				}),

				detach: doodad.OVERRIDE(function detach(/*optional*/elements) {
					if (types.isNothing(elements)) {
						const evs = this._super(this[_shared.ObjectSymbol], this);
						const evsLen = evs.length;
						for (let j = 0; j < evsLen; j++) {
							const evData = evs[j][3],
								element = evData[0],
								type = evData[1],
								handler = evData[2];
							client.removeListener(element, type, handler);
						};
					} else {
						if (!types.isArrayLike(elements)) {
							elements = [elements];
						};

						root.DD_ASSERT && root.DD_ASSERT(tools.every(elements, function(element) {
							return client.isEventTarget(element);
						}), "Invalid elements.");

						const elementsLen = elements.length;
						for (let i = 0; i < elementsLen; i++) {
							const evs = this._super(this[_shared.ObjectSymbol], this, [elements[i]]);
							const evsLen = evs.length;
							for (let j = 0; j < evsLen; j++) {
								const evData = evs[j][3],
									element = evData[0],
									type = evData[1],
									handler = evData[2];
								client.removeListener(element, type, handler);
							};
						};
					};
				}),

				clear: doodad.REPLACE(function clear() {
					this.detach();
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
						description: "JS event handler prototype.",
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
						description: "JS event extender.",
					}
				//! END_REPLACE()
				, extenders.RawEvent.$inherit({
					$TYPE_NAME: "JsEvent",
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('JsEventExtender')), true) */,

					eventsPrefixed: types.READ_ONLY(false),
					eventsAttr: types.READ_ONLY('__JS_EVENTS'),
					errorEventAttr: types.READ_ONLY(null),
					eventsImplementation: types.READ_ONLY('Doodad.MixIns.JsEvents'),

					enableScopes: types.READ_ONLY(true),
					eventType: types.READ_ONLY(null),

					getUnified: types.READ_ONLY(function getUnified() {
						if (!this.__unified) {
							const self = this;
							this.__unified = {
								// TODO: Unify event properties between browsers
								which: (types.isNothing(self.which) ? self.keyCode : ((self.which !== 0) && (self.charCode !== 0) ? self.which : null)),  // source: http://javascript.info/tutorial/keyboard-events
								//preventDefault: (types.isNothing(self.preventDefault) ? function() {ev.returnValue = false; ev.keyCode = 0;} : self.preventDefault),
							};
						};
						return this.__unified;
					}),

					eventProto: types.READ_ONLY(doodad.JsEventHandler),

					_new: types.READ_ONLY(types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						if (!types.isType(this)) {
							types.setAttributes(this, {
								eventType: types.get(options, 'eventType', this.eventType),
							});
						};
					})),

					getCacheName: types.READ_ONLY(types.SUPER(function getCacheName(/*optional*/options) {
						if (types.isNothing(options)) {
							options = {};
						};
						return this._super(options) +
						',' + types.get(options, 'eventType', this.eventType);
					})),

					overrideOptions: types.READ_ONLY(types.SUPER(function overrideOptions(options, newOptions) {
						this._super(options, newOptions);
						options.eventType = newOptions.eventType || this.eventType;
						return options;
					})),

					extend: types.SUPER(function extend(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName) {
						if (sourceIsProto) {
							const handlerSrc = sourceAttribute[__Internal__.symbolHandler];
							const handlerDest = destAttribute[__Internal__.symbolHandlerExtended];
							if (handlerSrc) {
								const extender = handlerSrc[_shared.ExtenderSymbol];
								if (extender.extend) {
									destAttribute = this._super(attr, source, sourceProto, destAttributes, forType, sourceAttribute, destAttribute, sourceIsProto, proto, protoName);
									handlerSrc[_shared.PrototypeSymbol] = sourceAttribute[_shared.PrototypeSymbol];
									destAttribute[__Internal__.symbolHandlerExtended] = extender.extend(attr, source, sourceProto, destAttributes, forType, handlerSrc, handlerSrc.setValue(undefined), true, proto, protoName);
								};
							} else {
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


			doodad.ADD('JS_EVENT', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
						eventType: {
							type: 'string',
							optional: true,
							description: "Event name.",
						},
						fn: {
							type: 'function',
							optional: true,
							description: "Event handler.",
						},
						returns: 'AttributeBox,Extender',
						description: "JS event attribute modifier.",
					}
				//! END_REPLACE()
				, function JS_EVENT(eventType, /*optional*/fn) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isStringAndNotEmpty(eventType), "Invalid event type.");
						const val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					const eventFn = doodad.PROTECTED(doodad.CALL_FIRST(doodad.NON_REENTRANT(doodad.ATTRIBUTE(function eventHandler(/*optional*/ctx) {
						const dispatch = this[_shared.CurrentDispatchSymbol];

						const values = types.getAttributes(dispatch, [_shared.StackSymbol, _shared.SortedSymbol, _shared.ClonedStackSymbol]);

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
							types.setAttributes(dispatch, values);
						};

						const stackLen = clonedStack.length;

						for (let i = 0; i < stackLen; i++) {
							const data = clonedStack[i],
								obj = data[0],
								evDatas = data[3],
								element = evDatas[0];

							if (!ctx || (element === ctx.element)) {
								const handler = evDatas[2];

								handler.call(obj, ctx);
							};
						};
					}, extenders.JsEvent, {enableScopes: true, eventType: eventType}))));

					eventFn[__Internal__.symbolHandler] = doodad.PROTECTED(doodad.OPTIONS({enableStorage: false}, doodad.METHOD(fn)));

					return (types.isNothing(fn) ? doodad.MUST_OVERRIDE(eventFn) : eventFn);
				}));

			//===================================
			// Location functions
			//===================================

			types.REGISTER(root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							message: {
								type: 'string',
								optional: true,
								description: "A message explaining that location has changed.",
							},
							params: {
								type: 'arrayof(any),objectof(any)',
								optional: true,
								description: "Parameters of the error message",
							},
						},
						returns: 'error',
						description: "Signals that the current location has been moved to another one.",
					}
				//! END_REPLACE()
				, types.ScriptAbortedError.$inherit(
					{
						$TYPE_NAME: "PageMovedError",
						$TYPE_UUID: /*! REPLACE_BY(TO_SOURCE(UUID('PageMovedError')), true) */ null /*! END_REPLACE() */,

						[types.ConstructorSymbol](message, /*optional*/params) {
							return [message || "Page moved.", params];
						},
					})));

			tools.ADD('getCurrentLocation', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							_window: {
								type: 'Window',
								optional: true,
								description: "Reference to the window object. Default is global 'window' object.",
							},
						},
						returns: 'Url',
						description: "Returns current location.",
					}
				//! END_REPLACE()
				, function getCurrentLocation(/*optional*/_window) {
					let _location = _shared.Natives.windowLocation;
					if (_window) {
						_location = _window.location;
					};
					return files.Url.parse(_location.href);
				}));


			//__Internal__.setCurrentLocationPending = false;

			tools.ADD('setCurrentLocation', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							url: {
								type: 'string,Url',
								optional: false,
								description: "Url to new location",
							},
							dontAbort: {
								type: 'bool',
								optional: true,
								description: "'true' will not throws the PageMovedError signal. 'false' will throws the signal. Default is 'false'.",
							},
							noReload: {
								type: 'bool',
								optional: true,
								description: "'true' will not reload the page when moving to the same location. 'false' will reload the page. Default is 'false'.",
							},
							_window: {
								type: 'Window',
								optional: true,
								description: "Reference to the window object. Default is global 'window' object.",
							},
						},
						returns: 'undefined',
						description: "Set current location.",
					}
				//! END_REPLACE()
				, function setCurrentLocation(url, /*optional*/dontAbort, /*optional*/noReload, /*optional*/_window) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isStringAndNotEmpty(url) || types._instanceof(url, files.Url), "Invalid url.");
						root.DD_ASSERT(types.isNothing(_window) || client.isWindow(_window), "Invalid window object.");
					};

					//if (!__Internal__.setCurrentLocationPending) {
					if (!types._instanceof(url, files.Url)) {
						url = files.Url.parse(url);
					};

					let _location = _shared.Natives.windowLocation;
					if (_window) {
						_location = _window.location;
					} else {
						_window = global;
					};

					const result = url.compare(_location.href);
					if (!noReload && (result === 0)) {
						_location.reload();

						//__Internal__.setCurrentLocationPending = true;

					} else {
						//if ('onpageshow' in _window) {
						//	client.addListener(_window, 'pageshow', function(ev) {
						//		if (ev.persisted) {
						//			_location.reload();
						//		};
						//	});
						//} else if ('onunload' in _window) {
						//	// NOTE: Only the presence of the handler forces the page to reload.
						//	client.addListener(_window, 'unload', function(ev) {
						//	});
						//} else {
						//	_shared.Natives.windowDocument.open('text/plain', false);
						//	_shared.Natives.windowDocument.close();
						//};

						_location.href = url.toString();

						//__Internal__.setCurrentLocationPending = (result !== 0);
					};
					//};

					if (!dontAbort) {
						throw new types.PageMovedError();
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
					tag: null,
					element: null,
					target: null,
					timeout: 0,
					loadEv: null,
					async: false,
					launched: false,
					ready: false,
					failed: false,
					lastError: null,
					timedout: false,
					timeoutId: null,

					oninit: null,
					onloading: null,
					onload: null,
					onerror: null,

					_new: types.READ_ONLY(types.SUPER(function _new(tag, target, /*optional*/timeout) {
						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isStringAndNotEmpty(tag), "Invalid tag.");
							root.DD_ASSERT(client.isElement(target), "Invalid target.");
						};
						this._super();
						this.tag = tag;
						this.target = target;
						if (types.isNothing(timeout)) {
							this.timeout = __options__.defaultScriptTimeout;
						} else {
							this.timeout = timeout;
						};
					})),

					__handleSuccess: function __handleSuccess(ev) {
						if ((this.loadEv !== 'readystatechange') || (this.element.readyState === 'loaded') || (this.element.readyState === 'complete')) {
							if (this.timeoutId) {
								this.timeoutId.cancel();
								this.timeoutId = null;
							};
							if (!this.ready) {
								this.ready = true;
								this.dispatchEvent(new types.CustomEvent('load'));
								tools.dispatchEvent(new types.CustomEvent('scriptload', {
									detail: {
										loader: this,
									},
								}));
							};
						};
					},
					__handleError: function __handleError(ex) {
						if (this.timeoutId) {
							this.timeoutId.cancel();
							this.timeoutId = null;
						};
						if (!this.ready) {
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
							if (this.element && this.element.parentNode) {
								this.element.parentNode.removeChild(this.element);
								this.element = null;
							};
						};
					},
					start: function start() {
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

							this.element = this.target.ownerDocument.createElement(this.tag);
							if ('onreadystatechange' in this.element) {
								// For previous versions of IE
								this.loadEv = 'readystatechange';
							} else {
								this.loadEv = 'load';
							};

							const self = this;

							// NOTE: Safari: "onload" doesn't raise for the 'link' tag
							client.addListener(this.element, this.loadEv, function scriptOnSuccess(ev) {
								return self.__handleSuccess(ev);
							});

							// NOTE: IE and Safari: "onerror" doesn't raise, so we can't know if there was an error
							client.addListener(this.element, 'error', function scriptOnError(ev) {
								return self.__handleError(ev.error);
							});

							this.dispatchEvent(new types.CustomEvent('init'));
							tools.dispatchEvent(new types.CustomEvent('scriptinit', {
								detail: {
									loader: this,
								},
							}));

							//if (this.async) {
							//	// Workaround for asynchronous script loading
							//	const appendElement = function appendElement() {
							//		self.target.appendChild(self.element);
							//	};
							//	_shared.Natives.windowSetTimeout(appendElement, 1);
							//} else {
							this.target.appendChild(this.element);
							//};

							this.dispatchEvent(new types.CustomEvent('loading'));
							tools.dispatchEvent(new types.CustomEvent('scriptloading', {
								detail: {
									loader: this,
								},
							}));

							// <PRB> Safari: "onload" doesn't raise with the 'link' tag
							if (this.tag === 'link') {
								let url = (this.element.src || this.element.href);
								if (url) {
									url = files.Url.parse(url);
								};
								if (url) {
									const waitDownload = this.target.ownerDocument.createElement('img');
									client.addListener(waitDownload, 'error', function handleWaitDownload(ev) {
										if (waitDownload.parentNode) {
											waitDownload.parentNode.removeChild(waitDownload);
										};
										self.loadEv = 'load';
										self.__handleSuccess(ev);
									});

									waitDownload.style.display = 'none';

									this.target.ownerDocument.body.appendChild(waitDownload);

									// NOTE: The "img" tag starts download as soon as "src" is set
									waitDownload.src = url.toString({
										anchor: 'sami', // "#sami" is a documented IE trick to load source as text instead of its mime type, preventing a download prompt to the user
									});
								};
							};

							if (!types.isNothing(this.timeout)) {
								this.timeoutId = tools.callAsync(function handleTimeout(ev) {
									self.timeoutId = null;
									if (!self.ready) {
										self.timedout = true;
										self.__handleError(new types.TimeoutError());
									};
								}, this.timeout, null, null, true);
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
								type: 'string,Url',
								optional: false,
								description: "Target file Url",
							},
							async: {
								type: 'bool',
								optional: true,
								description: "'true' will load file in asynchronous mode. 'false' will load file synchronously. Default is 'false'.",
							},
							timeout: {
								type: 'integer',
								optional: true,
								description: "Timeout delay in milliseconds.",
							},
							reload: {
								type: 'bool',
								optional: true,
								description: "'true' will reload file when already loaded. 'false' will not reload file. Default is 'false'.",
							},
							_document: {
								type: 'HtmlDocument',
								optional: true,
								description: "Reference to the window document object. Default is global 'document' object.",
							},
						},
						returns: 'ScriptLoader',
						description: "Load specified JS script file.",
					}
				//! END_REPLACE()
				, function getJsScriptFileLoader(url, /*optional*/async, /*optional*/timeout, /*optional*/reload, /*optional*/_document) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(_document) || client.isDocument(_document), "Invalid document.");
					};

					let loader = null;

					if (types._instanceof(url, files.Path)) {
						url = files.Url.parse(url);
					};

					if (types._instanceof(url, files.Url)) {
						url = url.toString();
					};

					root.DD_ASSERT && root.DD_ASSERT(types.isString(url), "Invalid url.");

					if (url in __Internal__.loadedScripts) {
						loader = __Internal__.loadedScripts[url];
					};
					if (reload && loader) {
						if (loader.element && loader.element.parentNode) {
							loader.element.parentNode.removeChild(loader.element);
							loader.element = null;
						};
						loader = null;
					};
					if (!loader) {
						if (!_document) {
							_document = _shared.Natives.windowDocument;
						};

						loader = new __Internal__.ScriptLoader(/*tag*/'script', /*target*/_document.body, /*timeout*/timeout);

						loader.addEventListener('init', function() {
							loader.async = !!async;
							this.element.type = 'text/javascript';
							this.element.async = loader.async;
							this.element.src = url;
						});

						__Internal__.loadedScripts[url] = loader;
					};

					return loader;
				}));

			tools.ADD('getJsScriptBlockLoader', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							script: {
								type: 'string',
								optional: false,
								description: "Target JS script",
							},
							async: {
								type: 'bool',
								optional: true,
								description: "'true' will load script in asynchronous mode. 'false' will load script synchronously. Default is 'false'.",
							},
							timeout: {
								type: 'integer',
								optional: true,
								description: "Timeout delay in milliseconds.",
							},
							_document: {
								type: 'HtmlDocument',
								optional: true,
								description: "Reference to the window document object. Default is global 'document' object.",
							},
						},
						returns: 'ScriptLoader',
						description: "Load specified JS script block.",
					}
				//! END_REPLACE()
				, function getJsScriptBlockLoader(script, /*optional*/async, /*optional*/timeout, /*optional*/_document) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isStringAndNotEmpty(script), "Invalid script.");
						root.DD_ASSERT(types.isNothing(_document) || client.isDocument(_document), "Invalid document.");
					};

					if (!_document) {
						_document = _shared.Natives.windowDocument;
					};

					const loader = new __Internal__.ScriptLoader(/*tag*/'script', /*target*/_document.body, /*timeout*/timeout);

					loader.addEventListener('init', function() {
						loader.async = !!async;
						this.element.type = 'text/javascript';
						this.element.async = loader.async;
						if (async && _shared.Natives.windowBlob && _shared.Natives.windowURL) {
							// Firefox
							this.element.src = _shared.Natives.windowURL.createObjectURL(new _shared.Natives.windowBlob(script));
						} else {
							if (_document.createCDATASection) {
								this.element.appendChild(_document.createCDATASection(script));
							} else {
								this.element.innerHTML = script;
							};
						};
					});

					return loader;
				}));

			tools.ADD('getCssScriptFileLoader', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							url: {
								type: 'string,Url',
								optional: false,
								description: "Target file Url",
							},
							async: {
								type: 'bool',
								optional: true,
								description: "'true' will load file in asynchronous mode. 'false' will load file synchronously. Default is 'false'.",
							},
							media: {
								type: 'string',
								optional: true,
								description: "Target media(s). Default is none.",
							},
							timeout: {
								type: 'integer',
								optional: true,
								description: "Timeout delay in milliseconds.",
							},
							reload: {
								type: 'bool',
								optional: true,
								description: "'true' will reload file when already loaded. 'false' will not reload file. Default is 'false'.",
							},
							_document: {
								type: 'HtmlDocument',
								optional: true,
								description: "Reference to the window document object. Default is global 'document' object.",
							},
						},
						returns: 'ScriptLoader',
						description: "Load specified CSS script file.",
					}
				//! END_REPLACE()
				, function getCssScriptFileLoader(url, /*optional*/async, /*optional*/media, /*optional*/timeout, /*optional*/reload, /*optional*/_document) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(_document) || client.isDocument(_document), "Invalid document.");
					};

					if (types._instanceof(url, files.Path)) {
						url = files.Url.parse(url);
					};

					if (types._instanceof(url, files.Url)) {
						url = url.toString();
					};

					root.DD_ASSERT && root.DD_ASSERT(types.isString(url), "Invalid url.");

					let loader = null;
					if (url in __Internal__.loadedScripts) {
						loader = __Internal__.loadedScripts[url];
					};
					if (reload) {
						if (loader.element && loader.element.parentNode) {
							loader.element.parentNode.removeChild(loader.element);
							loader.element = null;
						};
						loader = null;
					};
					if (!loader) {
						if (!_document) {
							_document = _shared.Natives.windowDocument;
						};

						loader = new __Internal__.ScriptLoader(/*tag*/'link', /*target*/_document.getElementsByTagName('head')[0], /*timeout*/timeout);

						loader.addEventListener('init', function() {
							loader.async = !!async;
							this.element.rel = 'stylesheet';
							this.element.type = 'text/css';
							if (media) {
								this.element.media = media;
							};
							this.element.href = url;
						});

						__Internal__.loadedScripts[url] = loader;
					};

					return loader;
				}));

			tools.ADD('getCssScriptBlockLoader', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							script: {
								type: 'string',
								optional: false,
								description: "Target CSS script",
							},
							async: {
								type: 'bool',
								optional: true,
								description: "'true' will load file in asynchronous mode. 'false' will load file synchronously. Default is 'false'.",
							},
							media: {
								type: 'string',
								optional: true,
								description: "Target media(s). Default is none.",
							},
							timeout: {
								type: 'integer',
								optional: true,
								description: "Timeout delay in milliseconds.",
							},
							_document: {
								type: 'HtmlDocument',
								optional: true,
								description: "Reference to the window document object. Default is global 'document' object.",
							},
						},
						returns: 'ScriptLoader',
						description: "Load specified CSS script block.",
					}
				//! END_REPLACE()
				, function getCssScriptBlockLoader(script, /*optional*/async, /*optional*/media, /*optional*/timeout, /*optional*/_document) {
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isStringAndNotEmpty(script), "Invalid script.");
						root.DD_ASSERT(types.isNothing(_document) || client.isDocument(_document), "Invalid document.");
					};

					if (!_document) {
						_document = _shared.Natives.windowDocument;
					};

					let loader;

					if (async && _shared.Natives.windowBlob && global.URL) {
						// Firefox
						loader = new __Internal__.ScriptLoader(/*tag*/'link', /*target*/_document.getElementsByTagName('head')[0], /*timeout*/timeout);

						loader.addEventListener('init', function() {
							loader.async = !!async;
							this.element.rel = 'stylesheet';
							this.element.type = 'text/css';
							if (media) {
								this.element.media = media;
							};
							this.element.href = URL.createObjectURL(new Blob(script));
						});
					} else {
						loader = new __Internal__.ScriptLoader(/*tag*/'style', /*target*/_document.getElementsByTagName('head')[0], /*timeout*/timeout);

						loader.addEventListener('init', function() {
							loader.async = !!async;
							if (media) {
								this.element.media = media;
							};
							if (_document.createCDATASection) {
								this.element.appendChild(_document.createCDATASection(script));
							} else {
								this.element.innerHTML = script;
							};
						});
					};

					return loader;
				}));

			//===================================
			// File functions
			//===================================

			files.ADD('existsAsync', function existsAsync(url, /*optional*/options) {
				const Promise = types.getPromise();

				return Promise.try(function tryExists() {
					url = files.parseUrl(url);

					const type = types.get(options, 'type', null);

					return files.readFileAsync(url, tools.extend({}, options, {method: 'HEAD'}))
						.nodeify(function(err, dummy) {
							if (err) {
								if (types._instanceof(err, types.HttpError) && (err.code === types.HttpStatus.NotFound)) {
									return false;
								} else {
									throw err;
								}
							} else {
								return (type === 'file' ? !!url.file : (type === 'folder' ? !url.file : true));
							}
						});
				});
			});

			files.ADD('exists', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							url: {
								type: 'string,Url',
								optional: false,
								description: "Target folder url.",
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
				, function exists(url, /*optional*/options) {
					const async = types.get(options, 'async', false);

					if (async) {
						return files.existsAsync(url, options);
					} else {
						throw new types.NotSupported("Synchronous version of 'exists' is not implemented.");
					}
				}));


			files.ADD('readFileSync', function readFileSync(path, /*optional*/options) {
				throw new types.NotSupported("'readFile' is not supported synchronously because the W3C has decided to disable it from 'fetch' and 'XHR'.");
			});

			files.ADD('readFileAsync', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 8,
						params: {
							url: {
								type: 'string,Url',
								optional: false,
								description: "File Url.",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Options.",
							},
						},
						returns: 'Promise',
						description:
							"Reads a remote or local(*) file and returns a Promise.\n" +
							"(*) Local file access is [hopefully] restricted.",
					}
				//! END_REPLACE()
				, function readFileAsync(url, /*optional*/options) {
					const Promise = types.getPromise();
					return Promise.try(function readFilePromise() {
						options = tools.nullObject(options);

						url = files.parseUrl(url);

						let encoding = options.encoding;
						if (encoding === 'iso-8859') {
							// Fix for some browsers
							encoding = 'iso-8859-1';
						} else if (encoding === 'utf8') {
							// Fix
							encoding = 'utf-8';
						};

						const method = (options.method || 'GET');

						const timeout = options.timeout;

						// <PRB> A supposedly better API (fetch), but coming with no way to abort or specify a timeout !!!!!!
						if (types.isNothing(timeout) && _shared.Natives.windowFetch && _shared.Natives.windowHeaders && _shared.Natives.windowFileReader) {
							url = url.toString({
								noEscapes: true,
							});

							const headers = new _shared.Natives.windowHeaders(options.headers);
							if (!headers.has('Accept')) {
								if (encoding) {
									headers.set('Accept', 'text/plain');
								} else {
									headers.set('Accept', '*/*');
								};
							};

							const init = {
								method: method,
								headers: headers,
							};

							if (!types.isNothing(options.body)) {
								init.body = options.body;
							};

							if (!options.enableCache) {
								init.cache = 'no-cache';
							};

							if (options.enableCookies) {
								// http://stackoverflow.com/questions/30013131/how-do-i-use-window-fetch-with-httponly-cookies
								init.credentials = 'include';
							};

							return _shared.Natives.windowFetch.call(global, url, init).then(function(response) {
								if (response.ok && types.HttpStatus.isSuccessful(response.status)) {
									return response.blob().then(function(blob) {
										const reader = new _shared.Natives.windowFileReader();
										const promise = Promise.create(function readerPromise(resolve, reject) {
											reader.onloadend = function(ev) {
												if (reader.error) {
													reject(reader.error);
												} else {
													resolve(reader.result);
												};
											};
										});
										if (encoding) {
											reader.readAsText(blob, encoding);
										} else {
											reader.readAsArrayBuffer(blob);
										};
										return promise;
									});
								} else {
									throw new types.HttpError(response.status, response.statusText);
								}
							});
						} else {
							const xhr = new _shared.Natives.windowXMLHttpRequest();

							if (!('response' in xhr) && !('responseBody' in xhr)) {
								throw new types.NotSupported("Incompatible browser.");
							};

							let args = url.args;

							const rootUrl = tools.getCurrentLocation();
							if ((rootUrl.protocol !== 'file') && !options.enableCache) {
								args = url.args.set('XHR_DISABLE_CACHE', tools.generateUUID(), true);
							};

							url = url.toString({
								args: args,
								noEscapes: true,
							});

							const state = {
								timeoutId: null,
								ready: false,
							};

							xhr.open(method, url, true);

							const headers = options.headers;
							if (headers) {
								tools.forEach(headers, function(value, name) {
									xhr.setRequestHeader(name, value);
								});
							};

							if (encoding) {
								xhr.overrideMimeType(types.getIn(options, 'contentType', 'text/plain') + '; charset=' + encoding);
							} else {
								xhr.setRequestHeader('Accept', types.getIn(options, 'contentType', '*/*'));
							};

							xhr.responseType = (encoding ? 'text' : 'blob');

							const loadEv = (('onload' in xhr) ? 'load' : 'readystatechange');

							return Promise.create(function readerPromise(resolve, reject) {
								const handleError = function handleError(ex) {
									if (state.timeoutId) {
										state.timeoutId.cancel();
										state.timeoutId = null;
									};
									if (!state.ready) {
										state.ready = true;
										reject(ex);
									};
								};

								client.addListener(xhr, loadEv, function(ev) {
									if ((loadEv !== 'readystatechange') || (xhr.readyState === 4)) {
										if (types.HttpStatus.isSuccessful(xhr.status)) {
											if (state.timeoutId) {
												state.timeoutId.cancel();
												state.timeoutId = null;
											};
											if (!this.ready) {
												this.ready = true;
												resolve(xhr.response);
											};
										} else {
											handleError(new types.HttpError(xhr.status, xhr.statusText));
										};
									};
								});

								client.addListener(xhr, 'error', function(ev) {
									handleError(ev.error);
								});

								if (!types.isNothing(timeout)) {
									if ('timeout' in xhr) {
										// Wow ! A timeout option !!!
										xhr.timeout = timeout;
									} else {
										// No timeout option !
										state.timeoutId = tools.callAsync(function(ev) {
											state.timeoutId = null;
											if (!state.ready) {
												xhr.abort();
												handleError(new types.TimeoutError("Request has timed out."));
											};
										}, timeout, null, null, true);
									};
								};

								try {
									xhr.send(options.body);
								} catch(ex) {
									if (!state.ready) {
										handleError(ex);
									};
								};
							});
						}
					});
				}));

			files.ADD('readFile', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							url: {
								type: 'string,Url',
								optional: false,
								description: "File Url.",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Options.",
							},
						},
						returns: 'Promise',
						description:
							"Reads a remote or local(*) file and returns a Promise.\n" +
							"(*) Local file access is [hopefully] restricted.",
					}
				//! END_REPLACE()
				, function readFile(url, /*optional*/options) {
					const async = types.get(options, 'async', false);

					if (async) {
						return files.readFileAsync(url, /*optional*/options);
					} else {
						return files.readFileSync(url, /*optional*/options);
					}
				}));

			files.ADD('watch', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							url: {
								type: 'string,Url,Blob,File',
								optional: false,
								description: "File Url.",
							},
							callbacks: {
								type: 'arrayof(function),function',
								optional: false,
								description: "Callback functions.",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Callback options.",
							},
						},
						returns: 'undefined',
						description: "Not implemented.",
					}
				//! END_REPLACE()
				, function watch(url, callbacks, /*optional*/options) {
					// Do nothing
				}));

			files.ADD('unwatch', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							url: {
								type: 'string,Url,Blob,File',
								optional: false,
								description: "File Url.",
							},
							callbacks: {
								type: 'arrayof(function),function',
								optional: true,
								description: "Callback functions.",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Callback options.",
							},
						},
						returns: 'undefined',
						description: "Not implemented.",
					}
				//! END_REPLACE()
				, function unwatch(url, callbacks, /*optional*/options) {
					// Do nothing
				}));


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
				const strLen = str.length;
				size = (types.isNothing(size) ? strLen * 2 : _shared.Natives.mathMin(strLen * 2, size));

				// FUTURE: Look again for TextEncoder if it will finally supports an encoding argument, and also binary (raw) conversion.
				// Reference: https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String

				const buf = new _shared.Natives.windowArrayBuffer(size);

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
				const bufView = new _shared.Natives.windowUint8Array(buf);
				let pos = 0;
				for (let i = 0; i < strLen && pos < size; i++) {
					const cc = _shared.Natives.stringCharCodeAtCall(str, i);
					bufView[pos++] = cc & 0x00FF;
					if (pos < size) {
						bufView[pos++] = (cc & 0xFF00) >> 8;
					};
				};

				return (_shared.Natives.globalBufferFrom ? _shared.Natives.globalBufferFrom(buf) : bufView);
			});


			//===================================
			// Alert
			//===================================

			tools.ADD('setAlert', function setAlert(alertFn) {
				__Internal__.alert = alertFn;
			});

			tools.ADD('alert', function alert(msg, /*optional*/params) {
				if (params) {
					msg = tools.format(msg, params);
				};
				tools.callAsync(__Internal__.alert, 0, null, [msg]);
			});

			//===================================
			// Init
			//===================================
			return function init(/*optional*/options) {
				try {
					types.getPromise();
				} catch(ex) {
					if (global.RSVP && types.isFunction(global.RSVP.Promise)) {
						// tiny Promise/A+ implementation
						types.setPromise(global.RSVP.Promise);
					} else if (global.ES6Promise && types.isFunction(global.ES6Promise.Promise)) {
						// subset of RSVP
						types.setPromise(global.ES6Promise.Promise);
					};
				};

				tools.setAlert(_shared.Natives.windowAlert);
			};
		},
	};
	return modules;
};

//! END_MODULE()
