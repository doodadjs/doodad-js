//! BEGIN_MODULE()

//! REPLACE_BY("// Copyright 2015-2018 Claude Petit, licensed under Apache License version 2.0\n", true)
// doodad-js - Object-oriented programming framework
// File: Unit_Tools_Path.js - Unit testing module file
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
	mods['Doodad.Test.Tools.Files.Path'] = {
		type: 'TestModule',
		version: /*! REPLACE_BY(TO_SOURCE(VERSION(MANIFEST("name")))) */ null /*! END_REPLACE()*/,
		dependencies: ['Doodad.Test.Tools.Files'],

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
					io = doodad.IO,
					files = tools.Files;

						
				if (!options) {
					options = {};
				};


				test.runCommand(function(/*paramarray*/) {
					return files.Path.parse.apply(files.Path, arguments);
				}, "Doodad.Tools.Files.Path.parse.test1", function(command, options) {

					command.runGroup("Windows", function(group) {
						const os = 'windows';
						const options = {os};

						group.runStep({
							os,
							dirChar: '\\',
							host: '',
							drive: '',
							root: null,
							path: [],
							file: '',
							extension: null,
							quote: '',
							isRelative: true,
							isFolder: true,
						}, {depth: 1}, /**/ "", options);

						group.runStep({
							os,
							dirChar: '\\',
							host: '',
							drive: 'C',
							root: null,
							path: [],
							file: '',
							extension: null,
							quote: '',
							isRelative: false,
							isFolder: true,
						}, {depth: 1}, /**/ "C:\\", options);

						group.runStep({
							os,
							dirChar: '\\',
							host: '',
							drive: 'C',
							root: null,
							path: ['Temp'],
							file: '',
							extension: null,
							quote: '',
							isRelative: false,
							isFolder: true,
						}, {depth: 1}, /**/ "C:\\Temp\\", options);
							
						group.runStep({
							os,
							dirChar: '\\',
							host: '',
							drive: 'C',
							root: null,
							path: ['Temp', 'SubFolder'],
							file: '',
							extension: null,
							quote: '',
							isRelative: false,
							isFolder: true,
						}, {depth: 1}, /**/ "C:\\Temp\\SubFolder\\", options);
							
						group.runStep({
							os,
							dirChar: '\\',
							host: '',
							drive: 'C',
							root: null,
							path: ['Temp', 'SubFolder'],
							file: 'File.txt',
							extension: 'txt',
							quote: '',
							isRelative: false,
							isFolder: false,
						}, {depth: 1}, /**/ "C:\\Temp\\SubFolder\\File.txt", options);
							
						group.runStep({
							os,
							dirChar: '\\',
							host: '',
							drive: 'C',
							root: null,
							path: ['Temp', 'SubFolder'],
							file: 'File.txt',
							extension: 'txt',
							quote: '"',
							isRelative: false,
							isFolder: false,
						}, {depth: 1}, /**/ '"C:\\Temp\\SubFolder\\File.txt"', options);
					});
					
					command.runGroup("Linux/Unix", function(group) {
						const os = 'linux';
						const options = {os};

						group.runStep({
							os,
							dirChar: '/',
							host: '',
							drive: '',
							root: null,
							path: [],
							file: '',
							extension: null,
							quote: '',
							isRelative: false,
							isFolder: true,
						}, {depth: 1}, /**/ "/", options);

						group.runStep({
							os,
							dirChar: '/',
							host: '',
							drive: '',
							root: null,
							path: ['tmp'],
							file: '',
							extension: null,
							quote: '',
							isRelative: false,
							isFolder: true,
						}, {depth: 1}, /**/ "/tmp/", options);
						
						group.runStep({
							os,
							dirChar: '/',
							host: '',
							drive: '',
							root: null,
							path: ['tmp', 'subfolder'],
							file: '',
							extension: null,
							quote: '',
							isRelative: false,
							isFolder: true,
						}, {depth: 1}, /**/ "/tmp/subfolder/", options);
						
						group.runStep({
							os,
							dirChar: '/',
							host: '',
							drive: '',
							root: null,
							path: ['tmp', 'subfolder'],
							file: 'file.txt',
							extension: 'txt',
							quote: '',
							isRelative: false,
							isFolder: false,
						}, {depth: 1}, /**/ "/tmp/subfolder/file.txt", options);
							
						group.runStep({
							os,
							dirChar: '/',
							host: '',
							drive: '',
							root: null,
							path: ['tmp', 'subfolder'],
							file: 'file.txt',
							extension: 'txt',
							quote: '"',
							isRelative: false,
							isFolder: false,
						}, {depth: 1}, /**/ '"/tmp/subfolder/file.txt"', options);
							
						group.runStep({
							os,
							dirChar: '/',
							host: '',
							drive: '',
							root: null,
							path: ['C:', 'SubFolder'],
							file: "File.txt",
							extension: 'txt',
							quote: '',
							isRelative: true,
							isFolder: false,
						}, {depth: 1}, /**/ "C:\\SubFolder\\File.txt", options);
					});
				});
					
			
				test.runCommand(function(path, /*optional*/options) {
					let res = files.Path.parse(path, options);
					if (res) {
						res = res.toString();
					};
					return res;
				}, "Doodad.Tools.Files.Path.parse.test2", function(command, options) {

					command.runGroup("Windows", function(group, grpOptions) {
						const os = 'windows'
						const options = {os};
						
						group.runStep("",                                              {repetitions: 100}, /**/ null, options);
						group.runStep("C:\\",                                          {repetitions: 100}, /**/ "C:", options);
						group.runStep("",                                              {repetitions: 100}, /**/ "", options);
						group.runStep("C:\\",                                          {repetitions: 100}, /**/ "C:\\", options);
						group.runStep("C:\\",                                          {repetitions: 100}, /**/ "c:\\", options);
						group.runStep("C:\\Temp\\",                                    {repetitions: 100}, /**/ "C:\\Temp\\", options);
						group.runStep("C:\\Temp\\File.txt",                            {repetitions: 100}, /**/ "C:\\Temp\\File.txt", options);
						group.runStep("C:\\Temp\\SubFolder\\File.txt",                 {repetitions: 100}, /**/ "C:\\Temp\\SubFolder\\File.txt", options);
						group.runStep("\\",                                            {repetitions: 100}, /**/ "\\", options);
						group.runStep("\\Temp\\",                                      {repetitions: 100}, /**/ "\\Temp\\", options);
						group.runStep("\\Temp\\SubFolder\\",                           {repetitions: 100}, /**/ "\\Temp\\SubFolder\\", options);
						group.runStep("\\Temp\\SubFolder\\File.txt",                   {repetitions: 100}, /**/ "\\Temp\\SubFolder\\File.txt", options);
						group.runStep("Temp\\",                                        {repetitions: 100}, /**/ "Temp\\", options);
						group.runStep("Temp\\SubFolder\\",                             {repetitions: 100}, /**/ "Temp\\SubFolder\\", options);
						group.runStep("Temp\\SubFolder\\File.txt",                     {repetitions: 100}, /**/ "Temp\\SubFolder\\File.txt", options);
						group.runStep("File.txt",                                      {repetitions: 100}, /**/ "File.txt", options);
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "..\\", tools.extend({}, options, {isRelative: false}));
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "\\..\\", options);
						group.runStep("..\\",                                          {repetitions: 100}, /**/ "..\\", options);
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "..\\File.txt", tools.extend({}, options, {isRelative: false})); 
						group.runStep("..\\File.txt",                                  {repetitions: 100}, /**/ "..\\File.txt", options);
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "\\..\\File.txt", options); // overflow
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "C:..\\File.txt", options); // overflow
						group.runStep(types.ParseError,                              {mode: 'isinstance'}, /**/ "C:\\..\\File.txt", tools.extend({}, options, {isRelative: true})); // can't be relative
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "C:\\..\\File.txt", options); // overflow
						group.runStep("\\File.txt",                                    {repetitions: 100}, /**/ "\\SubFolder\\..\\File.txt", tools.extend({}, options, {isRelative: false}));
						group.runStep("\\SubFolder\\File.txt",                         {repetitions: 100}, /**/ "\\SubFolder\\.\\File.txt", tools.extend({}, options, {isRelative: false}));
						group.runStep("\\Sub Folder\\My File.txt",                     {repetitions: 100}, /**/ "\\Sub Folder\\My File.txt", options);
						group.runStep("\\Sub Folder\\My File.txt",                     {repetitions: 100}, /**/ "\\Sub Folder\\My File.txt", options);
						group.runStep("C:\\Users\\Claude\\SubFolder\\File.txt",        {repetitions: 100}, /**/ "\\SubFolder\\File.txt", tools.extend({}, options, {root: "C:\\Users\\Claude"}));
						group.runStep("C:\\Users\\Claude\\File.txt",                   {repetitions: 100}, /**/ "\\SubFolder\\..\\File.txt", tools.extend({}, options, {root: "C:\\Users\\Claude", isRelative: false}));
						group.runStep(files.PathError,		                         {mode: 'isinstance'}, /**/ "\\SubFolder\\..\\..\\File.txt", tools.extend({}, options, {root: "C:\\Users\\Claude", isRelative: false})); // overflow
						group.runStep('"C:\\Temp\\SubFolder\\File.txt"',               {repetitions: 100}, /**/ '"C:\\Temp\\SubFolder\\File.txt"', options);
						group.runStep('"\\Temp\\SubFolder\\File.txt"',                 {repetitions: 100}, /**/ '"\\Temp\\SubFolder\\File.txt"', options);
						group.runStep('"Temp\\SubFolder\\File.txt"',                   {repetitions: 100}, /**/ '"Temp\\SubFolder\\File.txt"', options);
						group.runStep('"File.txt"',                                    {repetitions: 100}, /**/ '"File.txt"', options);
						group.runStep('"\\Sub Folder\\My File.txt"',                   {repetitions: 100}, /**/ '"\\Sub Folder\\My File.txt"', options);
						group.runStep('\\"Sub Folder"\\"My File.txt"',                 {repetitions: 100}, /**/ '\\"Sub Folder"\\"My File.txt"', options);
						group.runStep("\\tmp\\subfolder\\file.txt",                    {repetitions: 100}, /**/ "/tmp/subfolder/file.txt", options);
					});

					command.runGroup("Linux/Unix", function(group, grpOptions) {
						const os = 'linux'
						const options = {os};

						group.runStep("",                                              {repetitions: 100}, /**/ null, options);
						group.runStep("",                                              {repetitions: 100}, /**/ "", options);
						group.runStep("/",                                             {repetitions: 100}, /**/ "/", options);
						group.runStep("/tmp/",                                         {repetitions: 100}, /**/ "/tmp/", options);
						group.runStep("/tmp/file.txt",                                 {repetitions: 100}, /**/ "/tmp/file.txt", options);
						group.runStep("/tmp/subfolder/file.txt",                       {repetitions: 100}, /**/ "/tmp/subfolder/file.txt", options);
						group.runStep("tmp/",                                          {repetitions: 100}, /**/ "tmp/", options);
						group.runStep("tmp/file.txt",                                  {repetitions: 100}, /**/ "tmp/file.txt", options);
						group.runStep("tmp/subfolder/file.txt",                        {repetitions: 100}, /**/ "tmp/subfolder/file.txt", options);
						group.runStep("file.txt",                                      {repetitions: 100}, /**/ "file.txt", options);
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "../", tools.extend({}, options, {isRelative: false})); // overflow
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "/../", options); // overflow
						group.runStep("../",                                           {repetitions: 100}, /**/ "../", options);
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "../file.txt", tools.extend({}, options, {isRelative: false})); // overflow
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "/../file.txt", options); // overflow
						group.runStep("../file.txt",                                   {repetitions: 100}, /**/ "../file.txt", options);
						group.runStep("/file.txt",                                     {repetitions: 100}, /**/ "/subfolder/../file.txt", tools.extend({}, options, {isRelative: false}));
						group.runStep("/subfolder/file.txt",                           {repetitions: 100}, /**/ "/subfolder/./file.txt", tools.extend({}, options, {isRelative: false}));
						group.runStep("/Sub Folder/My File.txt",                       {repetitions: 100}, /**/ "/Sub Folder/My File.txt", options);
						group.runStep("/Sub Folder/My File.txt",                       {repetitions: 100}, /**/ "/Sub Folder/My File.txt", options);
						group.runStep("/home/claude/subfolder/file.txt",               {repetitions: 100}, /**/ "/subfolder/file.txt", tools.extend({}, options, {root: "/home/claude"}));
						group.runStep("/home/claude/file.txt",                         {repetitions: 100}, /**/ "/subfolder/../file.txt", tools.extend({}, options, {root: "/home/claude", isRelative: false}));
						group.runStep(files.PathError,                               {mode: 'isinstance'}, /**/ "/subfolder/../../file.txt", tools.extend({}, options, {root: "/home/claude", isRelative: false})); // overflow
						group.runStep('"/tmp/subfolder/file.txt"',                     {repetitions: 100}, /**/ '"/tmp/subfolder/file.txt"', options);
						group.runStep('"tmp/subfolder/file.txt"',                      {repetitions: 100}, /**/ '"tmp/subfolder/file.txt"', options);
						group.runStep('"file.txt"',                                    {repetitions: 100}, /**/ '"file.txt"', options);
						group.runStep('"/subfolder/My File.txt"',                      {repetitions: 100}, /**/ '"/subfolder/My File.txt"', options);
						group.runStep('/"subfolder"/"My File.txt"',                    {repetitions: 100}, /**/ '/"subfolder"/"My File.txt"', options);
						group.runStep("/tmp/subfolder/file.txt",                       {repetitions: 100}, /**/ "\\tmp\\subfolder\\file.txt", options);
					});
				});
					

				test.runCommand(function(path1, path2, /*optional*/optionsPath1, /*optional*/optionsPath2, /*optional*/setPath2, /*optional*/combineOptions, /*optional*/toStringOptions) {
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
				}, "Doodad.Tools.Files.Path.combine.Path", function(command, options) {
					command.runStep("C:\\",                                                  {repetitions: 100}, /**/ "C:\\", "C:\\", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\SubFolder\\",                                       {repetitions: 100}, /**/ "C:\\", "C:\\SubFolder\\", {os: 'windows'}, {os: 'windows'});
					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "C:\\", "D:\\SubFolder\\", {os: 'windows'}, {os: 'windows'}); // drive mismatch
					command.runStep("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "File.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "SubFolder\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "\\SubFolder\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\SubFolder\\", "File.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\File.txt",    				                         {repetitions: 100}, /**/ "C:\\SubFolder\\", "\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "C:\\", "..\\File.txt", {os: 'windows'}, {os: 'windows'}); // overflow
					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "C:\\SubFolder\\", "..\\File.txt", {os: 'windows'}, {os: 'windows'}); // overflow
					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "C:\\SubFolder\\", "\\..\\File.txt", {os: 'windows'}, {os: 'windows'}); // overflow
					command.runStep("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "SubFolder\\..\\File.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\File2.txt",                                         {repetitions: 100}, /**/ "C:\\File1.txt", "File2.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\SubFolder\\File2.txt",                              {repetitions: 100}, /**/ "C:\\SubFolder\\File1.txt", "File2.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\SubFolder\\File2.txt",                              {repetitions: 100}, /**/ "C:\\File1.txt", "SubFolder\\File2.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\SubFolder1\\SubFolder2\\File2.txt",                 {repetitions: 100}, /**/ "C:\\SubFolder1\\File1.txt", "SubFolder2\\File2.txt", {os: 'windows'}, {os: 'windows'});
					command.runStep("C:\\Subfolder1\\SubFolder2\\File.txt",                  {repetitions: 100}, /**/ "C:\\Subfolder1\\", "SubFolder2\\File.txt", {os: 'windows'}, {os: 'windows'});
						
					command.runStep("/",                                                     {repetitions: 100}, /**/ "/", "/", {os: 'linux'}, {os: 'linux'});
					command.runStep("/SubFolder/",                                           {repetitions: 100}, /**/ "/", "/SubFolder/", {os: 'linux'}, {os: 'linux'});
					command.runStep("/File.txt",                                             {repetitions: 100}, /**/ "/", "File.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "SubFolder/File.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "/SubFolder/File.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/SubFolder/", "File.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep("/File.txt",                                             {repetitions: 100}, /**/ "/SubFolder/", "/File.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "/", "../File.txt", {os: 'linux'}, {os: 'linux'}); // overflow
					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "/SubFolder/", "../File.txt", {os: 'linux'}, {os: 'linux'}); // overflow
					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "/SubFolder/", "/../File.txt", {os: 'linux'}, {os: 'linux'}); // overflow
					command.runStep("/File.txt",                                             {repetitions: 100}, /**/ "/", "SubFolder/../File.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep("/File2.txt",                                            {repetitions: 100}, /**/ "/File1.txt", "File2.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep("/SubFolder/File2.txt",                                  {repetitions: 100}, /**/ "/SubFolder/File1.txt", "File2.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep("/SubFolder/File2.txt",                                  {repetitions: 100}, /**/ "/File1.txt", "SubFolder/File2.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep("/SubFolder1/SubFolder2/File2.txt",                      {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "SubFolder2/File2.txt", {os: 'linux'}, {os: 'linux'});
					command.runStep("/Subfolder1/SubFolder2/File.txt",                       {repetitions: 100}, /**/ "/Subfolder1/", "SubFolder2/File.txt", {os: 'linux'}, {os: 'linux'});

					command.runStep("C:\\SubFolder1\\SubFolder2\\File2.txt",                 {repetitions: 100}, /**/ "C:\\SubFolder1\\File1.txt", "SubFolder2/File2.txt", {os: 'windows'}, {os: 'linux'});
					command.runStep("/SubFolder1/SubFolder2/File2.txt",                      {repetitions: 100}, /**/ "/SubFolder1/File1.txt", "SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows'});

					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "/SubFolder1/File1.txt", "C:\\SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows'}); // drive mismatch
					command.runStep(types.ParseError,                                      {mode: 'isinstance'}, /**/ "/SubFolder1/File1.txt", "C:\\SubFolder2\\File2.txt", {os: 'linux'}, {os: 'windows', drive: ''}); // Invalid path or file name
				});
					
					
				test.runCommand(function(path, url, /*optional*/optionsPath, /*optional*/optionsUrl, /*optional*/setUrl, /*optional*/combineOptions, /*optional*/toStringOptions) {
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
				}, "Doodad.Tools.Files.Path.combine.Url", function(command, options) {
					command.runStep("C:\\",                                                  {repetitions: 100}, /**/ "C:\\", "file:///", {os: 'windows'});
					command.runStep("C:\\SubFolder\\",                                       {repetitions: 100}, /**/ "C:\\", "file:///SubFolder/", {os: 'windows'});
					command.runStep("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\", "file:///File.txt", {os: 'windows'});
					command.runStep("C:\\SubFolder\\File.txt",                               {repetitions: 100}, /**/ "C:\\", "file:///SubFolder/File.txt", {os: 'windows'});
					command.runStep("C:\\File.txt",                                          {repetitions: 100}, /**/ "C:\\SubFolder\\", "file:///File.txt", {os: 'windows'});
					command.runStep("C:\\File2.txt",                                         {repetitions: 100}, /**/ "C:\\File1.txt", "file:///File2.txt", {os: 'windows'});
					command.runStep("C:\\File2.txt",                                         {repetitions: 100}, /**/ "C:\\SubFolder\\File1.txt", "file:///File2.txt", {os: 'windows'});
					command.runStep("C:\\Doodad\\File2.txt",                                 {repetitions: 100}, /**/ "C:\\File1.txt", "file:///c:/Doodad/File2.txt", {os: 'windows'});
					command.runStep("C:\\Doodad\\File2.txt",                                 {repetitions: 100}, /**/ "\\File1.txt", "file:///c:/Doodad/File2.txt", {os: 'windows'});
					command.runStep("C:\\Doodad\\File2.txt",                                 {repetitions: 100}, /**/ "File1.txt", "file:///c:/Doodad/File2.txt", {os: 'windows'});
					command.runStep("\\\\SERVER\\SHARE\\File2.txt",                          {repetitions: 100}, /**/ "C:\\File1.txt", "file://server/share/File2.txt", {os: 'windows'});
					command.runStep("\\\\SERVER\\SHARE\\File2.txt",                          {repetitions: 100}, /**/ "\\File1.txt", "file://server/share/File2.txt", {os: 'windows'});
					command.runStep("\\\\SERVER\\SHARE\\File2.txt",                          {repetitions: 100}, /**/ "File1.txt", "file://server/share/File2.txt", {os: 'windows'});
					command.runStep("\\\\SERVER\\SHARE\\File2.txt",                          {repetitions: 100}, /**/ "\\\\server\\share\\File1.txt", "file:///File2.txt", {os: 'windows'});
					command.runStep("\\\\SERVER\\SHARE\\Doodad\\File2.txt",                  {repetitions: 100}, /**/ "\\\\server\\share\\File1.txt", "file:///Doodad/File2.txt", {os: 'windows'});
					command.runStep("\\\\SERVER\\SHARE\\Doodad\\File2.txt",                  {repetitions: 100}, /**/ "\\\\server\\share\\v1\\File1.txt", "file:///Doodad/File2.txt", {os: 'windows'});

					command.runStep("/",                                                     {repetitions: 100}, /**/ "/", "file:///", {os: 'linux'});
					command.runStep("/SubFolder/",                                           {repetitions: 100}, /**/ "/", "file:///SubFolder/", {os: 'linux'});
					command.runStep("/File.txt",                                             {repetitions: 100}, /**/ "/", "file:///File.txt", {os: 'linux'});
					command.runStep("/SubFolder/File.txt",                                   {repetitions: 100}, /**/ "/", "file:///SubFolder/File.txt", {os: 'linux'});
					command.runStep("/File.txt",                                             {repetitions: 100}, /**/ "/SubFolder/", "file:///File.txt", {os: 'linux'});
					command.runStep("/File2.txt",                                            {repetitions: 100}, /**/ "/File1.txt", "file:///File2.txt", {os: 'linux'});
					command.runStep("/File2.txt",                                            {repetitions: 100}, /**/ "/SubFolder/File1.txt", "file:///File2.txt", {os: 'linux'});
					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "/File1.txt", "file:///c:/Doodad/File2.txt", {os: 'linux'});
					command.runStep(files.PathError,                                       {mode: 'isinstance'}, /**/ "/File1.txt", "file://server/share/File2.txt", {os: 'linux'});
						
					command.runStep(types.ParseError,                                      {mode: 'isinstance'}, /**/ "/SubFolder/", "http://www.doodad-js.local/File.txt", {os: 'linux'});
				});
					
			},
		},
	};
	return mods;
};

//! END_MODULE()
