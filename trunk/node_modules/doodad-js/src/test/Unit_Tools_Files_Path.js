//! REPLACE_BY("// Copyright 2016 Claude Petit, licensed under Apache License version 2.0\n", true)
// dOOdad - Object-oriented programming framework
// File: Unit_Tools_Path.js - Unit testing module file
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
		DD_MODULES['Doodad.Test.Tools.Files.Path'] = {
			type: 'TestModule',
			version: '0d',
			dependencies: ['Doodad.Test.Tools.Files'],

			// Unit
			priority: null,

			proto: {
				run: function run(root, /*optional*/options) {
					"use strict";

					var doodad = root.Doodad,
						types = doodad.Types,
						tools = doodad.Tools,
						namespaces = doodad.Namespaces,
						test = doodad.Test,
						unit = test.Types.Is,
						io = doodad.IO,
						files = tools.Files;

						
					if (!options) {
						options = {};
					};

					var command = test.prepareCommand(function(/*paramarray*/) {
						return files.Path.parse.apply(files.Path, arguments);
					}, "Doodad.Tools.Files.Path.parse.test1");
						
					function test1(osType, /*optional*/options) {
						if (osType === 'windows') {
							command.run({
								os: osType,
								dirChar: '\\',
								root: [],
								drive: '',
								path: [],
								file: null,
								extension: null,
								quote: '',
								isRelative: true,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "", options);

							command.run({
								os: osType,
								dirChar: '\\',
								root: [],
								drive: 'C',
								path: [],
								file: null,
								extension: null,
								quote: '',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\", options);

							command.run({
								os: osType,
								dirChar: '\\',
								root: [],
								drive: 'C',
								path: ['Temp'],
								file: null,
								extension: null,
								quote: '',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\Temp\\", options);
							
							command.run({
								os: osType,
								dirChar: '\\',
								root: [],
								drive: 'C',
								path: ['Temp', 'SubFolder'],
								file: null,
								extension: null,
								quote: '',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\Temp\\SubFolder\\", options);
							
							command.run({
								os: osType,
								dirChar: '\\',
								root: [],
								drive: 'C',
								path: ['Temp', 'SubFolder'],
								file: 'File.txt',
								extension: 'txt',
								quote: '',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\Temp\\SubFolder\\File.txt", options);
							
							command.run({
								os: osType,
								dirChar: '\\',
								root: [],
								drive: 'C',
								path: ['Temp', 'SubFolder'],
								file: 'File.txt',
								extension: 'txt',
								quote: '"',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ '"C:\\Temp\\SubFolder\\File.txt"', options);
							
						} else {
							command.run({
								os: osType,
								dirChar: '/',
								root: [],
								drive: '',
								path: [],
								file: null,
								extension: null,
								quote: '',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "/", options);

							command.run({
								os: osType,
								dirChar: '/',
								root: [],
								drive: '',
								path: ['tmp'],
								file: null,
								extension: null,
								quote: '',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "/tmp/", options);
							
							command.run({
								os: osType,
								dirChar: '/',
								root: [],
								drive: '',
								path: ['tmp', 'subfolder'],
								file: null,
								extension: null,
								quote: '',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "/tmp/subfolder/", options);
							
							command.run({
								os: osType,
								dirChar: '/',
								root: [],
								drive: '',
								path: ['tmp', 'subfolder'],
								file: 'file.txt',
								extension: 'txt',
								quote: '',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "/tmp/subfolder/file.txt", options);
							
							command.run({
								os: osType,
								dirChar: '/',
								root: [],
								drive: '',
								path: ['tmp', 'subfolder'],
								file: 'file.txt',
								extension: 'txt',
								quote: '"',
								isRelative: false,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ '"/tmp/subfolder/file.txt"', options);
							
							command.run({
								os: osType,
								dirChar: '/',
								root: [],
								drive: '',
								path: [],
								file: "C:\\SubFolder\\File.txt",
								extension: 'txt',
								quote: '',
								isRelative: true,
								noEscapes: false,
								shell: 'api',
							}, {depth: 1}, /**/ "C:\\SubFolder\\File.txt", options);
							
						};
					};

					test1('windows', {os: 'windows'});
					test1('linux', {os: 'linux'});
					
					command.end();
					
			
					var command = test.prepareCommand(function(path, /*optional*/options) {
						var res = files.Path.parse(path, options);
						if (res) {
							res = res.toString();
						};
						return res;
					}, "Doodad.Tools.Files.Path.parse.test2");
					
					function test2(osType, /*optional*/forceOs) {
						var options;
						if (forceOs) {
							options = {os: osType};
						};
						if (osType === 'windows') {
							command.run("",                                              {repetitions: 100}, /**/ null, options);
							command.run("C:\\",                                          {repetitions: 100}, /**/ "C:", options);
							command.run("",                                              {repetitions: 100}, /**/ "", options);
							command.run("C:\\",                                          {repetitions: 100}, /**/ "C:\\", options);
							command.run("C:\\",                                          {repetitions: 100}, /**/ "c:\\", options);
							command.run("C:\\Temp\\",                                    {repetitions: 100}, /**/ "C:\\Temp\\", options);
							command.run("C:\\Temp\\File.txt",                            {repetitions: 100}, /**/ "C:\\Temp\\File.txt", options);
							command.run("C:\\Temp\\SubFolder\\File.txt",                 {repetitions: 100}, /**/ "C:\\Temp\\SubFolder\\File.txt", options);
							command.run("\\",                                            {repetitions: 100}, /**/ "\\", options);
							command.run("\\Temp\\",                                      {repetitions: 100}, /**/ "\\Temp\\", options);
							command.run("\\Temp\\SubFolder\\",                           {repetitions: 100}, /**/ "\\Temp\\SubFolder\\", options);
							command.run("\\Temp\\SubFolder\\File.txt",                   {repetitions: 100}, /**/ "\\Temp\\SubFolder\\File.txt", options);
							command.run("Temp\\",                                        {repetitions: 100}, /**/ "Temp\\", options);
							command.run("Temp\\SubFolder\\",                             {repetitions: 100}, /**/ "Temp\\SubFolder\\", options);
							command.run("Temp\\SubFolder\\File.txt",                     {repetitions: 100}, /**/ "Temp\\SubFolder\\File.txt", options);
							command.run("File.txt",                                      {repetitions: 100}, /**/ "File.txt", options);
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "..\\", types.extend({}, options, {isRelative: false}));
							command.run("..\\",                                          {repetitions: 100}, /**/ "..\\", types.extend({}, options, {isRelative: true}));
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "..\\File.txt", types.extend({}, options, {isRelative: false}));
							command.run("..\\File.txt",                                  {repetitions: 100}, /**/ "..\\File.txt", types.extend({}, options, {isRelative: true}));
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "\\..\\File.txt", types.extend({}, options, {isRelative: false}));
							command.run("C:..\\File.txt",                                {repetitions: 100}, /**/ "C:..\\File.txt", types.extend({}, options, {isRelative: true}));
							command.run("C:\\..\\File.txt",                              {repetitions: 100}, /**/ "C:\\..\\File.txt", types.extend({}, options, {isRelative: true}));
							command.run("\\File.txt",                                    {repetitions: 100}, /**/ "\\SubFolder\\..\\File.txt", types.extend({}, options, {isRelative: false}));
							command.run("\\SubFolder\\File.txt",                         {repetitions: 100}, /**/ "\\SubFolder\\.\\File.txt", types.extend({}, options, {isRelative: false}));
							command.run("\\Sub Folder\\My File.txt",                     {repetitions: 100}, /**/ "\\Sub Folder\\My File.txt", options);
							command.run("\\Sub Folder\\My File.txt",                     {repetitions: 100}, /**/ "\\Sub Folder\\My File.txt", options);
							command.run("C:\\Users\\Claude\\SubFolder\\File.txt",        {repetitions: 100}, /**/ "\\SubFolder\\File.txt", types.extend({}, options, {root: "C:\\Users\\Claude"}));
							command.run("C:\\Users\\Claude\\File.txt",                   {repetitions: 100}, /**/ "\\SubFolder\\..\\File.txt", types.extend({}, options, {root: "C:\\Users\\Claude", isRelative: false}));
							command.run("C:\\Users\\File.txt",                           {repetitions: 100}, /**/ "\\SubFolder\\..\\..\\File.txt", types.extend({}, options, {root: "C:\\Users\\Claude", isRelative: false}));
							command.run('"C:\\Temp\\SubFolder\\File.txt"',               {repetitions: 100}, /**/ '"C:\\Temp\\SubFolder\\File.txt"', options);
							command.run('"\\Temp\\SubFolder\\File.txt"',                 {repetitions: 100}, /**/ '"\\Temp\\SubFolder\\File.txt"', options);
							command.run('"Temp\\SubFolder\\File.txt"',                   {repetitions: 100}, /**/ '"Temp\\SubFolder\\File.txt"', options);
							command.run('"File.txt"',                                    {repetitions: 100}, /**/ '"File.txt"', options);
							command.run('"\\Sub Folder\\My File.txt"',                   {repetitions: 100}, /**/ '"\\Sub Folder\\My File.txt"', options);
							command.run('\\"Sub Folder"\\"My File.txt"',                 {repetitions: 100}, /**/ '\\"Sub Folder"\\"My File.txt"', options);
							command.run("/tmp/subfolder/file.txt",                       {repetitions: 100}, /**/ "/tmp/subfolder/file.txt", options);
							
							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "\\My Folder\\My File.txt", types.extend({}, options, {shell: 'dos'}));
							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "\\My^ Folder\\My^ File.txt", types.extend({}, options, {shell: 'dos'}));
							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "\\MyFolder\\MyFile&HerFile.txt", types.extend({}, options, {shell: 'dos'}));
							command.run("\\MyFolder\\MyFile^&HerFile.txt",               {repetitions: 100}, /**/ "\\MyFolder\\MyFile^&HerFile.txt", types.extend({}, options, {shell: 'dos'}));
							command.run('"\\My Folder\\My File.txt"',                    {repetitions: 100}, /**/ '"\\My Folder\\My File.txt"', types.extend({}, options, {shell: 'dos'}));
						} else {
							command.run("",                                              {repetitions: 100}, /**/ null, options);
							command.run("",                                              {repetitions: 100}, /**/ "", options);
							command.run("/",                                             {repetitions: 100}, /**/ "/", options);
							command.run("/tmp/",                                         {repetitions: 100}, /**/ "/tmp/", options);
							command.run("/tmp/file.txt",                                 {repetitions: 100}, /**/ "/tmp/file.txt", options);
							command.run("/tmp/subfolder/file.txt",                       {repetitions: 100}, /**/ "/tmp/subfolder/file.txt", options);
							command.run("tmp/",                                          {repetitions: 100}, /**/ "tmp/", options);
							command.run("tmp/file.txt",                                  {repetitions: 100}, /**/ "tmp/file.txt", options);
							command.run("tmp/subfolder/file.txt",                        {repetitions: 100}, /**/ "tmp/subfolder/file.txt", options);
							command.run("file.txt",                                      {repetitions: 100}, /**/ "file.txt", options);
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "../", types.extend({}, options, {isRelative: false}));
							command.run("../",                                           {repetitions: 100}, /**/ "../", types.extend({}, options, {isRelative: true}));
							command.run(files.PathError,                              {mode: 'isinstance'}, /**/ "../file.txt", types.extend({}, options, {isRelative: false}));
							command.run("../file.txt",                                   {repetitions: 100}, /**/ "../file.txt", types.extend({}, options, {isRelative: true}));
							command.run("/file.txt",                                     {repetitions: 100}, /**/ "/subfolder/../file.txt", types.extend({}, options, {isRelative: false}));
							command.run("/subfolder/file.txt",                           {repetitions: 100}, /**/ "/subfolder/./file.txt", types.extend({}, options, {isRelative: false}));
							command.run("/Sub Folder/My File.txt",                       {repetitions: 100}, /**/ "/Sub Folder/My File.txt", options);
							command.run("/Sub Folder/My File.txt",                       {repetitions: 100}, /**/ "/Sub Folder/My File.txt", options);
							command.run("/home/claude/subfolder/file.txt",               {repetitions: 100}, /**/ "/subfolder/file.txt", types.extend({}, options, {root: "/home/claude"}));
							command.run("/home/claude/file.txt",                         {repetitions: 100}, /**/ "/subfolder/../file.txt", types.extend({}, options, {root: "/home/claude", isRelative: false}));
							command.run("/home/file.txt",                                {repetitions: 100}, /**/ "/subfolder/../../file.txt", types.extend({}, options, {root: "/home/claude", isRelative: false}));
							command.run('"/tmp/subfolder/file.txt"',                     {repetitions: 100}, /**/ '"/tmp/subfolder/file.txt"', options);
							command.run('"tmp/subfolder/file.txt"',                      {repetitions: 100}, /**/ '"tmp/subfolder/file.txt"', options);
							command.run('"file.txt"',                                    {repetitions: 100}, /**/ '"file.txt"', options);
							command.run('"/subfolder/My File.txt"',                      {repetitions: 100}, /**/ '"/subfolder/My File.txt"', options);
							command.run('/"subfolder"/"My File.txt"',                    {repetitions: 100}, /**/ '/"subfolder"/"My File.txt"', options);

							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "/My Folder/My File.txt", types.extend({}, options, {shell: 'bash'}));
							command.run("/My\\ Folder/My\\ File.txt",                    {repetitions: 100}, /**/ "/My\\ Folder/My\\ File.txt", types.extend({}, options, {shell: 'bash'}));
							command.run(types.ParseError,                             {mode: 'isinstance'}, /**/ "/MyFolder/MyFile&HerFile.txt", types.extend({}, options, {shell: 'bash'}));
							command.run("/MyFolder/MyFile\\&HerFile.txt",                {repetitions: 100}, /**/ "/MyFolder/MyFile\\&HerFile.txt", types.extend({}, options, {shell: 'bash'}));
							command.run('"/My Folder/My File.txt"',                      {repetitions: 100}, /**/ '"/My Folder/My File.txt"', types.extend({}, options, {shell: 'bash'}));
						};
					};

					test2(tools.getOS().type);
					test2('windows', true);
					test2('linux', true);
					
					command.end();
					

					var command = test.prepareCommand(function(path1, path2, /*optional*/optionsPath1, /*optional*/optionsPath2, /*optional*/setPath2, /*optional*/combineOptions, /*optional*/toStringOptions) {
						path1 = files.Path.parse(path1, optionsPath1);
						if (!path1) {
							return undefined;
						};
						path2 = files.Path.parse(path2, optionsPath2);
						if (path2) {
							if (setPath2) {
								path2 = path2.set(setPath2);
							};
							path2 = path1.combine(path2, combineOptions);
						};
						if (path2) {
							path2 = path2.toString(toStringOptions);
						};
						return path2;
					}, "Doodad.Tools.Files.Path.combine.Path");
					
					command.run("C:\\",                                                  {repetitions: 100}, /**/ "C:\\", "C:\\", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\",                                       {repetitions: 100}, /**/ "C:\\", "C:\\SubFolder\\", {os: 'windows'}, {os: 'windows'});
					command.run(types.ParseError,                                        {mode: 'isinstance'}, /**/ "C:\\", "D:\\SubFolder\\", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "SubFolder\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "\\SubFolder\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\SubFolder\\", "File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\SubFolder\\", "\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "C:\\", "..\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\SubFolder\\", "..\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\SubFolder\\", "\\..\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "SubFolder\\..\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File1.txt\\File2.txt",                              {repetitions: 100}, /**/ "C:\\File1.txt", "File2.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder\\File1.txt\\File2.txt",                   {repetitions: 100}, /**/ "C:\\SubFolder\\File1.txt", "File2.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\File1.txt\\SubFolder\\File2.txt",                   {repetitions: 100}, /**/ "C:\\File1.txt", "SubFolder\\File2.txt", {os: 'windows'}, {os: 'windows'});
					command.run("C:\\SubFolder1\\File1.txt\\SubFolder2\\File2.txt",      {repetitions: 100}, /**/ "C:\\SubFolder1\\File1.txt", "SubFolder2\\File2.txt", {os: 'windows'}, {os: 'windows'});
					
					command.run("/",                                                     {repetitions: 100}, /**/ "/", "/", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/",                                           {repetitions: 100}, /**/ "/", "/SubFolder/", {os: 'linux'}, {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/", "File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "SubFolder/File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "/SubFolder/File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/SubFolder/", "File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/SubFolder/", "/File.txt", {os: 'linux'}, {os: 'linux'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "/", "../File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/SubFolder/", "../File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/SubFolder/", "/../File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/", "SubFolder/../File.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/File1.txt/File2.txt",                                  {repetitions: 100}, /**/ "/File1.txt", "File2.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder/File1.txt/File2.txt",                        {repetitions: 100}, /**/ "/SubFolder/File1.txt", "File2.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/File1.txt/SubFolder/File2.txt",                        {repetitions: 100}, /**/ "/File1.txt", "SubFolder/File2.txt", {os: 'linux'}, {os: 'linux'});
					command.run("/SubFolder1/File1.txt/SubFolder2/File2.txt",            {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "SubFolder2/File2.txt", {os: 'linux'}, {os: 'linux'});
					
					command.run("C:\\SubFolder1\\File1.txt\\SubFolder2\\File2.txt",      {repetitions: 100}, /**/ "C:\\SubFolder1\\File1.txt", "SubFolder2/File2.txt", {os: 'windows'}, {os: 'linux'});
					command.run("/SubFolder1/File1.txt/SubFolder2/File2.txt",            {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows'});

					command.run(types.ParseError,                                     {mode: 'isinstance'}, /**/ "/SubFolder1/File1.txt", "C:\\SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows'});
					command.run("/SubFolder1/File1.txt/C:/SubFolder2/File2.txt",         {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "C:\\SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows', drive: ''});
					command.run("/SubFolder1/File1.txt/SubFolder2/File2.txt",            {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "C:\\SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows'}, {drive: ''});
					
					command.end();
					
					
					
					var command = test.prepareCommand(function(path, url, /*optional*/optionsPath, /*optional*/optionsUrl, /*optional*/setUrl, /*optional*/combineOptions, /*optional*/toStringOptions) {
						path = files.Path.parse(path, optionsPath);
						if (!path) {
							return undefined;
						};
						url = files.Url.parse(url, optionsUrl);
						if (!url) {
							return undefined;
						};
						if (setUrl) {
							url = url.set(setUrl);
						};
						path = path.combine(url, combineOptions);
						if (path) {
							path = path.toString(toStringOptions);
						};
						return path;
					}, "Doodad.Tools.Files.Path.combine.Url");
					
					command.run("C:\\",                                                  {repetitions: 100}, /**/ "C:\\", "file:///C:/", {os: 'windows'});
					command.run("C:\\SubFolder\\",                                       {repetitions: 100}, /**/ "C:\\", "file:///C:/SubFolder/", {os: 'windows'});
					command.run(types.ParseError,                                        {mode: 'isinstance'}, /**/ "C:\\", "file:///D:/SubFolder/", {os: 'windows'});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "file:///File.txt", {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "file://SubFolder/File.txt", {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "file:///SubFolder/File.txt", {os: 'windows'});
					command.run("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\SubFolder\\", "file:///File.txt", {os: 'windows'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "C:\\", "file://../File.txt", {os: 'windows'}, {isRelative: true});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\SubFolder\\", "file://../File.txt", {os: 'windows'}, {isRelative: true});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\SubFolder\\", "file:///../File.txt", {os: 'windows'}, {isRelative: true});
					command.run("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "file://SubFolder/../File.txt", {os: 'windows'});
					command.run("C:\\File1.txt\\File2.txt",                              {repetitions: 100}, /**/ "C:\\File1.txt", "file:///File2.txt", {os: 'windows'});
					command.run("C:\\SubFolder\\File1.txt\\File2.txt",                   {repetitions: 100}, /**/ "C:\\SubFolder\\File1.txt", "file:///File2.txt", {os: 'windows'});
					command.run("C:\\File1.txt\\SubFolder\\File2.txt",                   {repetitions: 100}, /**/ "C:\\File1.txt", "file://SubFolder/File2.txt", {os: 'windows'});
					command.run("C:\\SubFolder1\\File1.txt\\SubFolder2\\File2.txt",      {repetitions: 100}, /**/ "C:\\SubFolder1\\File1.txt", "file://SubFolder2/File2.txt", {os: 'windows'});
					
					command.run("/",                                                     {repetitions: 100}, /**/ "/", "file:///", {os: 'linux'});
					command.run("/SubFolder/",                                           {repetitions: 100}, /**/ "/", "file:///SubFolder/", {os: 'linux'});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/", "file:///File.txt", {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "file://SubFolder/File.txt", {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "file:///SubFolder/File.txt", {os: 'linux'});
					command.run("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/SubFolder/", "file:///File.txt", {os: 'linux'});
					command.run(files.PathError,                                         {mode: 'isinstance'}, /**/ "/", "file://../File.txt", {os: 'linux'}, {isRelative: true});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/SubFolder/", "file://../File.txt", {os: 'linux'}, {isRelative: true});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/SubFolder/", "file:///../File.txt", {os: 'linux'}, {isRelative: true});
					command.run("/File.txt",                                             {repetitions: 100}, /**/ "/", "file://SubFolder/../File.txt", {os: 'linux'});
					command.run("/File1.txt/File2.txt",                                  {repetitions: 100}, /**/ "/File1.txt", "file:///File2.txt", {os: 'linux'});
					command.run("/SubFolder/File1.txt/File2.txt",                        {repetitions: 100}, /**/ "/SubFolder/File1.txt", "file:///File2.txt", {os: 'linux'});
					command.run("/File1.txt/SubFolder/File2.txt",                        {repetitions: 100}, /**/ "/File1.txt", "file://SubFolder/File2.txt", {os: 'linux'});
					command.run("/SubFolder1/File1.txt/SubFolder2/File2.txt",            {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "file://SubFolder2/File2.txt", {os: 'linux'});
					
					command.run(types.ParseError,                                     {mode: 'isinstance'}, /**/ "/SubFolder/", "http://www.doodad-js.local/File.txt", {os: 'linux'});

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