//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
	// doodad-js - Object-oriented programming framework
	// File: Tools_Html.js - Resources
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
	modules['Doodad.Tools.Html'] = {
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: [
			'Doodad.Resources',
			{
				name: 'Doodad.Resources/Common',
				optional: true,
			},
		],

		create: function create(root, /*optional*/_options, _shared) {
			//===================================
			// Get namespaces
			//===================================

			const doodad = root.Doodad,
				types = doodad.Types,
				tools = doodad.Tools,
				resources = doodad.Resources,
				html = tools.Html;

			//===================================
			// Internal
			//===================================

			// <FUTURE> Thread context
			const __Internal__ = {
				entities: {
					standard: types.freezeObject(tools.nullObject({
						// NOTE: Don't forget to add the revert in "entitiesReverted.standard" !
						'lt': '<',
						'gt': '>',
						'quot': '"',
						'#39': "'",
						'amp': '&',
					})),
					full: null,
				},
				entitiesReverted: {
					standard: types.freezeObject(tools.nullObject({
						// NOTE: Don't forget to add the revert in "entities.standard" !
						'<': 'lt',
						'>': 'gt',
						'"': 'quot',
						"'": '#39',
						'&': 'amp',
					})),
					full: null,
				},
			};

			// See "http://stackoverflow.com/questions/2083754/why-shouldnt-apos-be-used-to-escape-single-quotes"
			__Internal__.entitiesMapping = {
				standard: tools.prepareMappingForEscape(__Internal__.entitiesReverted.standard, '&', ';'),

				full: null,
			};


			html.ADD('getEntities', function() {
				return __Internal__.entities.full || __Internal__.entities.standard;
			});


			html.ADD('getEntitiesReverted', function() {
				return __Internal__.entitiesReverted.full || __Internal__.entitiesReverted.standard;
			});


			tools.ADD('escapeHtml', root.DD_DOC(
				//! REPLACE_IF(IS_UNSET('debug'), "null")
					{
						author: "Claude Petit",
						revision: 1,
						params: {
							text: {
								type: 'string',
								optional: false,
								description: "String to escape",
							},
							full: {
								type: 'bool',
								optional: true,
								description: "Default is 'false'."
							},
						},
						returns: 'string',
						description: "Escapes a string to HTML.",
					}
				//! END_REPLACE()
				, function escapeHtml(text, /*optional*/full) {
					const mapping = (full ? __Internal__.entitiesMapping.full || __Internal__.entitiesMapping.standard : __Internal__.entitiesMapping.standard);
					return tools.escape(text, mapping[0], mapping[1]);
				}));


			__Internal__.parseEntities = function parseEntities(entities) {
				__Internal__.entities.full = types.freezeObject(tools.reduce(entities, function(newEntities, value, name) {
					const nameLc = name.toLowerCase();
					if ((nameLc !== name) && types.has(entities, nameLc) && (entities[nameLc].characters === entities[name].characters)) {
						// FIX: Remove duplicates in "html5_entites.json"
						return newEntities;
					};
					newEntities[name.replace(/[&;]/g, "")] = value.characters;
					return newEntities;
				}, tools.nullObject()));

				__Internal__.entitiesReverted.full = types.freezeObject(tools.reduce(entities, function(newEntities, value, name) {
					const nameLc = name.toLowerCase();
					if ((nameLc !== name) && types.has(entities, nameLc) && (entities[nameLc].characters === entities[name].characters)) {
						// FIX: Remove duplicates in "html5_entites.json"
						return newEntities;
					};
					newEntities[value.characters] = name.replace(/[&;]/g, "");
					return newEntities;
				}, tools.nullObject()));

				__Internal__.entitiesMapping.full = tools.prepareMappingForEscape(__Internal__.entitiesReverted.full, '&', ';');
			};


			//===================================
			// Init
			//===================================
			return function init(/*optional*/options) {
				const resLoader = resources.getResourcesLoader();
				return resLoader.load('./common/res/html5_entities.json')
					.then(__Internal__.parseEntities);
			};
		},
	};
	return modules;
};

//! END_MODULE()
