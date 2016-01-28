"use strict";

const root = require('doodad-js').createRoot(null, {node_env: 'development'}),
	doodad = root.Doodad;

const Animal = doodad.BASE(doodad.Object.$extend(
{
	$TYPE_NAME: 'Animal',
	
	makeNoise: doodad.PUBLIC(doodad.MUST_OVERRIDE()),
}));

const Perrot = Animal.$extend(
{
	$TYPE_NAME: 'Perrot',
	
    word: doodad.PROTECTED(null),
    
    create: doodad.OVERRIDE(function(word) {
        this._super();
        this.word = word;
    }),
    
	makeNoise: doodad.OVERRIDE(function() {
		return this.word;
	}),
});

let obj = new Perrot("hello");

console.log("Instance of Object: " + String(obj instanceof doodad.Object));
console.log("Instance of Animal: " + String(obj instanceof Animal));
console.log("Instance of Perrot: " + String(obj instanceof Perrot));

console.log("Noise: " + obj.makeNoise());

obj.destroy();