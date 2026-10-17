#!/usr/bin/env node
// Strangers in bulk for a city's NPCs: the Cosmetic Lab's batch, outside the browser. One record per line of the
// output array, each with the seed it was drawn from (KCHAR.stranger(seed, kit, people) redraws it).
//   node tools/npcs.js [--people <id>] [--count 20] [--seed 1] [--body mpfb_male|mpfb_female|both] > npcs.json
//   node tools/npcs.js --list          # the peoples (data/peoples.json)
var path = require('path'), fs = require('fs');
var HERE = path.join(__dirname, '..');
require(path.join(HERE, '..', '..', 'core', 'rand', '08-core-rand.js')); global.KRAND = globalThis.KRAND;
var KCHAR = require(path.join(HERE, 'src', '10-rig.js'));
var a = process.argv.slice(2), opt = { count:'20', seed:'1', body:'both', people:null };
for(var i = 0; i < a.length; i++){
  if(a[i] === '--list') opt.list = true;
  else if(a[i].indexOf('--') === 0) opt[a[i].slice(2)] = a[++i];
}
var J = function(){ return JSON.parse(fs.readFileSync(path.join.apply(null, [HERE, 'data'].concat([].slice.call(arguments))))); };
var peoples = J('peoples.json').peoples;
if(opt.list){ peoples.forEach(function(p){ console.log(p.id + '\t' + p.name); }); process.exit(0); }
var people = null;
if(opt.people){
  people = peoples.filter(function(p){ return p.id === opt.people; })[0];
  if(!people){ console.error('npcs.js: no people ' + opt.people + ' (--list names them)'); process.exit(1); }
}
var kits = {};
(opt.body === 'both' ? ['mpfb_male', 'mpfb_female'] : [opt.body]).forEach(function(b){ kits[b] = J(b, 'kit.json'); });
var out = KCHAR.crowd(+opt.seed, +opt.count, kits, people);
process.stdout.write('[\n' + out.map(function(r){ return ' ' + JSON.stringify(r); }).join(',\n') + '\n]\n');
