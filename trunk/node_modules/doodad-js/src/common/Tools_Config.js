//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Tools_Config.js - Configuration Tools
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
	
	//! BEGIN_REMOVE()
	if ((typeof process === 'object') && (typeof module === 'object')) {
	//! END_REMOVE()
		//! IF_DEF("serverSide")
			module.exports = exports;
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
	
	exports.add = function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Tools.Config'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE() */,
			dependencies: [
				'Doodad.Types', 
				'Doodad.Tools', 
				'Doodad.Tools.Files',
			],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================
					
				var doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					files = tools.Files,
					config = tools.Config;
					
				//===================================
				// Internal
				//===================================
					
				// <FUTURE> Thread context
				var __Internal__ = {
					loadedConfigFiles: new types.Map(),
				};
				
				
				//===================================
				// Options
				//===================================
					
				config.setOptions({
					configPath: null,
				}, _options);
				

				//===================================
				// Native functions
				//===================================
					
				var __Natives__ = {
					windowJSON: global.JSON,
				};
				
				//===================================
				// Config
				//===================================
				
				config.loadFile = root.DD_DOC(
					//! REPLACE_BY("null")
					{
							author: "Claude Petit",
							revision: 3,
							params: {
								url: {
									type: 'Url,Path',
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
						root.DD_ASSERT && root.DD_ASSERT((url instanceof files.Url) || (url instanceof files.Path), "Invalid 'url' argument.");
						
						var Promise = types.getPromise();
							
						if (callbacks) {
							if (types.isArray(callbacks)) {
								// Remove empty slots.
								callbacks = tools.filter(callbacks, function(callback) {
									return !!callback;
								});
							} else {
								callbacks = [callbacks];
							};
						} else {
							callbacks = [];
						};
						
						if (options) {
							options = types.clone(options);
						} else {
							options = {};
						};
						
						var configPath = types.get(options, 'configPath', config.getOptions().configPath);
						if (configPath) {
							root.DD_ASSERT && root.DD_ASSERT((configPath instanceof files.Url) || (configPath instanceof files.Path), "Invalid 'configPath' option.");
							url = configPath.combine(url);
						};
						
						var key = url.toString();
						
						var promise;
						
						if (__Internal__.loadedConfigFiles.has(key)) {
							var def = __Internal__.loadedConfigFiles.get(key);
							def.callbacks = types.unique(def.callbacks, callbacks);
							if (types.get(options, 'force')) {
								promise = def.read();
							} else if (def.ready) {
								if (types.isError(def.data)) {
									promise = Promise.reject(def.data);
								} else {
									promise = Promise.resolve(def.data);
								};
							} else {
								promise = new Promise(function(resolve, reject) {
									def.callbacks.push(function(err, data) {
										if (err) {
											reject(err);
										} else {
											resolve(data);
										};
									});
								});
							};
						} else {
							if (!options.headers) {
								options.headers = {};
							};
							options.headers['Accept'] = 'application/json';
							var def = {
								callbacks: callbacks,
								data: null,
								ready: false,
								read: function read() {
									return files.readFile(url, options)
										.nodeify(function proceed(err, data) {
											var promise;
											if (err) {
												def.data = err;
												def.ready = true;
												promise = Promise.reject(err);
											} else {
												try {
													var encoding = types.get(options, 'encoding', null);
													if (encoding) {
														// <PRB> "JSON.parse" doesn't like the BOM
														if (encoding.slice(0, 3).toLowerCase() === 'utf') {
															// Remove the BOM
															data = tools.trim(data, '\uFEFF', 1);
															data = tools.trim(data, '\uFFFE', 1);
														};
													};
													data = __Natives__.windowJSON.parse(data);
													def.data = data;
													def.ready = true;
													var callbacks = __Internal__.loadedConfigFiles.get(key).callbacks,
														promise = Promise.resolve(data);
													tools.forEach(callbacks, function(callback) {
														promise = promise.nodeify(callback);
													});
												} catch(ex) {
													promise = Promise.reject(ex);
												};
											};
											return promise;
										});
								}
							};
							
							__Internal__.loadedConfigFiles.set(key, def);
							
							promise = def.read();
							
							if (types.get(options, 'watch', false)) {
								files.watch(url, function(eventName, fileName) {
									if (eventName === 'change') {
										options.async = true;
										__Internal__.loadedConfigFiles.get(key).read();
									};
								});
							};
						};
						
						return promise;
					});

				//===================================
				// Init
				//===================================
				//return function init(/*optional*/options) {
				//};
			},
		};
		
		return DD_MODULES;
	};
	
	//! BEGIN_REMOVE()
	if ((typeof process !== 'object') || (typeof module !== 'object')) {
	//! END_REMOVE()
		//! IF_UNDEF("serverSide")
			// <PRB> export/import are not yet supported in browsers
			global.DD_MODULES = exports.add(global.DD_MODULES);
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
}).call(
	//! BEGIN_REMOVE()
	(typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : this)
	//! END_REMOVE()
	//! IF_DEF("serverSide")
	//! 	INJECT("global")
	//! ELSE()
	//! 	INJECT("window")
	//! END_IF()
);