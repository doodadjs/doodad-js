//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Types_Conversion.js - Unit testing module file
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
	mods['Doodad.Test.Types.Conversion'] = {
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
					

				test.runCommand(types.toObject, "Doodad.Types.toObject", function(command, options) {
					command.runStep(types.Undefined, {eval: true, mode: 'is'}, /**/ "undefined");
					command.runStep(types.Null, {eval: true, mode: 'is'},      /**/ "null");
					command.runStep("String", {eval: true, mode: 'is'},        /**/ "''");
					command.runStep("Number", {eval: true, mode: 'is'},        /**/ "1");
					command.runStep("Number", {eval: true, mode: 'is'},        /**/ "0.1");
					command.runStep("Number", {eval: true, mode: 'is'},        /**/ "NaN");
					command.runStep("Number", {eval: true, mode: 'is'},        /**/ "Infinity");
					command.runStep("Boolean", {eval: true, mode: 'is'},       /**/ "true");
					command.runStep("Object", {eval: true, mode: 'is'},        /**/ "{}");
					command.runStep("Array",  {eval: true, mode: 'is'},        /**/ "[]");
					command.runStep("String", {eval: true, mode: 'is'},        /**/ "new String('')");
					command.runStep("Number", {eval: true, mode: 'is'},        /**/ "new Number(1)");
					command.runStep("Number", {eval: true, mode: 'is'},        /**/ "new Number(0.1)");
					command.runStep("Number", {eval: true, mode: 'is'},        /**/ "new Number(NaN)");
					command.runStep("Number", {eval: true, mode: 'is'},        /**/ "new Number(Infinity)");
					command.runStep("Boolean", {eval: true, mode: 'is'},       /**/ "new Boolean(false)");
					command.runStep("Date",   {eval: true, mode: 'is'},        /**/ "new Date");
					command.runStep("Error",  {eval: true, mode: 'is'},        /**/ "new Error");
					//command.runStep("Function", {eval: true, mode: 'is'},      /**/ "(function(){})");
					//command.runStep("Function", {eval: true, mode: 'is'},      /**/ "Object.prototype.toString");
					//command.runStep("Function", {eval: true, mode: 'is'},      /**/ "Object");
					//command.runStep("Object", {eval: true, mode: 'is'},        /**/ "arguments");
				});

					
				test.runCommand(types.toArray, "Doodad.Types.toArray", function(command, options) {
					command.runStep(global.TypeError || types.TypeError, {eval: true, mode: 'isinstance'}, /**/ "undefined");
					command.runStep(global.TypeError || types.TypeError, {eval: true, mode: 'isinstance'}, /**/ "null");
					command.runStep("[]",    {eval: true},                            /**/ "''");
					command.runStep("['h', 'e', 'l', 'l', 'o']",  {eval: true},       /**/ "'hello'");
					command.runStep("[]",   {eval: true},                             /**/ "1");
					command.runStep("[]", {eval: true},                               /**/ "0.1");
					command.runStep("[]", {eval: true},                               /**/ "NaN");
					command.runStep("[]", {eval: true},                               /**/ "Infinity");
					command.runStep("[]", {eval: true},                               /**/ "true");
					command.runStep("[]", {eval: true},                               /**/ "{}");
					command.runStep("[]",    {eval: true},                            /**/ "[]");
					command.runStep("[]",    {eval: true},                            /**/ "new String('')");
					command.runStep("['h', 'e', 'l', 'l', 'o']",  {eval: true},       /**/ "new String('hello')");
					command.runStep("[]",   {eval: true},                             /**/ "new Number(1)");
					command.runStep("[]", {eval: true},                               /**/ "new Number(0.1)");
					command.runStep("[]", {eval: true},                               /**/ "new Number(NaN)");
					command.runStep("[]", {eval: true},                               /**/ "new Number(Infinity)");
					command.runStep("[]", {eval: true},                               /**/ "new Boolean(false)");
					command.runStep("[]", {eval: true},                               /**/ "new Date()");
					command.runStep("[]", {eval: true},                               /**/ "new Error()");
					command.runStep("[]", {eval: true},                               /**/ "(function(){})");
					command.runStep("[]", {eval: true},                               /**/ "Object.prototype.toString");
					command.runStep("[undefined]", {eval: true},                      /**/ "Object");
					command.runStep("[1, 2, 3]", {eval: true},                        /**/ "(function(){return arguments})(1,2,3)");
					command.runStep("[undefined, undefined, undefined]", {eval: true},  /**/ "{length: 3}");
				});

					
				test.runCommand(types.toBoolean, "Doodad.Types.toBoolean", function(command, options) {
					command.runStep(false, {eval: true},        /**/ "undefined");
					command.runStep(false, {eval: true},        /**/ "null");
					command.runStep(false, {eval: true},        /**/ "''");
					command.runStep(true,  {eval: true},        /**/ "1");
					command.runStep(true,  {eval: true},        /**/ "0.1");
					command.runStep(false, {eval: true},        /**/ "NaN");
					command.runStep(true,  {eval: true},        /**/ "Infinity");
					command.runStep(true,  {eval: true},        /**/ "true");
					command.runStep(false, {eval: true},        /**/ "{}");
					command.runStep(false, {eval: true},        /**/ "[]");
					command.runStep(false, {eval: true},        /**/ "new String('')");
					command.runStep(true,  {eval: true},        /**/ "new Number(1)");
					command.runStep(true,  {eval: true},        /**/ "new Number(0.1)");
					command.runStep(false, {eval: true},        /**/ "new Number(NaN)");
					command.runStep(true,  {eval: true},        /**/ "new Number(Infinity)");
					command.runStep(false, {eval: true},        /**/ "new Boolean(false)");
					command.runStep(true,  {eval: true},        /**/ "new Date");
					command.runStep(false, {eval: true},        /**/ "new Error");
					command.runStep(false, {eval: true},        /**/ "(function(){})");
					command.runStep(false, {eval: true},        /**/ "Object.prototype.toString");
					command.runStep(false, {eval: true},        /**/ "Object");
					command.runStep(false, {eval: true},        /**/ "arguments");
				});

					
				test.runCommand(types.toString, "Doodad.Types.toString", function(command, options) {
					command.runStep("'undefined'", {eval: true},        /**/ "undefined");
					command.runStep("'null'", {eval: true},             /**/ "null");
					command.runStep("''", {eval: true},                 /**/ "''");
					command.runStep("'1'",  {eval: true},               /**/ "1");
					command.runStep("'0.1'", {eval: true},              /**/ "0.1");
					command.runStep("'NaN'", {eval: true},              /**/ "NaN");
					command.runStep("'Infinity'", {eval: true},         /**/ "Infinity");
					command.runStep("'true'",  {eval: true},            /**/ "true");
					command.runStep("'[object Object]'", {eval: true},  /**/ "{}");
					command.runStep("''", {eval: true},                 /**/ "[]");
					command.runStep("''", {eval: true},                 /**/ "new String('')");
					command.runStep("'1'",  {eval: true},               /**/ "new Number(1)");
					command.runStep("'0.1'", {eval: true},              /**/ "new Number(0.1)");
					command.runStep("'NaN'", {eval: true},              /**/ "new Number(NaN)");
					command.runStep("'Infinity'", {eval: true},         /**/ "new Number(Infinity)");
					command.runStep("'false'", {eval: true},            /**/ "new Boolean(false)");
					//command.runStep(, {eval: true},        /**/ "new Date");
					command.runStep("'Error'", {eval: true},            /**/ "new Error");
					//command.runStep(, {eval: true},        /**/ "(function(){})");
					//command.runStep(, {eval: true},        /**/ "Object.prototype.toString");
					//command.runStep(, {eval: true},        /**/ "Object");
					command.runStep("'[object Arguments]'", {eval: true}, /**/ "arguments");
				});
	
			},
		},
	};
	return mods;
};

//! END_MODULE()
