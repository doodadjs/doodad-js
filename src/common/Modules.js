//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Modules.js - Doodad Modules management (Common Tools)
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
	modules['Doodad.Modules/common'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Tools',
			'Doodad.Tools.Files',
			'Doodad.Types',
		],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				tools = doodad.Tools,
				files = tools.Files,
				types = doodad.Types,
				modules = doodad.Modules;


			const __Internal__ = {
				getPackageName: function getPackageName(name) {
					return ((name[0] === '@') ? name.split('/')[1] : name);
				},
			};

			modules.ADD('clientResolve', function clientResolve(location, /*optional*/options) {
				if (!types._instanceof(location, files.Url)) {
					location = files.Url.parse(location);
				};

				let url;

				if (location.isRelative) {
					const baseUrl = types.get(options, 'baseUrl', null);
					const modulesUri = types.get(options, 'modulesUri', null);

					if (baseUrl) {
						url = baseUrl
							.removeArgs()
							//.setArgs({sessionId: current.getArg('sessionId', true)}) // TODO: User Sessions
							.set({file: ''});

						if (modulesUri) {
							url = url
								.combine(modulesUri)
								.toFolder();
						};

						url = url
							.combine(location);

					} else if (modulesUri) {
						url = modulesUri
							.toFolder()
							.combine(location);

					} else {
						url = location;

					};

				} else {
					url = location;

				};

				return url;
			});

			modules.ADD('clientLocate', function locate(/*optional*/module, /*optional*/path, /*optional*/options) {
				const Promise = types.getPromise();
				return Promise.try(function() {
					const dontForceMin = types.get(options, 'dontForceMin', false) || types.get(options, 'debug', false);
					const mjs = types.get(options, 'mjs', false);
					const baseUrl = types.get(options, 'baseUrl', null);

					if (path) {
						path = files.parseUrl(path).removeArgs(['redirects', 'crashReport', 'crashRecovery']); // TODO: Put these hard coded names in a common constant
					};

					let location;
					if (module) {
						if (path) {
							if (path.isRelative) {
								location = files.parseUrl(module, {isRelative: true}).toFolder().combine(path);
							} else {
								module = null;
								location = path;
							};
						} else {
							location = files.parseUrl(module, {isRelative: true}).toFolder();
						};
					} else {
						if (path && path.isRelative && baseUrl) {
							location = baseUrl.set({file: '', args: ''}).combine(path);
						} else {
							location = path;
						};
					};

					if (location && location.file) {
						const ext = '.' + location.extension + '.';
						if (ext.endsWith('.js.') || ext.endsWith('.mjs.')) {
							if (!dontForceMin && (ext.indexOf('.min.') < 0)) {
								// Force minified MJS or JS files.
								location = location.set({extension: 'min.' + location.extension});
							};
						};
					} else if (module && !path) {
						location = location.set({file: __Internal__.getPackageName(module) + (dontForceMin ? '' : '.min') + (mjs ? '.mjs' : '.js')});
					};

					const ext2 = '.' + location.extension + '.';
					const integrity = types.get(options, (ext2.endsWith('.mjs.') ? ((ext2.indexOf('.min.') >= 0) ? 'integrityMjsMin' : 'integrityMjs') : ((ext2.indexOf('.min.') >= 0) ? 'integrityMin' : 'integrity')), null);
					if (integrity) {
						location = location.setArgs({integrity});
					};

					return location;
				});
			});

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
