// node biomes/siphon-pits/tests/test-land.js [station]: the four stations' land (45-host-stage.js's land section) evaluated headless on the core's
// landforms, and the records' numbers against the air law. Each check with a negative. No THREE, no DOM: the land is [G data] in substance.
const fs=require('fs'),path=require('path'),vm=require('vm');
const ROOT=path.join(__dirname,'..','..','..'),HERE=path.join(__dirname,'..');
const ctx={console,Math,performance:{now:()=>Date.now()}};ctx.globalThis=ctx;vm.createContext(ctx);
const load=f=>vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
['core/rand/08-core-rand.js','core/terrain/30-core-field.js','core/terrain/38-core-relief.js','core/terrain/38c-core-landforms.js','core/terrain/42-core-frost.js'].forEach(load);
const ST={};for(const k of ['terraces','scarp','pitfloor','arete']){const j=JSON.parse(fs.readFileSync(path.join(HERE,'stations',k,'station.json'),'utf8'));ST[k]=Object.assign({},j.site,{fog:j.fog,wind:j.wind,water:j.water||[],crops:j.crops,out:j.out});}
ctx.SIPHON_STATIONS=ST;vm.runInContext(fs.readFileSync(path.join(HERE,'src','40-biome-siphon-sites.js'),'utf8'),ctx);
const stage=fs.readFileSync(path.join(HERE,'src','45-host-stage.js'),'utf8');
const land=stage.slice(stage.indexOf('// ---------------------------------------------------------------- the land'),stage.indexOf('// THE GROUND AS DATA'));
const fn=`const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,mix=lerp,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);},TAU=Math.PI*2;`;
let fails=0;const ok=(c,m)=>{console.log((c?'ok   ':'FAIL ')+m);if(!c)fails++;};
const only=process.argv[2];
const law=h=>1.6*Math.exp(-h/8000);
for(const k of Object.keys(ST)){if(only&&k!==only)continue;
 const S=ST[k];ok(Math.abs(S.atm-law(S.base))<.006,k+': the record\'s pressure '+S.atm+' is the air law\'s '+law(S.base).toFixed(3));
 ok(!(Math.abs(S.atm*1.07-law(S.base))<.006),k+': negative, the old plan\'s kind of figure (7% high) fails the same test');
 const t0=Date.now();const L=vm.runInContext('(function(){'+fn+`;var STATION_KEY=${JSON.stringify(k)};const SITE=SIPHON_SITES[STATION_KEY],SKEY=STATION_KEY;`+land+';return L;})()',ctx);
 const h0=L.land(0,0);ok(Math.abs(h0-S.base)<(k==='arete'?20:2),k+': the station point at '+h0.toFixed(1)+' m (record '+S.base+')');
 let lo=1e9,hi=-1e9,nan=0;for(let z=-2600;z<=2600;z+=40)for(let x=-2600;x<=2600;x+=40){const h=L.land(x,z);if(!(h===h))nan++;lo=Math.min(lo,h);hi=Math.max(hi,h);}
 ok(nan===0,k+': no NaN on a 40 m lattice; range '+lo.toFixed(0)+'..'+hi.toFixed(0)+' m ('+(Date.now()-t0)+' ms)');
 if(k==='pitfloor'){ok(Math.abs(L.land(100,100)-S.base)<4,'pitfloor: the floor at '+L.land(100,100).toFixed(1));const r=L.land(1700,0);ok(r>S.rim-40,'pitfloor: the rim country at '+r.toFixed(0)+' (rim '+S.rim+')');
  ok(hi-lo>400,'pitfloor: the walls stand '+(hi-lo).toFixed(0)+' m');}
 if(k==='arete'){const w=L.crestW(0);ok(w>=5&&w<=10,'arete: the knife-edge is '+w.toFixed(2)+' m wide at its middle');ok(L.land(0,-1253)<S.pits.floor+8,'arete: the north pit\'s floor at '+L.land(0,-1253).toFixed(0));
  ok(!(L.crestW(800)<=10),'arete: negative, 800 m along the edge it is wider ('+L.crestW(800).toFixed(1)+' m)');}
 if(k==='scarp'){const e=L.land(1800,600),w=L.land(-1800,-600);ok(e-w>1000,'scarp: plateau '+e.toFixed(0)+' over lowland '+w.toFixed(0));}
 if(k==='terraces'){let water=0;for(let x=-2000;x<=2000;x+=50){for(let z=-400;z<=200;z+=2)if(L.water(x,z)>-1e8){water++;break;}}ok(water>70,'terraces: a braid at '+water+' of 81 sections');}
}
console.log(fails?fails+' FAILED':'all passed');process.exit(fails?1:0);
