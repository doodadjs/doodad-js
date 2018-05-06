/* global process */

//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: NodeJs_Platform.js - Platform functions (server-side)
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
	//! INJECT("import {default as nodeOs} from 'os';");
	//! INJECT("import {default as nodePath} from 'path';");
//! ELSE()
	"use strict";

	const nodeOs = require('os'),
		nodePath = require('path');
//! END_IF()

const nodeOsType = nodeOs.type,
	nodeOsPlatform = nodeOs.platform,
	nodeOsArch = nodeOs.arch,
	nodeOsEOL = nodeOs.EOL,

	nodePathSep = nodePath.sep;


exports.add = function add(mods) {
	mods = (mods || {});
	mods['Doodad.Tools/platform'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		//dependencies: [
		//],
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools;

			//=============================
			// Internals
			//=============================

			const __Internal__ = {
			};

			//=====================
			// Options
			//=====================

			//const __options__ = tools.extend({
			//}, _options);

			//__options__. = types.toBoolean(__options__.);

			//types.freezeObject(__options__);

			//client.ADD('getOptions', function getOptions() {
			//	return __options__;
			//});

			//========================
			// Natives
			//========================

			//tools.complete(_shared.Natives, {
			//});


			//===================================
			// System functions
			//===================================

			tools.ADD('getOS', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 3,
						params: null,
						returns: 'object',
						description: "Returns OS information.",
					}
				//! END_REPLACE()
				, function getOS() {
					let os = __Internal__.os;
					if (!os) {
						const type = nodeOsType(),
							platform = nodeOsPlatform();
						os = types.freezeObject(tools.nullObject({
							name: platform,
							type: ((type === 'Windows_NT') ? 'windows' : ((type === 'Linux') ? 'linux' : 'unix')),
							//mobile: false, // TODO: "true" for Android, Windows CE, Windows Mobile, iOS, ...
							architecture: nodeOsArch(),
							dirChar: nodePathSep,
							newLine: nodeOsEOL,
							caseSensitive: !!__Internal__.caseSensitive,
						}));
						if (__Internal__.caseSensitive !== null) {
							__Internal__.os = os;
						};
					};
					return os;
				}));

			//=====================================
			// Misc functions
			//=====================================

			tools.ADD('getDefaultLanguage', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							alt: {
								type: 'bool',
								optional: true,
								description: "'true' will returns the alternate language. 'false' will returns the default language. Default is 'false'.",
							},
						},
						returns: 'string',
						description: "Returns default or alternate language.",
					}
				//! END_REPLACE()
				, function getDefaultLanguage(/*optional*/alt) {
					// TODO: Windows
					const lang = process.env.LANG || '';
					return lang.split('.')[0] || 'en_US';
				}));
		},
	};
	return mods;
};

//! END_MODULE()
