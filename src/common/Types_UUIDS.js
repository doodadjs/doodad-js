//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Types_UUIDS.js - UUIDS database file loader.
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
	modules['Doodad.Types/uuids'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [],

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

			//// <FUTURE> Thread context
			//const __Internal__ = {
			//};


			//===================================
			// Options
			//===================================

			//let __options__ = tools.nullObject({
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
			//	windowPromise: (types.isFunction(global.Promise) ? global.Promise : undefined),
			//});

			//===================================
			// Init
			//===================================
			return function init(/*optional*/options) {
				const tempNatives = [
						//! IF(IS_SET("serverSide") && !IS_SET("browserify"))
							//! INCLUDE("%SOURCEDIR%/make/res/Natives_Node.inc.js", 'utf-8')
						//! ELSE()
							//! INCLUDE("%SOURCEDIR%/make/res/Natives.inc.js", 'utf-8')
						//! END_IF()
					],

					uuids = tools.nullObject();

				//const problematicAliases = tools.nullObject({
				//	// Firefox
				//	'Option': 'HTMLOptionElement',
				//	'HTMLOptionElement': 'Option',
				//	'Audio': 'HTMLAudioElement',
				//	'HTMLAudioElement': 'Audio',
				//	'Image': 'HTMLImageElement',
				//	'HTMLImageElement': 'Image',
				//
				//	// Safari
				//	'AnimationEvent': 'WebKitAnimationEvent',
				//	'WebKitAnimationEvent': 'AnimationEvent',
				//	'TransitionEvent': 'WebKitTransitionEvent',
				//	'WebKitTransitionEvent': 'TransitionEvent',
				//
				//	// Edge
				//	'DOMTokenList': 'DOMSettableTokenList',
				//	'DOMSettableTokenList': 'DOMTokenList',
				//
				//	// Chrome
				//	'DOMMatrix': 'WebKitCSSMatrix',
				//	'WebKitCSSMatrix': 'DOMMatrix',
				//});

				for (let i = 0; i < tempNatives.length; i++) {
					const item = tempNatives[i],
						name = item[0],
						//native = (name === 'Promise' && _shared.Natives.windowPromise || global[name]);
						native = global[name];

					if (types.isFunction(native) && types.isObjectLike(native.prototype) && types.isExtensible(native) && types.isExtensible(native.prototype)) {
						//if (types.has(problematicAliases, name)) {
						//	const alias = global[problematicAliases[name]];
						//	if (alias && (native !== alias)) {
						//		// <PRB> Some natives share the same prototype, or are duplicated.
						//		continue;
						//	};
						//};

						const uuid = item[1],
							nativeUUID = /*! REPLACE_BY(TO_SOURCE(UUID('NATIVE_TYPE')), true) */ '__NATIVE_TYPE__' /*! END_REPLACE() */ + uuid;

						if (types.has(native, _shared.UUIDSymbol) || types.has(native.prototype, _shared.UUIDSymbol)) {
							continue;
							//	// Aliases
							//	if ((native[_shared.UUIDSymbol] === nativeUUID) && (native.prototype[_shared.UUIDSymbol] === nativeUUID)) {
							//		continue;
							//	} else {
							//		//console.log(name);
							//		//continue;
							//		throw new types.Error("Wrong UUID for native constructor '~0~'.", [name]);
							//	};
						};

						if (types.has(uuids, uuid)) {
							throw new types.Error("Duplicated UUID : ~0~.", [uuid]);
						};

						uuids[uuid] = true;

						//try {
						types.setAttribute(native, _shared.UUIDSymbol, nativeUUID, {});
						types.setAttribute(native.prototype, _shared.UUIDSymbol, nativeUUID, {});
						//} catch(ex) {
						//	console.log(name);
						//};
					};
				};
			};
		},
	};
	return modules;
};

//! END_MODULE()
