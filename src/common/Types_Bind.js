//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Types_Bind.js - Bind/Unbind
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
	modules['Doodad.Types/Bind'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		bootstrap: true,
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

			//const __Internal__ = {
			//};

			//===================================
			// Native functions
			//===================================

			tools.complete(_shared.Natives, {
				// "bind"
				functionBindCall: Function.prototype.bind.call.bind(Function.prototype.bind),
				functionBindApply: Function.prototype.bind.apply.bind(Function.prototype.bind),
			});

			//===================================
			// Bind/Unbind
			//===================================

			types.ADD('bind', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 4,
						params: {
							obj: {
								type: 'object',
								optional: false,
								description: "An object.",
							},
							fn: {
								type: 'function',
								optional: false,
								description: "A function.",
							},
							args: {
								type: 'arrayof(any)',
								optional: true,
								description: "Function arguments.",
							},
						},
						returns: 'object',
						description: "Binds a function to an object (so that 'this' will always be that object) and returns the resulting function. Owned properties are also preserved. Ruturns 'null' when function can't be bound.",
					}
				//! END_REPLACE()
				, function bind(obj, fn, /*optional*/args) {
					fn = types.unbind(fn) || fn;
					if (!types.isBindable(fn)) {
						return null;
					};
					let newFn;
					if (args) {
						newFn = _shared.Natives.functionBindApply(fn, tools.append([obj], args));
					} else {
						newFn = _shared.Natives.functionBindCall(fn, obj);
					};
					tools.extend(newFn, fn);
					newFn[_shared.BoundObjectSymbol] = obj;
					newFn[_shared.OriginalValueSymbol] = fn;
					return newFn;
				}));

			types.ADD('unbind', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 6,
						params: {
							fn: {
								type: 'function',
								optional: false,
								description: "A function.",
							},
						},
						returns: 'object',
						description: "Unbinds a function and returns the resulting function. Owned properties are also updated. Returns 'null' when function can't be unbound.",
					}
				//! END_REPLACE()
				, function unbind(fn) {
					if (!types.isFunction(fn)) {
						return null;
					};
					if (types.has(fn, _shared.BoundObjectSymbol)) {
						const oldFn = types.get(fn, _shared.OriginalValueSymbol);
						if (!types.isBindable(oldFn)) {
							return null;
						};
						const keys = tools.append(types.keys(fn), types.symbols(fn)),
							keysLen = keys.length;
						for (let i = 0; i < keysLen; i++) {
							const key = keys[i];
							if ((key !== _shared.BoundObjectSymbol) && (key !== _shared.OriginalValueSymbol)) {
								if (types.has(oldFn, key)) {
									oldFn[key] = fn[key];
								};
							};
						};
						return oldFn;
					} else {
						return null;
					}
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
