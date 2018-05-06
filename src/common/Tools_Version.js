//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Tools_Version.js - Software versions tool
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
	modules['Doodad.Tools/Version'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		bootstrap: true,

		create: function create(root, /*optional*/_options, _shared) {
			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools;

			tools.complete(_shared.Natives, {
				windowParseInt: global.parseInt,
				/* eslint no-restricted-properties: "off" */ // Thanks, but I want isNaN
				windowIsNaN: global.isNaN,
			});

			tools.ADD('Version', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 0,
						params: {
							data: {
								type: 'array',
								optional: false,
								description: "Version data",
							},
							options: {
								type: 'object',
								optional: true,
								description: "Options",
							},
						},
						returns: 'error',
						description: "Represents a software version.",
					}
				//! END_REPLACE()
				, types.Type.$inherit(
					/*typeProto*/
					{
						$TYPE_NAME: 'Version',
						$TYPE_UUID: '' /*! INJECT('+' + TO_SOURCE(UUID('Version')), true) */,

						__parse: function __parse(val, identifiers, trimSpaces) {
							const ar = [];
							const valLen = val.length;
							const regexps = [/([^0-9]|[ ])/g, /([0-9]|[ ])/g];
							let alt = false;
							let start = 0,
								end;
							do {
								end = tools.search(val, regexps[alt + 0], start);
								if ((end === start) && (val[end] !== ' ')) {
									alt = !alt;
									end = tools.search(val, regexps[alt + 0], start);
								};
								if (end >= 0) {
									while (val[end] === ' ') {
										end++;
										if (end >= valLen) {
											end = -1;
											break;
										};
									};
								};
								const subval = val.slice(start, (end >= 0 ? end : undefined));
								const subvalTrim = tools.trim(subval);
								let subvalNumber;
								if (identifiers && types.has(identifiers, subvalTrim)) {
									subvalNumber = _shared.Natives.windowParseInt(identifiers[subvalTrim]);
								} else {
									subvalNumber = _shared.Natives.windowParseInt(subvalTrim);
								};
								ar.push(subvalNumber, (trimSpaces ? subvalTrim : subval));
								start = end;
								alt = !alt;
							} while (end >= 0);
							return ar;
						},

						parse: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 1,
									params: {
										str: {
											type: 'string',
											optional: false,
											description: "A string",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options",
										},
									},
									returns: 'Version',
									description: "Parses a string to a 'Version' object with the specified options.",
								}
							//! END_REPLACE()
							, function parse(str, /*optional*/options) {
								if (types._instanceof(str, tools.Version)) {
									return str;
								};

								root.DD_ASSERT && root.DD_ASSERT(types.isNothing(options) || types.isObject(options), "Invalid options.");

								options = tools.nullObject(options);

								//const dontThrow = types.getDefault(options, 'dontThrow', false);

								// Force to string
								str += '';

								const identifiers = types.getDefault(options, 'identifiers', {}),
									trimSpaces = types.getDefault(options, 'trimSpaces', false);

								// Doodad.Tools.Version.parse('1.1.23 beta', {identifiers: {alpha: 0, beta: 1, release: 2}}) --> [1, 1, 23, 1]
								// Doodad.Tools.Version.parse('1.1.23 build 1324') --> [1, 1, 23, 1324]
								// Doodad.Tools.Version.parse('major: 1, minor: 1, revision: 23 beta', {identifiers: {beta: 1}}) --> [1, 1, 23, 1]

								const ar = this.__parse(str, identifiers, trimSpaces);

								return new this(ar, options);
							}),

						compare: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 0,
									params: {
										version1: {
											type: 'string,Version',
											optional: false,
											description: "A version to compare from",
										},
										version2: {
											type: 'string,Version',
											optional: false,
											description: "A version to compare to",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options",
										},
									},
									returns: 'integer',
									description: "Compares two software versions together. Returns '1' if 'version1' is greater than 'version2'. Returns '-1' if 'version1' is lower than 'version2'. Returns '0' if versions are equal.",
								}
							//! END_REPLACE()
							, function compare(version1, version2, /*optional*/options) {
								if (!types._instanceof(version1, tools.Version)) {
									version1 = this.parse(version1, options);
								};
								return version1.compare(version2, options);
							}),
					},
					/*instanceProto*/
					{
						data: types.READ_ONLY(null),
						options: types.READ_ONLY(null),

						_new: types.SUPER(function _new(data, /*optional*/options) {
							this._super();
							types.setAttributes(this, {
								data: data,
								options: tools.nullObject(options),
							});
						}),

						compare: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 1,
									params: {
										version: {
											type: 'string,Version',
											optional: false,
											description: "A version to compare to",
										},
										options: {
											type: 'object',
											optional: true,
											description: "Options",
										},
									},
									returns: 'integer',
									description: "Compares software version with another software version. Returns '1' if 'version1' is greater than 'version2'. Returns '-1' if 'version1' is lower than 'version2'. Returns '0' if versions are equal.",
								}
							//! END_REPLACE()
							, function compare(version, /*optional*/options) {
								options = tools.nullObject(this.options, options);
								if (!types._instanceof(version, tools.Version)) {
									version = types.getType(this).parse(version, options);
								};
								const data1 = this.data,
									data1Len = data1.length,
									data2 = version.data,
									data2Len = data2.length,
									count = types.getIn(options, 'count', (Math.max(data1Len, data2Len) / 2));
								for (let i = 0; i < count; i++) {
									let number1 = NaN,
										j = 0;
									while (_shared.Natives.windowIsNaN(number1) && (j < data1Len)) {
										if (types.has(data1, j) && types.has(data1, j + 1)) {
											number1 = data1[j];
										};
										j += 2;
									};
									let number2 = NaN,
										k = 0;
									while (_shared.Natives.windowIsNaN(number2) && (k < data2Len)) {
										if (types.has(data2, k) && types.has(data2, k + 1)) {
											number2 = data2[k];
										};
										k += 2;
									};
									number1 = (+number1 || 0);
									number2 = (+number2 || 0);
									if (number2 > number1) {
										return 1;
									} else if (number2 < number1) {
										return -1;
									};
								};
								return 0;
							}),

						toString: root.DD_DOC(
							//! REPLACE_IF(IS_UNSET('debug'), "null")
								{
									author: "Claude Petit",
									revision: 1,
									params: null,
									returns: 'string',
									description: "Converts to string.",
								}
							//! END_REPLACE()
							, function toString(/*optional*/options) {
								//options = tools.nullObject(options);
								//const identifiers = types.getIn(options, 'identifiers', this.options.identifiers);
								let result = '';
								const data = this.data,
									dataLen = data.length;
								for (let i = 1; i < dataLen; i += 2) {
									if (types.has(data, i - 1) && types.has(data, i)) {
										result += data[i];
									};
								};
								return result;
							}),
					}
				)));


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
