//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Client.js - Client functions
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
		DD_MODULES['Doodad.Client'] = {
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
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					files = tools.Files,
					config = tools.Config,
					client = doodad.Client,
					extenders = doodad.Extenders,
					mixIns = doodad.MixIns;

				//=============================
				// Internals
				//=============================
					
				var __Internal__ = {
					documentHasParentWindow: (!!global.document && (global.document.parentWindow === global)),
					
					loadedScripts: types.nullObject(),   // <FUTURE> global to every thread
				};

				//=====================
				// Options
				//=====================
				
				var __options__ = types.extend({
					enableDomObjectsModel: false,	// "true" uses "instanceof" with DOM objects. "false" uses old "nodeType" and "nodeString" attributes.
					defaultScriptTimeout: 10000,		// milliseconds
				}, _options);

				__options__.enableDomObjectsModel = types.toBoolean(__options__.enableDomObjectsModel);
				__options__.defaultScriptTimeout = types.toInteger(__options__.defaultScriptTimeout);

				types.freezeObject(__options__);

				client.ADD('getOptions', function() {
					return __options__;
				});
				
				//========================
				// Natives
				//========================
				
				types.complete(_shared.Natives, {
					//windowObject: global.Object,

					// DOM
					windowWindow: (types.isNativeFunction(global.Window) ? global.Window : undefined),
					windowNode: (types.isNativeFunction(global.Node) ? global.Node : undefined),
					windowHtmlDocument: (types.isNativeFunction(global.HTMLDocument) ? global.HTMLDocument : undefined),
					windowHtmlElement: (types.isNativeFunction(global.HTMLElement) ? global.HTMLElement : undefined),

					//windowError: global.Error,
					
					// getDefaultLanguage
					windowNavigator: global.navigator,

					// Script loader
					windowURL: (types.isNativeFunction(global.URL) ? global.URL : undefined),
					
					// Script loader, readFile
					windowBlob: (types.isNativeFunction(global.Blob) ? global.Blob : undefined),

					// readFile
					windowFileReader: (types.isNativeFunction(global.FileReader) ? global.FileReader : undefined),
					windowFetch: (types.isNativeFunction(global.fetch) ? global.fetch : undefined),
					windowHeaders: (types.isNativeFunction(global.Headers) ? global.Headers : undefined),
					windowXMLHttpRequest: global.XMLHttpRequest,
					
					// isEventTarget
					windowEventTarget: (types.isNativeFunction(global.EventTarget) ? global.EventTarget : undefined),
					
					// isEvent
					windowEventConstructor: (types.isFunction(global.Event) ? global.Event : global.Event.constructor),
					
					// callAsync
					mathMax: global.Math.max,
					windowSetTimeout: global.setTimeout.bind(global),
					windowClearTimeout: global.clearTimeout.bind(global),
					windowSetImmediate: (types.isNativeFunction(global.setImmediate) ? global.setImmediate : undefined), // IE 10
					windowClearImmediate: (types.isNativeFunction(global.clearImmediate) ? global.clearImmediate : undefined), // IE 10
					windowRequestAnimationFrame: (types.isNativeFunction(global.requestAnimationFrame) && global.requestAnimationFrame) || 
												(types.isNativeFunction(global.mozRequestAnimationFrame) && global.mozRequestAnimationFrame) || 
												(types.isNativeFunction(global.webkitRequestAnimationFrame) && global.webkitRequestAnimationFrame) || 
												(types.isNativeFunction(global.msRequestAnimationFrame) && global.msRequestAnimationFrame) ||
												undefined,
					windowCancelAnimationFrame: (types.isNativeFunction(global.cancelAnimationFrame) && global.cancelAnimationFrame) ||
												(types.isNativeFunction(global.mozCancelAnimationFrame) && global.mozCancelAnimationFrame) ||
												undefined,

					// generateUUID
					mathRandom: global.Math.random,
				});
				
				
				//===================================
				// Events
				//===================================
				
				__Internal__.hasAddEventListener = types.isNativeFunction(global.addEventListener);
				
				client.ADD('addListener', (__Internal__.hasAddEventListener ? 
						function addListener(element, name, handler, /*optional*/capture) {
							element.addEventListener(name, handler, !!capture);
						} 
						
					:
						function addListener(element, name, handler, /*optional*/capture) {
							name = 'on' + name;
							var handlersName = types.getSymbolFor('__DD_EVENT_HANDLERS__' + name, true);
							var handlers = types.get(element, handlersName);
							//if (types.isNativeFunction(element.attachEvent)) {
							if (element.attachEvent) {
								// IE
								var caller = function(ev) {
									ev = ev || global.event;
									return handler.call(this, ev);
								};
								if (!handlers) {
									element[handlersName] = handlers = new types.Map();
								};
								handlers.set(handler, caller);
								element.attachEvent(name, caller);
							} else {
								if (!handlers) {
									element[handlersName] = handlers = [];
									var caller = function _caller(ev) {
										ev = ev || global.event;
										var handlers = types.get(element, handlersName, []),
											retval;
										for (var i = handlers.length - 1; i >= 0; i--) {
											var handler = handlers[i];
											retval = handler.call(this, ev);
											if (retval === false) {
												break;
											};
										};
										return retval;
									};
									var oldHandler = element[name];
									if (oldHandler) {
										handlers.push(oldHandler);
									};
									element[name] = caller;
								};
								if (tools.indexOf(handlers, handler) < 0) {
									handlers.push(handler);
								};
							};
						}
						
					));
				
				client.ADD('removeListener', (__Internal__.hasAddEventListener ? 
						function removeListener(element, name, handler, /*optional*/capture) {
							element.removeEventListener(name, handler, !!capture);
						}
						
					: 
						function removeListener(element, name, handler, /*optional*/capture) {
							name = 'on' + name;
							var handlersName = types.getSymbolFor('__DD_EVENT_HANDLERS__' + name, true);
							var handlers = types.get(element, handlersName);
							//if (types.isNativeFunction(element.attachEvent)) {
							if (element.attachEvent) {
								// IE
								var caller;
								if (handlers) {
									caller = handlers.get(handler);
								};
								element.detachEvent(name, caller || handler);
							} else {
								if (handlers) {
									for (var i = handlers.length - 1; i >= 0; i--) {
										if (handlers[i] === handler) {
											handlers.splice(i, 1);
										};
									};
								};
							};
						}

					));
				
				//===================================
				// Promise events
				//===================================

				__Internal__.unhandledErrorEvent = new types.Map();
				__Internal__.unhandledRejectionEvent = new types.Map();
				__Internal__.handledRejectionEvent = new types.Map();
				
				types.ADD('addAppEventListener', function addAppEventListener(event, listener) {
					if (event === 'unhandlederror') {
						if (!__Internal__.unhandledErrorEvent.has(listener)) {
							var handler = function(msg, url, lineNo, columnNo, error) {
								if (!error) {
									// <PRB> Not every browsers supports the "error" argument
									error = new types.Error(msg);
									error.stack = "";
									error.fileName = error.sourceURL = url;
									error.line = error.lineNumber = lineNo;
									error.columnNumber = columnNo;
									error.functionName = "";
									error.parsed = true;
								};
								listener(new types.CustomEvent('unhandlederror', {
									detail: {
										error: error,
									}
								}));
							};
							global.addEventListener('error', handler);
							__Internal__.unhandledErrorEvent.set(listener, handler);
						};
					} else if (event === 'unhandledrejection') {
						if (!__Internal__.unhandledRejectionEvent.has(listener)) {
							var handler = function(ev) {
								listener(new types.CustomEvent('unhandledrejection', {
									detail: {
										reason: ev.reason || ev.detail.reason,
										promise: ev.promise || ev.detail.promise,
									}
								}));
							};
							global.addEventListener(event, handler);
							__Internal__.unhandledRejectionEvent.set(listener, handler);
						};
					} else if (event === 'rejectionhandled') {
						if (!__Internal__.handledRejectionEvent.has(listener)) {
							var handler = function(ev) {
								listener(new types.CustomEvent('rejectionhandled', {
									detail: {
										promise: ev.promise || ev.detail.promise,
									}
								}));
							};
							global.addEventListener(event, handler);
							__Internal__.handledRejectionEvent.set(listener, handler);
						};
					} else {
						throw new types.Error("Unknow application event '~0~'.", [event]);
					};
				});
				
				types.ADD('removeAppEventListener', function removeAppEventListener(event, listener) {
					if (event === 'unhandledrejection') {
						if (__Internal__.unhandledRejectionEvent.has(listener)) {
							var handler = __Internal__.unhandledRejectionEvent.get(listener);
							global.removeEventListener(event, handler);
							__Internal__.unhandledRejectionEvent.delete(listener);
						};
					} else if (event === 'rejectionhandled') {
						if (__Internal__.handledRejectionEvent.has(listener)) {
							var handler = __Internal__.handledRejectionEvent.get(listener);
							global.removeEventListener(event, handler);
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
						fn = doodad.Callback(thisObj, fn, null, args, secret);
						if ((delay <= 0) && _shared.Natives.windowSetImmediate) { // IE 10
							// Raised after events queue process
							var id = _shared.Natives.windowSetImmediate(fn);
							return (cancelable && {
								cancel: function cancel() {
									_shared.Natives.windowClearImmediate(id);
									id = null;
								},
							} || undefined);
						} else if ((delay <= 0) && _shared.Natives.windowRequestAnimationFrame) {
							// Raised at page re-paint
							var id = _shared.Natives.windowRequestAnimationFrame(fn);
							return (cancelable && {
								cancel: function cancel() {
									_shared.Natives.windowCancelAnimationFrame(id);
									id = null;
								},
							} || undefined);
						} else {
							// Raised after X ms
							delay = _shared.Natives.mathMax(delay, 0);
							var id = _shared.Natives.windowSetTimeout(fn, delay);
							return (cancelable && {
								cancel: function cancel() {
									_shared.Natives.windowClearTimeout(id);
									id = null;
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
						
						var exitCode = 1; // 1 = General error

						try {
							if (err instanceof types.ScriptAbortedError) {
								exitCode = err.exitCode;
							} else {
								debugger;
								if (!err.trapped) {
									try {
										err.trapped = true;
										if (global.console.error) {
											global.console.error(err.stack || err.message || err.description);
										} else {
											global.console.log(err.stack || err.message || err.description);
										};
									} catch(p) {
										debugger;
									};
								};
							};
						} catch(o) {
							debugger;
						};
						
						try {
							tools.dispatchEvent(new types.CustomEvent('exit', {cancelable: false, detail: {exitCode: exitCode}})); // sync
						} catch(o) {
							debugger;
						};
						
						try {
							global.console.log("Page exited with code : " + types.toString(exitCode));
						} catch(o) {
						};
						
						if (!__Internal__.setCurrentLocationPending) {
							var reload = false;
							var url = global.window.location.href;
							
							try {
								url = files.Url.parse(url);
								
								// TODO: Better user message, with translation
								global.document.open('text/plain', false);
								if (exitCode !== 0) {
									if (types.toBoolean(url.args.get('crashReport', true))) {
										global.document.write("An unexpected error has occured again. We are very sorry. Please contact support. Thank you.");
									} else {
										reload = true;
										global.document.write("We are sorry. An unexpected error has occured. Page will now reload...");
									};
								};
								global.document.close();
							} catch(o) {
								debugger;
							};
							
							if (reload) {
								try {
									url = url.setArgs({crashReport: true})
									tools.setCurrentLocation(url, true);
								} catch(o) {
									debugger;
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
							revision: 0,
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
					if (types.isNothing(obj)) {
						return false;
					};
					return (typeof obj === 'object') && (obj instanceof _shared.Natives.windowEventConstructor);
				}));
				
				client.ADD('isWindow', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
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
				, (__options__.enableDomObjectsModel && _shared.Natives.windowWindow ? (function isWindow(obj) {
					// NOTE: Browsers really need to review their objects model.
					if (types.isNothing(obj)) {
						return false;
					};
					if (obj === global) {
						return true;
					};
					if (typeof obj !== 'object') {
						return false;
					};
					var W = obj.Window;
					//SLOWER return types.isNativeFunction(W) && (obj instanceof W);
					return types.isFunction(W) && (obj instanceof W);
				}) : (function isWindow(obj) {
					 return !!obj && (typeof obj === "object") && types.isNativeFunction(obj.setTimeout) && types.isNativeFunction(obj.focus);
				}))));

				client.ADD('isDocument', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
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
				, (__options__.enableDomObjectsModel && __Internal__.documentHasParentWindow && _shared.Natives.windowHtmlDocument ? (function isDocument(obj) {
					// NOTE: Browsers really need to review their objects model.
					if (types.isNothing(obj)) {
						return false;
					};
					if (obj === global.document) {
						return true;
					};
					if (typeof obj !== 'object') {
						return false;
					};
					var w = obj.parentWindow;
					if (!types.isObjectLike(w)) {
						return false;
					};
					if (w === global.window) {
						return (obj instanceof _shared.Natives.windowHtmlDocument);
					};
					var hd = w.HTMLDocument;
					//SLOWER return types.isNativeFunction(hd) && (obj instanceof hd);
					return types.isFunction(hd) && (obj instanceof hd);
				}) : (function isDocument(obj) {
					 return !!obj && (typeof obj === "object") && (obj.nodeType === 9) && (typeof obj.nodeName === "string");
				}))));

				client.ADD('isNode', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
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
				, (__options__.enableDomObjectsModel && __Internal__.documentHasParentWindow && _shared.Natives.windowNode ? (function isNode(obj) {
					// NOTE: Browsers really need to review their objects model.
					if (types.isNothing(obj)) {
						return false;
					};
					if (typeof obj !== 'object') {
						return false;
					};
					var d = obj.ownerDocument;
					if (!types.isObjectLike(d)) {
						return false;
					};
					var w = d.parentWindow;
					if (!types.isObjectLike(w)) {
						return false;
					};
					if (w === global) {
						return (obj instanceof _shared.Natives.windowNode);
					};
					var n = w.Node;
					//SLOWER return types.isNativeFunction(n) && (obj instanceof n);
					return types.isFunction(n) && (obj instanceof n);
				}) : (function isNode(obj) {
					return !!obj && (typeof obj === "object") && (+obj.nodeType === obj.nodeType) && (typeof obj.nodeName === "string");
				}))));

				client.ADD('isElement', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
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
				, (__options__.enableDomObjectsModel && __Internal__.documentHasParentWindow && _shared.Natives.windowHtmlElement ? (function isElement(obj) {
					// NOTE: Browsers really need to review their objects model.
					if (types.isNothing(obj)) {
						return false;
					};
					if (typeof obj !== 'object') {
						return false;
					};
					var d = obj.ownerDocument;
					if (!types.isObjectLike(d)) {
						return false;
					};
					var w = d.parentWindow;
					if (!types.isObjectLike(w)) {
						return false;
					};
					if (w === global) {
						return (obj instanceof _shared.Natives.windowHtmlElement);
					};
					var he = w.HTMLElement;
					//SLOWER return types.isNativeFunction(he) && (obj instanceof he);
					return types.isFunction(he) && (obj instanceof he);
				}) : (function isElement(obj) {
					 return !!obj && (typeof obj === "object") && (obj.nodeType === 1) && (typeof obj.nodeName === "string");
				}))));
				
				
				client.ADD('isEventTarget', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
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
					if (types.isNothing(obj)) {
						return false;
					};
					return (typeof obj === 'object') && (obj instanceof _shared.Natives.windowEventTarget);
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
					while (parent && (parent.nodeType !== 1))
					{
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
				, doodad.MIX_IN(doodad.Class.$extend({
					$TYPE_NAME: "JsEvents",
					
					__JS_EVENTS: doodad.PROTECTED(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray, {cloneOnInit: true})))))))),
					// TODO: Do we need that ?
					//__JS_ERROR_EVENT: doodad.PUBLIC(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(null))))))),
						
					detachJsEvents: doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function detachJsEvents(/*optional*/elements, /*optional*/useCapture) {
						var events = this.__JS_EVENTS,
							eventsLen = events.length;
						for (var i = 0; i < eventsLen; i++) {
							this[events[i]].detach(elements, useCapture);
						};
					})))),
					
					clearJsEvents: doodad.PROTECTED(doodad.TYPE(doodad.INSTANCE(doodad.METHOD(function clearJsEvents() {
						var events = this.__JS_EVENTS,
							eventsLen = events.length;
						for (var i = 0; i < eventsLen; i++) {
							this[events[i]].clear();
						};
					})))),
				}))));
				
				doodad.REGISTER(root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: null,
							description: "JS event handler prototype.",
				}
				//! END_REPLACE()
				, doodad.EventHandler.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'JsEventHandler',
					},
					/*instanceProto*/
					{
						attach: types.SUPER(function attach(elements, /*optional*/context, /*optional*/useCapture, /*optional*/once) {
							if (!types.isArrayLike(elements)) {
								elements = [elements];
							};
							
							this.detach(elements, useCapture);

							useCapture = !!useCapture;
							
							//var handler	= types.bind(this[_shared.ObjectSymbol], this),
							var self = this,
								ignore = false;
							
							var createHandler = function(element) {
								return function jsEventHandler(ev) {
									if (!ignore) {
										if (once) {
											ignore = true;
											self.clear();
										};
										ev = ev || global.event;
										//if (!ev.currentTarget) {
										//	ev.currentTarget = this;
										//};
										ev.getUnified = self[_shared.ExtenderSymbol].getUnified;
										delete ev.__unified;
										return _shared.invoke(self[_shared.ObjectSymbol], self, [ev, context], _shared.SECRET);
									};
								};
							};
							
							var eventTypes = this[_shared.ExtenderSymbol].types,
								eventTypesLen = eventTypes.length;
								
							for (var i = 0; i < eventTypesLen; i++) {
								if (types.hasIndex(eventTypes, i)) {
									var type = eventTypes[i],
										elementsLen = elements.length;
									for (var j = 0; j < elementsLen; j++) {
										if (types.hasIndex(elements, j)) {
											var element = elements[j],
												handler = createHandler(element);
											if (this._super(this[_shared.ObjectSymbol], this, null, [useCapture, element, type, handler])) {
												client.addListener(element, type, handler, useCapture);
											};
										};
									};
								};
							};
						}),
						attachOnce: function attachOnce(elements, /*optional*/context, /*optional*/useCapture) {
							this.attach(elements, context, useCapture, true);
						},
						detach: types.SUPER(function detach(/*optional*/elements, /*optional*/useCapture) {
							if (types.isNothing(elements)) {
								var evs = null;
								if (types.isNothing(useCapture)) {
									evs = this._super(this[_shared.ObjectSymbol], this);
								} else {
									evs = this._super(this[_shared.ObjectSymbol], this, [!!useCapture]);
								};
								if (evs) {
									var evsLen = evs.length;
									for (var j = 0; j < evsLen; j++) {
										var evData = evs[j][3],
											capture = evData[0],
											element = evData[1],
											type = evData[2],
											handler = evData[3];
										client.removeListener(element, type, handler, capture);
									};
								};
							} else {
								if (!types.isArrayLike(elements)) {
									elements = [elements];
								};
								
								root.DD_ASSERT && root.DD_ASSERT(tools.every(elements, function(element) {
									return client.isEventTarget(element);
								}), "Invalid elements.");
								
								var elementsLen = elements.length;
								for (var i = 0; i < elementsLen; i++) {
									var evs = null;
									if (types.isNothing(useCapture)) {
										evs = this._super(this[_shared.ObjectSymbol], this, [false, elements[i]]);
										types.append(evs, this._super(this[_shared.ObjectSymbol], this, [true, elements[i]]));
									} else {
										evs = this._super(this[_shared.ObjectSymbol], this, [!!useCapture, elements[i]]);
									};
									if (evs) {
										var evsLen = evs.length;
										for (var j = 0; j < evsLen; j++) {
											var evData = evs[j][3],
												capture = evData[0],
												element = evData[1],
												type = evData[2],
												handler = evData[3];
											client.removeListener(element, type, handler, capture);
										};
									};
								};
							};
						}),
						clear: function clear() {
							this.detach();
						},
						promise: function promise(elements, /*optional*/context, /*optional*/useCapture) {
							// NOTE: Don't forget that a promise resolves only once, so ".promise" is like ".attachOnce".
							var canReject = this[_shared.ExtenderSymbol].canReject;
							var self = this;
							var Promise = types.getPromise();
							return Promise.create(function eventPromise(resolve, reject) {
								self.attachOnce(elements, context, useCapture, function(ev) {
									if (canReject && (ev instanceof doodad.ErrorEvent)) {
										return reject(ev);
									} else {
										return resolve(ev);
									};
								});
							});
						},
					}
				)));
				
				extenders.REGISTER(root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 1,
							params: null,
							returns: null,
							description: "JS event extender.",
				}
				//! END_REPLACE()
				, extenders.Event.$inherit({
					$TYPE_NAME: "JsEvent",
					
					eventsAttr: types.READ_ONLY('__JS_EVENTS'),
					// TODO: Do we need that ?
					//errorEventAttr: types.READ_ONLY('__JS_ERROR_EVENT'),
					errorEventAttr: types.READ_ONLY(null),
					eventsImplementation: types.READ_ONLY('Doodad.MixIns.JsEvents'),
					
					enableScopes: types.READ_ONLY(true),
					types: types.READ_ONLY(null),
					
					getUnified: types.READ_ONLY(function getUnified() {
						if (!this.__unified) {
							var self = this;
							this.__unified = {
								// TODO: Unify event properties between browsers
								which: (types.isNothing(self.which) ? self.keyCode : ((self.which != 0) && (self.charCode != 0) ? self.which : null)),  // source: http://javascript.info/tutorial/keyboard-events
								//preventDefault: (types.isNothing(self.preventDefault) ? function() {ev.returnValue = false; ev.keyCode = 0;} : self.preventDefault),
							};
						};
						return this.__unified;
					}),
					
					eventProto: types.READ_ONLY(doodad.JsEventHandler),
					
					_new: types.READ_ONLY(types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						if (!types.isType(this)) {
							_shared.setAttributes(this, {
								types: types.freezeObject(types.get(options, 'types', this.types) || []),
							}, {all: true});
						};
					})),
					getCacheName: types.READ_ONLY(types.SUPER(function getCacheName(/*optional*/options) {
						if (types.isNothing(options)) {
							options = {};
						};
						return this._super(options) + 
							',' + types.unique([], types.get(options, 'types', this.types)).sort().join('|');
					})),
					overrideOptions: types.READ_ONLY(types.SUPER(function overrideOptions(options, newOptions) {
						this._super(options, newOptions);
						options.types = types.unique([], newOptions.types, this.types);
						return options;
					})),
				})));

				
				doodad.ADD('JS_EVENT', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 2,
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
							returns: 'AttributeBox,Extender',
							description: "JS event attribute modifier.",
				}
				//! END_REPLACE()
				, function JS_EVENT(eventTypes, /*optional*/fn) {
					if (types.isStringAndNotEmpty(eventTypes)) {
						eventTypes = eventTypes.split(',');
					};
					if (root.DD_ASSERT) {
						root.DD_ASSERT(types.isNothing(eventTypes) || types.isArrayAndNotEmpty(eventTypes), "Invalid types.");
						if (eventTypes) {
							root.DD_ASSERT(tools.every(eventTypes, types.isStringAndNotEmpty), "Invalid types.");
						};
						var val = types.unbox(fn);
						root.DD_ASSERT(types.isNothing(val) || types.isJsFunction(val), "Invalid function.");
					};
					return doodad.PROTECTED(doodad.ATTRIBUTE(fn, extenders.JsEvent, {
						types: eventTypes,
					}));
				}));
				
