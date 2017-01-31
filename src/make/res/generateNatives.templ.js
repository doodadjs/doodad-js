(function() {
	var doodad = DD_ROOT.Doodad,
		types = doodad.Types, 
		tools = doodad.Tools;

	var natives = types.allKeys(window);

	natives = tools.filter(natives, function(k) {
		return (tools.indexOf(['GLOBAL', 'root'], k) < 0) && /^[A-Z]/.test(k) && !/^[A-Z_]*$/.test(k) && types.isNativeFunction(window[k]) && types.isObjectLike(window[k].prototype);
	});

	var knownNatives = [/*! INCLUDE("%SOURCEDIR%/make/res/Natives.inc.js", 'utf-8') */];

	natives = tools.filter(natives, function(k) {
		return (tools.findItem(knownNatives, function(i) {
				return (i[0] === k);
			}) === null);
	});

	natives = tools.reduce(natives, function(r, k) {
		var item = tools.getItem(knownNatives, function(i) {
				return (window[i[0]] === window[k]);
			}) || tools.getItem(r, function(i) {
				return (window[i[0]] === window[k]);
			});
		if (item === null) {
			r.push([k, tools.generateUUID()]);
		} else {
			r.push([k, item[1]]);
		};
		return r;
	}, []);

	var str = '',
		QTY = 50,
		len = natives.length;

	for (var s = 0, e = QTY; s < len; s += QTY, e += QTY) {
		str += types.toSource(natives.slice(s, e), 2).slice(1, -1) + (e < len ? ', ' : '') + '\n';
	};

	document.write(str);
})();