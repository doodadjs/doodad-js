//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Types_DDCancelable.js - A Cancelable object implementation.
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

// Examples :
//			tools.Files.readdirAsync('F:\\', {timeout: 5000, depth: Infinity});
//			tools.Files.readdirAsync('F:\\', {cancelable: true, depth: Infinity});  // .then(cancelable => cancelable.start());
//			tools.Files.readdirAsync('F:\\', {cancelable: true, timeout: 5000, depth:Infinity});  //  .then(cancelable => cancelable.start());
//			tools.Files.readdirAsync('F:\\', {cancelable: true, depth: Infinity}).then(cancelable => {tools.callAsync(() => cancelable.cancel(), 1000); return cancelable.start()});
//			tools.Files.readdirAsync('F:\\', {cancelable: true, depth: Infinity}).then(cancelable => {tools.callAsync(() => cancelable.cancel(), 60000); return cancelable.start()});
//			w(1, root => root.Doodad.Tools.Files.readdirAsync('F:\\', {timeout: 60000, depth: Infinity}));


exports.add = function add(modules) {
	modules = (modules || {});
	modules['Doodad.Types/DDCancelable'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		bootstrap: true,

		dependencies: [
			'Doodad.Types/DDPromise',
		],

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				//tools = doodad.Tools,
				types = doodad.Types;

			//===================================
			// Internal
			//===================================

			const __Internal__ = {
				cancelableStates: new types.WeakMap(), // <FUTURE> Private field
			};

			//===================================
			// Native functions
			//===================================

			//tools.complete(_shared.Natives, {
			//});

			//===================================
			// DDCancelable
			//===================================

			types.ADD('isCancelable', function isCancelable(obj) {
				return types._instanceof(obj, types.DDCancelable);
			});


			__Internal__.resolveCb = function resolveCb(result) {
				const Promise = types.getPromise();
				return Promise.try(function tryResolve() {
					const racer = this.racer;
					if (!racer.isSolved()) {
						racer.resolve(result);
					};
					return racer;
				}, this);
			};

			__Internal__.rejectCb = function rejectCb(err) {
				const Promise = types.getPromise();
				return Promise.try(function tryReject() {
					const racer = this.racer;
					if (!racer.isSolved()) {
						racer.reject(err);
					};
					return racer;
				}, this);
			};


			types.REGISTER(types.Type.$inherit(
				/*typeProto*/
				{
					$TYPE_NAME: 'DDCancelable',
				},
				/*instanceProto*/
				{
					name: types.READ_ONLY( null ),

					_new: types.SUPER(function _new(callback) {
						this._super();

						const Promise = types.getPromise();

						const state = {
							//cancelable: this,
							racer: Promise.createRacer(),
							startCb: null,
							cancelCb: null,
						};

						const { startCb, cancelCb, name = null } = callback(__Internal__.resolveCb.bind(state), __Internal__.rejectCb.bind(state));

						if (root.DD_ASSERT) {
							root.DD_ASSERT(types.isJsFunction(startCb), "Invalid 'start' callback.");
							root.DD_ASSERT(types.isJsFunction(cancelCb), "Invalid 'cancel' callback.");
						};

						state.startCb = startCb;
						state.cancelCb = cancelCb;

						types.setAttribute(this, 'name', types.isNothing(name) ? types.getFunctionName(state.startCb) : types.toString(name));

						__Internal__.cancelableStates.set( this, state );
					}),

					_delete: types.SUPER(function _delete() {
						__Internal__.cancelableStates.delete( this );

						this._super();
					}),

					start: function start(/*optional*/resolveCb, /*optional*/rejectCb, /*optional*/thisObj) {
						const Promise = types.getPromise();
						return Promise.try(function tryStart() {
							const state = __Internal__.cancelableStates.get(this);
							const startCb = state.startCb;
							let promise = null;
							if (startCb) {
								state.startCb = null;
								promise = Promise.try(startCb)
									.then(function thenReturnRacer() {
										return state.racer;
									}, null, this);
							} else {
								promise = state.racer;
							};
							if (resolveCb || rejectCb) {
								promise = promise
									.then(resolveCb, rejectCb, thisObj);
							};
							return promise || null;
						}, this);
					},

					cancel: function cancel(/*optional*/reason) {
						const Promise = types.getPromise();
						return Promise.try(function tryCancel() {
							const state = __Internal__.cancelableStates.get(this);
							if (types.isNothing(reason)) {
								reason = new types.CanceledError("Cancelable object '~0~' has been canceled.", [this.name || '<anonymous>']);
							};
							const cancelCb = !state.startCb && state.cancelCb;
							if (cancelCb) {
								state.cancelCb = null;
								return Promise.try(cancelCb)
									.then(function thenReject() {
										const racer = state.racer;
										if (!racer.isSolved()) {
											racer.reject(reason);
										};
										return racer;
									}, null, this)
									.catch(function(err) {
										if (err !== reason) {
											throw err;
										};
									});
							} else {
								const racer = state.racer;
								if (!racer.isSolved()) {
									racer.reject(reason);
								};
								return racer
									.catch(function(err) {
										if (err !== reason) {
											throw err;
										};
									});
							}
						}, this);
					},

					race: function race(promise) {
						const Promise = types.getPromise();
						return Promise.try(function tryRace() {
							const state = __Internal__.cancelableStates.get(this);
							return state.racer.race(promise);
						}, this);
					},

					//then: function then(/*optional*/resolveCb, /*optional*/rejectCb, /*optional*/thisObj) {
					//},
				}
			));


			//===================================
			// Init
			//===================================
			//return function init(/*optional*/options) {
			//};
		},
	};
	return modules;
};

//! END_MODULE()
