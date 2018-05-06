//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Types_Iterators.js - Iterators
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
	modules['Doodad.Types/Iterators'] = {
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
				// "hasIterators", "isIterable"
				symbolIterator: global.Symbol.iterator,
			});

			//===================================
			// Iterators
			//===================================

			types.ADD('isIterable', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if object is iterable. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isIterable(obj) {
					if (types.isNothing(obj)) {
						return false;
					};
					return (typeof obj === 'string') || ((typeof obj === 'object') && (_shared.Natives.symbolIterator in obj));
				}));


			// <PRB> As usual, JS doesn't give a way to make sure an object is an iterator
			types.ADD('isIteratorLike', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 2,
						params: {
							obj: {
								type: 'any',
								optional: false,
								description: "An object to test for.",
							},
						},
						returns: 'bool',
						description: "Returns 'true' if object looks like an iterator. Returns 'false' otherwise.",
					}
				//! END_REPLACE()
				, function isIteratorLike(obj) {
					return types.isObjectLike(obj) && types.isFunction(obj.next);
				}));


			types.ADD('Iterator', types.Type.$inherit(
				{
					$TYPE_NAME: 'Iterator',
					$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Iterator')), true) */,
				},
				{
					_new: types.SUPER(function _new() {
						this._super();

						// <PRB> "Symbol.iterator" must be there for "[...iter]" and "for...of" even when we return the iterator itself.
						const self = this;
						types.setAttribute(this, _shared.Natives.symbolIterator, function() {
							return self;
						}, {});
					}),

					close: null, // function()

					next: function next() {
						return {
							done: true,
						};
					},
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
