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

exports.add = function add(DD_MODULES) {
	DD_MODULES = (DD_MODULES || {});
	DD_MODULES['Doodad.Test.Types.Type'] = {
		type: 'TestModule',
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Test.Types'],

		// Unit
		priority: null,

		proto: {
			run: function run(root, /*optional*/options) {
				"use strict";

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
					
					
				global.Type = types.Type;

				global.Test1 = types.INIT(types.Type.$inherit(
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
					
				global.objTest1 = new global.Test1();
					
				global.Test2 = types.INIT(types.SINGLETON(types.Type.$inherit(
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
					
				global.Test3 = types.INIT(global.Test1.$inherit(
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
					
				global.objTest3 = new global.Test3();


				let command;


				command = test.prepareCommand(types.isType, "Doodad.Types.isType");
				command.run(false, {eval: true, repetitions: 100},        /**/ "undefined");
				command.run(false, {eval: true, repetitions: 100},        /**/ "null");
				command.run(false, {eval: true, repetitions: 100},        /**/ "''");
				command.run(false, {eval: true, repetitions: 100},        /**/ "1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "0.1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "NaN");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Infinity");
				command.run(false, {eval: true, repetitions: 100},        /**/ "true");
				command.run(false, {eval: true, repetitions: 100},        /**/ "{}");
				command.run(false, {eval: true, repetitions: 100},        /**/ "[]");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new String('')");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(1)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(0.1)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(NaN)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(Infinity)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Boolean(false)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Date");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Error");
				command.run(false, {eval: true, repetitions: 100},        /**/ "(function(){})");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Object.prototype.toString");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Object");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3");
				command.end();

				command = test.prepareCommand(types.isJsFunction, "Doodad.Types.isJsFunction");
				command.run(false, {eval: true, repetitions: 100},        /**/ "undefined");
				command.run(false, {eval: true, repetitions: 100},        /**/ "null");
				command.run(false, {eval: true, repetitions: 100},        /**/ "''");
				command.run(false, {eval: true, repetitions: 100},        /**/ "1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "0.1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "NaN");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Infinity");
				command.run(false, {eval: true, repetitions: 100},        /**/ "true");
				command.run(false, {eval: true, repetitions: 100},        /**/ "{}");
				command.run(false, {eval: true, repetitions: 100},        /**/ "[]");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new String('')");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(1)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(0.1)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(NaN)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(Infinity)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Boolean(false)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Date");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Error");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "(function(){})");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Object.prototype.toString");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Object");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3");
				command.end();

				command = test.prepareCommand(types.isJsObject, "Doodad.Types.isJsObject");
				command.run(false, {eval: true, repetitions: 100},        /**/ "undefined");
				command.run(false, {eval: true, repetitions: 100},        /**/ "null");
				command.run(false, {eval: true, repetitions: 100},        /**/ "''");
				command.run(false, {eval: true, repetitions: 100},        /**/ "1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "0.1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "NaN");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Infinity");
				command.run(false, {eval: true, repetitions: 100},        /**/ "true");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "{}");
				command.run(false, {eval: true, repetitions: 100},        /**/ "[]");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new String('')");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(1)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(0.1)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(NaN)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Number(Infinity)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Boolean(false)");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Date");
				command.run(false, {eval: true, repetitions: 100},        /**/ "new Error");
				command.run(false, {eval: true, repetitions: 100},        /**/ "(function(){})");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Object.prototype.toString");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Object");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3");
				command.end();

					
					
				command = test.prepareCommand(function(obj, type) {
					return obj instanceof type;
				}, "obj instanceof type");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest1", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test2", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Type");

				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest1", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Test1");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test3");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Test3");
					
				command.end();

					
				command = test.prepareCommand(types._instanceof, "Doodad.Types._instanceof");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest1", "Type");
				command.run(true, {eval: true, repetitions: 100},        /**/ "Test2", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Type");

				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest1", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Test1");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3", "Test2");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test3");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Test3");
					
				command.end();

					
				command = test.prepareCommand(types.baseof, "Doodad.Types.baseof");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3", "Type");

				command.run(true,  {eval: true, repetitions: 100},        /**/ "Type", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3", "Test1");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3", "Test2");
					
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Type", "Test3");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3", "Test3");
					
				command.end();

					
				command = test.prepareCommand(types.is, "Doodad.Types.is");
					
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Type", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Type");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3", "Type");

				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test1", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest1", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3", "Test1");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test2");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test2", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3", "Test2");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test3");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test3", "Test3");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Test3");
					
				command.end();

					
				command = test.prepareCommand(types.isLike, "Doodad.Types.isLike");
					
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Type", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test1", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest1", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test2", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test3", "Type");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Type");

				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test1", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest1", "Test1");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test3", "Test1");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Test1");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test2");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test2", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test3", "Test2");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest3", "Test2");
					
				command.run(false, {eval: true, repetitions: 100},        /**/ "Type", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "objTest1", "Test3");
				command.run(false, {eval: true, repetitions: 100},        /**/ "Test2", "Test3");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "Test3", "Test3");
				command.run(true,  {eval: true, repetitions: 100},        /**/ "objTest3", "Test3");
					
				command.end();

					
				command = test.prepareCommand(function(obj, attr) {
					return obj[attr];
				}, "obj[attr]");
					
				command.run(1,         {eval: true},    /**/ "Test1", "'typeAttribute'");
				command.run(undefined, {eval: true},    /**/ "Test1", "'instanceAttribute'");

				command.run(undefined, {eval: true},    /**/ "objTest1", "'typeAttribute'");
				command.run(2,         {eval: true},    /**/ "objTest1", "'instanceAttribute'");

				command.run(undefined, {eval: true},    /**/ "Test2", "'typeAttribute'");
				command.run(2,         {eval: true},    /**/ "Test2", "'instanceAttribute'");

				command.run(3,         {eval: true},    /**/ "Test3", "'typeAttribute'");
				command.run(undefined, {eval: true},    /**/ "Test3", "'instanceAttribute'");

				command.run(undefined, {eval: true},    /**/ "objTest3", "'typeAttribute'");
				command.run(4,         {eval: true},    /**/ "objTest3", "'instanceAttribute'");
					
				command.end();

				command = test.prepareCommand(function(obj, attr) {
					const fn = obj[attr];
					return fn && fn.apply(obj);
				}, "obj[attr]()");
					
				command.run(1,         {eval: true},    /**/ "Test1", "'typeMethod'");
				command.run(2,         {eval: true},    /**/ "Test1", "'typeMethodNoSuper'");
				command.run(3,         {eval: true},    /**/ "Test1", "'typeMethodNoOverride'");
				command.run(undefined, {eval: true},    /**/ "Test1", "'instanceMethod'");
				command.run(undefined, {eval: true},    /**/ "Test1", "'instanceMethodNoSuper'");
				command.run(undefined, {eval: true},    /**/ "Test1", "'instanceMethodNoOverride'");

				command.run(undefined, {eval: true},    /**/ "objTest1", "'typeMethod'");
				command.run(undefined, {eval: true},    /**/ "objTest1", "'typeMethodNoSuper'");
				command.run(undefined, {eval: true},    /**/ "objTest1", "'typeMethodNoOverride'");
				command.run(2,         {eval: true},    /**/ "objTest1", "'instanceMethod'");
				command.run(3,         {eval: true},    /**/ "objTest1", "'instanceMethodNoSuper'");
				command.run(4,         {eval: true},    /**/ "objTest1", "'instanceMethodNoOverride'");

				command.run(undefined, {eval: true},    /**/ "Test2", "'typeMethod'");
				command.run(2,         {eval: true},    /**/ "Test2", "'instanceMethod'");

				command.run(1,         {eval: true},    /**/ "Test3", "'typeMethod'");
				command.run(4,         {eval: true},    /**/ "Test3", "'typeMethodNoSuper'");
				command.run(3,         {eval: true},    /**/ "Test3", "'typeMethodNoOverride'");
				command.run(undefined, {eval: true},    /**/ "Test3", "'instanceMethod'");
				command.run(undefined, {eval: true},    /**/ "Test3", "'instanceMethodNoSuper'");
				command.run(undefined, {eval: true},    /**/ "Test3", "'instanceMethodNoOverride'");

				command.run(undefined, {eval: true},    /**/ "objTest3", "'typeMethod'");
				command.run(undefined, {eval: true},    /**/ "objTest3", "'typeMethodNoSuper'");
				command.run(undefined, {eval: true},    /**/ "objTest3", "'typeMethodNoOverride'");
				command.run(2,         {eval: true},    /**/ "objTest3", "'instanceMethod'");
				command.run(5,         {eval: true},    /**/ "objTest3", "'instanceMethodNoSuper'");
				command.run(4,         {eval: true},    /**/ "objTest3", "'instanceMethodNoOverride'");
					
				command.end();

					
				command = test.prepareCommand(types.getType, "Doodad.Types.getType");
					
				command.run("Type",   {eval: true, repetitions: 100},        /**/ "Type");
				command.run("Test1",  {eval: true, repetitions: 100},        /**/ "Test1");
				command.run("Test1",  {eval: true, repetitions: 100},        /**/ "objTest1");
				command.run("Test2.constructor",  {eval: true, repetitions: 100},        /**/ "Test2");
				command.run("Test3",  {eval: true, repetitions: 100},        /**/ "Test3");
				command.run("Test3",  {eval: true, repetitions: 100},        /**/ "objTest3");

				command.end();

					
				command = test.prepareCommand(types.getTypeName, "Doodad.Types.getTypeName");
					
				command.run("'Type'",   {eval: true, repetitions: 100},        /**/ "Type");
				command.run("'Test1'",  {eval: true, repetitions: 100},        /**/ "Test1");
				command.run("'Test1'",  {eval: true, repetitions: 100},        /**/ "objTest1");
				command.run("'Test2'",  {eval: true, repetitions: 100},        /**/ "Test2");
				command.run("'Test3'",  {eval: true, repetitions: 100},        /**/ "Test3");
				command.run("'Test3'",  {eval: true, repetitions: 100},        /**/ "objTest3");

				command.end();

					
				command = test.prepareCommand(types.getBase, "Doodad.Types.getBase");
					
	////			command.run("???",        {eval: true, repetitions: 100},        /**/ "Type");
				command.run("Type",     {eval: true, repetitions: 100},        /**/ "Test1");
				command.run("Type",     {eval: true, repetitions: 100},        /**/ "objTest1");
				command.run("Type",     {eval: true, repetitions: 100},        /**/ "Test2");
				command.run("Test1",    {eval: true, repetitions: 100},        /**/ "Test3");
				command.run("Test1",    {eval: true, repetitions: 100},        /**/ "objTest3");

				command.end();

					
				command = test.prepareCommand(function (obj) {
					return obj.toString();
				}, "obj.toString()");

				command.run("'[type Type]'",     {eval: true},        /**/ "Type");
				command.run("'[type Test1]'",    {eval: true},        /**/ "Test1");
				command.run("'[object Test1]'",  {eval: true},        /**/ "objTest1");
				command.run("'[object Test2]'",  {eval: true},        /**/ "Test2");
				command.run("'[type Test3]'",    {eval: true},        /**/ "Test3");
				command.run("'[object Test3]'",  {eval: true},        /**/ "objTest3");

				command.end();

					
				command = test.prepareCommand(function (obj) {
					return obj.toLocaleString();
				}, "obj.toLocaleString()");

				command.run("'[type Type]'",     {eval: true},        /**/ "Type");
				command.run("'[type Test1]'",    {eval: true},        /**/ "Test1");
				command.run("'[object Test1]'",  {eval: true},        /**/ "objTest1");
				command.run("'[object Test2]'",  {eval: true},        /**/ "Test2");
				command.run("'[type Test3]'",    {eval: true},        /**/ "Test3");
				command.run("'[object Test3]'",  {eval: true},        /**/ "objTest3");

				command.end();

					
				command = test.prepareCommand(function (obj) {
					return (types instanceof types.Namespace) && (types instanceof types.Type);
				}, "(Doodad.Types instanceof Doodad.Types.Namespace) && (Doodad.Types instanceof Doodad.Types.Type)");
				command.run(true);
				command.end();
					
					
			},
		},
	};
	return DD_MODULES;
};

//! END_MODULE()