/* TODO: Do we need that ?				
				doodad.ADD('JS_ERROR_EVENT', root.DD_DOC(
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
					, function JS_ERROR_EVENT(eventTypes, /*optional* /fn) {
						return doodad.OPTIONS({errorEvent: true}, doodad.JS_EVENT(eventTypes, fn));
					}));
*/

				//===================================
				// System functions
				//===================================
				
				tools.ADD('getOS', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 1,
							params: null,
							returns: 'object',
							description: "Returns OS information.",
				}
				//! END_REPLACE()
				, function getOS() {
					// TODO: Complete this function
					// NOTE: This function will get replaced when "NodeJs.js" is loaded.
					// NOTE: Why it's never simple like this ?
					// NOTE: Windows older than Windows NT not supported
					// NOTE: Macintosh older than OS/X not supported
					var os = __Internal__.os;
					if (!os) {
						var type = _shared.Natives.windowNavigator.platform.toLowerCase().slice(0, 3);
						__Internal__.os = os = {
							name: _shared.Natives.windowNavigator.platform,
							type: ((type === 'win') ? 'windows' : ((type === 'lin') ? 'linux' : 'unix')),  // 'windows', 'linux', 'unix'
							//mobile: false, // TODO: "true" for Android, Windows CE, Windows Mobile, iOS, ...
							//architecture: null, // TODO: Detect
							dirChar: ((type === 'win') ? '\\' : '/'),
							newLine: ((type === 'win') ? '\r\n' : '\n'),
						};
					};
					var filesOptions = files.getOptions();
					os.caseSensitive = filesOptions.caseSensitive || filesOptions.caseSensitiveUnicode;
					return os;
				}));

				tools.ADD('getDefaultLanguage', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
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
					// Source: http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
					var navigator = _shared.Natives.windowNavigator;
					var tmp = tools.split(((navigator.languages && navigator.languages[+alt || 0]) || navigator.language || navigator.userLanguage || 'en_US').replace('-', '_'), '_', 2);
					tmp[1] = tmp[1].toUpperCase();
					return tmp.join('_');
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
				, types.createErrorType("PageMovedError", types.ScriptAbortedError, function _new(message, /*optional*/params) {
					return types.ScriptAbortedError.call(this, message || "Page moved.", params);
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
					if (!_window) {
						_window = global.window;
					};
					return files.Url.parse(_window.location.href);
				}));
				
				
				__Internal__.setCurrentLocationPending = false;
				
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
						root.DD_ASSERT(types.isStringAndNotEmpty(url) || (url instanceof files.Url), "Invalid url.");
						root.DD_ASSERT(types.isNothing(_window) || client.isWindow(_window), "Invalid window object.");
					};
					
					if (!__Internal__.setCurrentLocationPending) {
						if (!(url instanceof files.Url)) {
							url = files.Url.parse(url);
						};
						
						if (!_window) {
							_window = global.window;
						};

						var result = url.compare(_window.location.href);
						if (!noReload && (result === 0)) {
							_window.location.reload();
							__Internal__.setCurrentLocationPending = true;
						} else {
							_window.location.href = url.toString();
							__Internal__.setCurrentLocationPending = (result !== 0);
						};
					};
					
					if (!dontAbort) {
						throw new types.PageMovedError();
					};
				}));
				
				//===================================
				// Script loader functions
				//===================================

				// NOTE: These functions will get replaced when "NodeJs.js" is loaded.
				
				__Internal__.ScriptLoader = types.INIT(types.CustomEventTarget.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'ScriptLoader',
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
									clearTimeout(this.timeoutId);
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
						__handleError: function __handleError(ev) {
							if (this.timeoutId) {
								clearTimeout(this.timeoutId);
								this.timeoutId = null;
							};
							if (!this.ready) {
								this.ready = true;
								this.failed = true;
								this.dispatchEvent(new types.CustomEvent('error', {detail: new types.TimeoutError()}));
								tools.dispatchEvent(new types.CustomEvent('scripterror', {
									detail: {
										loader: this,
									},
								}));
								if (this.element && this.element.parentNode) {
									this.element.parentNode.removeChild(this.element);
									this.element = null;
								};
							};
						},
						start: function() {
							if (!this.launched) {
								this.launched = true;
								
								this.element = this.target.ownerDocument.createElement(this.tag);
								if ('onreadystatechange' in this.element) {
									// For previous versions of IE
									this.loadEv = 'readystatechange';
								} else {
									this.loadEv = 'load';
								};
								
								var self = this;
								
								// NOTE: Safari: "onload" doesn't raise for the 'link' tag
								client.addListener(this.element, this.loadEv, function scriptOnSuccess(ev) {
									return self.__handleSuccess(ev);
								});
								
								// NOTE: IE and Safari: "onerror" doesn't raise, so we can't know if there was an error
								client.addListener(this.element, 'error', function scriptOnError(ev) {
									return self.__handleError(ev);
								});

								this.dispatchEvent(new types.CustomEvent('init'));
								tools.dispatchEvent(new types.CustomEvent('scriptinit', {
									detail: {
										loader: this,
									},
								}));

								//if (this.async) {
								//	// Workaround for asynchronous script loading
								//	var appendElement = function appendElement() {
								//		self.target.appendChild(self.element);
								//	};
								//	setTimeout(appendElement, 1);
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
									var url = (this.element.src || this.element.href);
									if (url) {
										url = files.Url.parse(url);
									};
									if (url) {
										var waitDownload = this.target.ownerDocument.createElement('img');
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
								
								if (this.timeout) {
									this.timeoutId = setTimeout(function handleTimeout(ev) {
										self.timeoutId = null;
										if (!self.ready) {
											self.timedout = true;
											self.__handleError(ev);
										};
									}, this.timeout);
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

					var loader = null;
					
					if (url instanceof files.Path) {
						url = files.Url.parse(url);
					};
					
					if (url instanceof files.Url) {
						url = url.toString();
					};
					
					root.DD_ASSERT && root.DD_ASSERT(types.isString(url), "Invalid url.");
					
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
							_document = global.document;
						};
						
						__Internal__.loadedScripts[url] = loader = new __Internal__.ScriptLoader(/*tag*/'script', /*target*/_document.body, /*timeout*/timeout);
						
						loader.addEventListener('init', function() {
							loader.async = this.element.async = !!async;
							this.element.type = 'text/javascript';
							this.element.src = url;
						});
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
						_document = global.document;
					};
					
					var loader = new __Internal__.ScriptLoader(/*tag*/'script', /*target*/_document.body, /*timeout*/timeout);
					
					loader.addEventListener('init', function() {
						this.element.type = 'text/javascript';
						loader.async = this.element.async = !!async;
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

					if (url instanceof files.Path) {
						url = files.Url.parse(url);
					};
					
					if (url instanceof files.Url) {
						url = url.toString();
					};
					
					root.DD_ASSERT && root.DD_ASSERT(types.isString(url), "Invalid url.");
					
					var loader = null;
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
							_document = global.document;
						};
						
						__Internal__.loadedScripts[url] = loader = new __Internal__.ScriptLoader(/*tag*/'link', /*target*/_document.getElementsByTagName('head')[0], /*timeout*/timeout);
						
						loader.addEventListener('init', function() {
							loader.async = !!async;
							this.element.rel = 'stylesheet';
							this.element.type = 'text/css';
							if (media) {
								this.element.media = media;
							};
							this.element.href = url;
						});
					};
					
					return loader;
				}));

				tools.ADD('getCssScriptBlockLoader', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 0,
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

					var loader;
					
					if (async && _shared.Natives.windowBlob && global.URL) {
						if (!_document) {
							_document = global.document;
						};
						
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
						if (!_document) {
							_document = global.document;
						};
						
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
				// Config
				//===================================
				
				__Internal__.oldLoadConfig = _shared.loadConfig;
				
				_shared.loadConfig = function loadConfig(url, /*optional*/options, /*optional*/callbacks) {
						options = types.nullObject(options);
						if (types.isString(url)) {
							url = _shared.urlParser(url, options.parseOptions);
						};
						return __Internal__.oldLoadConfig(url, options, callbacks);
					};


				//===================================
				// File functions
				//===================================
				
				files.ADD('readFile', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
				{
							author: "Claude Petit",
							revision: 5,
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
					var Promise = types.getPromise();
					options = types.nullObject(options);
					return Promise.create(function readFilePromise(resolve, reject) {
						if (types.isString(url)) {
							url = _shared.urlParser(url, options.parseOptions);
						};
						root.DD_ASSERT && root.DD_ASSERT(url instanceof files.Url, "Invalid url.");
						var async = options.async,
							encoding = options.encoding;
						if (encoding === 'iso-8859') {
							// Fix for some browsers
							encoding = 'iso-8859-1';
						} else if (encoding === 'utf8') {
							// Fix
							encoding = 'utf-8';
						};
						if (async && _shared.Natives.windowFetch && _shared.Natives.windowHeaders && _shared.Natives.windowFileReader) {
							url = url.toString({
								noEscapes: true,
							});
							var headers = new _shared.Natives.windowHeaders(options.headers);
							if (!headers.has('Accept')) {
								if (encoding) {
									headers.set('Accept', 'text/plain');
								} else {
									headers.set('Accept', '*/*');
								};
							};
							var init = {
								method: 'GET',
								headers: headers,
							};
							if (!options.enableCache) {
								init.cache = 'no-cache';
							};
							if (options.enableCookies) {
								// http://stackoverflow.com/questions/30013131/how-do-i-use-window-fetch-with-httponly-cookies
								init.credentials = 'include';
							};
							_shared.Natives.windowFetch.call(global, url, init).then(function(response) {
								if (response.ok || types.HttpStatus.isSuccessful(response.status)) {
									return response.blob().then(function(blob) {
										var reader = new _shared.Natives.windowFileReader();
										reader.onloadend = function(ev) {
											if (reader.error) {
												reject(reader.error);
											} else {
												resolve(reader.result);
											};
										};
										if (encoding) {
											reader.readAsText(blob, encoding);
										} else {
											reader.readAsArrayBuffer(blob);
										};
									});
								} else {
									reject(new types.HttpError(response.status, response.statusText));
								};
							});
						} else {
							var xhr = new _shared.Natives.windowXMLHttpRequest();
							if (!('response' in xhr) && !('responseBody' in xhr)) {
								throw new types.NotSupported("Incompatible browser.");
							};
							var rootUrl = tools.getCurrentLocation();
							var args = url.args;
							if ((rootUrl.protocol !== 'file') && !options.enableCache) {
								args = url.args.set('XHR_DISABLE_CACHE', tools.generateUUID(), true);
							};
							url = url.toString({
								args: args,
								noEscapes: true,
							});
							var state = {
								timeoutId: null,
								ready: false,
							};
							xhr.open('GET', url, async);
							var headers = options.headers;
							if (headers) {
								tools.forEach(headers, function(value, name) {
									xhr.setRequestHeader(name, value);
								});
							};
							if (encoding) {
								if ('overrideMimeType' in xhr) { // IE 11+ and other browsers
									xhr.overrideMimeType(types.getIn(options, 'contentType', 'text/plain') + '; charset=' + encoding);
								} else {
									xhr.setRequestHeader('Accept', types.getIn(options, 'contentType', 'text/plain'));
									//xhr.setRequestHeader('Accept-Charset', encoding); // <<<< Refused ?????
								};
							} else {
								xhr.setRequestHeader('Accept', types.getIn(options, 'contentType', '*/*'));
							};
							if ('responseType' in xhr) { // IE 10+ and other browsera
								xhr.responseType = (encoding ? 'text' : 'blob');
							};
							var loadEv = (('onload' in xhr) ? 'load' : 'readystatechange');
							client.addListener(xhr, loadEv, function(ev) {
								if ((loadEv !== 'readystatechange') || ((xhr.readyState === 4) && types.HttpStatus.isSuccessful(xhr.status))) {
									if (state.timeoutId) {
										clearTimeout(state.timeoutId);
										state.timeoutId = null;
									};
									if (!this.ready) {
										this.ready = true;
										resolve(
											('response' in xhr) ?
												xhr.response  // IE 10+ and other browsers
											:
												(encoding ? xhr.responseText : xhr.responseBody) // IE 7-9
										);
									};
								};
							});
							var handleError = function(ex) {
								if (state.timeoutId) {
									clearTimeout(state.timeoutId);
									state.timeoutId = null;
								};
								if (!state.ready) {
									state.ready = true;
									reject(ex);
								};
							};
							client.addListener(xhr, 'error', function(ev) {
								handleError(new types.HttpError(xhr.status, xhr.statusText));
							});
							var timeout = options.timeout || 5000;  // Don't allow "0" (for infinite)
							if ('timeout' in xhr) {
								xhr.timeout = timeout;
							} else {
								state.timeoutId = setTimeout(function(ev) {
									state.timeoutId = null;
									if (!state.ready) {
										xhr.abort();
										handleError(new types.TimeoutError("Request has timed out."));
									};
								}, timeout);
							};
							try {
								xhr.send();
							} catch(ex) {
								if (!state.ready) {
									handleError(ex);
								};
							};
						};
					});
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
								eventCallback: {
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
				, function watch(url, eventCallback, /*optional*/options) {
					// Do nothing
				}));

				//===================================
				// Misc functions
				//===================================

				tools.ADD('generateUUID', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'string',
							description: "Generates and returns a UUID.",
					}
					//! END_REPLACE()
					, function generateUUID() {
						if (__Internal__.nodeUUID) {
							return __Internal__.nodeUUID();
						} else {
							// Source: https://gist.github.com/LeverOne
							var a, b;
							for (b = a = ''; a++ < 36; b += a * 51 & 52 ? (a^15 ? 8^_shared.Natives.mathRandom() * (a^20 ? 16 : 4) : 4).toString(16) : '-');
							return b
						};
					})
				);

				//===================================
				// Init
				//===================================
				return function init(/*optional*/options) {
					// <PRB> The "uuid" npm module is specificaly designed for browserify.
					try {
						__Internal__.nodeUUID = global.require('uuid');
					} catch(o) {
					};

					try {
						types.getPromise();
					} catch(ex) {
						var Promise = 
							(types.isObject(global.RSVP) && global.RSVP.Promise) || // tiny Promise/A+ implementation
							(types.isObject(global.ES6Promise) && global.ES6Promise.Promise); // subset of RSVP
						if (types.isFunction(Promise)) {
							types.setPromise(Promise);
						};
					};
				};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()