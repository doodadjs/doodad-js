//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Unit_Types_Conversion.js - Unit testing module file
// Project home: https://sourceforge.net/projects/doodad-js/
// Trunk: svn checkout svn://svn.code.sf.net/p/doodad-js/code/trunk doodad-js-code
// Author: Claude Petit, Quebec city
// Contact: doodadjs [at] gmail.com
// Note: I'm still in alpha-beta stage, so expect to find some bugs or incomplete parts !
// License: Apache V2
//
//	Copyright 2016 Claude Petit
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

(function() {
	var global = this;

	var exports = {};
	
	//! BEGIN_REMOVE()
	if ((typeof process === 'object') && (typeof module === 'object')) {
	//! END_REMOVE()
		//! IF_DEF("serverSide")
			module.exports = exports;
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
	
	exports.add = function add(DD_MODULES) {
		DD_MODULES = (DD_MODULES || {});
		DD_MODULES['Doodad.Test.Types.Conversion'] = {
			type: 'TestModule',
			version: '0d',
			dependencies: ['Doodad.Test.Types'],

			// Unit
			priority: null,
				proto: {
				run: null,
			},

			proto: {
				run: function run(entry, /*optional*/options) {
					"use strict";

					var root = entry.root,
						doodad = root.Doodad,
						types = doodad.Types,
						tools = doodad.Tools,
						namespaces = doodad.Namespaces,
						test = doodad.Test,
						unit = test.Types.Is,
						io = doodad.IO;

						
					if (!options) {
						options = {};
					};
					
					
					var command = test.prepareCommand(types.toObject, "Doodad.Types.toObject");
					command.run(types.Undefined, {eval: true, mode: 'is'}, /**/ "undefined");
					command.run(types.Null, {eval: true, mode: 'is'},      /**/ "null");
					command.run("String", {eval: true, mode: 'is'},        /**/ "''");
					command.run("Number", {eval: true, mode: 'is'},        /**/ "1");
					command.run("Number", {eval: true, mode: 'is'},        /**/ "0.1");
					command.run("Number", {eval: true, mode: 'is'},        /**/ "NaN");
					command.run("Number", {eval: true, mode: 'is'},        /**/ "Infinity");
					command.run("Boolean", {eval: true, mode: 'is'},       /**/ "true");
					command.run("Object", {eval: true, mode: 'is'},        /**/ "{}");
					command.run("Array",  {eval: true, mode: 'is'},        /**/ "[]");
					command.run("String", {eval: true, mode: 'is'},        /**/ "new String('')");
					command.run("Number", {eval: true, mode: 'is'},        /**/ "new Number(1)");
					command.run("Number", {eval: true, mode: 'is'},        /**/ "new Number(0.1)");
					command.run("Number", {eval: true, mode: 'is'},        /**/ "new Number(NaN)");
					command.run("Number", {eval: true, mode: 'is'},        /**/ "new Number(Infinity)");
					command.run("Boolean", {eval: true, mode: 'is'},       /**/ "new Boolean(false)");
					command.run("Date",   {eval: true, mode: 'is'},        /**/ "new Date");
					command.run("Error",  {eval: true, mode: 'is'},        /**/ "new Error");
					//command.run("Function", {eval: true, mode: 'is'},      /**/ "(function(){})");
					//command.run("Function", {eval: true, mode: 'is'},      /**/ "Object.prototype.toString");
					//command.run("Function", {eval: true, mode: 'is'},      /**/ "Object");
					//command.run("Object", {eval: true, mode: 'is'},        /**/ "arguments");
					command.end();

					global.testObject = {};
					global.testDate = new Date;
					global.testError = new Error;
					global.testFunction = (function(){});
					
					var command = test.prepareCommand(types.toArray, "Doodad.Types.toArray");
					command.run(global.TypeError || types.TypeError, {eval: true, mode: 'isinstance'}, /**/ "undefined");
					command.run(global.TypeError || types.TypeError, {eval: true, mode: 'isinstance'}, /**/ "null");
					command.run("[]",    {eval: true},                            /**/ "''");
					command.run("['h', 'e', 'l', 'l', 'o']",  {eval: true},       /**/ "'hello'");
					command.run("[]",   {eval: true},                             /**/ "1");
					command.run("[]", {eval: true},                               /**/ "0.1");
					command.run("[]", {eval: true},                               /**/ "NaN");
					command.run("[]", {eval: true},                               /**/ "Infinity");
					command.run("[]", {eval: true},                               /**/ "true");
					command.run("[]", {eval: true},                               /**/ "testObject");
					command.run("[]",    {eval: true},                            /**/ "[]");
					command.run("[]",    {eval: true},                            /**/ "new String('')");
					command.run("['h', 'e', 'l', 'l', 'o']",  {eval: true},       /**/ "new String('hello')");
					command.run("[]",   {eval: true},                             /**/ "new Number(1)");
					command.run("[]", {eval: true},                               /**/ "new Number(0.1)");
					command.run("[]", {eval: true},                               /**/ "new Number(NaN)");
					command.run("[]", {eval: true},                               /**/ "new Number(Infinity)");
					command.run("[]", {eval: true},                               /**/ "new Boolean(false)");
					command.run("[]", {eval: true},                               /**/ "testDate");
					command.run("[]", {eval: true},                               /**/ "testError");
					command.run("[]", {eval: true},                               /**/ "testFunction");
					command.run("[]", {eval: true},                               /**/ "Object.prototype.toString");
					command.run("[undefined]", {eval: true},                      /**/ "Object");
					command.run("[1, 2, 3]", {eval: true},                        /**/ "(function(){return arguments})(1,2,3)");
					command.run("[undefined, undefined, undefined]", {eval: true},  /**/ "{length: 3}");
					command.end();

					
					var command = test.prepareCommand(types.toBoolean, "Doodad.Types.toBoolean");
					command.run(false, {eval: true},        /**/ "undefined");
					command.run(false, {eval: true},        /**/ "null");
					command.run(false, {eval: true},        /**/ "''");
					command.run(true,  {eval: true},        /**/ "1");
					command.run(true,  {eval: true},        /**/ "0.1");
					command.run(false, {eval: true},        /**/ "NaN");
					command.run(true,  {eval: true},        /**/ "Infinity");
					command.run(true,  {eval: true},        /**/ "true");
					command.run(false, {eval: true},        /**/ "{}");
					command.run(false, {eval: true},        /**/ "[]");
					command.run(false, {eval: true},        /**/ "new String('')");
					command.run(true,  {eval: true},        /**/ "new Number(1)");
					command.run(true,  {eval: true},        /**/ "new Number(0.1)");
					command.run(false, {eval: true},        /**/ "new Number(NaN)");
					command.run(true,  {eval: true},        /**/ "new Number(Infinity)");
					command.run(false, {eval: true},        /**/ "new Boolean(false)");
					command.run(true,  {eval: true},        /**/ "new Date");
					command.run(false, {eval: true},        /**/ "new Error");
					command.run(false, {eval: true},        /**/ "(function(){})");
					command.run(false, {eval: true},        /**/ "Object.prototype.toString");
					command.run(false, {eval: true},        /**/ "Object");
					command.run(false, {eval: true},        /**/ "arguments");
					command.end();

					
					var command = test.prepareCommand(types.toString, "Doodad.Types.toString");
					command.run("'undefined'", {eval: true},        /**/ "undefined");
					command.run("'null'", {eval: true},             /**/ "null");
					command.run("''", {eval: true},                 /**/ "''");
					command.run("'1'",  {eval: true},               /**/ "1");
					command.run("'0.1'", {eval: true},              /**/ "0.1");
					command.run("'NaN'", {eval: true},              /**/ "NaN");
					command.run("'Infinity'", {eval: true},         /**/ "Infinity");
					command.run("'true'",  {eval: true},            /**/ "true");
					command.run("'[object Object]'", {eval: true},  /**/ "{}");
					command.run("''", {eval: true},                 /**/ "[]");
					command.run("''", {eval: true},                 /**/ "new String('')");
					command.run("'1'",  {eval: true},               /**/ "new Number(1)");
					command.run("'0.1'", {eval: true},              /**/ "new Number(0.1)");
					command.run("'NaN'", {eval: true},              /**/ "new Number(NaN)");
					command.run("'Infinity'", {eval: true},         /**/ "new Number(Infinity)");
					command.run("'false'", {eval: true},            /**/ "new Boolean(false)");
					//command.run(, {eval: true},        /**/ "new Date");
					command.run("'Error'", {eval: true},            /**/ "new Error");
					//command.run(, {eval: true},        /**/ "(function(){})");
					//command.run(, {eval: true},        /**/ "Object.prototype.toString");
					//command.run(, {eval: true},        /**/ "Object");
					command.run("'[object Arguments]'", {eval: true}, /**/ "arguments");
					command.end();

					
				},
			},
		};
		
		return DD_MODULES;
	};
	
	//! BEGIN_REMOVE()
	if ((typeof process !== 'object') || (typeof module !== 'object')) {
	//! END_REMOVE()
		//! IF_UNDEF("serverSide")
			// <PRB> export/import are not yet supported in browsers
			global.DD_MODULES = exports.add(global.DD_MODULES);
		//! END_IF()
	//! BEGIN_REMOVE()
	};
	//! END_REMOVE()
}).call(
	//! BEGIN_REMOVE()
	(typeof window !== 'undefined') ? window : ((typeof global !== 'undefined') ? global : this)
	//! END_REMOVE()
	//! IF_DEF("serverSide")
	//! 	INJECT("global")
	//! ELSE()
	//! 	INJECT("window")
	//! END_IF()
);