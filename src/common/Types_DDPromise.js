//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Types_DDPromise.js - DDPromise type (extension to ES6 Promise)
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
	modules['Doodad.Types/DDPromise'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad'],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
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
				DDPromise: null, // <FUTURE> Global to threads ?
				symbolIsExtendedPromise: types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_IS_PROMISE_EXTENDED')), true) */ '__DD_IS_PROMISE_EXTENDED__' /*! END_REPLACE() */, true),
			};


			//===================================
			// Native functions
			//===================================

			// NOTE: Store everything because third-parties can override them.

			tools.complete(_shared.Natives, {
				windowPromise: global.Promise,
				arraySliceCall: _shared.Natives.functionBindCall(global.Array.prototype.slice),
			});

			//=================================
			// DDPromise
			//=================================

			// To allow extending "isPromise".
			_shared.IsPromiseSymbol = types.getSymbol(/*! REPLACE_BY(TO_SOURCE(UUID('SYMBOL_IS_PROMISE')), true) */ '__DD_IS_PROMISE__' /*! END_REPLACE() */, true);

			types.ADD('isPromise', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
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
					return types.isObjectLike(obj) && !!obj[_shared.IsPromiseSymbol];
				}));

			types.ADD('isDDPromise', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if object is a DDPromise object, 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isDDPromise(obj) {
					return types.isObjectLike(obj) && !!obj[__Internal__.symbolIsExtendedPromise];
				}));

			types.ADD('getPromise', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: null,
						returns: 'Promise',
						description: "Returns DDPromise.",
					}
				//! END_REPLACE()
				, function getPromise() {
					return __Internal__.DDPromise;
				}));

			__Internal__.getPromiseName = function getPromiseName(callback) {
				let original = types.get(callback, _shared.OriginalValueSymbol);
				while (original) {
					callback = original;
					original = types.get(callback, _shared.OriginalValueSymbol);
				};
				return types.get(callback, _shared.NameSymbol) || types.getFunctionName(callback);
			};

			__Internal__.addPromiseBluebirdPolyfills = function addPromiseBluebirdPolyfills(Promise) {
				// <PRB> Doing ".then(samefn).catch(samefn)" or ".then(samefn, samefn)" is very annoying.
				// Bluebird "asCallback" polyfill. NOTE: "spread" option has not been implemented.
				if (!types.isFunction(Promise.prototype.asCallback) && !types.isFunction(Promise.prototype.nodeify)) {
					const asCallback = function asCallback(callback) {
						const promise = this.then(function _then(result) {
							const retval = callback(undefined, result);
							if (retval === undefined) {
								return result;
							};
							return retval;
						}, function(err) {
							return callback(err, undefined);
						});
						return promise;
					};
					Promise.prototype.nodeify = asCallback;
					Promise.prototype.asCallback = asCallback;
				} else if (!types.isFunction(Promise.prototype.asCallback)) {
					Promise.prototype.asCallback = Promise.prototype.nodeify;
				} else if (!types.isFunction(Promise.prototype.nodeify)) {
					Promise.prototype.nodeify = Promise.prototype.asCallback;
				};

				// Bluebird "finally" polyfill
				if (!types.isFunction(Promise.prototype.finally)) {
					Promise.prototype.finally = function _finally(callback) {
						const P = this.constructor;
						const promise = this.then(function(result) {
							return P.resolve(callback()).then(function() {
								return result;
							});
						}, function(err) {
							return P.resolve(callback()).then(function() {
								throw err;
							});
						});
						return promise;
					};
				};

				// Bluebird "try" polyfill
				if (!types.isFunction(Promise.try)) {
					Promise.try = function _try(callback) {
						const P = this;
						return new P(function _try(resolve, reject) {
							try {
								resolve(callback());
							} catch(err) {
								reject(err);
							};
						});
					};
				};

				// Bluebird "map" polyfill
				if (!types.isFunction(Promise.map)) {
					Promise.map = function _map(ar, fn, /*optional*/options) {
						const P = this;
						return P.try(function tryMap() {
							const len = ar.length | 0;

							options = tools.nullObject({
								concurrency: Infinity,
							}, options);

							if ((len <= 0) || (options.concurrency <= 0)) {
								return [];
							};

							if (options.concurrency >= len) {
								return P.all(tools.map(ar, function _mapFn(val, key, obj) {
									return P.resolve(fn(val, key, obj));
								}));
							} else {
								const result = tools.createArray(len);
								const state = {start: 0};
								const mapFn = function _mapFn(val, key, obj) {
									state.start++;
									return P.resolve(fn(val, key, obj))
										.then(function(res) {
											/* eslint consistent-return: "off" */
											result[key] = res;
											const pos = state.start;
											if (pos < len) {
												return mapFn(obj[pos], pos, obj);
											};
										});
								};
								if (options.concurrency > 1) {
									return P.all(tools.map(ar, mapFn, null, 0, options.concurrency))
										.then(function() {
											return result;
										});
								} else {
									return mapFn(ar[0], 0, ar)
										.then(function() {
											return result;
										});
								}
							}
						});
					};
				};
			};

			__Internal__.addPromiseDoodadExtensions = function addPromiseDoodadExtensions(Promise) {
				// Add "thisObj" argument
				// Add promise name
				Promise.create = function create(callback, /*optional*/thisObj) {
					const P = this;
					const name = __Internal__.getPromiseName(callback);
					const promise = new P(callback, thisObj);
					types.setAttribute(promise, _shared.NameSymbol, name, {enumerable: true});
					return promise;
				};

				// NOTE: Experimental
				Promise.createRacer = function createRacer() {
					const P = this,
						state = {res: null, rej: null};
					const racer = P.create(function Racer(res, rej) {
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
						return this;
					};
					racer.reject = function reject(err) {
						const rej = state.rej;
						if (!rej) {
							throw new types.Error("Racer has already been resolved or rejected.");
						};
						state.res = null;
						state.rej = null;
						rej(err);
						return this;
					};
					racer.race = function race(promises) {
						if (types.isNothing(promises)) {
							return this;
						};
						if (types.isArrayLike(promises)) {
							promises = tools.append([this], promises);
						} else {
							promises = [this, promises];
						}
						return P.race(promises);
					};
					// TODO: Try to implement in DDPromise.prototype instead.
					racer.isSolved = function() {
						return !state.res || !state.rej;
					};
					return racer;
				};

				// Add "thisObj" argument
				// Add promise name
				const oldTryCall = _shared.Natives.functionBindCall(Promise.try);
				Promise.try = function _try(callback, /*optional*/thisObj) {
					const P = this;
					const name = __Internal__.getPromiseName(callback);
					let isCallback = types.isCallback(callback);
					const isNative = !isCallback && types.isNativeFunction(callback);
					if (thisObj) {
						if (isNative) {
							//const oldCbCall = _shared.Natives.functionBindCall(callback, thisObj);
							//callback = _shared.makeInside(thisObj, function(...args) {
							//	return oldCbCall(...args);
							//});
							callback = _shared.Natives.functionBindCall(callback, thisObj);
							types.setAttribute(callback, _shared.BoundObjectSymbol, thisObj, {});
							isCallback = true;
						} else {
							callback = _shared.PromiseCallback(thisObj, callback);
							if (types.isCallback(callback)) {
								isCallback = true;
							};
						};
					};
					const promise = oldTryCall(P, callback);
					types.setAttribute(promise, _shared.NameSymbol, name, {enumerable: true});
					return promise;
				};

				// Add "thisObj" argument
				// Add promise name
				const oldMapCall = _shared.Natives.functionBindCall(Promise.map);
				Promise.map = function _map(ar, callback, /*optional*/options) {
					const P = this;
					const thisObj = types.get(options, 'thisObj');
					const name = __Internal__.getPromiseName(callback);
					let isCallback = types.isCallback(callback);
					const isNative = !isCallback && types.isNativeFunction(callback);
					if (thisObj) {
						if (isNative) {
							//const oldCbCall = _shared.Natives.functionBindCall(callback, thisObj);
							//callback = _shared.makeInside(thisObj, function(...args) {
							//	return oldCbCall(...args);
							//});
							callback = _shared.Natives.functionBindCall(callback, thisObj);
							types.setAttribute(callback, _shared.BoundObjectSymbol, thisObj, {});
							isCallback = true;
						} else {
							callback = _shared.PromiseCallback(thisObj, callback);
							if (types.isCallback(callback)) {
								isCallback = true;
							};
						};
					};
					const promise = oldMapCall(P, ar, callback, options);
					types.setAttribute(promise, _shared.NameSymbol, name, {enumerable: true});
					return promise;
				};

				// NOTE: Experimental
				// NOTE: Makes use of sparse arrays, but they are not considered by the new features of ES6+
				Promise.any = function _any(promises, /*optional*/options) {
					const P = this;
					const promise = P.create(function(resolve, reject) {
						const includeErrors = types.get(options, 'includeErrors', false);
						const count = types.indexes(promises).length;
						if (count <= 0) {
							resolve([]);
						} else {
							const result = tools.createArray(count);
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
							tools.forEach(promises, function(val, i) {
								P.resolve(val)
									.then(function(value) {
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
							});
						};
					});
					return promise;
				};

				// Add "thisObj" argument
				// Add promise name
				const oldThenCall = _shared.Natives.functionBindCall(Promise.prototype.then);
				Promise.prototype.then = function then(/*optional*/resolvedCb, /*optional*/rejectedCb, /*optional*/thisObj) {
					// NOTE: Promises use '.then' internally.
					if (!thisObj && rejectedCb && (!types.isFunction(rejectedCb) || types.isType(rejectedCb))) {
						thisObj = rejectedCb;
						rejectedCb = null;
					};
					let isCallback = types.isCallback(resolvedCb) || types.isCallback(rejectedCb);
					const isNative = !isCallback && (types.isNativeFunction(resolvedCb) || types.isNativeFunction(rejectedCb));
					if (thisObj) {
						if (resolvedCb) {
							if (isNative) {
								//const oldResolvedCbCall = _shared.Natives.functionBindCall(resolvedCb, thisObj);
								//resolvedCb = _shared.makeInside(thisObj, function(...args) {
								//	return oldResolvedCbCall(...args);
								//});
								resolvedCb = _shared.Natives.functionBindCall(resolvedCb, thisObj);
								types.setAttribute(resolvedCb, _shared.BoundObjectSymbol, thisObj, {});
								isCallback = true;
							} else {
								resolvedCb = _shared.PromiseCallback(thisObj, resolvedCb);
								if (types.isCallback(resolvedCb)) {
									isCallback = true;
								};
							};
						};
						if (rejectedCb) {
							if (isNative) {
								//const oldRejectedCbCall = _shared.Natives.functionBindCall(rejectedCb, thisObj);
								//rejectedCb = _shared.makeInside(thisObj, function(...args) {
								//	return oldRejectedCbCall(...args);
								//});
								rejectedCb = _shared.Natives.functionBindCall(rejectedCb, thisObj);
								types.setAttribute(rejectedCb, _shared.BoundObjectSymbol, thisObj, {});
								isCallback = true;
							} else {
								rejectedCb = _shared.PromiseCallback(thisObj, rejectedCb);
								if (types.isCallback(rejectedCb)) {
									isCallback = true;
								};
							};
						};
					};
					const promise = oldThenCall(this, resolvedCb, rejectedCb);
					let name = this[_shared.NameSymbol];
					if (resolvedCb) {
						if (!name) {
							name = __Internal__.getPromiseName(resolvedCb);
						};
					};
					if (rejectedCb) {
						if (!name) {
							name = __Internal__.getPromiseName(rejectedCb);
						};
					};
					types.setAttribute(promise, _shared.NameSymbol, name, {enumerable: true});
					return promise;
				};

				// Add "thisObj" argument
				// Add promise name
				// Add Bluebird polyfill for catch (must be done there).
				// NOTE: Bluebird's "catch" has additional arguments (filters) compared to ES6
				// NOTE: Bluebird's filters will get replaced by Doodad's ones (no way to add Doodad's extensions otherwise)
				const oldCatchCall = _shared.Natives.functionBindCall(Promise.prototype.catch);
				Promise.prototype.catch = function _catch(/*[optional paramarray]filters, [optional]callback, [optional]thisObj*/...args) {
					let filters = null;
					let i = 0;
					forEachArgument: for (; i < args.length; i++) {
						const filter = args[i];
						if (!types.isErrorType(filter) && !types.isJsObject(filter)) {
							if (i > 0) {
								filters = _shared.Natives.arraySliceCall(args, 0, i);
							};
							break forEachArgument;
						};
					};
					let callback = args[i++];
					const thisObj = args[i++];
					let name = this[_shared.NameSymbol];
					if (!name && callback) {
						name = __Internal__.getPromiseName(callback);
					};
					let isCallback = types.isCallback(callback);
					const isNative = !isCallback && types.isNativeFunction(callback);
					if (callback && thisObj) {
						if (isNative) {
							//const oldCbCall = _shared.Natives.functionBindCall(callback, thisObj);
							//callback = _shared.makeInside(thisObj, function(...args) {
							//	return oldCbCall(...args);
							//});
							callback = _shared.Natives.functionBindCall(callback, thisObj);
							types.setAttribute(callback, _shared.BoundObjectSymbol, thisObj, {});
							isCallback = true;
						} else {
							callback = _shared.PromiseCallback(thisObj, callback);
							if (types.isCallback(callback)) {
								isCallback = true;
							};
						};
					};
					let promise;
					if (filters) {
						// Usage: .catch(IOError, NetworkError, {code: 'ENOENTITY'}, ..., function(err){...}, this)
						promise = oldCatchCall(this, function filterCatch(ex) {
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
							}
						});
					} else {
						promise = oldCatchCall(this, callback);
					};
					types.setAttribute(promise, _shared.NameSymbol, name, {enumerable: true});
					return promise;
				};

				// Add "thisObj" argument
				// Add promise name
				const oldAsCallbackCall = _shared.Natives.functionBindCall(Promise.prototype.asCallback);
				const asCallback = function asCallback(callback, /*optional*/thisObj) {
					let name = this[_shared.NameSymbol];
					if (!name && callback) {
						name = __Internal__.getPromiseName(callback);
					};
					let isCallback = types.isCallback(callback);
					const isNative = !isCallback && types.isNativeFunction(callback);
					if (callback && thisObj) {
						if (isNative) {
							//const oldCbCall = _shared.Natives.functionBindCall(callback, thisObj);
							//callback = _shared.makeInside(thisObj, function(...args) {
							//	return oldCbCall(...args);
							//});
							callback = _shared.Natives.functionBindCall(callback, thisObj);
							types.setAttribute(callback, _shared.BoundObjectSymbol, thisObj, {});
							isCallback = true;
						} else {
							callback = _shared.PromiseCallback(thisObj, callback);
							if (types.isCallback(callback)) {
								isCallback = true;
							};
						};
					};
					const promise = oldAsCallbackCall(this, callback);
					types.setAttribute(promise, _shared.NameSymbol, name, {enumerable: true});
					return promise;
				};
				Promise.prototype.asCallback = asCallback;
				Promise.prototype.nodeify = asCallback;

				// Add "thisObj" argument
				// Add promise name
				const oldFinallyCall = _shared.Natives.functionBindCall(Promise.prototype.finally);
				Promise.prototype.finally = function _finally(/*optional*/callback, /*optional*/thisObj) {
					let name = this[_shared.NameSymbol];
					if (!name && callback) {
						name = __Internal__.getPromiseName(callback);
					};
					let isCallback = types.isCallback(callback);
					const isNative = !isCallback && types.isNativeFunction(callback);
					if (callback && thisObj) {
						if (isNative) {
							//const oldCbCall = _shared.Natives.functionBindCall(callback, thisObj);
							//callback = _shared.makeInside(thisObj, function(...args) {
							//	return oldCbCall(...args);
							//});
							callback = _shared.Natives.functionBindCall(callback, thisObj);
							types.setAttribute(callback, _shared.BoundObjectSymbol, thisObj, {});
							isCallback = true;
						} else {
							callback = _shared.PromiseCallback(thisObj, callback);
							if (types.isCallback(callback)) {
								isCallback = true;
							};
						};
					};
					const promise = oldFinallyCall(this, callback);
					types.setAttribute(promise, _shared.NameSymbol, name, {enumerable: true});
					return promise;
				};

				// Combines "then" and "create"
				Promise.prototype.thenCreate = function _thenCreate(callback, /*optional*/thisObj) {
					const P = this.constructor;
					let name = this[_shared.NameSymbol];
					if (!name && callback) {
						name = __Internal__.getPromiseName(callback);
					};
					let isCallback = types.isCallback(callback);
					const isNative = !isCallback && types.isNativeFunction(callback);
					if (thisObj) {
						if (isNative) {
							//const oldCbCall = _shared.Natives.functionBindCall(callback, thisObj);
							//callback = _shared.makeInside(thisObj, function(...args) {
							//	return oldCbCall(...args);
							//});
							callback = _shared.Natives.functionBindCall(callback, thisObj);
							types.setAttribute(callback, _shared.BoundObjectSymbol, thisObj, {});
							isCallback = true;
						} else {
							callback = _shared.PromiseCallback(thisObj, callback);
							if (types.isCallback(callback)) {
								isCallback = true;
							};
						};
					};
					const promise = this.then(function thenCb(result) {
						return P.create(function createCb(resolve, reject) {
							return _shared.Natives.functionCallCall(callback, this, result, resolve, reject);
						}, this);
					});
					types.setAttribute(promise, _shared.NameSymbol, name, {enumerable: true});
					return promise;
				};
			};

			__Internal__.DDPromiseConstructor = function DDPromiseConstructor(callback, resolve, reject, /*optional*/thisObj) {
				let isCallback = types.isCallback(callback);
				const isNative = !isCallback && types.isNativeFunction(callback);
				if (thisObj) {
					if (isNative) {
						//const oldCbCall = _shared.Natives.functionBindCall(callback, thisObj);
						//callback = _shared.makeInside(thisObj, function(...args) {
						//	return oldCbCall(...args);
						//});
						callback = _shared.Natives.functionBindCall(callback, thisObj);
						types.setAttribute(callback, _shared.BoundObjectSymbol, thisObj, {});
						isCallback = true;
					} else {
						callback = _shared.PromiseCallback(thisObj, callback);
						if (types.isCallback(callback)) {
							isCallback = true;
						};
					};
				};
				types.setAttribute(this, _shared.NameSymbol, null, {configurable: true, enumerable: true});  // will be set later
				let solved = false;
				const res = function(value) {
					if (!solved) {
						solved = true;
						resolve(value);
					};
				};
				const rej = function(value) {
					if (!solved) {
						solved = true;
						reject(value);
					};
				};
				try {
					callback(res, rej);
				} catch(err) {
					rej(err);
				};
			};
			__Internal__.DDPromiseConstructorCall = _shared.Natives.functionBindCall(__Internal__.DDPromiseConstructor);

			types.ADD('setPromise', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 7,
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
						throw new types.ValueError("Invalid 'Promise' constructor.");
					};

					if (Promise === __Internal__.DDPromise) {
						// Already set
						return __Internal__.DDPromise;
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
						throw new types.ValueError("Invalid 'Promise' implementation. It must supports: 'resolve', 'reject', 'all', 'race', 'prototype.then' and 'prototype.catch'.");
					};

					let DDPromise;
					if (Promise.prototype[__Internal__.symbolIsExtendedPromise]) {
						DDPromise = Promise;

					} else {
						if (types.isNativeFunction(Promise)) {
							// ES6 Promise
							// NOTE: That's the only way to inherit ES6 Promise... Using the prototypes way will throw "... is not a promise" !!!
							DDPromise = (class DDPromise extends Promise {
								constructor(callback, /*optional*/thisObj) {
									let res,
										rej;
									super(function(resolve, reject) {
										res = resolve;
										rej = reject;
									});
									__Internal__.DDPromiseConstructorCall(this, callback, res, rej, thisObj);
								}
							});
						} else {
							// Librairies
							const promiseCall = _shared.Natives.functionBindCall(Promise);
							DDPromise = types.INHERIT(Promise, function DDPromise(callback, /*optional*/thisObj) {
								let res,
									rej;
								promiseCall(this, function(resolve, reject) {
									res = resolve;
									rej = reject;
								});
								__Internal__.DDPromiseConstructorCall(this, callback, res, rej, thisObj);
							});
						};

						let isStillDDPromise = false;
						try {
							isStillDDPromise = (DDPromise.resolve(0).then(function() {}).catch(function() {}) instanceof DDPromise);
						} catch(ex) {
							// Do nothing
						};

						if (!isStillDDPromise) {
							throw new types.ValueError("Unsupported 'Promise' implementation.");
						};

						__Internal__.addPromiseBluebirdPolyfills(DDPromise);
						__Internal__.addPromiseDoodadExtensions(DDPromise);

						types.setAttribute(Promise.prototype, _shared.IsPromiseSymbol, true, {});

						types.setAttribute(DDPromise.prototype, _shared.IsPromiseSymbol, true, {});
						types.setAttribute(DDPromise.prototype, __Internal__.symbolIsExtendedPromise, true, {});
						//types.setAttribute(DDPromise.prototype, _shared.BoundObjectSymbol, null, {});
					};

					__Internal__.DDPromise = DDPromise;

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
					if (types.isCallback(fn)) {
						throw new types.ValueError("The function is already a Callback.");
					};
					fn = types.unbind(fn) || fn;
					root.DD_ASSERT && root.DD_ASSERT((!types.isNothing(obj) && types.isBindable(fn)) || (types.isNothing(obj) && types.isFunction(fn)), "Invalid function.");
					const checkDestroyed = types.getType(obj) && !types.isProtoOf(doodad.DispatchFunction, fn);
					const insideFn = _shared.makeInside(obj, fn, secret);
					const insideFnCall = _shared.Natives.functionBindCall(insideFn, obj);
					const callback = function callbackHandler(/*paramarray*/...args) {
						if (checkDestroyed && _shared.DESTROYED(obj)) {
							// NOTE: We absolutly must reject the Promise.
							throw new types.ScriptInterruptedError("Target object is no longer available because it has been destroyed.");
						};
						return insideFnCall(...args);
					};
					types.setAttribute(callback, _shared.CallbackSymbol, _shared.PromiseCallback, {});
					types.setAttribute(callback, _shared.BoundObjectSymbol, obj, {});
					types.setAttribute(callback, _shared.OriginalValueSymbol, fn, {});
					return callback;
				});

			types.setAttribute(_shared.PromiseCallback, _shared.CallbackSymbol, types.Callback, {});

			//===================================
			// Init
			//===================================
			return function init(/*optional*/options) {
				types.setPromise(_shared.Natives.windowPromise);
			};
		},
	};
	return modules;
};

//! END_MODULE()
