//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Types_Type.js - Unit testing module file
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
	mods['Doodad.Test.Types.Type'] = {
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
					

				const __Internal__ = {
				};


				__Internal__.Test1 = types.INIT(types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Test1',
							
						typeAttribute: 1,
						typeMethod: function() {
							return 1;
						},
						typeMethodNoSuper: function() {
							return 2;
						},
						typeMethodNoOverride: function() {
							return 3;
						},
					},
					/*instanceProto*/
					{
						instanceAttribute: 2,
						instanceMethod: function() {
							return 2;
						},
						instanceMethodNoSuper: function() {
							return 3;
						},
						instanceMethodNoOverride: function() {
							return 4;
						},
					}
				));
					
				__Internal__.objTest1 = new __Internal__.Test1();
					
				__Internal__.Test2 = types.INIT(types.SINGLETON(types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Test2',
							
						typeAttribute: 1,
						typeMethod: function() {
							return 1;
						},
					},
					/*instanceProto*/
					{
						instanceAttribute: 2,
						instanceMethod: function() {
							return 2;
						},
					}
				)));
					
				__Internal__.Test3 = types.INIT(__Internal__.Test1.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Test3',
							
						typeAttribute: 3,
						typeMethod: types.SUPER(function() {
							return this._super();
						}),
						typeMethodNoSuper: function() {
							return 4;
						},
					},
					/*instanceProto*/
					{
						instanceAttribute: 4,
						instanceMethod: types.SUPER(function() {
							return this._super();
						}),
						instanceMethodNoSuper: function() {
							return 5;
						},
					}
				));
					
				__Internal__.objTest3 = new __Internal__.Test3();


				test.runCommand(types.isType, "Doodad.Types.isType", function(command, options) {
					command.runStep(false, {repetitions: 100},        /**/ undefined);
					command.runStep(false, {repetitions: 100},        /**/ null);
					command.runStep(false, {repetitions: 100},        /**/ '');
					command.runStep(false, {repetitions: 100},        /**/ 1);
					command.runStep(false, {repetitions: 100},        /**/ 0.1);
					command.runStep(false, {repetitions: 100},        /**/ NaN);
					command.runStep(false, {repetitions: 100},        /**/ Infinity);
					command.runStep(false, {repetitions: 100},        /**/ true);
					command.runStep(false, {repetitions: 100},        /**/ {});
					command.runStep(false, {repetitions: 100},        /**/ []);
					command.runStep(false, {repetitions: 100},        /**/ new String(''));
					command.runStep(false, {repetitions: 100},        /**/ new Number(1));
					command.runStep(false, {repetitions: 100},        /**/ new Number(0.1));
					command.runStep(false, {repetitions: 100},        /**/ new Number(NaN));
					command.runStep(false, {repetitions: 100},        /**/ new Number(Infinity));
					command.runStep(false, {repetitions: 100},        /**/ new Boolean(false));
					command.runStep(false, {repetitions: 100},        /**/ new Date);
					command.runStep(false, {repetitions: 100},        /**/ new Error);
					command.runStep(false, {repetitions: 100},        /**/ (function(){}));
					command.runStep(false, {repetitions: 100},        /**/ Object.prototype.toString);
					command.runStep(false, {repetitions: 100},        /**/ Object);
					command.runStep(true,  {repetitions: 100},        /**/ types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3);
				});

				test.runCommand(types.isJsFunction, "Doodad.Types.isJsFunction", function(command, options) {
					command.runStep(false, {repetitions: 100},        /**/ undefined);
					command.runStep(false, {repetitions: 100},        /**/ null);
					command.runStep(false, {repetitions: 100},        /**/ '');
					command.runStep(false, {repetitions: 100},        /**/ 1);
					command.runStep(false, {repetitions: 100},        /**/ 0.1);
					command.runStep(false, {repetitions: 100},        /**/ NaN);
					command.runStep(false, {repetitions: 100},        /**/ Infinity);
					command.runStep(false, {repetitions: 100},        /**/ true);
					command.runStep(false, {repetitions: 100},        /**/ {});
					command.runStep(false, {repetitions: 100},        /**/ []);
					command.runStep(false, {repetitions: 100},        /**/ new String(''));
					command.runStep(false, {repetitions: 100},        /**/ new Number(1));
					command.runStep(false, {repetitions: 100},        /**/ new Number(0.1));
					command.runStep(false, {repetitions: 100},        /**/ new Number(NaN));
					command.runStep(false, {repetitions: 100},        /**/ new Number(Infinity));
					command.runStep(false, {repetitions: 100},        /**/ new Boolean(false));
					command.runStep(false, {repetitions: 100},        /**/ new Date);
					command.runStep(false, {repetitions: 100},        /**/ new Error);
					command.runStep(true,  {repetitions: 100},        /**/ (function(){}));
					command.runStep(true,  {repetitions: 100},        /**/ Object.prototype.toString);
					command.runStep(true,  {repetitions: 100},        /**/ Object);
					command.runStep(false, {repetitions: 100},        /**/ types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3);
				});

				test.runCommand(types.isJsObject, "Doodad.Types.isJsObject", function(command, options) {
					command.runStep(false, {repetitions: 100},        /**/ undefined);
					command.runStep(false, {repetitions: 100},        /**/ null);
					command.runStep(false, {repetitions: 100},        /**/ '');
					command.runStep(false, {repetitions: 100},        /**/ 1);
					command.runStep(false, {repetitions: 100},        /**/ 0.1);
					command.runStep(false, {repetitions: 100},        /**/ NaN);
					command.runStep(false, {repetitions: 100},        /**/ Infinity);
					command.runStep(false, {repetitions: 100},        /**/ true);
					command.runStep(true,  {repetitions: 100},        /**/ {});
					command.runStep(false, {repetitions: 100},        /**/ []);
					command.runStep(false, {repetitions: 100},        /**/ new String(''));
					command.runStep(false, {repetitions: 100},        /**/ new Number(1));
					command.runStep(false, {repetitions: 100},        /**/ new Number(0.1));
					command.runStep(false, {repetitions: 100},        /**/ new Number(NaN));
					command.runStep(false, {repetitions: 100},        /**/ new Number(Infinity));
					command.runStep(false, {repetitions: 100},        /**/ new Boolean(false));
					command.runStep(false, {repetitions: 100},        /**/ new Date);
					command.runStep(false, {repetitions: 100},        /**/ new Error);
					command.runStep(false, {repetitions: 100},        /**/ (function(){}));
					command.runStep(false, {repetitions: 100},        /**/ Object.prototype.toString);
					command.runStep(false, {repetitions: 100},        /**/ Object);
					command.runStep(false, {repetitions: 100},        /**/ types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3);
				});

					
					
				test.runCommand(function(obj, type) {
					return obj instanceof type;
				}, "obj instanceof type", function(command, options) {
					
					command.runStep(false, {repetitions: 100},        /**/ types.Type, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest1, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test2, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, types.Type);

					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test1);
						
					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test3);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test3);
					
				});

					
				test.runCommand(types._instanceof, "Doodad.Types._instanceof", function(command, options) {
					
					command.runStep(false, {repetitions: 100},        /**/ types.Type, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest1, types.Type);
					command.runStep(true, {repetitions: 100},        /**/ __Internal__.Test2, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, types.Type);

					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test1);
						
					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test2);
						
					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test3);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test3);
					
				});

					
				test.runCommand(types.baseof, "Doodad.Types.baseof", function(command, options) {
					
					command.runStep(false, {repetitions: 100},        /**/ types.Type, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3, types.Type);

					command.runStep(true,  {repetitions: 100},        /**/ types.Type, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test1);
						
					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test2);
						
					command.runStep(true,  {repetitions: 100},        /**/ types.Type, __Internal__.Test3);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test3);
					
				});

					
				test.runCommand(types.is, "Doodad.Types.is", function(command, options) {
					
					command.runStep(true,  {repetitions: 100},        /**/ types.Type, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, types.Type);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3, types.Type);

					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test1);
						
					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test2);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test2);
						
					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test3);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test3);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test3);
					
				});

					
				test.runCommand(types.isLike, "Doodad.Types.isLike", function(command, options) {
					
					command.runStep(true,  {repetitions: 100},        /**/ types.Type, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test1, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest1, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test2, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test3, types.Type);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, types.Type);

					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test1);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test1);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test1);
						
					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test2);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test2);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test2);
						
					command.runStep(false, {repetitions: 100},        /**/ types.Type, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.objTest1, __Internal__.Test3);
					command.runStep(false, {repetitions: 100},        /**/ __Internal__.Test2, __Internal__.Test3);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.Test3, __Internal__.Test3);
					command.runStep(true,  {repetitions: 100},        /**/ __Internal__.objTest3, __Internal__.Test3);
					
				});

					
				test.runCommand(function(obj, attr) {
					return obj[attr];
				}, "obj[attr]", function(command, options) {
					
					command.runStep(1,         {},    /**/ __Internal__.Test1, 'typeAttribute');
					command.runStep(undefined, {},    /**/ __Internal__.Test1, 'instanceAttribute');

					command.runStep(undefined, {},    /**/ __Internal__.objTest1, 'typeAttribute');
					command.runStep(2,         {},    /**/ __Internal__.objTest1, 'instanceAttribute');

					command.runStep(undefined, {},    /**/ __Internal__.Test2, 'typeAttribute');
					command.runStep(2,         {},    /**/ __Internal__.Test2, 'instanceAttribute');

					command.runStep(3,         {},    /**/ __Internal__.Test3, 'typeAttribute');
					command.runStep(undefined, {},    /**/ __Internal__.Test3, 'instanceAttribute');

					command.runStep(undefined, {},    /**/ __Internal__.objTest3, 'typeAttribute');
					command.runStep(4,         {},    /**/ __Internal__.objTest3, 'instanceAttribute');
					
				});

				test.runCommand(function(obj, attr) {
					const fn = obj[attr];
					return fn && fn.apply(obj);
				}, "obj[attr]()", function(command, options) {
					
					command.runStep(1,         {},    /**/ __Internal__.Test1, 'typeMethod');
					command.runStep(2,         {},    /**/ __Internal__.Test1, 'typeMethodNoSuper');
					command.runStep(3,         {},    /**/ __Internal__.Test1, 'typeMethodNoOverride');
					command.runStep(undefined, {},    /**/ __Internal__.Test1, 'instanceMethod');
					command.runStep(undefined, {},    /**/ __Internal__.Test1, 'instanceMethodNoSuper');
					command.runStep(undefined, {},    /**/ __Internal__.Test1, 'instanceMethodNoOverride');

					command.runStep(undefined, {},    /**/ __Internal__.objTest1, 'typeMethod');
					command.runStep(undefined, {},    /**/ __Internal__.objTest1, 'typeMethodNoSuper');
					command.runStep(undefined, {},    /**/ __Internal__.objTest1, 'typeMethodNoOverride');
					command.runStep(2,         {},    /**/ __Internal__.objTest1, 'instanceMethod');
					command.runStep(3,         {},    /**/ __Internal__.objTest1, 'instanceMethodNoSuper');
					command.runStep(4,         {},    /**/ __Internal__.objTest1, 'instanceMethodNoOverride');

					command.runStep(undefined, {},    /**/ __Internal__.Test2, 'typeMethod');
					command.runStep(2,         {},    /**/ __Internal__.Test2, 'instanceMethod');

					command.runStep(1,         {},    /**/ __Internal__.Test3, 'typeMethod');
					command.runStep(4,         {},    /**/ __Internal__.Test3, 'typeMethodNoSuper');
					command.runStep(3,         {},    /**/ __Internal__.Test3, 'typeMethodNoOverride');
					command.runStep(undefined, {},    /**/ __Internal__.Test3, 'instanceMethod');
					command.runStep(undefined, {},    /**/ __Internal__.Test3, 'instanceMethodNoSuper');
					command.runStep(undefined, {},    /**/ __Internal__.Test3, 'instanceMethodNoOverride');

					command.runStep(undefined, {},    /**/ __Internal__.objTest3, 'typeMethod');
					command.runStep(undefined, {},    /**/ __Internal__.objTest3, 'typeMethodNoSuper');
					command.runStep(undefined, {},    /**/ __Internal__.objTest3, 'typeMethodNoOverride');
					command.runStep(2,         {},    /**/ __Internal__.objTest3, 'instanceMethod');
					command.runStep(5,         {},    /**/ __Internal__.objTest3, 'instanceMethodNoSuper');
					command.runStep(4,         {},    /**/ __Internal__.objTest3, 'instanceMethodNoOverride');
					
				});

					
				test.runCommand(types.getType, "Doodad.Types.getType", function(command, options) {
					
					command.runStep(types.Type,   {repetitions: 100},        /**/ types.Type);
					command.runStep(__Internal__.Test1,  {repetitions: 100},        /**/ __Internal__.Test1);
					command.runStep(__Internal__.Test1,  {repetitions: 100},        /**/ __Internal__.objTest1);
					command.runStep(__Internal__.Test2.constructor,  {repetitions: 100},        /**/ __Internal__.Test2);
					command.runStep(__Internal__.Test3,  {repetitions: 100},        /**/ __Internal__.Test3);
					command.runStep(__Internal__.Test3,  {repetitions: 100},        /**/ __Internal__.objTest3);

				});

					
				test.runCommand(types.getTypeName, "Doodad.Types.getTypeName", function(command, options) {
					
					command.runStep('Type',   {repetitions: 100},        /**/ types.Type);
					command.runStep('Test1',  {repetitions: 100},        /**/ __Internal__.Test1);
					command.runStep('Test1',  {repetitions: 100},        /**/ __Internal__.objTest1);
					command.runStep('Test2',  {repetitions: 100},        /**/ __Internal__.Test2);
					command.runStep('Test3',  {repetitions: 100},        /**/ __Internal__.Test3);
					command.runStep('Test3',  {repetitions: 100},        /**/ __Internal__.objTest3);

				});

					
				test.runCommand(types.getBase, "Doodad.Types.getBase", function(command, options) {
					
					//command.runStep("???",        {repetitions: 100},        /**/ types.Type);
					command.runStep(types.Type,     {repetitions: 100},        /**/ __Internal__.Test1);
					command.runStep(types.Type,     {repetitions: 100},        /**/ __Internal__.objTest1);
					command.runStep(types.Type,     {repetitions: 100},        /**/ __Internal__.Test2);
					command.runStep(__Internal__.Test1,    {repetitions: 100},        /**/ __Internal__.Test3);
					command.runStep(__Internal__.Test1,    {repetitions: 100},        /**/ __Internal__.objTest3);

				});

					
				test.runCommand(function (obj) {
					return obj.toString();
				}, "obj.toString()", function(command, options) {

					command.runStep('[type Type]',     {},        /**/ types.Type);
					command.runStep('[type Test1]',    {},        /**/ __Internal__.Test1);
					command.runStep('[object Test1]',  {},        /**/ __Internal__.objTest1);
					command.runStep('[object Test2]',  {},        /**/ __Internal__.Test2);
					command.runStep('[type Test3]',    {},        /**/ __Internal__.Test3);
					command.runStep('[object Test3]',  {},        /**/ __Internal__.objTest3);

				});

					
				test.runCommand(function (obj) {
					return obj.toLocaleString();
				}, "obj.toLocaleString()", function(command, options) {

					command.runStep('[type Type]',     {},        /**/ types.Type);
					command.runStep('[type Test1]',    {},        /**/ __Internal__.Test1);
					command.runStep('[object Test1]',  {},        /**/ __Internal__.objTest1);
					command.runStep('[object Test2]',  {},        /**/ __Internal__.Test2);
					command.runStep('[type Test3]',    {},        /**/ __Internal__.Test3);
					command.runStep('[object Test3]',  {},        /**/ __Internal__.objTest3);

				});

					
				test.runCommand(function (obj) {
					return (types instanceof types.Namespace) && (types instanceof types.Type);
				}, "(Doodad.Types instanceof Doodad.Types.Namespace) && (Doodad.Types instanceof Doodad.Types.Type)", function(command, options) {
					command.runStep(true);
				});
					
					
			},
		},
	};
	return mods;
};

//! END_MODULE()
