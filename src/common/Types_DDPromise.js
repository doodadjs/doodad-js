//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Types_DDPromise.js - DDPromise type (extension to ES6 Promise)
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
		DD_MODULES['Doodad.Types/DDPromise'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			dependencies: ['Doodad.Tools'],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools;
				
				//===================================
				// Internal
				//===================================
				
				var __Internal__ = {
					Promise: null,
					symbolIsExtendedPromise: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('IsPromiseExtended')), true) */ '__DD_IS_PROMISE_EXTENDED__' /*! END_REPLACE() */, true),
				};

				
				//===================================
				// Native functions
				//===================================
					
				// NOTE: Makes use of "isNativeFunction" to get rid of third-parties injections as possible.
				// NOTE: Store everything because third-parties can override them.
				
				types.complete(_shared.Natives, {
					windowPromise: (types.isFunction(global.Promise) ? global.Promise : undefined),
					windowArray: global.Array,
					arraySliceCall: global.Array.prototype.slice.call.bind(global.Array.prototype.slice),
				});
				
				//=================================
				// DDPromise
				//=================================

				// To allow extending "isPromise".
				_shared.IsPromiseSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('IsPromise')), true) */ '__DD_IS_PROMISE__' /*! END_REPLACE() */, true);

				types.ADD('isPromise', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 3,
							params: {
								obj: {
									type: 'object',
									optional: false,
									description: "An object to test for.",
								},
							},
							returns: 'bool',
							description: "Returns 'true' if object is a Promise, 'false' otherwise.",
					}
					//! END_REPLACE()
					, function isPromise(obj) {
						return types._instanceof(obj, [__Internal__.Promise, _shared.Natives.windowPromise]) || (types.getIn(obj, _shared.IsPromiseSymbol, false) === true);
					}));
				
				types.ADD('getPromise', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 0,
							params: null,
							returns: 'Promise',
							description: "Returns the ES6 Promise class or a polyfill.",
					}
					//! END_REPLACE()
					, function getPromise() {
						var Promise = __Internal__.Promise;
						if (!Promise) {
							throw new types.NotSupported("ES6 Promises are not supported. You must include the polyfill 'es6-promise' or 'rsvp' in your project. You can also use another polyfill (see 'types.setPromise').");
						};
						return Promise;
					}));

				__Internal__.addPromiseBluebirdPolyfills = function addPromiseBluebirdPolyfills(Promise) {
					// <PRB> Doing ".then(samefn).catch(samefn)" or ".then(samefn, samefn)" is very annoying.
					// Bluebird "asCallback" polyfill. NOTE: "spread" option has not been implemented.
					if (!types.isFunction(Promise.prototype.asCallback) && !types.isFunction(Promise.prototype.nodeify)) {
						Promise.prototype.nodeify = Promise.prototype.asCallback = function asCallback(callback) {
							var promise = this.then(function(result) {
									var retval = callback(null, result);
									if (retval === undefined) {
										retval = result;
									};
									return retval;
								}, function(err) {
									var retval = callback(err, undefined);
									return retval;
								});
							return promise;
						};
					} else if (!types.isFunction(Promise.prototype.asCallback)) {
						Promise.prototype.asCallback = Promise.prototype.nodeify;
					} else if (!types.isFunction(Promise.prototype.nodeify)) {
						Promise.prototype.nodeify = Promise.prototype.asCallback;
					};
					
					
					// Bluebird "finally" polyfill
					if (!types.isFunction(Promise.prototype['finally'])) {
						Promise.prototype['finally'] = function _finally(callback) {
							var Promise = this.constructor;
							var promise = this.then(function(result) {
									return Promise.resolve(callback()).then(function() {
										return result;
									});
								}, function(err) {
									return Promise.resolve(callback()).then(function() {
										throw err;
									});
								});
							return promise;
						};
					};
					
					
					// Bluebird "try" polyfill
					if (!types.isFunction(Promise['try'])) {
						Promise['try'] = function _try(callback) {
							return new this(function(resolve, reject) {
								try {
									resolve(callback());
								} catch(ex) {
									reject(ex);
								};
							});
						};
					};

					// Bluebird "map" polyfill
					if (!types.isFunction(Promise.map)) {
						Promise.map = function _map(ar, fn, /*optional*/options) {
							var Promise = this;

							return Promise.try(function tryMap() {
								var len = ar.length;

								options = types.nullObject({
									concurrency: Infinity,
								}, options);
							
								if ((len <= 0) || (options.concurrency <= 0)) {
									return [];
								};

								if (options.concurrency >= len) {
									return Promise.all(tools.map(ar, function _mapFn(val, key, obj) {
										return Promise.resolve(fn.call(undefined, val, key, obj));
									}));
								} else {
									var result = _shared.Natives.windowArray(len);
									var state = {start: 0};
									var mapFn = function _mapFn(val, key, obj) {
										state.start++;
										return Promise.resolve(fn.call(undefined, val, key, obj))
											.then(function(res) {
												result[key] = res;
												var pos = state.start;
												if (pos < len) {
													return mapFn(obj[pos], pos, obj);
												};
											});
									};
									if (options.concurrency > 1) {
										return Promise.all(tools.map(ar, mapFn, null, 0, options.concurrency))
											.then(function() {
												return result;
											});
									} else {
										return mapFn(ar[0], 0, ar)
											.then(function() {
												return result;
											});
									};
								};
							});
						};
					};
				};

				__Internal__.addPromiseDoodadExtensions = function addPromiseDoodadExtensions(Promise) {
					function getPromiseName(callback) {
						var original;
						while (original = types.get(callback, _shared.OriginalValueSymbol)) {
							callback = original;
						};
						return types.get(callback, _shared.NameSymbol) || types.getFunctionName(callback);
					};

					// Add "thisObj" argument
					// Add promise name
					Promise.create = function create(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						var promise = new this(callback);
						if (callback) {
							promise[_shared.NameSymbol] = getPromiseName(callback);
						};
						return promise;
					};

					// Add "thisObj" argument
					// Add promise name
					var oldTry = Promise['try'];
					Promise['try'] = function _try(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						var promise = oldTry.call(this, callback);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = getPromiseName(callback);
						};
						return promise;
					};
					
					// Add "thisObj" argument
					// Add promise name
					var oldMap = Promise.map;
					Promise.map = function _map(ar, callback, /*optional*/options) {
						var thisObj = types.get(options, 'thisObj');
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						var promise = oldMap.call(this, ar, callback, options);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = getPromiseName(callback);
						};
						return promise;
					};

					// Add "thisObj" argument
					// Add promise name
					var oldThen = Promise.prototype.then;
					Promise.prototype.then = function then(/*optional*/resolvedCb, /*optional*/rejectedCb, /*optional*/thisObj) {
						if (!thisObj && !types.isFunction(rejectedCb)) {
							thisObj = rejectedCb;
							rejectedCb = null;
						};
						if (resolvedCb && thisObj) {
							resolvedCb = _shared.PromiseCallback(thisObj, resolvedCb);
						};
						if (rejectedCb && thisObj) {
							rejectedCb = _shared.PromiseCallback(thisObj, rejectedCb);
						};
						var promise = oldThen.call(this, resolvedCb, rejectedCb);
						if (resolvedCb) {
							resolvedCb.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(resolvedCb);
						} else if (rejectedCb) {
							rejectedCb.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(rejectedCb);
						} else {
							promise[_shared.NameSymbol] = this[_shared.NameSymbol];
						};
						return promise;
					};
					
					// Add "thisObj" argument
					// Add promise name
					// Add Bluebird polyfill for catch (must be done there).
					// NOTE: Bluebird's "catch" has additional arguments (filters) compared to ES6
					// NOTE: Bluebird's filters will get replaced by Doodad's ones (no way to add Doodad's extensions otherwise)
					var oldCatch = Promise.prototype['catch'];
					Promise.prototype['catch'] = function _catch(/*[optional paramarray]filters, [optional]callback, [optional]thisObj*/) {
						var filters = null;
						var i = 0;
						forEachArgument: for (; i < arguments.length; i++) {
							var filter = arguments[i];
							if (!types.isErrorType(filter) && !types.isJsObject(filter)) {
								if (i > 0) {
									filters = _shared.Natives.arraySliceCall(arguments, 0, i);
								};
								break forEachArgument;
							};
						};
						var callback = arguments[i++];
						var thisObj = arguments[i++];
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						var promise;
						if (filters) {
							// Usage: .catch(IOError, NetworkError, {code: 'ENOENTITY'}, ..., function(err){...}, this)
							promise = oldCatch.call(this, function filterCatch(ex) {
								var ok = false;
								forEachType: for (var i = 0; i < filters.length; i++) {
									var type = filters[i];
									if (types.isFunction(type)) { // isErrorType
										if (types._instanceof(ex, type)) {
											ok = true;
											break forEachType;
										};
									} else { // isJsObject
										ok = true;
										var keys = types.keys(type);
										forEachKey: for (var j = 0; j < keys.length; j++) {
											var key = keys[j];
											if (ex[key] !== type[key]) {
												ok = false;
												break forEachKey;
											};
										};
										if (ok) {
											break forEachType;
										};
									};
								};
								if (ok) {
									return callback(ex);
								} else {
									throw ex;
								};
							});
						} else {
							promise = oldCatch.call(this, callback);
						};
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(callback);
						} else {
							promise[_shared.NameSymbol] = this[_shared.NameSymbol];
						};
						return promise;
					};
					
					// Add "thisObj" argument
					// Add promise name
					var oldAsCallback = Promise.prototype.asCallback;
					Promise.prototype.asCallback = Promise.prototype.nodeify = function asCallback(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						var promise = oldAsCallback.call(this, callback);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(callback);
						} else {
							promise[_shared.NameSymbol] = this[_shared.NameSymbol];
						};
						return promise;
					};
					
					// Add "thisObj" argument
					// Add promise name
					var oldFinally = Promise.prototype['finally'];
					Promise.prototype['finally'] = function _finally(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						var promise = oldFinally.call(this, callback);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = this[_shared.NameSymbol] || getPromiseName(callback);
						} else {
							promise[_shared.NameSymbol] = this[_shared.NameSymbol];
						};
						return promise;
					};

					// Combines "then" and "create"
					Promise.prototype.thenCreate = function _thenCreate(callback, /*optional*/thisObj) {
						var Promise = this.constructor;
						return this.then(function(result) {
							return Promise.create(function(resolve, reject) {
								return callback.call(thisObj, result, resolve, reject);
							}, thisObj);
						}, null, thisObj);
					};
				};
				
				types.ADD('setPromise', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 5,
							params: {
								Promise: {
									type: 'Promise',
									optional: false,
									description: "A Promise polyfill.",
								},
							},
							returns: 'Promise',
							description: "Sets a custom polyfill for ES6 Promises.",
					}
					//! END_REPLACE()
					, function setPromise(Promise) {
						if (!types.isFunction(Promise)) {
							throw new types.TypeError("Invalid 'Promise' constructor.");
						};

						if (Promise === __Internal__.Promise) {
							// Already set
							return Promise;
						};

						if (Promise[__Internal__.symbolIsExtendedPromise]) {
							// Already extended.
							__Internal__.Promise = Promise;
							return Promise;
						};

						// Make some tests...
						if (
								!types.isFunction(Promise) || 
								!types.isFunction(Promise.resolve) || 
								!types.isFunction(Promise.reject) || 
								!types.isFunction(Promise.all) ||
								!types.isFunction(Promise.race) ||
								!types.isFunction(Promise.prototype.then) ||
								!types.isFunction(Promise.prototype['catch'])
						) {
							throw new types.TypeError("Invalid 'Promise' polyfill. It must implement: 'resolve', 'reject', 'all', 'race', 'prototype.then' and 'prototype.catch'.");
						};
						
						var DDPromise = null;
						if (types.isNativeFunction(Promise)) {
							if (types.supportsES6Classes()) {
								// NOTE: That's the only way to inherit ES6 Promise... Using the prototypes way will throw "... is not a promise" !!!
								DDPromise = types.eval("class DDPromise extends ctx.Promise {}", {Promise: Promise});
							} else {
								DDPromise = Promise;
							};
						} else {
							var DDPromise = function() {};
							DDPromise = types.setPrototypeOf(DDPromise, Promise);
							DDPromise.prototype = types.createObject(Promise.prototype, {
								constructor: {value: DDPromise},
							});
						};

						var isStillDDPromise = false;
						try {
							isStillDDPromise = (DDPromise.resolve(0).then(function() {})['catch'](function() {}) instanceof DDPromise);
						} catch(ex) {
						};

						if (!isStillDDPromise) {
							// Inheriting Promise is not supported !!!
							DDPromise = Promise;
						};

						__Internal__.addPromiseBluebirdPolyfills(DDPromise);
						__Internal__.addPromiseDoodadExtensions(DDPromise);

						_shared.setAttribute(DDPromise, __Internal__.symbolIsExtendedPromise, true, {});

						__Internal__.Promise = DDPromise;
						return DDPromise;
					}));
				
				_shared.PromiseCallback = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 5,
							params: {
								obj: {
									type: 'object,Object',
									optional: true,
									description: "Object to bind with the callback function.",
								},
								fn: {
									type: 'function',
									optional: false,
									description: "Callback function.",
								},
								secret: {
									type: 'any',
									optional: true,
									description: "Secret.",
								},
							},
							returns: 'function',
							description: "Creates a callback handler for DDPromise.",
					}
					//! END_REPLACE()
					, types.setPrototypeOf(function PromiseCallback(/*optional*/obj, fn, /*optional*/secret) {
						// IMPORTANT: No error should popup from a callback, excepted "ScriptAbortedError".
						var attr;
						if (types.isString(fn) || types.isSymbol(fn)) {
							attr = fn;
							fn = obj[attr];
						};
						if (types.isNothing(obj) && types.isCallback(fn)) {
							return fn;
						};
						fn = types.unbind(fn);
						root.DD_ASSERT && root.DD_ASSERT(types.isBindable(fn), "Invalid function.");
						var insideFn = _shared.makeInside(obj, fn, secret);
						var type = types.getType(obj);
						var callback = function callbackHandler(/*paramarray*/) {
							if (type && !types.isInitialized(obj)) {
								throw new types.NotAvailable("Object has been destroyed.");
							} else {
								try {
									return insideFn.apply(obj, arguments);
								} catch(ex) {
									if (ex.bubble) {
										throw ex;
									} else {
										if (!ex.trapped) {
											ex.trapped = true;
											try {
												var tools = root.Doodad.Tools;
												tools.log(tools.LogLevels.Error, "The Promise '~0~' has been rejected due to an unhandled error.", [(types.get(callback.promise, _shared.NameSymbol) || '<anonymous>')]);
												if (ex.stack) {
													tools.log(tools.LogLevels.Error, ex.stack);
												} else {
													tools.log(tools.LogLevels.Error, ex);
												};
												//tools.log(tools.LogLevels.Debug, fn.toString().slice(0, 500));
											} catch(o) {
											};
										};
										throw ex;
									};
								};
							};
						};
						callback = types.setPrototypeOf(callback, _shared.PromiseCallback);
						callback[_shared.BoundObjectSymbol] = obj;
						callback[_shared.OriginalValueSymbol] = fn;
						callback.promise = null; // will be provided later
						return callback;
					}, types.Callback));
				
					

				//===================================
				// Init
				//===================================
				return function init(/*optional*/options) {
					if (_shared.Natives.windowPromise) {
						try {
							types.setPromise(_shared.Natives.windowPromise);
						} catch(ex) {
						};
					};
				};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()