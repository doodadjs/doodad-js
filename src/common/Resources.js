//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Resources.js - Resources manager
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
	modules['Doodad.Resources'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Tools.Config',
			'Doodad.Tools.Files',
			'Doodad.Modules',
		],

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools,
				config = tools.Config,
				files = tools.Files,
				modules = doodad.Modules,
				resources = doodad.Resources;

			//===================================
			// Internal
			//===================================

			// <FUTURE> Thread context
			const __Internal__ = {
				resourcesLoader: new types.WeakMap(),
			};


			__Internal__.createResourcesLoader = function(resNs, basePath) {
				return {
					locate: function locate(fileName, /*optional*/options) {
						const Promise = types.getPromise();
						return Promise.try(function tryLocate() {
							const path = basePath
								.combine(files.parsePath(fileName));
							return path;
						}, this);
					},
					load: function load(fileName, /*optional*/options) {
						const Promise = types.getPromise();
						return Promise.try(function tryLoad() {
							const path = files.parsePath(fileName);
							if (path.isRelative) {
								return this.locate(path, options);
							};
							return path;
						}, this)
							.then(function(path) {
								const watchCb = types.get(options, 'watchCb', null);
								let promise = null;
								if (path.extension === 'json') {
									promise = config.load(path);
								} else {
									const headers = {
										Accept: '*/*',
									};
									promise = files.readFile(path, {async: true, encoding: 'utf-8', enableCache: true, headers: headers});
								};
								if (watchCb) {
									files.watch(path, watchCb, {once: true});
									promise = promise.nodeify(watchCb);
								};
								return promise;
							}, null, this);
					},
				};
			};


			resources.ADD('createResourcesLoader', function(resNs, basePath) {
				resNs.ADD('getResourcesLoader', function getResourcesLoader() {
					return __Internal__.resourcesLoader.get(resNs);
				});

				resNs.ADD('setResourcesLoader', function setResourcesLoader(loader) {
					__Internal__.resourcesLoader.set(resNs, tools.extend({}, resNs.getResourcesLoader(), loader));
				});

				resNs.setResourcesLoader(__Internal__.createResourcesLoader(resNs, basePath));
			});


			return function init(options) {
				const Promise = types.getPromise();
				return Promise.resolve(root.serverSide ? files.Path.parse(module.filename) : modules.locate(/*! INJECT(TO_SOURCE(MANIFEST('name'))) */))
					.then(function(location) {
						location = location.set({file: ''});
						resources.createResourcesLoader(resources, (root.serverSide ? location.moveUp(1) : location));
					});
			};
		},
	};
	return modules;
};

//! END_MODULE()
