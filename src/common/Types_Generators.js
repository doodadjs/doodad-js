//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Types_Generators.js - Generators
// Project home: https://github.com/doodadjs/
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2015-2017 Claude Petit
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

module.exports = {
	add: function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Types/Generators'] = {
			version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
			
			create: function create(root, /*optional*/_options, _shared) {
				"use strict";

				//===================================
				// Get namespaces
				//===================================

				var doodad = root.Doodad,
					types = doodad.Types;
				
				//===================================
				// Internal
				//===================================
				
				//var __Internal__ = {
				//};

				//===================================
				// Native functions
				//===================================
					
				types.complete(_shared.Natives, {
					// "isGeneratorFunction" Firefox (why "isGenerator" is in the prototype ???)
					functionIsGeneratorCall: (global.Function && global.Function.prototype && types.isNativeFunction(global.Function.prototype.isGenerator) ? global.Function.prototype.isGenerator.call.bind(global.Function.prototype.isGenerator) : undefined),
				});

				//===================================
				// Generators
				//===================================
				
				// <PRB> "Generator" and "GeneratorFunction" are not in the global space !!!
				// <PRB> "Generator" looks like not having a class !!!
				// <PRB> Enventually, another design mistake... no official way to test if an object is a GeneratorFunction or a Generator !!! (the reason invoked again is "there is no use case")
				
				try {
					_shared.Natives.GeneratorFunction = types.getPrototypeOf(types.eval("function*(){}")).constructor;

					// <PRB> Because the GeneratorFunction constructor is not global, "_shared.getTypeSymbol" needs that Symbol.
					_shared.Natives.GeneratorFunction[_shared.UUIDSymbol] = '' /*! INJECT('+' + TO_SOURCE(UUID('Native_GeneratorFunction')), true) */ ;
				} catch(ex) {
				};

				types.ADD('hasGenerators', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'bool',
								description: "Returns 'true' if the engine supports generators. 'false' otherwise.",
					}
					//! END_REPLACE()
					, (_shared.Natives.GeneratorFunction ? function hasGenerators() {
						return true;
					} : function hasGenerators() {
						return false;
					})));
				
				types.ADD('getGeneratorFunction', root.DD_DOC(
					//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
								author: "Claude Petit",
								revision: 0,
								params: null,
								returns: 'function',
								description: "Returns the 'GeneratorFunction' constructor.",
					}
					//! END_REPLACE()
					, function getGeneratorFunction() {
						return (_shared.Natives.GeneratorFunction || null);
					}));
				
				types.ADD('isGeneratorFunction', root.DD_DOC(
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
								description: "Returns 'true' if object is a generator function. Returns 'false' otherwise. Note: May not be cross-realm.",
					}
					//! END_REPLACE()
					, (_shared.Natives.functionIsGeneratorCall ? function isGeneratorFunction(obj) {
						return _shared.Natives.functionIsGeneratorCall(obj);
					} : (_shared.Natives.GeneratorFunction ? function isGeneratorFunction(obj) {
						return (typeof obj === 'function') && types._instanceof(obj, _shared.Natives.GeneratorFunction);
					} : function isGeneratorFunction(obj) {
						return false;
					}))));
				
				types.ADD('isGenerator', root.DD_DOC(
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
								description: "Returns 'true' if object is a generator iterator. Returns 'false' otherwise. Note: Not cross-realm.",
					}
					//! END_REPLACE()
					, (_shared.Natives.GeneratorFunction ? function isGenerator(obj) {
						if (types.isNothing(obj)) {
							return false;
						};
						if (typeof obj !== 'object') {
							return false;
						};
						var proto = types.getPrototypeOf(obj);
						if (proto) {
							proto = types.getPrototypeOf(proto);
						};
						if (!proto || !proto.constructor) {
							return false;
						};
						return (proto.constructor.constructor === _shared.Natives.GeneratorFunction);
					} : function isGenerator(obj) {
						return false;
					})));
				

				//===================================
				// Init
				//===================================
				//return function init(/*optional*/options) {
				//};
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()