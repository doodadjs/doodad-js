(function() {
	var doodad = DD_ROOT.Doodad,
		types = doodad.Types, 
		tools = doodad.Tools;

	var natives = types.allKeys(window);

	natives = tools.filter(natives, function(k) {
		return (tools.indexOf(['GLOBAL', 'root'], k) < 0) && /^[A-Z]/.test(k) && !/^[A-Z_]*$/.test(k) && types.isNativeFunction(window[k]);
	});

	natives = tools.filter(natives, function(k) {
		return (tools.findItem([/*! INCLUDE("%SOURCEDIR%/make/res/Natives.inc.js", 'utf-8') */], function(i) {
				return (i[0] === k);
			}) === null);
	});

	natives = tools.map(natives, function(k) {
		return [k, tools.generateUUID()];
	});

	var str = '',
		QTE = 50,
		len = natives.length;

	for (var s = 0, e = QTE; s < len; s += QTE, e += QTE) {
		str += types.toSource(natives.slice(s, e), 2).slice(1, -1) + (e < len ? ', ' : '') + '\n';
	};

	document.write(str);
})();