// ================================================================= HOST — the Prism Glacier's things (station 1; PLAN.md section 6): Copper Glacier's lines
// As RECORDS first, then drawn: KGLACIER places the icefall's seracs and the crevasses (KRAND per index) and records the ice caves at the snout;
// core/terrain's drawer (host/44h-core-glacier-draw.js) draws them. Each crevasse is a core/hazard record (fall); the ice cliff at the snout is crush.
// The ice is the library's clear ice, tinted pale blue; its faint opalescence is the ground's sheen on the ice (84: aOp, kept low).
const GLACIER={seracs:0,crevasses:0,caves:GCAVES.length};
const LIGHTS=[];   /* the drawer's day and night hooks (the caves' inner light) */
const ICECLEAR=(function(){if(typeof KMAT==='undefined'||KMAT.mode!=='lib')return null;const P=KMAT.packed('opalvalley','ice.clear');if(!P)return null;const t=KMAT.textures(P,{aniso:4}).map;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;})();
const ICE_MAT=BIO.solidMat(ICECLEAR);
const ICEC=[0xeef6fc,0xe2eef8,0xd6e8f4,0xf4f8fc,0xd8eaf6];
const GD=KGLACIER.drawer({scene,register:REGISTER,ground:terrainH,ticks:TICKS,onLight:LIGHTS,camera,renderer,map:ICECLEAR,up:GL.up,across:[GL.up[1],-GL.up[0]],skirt:2.5,apron:.7,fine:2,mouthTop:.52,uvWorld:true});
{const _pk=BIO.kit('opalvalley');GD.defSerac(ICE_MAT,'Seracs (the icefall)');BIO.kit(_pk);}
(function(){reseed(8811);const _pk=BIO.kit('opalvalley');
 G.seracs({u:GL.icefall,minIce:8,max:380}).forEach(r=>{GD.putSerac(r,new THREE.Color(pick(ICEC)).multiplyScalar(rr(.95,1.05)));GLACIER.seracs++;});
 BIO.kit(_pk);})();
const CREV=[];(GL.crevasses||[]).forEach(u=>CREV.push(...G.crevasses({u})));
GD.crevasses(CREV,(x,z)=>terrainH(x,z));GLACIER.crevasses=CREV.length;
CREV.forEach(r=>BIO.record({name:'A crevasse (hidden under the snow where it bridges)',x:r.x,z:r.z,y:terrainH(r.x,r.z)-6,r:r.len*.5,h:8,tags:{hazard:{kind:'fall',danger:.9}}}));
G.caves(GCAVES).forEach((C,i)=>GD.cave(Object.assign({},C,{reg:{cave:i}})));
{const u=GL.snout+4,c=G.at(u,GCEN(u)),W=G.W(GL.snout);if(G.T(GL.snout+20)>12)BIO.record({name:'The snout\'s ice cliff (it calves onto the outwash)',x:c[0],z:c[1],y:landH(c[0],c[1])-2,r:Math.min(W,700),h:G.T(GL.snout+20)+10,
 tags:{hazard:{kind:'crush',danger:.6}}});}   /* a core/tags record, as the crevasses: a face, not an inspector volume (nothing stands in it) */
if(POND){const TM=G.TERM,c=G.at((G.termU(TM.p0)+GL.snout)/2,TM.p0);REGISTER({name:POND.name,x:c[0],z:c[1],y:POND.level-8,r:TM.W0*.9,h:14});}
OBSTACLES.push(...CREV.map(r=>({x:r.x,z:r.z,r:r.len*.5})));
let NIGHT=null;TICKS.push(()=>{const hr=typeof ATMOS!=='undefined'&&ATMOS.clock?ATMOS.clock.hour:12,n=hr<5.5||hr>19.5;if(n!==NIGHT){NIGHT=n;LIGHTS.forEach(f=>f(n?'night':'day'));}});
GD.bindClock();
window._glacier=GLACIER;
