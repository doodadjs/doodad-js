//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n")
// dOOdad - Object-oriented programming framework
// File: Client.js - Client functions
// Project home: https://sourceforge.net/projects/doodad-js/
// Trunk: svn checkout svn://svn.code.sf.net/p/doodad-js/code/trunk doodad-js-code
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

(function() {
	var global = this;

	var exports = {};
	if (typeof process === 'object') {
		module.exports = exports;
	};
	
	exports.add = function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Client'] = {
			type: null,
			version: '1.1r',
			namespaces: null,
			dependencies: ['Doodad.Types', 'Doodad.Tools', 'Doodad'],
			bootstrap: true,
			exports: exports,
			
			create: function create(root, /*optional*/_options) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					config = tools.Config,
					files = tools.Files,
					client = doodad.Client,
					extenders = doodad.Extenders,
					mixIns = doodad.MixIns;


				var __Internal__ = {
					loadedScripts: {},   // <FUTURE> global to every thread
					
					oldSetOptions: null,
				};

				
				__Internal__.oldSetOptions = client.setOptions;
				client.setOptions = function setOptions(/*paramarray*/) {
					var options = __Internal__.oldSetOptions.apply(this, arguments),
						settings = types.getDefault(options, 'settings', {});
						
					settings.enableDomObjectsModel = types.toBoolean(types.get(settings, 'enableDomObjectsModel'));
					settings.defaultScriptTimeout = parseInt(types.get(settings, 'defaultScriptTimeout'));
				};
				
				client.setOptions({
					settings: {
						enableDomObjectsModel: false,	// "true" uses "instanceof" with DOM objects. "false" uses old "nodeType" and "nodeString" attributes.
						defaultScriptTimeout: 3000,		// milliseconds
					},
				}, _options);

					
				var __Natives__ = {
					windowObject: global.Object,

					// DOM
					documentHasParentWindow: (!!global.document && (global.document.parentWindow === global)),
					windowWindow: (types.isNativeFunction(global.Window) ? global.Window : undefined),
					windowNode: (types.isNativeFunction(global.Node) ? global.Node : undefined),
					windowHtmlDocument: (types.isNativeFunction(global.HTMLDocument) ? global.HTMLDocument : undefined),
					windowHtmlElement: (types.isNativeFunction(global.HTMLElement) ? global.HTMLElement : undefined),
					
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
					
					// isEventTarget
					windowEventTarget: (types.isNativeFunction(global.EventTarget) ? global.EventTarget : undefined),
					
					// callAsync
					windowSetTimeout: global.setTimeout,
				};
				
				
				//===================================
				// Events
				//===================================
				
				tools.onscriptinit = null;
				tools.onscriptloading = null;
				tools.onscriptload = null;
				tools.onscripterror = null;


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
								},
								returns: 'undefined',
								description: "Asynchronously calls a function.",
					}
					//! END_REPLACE()
					, function callAsync(fn, /*optional*/delay, /*optional*/thisObj, /*optional*/args) {
						if (types.isNothing(delay)) {
							delay = 1;
						} else {
							delay = Math.max(delay, 1); // can't be less than 1 ms
						};
						if (!types.isNothing(thisObj) || !types.isNothing(args)) {
							fn = types.bind(thisObj, fn, args);
						};
						__Natives__.windowSetTimeout(fn, delay);
					});
				
				//===================================
				// Client functions
				//===================================
				
				client.isWindow = root.DD_DOC(
				//! REPLACE_BY("null")
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
				, (client.getOptions().enableDomObjectsModel && __Natives__.windowWindow ? (function isWindow(obj) {
					// NOTE: This function will get replaced when "NodeJs.js" is loaded.
					// NOTE: Browsers really need to review their objects model.
					if (!obj) {
						return false;
					};
					if (obj === global) {
						return true;
					};
					obj = __Natives__.windowObject(obj);
					var W = obj.Window;
					//SLOWER return types.isNativeFunction(W) && (obj instanceof W);
					return types.isFunction(W) && (obj instanceof W);
				}) : (function isWindow(obj) {
					 return !!obj && (typeof obj === "object") && types.isNativeFunction(obj.setTimeout) && types.isNativeFunction(obj.focus);
				})));

				client.isDocument = root.DD_DOC(
				//! REPLACE_BY("null")
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
				, (client.getOptions().enableDomObjectsModel && __Natives__.documentHasParentWindow && __Natives__.windowHtmlDocument ? (function isDocument(obj) {
					// NOTE: This function will get replaced when "NodeJs.js" is loaded.
					// NOTE: Browsers really need to review their objects model.
					if (!obj) {
						return false;
					};
					if (obj === global.document) {
						return true;
					};
					obj = __Natives__.windowObject(obj);
					var w = obj.parentWindow;
					if (!w) {
						return false;
					};
					if (w === global.window) {
						return (obj instanceof __Natives__.windowHtmlDocument);
					};
					var hd = w.HTMLDocument;
					//SLOWER return types.isNativeFunction(hd) && (obj instanceof hd);
					return types.isFunction(hd) && (obj instanceof hd);
				}) : (function isDocument(obj) {
					 return !!obj && (typeof obj === "object") && (obj.nodeType === 9) && (typeof obj.nodeName === "string");
				})));

				client.isNode = root.DD_DOC(
				//! REPLACE_BY("null")
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
				, (client.getOptions().enableDomObjectsModel && __Natives__.documentHasParentWindow && __Natives__.windowNode ? (function isNode(obj) {
					// NOTE: This function will get replaced when "NodeJs.js" is loaded.
					// NOTE: Browsers really need to review their objects model.
					if (!obj) {
						return false;
					};
					obj = __Natives__.windowObject(obj);
					var d = obj.ownerDocument;
					if (!d) {
						return false;
					};
					var w = d.parentWindow;
					if (!w) {
						return false;
					};
					if (w === global) {
						return (obj instanceof __Natives__.windowNode);
					};
					var n = w.Node;
					//SLOWER return types.isNativeFunction(n) && (obj instanceof n);
					return types.isFunction(n) && (obj instanceof n);
				}) : (function isNode(obj) {
					return !!obj && (typeof obj === "object") && (+obj.nodeType === obj.nodeType) && (typeof obj.nodeName === "string");
				})));

				client.isElement = root.DD_DOC(
				//! REPLACE_BY("null")
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
				, (client.getOptions().enableDomObjectsModel && __Natives__.documentHasParentWindow && __Natives__.windowHtmlElement ? (function isElement(obj) {
					// NOTE: This function will get replaced when "NodeJs.js" is loaded.
					// NOTE: Browsers really need to review their objects model.
					if (!obj) {
						return false;
					};
					obj = __Natives__.windowObject(obj);
					var d = obj.ownerDocument;
					if (!d) {
						return false;
					};
					var w = d.parentWindow;
					if (!w) {
						return false;
					};
					if (w === global) {
						return (obj instanceof __Natives__.windowHtmlElement);
					};
					var he = w.HTMLElement;
					//SLOWER return types.isNativeFunction(he) && (obj instanceof he);
					return types.isFunction(he) && (obj instanceof he);
				}) : (function isElement(obj) {
					 return !!obj && (typeof obj === "object") && (obj.nodeType === 1) && (typeof obj.nodeName === "string");
				})));
				
				
				client.isEventTarget = root.DD_DOC(
				//! REPLACE_BY("null")
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
				, (__Natives__.windowEventTarget ? (function isElement(obj) {
					return (obj instanceof __Natives__.windowEventTarget);
				}) : (function isElement(obj) {
					 return client.isDocument(obj) || client.isElement(obj);
				})));
				
				client.getFirstElement = root.DD_DOC(
				//! REPLACE_BY("null")
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
				});


				//===================================
				// Doodad extension
				//===================================
				
				mixIns.REGISTER(root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: null,
							description: "Class mix-in to implement for JS events.",
				}
				//! END_REPLACE()
				, doodad.MIX_IN(doodad.Class.$extend({
					$TYPE_NAME: "JsEvents",
					
					__JS_EVENTS: doodad.PROTECTED(doodad.READ_ONLY(doodad.NOT_INHERITED(doodad.PRE_EXTEND(doodad.PERSISTENT(doodad.TYPE(doodad.INSTANCE(doodad.ATTRIBUTE([], extenders.UniqueArray, {cloneOnInit: true})))))))),
						
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
				//! REPLACE_BY("null")
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
						
						attach: types.SUPER(function attach(elements, /*optional*/context, /*optional*/useCapture, /*optional*/once) {
							if (!types.isArrayLike(elements)) {
								elements = [elements];
							};
							
							this.detach(elements, useCapture);

							useCapture = !!useCapture;
							
							//var handler	= types.bind(this.obj, this),
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
										ev.getUnified = self.extender.getUnified;
										delete ev.__unified;
										return types.invoke(self.obj, self, [ev, context]);
									};
								};
							};
							
							var eventTypes = this.extender.types,
								eventTypesLen = eventTypes.length;
								
							for (var i = 0; i < eventTypesLen; i++) {
								if (types.hasIndex(eventTypes, i)) {
									var type = eventTypes[i],
										elementsLen = elements.length;
									for (var j = 0; j < elementsLen; j++) {
										if (types.hasIndex(elements, j)) {
											var element = elements[j],
												handler = createHandler(element);
											if (this._super(this.obj, this, null, [useCapture, element, type, handler])) {
												element.addEventListener(type, handler, useCapture);
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
								var evs;
								if (types.isNothing(useCapture)) {
									evs = this._super(this.obj, this);
								} else {
									evs = this._super(this.obj, this, [!!useCapture]);
								};
								var evsLen = evs.length;
								for (var j = 0; j < evsLen; j++) {
									var evData = evs[j][3],
										capture = evData[0],
										element = evData[1],
										type = evData[2],
										handler = evData[3];
									element.removeEventListener(type, handler, capture);
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
									var evs;
									if (types.isNothing(useCapture)) {
										evs = this._super(this.obj, this, [false, elements[i]]);
										types.append(evs, this._super(this.obj, this, [true, elements[i]]));
									} else {
										evs = this._super(this.obj, this, [!!useCapture, elements[i]]);
									};
									var evsLen = evs.length;
									for (var j = 0; j < evsLen; j++) {
										var evData = evs[j][3],
											capture = evData[0],
											element = evData[1],
											type = evData[2],
											handler = evData[3];
										element.removeEventListener(type, handler, capture);
									};
								};
							};
						}),
						clear: function clear() {
							this.detach();
						},
						promise: function promise(elements, /*optional*/context, /*optional*/useCapture) {
							// NOTE: Don't forget that a promise resolves only once, so ".promise" is like ".attachOnce".
							var canReject = this.extender.canReject;
							var self = this;
							var Promise = tools.getPromise();
							return new Promise(function(resolve, reject) {
								self.attachOnce(elements, context, useCapture, function(ev) {
									if (canReject && (ev instanceof doodad.ErrorEvent)) {
										return reject.call(self.obj, ev);
									} else {
										return resolve.call(self.obj, ev);
									};
								});
							});
						},
					}
				)));
				
				extenders.REGISTER(root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: null,
							description: "JS event extender.",
				}
				//! END_REPLACE()
				, extenders.Event.$inherit({
					$TYPE_NAME: "JsEvent",
					
					eventsAttr: '__JS_EVENTS',
					eventsImplementation: 'Doodad.MixIns.JsEvents',
					types: null,
					
					enableScopes: true,
					
					getUnified: function getUnified() {
						if (!this.__unified) {
							var self = this;
							this.__unified = {
								// TODO: Unify event properties between browsers
								which: (types.isNothing(self.which) ? self.keyCode : ((self.which != 0) && (self.charCode != 0) ? self.which : null)),  // source: http://javascript.info/tutorial/keyboard-events
							};
						};
						return this.__unified;
					},
					
					eventProto: doodad.JsEventHandler,
					
					_new: types.SUPER(function _new(/*optional*/options) {
						this._super(options);
						this.types = types.get(options, 'types', this.types);
						return this;
					}),
					getCacheName: types.SUPER(function getCacheName(/*optional*/options) {
						if (types.isNothing(options)) {
							options = {};
						};
						return this._super(options) + 
							',' + tools.unique(types.get(options, 'types', this.types)).sort().join('|');
					}),
					overrideOptions: types.SUPER(function overrideOptions(options, newOptions) {
						this._super(options, newOptions);
						options.types = tools.unique([], newOptions.types, this.types);
						return options;
					}),
				})));

				
				doodad.JS_EVENT = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: null,
							description: "JS event attribute modifier.",
				}
				//! END_REPLACE()
				, function JS_EVENT(eventTypes, /*optional*/fn) {
					if (types.isStringAndNotEmpty(eventTypes)) {
						eventTypes = eventTypes.split(' ');
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
				});
				

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
				, function getOS() {
					// TODO: Complete this function
					// NOTE: This function will get replaced when "NodeJs.js" is loaded.
					// NOTE: Why it's never simple like this ?
					// NOTE: Windows older than Windows NT not supported
					// NOTE: Macintosh older than OS/X not supported
					var type = global.navigator.platform.toLowerCase().slice(0, 3);
					return {
						name: global.navigator.platform,
						type: ((type === 'win') ? 'windows' : ((type === 'lin') ? 'linux' : 'unix')),  // 'windows', 'linux', 'unix'
						//mobile: false, // TODO: "true" for Android, Windows CE, Windows Mobile, iOS, ...
						//architecture: null, // TODO: Detect
						dirChar: ((type === 'win') ? '\\' : '/'),
						newLine: ((type === 'win') ? '\r\n' : '\n'),
						caseSensitive: ((type !== 'win') && (type !== 'mac')), // TODO: Optional in MacOS X, so must detect
						//...
					};
				});

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
					// Source: http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
					var navigator = __Natives__.windowNavigator;
					var tmp = ((navigator.languages && navigator.languages[+alt || 0]) || navigator.language || navigator.userLanguage || 'en_US').replace('-', '_').split('_', 2);
					tmp[1] = tmp[1].toUpperCase();
					return tmp.join('_');
				});
				
				//===================================
				// Location functions
				//===================================
				
				types.PageMovedError = root.DD_DOC(
				//! REPLACE_BY("null")
				{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'error',
							description: "Signals that the current location has been moved to another one.",
				}
				//! END_REPLACE()
				, types.createErrorType("PageMovedError", types.ScriptAbortedError, function _new() {
					return global.Error.call(this, "Page moved.");
				}));

				tools.getCurrentLocation = root.DD_DOC(
				//! REPLACE_BY("null")
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
					return tools.Url.parse(_window.location.href);
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
						root.DD_ASSERT(types.isStringAndNotEmpty(url) || (url instanceof tools.Url), "Invalid url.");
						root.DD_ASSERT(types.isNothing(_window) || client.isWindow(_window), "Invalid window object.");
					};
					
					if (!(url instanceof tools.Url)) {
						url = tools.Url.parse(url);
					};
					
					if (!_window) {
						_window = global.window;
					};

					var result = url.compare(_window.location.href);
					if (!noReload && (result === 0)) {
						_window.location.reload();
					} else {
						_window.location.href = url.toString();
					};
					
					if (!dontAbort) {
						throw new types.PageMovedError();
					};
				});
				
				//===================================
				// Script loader functions
				//===================================

				// NOTE: These functions will get replaced when "NodeJs.js" is loaded.
				
				__Internal__.ScriptLoader = types.CustomEventTarget.$inherit(
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
						
						_new: types.SUPER(function _new(tag, target, /*optional*/timeout) {
							if (root.DD_ASSERT) {
								root.DD_ASSERT(types.isStringAndNotEmpty(tag), "Invalid tag.");
								root.DD_ASSERT(client.isElement(target), "Invalid target.");
							};
							this._super();
							this.tag = tag;
							this.target = target;
							if (types.isNothing(timeout)) {
								this.timeout = client.getOptions().settings.defaultScriptTimeout;
							} else {
								this.timeout = timeout;
							};
						}),
						
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
								this.dispatchEvent(new types.CustomEvent('error'));
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
								this.element.addEventListener(this.loadEv, function scriptOnSuccess(ev) {
									return self.__handleSuccess(ev);
								});
								
								// NOTE: IE and Safari: "onerror" doesn't raise, so we can't know if there was an error
								this.element.addEventListener('error', function scriptOnError(ev) {
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
										url = tools.Url.parse(url);
									};
									if (url) {
										var waitDownload = this.target.ownerDocument.createElement('img');
										waitDownload.addEventListener('error', function handleWaitDownload(ev) {
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
				);
				
				
				tools.getJsScriptFileLoader = root.DD_DOC(
				//! REPLACE_BY("null")
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
					
					if (url instanceof tools.Path) {
						url = tools.Url.parse(url);
					};
					
					if (url instanceof tools.Url) {
						url = url.toString();
					};
					
					root.DD_ASSERT && root.DD_ASSERT(types.isString(url), "Invalid url.");
					
					if (types.hasKey(__Internal__.loadedScripts, url)) {
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
				});
				
				tools.getJsScriptBlockLoader = root.DD_DOC(
				//! REPLACE_BY("null")
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
						if (async && __Natives__.windowBlob && __Natives__.windowURL) {
							// Firefox
							this.element.src = __Natives__.windowURL.createObjectURL(new __Natives__.windowBlob(script));
						} else {
							if (_document.createCDATASection) {
								this.element.appendChild(_document.createCDATASection(script));
							} else {
								this.element.innerHTML = script;
							};
						};
					});
					
					return loader;
				});
				
				tools.getCssScriptFileLoader = root.DD_DOC(
				//! REPLACE_BY("null")
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

					if (url instanceof tools.Path) {
						url = tools.Url.parse(url);
					};
					
					if (url instanceof tools.Url) {
						url = url.toString();
					};
					
					root.DD_ASSERT && root.DD_ASSERT(types.isString(url), "Invalid url.");
					
					var loader = null;
					if (types.hasKey(__Internal__.loadedScripts, url)) {
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
				});

				tools.getCssScriptBlockLoader = root.DD_DOC(
				//! REPLACE_BY("null")
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
					
					if (async && __Natives__.windowBlob && global.URL) {
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
				});

				//===================================
				// Config
				//===================================
				
				__Internal__.oldConfigLoadFile = config.loadFile;
				
				config.loadFile = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 0,
							params: {
								url: {
									type: 'string,Url,Path',
									optional: false,
									description: "File location.",
								},
								options: {
									type: 'object',
									optional: true,
									description: "Options.",
								},
								callbacks: {
									type: 'arrayof(function),function',
									optional: false,
									description: 
										"Callback functions. Arguments are :\n" +
										"  ex (error): Exception object, when an error has occurred\n" +
										"  data (any): Parsed file content, when successful\n",
								},
							},
							returns: 'Promise',
							description: "Loads a configuration file written with JSON and pass its content to the callback functions, then resolve a Promise with the final value.\n" +
										"When the option 'watch' is set to 'true', the file is read again and callbacks called again when the file is modified.\n" +
										"If 'loadFile' is called more than once with the same file, callbacks are chained.\n" +
										"You can set the option 'force' to force the file to be read again.",
					}
					//! END_REPLACE()
					, function loadFile(url, /*optional*/options, /*optional*/callbacks) {
						if (types.isString(url)) {
							url = tools.getOptions().hooks.urlParser(url, types.get(options, 'parseOptions'));
						};
						return __Internal__.oldConfigLoadFile(url, options, callbacks);
					});


				//===================================
				// File functions
				//===================================
				
				files.readFile = root.DD_DOC(
				//! REPLACE_BY("null")
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
					var Promise = tools.getPromise();
					return new Promise(function(resolve, reject) {
						if (types.isString(url)) {
							url = tools.getOptions().hooks.urlParser(url, types.get(options, 'parseOptions'));
						};
						root.DD_ASSERT && root.DD_ASSERT(url instanceof tools.Url, "Invalid url.");
						var async = types.get(options, 'async', false),
							encoding = types.get(options, 'encoding', null);
						if (encoding === 'iso-8859') {
							// Fix for some browsers
							encoding = 'iso-8859-1';
						} else if (encoding === 'utf8') {
							// Fix for IE
							encoding = 'utf-8';
						};
						if (async && __Natives__.windowFetch && __Natives__.windowHeaders && __Natives__.windowFileReader) {
							url = url.toString({
								noEscapes: true,
							});
							var headers = new __Natives__.windowHeaders(types.get(options, 'headers'));
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
							if (!types.get(options, 'enableCache', false)) {
								init.cache = 'no-cache';
							};
							if (types.get(options, 'enableCookies', false)) {
								// http://stackoverflow.com/questions/30013131/how-do-i-use-window-fetch-with-httponly-cookies
								init.credentials = 'include';
							};
							__Natives__.windowFetch.call(global, url, init).then(function(response) {
								if (response.ok || types.HttpStatus.isSuccessful(response.status)) {
									return response.blob().then(function(blob) {
										var reader = new __Natives__.windowFileReader();
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
							var xhr = new XMLHttpRequest();
							if (!('response' in xhr) && !('responseBody' in xhr)) {
								throw new types.NotSupported("Incompatible browser.");
							};
							var rootUrl = tools.getCurrentLocation();
							var args = url.args;
							if ((rootUrl.protocol !== 'file') && !types.get(options, 'enableCache', false)) {
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
							var headers = types.get(options, 'headers');
							if (headers) {
								tools.forEach(headers, function(value, name) {
									xhr.setRequestHeader(name, value);
								});
							};
							if (encoding) {
								if ('overrideMimeType' in xhr) { // IE 11+ and other browsers
									xhr.overrideMimeType(types.get(options, 'contentType', 'text/plain') + '; charset=' + encoding);
								} else {
									xhr.setRequestHeader('Accept', types.get(options, 'contentType', 'text/plain'));
									//xhr.setRequestHeader('Accept-Charset', encoding); // <<<< Refused ?????
								};
							} else {
								xhr.setRequestHeader('Accept', types.get(options, 'contentType', '*/*'));
							};
							if ('responseType' in xhr) { // IE 10+ and other browsera
								xhr.responseType = (encoding ? 'text' : 'blob');
							};
							var loadEv = (('onload' in xhr) ? 'load' : 'readystatechange');
							xhr.addEventListener(loadEv, function(ev) {
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
							xhr.addEventListener('error', function(ev) {
								handleError(new types.HttpError(xhr.status, xhr.statusText));
							});
							var timeout = types.get(options, 'timeout', 0) || 5000;  // Don't allow "0" (for infinite)
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
				});
				
				files.watch = root.DD_DOC(
				//! REPLACE_BY("null")
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
				});

				
				//===================================
				// Init
				//===================================
				return function init(/*optional*/options) {
					try {
						tools.getPromise();
					} catch(ex) {
						var Promise = 
							(types.isObject(global.RSVP) && global.RSVP.Promise) || // tiny Promise/A+ implementation
							(types.isObject(global.ES6Promise) && global.ES6Promise.Promise); // subset of RSVP
						if (types.isFunction(Promise)) {
							tools.setPromise(Promise);
						};
					};
				};
			},
		};
		
		return DD_MODULES;
	};
	
	if (typeof process !== 'object') {
		// <PRB> export/import are not yet supported in browsers
		global.DD_MODULES = exports.add(global.DD_MODULES);
	};
}).call((typeof global !== 'undefined') ? global : ((typeof window !== 'undefined') ? window : this));