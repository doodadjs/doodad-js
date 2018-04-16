//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Types_Array.js - Unit testing module file
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

exports.add = function add(mods) {
	mods = (mods || {});
	mods['Doodad.Test.Types.Array'] = {
		type: 'TestModule',
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Test.Types'],

		// Unit
		priority: null,

		proto: {
			run: function run(root, /*optional*/options) {
				const doodad = root.Doodad,
					types = doodad.Types,
					tools = doodad.Tools,
					namespaces = doodad.Namespaces,
					test = doodad.Test,
					unit = test.Types.Is,
					io = doodad.IO;

						
				if (!options) {
					options = {};
				};

					
				const createArray1 = function _createArray1() {
					const ar1 = [1, 2, 9, 10];
					ar1.a = 3;
					delete ar1[2];
					delete ar1[3];
					return ar1;
				};
					
				const createArray2 = function _createArray2() {
					const ar2 = [1, 2, 3];
					delete ar2[0];
					return ar2;
				};
					

				test.runCommand(types.has, "Doodad.Types.hasKey", function(command, options) {
					const ar1 = createArray1();
					
					command.runStep(false,       {}     /**/ );
					command.runStep(false,       {},    /**/ ar1);
					command.runStep(true,        {},    /**/ ar1, 0);
					command.runStep(true,        {},    /**/ ar1, 1);
					command.runStep(false,       {},    /**/ ar1, 2);
					command.runStep(true,        {},    /**/ ar1, 'a');
					command.runStep(false,       {},    /**/ ar1, 'b');
					command.runStep(false,       {},    /**/ ar1, 'toString');

				});

					
				test.runCommand(types.hasInherited, "Doodad.Types.hasKeyInherited", function(command, options) {
					const ar1 = createArray1();
					
					command.runStep(false,       {}     /**/ );
					command.runStep(false,       {},    /**/ ar1);
					command.runStep(true,        {},    /**/ ar1, 0);
					command.runStep(true,        {},    /**/ ar1, 1);
					command.runStep(false,       {},    /**/ ar1, 2);
					command.runStep(true,        {},    /**/ ar1, 'a');
					command.runStep(false,       {},    /**/ ar1, 'b');
					command.runStep(true,       {},    /**/ ar1, 'toString');  // "Array" has its own "toString"
					
				});

					
				test.runCommand(types.get, "Doodad.Types.get", function(command, options) {
					const ar1 = createArray1();
					
					command.runStep(undefined,   {}     /**/ );
					command.runStep(undefined,   {},    /**/ ar1);

					command.runStep(1,           {},    /**/ ar1, 0);
					command.runStep(2,           {},    /**/ ar1, 1);
					command.runStep(undefined,   {},    /**/ ar1, 2);
					command.runStep(3,           {},    /**/ ar1, 'a');
					command.runStep(undefined,   {},    /**/ ar1, 'b');
					command.runStep(undefined,   {},    /**/ ar1, 'toString');

					command.runStep(1,           {},    /**/ ar1, 0, 4);
					command.runStep(2,           {},    /**/ ar1, 1, 4);
					command.runStep(4,           {},    /**/ ar1, 2, 4);
					command.runStep(3,           {},    /**/ ar1, 'a', 4);
					command.runStep(4,           {},    /**/ ar1, 'b', 4);
					command.runStep(undefined,   {},    /**/ ar1, 'toString');

				});

					
				test.runCommand(types.gets, "Doodad.Types.gets", function(command, options) {
					const ar1 = createArray1();
					
					command.runStep({},        {}     /**/ );
					command.runStep({},        {},    /**/ ar1);
					command.runStep({},        {},    /**/ ar1);

					command.runStep({'0': 1},  {},    /**/ ar1, 0);
					command.runStep({'1': 2},  {},    /**/ ar1, 1);
					command.runStep({},        {},    /**/ ar1, 2);
					command.runStep({'a': 3},  {},    /**/ ar1, 'a');
					command.runStep({},        {},    /**/ ar1, 'b');
					command.runStep({},        {},    /**/ ar1, 'toString');

					command.runStep({'0': 1},  {},    /**/ ar1, 0, {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
					command.runStep({'1': 2},  {},    /**/ ar1, 1, {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
					command.runStep({'2': 6},  {},    /**/ ar1, 2, {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
					command.runStep({'a': 3},  {},    /**/ ar1, 'a', {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
					command.runStep({'b': 8},  {},    /**/ ar1, 'b', {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
					command.runStep({'toString': 9}, {},  /**/ ar1, 'toString', {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});

					command.runStep({'0': 1},          {},    /**/ ar1, [0]);
					command.runStep({'0': 1, 'a': 3},  {},    /**/ ar1, [0, 'a']);
					command.runStep({'0': 1},          {},    /**/ ar1, [0, 'b']);

					command.runStep({'0': 1},          {},    /**/ ar1, [0], {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
					command.runStep({'0': 1, 'a': 3},  {},    /**/ ar1, [0, 'a'], {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
					command.runStep({'0': 1, 'b': 8},  {},    /**/ ar1, [0, 'b'], {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});

				});

					
				test.runCommand(types.set, "Doodad.Types.set", function(command, options) {
					const ar1 = createArray1();
					
					command.runStep(4,           {},    /**/ ar1, 0, 4);
					command.runStep(5,           {},    /**/ ar1, 1, 5);
					command.runStep(undefined,   {},    /**/ ar1, 2, 6);
					command.runStep(7,           {},    /**/ ar1, 'a', 7);
					command.runStep(undefined,   {},    /**/ ar1, 'b', 8);

				});
					
					
				test.runCommand(types.sets, "Doodad.Types.sets", function(command, options) {
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep({'0': 4},  {},    /**/ ar1, {'0': 4});
						command.runStep({'1': 5},  {},    /**/ ar1, {'1': 5});
						command.runStep({},        {},    /**/ ar1, {'2': 6});
						command.runStep({'a': 7},  {},    /**/ ar1, {'a': 7});
						command.runStep({},        {},    /**/ ar1, {'b': 8});
					});

					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep({'0': 4, 'a': 7},  {},    /**/ ar1, {'0': 4, 'a': 7});
					});

					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep({'0': 4, 'a': 7},  {},    /**/ ar1, {'0': 4, 'a': 7, 'b': 8});
					});

				});


				test.runCommand(types.getDefault, "Doodad.Types.getDefault", function(command, options) {
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(undefined, {}     /**/ );
						command.runStep(undefined, {},    /**/ ar1);
						command.runStep(1,           {},    /**/ ar1, 0);
						command.runStep(2,           {},    /**/ ar1, 1);
						command.runStep(undefined, {},    /**/ ar1, 2);
						command.runStep(3,           {},    /**/ ar1, 'a');
						command.runStep(undefined, {},    /**/ ar1, 'b');
					});

					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep(1,           {},    /**/ ar1, 0, 4);
						command.runStep(2,           {},    /**/ ar1, 1, 4);
						command.runStep(4,           {},    /**/ ar1, 2, 4);
						command.runStep(3,           {},    /**/ ar1, 'a', 4);
						command.runStep(4,           {},    /**/ ar1, 'b', 4);
					});

				});

					
				test.runCommand(types.getsDefault, "Doodad.Types.getsDefault", function(command, options) {
					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep({},        {}     /**/ );
						command.runStep({},        {},    /**/ ar1);
						command.runStep({},        {},    /**/ ar1);
						command.runStep({'0': 1},  {},    /**/ ar1, 0);
						command.runStep({'1': 2},  {},    /**/ ar1, 1);
						command.runStep({},        {},    /**/ ar1, 2);
						command.runStep({'a': 3},  {},    /**/ ar1, 'a');
						command.runStep({},        {},    /**/ ar1, 'b');
					});

					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep({'0': 1},  {},    /**/ ar1, 0, {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
						command.runStep({'1': 2},  {},    /**/ ar1, 1, {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
						command.runStep({'2': 6},  {},    /**/ ar1, 2, {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
						command.runStep({'a': 3},  {},    /**/ ar1, 'a', {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
						command.runStep({'b': 8},  {},    /**/ ar1, 'b', {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
					});

					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep({'0': 1},          {},    /**/ ar1, [0]);
						command.runStep({'0': 1, 'a': 3},  {},    /**/ ar1, [0, 'a']);
						command.runStep({'0': 1},          {},    /**/ ar1, [0, 'b']);
					});

					command.chain(function(dummy) {
						const ar1 = createArray1();
						command.runStep({'0': 1},          {},    /**/ ar1, [0], {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
						command.runStep({'0': 1, 'a': 3},  {},    /**/ ar1, [0, 'a'], {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
						command.runStep({'0': 1, 'b': 8},  {},    /**/ ar1, [0, 'b'], {'0': 4, '1': 5, '2': 6, 'a': 7, 'b': 8, toString: 9});
					});

				});
					
					
				test.runCommand(types.keys, "Doodad.Types.keys", function(command, options) {
					const ar1 = createArray1();

					command.runStep([],                    {}     /**/ );
					command.runStep(['a'],                 {},    /**/ ar1);
				});
					
					
				test.runCommand(types.keysInherited, "Doodad.Types.keysInherited", function(command, options) {
					const ar1 = createArray1();

					command.runStep([],                    {}     /**/ );
					command.runStep(['a'],                 {},    /**/ ar1);
				});
					
					
				test.runCommand(types.values, "Doodad.Types.values", function(command, options) {
					const ar1 = createArray1();

					command.runStep([],                    {}     /**/ );
					command.runStep([3],                   {},    /**/ ar1);
				});
					
					
				test.runCommand(types.items, "Doodad.Types.items", function(command, options) {
					const ar1 = createArray1();

					command.runStep([],                    {depth: 1}     /**/ );
					command.runStep([[0, 1], [1, 2]],      {depth: 1},    /**/ ar1);
				});
					
					
				test.runCommand(types.hasIndex, "Doodad.Types.hasIndex", function(command, options) {
					const ar1 = createArray1();

					command.runStep(false, {}     /**/ );
					command.runStep(false, {},    /**/ ar1);
					command.runStep(true,  {},    /**/ ar1, 0);
					command.runStep(true,  {},    /**/ ar1, 1);
					command.runStep(false, {},    /**/ ar1, 2);
					command.runStep(false, {},    /**/ ar1, 'a');
					command.runStep(false, {},    /**/ ar1, 'b');
					command.runStep(false, {},    /**/ ar1, 'toString');
				});
					
					
				test.runCommand(types.indexes, "Doodad.Types.indexes", function(command, options) {
					const ar1 = createArray1();

					command.runStep([],                    {}     /**/ );
					command.runStep([0, 1],                {},    /**/ ar1);
				});
					
					
				test.runCommand(types.available, "Doodad.Types.available", function(command, options) {
					const ar1 = createArray1();

					command.runStep(-1,    {}     /**/ );
					command.runStep(-1,     {},   /**/ []);
					command.runStep(-1,     {},   /**/ [0, 1]);
					command.runStep(2,     {},    /**/ ar1);
				});
					
					
				test.runCommand(types.availables, "Doodad.Types.availables", function(command, options) {
					const ar1 = createArray1();

					command.runStep([],                    {}     /**/ );
					command.runStep([2, 3],                {},    /**/ ar1);
				});
					
					
				test.runCommand(types.isClonable, "Doodad.Types.isClonable", function(command, options) {
					const ar1 = createArray1();

					command.runStep(false,      {}     /**/ );
					command.runStep(true,       {},    /**/  ar1);
				});


				test.runCommand(types.clone, "Doodad.Types.clone", function(command, options) {
					const ar1 = createArray1();

					command.runStep(undefined,  {}                               /**/ );
					command.runStep(ar1, {not: true, mode: 'compare'},    /**/  ar1);
					command.runStep([1, 2, test.EmptySlot, test.EmptySlot], {},  /**/  ar1);
				});
				
			},
		},
	};
	return mods;
};

//! END_MODULE()
