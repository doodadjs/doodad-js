//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Tools_Config.js - Configuration Tools
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
	modules['Doodad.Tools.Config'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Types',
			'Doodad.Tools',
			'Doodad.Tools.Files',
			'Doodad.Tools.JSON5',
		],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools,
				files = tools.Files,
				JSON5 = tools.JSON5,
				config = tools.Config;

			//===================================
			// Internal
			//===================================

			// <FUTURE> Thread context
			//const __Internal__ = {
			//};


			//===================================
			// Options
			//===================================

			//const __options__ = tools.nullObject({
			//	configPath: null,
			//}, _options);

			//__options__. = types.to...(__options__.);

			//types.freezeObject(__options__);

			//config.ADD('getOptions', function getOptions() {
			//	return __options__;
			//});


			//===================================
			// Native functions
			//===================================

			//tools.complete(_shared.Natives, {
			//});

			//===================================
			// Config
			//===================================

			config.ADD('load', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 6,
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
						},
						returns: 'Promise',
						description: "Loads a configuration file written in JSON/JSON5 and returns the parsed result."
					}
				//! END_REPLACE()
				, function load(location, /*optional*/options) {
					const Promise = types.getPromise();
					return Promise.try(function() {
						const path = files.parseLocation(location);

						const encoding = types.get(options, 'encoding', 'utf-8');

						// For readFile through HTTP/HTTPS
						let headers = null;
						if (types._instanceof(path, files.Url)) {
							headers = types.get(options, 'headers', null);
							if (!headers) {
								headers = {};
							};
							headers['Accept'] = 'application/json';
						};

						return files.readFileAsync(path, {encoding, headers})
							.then(function proceedFile(json) {
								/*
									if (json) {
										// <PRB> "JSON.parse" doesn't like the BOM
										if (tools.indexOf(['\uFEFF', '\uFFFE'], json[0]) >= 0) {
											let pos = 1;
											if (tools.indexOf(['\uFEFF', '\uFFFE'], json[1]) >= 0) {
												pos = 2;
											};
											json = json.slice(pos);
										};
									};
								*/
								return JSON5.parse(json);
							});
					});
				}));

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
