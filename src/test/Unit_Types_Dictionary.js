//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Types_Dictionary.js - Unit testing module file
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
	mods['Doodad.Test.Types.Dictionary'] = {
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
					symbol1: types.hasSymbolsEnabled() && types.getSymbol("symbol1") || undefined,
					symbol2: types.hasSymbolsEnabled() && types.getSymbol("symbol2") || undefined,
				};
				
				
				const createDicts = function createDicts() {
					const dicts = {};

					dicts.dict1 = {
						a: 1,
						b: 2,
					};
					if (__Internal__.symbol1) {
						dicts.dict1[__Internal__.symbol1] = 10;
					};
						
					const typeDict2 = function() {};
					typeDict2.prototype = types.setPrototypeOf(typeDict2.prototype, dicts.dict1);
					typeDict2.prototype.c = 3;
					typeDict2.prototype.d = 4;
					dicts.dict2 = new typeDict2();
						
					const typeDict3 = function() {};
					typeDict3.prototype = types.setPrototypeOf(typeDict3.prototype, dicts.dict2);
					dicts.dict3 = new typeDict3();
					dicts.dict3.e = 5;
					dicts.dict3.f = 6;
					if (__Internal__.symbol2) {
						dicts.dict3[__Internal__.symbol2] = 11;
					};

					return dicts;
				};
					

				test.runCommand(types.has, "Doodad.Types.hasKey", function(command, options) {
					const dicts = createDicts();
					
					command.runStep(false,       {}     /**/ );
					command.runStep(false,       {},    /**/ undefined, 'a');
					command.runStep(false,       {},    /**/ dicts.dict1);
						
					command.runStep(true,        {},    /**/ dicts.dict1, 'a');
					command.runStep(true,        {},    /**/ dicts.dict1, 'b');
					command.runStep(false,       {},    /**/ dicts.dict1, 'c');
					command.runStep(false,       {},    /**/ dicts.dict1, 'd');
					command.runStep(false,       {},    /**/ dicts.dict1, 'e');
					command.runStep(false,       {},    /**/ dicts.dict1, 'f');
					command.runStep(false,       {},    /**/ dicts.dict1, 'toString');
					command.runStep(true,        {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1);
					command.runStep(false,       {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2);
					command.runStep(true,        {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString']);
						
					command.runStep(false,       {},    /**/ dicts.dict2, 'a');
					command.runStep(false,       {},    /**/ dicts.dict2, 'b');
					command.runStep(false,       {},    /**/ dicts.dict2, 'c');
					command.runStep(false,       {},    /**/ dicts.dict2, 'd');
					command.runStep(false,       {},    /**/ dicts.dict2, 'e');
					command.runStep(false,       {},    /**/ dicts.dict2, 'f');
					command.runStep(false,       {},    /**/ dicts.dict2, 'toString');
					command.runStep(false,       {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1);
					command.runStep(false,       {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2);
					command.runStep(false,       {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString']);
						
					command.runStep(false,       {},    /**/ dicts.dict3, 'a');
					command.runStep(false,       {},    /**/ dicts.dict3, 'b');
					command.runStep(false,       {},    /**/ dicts.dict3, 'c');
					command.runStep(false,       {},    /**/ dicts.dict3, 'd');
					command.runStep(true,        {},    /**/ dicts.dict3, 'e');
					command.runStep(true,        {},    /**/ dicts.dict3, 'f');
					command.runStep(false,       {},    /**/ dicts.dict3, 'toString');
					command.runStep(false,       {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1);
					command.runStep(true,        {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2);
					command.runStep(true,        {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString']);
					
				});

					
				test.runCommand(types.hasInherited, "Doodad.Types.hasKeyInherited", function(command, options) {
					const dicts = createDicts();
					
					command.runStep(false,       {}     /**/ );
					command.runStep(false,       {},    /**/ undefined, 'a');
					command.runStep(false,       {},    /**/ dicts.dict1);
						
					command.runStep(true,        {},    /**/ dicts.dict1, 'a');
					command.runStep(true,        {},    /**/ dicts.dict1, 'b');
					command.runStep(false,       {},    /**/ dicts.dict1, 'c');
					command.runStep(false,       {},    /**/ dicts.dict1, 'd');
					command.runStep(false,       {},    /**/ dicts.dict1, 'e');
					command.runStep(false,       {},    /**/ dicts.dict1, 'f');
					command.runStep(false,       {},    /**/ dicts.dict1, 'toString');
					command.runStep(true,        {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1);
					command.runStep(false,       {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2);
					command.runStep(true,        {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString']);
						
					command.runStep(true,        {},    /**/ dicts.dict2, 'a');
					command.runStep(true,        {},    /**/ dicts.dict2, 'b');
					command.runStep(true,        {},    /**/ dicts.dict2, 'c');
					command.runStep(true,        {},    /**/ dicts.dict2, 'd');
					command.runStep(false,       {},    /**/ dicts.dict2, 'e');
					command.runStep(false,       {},    /**/ dicts.dict2, 'f');
					command.runStep(false,       {},    /**/ dicts.dict2, 'toString');
					command.runStep(true,        {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1);
					command.runStep(false,       {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2);
					command.runStep(true,        {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString']);
						
					command.runStep(true,        {},    /**/ dicts.dict3, 'a');
					command.runStep(true,        {},    /**/ dicts.dict3, 'b');
					command.runStep(true,        {},    /**/ dicts.dict3, 'c');
					command.runStep(true,        {},    /**/ dicts.dict3, 'd');
					command.runStep(true,        {},    /**/ dicts.dict3, 'e');
					command.runStep(true,        {},    /**/ dicts.dict3, 'f');
					command.runStep(false,       {},    /**/ dicts.dict3, 'toString');
					command.runStep(true,        {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1);
					command.runStep(true,        {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2);
					command.runStep(true,        {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString']);
					
				});

					
				test.runCommand(types.get, "Doodad.Types.get", function(command, options) {
					const dicts = createDicts();
					
					command.runStep(undefined,   {}     /**/ );
					command.runStep(undefined,   {},    /**/ undefined, 'a');
					command.runStep(undefined,   {},    /**/ dicts.dict1);
					
					command.runStep(1,           {},    /**/ dicts.dict1, 'a');
					command.runStep(2,           {},    /**/ dicts.dict1, 'b');
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'c');
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'd');
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'e');
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'f');
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'toString');
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1);
					command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2);
					
					command.runStep(1,           {},    /**/ dicts.dict1, 'a', 2);
					command.runStep(2,           {},    /**/ dicts.dict1, 'b', 3);
					command.runStep(4,           {},    /**/ dicts.dict1, 'c', 4);
					command.runStep(5,           {},    /**/ dicts.dict1, 'd', 5);
					command.runStep(6,           {},    /**/ dicts.dict1, 'e', 6);
					command.runStep(7,           {},    /**/ dicts.dict1, 'f', 7);
					command.runStep(8,           {},    /**/ dicts.dict1, 'toString', 8);
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, 11);
					command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, 12);
					
					command.runStep(1,           {},    /**/ dicts.dict1, 'a', undefined, true);
					command.runStep(2,           {},    /**/ dicts.dict1, 'b', undefined, true);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'c', undefined, true);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'd', undefined, true);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'e', undefined, true);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'f', undefined, true);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'toString', undefined, true);
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, undefined, true);
					command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, undefined, true);
					
					command.runStep(1,           {},    /**/ dicts.dict1, 'a', 2, true);
					command.runStep(2,           {},    /**/ dicts.dict1, 'b', 3, true);
					command.runStep(4,           {},    /**/ dicts.dict1, 'c', 4, true);
					command.runStep(5,           {},    /**/ dicts.dict1, 'd', 5, true);
					command.runStep(6,           {},    /**/ dicts.dict1, 'e', 6, true);
					command.runStep(7,           {},    /**/ dicts.dict1, 'f', 7, true);
					command.runStep(8,           {},    /**/ dicts.dict1, 'toString', 8, true);
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, 11, true);
					command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, 12, true);
					
					command.runStep(1,           {},    /**/ dicts.dict1, 'a', undefined, false);
					command.runStep(2,           {},    /**/ dicts.dict1, 'b', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'c', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'd', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'e', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'f', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict1, 'toString', undefined, false);
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, undefined, false);
					command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, undefined, false);
					
					command.runStep(1,           {},    /**/ dicts.dict1, 'a', 2, false);
					command.runStep(2,           {},    /**/ dicts.dict1, 'b', 3, false);
					command.runStep(4,           {},    /**/ dicts.dict1, 'c', 4, false);
					command.runStep(5,           {},    /**/ dicts.dict1, 'd', 5, false);
					command.runStep(6,           {},    /**/ dicts.dict1, 'e', 6, false);
					command.runStep(7,           {},    /**/ dicts.dict1, 'f', 7, false);
					command.runStep(8,           {},    /**/ dicts.dict1, 'toString', 8, false);
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, 11, false);
					command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, 12, false);
						
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'a');
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'b');
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'c');
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'd');
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'e');
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'f');
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'toString');
					command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1);
					command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2);
						
					command.runStep(2,           {},    /**/ dicts.dict2, 'a', 2);
					command.runStep(3,           {},    /**/ dicts.dict2, 'b', 3);
					command.runStep(4,           {},    /**/ dicts.dict2, 'c', 4);
					command.runStep(5,           {},    /**/ dicts.dict2, 'd', 5);
					command.runStep(6,           {},    /**/ dicts.dict2, 'e', 6);
					command.runStep(7,           {},    /**/ dicts.dict2, 'f', 7);
					command.runStep(8,           {},    /**/ dicts.dict2, 'toString', 8);
					command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, 11);
					command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, 12);
						
					command.runStep(1,           {},    /**/ dicts.dict2, 'a', undefined, true);
					command.runStep(2,           {},    /**/ dicts.dict2, 'b', undefined, true);
					command.runStep(3,           {},    /**/ dicts.dict2, 'c', undefined, true);
					command.runStep(4,           {},    /**/ dicts.dict2, 'd', undefined, true);
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'e', undefined, true);
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'f', undefined, true);
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'toString', undefined, true);
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, undefined, true);
					command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, undefined, true);
						
					command.runStep(1,           {},    /**/ dicts.dict2, 'a', 2, true);
					command.runStep(2,           {},    /**/ dicts.dict2, 'b', 3, true);
					command.runStep(3,           {},    /**/ dicts.dict2, 'c', 4, true);
					command.runStep(4,           {},    /**/ dicts.dict2, 'd', 5, true);
					command.runStep(6,           {},    /**/ dicts.dict2, 'e', 6, true);
					command.runStep(7,           {},    /**/ dicts.dict2, 'f', 7, true);
					command.runStep(8,           {},    /**/ dicts.dict2, 'toString', 8, true);
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, 11, true);
					command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, 12, true);
						
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'a', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'b', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'c', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'd', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'e', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'f', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict2, 'toString', undefined, false);
					command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, undefined, false);
					command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, undefined, false);
						
					command.runStep(2,           {},    /**/ dicts.dict2, 'a', 2, false);
					command.runStep(3,           {},    /**/ dicts.dict2, 'b', 3, false);
					command.runStep(4,           {},    /**/ dicts.dict2, 'c', 4, false);
					command.runStep(5,           {},    /**/ dicts.dict2, 'd', 5, false);
					command.runStep(6,           {},    /**/ dicts.dict2, 'e', 6, false);
					command.runStep(7,           {},    /**/ dicts.dict2, 'f', 7, false);
					command.runStep(8,           {},    /**/ dicts.dict2, 'toString', 8, false);
					command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, 11, false);
					command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, 12, false);
						
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'a');
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'b');
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'c');
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'd');
					command.runStep(5,           {},    /**/ dicts.dict3, 'e');
					command.runStep(6,           {},    /**/ dicts.dict3, 'f');
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'toString');
					command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1);
					command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2);
						
					command.runStep(2,           {},    /**/ dicts.dict3, 'a', 2);
					command.runStep(3,           {},    /**/ dicts.dict3, 'b', 3);
					command.runStep(4,           {},    /**/ dicts.dict3, 'c', 4);
					command.runStep(5,           {},    /**/ dicts.dict3, 'd', 5);
					command.runStep(5,           {},    /**/ dicts.dict3, 'e', 6);
					command.runStep(6,           {},    /**/ dicts.dict3, 'f', 7);
					command.runStep(8,           {},    /**/ dicts.dict3, 'toString', 8);
					command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, 11);
					command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, 12);
						
					command.runStep(1,           {},    /**/ dicts.dict3, 'a', undefined, true);
					command.runStep(2,           {},    /**/ dicts.dict3, 'b', undefined, true);
					command.runStep(3,           {},    /**/ dicts.dict3, 'c', undefined, true);
					command.runStep(4,           {},    /**/ dicts.dict3, 'd', undefined, true);
					command.runStep(5,           {},    /**/ dicts.dict3, 'e', undefined, true);
					command.runStep(6,           {},    /**/ dicts.dict3, 'f', undefined, true);
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'toString', undefined, true);
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, undefined, true);
					command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, undefined, true);
						
					command.runStep(1,           {},    /**/ dicts.dict3, 'a', 2, true);
					command.runStep(2,           {},    /**/ dicts.dict3, 'b', 3, true);
					command.runStep(3,           {},    /**/ dicts.dict3, 'c', 4, true);
					command.runStep(4,           {},    /**/ dicts.dict3, 'd', 5, true);
					command.runStep(5,           {},    /**/ dicts.dict3, 'e', 6, true);
					command.runStep(6,           {},    /**/ dicts.dict3, 'f', 7, true);
					command.runStep(8,           {},    /**/ dicts.dict3, 'toString', 8, true);
					command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, 11, true);
					command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, 12, true);
						
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'a', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'b', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'c', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'd', undefined, false);
					command.runStep(5,           {},    /**/ dicts.dict3, 'e', undefined, false);
					command.runStep(6,           {},    /**/ dicts.dict3, 'f', undefined, false);
					command.runStep(undefined,   {},    /**/ dicts.dict3, 'toString', undefined, false);
					command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, undefined, false);
					command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, undefined, false);
						
					command.runStep(2,           {},    /**/ dicts.dict3, 'a', 2, false);
					command.runStep(3,           {},    /**/ dicts.dict3, 'b', 3, false);
					command.runStep(4,           {},    /**/ dicts.dict3, 'c', 4, false);
					command.runStep(5,           {},    /**/ dicts.dict3, 'd', 5, false);
					command.runStep(5,           {},    /**/ dicts.dict3, 'e', 6, false);
					command.runStep(6,           {},    /**/ dicts.dict3, 'f', 7, false);
					command.runStep(8,           {},    /**/ dicts.dict3, 'toString', 8, false);
					command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, 11, false);
					command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, 12, false);
						
					command.runStep(undefined,   {}     /**/ );
					command.runStep(undefined,   {},    /**/ undefined, 'a');
					command.runStep(1,           {},    /**/ undefined, 'a', 1);
					command.runStep(1,           {},    /**/ undefined, 'a', 1, true);
					command.runStep(1,           {},    /**/ undefined, 'a', 1, false);

				});

					
				test.runCommand(types.gets, "Doodad.Types.gets", function(command, options) {
					const dicts = createDicts();
					
					command.runStep({},                     {}     /**/ );
					command.runStep({},                     {},    /**/ undefined, 'a');
					command.runStep({},                     {},    /**/ dicts.dict1);
						
					command.runStep({a: 1},                 {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString']);
					command.runStep({a: 1, [__Internal__.symbol1]: 10},  {skip: !__Internal__.symbol1 || !__Internal__.symbol2},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString', __Internal__.symbol1, __Internal__.symbol2]);
					command.runStep({},                     {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString']);
					command.runStep({},                     {skip: !__Internal__.symbol1 || !__Internal__.symbol2},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString', __Internal__.symbol1, __Internal__.symbol2]);
					command.runStep({e: 5},                 {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString']);
					command.runStep({e: 5, [__Internal__.symbol2]: 11},  {skip: !__Internal__.symbol1 || !__Internal__.symbol2},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString', __Internal__.symbol1, __Internal__.symbol2]);

					command.runStep({a: 1},                 {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], undefined, true);
					command.runStep({a: 1, [__Internal__.symbol1]: 10},  {skip: !__Internal__.symbol1 || !__Internal__.symbol2},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString', __Internal__.symbol1, __Internal__.symbol2], undefined, true);
					command.runStep({a: 1, c: 3},           {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], undefined, true);
					command.runStep({a: 1, c: 3, [__Internal__.symbol1]: 10}, {skip: !__Internal__.symbol1 || !__Internal__.symbol2}, /**/ dicts.dict2, ['a', 'c', 'e', 'toString', __Internal__.symbol1, __Internal__.symbol2], undefined, true);
					command.runStep({a: 1, c: 3, e: 5},     {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], undefined, true);
					command.runStep({a: 1, c: 3, [__Internal__.symbol1]: 10, [__Internal__.symbol2]: 11}, {skip: !__Internal__.symbol1 || !__Internal__.symbol2}, /**/ dicts.dict3, ['a', 'c', 'e', 'toString', __Internal__.symbol1, __Internal__.symbol2], undefined, true);

					command.runStep({a: 1},                 {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], undefined, false);
					command.runStep({},                     {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], undefined, false);
					command.runStep({e: 5},                 {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], undefined, false);
						
					command.runStep({a: 1, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13});
					command.runStep({a: 7, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13});
					command.runStep({a: 7, c: 9, e: 5, toString: 13},    {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13});

					command.runStep({a: 1, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, true);
					command.runStep({a: 1, c: 3, e: 11, toString: 13},   {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, true);
					command.runStep({a: 1, c: 3, e: 5, toString: 13},    {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, true);

					command.runStep({a: 1, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, false);
					command.runStep({a: 7, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, false);
					command.runStep({a: 7, c: 9, e: 5, toString: 13},    {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, false);
						
					command.runStep({a: 1},                 {},    /**/ dicts.dict1, 'a');

					command.runStep({},                                  {}     /**/ );
					command.runStep({},                                  {},    /**/ undefined, ['a']);
					command.runStep({a: 1},                              {},    /**/ undefined, ['a'], {a: 1, b: 2, c: 3});
					command.runStep({a: 1},                              {},    /**/ undefined, ['a'], {a: 1, b: 2, c: 3}, true);
					command.runStep({a: 1},                              {},    /**/ undefined, ['a'], {a: 1, b: 2, c: 3}, false);
					command.runStep({a: 1, c: 3},                        {},    /**/ undefined, ['a', 'c'], {a: 1, b: 2, c: 3});
					command.runStep({a: 1, c: 3},                        {},    /**/ undefined, ['a', 'c'], {a: 1, b: 2, c: 3}, true);
					command.runStep({a: 1, c: 3},                        {},    /**/ undefined, ['a', 'c'], {a: 1, b: 2, c: 3}, false);

				});

					
				test.runCommand(types.set, "Doodad.Types.set", function(command, options) {
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,   {}     /**/ );
						command.runStep(undefined,   {},    /**/ undefined, 'a');
						command.runStep(undefined,   {},    /**/ dicts.dict1);
						command.runStep(2,           {},    /**/ dicts.dict1, 'a', 2);
						command.runStep(3,           {},    /**/ dicts.dict1, 'b', 3);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'c', 4);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'd', 5);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'e', 6);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'f', 7);
						command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, 11);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, 12);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'a', 2);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'b', 3);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'c', 4);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'd', 5);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'e', 6);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'f', 7);
						command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, 11);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, 12);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'a', 2);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'b', 3);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'c', 4);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'd', 5);
						command.runStep(6,           {},    /**/ dicts.dict3, 'e', 6);
						command.runStep(7,           {},    /**/ dicts.dict3, 'f', 7);
						command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, 11);
						command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, 12);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(2,           {},    /**/ dicts.dict1, 'a', 2, true);
						command.runStep(3,           {},    /**/ dicts.dict1, 'b', 3, true);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'c', 4, true);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'd', 5, true);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'e', 6, true);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'f', 7, true);
						command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, 11, true);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, 12, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(2,           {},    /**/ dicts.dict2, 'a', 2, true);
						command.runStep(3,           {},    /**/ dicts.dict2, 'b', 3, true);
						command.runStep(4,           {},    /**/ dicts.dict2, 'c', 4, true);
						command.runStep(5,           {},    /**/ dicts.dict2, 'd', 5, true);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'e', 6, true);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'f', 7, true);
						command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, 11, true);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, 12, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(2,           {},    /**/ dicts.dict3, 'a', 2, true);
						command.runStep(3,           {},    /**/ dicts.dict3, 'b', 3, true);
						command.runStep(4,           {},    /**/ dicts.dict3, 'c', 4, true);
						command.runStep(5,           {},    /**/ dicts.dict3, 'd', 5, true);
						command.runStep(6,           {},    /**/ dicts.dict3, 'e', 6, true);
						command.runStep(7,           {},    /**/ dicts.dict3, 'f', 7, true);
						command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, 11, true);
						command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, 12, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(2,           {},    /**/ dicts.dict1, 'a', 2, false);
						command.runStep(3,           {},    /**/ dicts.dict1, 'b', 3, false);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'c', 4, false);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'd', 5, false);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'e', 6, false);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'f', 7, false);
						command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, 11, false);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, 12, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'a', 2, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'b', 3, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'c', 4, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'd', 5, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'e', 6, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'f', 7, false);
						command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, 11, false);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, 12, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'a', 2, false);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'b', 3, false);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'c', 4, false);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'd', 5, false);
						command.runStep(6,           {},    /**/ dicts.dict3, 'e', 6, false);
						command.runStep(7,           {},    /**/ dicts.dict3, 'f', 7, false);
						command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, 11, false);
						command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, 12, false);
					});
					
				});
					
					
				test.runCommand(types.sets, "Doodad.Types.sets", function(command, options) {
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({},                                   {}     /**/ );
						command.runStep({},                                   {},    /**/ undefined, 'a');
						command.runStep({},                                   {},    /**/ dicts.dict1);
						command.runStep({a: 2, b: 3},                         {},    /**/ dicts.dict1, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7});
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 3, [__Internal__.symbol1]: 11},          {skip: !__Internal__.symbol1 || !__Internal__.symbol2},    /**/ dicts.dict1, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, [__Internal__.symbol1]: 11, [__Internal__.symbol2]: 12});
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({},                                   {},    /**/ dicts.dict2, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7});
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({e: 6, f: 7},                         {},    /**/ dicts.dict3, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7});
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 3},                         {},    /**/ dicts.dict1, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 3, [__Internal__.symbol1]: 11},          {skip: !__Internal__.symbol1 || !__Internal__.symbol2},    /**/ dicts.dict1, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, [__Internal__.symbol1]: 11, [__Internal__.symbol2]: 12}, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 3, c: 4, d: 5},             {},    /**/ dicts.dict2, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 3, [__Internal__.symbol1]: 11},          {skip: !__Internal__.symbol1 || !__Internal__.symbol2},    /**/ dicts.dict2, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, [__Internal__.symbol1]: 11, [__Internal__.symbol2]: 12}, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}, {},    /**/ dicts.dict3, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 3, c: 4, d: 5, [__Internal__.symbol1]: 11},  {skip: !__Internal__.symbol1 || !__Internal__.symbol2},    /**/ dicts.dict2, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, [__Internal__.symbol1]: 11, [__Internal__.symbol2]: 12}, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 2, b: 3},                         {},    /**/ dicts.dict1, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({},                                   {},    /**/ dicts.dict2, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({e: 6, f: 7},                         {},    /**/ dicts.dict3, {a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}, false);
					});
					
				});


				test.runCommand(types.getDefault, "Doodad.Types.getDefault", function(command, options) {
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,   {}     /**/ );
						command.runStep(undefined,   {},    /**/ undefined, 'a');
						command.runStep(undefined,   {},    /**/ dicts.dict1);
						command.runStep(1,           {},    /**/ dicts.dict1, 'a', undefined, true);
						command.runStep(2,           {},    /**/ dicts.dict1, 'b', undefined, true);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'c', undefined, true);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'd', undefined, true);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'e', undefined, true);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'f', undefined, true);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'toString', undefined, true);
						command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, undefined, true);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, undefined, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,           {},    /**/ dicts.dict1, 'a', 2, true);
						command.runStep(2,           {},    /**/ dicts.dict1, 'b', 3, true);
						command.runStep(4,           {},    /**/ dicts.dict1, 'c', 4, true);
						command.runStep(5,           {},    /**/ dicts.dict1, 'd', 5, true);
						command.runStep(6,           {},    /**/ dicts.dict1, 'e', 6, true);
						command.runStep(7,           {},    /**/ dicts.dict1, 'f', 7, true);
						command.runStep(8,           {},    /**/ dicts.dict1, 'toString', 8, true);
						command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, 11, true);
						command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, 12, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,           {},    /**/ dicts.dict1, 'a', undefined, false);
						command.runStep(2,           {},    /**/ dicts.dict1, 'b', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'c', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'd', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'e', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'f', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict1, 'toString', undefined, false);
						command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, undefined, false);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, undefined, false);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,           {},    /**/ dicts.dict1, 'a', 2, false);
						command.runStep(2,           {},    /**/ dicts.dict1, 'b', 3, false);
						command.runStep(4,           {},    /**/ dicts.dict1, 'c', 4, false);
						command.runStep(5,           {},    /**/ dicts.dict1, 'd', 5, false);
						command.runStep(6,           {},    /**/ dicts.dict1, 'e', 6, false);
						command.runStep(7,           {},    /**/ dicts.dict1, 'f', 7, false);
						command.runStep(8,           {},    /**/ dicts.dict1, 'toString', 8, false);
						command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict1, __Internal__.symbol1, 11, false);
						command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict1, __Internal__.symbol2, 12, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,           {},    /**/ dicts.dict2, 'a', undefined, true);
						command.runStep(2,           {},    /**/ dicts.dict2, 'b', undefined, true);
						command.runStep(3,           {},    /**/ dicts.dict2, 'c', undefined, true);
						command.runStep(4,           {},    /**/ dicts.dict2, 'd', undefined, true);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'e', undefined, true);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'f', undefined, true);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'toString', undefined, true);
						command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, undefined, true);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, undefined, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,           {},    /**/ dicts.dict2, 'a', 2, true);
						command.runStep(2,           {},    /**/ dicts.dict2, 'b', 3, true);
						command.runStep(3,           {},    /**/ dicts.dict2, 'c', 4, true);
						command.runStep(4,           {},    /**/ dicts.dict2, 'd', 5, true);
						command.runStep(6,           {},    /**/ dicts.dict2, 'e', 6, true);
						command.runStep(7,           {},    /**/ dicts.dict2, 'f', 7, true);
						command.runStep(8,           {},    /**/ dicts.dict2, 'toString', 8, true);
						command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, 11, true);
						command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, 12, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'a', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'b', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'c', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'd', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'e', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'f', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict2, 'toString', undefined, false);
						command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, undefined, false);
						command.runStep(undefined,   {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, undefined, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(2,           {},    /**/ dicts.dict2, 'a', 2, false);
						command.runStep(3,           {},    /**/ dicts.dict2, 'b', 3, false);
						command.runStep(4,           {},    /**/ dicts.dict2, 'c', 4, false);
						command.runStep(5,           {},    /**/ dicts.dict2, 'd', 5, false);
						command.runStep(6,           {},    /**/ dicts.dict2, 'e', 6, false);
						command.runStep(7,           {},    /**/ dicts.dict2, 'f', 7, false);
						command.runStep(8,           {},    /**/ dicts.dict2, 'toString', 8, false);
						command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict2, __Internal__.symbol1, 11, false);
						command.runStep(12,          {skip: !__Internal__.symbol2},    /**/ dicts.dict2, __Internal__.symbol2, 12, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,           {},    /**/ dicts.dict3, 'a', undefined, true);
						command.runStep(2,           {},    /**/ dicts.dict3, 'b', undefined, true);
						command.runStep(3,           {},    /**/ dicts.dict3, 'c', undefined, true);
						command.runStep(4,           {},    /**/ dicts.dict3, 'd', undefined, true);
						command.runStep(5,           {},    /**/ dicts.dict3, 'e', undefined, true);
						command.runStep(6,           {},    /**/ dicts.dict3, 'f', undefined, true);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'toString', undefined, true);
						command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, undefined, true);
						command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, undefined, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(1,           {},    /**/ dicts.dict3, 'a', 2, true);
						command.runStep(2,           {},    /**/ dicts.dict3, 'b', 3, true);
						command.runStep(3,           {},    /**/ dicts.dict3, 'c', 4, true);
						command.runStep(4,           {},    /**/ dicts.dict3, 'd', 5, true);
						command.runStep(5,           {},    /**/ dicts.dict3, 'e', 6, true);
						command.runStep(6,           {},    /**/ dicts.dict3, 'f', 7, true);
						command.runStep(8,           {},    /**/ dicts.dict3, 'toString', 8, true);
						command.runStep(10,          {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, 11, true);
						command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, 12, true);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'a', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'b', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'c', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'd', undefined, false);
						command.runStep(5,           {},    /**/ dicts.dict3, 'e', undefined, false);
						command.runStep(6,           {},    /**/ dicts.dict3, 'f', undefined, false);
						command.runStep(undefined,   {},    /**/ dicts.dict3, 'toString', undefined, false);
						command.runStep(undefined,   {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, undefined, false);
						command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, undefined, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep(2,           {},    /**/ dicts.dict3, 'a', 2, false);
						command.runStep(3,           {},    /**/ dicts.dict3, 'b', 3, false);
						command.runStep(4,           {},    /**/ dicts.dict3, 'c', 4, false);
						command.runStep(5,           {},    /**/ dicts.dict3, 'd', 5, false);
						command.runStep(5,           {},    /**/ dicts.dict3, 'e', 6, false);
						command.runStep(6,           {},    /**/ dicts.dict3, 'f', 7, false);
						command.runStep(8,           {},    /**/ dicts.dict3, 'toString', 8, false);
						command.runStep(11,          {skip: !__Internal__.symbol1},    /**/ dicts.dict3, __Internal__.symbol1, 11, false);
						command.runStep(11,          {skip: !__Internal__.symbol2},    /**/ dicts.dict3, __Internal__.symbol2, 12, false);
					});
						
					command.runStep(undefined,                    {}     /**/ );
					command.runStep(undefined,                    {},    /**/ undefined, 'a');
					command.runStep(1,                              {},    /**/ undefined, 'a', 1);
					command.runStep(1,                              {},    /**/ undefined, 'a', 1, true);
					command.runStep(1,                              {},    /**/ undefined, 'a', 1, false);

				});

					
				test.runCommand(types.getsDefault, "Doodad.Types.getsDefault", function(command, options) {
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({},                     {}     /**/ );
						command.runStep({},                     {},    /**/ undefined, 'a');
						command.runStep({},                     {},    /**/ dicts.dict1);
						command.runStep({a: 1},                 {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString']);
						command.runStep({},                     {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString']);
						command.runStep({e: 5},                 {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString']);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 1},                 {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], undefined, true);
						command.runStep({a: 1, c: 3},           {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], undefined, true);
						command.runStep({a: 1, c: 3, e: 5},     {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], undefined, true);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 1},                 {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], undefined, false);
						command.runStep({},                     {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], undefined, false);
						command.runStep({e: 5},                 {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], undefined, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 1, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13});
						command.runStep({a: 7, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13});
						command.runStep({a: 7, c: 9, e: 5, toString: 13},    {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13});
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 1, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, true);
						command.runStep({a: 1, c: 3, e: 11, toString: 13},   {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, true);
						command.runStep({a: 1, c: 3, e: 5, toString: 13},    {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, true);
					});

					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 1, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict1, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, false);
						command.runStep({a: 7, c: 9, e: 11, toString: 13},   {},    /**/ dicts.dict2, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, false);
						command.runStep({a: 7, c: 9, e: 5, toString: 13},    {},    /**/ dicts.dict3, ['a', 'c', 'e', 'toString'], {a: 7, c: 9, e: 11, toString: 13}, false);
					});
						
					command.chain(function(dummy) {
						const dicts = createDicts();
						command.runStep({a: 1},                              {},    /**/ dicts.dict1, 'a');
					});

					command.runStep({},                                  {}     /**/ );
					command.runStep({}       ,                           {},    /**/ undefined, ['a']);
					command.runStep({a: 1},                              {},    /**/ undefined, ['a'], {a: 1, b: 2, c: 3});
					command.runStep({a: 1},                              {},    /**/ undefined, ['a'], {a: 1, b: 2, c: 3}, true);
					command.runStep({a: 1},                              {},    /**/ undefined, ['a'], {a: 1, b: 2, c: 3}, false);
					command.runStep({a: 1, c: 3},                        {},    /**/ undefined, ['a', 'c'], {a: 1, b: 2, c: 3});
					command.runStep({a: 1, c: 3},                        {},    /**/ undefined, ['a', 'c'], {a: 1, b: 2, c: 3}, true);
					command.runStep({a: 1, c: 3},                        {},    /**/ undefined, ['a', 'c'], {a: 1, b: 2, c: 3}, false);

				});
					
					
				test.runCommand(types.keys, "Doodad.Types.keys", function(command, options) {
					const dicts = createDicts();

					command.runStep([],                    {contains: true}     /**/ );
					command.runStep(['a', 'b'],            {contains: true},    /**/ dicts.dict1);
					command.runStep([],                    {contains: true},    /**/ dicts.dict2);
					command.runStep(['e', 'f'],            {contains: true},    /**/ dicts.dict3);
				});
					
					
				test.runCommand(types.keysInherited, "Doodad.Types.keysInherited", function(command, options) {
					const dicts = createDicts();

					command.runStep([],                             {contains: true}     /**/ );
					command.runStep(['a', 'b'],                     {contains: true},    /**/ dicts.dict1);
					command.runStep(['a', 'b', 'c', 'd'],           {contains: true},    /**/ dicts.dict2);
					command.runStep(['a', 'b', 'c', 'd', 'e', 'f'], {contains: true},    /**/ dicts.dict3);
				});
					
					
				test.runCommand(types.values, "Doodad.Types.values", function(command, options) {
					const dicts = createDicts();

					command.runStep([],                    {contains: true}     /**/ );
					command.runStep([1, 2],                {contains: true},    /**/ dicts.dict1);
					command.runStep([],                    {contains: true},    /**/ dicts.dict2);
					command.runStep([5, 6],                {contains: true},    /**/ dicts.dict3);
				});
					
					
				test.runCommand(types.items, "Doodad.Types.items", function(command, options) {
					const dicts = createDicts();

					command.runStep([],                    {contains: true, depth: 1}     /**/ );
					command.runStep([['a', 1], ['b', 2]],  {contains: true, depth: 1},    /**/ dicts.dict1);
					command.runStep([],                    {contains: true, depth: 1},    /**/ dicts.dict2);
					command.runStep([['e', 5], ['f', 6]],  {contains: true, depth: 1},    /**/ dicts.dict3);
				});
					
					
				test.runCommand(types.isClonable, "Doodad.Types.isClonable", function(command, options) {
					const dicts = createDicts();

					command.runStep(false,      {}     /**/ );
					command.runStep(true,       {},    /**/  dicts.dict1);
				});
					
				test.runCommand(types.clone, "Doodad.Types.clone", function(command, options) {
					const dicts = createDicts();

					command.runStep(undefined,                                {}     /**/ );
					command.runStep(dicts.dict1,                                    {not: true, mode: 'compare'},  /**/  dicts.dict1);
					if (__Internal__.symbol1 && __Internal__.symbol2) {
						command.runStep({a: 1, b: 2, [__Internal__.symbol1]: 10},          {inherited: true},  /**/  dicts.dict1);
					} else {
						command.runStep({a: 1, b: 2},                         {inherited: true},  /**/  dicts.dict1);
					};
					command.runStep(dicts.dict2,                                    {not: true, mode: 'compare'},  /**/  dicts.dict2);
					if (__Internal__.symbol1 && __Internal__.symbol2) {
						command.runStep({a: 1, b: 2, c: 3, d: 4, [__Internal__.symbol1]: 10},  {inherited: true},  /**/  dicts.dict2);
					} else {
						command.runStep({a: 1, b: 2, c: 3, d: 4},             {inherited: true},  /**/  dicts.dict2);
					};
					command.runStep(dicts.dict3,                                    {not: true, mode: 'compare'},  /**/  dicts.dict3);
					if (__Internal__.symbol1 && __Internal__.symbol2) {
						command.runStep({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, [__Internal__.symbol1]: 10, [__Internal__.symbol2]: 11},  {inherited: true},  /**/  dicts.dict3);
					} else {
						command.runStep({a: 1, b: 2, c: 3, d: 4, e: 5, f: 6},  {inherited: true},  /**/  dicts.dict3);
					};
				});


			},
		},
	};
	return mods;
};

//! END_MODULE()
