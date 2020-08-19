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
				modules = doodad.Modules,
				config = tools.Config,
				files = tools.Files,
				resources = doodad.Resources;

			//===================================
			// Internal
			//===================================

			//const __Internal__ = {
			//};


			resources.ADD('locate', function locate(fileName, /*optional*/options) {
				const Promise = types.getPromise();
				return Promise.try(function tryLocate() {
					const file = files.parsePath(fileName);
					let location;

					const module = types.get(options, 'module', null);
					if (module) {
						location = files.parsePath(module, {isFolder: true});
						if (root.serverSide) {
							const rootOptions = root.getOptions();
							location = location.combine(rootOptions.fromSource ? 'src/' : 'build/');
						};
						location = location.combine(file);
					} else {
						location = file;
					};

					return modules.resolve(location);
				}, this);
			});

			resources.ADD('load', function load(fileName, /*optional*/options) {
				const Promise = types.getPromise();
				return Promise.try(function tryLoad() {
					const path = files.parsePath(fileName);
					if (path.isRelative) {
						return resources.locate(path, options);
					};
					return path;
				}, this)
					.then(function(path) {
						const watchCb = types.get(options, 'watchCb', null);

						let promise = null;

						if ((path.extension === 'json') || (path.extension === 'json5')) {
							promise = config.load(path, options);

						} else {
							const encoding = types.get(options, 'encoding', null);

							// For readFile through HTTP/HTTPS
							let headers = null;
							if (types._instanceof(path, files.Url)) {
								headers = tools.reduce(types.get(options, 'headers', null), function(result, value, name) {
									const fixed = tools.title(tools.trim(name), '-');
									value = (types.isNothing(value) ? '' : tools.trim(types.toString(value)));
									if (value) {
										result[fixed] = value;
									};
								}, tools.nullObject());
								if (!types.has(headers, 'Accept')) {
									headers['Accept'] = 'application/octet-stream, */*';
								};
							};

							promise = files.readFileAsync(path, {encoding, headers, enableCache: true});
						};

						if (watchCb) {
							try {
								files.watch(path, watchCb, {once: true});
							} catch(err) {
								// Do nothing
							};

							promise = promise.nodeify(watchCb);
						};

						return promise;
					}, null, this);
			});

			//return function init(options) {
			//};
		},
	};
	return modules;
};

//! END_MODULE()
