//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2017 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Types_Dictionary.js - Unit testing module file
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
		DD_MODULES['Doodad.Test.Types.Dictionary'] = {
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

					global.symbol1 = types.hasGetSymbolEnabled() && types.getSymbol("symbol1") || undefined;
					global.symbol2 = types.hasGetSymbolEnabled() && types.getSymbol("symbol2") || undefined;
					
					const createDicts = function createDicts() {
						global.dict1 = {
							a: 1,
							b: 2,
						};
						if (global.symbol1) {
							global.dict1[global.symbol1] = 10;
						};
						
						const typeDict2 = function() {};
						typeDict2.prototype = types.setPrototypeOf(typeDict2.prototype, global.dict1);
						typeDict2.prototype.c = 3;
						typeDict2.prototype.d = 4;
						global.dict2 = new typeDict2();
						
						const typeDict3 = function() {};
						typeDict3.prototype = types.setPrototypeOf(typeDict3.prototype, global.dict2);
						global.dict3 = new typeDict3();
						global.dict3.e = 5;
						global.dict3.f = 6;
						if (global.symbol2) {
							global.dict3[global.symbol2] = 11;
						};
					};
					
					createDicts();
					

					let command;

					
					command = test.prepareCommand(types.has, "Doodad.Types.hasKey");
					
					command.run(false,       {eval: true}     /**/ );
					command.run(false,       {eval: true},    /**/ "undefined", "'a'");
					command.run(false,       {eval: true},    /**/ "dict1");
					
					command.run(true,        {eval: true},    /**/ "dict1", "'a'");
					command.run(true,        {eval: true},    /**/ "dict1", "'b'");
					command.run(false,       {eval: true},    /**/ "dict1", "'c'");
					command.run(false,       {eval: true},    /**/ "dict1", "'d'");
					command.run(false,       {eval: true},    /**/ "dict1", "'e'");
					command.run(false,       {eval: true},    /**/ "dict1", "'f'");
					command.run(false,       {eval: true},    /**/ "dict1", "'toString'");
					global.symbol1 && command.run(true,        {eval: true},    /**/ "dict1", "symbol1");
					global.symbol1 && command.run(false,       {eval: true},    /**/ "dict1", "symbol2");
					command.run(true,        {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']");
					
					command.run(false,       {eval: true},    /**/ "dict2", "'a'");
					command.run(false,       {eval: true},    /**/ "dict2", "'b'");
					command.run(false,       {eval: true},    /**/ "dict2", "'c'");
					command.run(false,       {eval: true},    /**/ "dict2", "'d'");
					command.run(false,       {eval: true},    /**/ "dict2", "'e'");
					command.run(false,       {eval: true},    /**/ "dict2", "'f'");
					command.run(false,       {eval: true},    /**/ "dict2", "'toString'");
					global.symbol1 && command.run(false,       {eval: true},    /**/ "dict2", "symbol1");
					global.symbol1 && command.run(false,       {eval: true},    /**/ "dict2", "symbol2");
					command.run(false,       {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']");
					
					command.run(false,       {eval: true},    /**/ "dict3", "'a'");
					command.run(false,       {eval: true},    /**/ "dict3", "'b'");
					command.run(false,       {eval: true},    /**/ "dict3", "'c'");
					command.run(false,       {eval: true},    /**/ "dict3", "'d'");
					command.run(true,        {eval: true},    /**/ "dict3", "'e'");
					command.run(true,        {eval: true},    /**/ "dict3", "'f'");
					command.run(false,       {eval: true},    /**/ "dict3", "'toString'");
					global.symbol1 && command.run(false,       {eval: true},    /**/ "dict3", "symbol1");
					global.symbol1 && command.run(true,        {eval: true},    /**/ "dict3", "symbol2");
					command.run(true,        {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']");
					
					command.end();

					
					command = test.prepareCommand(types.hasInherited, "Doodad.Types.hasKeyInherited");
					
					command.run(false,       {eval: true}     /**/ );
					command.run(false,       {eval: true},    /**/ "undefined", "'a'");
					command.run(false,       {eval: true},    /**/ "dict1");
					
					command.run(true,        {eval: true},    /**/ "dict1", "'a'");
					command.run(true,        {eval: true},    /**/ "dict1", "'b'");
					command.run(false,       {eval: true},    /**/ "dict1", "'c'");
					command.run(false,       {eval: true},    /**/ "dict1", "'d'");
					command.run(false,       {eval: true},    /**/ "dict1", "'e'");
					command.run(false,       {eval: true},    /**/ "dict1", "'f'");
					command.run(false,       {eval: true},    /**/ "dict1", "'toString'");
					global.symbol1 && command.run(true,        {eval: true},    /**/ "dict1", "symbol1");
					global.symbol1 && command.run(false,       {eval: true},    /**/ "dict1", "symbol2");
					command.run(true,        {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']");
					
					command.run(true,        {eval: true},    /**/ "dict2", "'a'");
					command.run(true,        {eval: true},    /**/ "dict2", "'b'");
					command.run(true,        {eval: true},    /**/ "dict2", "'c'");
					command.run(true,        {eval: true},    /**/ "dict2", "'d'");
					command.run(false,       {eval: true},    /**/ "dict2", "'e'");
					command.run(false,       {eval: true},    /**/ "dict2", "'f'");
					command.run(false,       {eval: true},    /**/ "dict2", "'toString'");
					global.symbol1 && command.run(true,        {eval: true},    /**/ "dict2", "symbol1");
					global.symbol1 && command.run(false,       {eval: true},    /**/ "dict2", "symbol2");
					command.run(true,        {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']");
					
					command.run(true,        {eval: true},    /**/ "dict3", "'a'");
					command.run(true,        {eval: true},    /**/ "dict3", "'b'");
					command.run(true,        {eval: true},    /**/ "dict3", "'c'");
					command.run(true,        {eval: true},    /**/ "dict3", "'d'");
					command.run(true,        {eval: true},    /**/ "dict3", "'e'");
					command.run(true,        {eval: true},    /**/ "dict3", "'f'");
					command.run(false,       {eval: true},    /**/ "dict3", "'toString'");
					global.symbol1 && command.run(true,        {eval: true},    /**/ "dict3", "symbol1");
					global.symbol1 && command.run(true,        {eval: true},    /**/ "dict3", "symbol2");
					command.run(true,        {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']");
					
					command.end();

					
					command = test.prepareCommand(types.get, "Doodad.Types.get");
					
					command.run(undefined,   {eval: true}     /**/ );
					command.run(undefined,   {eval: true},    /**/ "undefined", "'a'");
					command.run(undefined,   {eval: true},    /**/ "dict1");
					
					command.run(1,           {eval: true},    /**/ "dict1", "'a'");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'c'");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'d'");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'e'");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'f'");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'toString'");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict1", "symbol1");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict1", "symbol2");
					
					command.run(1,           {eval: true},    /**/ "dict1", "'a'", "2");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'", "3");
					command.run(4,           {eval: true},    /**/ "dict1", "'c'", "4");
					command.run(5,           {eval: true},    /**/ "dict1", "'d'", "5");
					command.run(6,           {eval: true},    /**/ "dict1", "'e'", "6");
					command.run(7,           {eval: true},    /**/ "dict1", "'f'", "7");
					command.run(8,           {eval: true},    /**/ "dict1", "'toString'", "8");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict1", "symbol1", "11");
					global.symbol1 && command.run(12,          {eval: true},    /**/ "dict1", "symbol2", "12");
					
					command.run(1,           {eval: true},    /**/ "dict1", "'a'", "undefined", "true");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'c'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'d'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'e'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'f'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'toString'", "undefined", "true");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict1", "symbol1", "undefined", "true");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict1", "symbol2", "undefined", "true");
					
					command.run(1,           {eval: true},    /**/ "dict1", "'a'", "2", "true");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'", "3", "true");
					command.run(4,           {eval: true},    /**/ "dict1", "'c'", "4", "true");
					command.run(5,           {eval: true},    /**/ "dict1", "'d'", "5", "true");
					command.run(6,           {eval: true},    /**/ "dict1", "'e'", "6", "true");
					command.run(7,           {eval: true},    /**/ "dict1", "'f'", "7", "true");
					command.run(8,           {eval: true},    /**/ "dict1", "'toString'", "8", "true");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict1", "symbol1", "11", "true");
					global.symbol1 && command.run(12,          {eval: true},    /**/ "dict1", "symbol2", "12", "true");
					
					command.run(1,           {eval: true},    /**/ "dict1", "'a'", "undefined", "false");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'c'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'d'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'e'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'f'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'toString'", "undefined", "false");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict1", "symbol1", "undefined", "false");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict1", "symbol2", "undefined", "false");
					
					command.run(1,           {eval: true},    /**/ "dict1", "'a'", "2", "false");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'", "3", "false");
					command.run(4,           {eval: true},    /**/ "dict1", "'c'", "4", "false");
					command.run(5,           {eval: true},    /**/ "dict1", "'d'", "5", "false");
					command.run(6,           {eval: true},    /**/ "dict1", "'e'", "6", "false");
					command.run(7,           {eval: true},    /**/ "dict1", "'f'", "7", "false");
					command.run(8,           {eval: true},    /**/ "dict1", "'toString'", "8", "false");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict1", "symbol1", "11", "false");
					global.symbol1 && command.run(12,          {eval: true},    /**/ "dict1", "symbol2", "12", "false");
					
					command.run(undefined,   {eval: true},    /**/ "dict2", "'a'");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'b'");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'c'");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'d'");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'e'");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'f'");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'toString'");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict2", "symbol1");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict2", "symbol2");
					
					command.run(2,           {eval: true},    /**/ "dict2", "'a'", "2");
					command.run(3,           {eval: true},    /**/ "dict2", "'b'", "3");
					command.run(4,           {eval: true},    /**/ "dict2", "'c'", "4");
					command.run(5,           {eval: true},    /**/ "dict2", "'d'", "5");
					command.run(6,           {eval: true},    /**/ "dict2", "'e'", "6");
					command.run(7,           {eval: true},    /**/ "dict2", "'f'", "7");
					command.run(8,           {eval: true},    /**/ "dict2", "'toString'", "8");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict2", "symbol1", "11");
					global.symbol1 && command.run(12,          {eval: true},    /**/ "dict2", "symbol2", "12");
					
					command.run(1,           {eval: true},    /**/ "dict2", "'a'", "undefined", "true");
					command.run(2,           {eval: true},    /**/ "dict2", "'b'", "undefined", "true");
					command.run(3,           {eval: true},    /**/ "dict2", "'c'", "undefined", "true");
					command.run(4,           {eval: true},    /**/ "dict2", "'d'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'e'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'f'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'toString'", "undefined", "true");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict2", "symbol1", "undefined", "true");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict2", "symbol2", "undefined", "true");
					
					command.run(1,           {eval: true},    /**/ "dict2", "'a'", "2", "true");
					command.run(2,           {eval: true},    /**/ "dict2", "'b'", "3", "true");
					command.run(3,           {eval: true},    /**/ "dict2", "'c'", "4", "true");
					command.run(4,           {eval: true},    /**/ "dict2", "'d'", "5", "true");
					command.run(6,           {eval: true},    /**/ "dict2", "'e'", "6", "true");
					command.run(7,           {eval: true},    /**/ "dict2", "'f'", "7", "true");
					command.run(8,           {eval: true},    /**/ "dict2", "'toString'", "8", "true");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict2", "symbol1", "11", "true");
					global.symbol1 && command.run(12,          {eval: true},    /**/ "dict2", "symbol2", "12", "true");
					
					command.run(undefined,   {eval: true},    /**/ "dict2", "'a'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'b'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'c'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'d'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'e'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'f'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'toString'", "undefined", "false");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict2", "symbol1", "undefined", "false");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict2", "symbol2", "undefined", "false");
					
					command.run(2,           {eval: true},    /**/ "dict2", "'a'", "2", "false");
					command.run(3,           {eval: true},    /**/ "dict2", "'b'", "3", "false");
					command.run(4,           {eval: true},    /**/ "dict2", "'c'", "4", "false");
					command.run(5,           {eval: true},    /**/ "dict2", "'d'", "5", "false");
					command.run(6,           {eval: true},    /**/ "dict2", "'e'", "6", "false");
					command.run(7,           {eval: true},    /**/ "dict2", "'f'", "7", "false");
					command.run(8,           {eval: true},    /**/ "dict2", "'toString'", "8", "false");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict2", "symbol1", "11", "false");
					global.symbol1 && command.run(12,          {eval: true},    /**/ "dict2", "symbol2", "12", "false");
					
					command.run(undefined,   {eval: true},    /**/ "dict3", "'a'");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'b'");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'c'");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'d'");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'toString'");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict3", "symbol1");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict3", "symbol2");
					
					command.run(2,           {eval: true},    /**/ "dict3", "'a'", "2");
					command.run(3,           {eval: true},    /**/ "dict3", "'b'", "3");
					command.run(4,           {eval: true},    /**/ "dict3", "'c'", "4");
					command.run(5,           {eval: true},    /**/ "dict3", "'d'", "5");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'", "6");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'", "7");
					command.run(8,           {eval: true},    /**/ "dict3", "'toString'", "8");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict3", "symbol1", "11");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict3", "symbol2", "12");
					
					command.run(1,           {eval: true},    /**/ "dict3", "'a'", "undefined", "true");
					command.run(2,           {eval: true},    /**/ "dict3", "'b'", "undefined", "true");
					command.run(3,           {eval: true},    /**/ "dict3", "'c'", "undefined", "true");
					command.run(4,           {eval: true},    /**/ "dict3", "'d'", "undefined", "true");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'", "undefined", "true");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'toString'", "undefined", "true");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict3", "symbol1", "undefined", "true");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict3", "symbol2", "undefined", "true");
					
					command.run(1,           {eval: true},    /**/ "dict3", "'a'", "2", "true");
					command.run(2,           {eval: true},    /**/ "dict3", "'b'", "3", "true");
					command.run(3,           {eval: true},    /**/ "dict3", "'c'", "4", "true");
					command.run(4,           {eval: true},    /**/ "dict3", "'d'", "5", "true");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'", "6", "true");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'", "7", "true");
					command.run(8,           {eval: true},    /**/ "dict3", "'toString'", "8", "true");
					global.symbol1 && command.run(10,          {eval: true},    /**/ "dict3", "symbol1", "11", "true");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict3", "symbol2", "12", "true");
					
					command.run(undefined,   {eval: true},    /**/ "dict3", "'a'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'b'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'c'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'d'", "undefined", "false");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'", "undefined", "false");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'toString'", "undefined", "false");
					global.symbol1 && command.run(undefined,   {eval: true},    /**/ "dict3", "symbol1", "undefined", "false");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict3", "symbol2", "undefined", "false");
					
					command.run(2,           {eval: true},    /**/ "dict3", "'a'", "2", "false");
					command.run(3,           {eval: true},    /**/ "dict3", "'b'", "3", "false");
					command.run(4,           {eval: true},    /**/ "dict3", "'c'", "4", "false");
					command.run(5,           {eval: true},    /**/ "dict3", "'d'", "5", "false");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'", "6", "false");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'", "7", "false");
					command.run(8,           {eval: true},    /**/ "dict3", "'toString'", "8", "false");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict3", "symbol1", "11", "false");
					global.symbol1 && command.run(11,          {eval: true},    /**/ "dict3", "symbol2", "12", "false");
					
					command.run("undefined", {eval: true}     /**/ );
					command.run("undefined", {eval: true},    /**/ "undefined", "'a'");
					command.run(1,           {eval: true},    /**/ "undefined", "'a'", "1");
					command.run(1,           {eval: true},    /**/ "undefined", "'a'", "1", "true");
					command.run(1,           {eval: true},    /**/ "undefined", "'a'", "1", "false");

					command.end();

					
					command = test.prepareCommand(types.gets, "Doodad.Types.gets");
					
					command.run("{}",                     {eval: true}     /**/ );
					command.run("{}",                     {eval: true},    /**/ "undefined", "'a'");
					command.run("{}",                     {eval: true},    /**/ "dict1");
					
					command.run("{a: 1}",                 {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']");
					global.symbol1 && command.run("{a: 1, [symbol1]: 10}",  {eval: true, note: "May fail under engines not supporting variables in object declaration."},    /**/ "dict1", "['a', 'c', 'e', 'toString', symbol1, symbol2]");
					command.run("{}",                     {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']");
					global.symbol1 && command.run("{}",                     {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString', symbol1, symbol2]");
					command.run("{e: 5}",                 {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']");
					global.symbol1 && command.run("{e: 5, [symbol2]: 11}",  {eval: true, note: "May fail under engines not supporting variables in object declaration."},    /**/ "dict3", "['a', 'c', 'e', 'toString', symbol1, symbol2]");

					command.run("{a: 1}",                 {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "undefined", "true");
					global.symbol1 && command.run("{a: 1, [symbol1]: 10}",  {eval: true, note: "May fail under engines not supporting variables in object declaration."},    /**/ "dict1", "['a', 'c', 'e', 'toString', symbol1, symbol2]", "undefined", "true");
					command.run("{a: 1, c: 3}",           {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "undefined", "true");
					global.symbol1 && command.run("{a: 1, c: 3, [symbol1]: 10}", {eval: true, note: "May fail under engines not supporting variables in object declaration."}, /**/ "dict2", "['a', 'c', 'e', 'toString', symbol1, symbol2]", "undefined", "true");
					command.run("{a: 1, c: 3, e: 5}",     {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "undefined", "true");
					global.symbol1 && command.run("{a: 1, c: 3, [symbol1]: 10, [symbol2]: 11}", {eval: true, note: "May fail under engines not supporting variables in object declaration."}, /**/ "dict3", "['a', 'c', 'e', 'toString', symbol1, symbol2]", "undefined", "true");

					command.run("{a: 1}",                 {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "undefined", "false");
					command.run("{}",                     {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "undefined", "false");
					command.run("{e: 5}",                 {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "undefined", "false");
					
					command.run("{a: 1, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}");
					command.run("{a: 7, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}");
					command.run("{a: 7, c: 9, e: 5, toString: 13}",    {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}");

					command.run("{a: 1, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "true");
					command.run("{a: 1, c: 3, e: 11, toString: 13}",   {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "true");
					command.run("{a: 1, c: 3, e: 5, toString: 13}",    {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "true");

					command.run("{a: 1, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "false");
					command.run("{a: 7, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "false");
					command.run("{a: 7, c: 9, e: 5, toString: 13}",    {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "false");
					
					command.run("{a: 1}",                 {eval: true},    /**/ "dict1", "'a'");

					command.run("{}",                                  {eval: true}     /**/ );
					command.run("{}"       ,                           {eval: true},    /**/ "undefined", "['a']");
					command.run("{a: 1}",                              {eval: true},    /**/ "undefined", "['a']", "{a: 1, b: 2, c: 3}");
					command.run("{a: 1}",                              {eval: true},    /**/ "undefined", "['a']", "{a: 1, b: 2, c: 3}", "true");
					command.run("{a: 1}",                              {eval: true},    /**/ "undefined", "['a']", "{a: 1, b: 2, c: 3}", "false");
					command.run("{a: 1, c: 3}",                        {eval: true},    /**/ "undefined", "['a', 'c']", "{a: 1, b: 2, c: 3}");
					command.run("{a: 1, c: 3}",                        {eval: true},    /**/ "undefined", "['a', 'c']", "{a: 1, b: 2, c: 3}", "true");
					command.run("{a: 1, c: 3}",                        {eval: true},    /**/ "undefined", "['a', 'c']", "{a: 1, b: 2, c: 3}", "false");

					command.end();

					
					command = test.prepareCommand(types.set, "Doodad.Types.set");
					
					command.run(undefined,   {eval: true}     /**/ );
					command.run(undefined,   {eval: true},    /**/ "undefined", "'a'");
					command.run(undefined,   {eval: true},    /**/ "dict1");
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(2,           {eval: true},    /**/ "dict1", "'a'", "2");
					command.run(3,           {eval: true},    /**/ "dict1", "'b'", "3");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'c'", "4");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'d'", "5");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'e'", "6");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'f'", "7");
					if (global.symbol1) {
						command.run(11,          {eval: true},    /**/ "dict1", "symbol1", "11");
						command.run(undefined,   {eval: true},    /**/ "dict1", "symbol2", "12");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(undefined,   {eval: true},    /**/ "dict2", "'a'", "2");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'b'", "3");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'c'", "4");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'d'", "5");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'e'", "6");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'f'", "7");
					if (global.symbol1) {
						command.run(undefined,   {eval: true},    /**/ "dict2", "symbol1", "11");
						command.run(undefined,   {eval: true},    /**/ "dict2", "symbol2", "12");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(undefined,   {eval: true},    /**/ "dict3", "'a'", "2");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'b'", "3");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'c'", "4");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'d'", "5");
					command.run(6,           {eval: true},    /**/ "dict3", "'e'", "6");
					command.run(7,           {eval: true},    /**/ "dict3", "'f'", "7");
					if (global.symbol1) {
						command.run(undefined,   {eval: true},    /**/ "dict3", "symbol1", "11");
						command.run(12,          {eval: true},    /**/ "dict3", "symbol2", "12");
					};

					command.chain(function(dummy) {
						createDicts();
					});
					command.run(2,           {eval: true},    /**/ "dict1", "'a'", "2", "true");
					command.run(3,           {eval: true},    /**/ "dict1", "'b'", "3", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'c'", "4", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'d'", "5", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'e'", "6", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'f'", "7", "true");
					if (global.symbol1) {
						command.run(11,          {eval: true},    /**/ "dict1", "symbol1", "11", "true");
						command.run(undefined,   {eval: true},    /**/ "dict1", "symbol2", "12", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(2,           {eval: true},    /**/ "dict2", "'a'", "2", "true");
					command.run(3,           {eval: true},    /**/ "dict2", "'b'", "3", "true");
					command.run(4,           {eval: true},    /**/ "dict2", "'c'", "4", "true");
					command.run(5,           {eval: true},    /**/ "dict2", "'d'", "5", "true");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'e'", "6", "true");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'f'", "7", "true");
					if (global.symbol1) {
						command.run(11,          {eval: true},    /**/ "dict2", "symbol1", "11", "true");
						command.run(undefined,   {eval: true},    /**/ "dict2", "symbol2", "12", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(2,           {eval: true},    /**/ "dict3", "'a'", "2", "true");
					command.run(3,           {eval: true},    /**/ "dict3", "'b'", "3", "true");
					command.run(4,           {eval: true},    /**/ "dict3", "'c'", "4", "true");
					command.run(5,           {eval: true},    /**/ "dict3", "'d'", "5", "true");
					command.run(6,           {eval: true},    /**/ "dict3", "'e'", "6", "true");
					command.run(7, {eval: true},    /**/ "dict3", "'f'", "7", "true");
					if (global.symbol1) {
						command.run(11,           {eval: true},    /**/ "dict3", "symbol1", "11", "true");
						command.run(12, {eval: true},    /**/ "dict3", "symbol2", "12", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(2,           {eval: true},    /**/ "dict1", "'a'", "2", "false");
					command.run(3,           {eval: true},    /**/ "dict1", "'b'", "3", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'c'", "4", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'d'", "5", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'e'", "6", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'f'", "7", "false");
					if (global.symbol1) {
						command.run(11,          {eval: true},    /**/ "dict1", "symbol1", "11", "false");
						command.run(undefined,   {eval: true},    /**/ "dict1", "symbol2", "12", "false");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(undefined,   {eval: true},    /**/ "dict2", "'a'", "2", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'b'", "3", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'c'", "4", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'d'", "5", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'e'", "6", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'f'", "7", "false");
					if (global.symbol1) {
						command.run(undefined,   {eval: true},    /**/ "dict2", "symbol1", "11", "false");
						command.run(undefined,   {eval: true},    /**/ "dict2", "symbol2", "12", "false");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(undefined,   {eval: true},    /**/ "dict3", "'a'", "2", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'b'", "3", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'c'", "4", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'d'", "5", "false");
					command.run(6,           {eval: true},    /**/ "dict3", "'e'", "6", "false");
					command.run(7,           {eval: true},    /**/ "dict3", "'f'", "7", "false");
					if (global.symbol1) {
						command.run(undefined,   {eval: true},    /**/ "dict3", "symbol1", "11", "false");
						command.run(12,          {eval: true},    /**/ "dict3", "symbol2", "12", "false");
					};
					
					command.end();
					command.chain(function(dummy) {
						createDicts();
					});
					
					
					command = test.prepareCommand(types.sets, "Doodad.Types.sets");
					
					command.run("{}",                                   {eval: true}     /**/ );
					command.run("{}",                                   {eval: true},    /**/ "undefined", "'a'");
					command.run("{}",                                   {eval: true},    /**/ "dict1");
					
					command.run("{a: 2, b: 3}",                         {eval: true},    /**/ "dict1", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}");
					
					if (global.symbol1) {
						command.chain(function(dummy) {
							createDicts();
						});
						command.run("{a: 2, b: 3, [symbol1]: 11}",          {eval: true, note: "May fail under engines not supporting variables in object declaration."},    /**/ "dict1", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, [symbol1]: 11, [symbol2]: 12}");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{}",                                   {eval: true},    /**/ "dict2", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}");
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{e: 6, f: 7}",                         {eval: true},    /**/ "dict3", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}");

					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 2, b: 3}",                         {eval: true},    /**/ "dict1", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}", "true");
					
					if (global.symbol1) {
						command.chain(function(dummy) {
							createDicts();
						});
						command.run("{a: 2, b: 3, [symbol1]: 11}",          {eval: true, note: "May fail under engines not supporting variables in object declaration."},    /**/ "dict1", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, [symbol1]: 11, [symbol2]: 12}", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 2, b: 3, c: 4, d: 5}",             {eval: true},    /**/ "dict2", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}", "true");
					
					if (global.symbol1) {
						command.chain(function(dummy) {
							createDicts();
						});
						command.run("{a: 2, b: 3, [symbol1]: 11}",          {eval: true, note: "May fail under engines not supporting variables in object declaration."},    /**/ "dict2", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, [symbol1]: 11, [symbol2]: 12}", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}", {eval: true},    /**/ "dict3", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}", "true");
					
					if (global.symbol1) {
						command.chain(function(dummy) {
							createDicts();
						});
						command.run("{a: 2, b: 3, c: 4, d: 5, [symbol1]: 11}",  {eval: true, note: "May fail under engines not supporting variables in object declaration."},    /**/ "dict2", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7, [symbol1]: 11, [symbol2]: 12}", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 2, b: 3}",                         {eval: true},    /**/ "dict1", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}", "false");
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{}",                                   {eval: true},    /**/ "dict2", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}", "false");
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{e: 6, f: 7}",                         {eval: true},    /**/ "dict3", "{a: 2, b: 3, c: 4, d: 5, e: 6, f: 7}", "false");
					
					command.end();
					command.chain(function(dummy) {
						createDicts();
					});


					command = test.prepareCommand(types.getDefault, "Doodad.Types.getDefault");
					
					command.run(undefined,   {eval: true}     /**/ );
					command.run(undefined,   {eval: true},    /**/ "undefined", "'a'");
					command.run(undefined,   {eval: true},    /**/ "dict1");
					
					command.run(1,           {eval: true},    /**/ "dict1", "'a'", "undefined", "true");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'c'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'d'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'e'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'f'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'toString'", "undefined", "true");
					if (global.symbol1) {
						command.run(10,          {eval: true},    /**/ "dict1", "symbol1", "undefined", "true");
						command.run(undefined,   {eval: true},    /**/ "dict1", "symbol2", "undefined", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,           {eval: true},    /**/ "dict1", "'a'", "2", "true");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'", "3", "true");
					command.run(4,           {eval: true},    /**/ "dict1", "'c'", "4", "true");
					command.run(5,           {eval: true},    /**/ "dict1", "'d'", "5", "true");
					command.run(6,           {eval: true},    /**/ "dict1", "'e'", "6", "true");
					command.run(7,           {eval: true},    /**/ "dict1", "'f'", "7", "true");
					command.run(8,           {eval: true},    /**/ "dict1", "'toString'", "8", "true");
					if (global.symbol1) {
						command.run(10,          {eval: true},    /**/ "dict1", "symbol1", "11", "true");
						command.run(12,          {eval: true},    /**/ "dict1", "symbol2", "12", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,           {eval: true},    /**/ "dict1", "'a'", "undefined", "false");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'c'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'d'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'e'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'f'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict1", "'toString'", "undefined", "false");
					if (global.symbol1) {
						command.run(10,          {eval: true},    /**/ "dict1", "symbol1", "undefined", "false");
						command.run(undefined,   {eval: true},    /**/ "dict1", "symbol2", "undefined", "false");
					};

					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,           {eval: true},    /**/ "dict1", "'a'", "2", "false");
					command.run(2,           {eval: true},    /**/ "dict1", "'b'", "3", "false");
					command.run(4,           {eval: true},    /**/ "dict1", "'c'", "4", "false");
					command.run(5,           {eval: true},    /**/ "dict1", "'d'", "5", "false");
					command.run(6,           {eval: true},    /**/ "dict1", "'e'", "6", "false");
					command.run(7,           {eval: true},    /**/ "dict1", "'f'", "7", "false");
					command.run(8,           {eval: true},    /**/ "dict1", "'toString'", "8", "false");
					if (global.symbol1) {
						command.run(10,          {eval: true},    /**/ "dict1", "symbol1", "11", "false");
						command.run(12,          {eval: true},    /**/ "dict1", "symbol2", "12", "false");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,           {eval: true},    /**/ "dict2", "'a'", "undefined", "true");
					command.run(2,           {eval: true},    /**/ "dict2", "'b'", "undefined", "true");
					command.run(3,           {eval: true},    /**/ "dict2", "'c'", "undefined", "true");
					command.run(4,           {eval: true},    /**/ "dict2", "'d'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'e'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'f'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'toString'", "undefined", "true");
					if (global.symbol1) {
						command.run(10,          {eval: true},    /**/ "dict2", "symbol1", "undefined", "true");
						command.run(undefined,   {eval: true},    /**/ "dict2", "symbol2", "undefined", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,           {eval: true},    /**/ "dict2", "'a'", "2", "true");
					command.run(2,           {eval: true},    /**/ "dict2", "'b'", "3", "true");
					command.run(3,           {eval: true},    /**/ "dict2", "'c'", "4", "true");
					command.run(4,           {eval: true},    /**/ "dict2", "'d'", "5", "true");
					command.run(6,           {eval: true},    /**/ "dict2", "'e'", "6", "true");
					command.run(7,           {eval: true},    /**/ "dict2", "'f'", "7", "true");
					command.run(8,           {eval: true},    /**/ "dict2", "'toString'", "8", "true");
					if (global.symbol1) {
						command.run(10,          {eval: true},    /**/ "dict2", "symbol1", "11", "true");
						command.run(12,          {eval: true},    /**/ "dict2", "symbol2", "12", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(undefined,   {eval: true},    /**/ "dict2", "'a'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'b'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'c'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'d'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'e'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'f'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict2", "'toString'", "undefined", "false");
					if (global.symbol1) {
						command.run(undefined,   {eval: true},    /**/ "dict2", "symbol1", "undefined", "false");
						command.run(undefined,   {eval: true},    /**/ "dict2", "symbol2", "undefined", "false");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(2,           {eval: true},    /**/ "dict2", "'a'", "2", "false");
					command.run(3,           {eval: true},    /**/ "dict2", "'b'", "3", "false");
					command.run(4,           {eval: true},    /**/ "dict2", "'c'", "4", "false");
					command.run(5,           {eval: true},    /**/ "dict2", "'d'", "5", "false");
					command.run(6,           {eval: true},    /**/ "dict2", "'e'", "6", "false");
					command.run(7,           {eval: true},    /**/ "dict2", "'f'", "7", "false");
					command.run(8,           {eval: true},    /**/ "dict2", "'toString'", "8", "false");
					if (global.symbol1) {
						command.run(11,          {eval: true},    /**/ "dict2", "symbol1", "11", "false");
						command.run(12,          {eval: true},    /**/ "dict2", "symbol2", "12", "false");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,           {eval: true},    /**/ "dict3", "'a'", "undefined", "true");
					command.run(2,           {eval: true},    /**/ "dict3", "'b'", "undefined", "true");
					command.run(3,           {eval: true},    /**/ "dict3", "'c'", "undefined", "true");
					command.run(4,           {eval: true},    /**/ "dict3", "'d'", "undefined", "true");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'", "undefined", "true");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'", "undefined", "true");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'toString'", "undefined", "true");
					if (global.symbol1) {
						command.run(10,          {eval: true},    /**/ "dict3", "symbol1", "undefined", "true");
						command.run(11,          {eval: true},    /**/ "dict3", "symbol2", "undefined", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,           {eval: true},    /**/ "dict3", "'a'", "2", "true");
					command.run(2,           {eval: true},    /**/ "dict3", "'b'", "3", "true");
					command.run(3,           {eval: true},    /**/ "dict3", "'c'", "4", "true");
					command.run(4,           {eval: true},    /**/ "dict3", "'d'", "5", "true");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'", "6", "true");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'", "7", "true");
					command.run(8,           {eval: true},    /**/ "dict3", "'toString'", "8", "true");
					if (global.symbol1) {
						command.run(10,          {eval: true},    /**/ "dict3", "symbol1", "11", "true");
						command.run(11,          {eval: true},    /**/ "dict3", "symbol2", "12", "true");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(undefined,   {eval: true},    /**/ "dict3", "'a'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'b'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'c'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'d'", "undefined", "false");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'", "undefined", "false");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'", "undefined", "false");
					command.run(undefined,   {eval: true},    /**/ "dict3", "'toString'", "undefined", "false");
					if (global.symbol1) {
						command.run(undefined,   {eval: true},    /**/ "dict3", "symbol1", "undefined", "false");
						command.run(11,          {eval: true},    /**/ "dict3", "symbol2", "undefined", "false");
					};
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(2,           {eval: true},    /**/ "dict3", "'a'", "2", "false");
					command.run(3,           {eval: true},    /**/ "dict3", "'b'", "3", "false");
					command.run(4,           {eval: true},    /**/ "dict3", "'c'", "4", "false");
					command.run(5,           {eval: true},    /**/ "dict3", "'d'", "5", "false");
					command.run(5,           {eval: true},    /**/ "dict3", "'e'", "6", "false");
					command.run(6,           {eval: true},    /**/ "dict3", "'f'", "7", "false");
					command.run(8,           {eval: true},    /**/ "dict3", "'toString'", "8", "false");
					if (global.symbol1) {
						command.run(11,          {eval: true},    /**/ "dict3", "symbol1", "11", "false");
						command.run(11,          {eval: true},    /**/ "dict3", "symbol2", "12", "false");
					};
					
					command.run("undefined",                    {eval: true}     /**/ );
					command.run("undefined",                    {eval: true},    /**/ "undefined", "'a'");
					command.run(1,                              {eval: true},    /**/ "undefined", "'a'", "1");
					command.run(1,                              {eval: true},    /**/ "undefined", "'a'", "1", "true");
					command.run(1,                              {eval: true},    /**/ "undefined", "'a'", "1", "false");

					command.end();
					command.chain(function(dummy) {
						createDicts();
					});

					
					command = test.prepareCommand(types.getsDefault, "Doodad.Types.getsDefault");
					
					command.run("{}",                     {eval: true}     /**/ );
					command.run("{}",                     {eval: true},    /**/ "undefined", "'a'");
					command.run("{}",                     {eval: true},    /**/ "dict1");
					
					command.run("{a: 1}",                 {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']");
					command.run("{}",                     {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']");
					command.run("{e: 5}",                 {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']");

					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 1}",                 {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "undefined", "true");
					command.run("{a: 1, c: 3}",           {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "undefined", "true");
					command.run("{a: 1, c: 3, e: 5}",     {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "undefined", "true");

					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 1}",                 {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "undefined", "false");
					command.run("{}",                     {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "undefined", "false");
					command.run("{e: 5}",                 {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "undefined", "false");
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 1, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}");
					command.run("{a: 7, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}");
					command.run("{a: 7, c: 9, e: 5, toString: 13}",    {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}");

					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 1, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "true");
					command.run("{a: 1, c: 3, e: 11, toString: 13}",   {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "true");
					command.run("{a: 1, c: 3, e: 5, toString: 13}",    {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "true");

					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 1, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict1", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "false");
					command.run("{a: 7, c: 9, e: 11, toString: 13}",   {eval: true},    /**/ "dict2", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "false");
					command.run("{a: 7, c: 9, e: 5, toString: 13}",    {eval: true},    /**/ "dict3", "['a', 'c', 'e', 'toString']", "{a: 7, c: 9, e: 11, toString: 13}", "false");
					
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 1}",                              {eval: true},    /**/ "dict1", "'a'");

					command.run("{}",                                  {eval: true}     /**/ );
					command.run("{}"       ,                           {eval: true},    /**/ "undefined", "['a']");
					command.run("{a: 1}",                              {eval: true},    /**/ "undefined", "['a']", "{a: 1, b: 2, c: 3}");
					command.run("{a: 1}",                              {eval: true},    /**/ "undefined", "['a']", "{a: 1, b: 2, c: 3}", "true");
					command.run("{a: 1}",                              {eval: true},    /**/ "undefined", "['a']", "{a: 1, b: 2, c: 3}", "false");
					command.run("{a: 1, c: 3}",                        {eval: true},    /**/ "undefined", "['a', 'c']", "{a: 1, b: 2, c: 3}");
					command.run("{a: 1, c: 3}",                        {eval: true},    /**/ "undefined", "['a', 'c']", "{a: 1, b: 2, c: 3}", "true");
					command.run("{a: 1, c: 3}",                        {eval: true},    /**/ "undefined", "['a', 'c']", "{a: 1, b: 2, c: 3}", "false");

					command.end();
					command.chain(function(dummy) {
						createDicts();
					});
					
					
					command = test.prepareCommand(types.keys, "Doodad.Types.keys");
					command.run("[]",                    {eval: true, contains: true}     /**/ );
					command.run("['a', 'b']",            {eval: true, contains: true},    /**/ "dict1");
					command.run("[]",                    {eval: true, contains: true},    /**/ "dict2");
					command.run("['e', 'f']",            {eval: true, contains: true},    /**/ "dict3");
					command.end();
					
					
					command = test.prepareCommand(types.keysInherited, "Doodad.Types.keysInherited");
					command.run("[]",                             {eval: true, contains: true}     /**/ );
					command.run("['a', 'b']",                     {eval: true, contains: true},    /**/ "dict1");
					command.run("['a', 'b', 'c', 'd']",           {eval: true, contains: true},    /**/ "dict2");
					command.run("['a', 'b', 'c', 'd', 'e', 'f']", {eval: true, contains: true},    /**/ "dict3");
					command.end();
					
					
					command = test.prepareCommand(types.complete, "Doodad.Types.complete");
					command.run("undefined",                      {eval: true}     /**/ );
					command.run("{a: 1, b: 2, c: 4, d: 5}",       {eval: true},    /**/ "dict1", "{a: 2, b: 3, c: 4, d: 5}");
					command.end();
					command.chain(function(dummy) {
						createDicts();
					});
					
					
					command = test.prepareCommand(types.depthComplete, "Doodad.Types.depthComplete");
					command.run("undefined",                               {eval: true}     /**/ );
					command.run("{a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4}}}",         {eval: true, depth: 2},    /**/ "0", "{a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4}}}", "{b: {cc: 4, ee: 5}}");
					command.run("{a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4}, ee: 5}}",  {eval: true, depth: 2},    /**/ "1", "{a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4}}}", "{b: {cc: 4, ee: 5}}");
					command.end();
					
					
					command = test.prepareCommand(types.extend, "Doodad.Types.extend");
					command.run("{a: 2, b: 3, c: 4, d: 5}",       {eval: true},    /**/ "dict1", "{a: 2, b: 3, c: 4, d: 5}");
					command.end();
					command.chain(function(dummy) {
						createDicts();
					});
					
					
					command = test.prepareCommand(types.depthExtend, "Doodad.Types.depthExtend");
					command.run("undefined",                                              {eval: true}            /**/ );
					command.run("{a: {aa: 1, bb: 2}, b: {cc: 4, dd: {aaa: 5}}}",          {eval: true, depth: 2}, /**/ "0", "{a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4, bbb: 5}}}", "{b: {cc: 4, dd: {aaa: 5}}}");
					command.run("{a: {aa: 1, bb: 2}, b: {cc: 4, dd: {aaa: 5}}}",          {eval: true, depth: 2}, /**/ "1", "{a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4, bbb: 5}}}", "{b: {cc: 4, dd: {aaa: 5}}}");
					command.run("{a: {aa: 1, bb: 2}, b: {cc: 4, dd: {aaa: 5, bbb: 5}}}",  {eval: true, depth: 2}, /**/ "2", "{a: {aa: 1, bb: 2}, b: {cc: 3, dd: {aaa: 4, bbb: 5}}}", "{b: {cc: 4, dd: {aaa: 5}}}");
					command.end();
					command.chain(function(dummy) {
						createDicts();
					});
					
					
					command = test.prepareCommand(types.fill, "Doodad.Types.fill");
					command.run("undefined",                        {eval: true}     /**/ );
					command.run("{a: 1, b: 2}",                     {eval: true},    /**/ "undefined", "dict1", "{a: 2, b: 3, c: 4, d: 5}");

					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 2, b: 2}",                     {eval: true},    /**/ "'a'", "dict1", "{a: 2, b: 3, c: 4, d: 5}");

					command.chain(function(dummy) {
						createDicts();
					});
					command.run("{a: 2, b: 2, c: 4}",               {eval: true},    /**/ "['a', 'c']", "dict1", "{a: 2, b: 3, c: 4, d: 5}");

					command.end();
					command.chain(function(dummy) {
						createDicts();
					});
					
					
					command = test.prepareCommand(types.values, "Doodad.Types.values");
					command.run("[]",                    {eval: true, contains: true}     /**/ );
					command.run("[1, 2]",                {eval: true, contains: true},    /**/ "dict1");
					command.run("[]",                    {eval: true, contains: true},    /**/ "dict2");
					command.run("[5, 6]",                {eval: true, contains: true},    /**/ "dict3");
					command.end();
					
					
					command = test.prepareCommand(types.items, "Doodad.Types.items");
					command.run("[]",                    {eval: true, contains: true, depth: 1}     /**/ );
					command.run("[['a', 1], ['b', 2]]",  {eval: true, contains: true, depth: 1},    /**/ "dict1");
					command.run("[]",                    {eval: true, contains: true, depth: 1},    /**/ "dict2");
					command.run("[['e', 5], ['f', 6]]",  {eval: true, contains: true, depth: 1},    /**/ "dict3");
					command.end();
					
					
					command = test.prepareCommand(types.popAt, "Doodad.Types.popAt");
					command.run(undefined,  {eval: true}     /**/ );
					command.run(undefined,  {eval: true},    /**/  "dict1");
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,          {eval: true},    /**/  "dict1", "'a'");
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(2,          {eval: true},    /**/  "dict1", "'b'");
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(undefined,  {eval: true},    /**/  "dict1", "'c'");
					command.end();
					command.chain(function(dummy) {
						createDicts();
					});

					command = test.prepareCommand(types.popItem, "Doodad.Types.popItem");
					command.run(undefined,  {eval: true}     /**/ );
					command.run(undefined,  {eval: true},    /**/  "dict1");
					command.run(undefined,  {eval: true},    /**/  "dict1", 0);
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,          {eval: true},    /**/  "dict1", 1);
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(2,          {eval: true},    /**/  "dict1", 2);
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(undefined,  {eval: true},    /**/  "dict1", 3);
					command.chain(function(dummy) {
						createDicts();
					});
					command.run(1,          {eval: true, contains: true}, /**/  "dict1", "function(val, key, obj){return val === 1}");
					command.end();
					command.chain(function(dummy) {
						createDicts();
					});

					command = test.prepareCommand(types.popItems, "Doodad.Types.popItems");
					command.run("[]",       {eval: true, contains: true}  /**/ );
					command.run("[]",       {eval: true, contains: true}, /**/  "dict1");
					command.run("[]",       {eval: true, contains: true}, /**/  "dict1", "[0]");
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("[1]",      {eval: true, contains: true}, /**/  "dict1", "[0, 1]");
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("[1, 2]",   {eval: true, contains: true}, /**/  "dict1", "[0, 1, 2]");
					command.chain(function(dummy) {
						createDicts();
					});
					command.run("[1]",      {eval: true, contains: true}, /**/  "dict1", "function(val, key, obj){return val === 1}");
					command.end();
					command.chain(function(dummy) {
						createDicts();
					});
					
					
					command = test.prepareCommand(types.isClonable, "Doodad.Types.isClonable");
					command.run(false,      {eval: true}     /**/ );
					command.run(true,       {eval: true},    /**/  "dict1");
					command.end();
					
					command = test.prepareCommand(types.clone, "Doodad.Types.clone");
					command.run("undefined",                                {eval: true}     /**/ );
					command.run("dict1",                                    {eval: true, not: true, mode: 'compare'},  /**/  "dict1");
					if (global.symbol1) {
						command.run("{a: 1, b: 2, [symbol1]: 10}",          {eval: true, inherited: true, note: "May fail under engines not supporting variables in object declaration."},  /**/  "dict1");
					} else {
						command.run("{a: 1, b: 2}",                         {eval: true, inherited: true},  /**/  "dict1");
					};
					command.run("dict2",                                    {eval: true, not: true, mode: 'compare'},  /**/  "dict2");
					if (global.symbol1) {
						command.run("{a: 1, b: 2, c: 3, d: 4, [symbol1]: 10}",  {eval: true, inherited: true, note: "May fail under engines not supporting variables in object declaration."},  /**/  "dict2");
					} else {
						command.run("{a: 1, b: 2, c: 3, d: 4}",             {eval: true, inherited: true},  /**/  "dict2");
					};
					command.run("dict3",                                    {eval: true, not: true, mode: 'compare'},  /**/  "dict3");
					if (global.symbol1) {
						command.run("{a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, [symbol1]: 10, [symbol2]: 11}",  {eval: true, inherited: true, note: "May fail under engines not supporting variables in object declaration."},  /**/  "dict3");
					} else {
						command.run("{a: 1, b: 2, c: 3, d: 4, e: 5, f: 6}",  {eval: true, inherited: true},  /**/  "dict3");
					};
					command.end();
				},
			},
		};
		return DD_MODULES;
	},
};
//! END_MODULE()