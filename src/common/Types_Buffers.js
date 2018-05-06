//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Types_Buffers.js - Buffer types.
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
	modules['Doodad.Types/Buffers'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,

		dependencies: [
			'Doodad.Tools',
		],

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				tools = doodad.Tools,
				types = doodad.Types;

			//===================================
			// Internal
			//===================================

			const __Internal__ = {
			};

			//===================================
			// Native functions
			//===================================

			tools.complete(_shared.Natives, {
				// "isArrayBuffer"
				windowArrayBuffer: (global.ArrayBuffer ? global.ArrayBuffer : null),

				// "isTypesArray"
				windowTypedArray: null,
			});

			//===================================
			// Buffers
			//===================================

			types.ADD('isArrayBuffer', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if object is an array buffer. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, (_shared.Natives.windowArrayBuffer ? (function isArrayBuffer(obj) {
					return types._instanceof(obj, _shared.Natives.windowArrayBuffer);
				}) : (function isArrayBuffer(obj) {
					// ArrayBuffer is not implemented.
					return false;
				}))));

			//===================================
			// Typed Arrays
			//===================================

			__Internal__.TypedArrays = null;
			if (global.Int8Array) {
				try {
					_shared.Natives.windowTypedArray = types.getPrototypeOf(global.Int8Array.prototype).constructor;

					if (_shared.Natives.windowTypedArray === global.Object) {
						// <PRB> NodeJs has no TypedArray constructor.
						//delete _shared.Natives.windowTypedArray;
						_shared.Natives.windowTypedArray = null;
						__Internal__.TypedArrays = [global.Int8Array, global.Uint8Array, global.Uint8ClampedArray, global.Int16Array,
							global.Uint16Array, global.Int32Array, global.Uint32Array, global.Float32Array,
							global.Float64Array];
					} else {
						// <PRB> Because the TypedArray constructor is not global, "_shared.getTypeSymbol" needs that Symbol.
						// eslint-disable-next-line semi-spacing
						_shared.Natives.windowTypedArray[_shared.UUIDSymbol] = '' /*! INJECT('+' + TO_SOURCE(UUID('Native_TypedArray')), true) */;
					};
				} catch(ex) {
					// Do nothing
				};
			};

			types.ADD('isTypedArray', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if object is a typed array (an array buffer view). Returns 'false' otherwise. Note: May not be cross-realm.",
					}
				//! END_REPLACE()
				, (_shared.Natives.windowTypedArray ? (function isTypedArray(obj) {
					return types._instanceof(obj, _shared.Natives.windowTypedArray);

				}) : (__Internal__.TypedArrays ? (function isTypedArray(obj) {
					// <PRB> NodeJs has no TypedArray constructor.
					for (let i = 0; i < __Internal__.TypedArrays.length; i++) {
						const type = __Internal__.TypedArrays[i];
						if (type && types._instanceof(obj, type)) {
							return true;
						};
					};
					return false;

				}) : (function isTypedArray(obj) {
					// Typed arrays are not implemented.
					return false;

				})))));


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
