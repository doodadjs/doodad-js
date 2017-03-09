//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Tools_Config.js - Configuration Tools
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
		DD_MODULES['Doodad.Tools.Config'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			dependencies: [
				'Doodad.Types', 
				'Doodad.Tools', 
				'Doodad.Tools.Files',
			],
			bootstrap: true,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================
					
				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					files = tools.Files,
					config = tools.Config;
					
				//===================================
				// Internal
				//===================================
					
				// <FUTURE> Thread context
				const __Internal__ = {
					loadedConfigFiles: new types.Map(),
				};
				
				
				//===================================
				// Options
				//===================================
					
				const __options__ = types.nullObject({
					configPath: null,
				}, _options);

				//__options__. = types.to...(__options__.);

				types.freezeObject(__options__);

				config.ADD('getOptions', function() {
					return __options__;
				});
				

				//===================================
				// Native functions
				//===================================
					
				types.complete(_shared.Natives, {
					windowJSON: global.JSON,
				});
				
				//===================================
				// Config
				//===================================
				
				// NOTE: This function will get overriden by "Client.js" or "NodeJs.js".
				_shared.loadConfig = function load(url, /*optional*/options, /*optional*/callbacks) {
					root.DD_ASSERT && root.DD_ASSERT(types._instanceof(url, files.Url) || types._instanceof(url, files.Path), "Invalid 'url' argument.");
						
					const Promise = types.getPromise();
						
					options = types.nullObject(options);

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
						
					const configPath = types.getIn(options, 'configPath', __options__.configPath);
					if (configPath) {
						root.DD_ASSERT && root.DD_ASSERT(types._instanceof(configPath, files.Url) || types._instanceof(configPath, files.Path), "Invalid 'configPath' option.");
						url = configPath.combine(url);
					};
						
					const encoding = types.getDefault(options, 'encoding', 'utf-8');

					const key = url.toString();
						
					let promise;
						
					if (__Internal__.loadedConfigFiles.has(key)) {
						const def = __Internal__.loadedConfigFiles.get(key);
						def.callbacks = types.unique(def.callbacks, callbacks);
						if (options.force) {
							promise = def.read();
						} else if (def.ready) {
							if (types.isError(def.data)) {
								promise = Promise.reject(def.data);
							} else {
								promise = Promise.resolve(def.data);
							};
						} else {
							promise = Promise.create(function readyPromise(resolve, reject) {
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
						const def = {
							callbacks: callbacks,
							data: null,
							ready: false,
							read: function read() {
								return files.readFile(url, options)
									.nodeify(function proceed(err, data) {
										let promise;
										try {
											if (err) {
												def.data = err;
												def.ready = true;
												const callbacks = __Internal__.loadedConfigFiles.get(key).callbacks;
												promise = Promise.reject(err);
												tools.forEach(callbacks, function(callback) {
													promise = promise.nodeify(callback)
														.then(function(data) {
															throw err;
														});
												});
											} else {
												if (encoding.slice(0, 3).toLowerCase() === 'utf') {
													// <PRB> "JSON.parse" doesn't like the BOM
													data = tools.trim(data, '\uFEFF', 1);
													data = tools.trim(data, '\uFFFE', 1);
												};
												data = _shared.Natives.windowJSON.parse(data);
												def.data = data;
												def.ready = true;
												const callbacks = __Internal__.loadedConfigFiles.get(key).callbacks;
												promise = Promise.resolve(data);
												tools.forEach(callbacks, function(callback) {
													promise = promise.nodeify(callback);
												});
											};
										} catch(ex) {
											promise = Promise.reject(ex);
										};
										return promise;
									});
							}
						};
							
						__Internal__.loadedConfigFiles.set(key, def);
							
						promise = def.read();
							
						if (options.watch) {
							files.watch(url, function(eventName, fileName) {
								if (eventName === 'change') {
									options.async = true;
									__Internal__.loadedConfigFiles.get(key).read();
								};
							});
						};
					};
						
					return promise;
				};

				config.ADD('load', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
							author: "Claude Petit",
							revision: 4,
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
							description: "Loads a configuration file written in JSON and pass its content to the callback functions, then resolve a Promise with the final value.\n" +
										"When the option 'watch' is set to 'true', the file is read again and callbacks called again when the file is modified.\n" +
										"If 'loadFile' is called more than once with the same file, callbacks are chained.\n" +
										"You can set the option 'force' to force the file to be read again.",
					}
					//! END_REPLACE()
					, function load(url, /*optional*/options, /*optional*/callbacks) {
						return _shared.loadConfig(url, options, callbacks);
					}));

				//===================================
				// Init
				//===================================
				//return function init(/*optional*/options) {
				//};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()