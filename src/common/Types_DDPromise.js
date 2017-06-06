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

				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools;
				
				//===================================
				// Internal
				//===================================
				
				const __Internal__ = {
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
						const Promise = __Internal__.Promise;
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
							const promise = this.then(function _then(result) {
									let retval = callback(null, result);
									if (retval === undefined) {
										retval = result;
									};
									return retval;
								}, function(err) {
									const retval = callback(err, undefined);
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
					if (!types.isFunction(Promise.prototype.finally)) {
						Promise.prototype.finally = function _finally(callback) {
							const Promise = this.constructor;
							const promise = this.then(function(result) {
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
					if (!types.isFunction(Promise.try)) {
						Promise.try = function _try(callback) {
							const Promise = this;
							return new Promise(function _try(resolve, reject) {
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
							const Promise = this;

							return Promise.try(function tryMap() {
								const len = ar.length | 0;

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
									const result = _shared.Natives.windowArray(len);
									const state = {start: 0};
									const mapFn = function _mapFn(val, key, obj) {
										state.start++;
										return Promise.resolve(fn.call(undefined, val, key, obj))
											.then(function(res) {
												result[key] = res;
												const pos = state.start;
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
						let original;
						while (original = types.get(callback, _shared.OriginalValueSymbol)) {
							callback = original;
						};
						return types.get(callback, _shared.NameSymbol) || types.getFunctionName(callback);
					};

					// Add "thisObj" argument
					// Add promise name
					Promise.create = function create(/*optional*/callback, /*optional*/thisObj) {
						const Promise = this;
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						const promise = new Promise(callback);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = getPromiseName(callback);
						};
						return promise;
					};

					// NOTE: Experimental
					Promise.createRacer = function createRacer() {
						const Promise = this,
							state = {res: null, rej: null};
						const racer = Promise.create(function Racer(res, rej) {
							state.res = res;
							state.rej = rej;
						});
						racer.resolve = function resolve(value) {
							const res = state.res;
							if (!res) {
								throw new types.Error("Racer has already been resolved or rejected.");
							};
							state.res = null;
							state.rej = null;
							res(value);
						};
						racer.reject = function reject(err) {
							const rej = state.rej;
							if (!rej) {
								throw new types.Error("Racer has already been resolved or rejected.");
							};
							state.res = null;
							state.rej = null;
							rej(err);
						};
						racer.race = function race(promise) {
							if (types.isNothing(promise)) {
								return this;
							};
							let promises;
							if (types.isArrayLike(promise)) {
								promises = types.append([this], promise);
							} else {
								promises = [this, promise];
							}
							return Promise.race(promises);
						};
						// TODO: Try to implement in DDPromise.prototype instead.
						racer.isSolved = function() {
							return !state.res || !state.rej;
						};
						return racer;
					};

					// Add "thisObj" argument
					// Add promise name
					const oldTry = Promise.try;
					Promise.try = function _try(/*optional*/callback, /*optional*/thisObj) {
						const Promise = this;
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						const promise = oldTry.call(Promise, callback);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = getPromiseName(callback);
						};
						return promise;
					};
					
					// Add "thisObj" argument
					// Add promise name
					const oldMap = Promise.map;
					Promise.map = function _map(ar, callback, /*optional*/options) {
						const Promise = this,
							thisObj = types.get(options, 'thisObj');
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						const promise = oldMap.call(Promise, ar, callback, options);
						if (callback) {
							callback.promise = promise;
							promise[_shared.NameSymbol] = getPromiseName(callback);
						};
						return promise;
					};

					// NOTE: Experimental
					Promise.any = function _any(ar, /*optional*/options) {
						const Promise = this;
						return Promise.create(function(resolve, reject) {
							const includeErrors = types.get(options, 'includeErrors', false);
							const count = ar.length | 0;
							if (count <= 0) {
								resolve([]);
							} else {
								const result = _shared.Natives.windowArray(count);
								let successes = 0;
								let errors = 0;
								let firstError = null;
								const check = function _check() {
									if (!includeErrors && (errors >= count)) {
										reject(firstError);
									} else if (successes + errors >= count) {
										resolve(result);
									};
								};
								for (let i = 0; i < count; i++) {
									// NOTE: Same behavior than Promise.all : Empty slots and non-promise values are included.
									Promise.resolve(ar[i]).then(function(value) {
											successes++;
											result[i] = value;
											check();
										})
										.catch(function(err) {
											if (errors <= 0) {
												firstError = err;
											};
											errors++;
											if (includeErrors) {
												result[i] = err;
											};
											check();
										})
										.catch(function(err) {
											reject(err);
										});
								};
							};
						});
					};

					// Add "thisObj" argument
					// Add promise name
					const oldThen = Promise.prototype.then;
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
						const promise = oldThen.call(this, resolvedCb, rejectedCb);
						let name = this[_shared.NameSymbol];
						if (resolvedCb) {
							resolvedCb.promise = promise;
							if (!name) {
								name = getPromiseName(resolvedCb);
							};
						};
						if (rejectedCb) {
							rejectedCb.promise = promise;
							if (!name) {
								name = getPromiseName(rejectedCb);
							};
						};
						promise[_shared.NameSymbol] = name;
						return promise;
					};
					
					// Add "thisObj" argument
					// Add promise name
					// Add Bluebird polyfill for catch (must be done there).
					// NOTE: Bluebird's "catch" has additional arguments (filters) compared to ES6
					// NOTE: Bluebird's filters will get replaced by Doodad's ones (no way to add Doodad's extensions otherwise)
					const oldCatch = Promise.prototype.catch;
					Promise.prototype.catch = function _catch(/*[optional paramarray]filters, [optional]callback, [optional]thisObj*/) {
						let filters = null;
						let i = 0;
						forEachArgument: for (; i < arguments.length; i++) {
							const filter = arguments[i];
							if (!types.isErrorType(filter) && !types.isJsObject(filter)) {
								if (i > 0) {
									filters = _shared.Natives.arraySliceCall(arguments, 0, i);
								};
								break forEachArgument;
							};
						};
						let callback = arguments[i++];
						const thisObj = arguments[i++];
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						let promise;
						if (filters) {
							// Usage: .catch(IOError, NetworkError, {code: 'ENOENTITY'}, ..., function(err){...}, this)
							promise = oldCatch.call(this, function filterCatch(ex) {
								let ok = false;
								forEachType: for (let i = 0; i < filters.length; i++) {
									const type = filters[i];
									if (types.isFunction(type)) { // isErrorType
										if (types._instanceof(ex, type)) {
											ok = true;
											break forEachType;
										};
									} else { // isJsObject
										ok = true;
										const keys = types.keys(type);
										forEachKey: for (let j = 0; j < keys.length; j++) {
											const key = keys[j];
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
					const oldAsCallback = Promise.prototype.asCallback;
					Promise.prototype.asCallback = Promise.prototype.nodeify = function asCallback(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						const promise = oldAsCallback.call(this, callback);
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
					const oldFinally = Promise.prototype.finally;
					Promise.prototype.finally = function _finally(/*optional*/callback, /*optional*/thisObj) {
						if (callback && thisObj) {
							callback = _shared.PromiseCallback(thisObj, callback);
						};
						const promise = oldFinally.call(this, callback);
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
						const Promise = this.constructor;
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
								!types.isFunction(Promise.prototype.catch)
						) {
							throw new types.TypeError("Invalid 'Promise' polyfill. It must implement: 'resolve', 'reject', 'all', 'race', 'prototype.then' and 'prototype.catch'.");
						};
						
						let DDPromise;
						if (types.isNativeFunction(Promise)) {
							// ES6 Promise
							if (types.hasClasses()) {
								// NOTE: That's the only way to inherit ES6 Promise... Using the prototypes way will throw "... is not a promise" !!!
								DDPromise = types.eval("class DDPromise extends ctx.Promise {}", {Promise: Promise});
							} else {
								DDPromise = Promise;
							};
						} else {
							// Librairies
							const promiseApply = Promise.apply.bind(Promise);
							DDPromise = types.INHERIT(Promise, function DDPromise(/*paramarray*/) {
								return promiseApply(this, arguments) || this;
							});
						};

						let isStillDDPromise = false;
						try {
							isStillDDPromise = (DDPromise.resolve(0).then(function() {}).catch(function() {}) instanceof DDPromise);
						} catch(ex) {
						};

						if (!isStillDDPromise) {
							// Inheriting Promise is not supported !!!
							DDPromise = Promise;
						};

						__Internal__.addPromiseBluebirdPolyfills(DDPromise);
						__Internal__.addPromiseDoodadExtensions(DDPromise);

						_shared.setAttribute(DDPromise.prototype, _shared.IsPromiseSymbol, true, {ignoreWhenReadOnly: true});
						_shared.setAttribute(DDPromise, __Internal__.symbolIsExtendedPromise, true, {});

						__Internal__.Promise = DDPromise;
						return DDPromise;
					}));
				
				_shared.PromiseCallback = root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 6,
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
					, function PromiseCallback(/*optional*/obj, fn, /*optional*/secret) {
						// IMPORTANT: No error should popup from a callback, excepted "ScriptAbortedError".
						let attr = null;
						if (types.isString(fn) || types.isSymbol(fn)) {
							attr = fn;
							fn = obj[attr]; // must throw on invalid scope
						};
						if (types.isNothing(obj) && types.isCallback(fn)) {
							return fn;
						};
						fn = types.unbind(fn) || fn;
						root.DD_ASSERT && root.DD_ASSERT(types.isBindable(fn), "Invalid function.");
						const checkDestroyed = types.getType(obj) && !types.isPrototypeOf(doodad.DispatchFunction, fn);
						const insideFn = _shared.makeInside(obj, fn, secret);
						const callback = types.INHERIT(types.Callback, function callbackHandler(/*paramarray*/) {
							if (checkDestroyed && _shared.DESTROYED(obj)) {
								// NOTE: We absolutly must reject the Promise.
								throw new types.ScriptInterruptedError("Target object is no longer available because it has been destroyed.");
							};
							try {
								return insideFn.apply(obj, arguments);
							} catch(ex) {
								if (!ex.promiseName) {
									ex.promiseName = (types.get(callback.promise, _shared.NameSymbol) || '<anonymous>');
								};
								throw ex;
							};
						});
						callback[_shared.BoundObjectSymbol] = obj;
						callback[_shared.OriginalValueSymbol] = fn;
						callback.promise = null; // will be provided later
						return callback;
					});
				
					

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