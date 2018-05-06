//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Client_Platform.js - Platform functions (client-side)
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
	modules['Doodad.Tools/platform'] = {
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

			tools.complete(_shared.Natives, {
				// getDefaultLanguage, getOS
				windowNavigator: global.navigator,
			});


			//===================================
			// System functions
			//===================================

			tools.ADD('getOS', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: null,
						returns: 'object',
						description: "Returns OS information.",
					}
				//! END_REPLACE()
				, function getOS() {
					// TODO: Complete this function
					// NOTE: This function will get replaced when "NodeJs.js" is loaded.
					// NOTE: Why it's never simple like this ?
					// NOTE: Windows older than Windows NT not supported
					// NOTE: Macintosh older than OS/X not supported
					let os = __Internal__.os;
					if (!os) {
						const platform = _shared.Natives.windowNavigator.platform.toLowerCase().slice(0, 3),
							name = ((platform === 'win') ? 'win32' : ((platform === 'lin') ? 'linux' : ((platform === 'iph') || (platform === 'ipo') || (platform === 'ipa') || (platform === 'mac') || (platform === 'pik') ? 'darwin' : (platform === 'fre' ? 'freebsd' : (platform === 'ope' ? 'openbsd' : (platform === 'sun' ? 'sunos' : 'other')))))),
							type = ((name === 'win32') ? 'windows' : ((name === 'linux') ? 'linux' : 'unix')),
							caseSensitive = tools.getOptions().caseSensitive;
						os = types.freezeObject(tools.nullObject({
							name: name, // 'win32', 'linux', 'darwin', 'freebsd', 'openbsd', 'sunos', 'other' (like Node.js, excepted 'other')
							type: type,  // 'windows', 'linux', 'unix' (Note: Defaults to 'unix' for Macs and mobiles)
							//mobile: false, // TODO: "true" for Android, Windows CE, Windows Mobile, iOS, ...
							//architecture: ...,
							dirChar: ((name === 'win32') ? '\\' : '/'),
							newLine: ((name === 'win32') ? '\r\n' : '\n'),
							caseSensitive: (types.isNothing(caseSensitive) ? ((name === 'win32') || (name === 'darwin') ? false : true) : caseSensitive), // NOTE: Because it is impossible to detect, we give what is the most popular per os
						}));
						__Internal__.os = os;
					};
					return os;
				}));

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
					// Source: http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
					const navigator = _shared.Natives.windowNavigator;
					const tmp = tools.split(((navigator.languages && navigator.languages[+alt || 0]) || navigator.language || navigator.userLanguage || 'en_US').replace('-', '_'), '_', 2);
					if (tmp.length < 2) {
						return tmp[0];
					};
					return tmp[0] + '_' + tmp[1].toUpperCase();
				}));
		},
	};
	return modules;
};

//! END_MODULE()
