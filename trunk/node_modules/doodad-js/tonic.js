"use strict";

const root = require('doodad-js').createRoot(null, {node_env: 'development'}),
	doodad = root.Doodad,
    mixins = doodad.MixIns,
	types = doodad.Types;

const Animal = doodad.BASE(doodad.Object.$extend(
{
	$TYPE_NAME: 'Animal',
	
	makeNoise: doodad.PUBLIC(doodad.MUST_OVERRIDE()),
}));

const Perrot = Animal.$extend(
{
	$TYPE_NAME: 'Perrot',
	
    __word: doodad.PROTECTED(null),
    
    create: doodad.OVERRIDE(function(word) {
        this._super();
        this.__word = word;
    }),
    
	makeNoise: doodad.OVERRIDE(function() {
		return this.__word;
	}),
});

let obj = new Perrot("hello");

console.log("Instance of Object: " + String(obj instanceof doodad.Object));
console.log("Instance of Animal: " + String(obj instanceof Animal));
console.log("Instance of Perrot: " + String(obj instanceof Perrot));
console.log("Implements Creatable: " + types._implements(obj, mixins.Creatable));

console.log("Noise: " + obj.makeNoise());

obj.destroy();