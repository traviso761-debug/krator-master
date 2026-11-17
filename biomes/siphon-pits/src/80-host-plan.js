// ================================================================= HOST — the station's plan (PLAN.md sections 3 and 6): what is where before anything is placed
// STATION 1: the farm plan as a placement raster on core/mask (KMASK.canvas: painted by an integer-exact rule, the same bytes in Godot): the braids'
// water and the farmsteads' lots, each on its own canvas at 4 m a pixel, and their distance fields (KMASK.distance), so the willow keeps 5-42 m from the
// water and the crops and plants keep off the lots. The crops: kits/crops' Region 98 entry (CROPS.forBiome('siphon-pits'), its terraces and braids zones),
// one pick a bucket (CROPS.pick, seeded: the same crops on every machine), and each terrace tread's field (KRELIEF.at's field id) given one of them or
// left fallow by its own hash. STATION 3: the roper camp kept clear the same way. Plain data on the page: PLAN.mask, PLAN.crops, FIELD_OF.
let FIELD_OF=(x,z)=>null;   /* station 1's fields (below); null elsewhere */
const PLAN=(function(){const P={station:SKEY};
 const PX=4,S=TERR.R*1.1,W=Math.ceil(2*S/PX);
 const toPx=(x,z)=>[(x+S)/PX,(z+S)/PX];
 const distOf=c=>{const D=KMASK.distance(c,{channel:0,threshold:128});return(x,z)=>{const p=toPx(x,z);return D.empty?1e9:D.sample(p[0],p[1])*PX;};};
 if(SKEY==='terraces'&&typeof KMASK!=='undefined'){
  const WM=KMASK.canvas(W,W),wc=WM.getContext('2d');wc.fillStyle='#000';wc.fillRect(0,0,W,W);wc.strokeStyle='#f00';
  for(const b of L.BR){wc.lineWidth=b.w/PX;wc.beginPath();for(let x=-S;x<=S;x+=20){const p=toPx(x,L.zc(x)+b.q(x));x===-S?wc.moveTo(p[0],p[1]):wc.lineTo(p[0],p[1]);}wc.stroke();}
  const LM=KMASK.canvas(W,W),lc=LM.getContext('2d');lc.fillStyle='#000';lc.fillRect(0,0,W,W);lc.fillStyle='#f00';
  for(const f of SITE.farms){const p=toPx(f[0],f[1]);lc.beginPath();lc.arc(p[0],p[1],f[2]/PX,0,TAU);lc.fill();}
  P.braid=distOf(WM);P.lot=distOf(LM);P.mask={water:KMASK.hash(WM),lots:KMASK.hash(LM),px:PX,size:W,ops:KMASK.ops(WM).length+KMASK.ops(LM).length};
  // the crops kits/crops gives the station (PLAN.md section 3): a grain, a second grain, a pulse and a tuber
  const Q=SITE.crops&&SITE.crops.query||{warmth:'temperate',atm:'standard',arid:'semiarid'};
  if(typeof CROPS!=='undefined'){const R=CROPS.BIOMES['siphon-pits']?CROPS.forBiome('siphon-pits').filter(r=>r.zone==='terraces'||r.zone==='braids'):CROPS.at(Q),pk=(b,pref,salt)=>{const r=CROPS.pick(R,b,{seed:9850,salt:salt==null?0:salt,prefer:[pref]});return r?r.crop:null;};
   const paint={grain:0xb8a060,pulse:0x6a8a3e,tuber:0x587044};
   P.crops=[pk('grain','frostoat',1),pk('grain','emmer',2),pk('pulse','helix-bean',3),pk('tuber','maar-yam',4)].filter(Boolean).map(c=>({id:c.id,name:c.name,bucket:c.bucket,card:c.card,paint:paint[c.bucket]||0xa09060}));
   P.query=Q;P.offered=R.length;}
  else P.crops=[];
  SIPHON.CROP_OF={};P.crops.forEach(c=>{SIPHON.CROP_OF[SIPHON.CROP_ITEMS[c.bucket]]=c;});
  // each tread's field: its crop by its own hash (a fifth lie fallow), rows along the contour
  const cache=new Map();
  FIELD_OF=(x,z)=>{if(Math.abs(z-L.zc(x))<SITE.chan.w+30||P.lot(x,z)<14)return null;const g=terrainH(x,z),A=KRELIEF.at(L.TER,x,z,g-L.off);if(!A||A.part!=='tread'||A.w<.6)return null;
   let f=cache.get(A.field);if(f===undefined){const m=/(-?\d+):(-?\d+),(-?\d+)/.exec(A.field)||[0,0,0,0],h=KRAND.hash(9851,+m[1],+m[2],+m[3]),k=h%5;
    f=k<P.crops.length&&P.crops.length?{id:A.field,crop:P.crops[k],paint:P.crops[k].paint,rows:KRAND.unit(KRAND.hash(9852,+m[1],+m[2]))*Math.PI}:{id:A.field,crop:null};cache.set(A.field,f);}
   return f;};
  P.fields=cache;}
 if(SKEY==='pitfloor'&&typeof KMASK!=='undefined'){const CM=KMASK.canvas(W,W),cc=CM.getContext('2d');cc.fillStyle='#000';cc.fillRect(0,0,W,W);cc.fillStyle='#f00';
  const c=SITE.camp,p=toPx(c.x,c.z);cc.beginPath();cc.arc(p[0],p[1],c.r/PX,0,TAU);cc.fill();P.camp=distOf(CM);P.mask={camp:KMASK.hash(CM),px:PX,size:W};}
 return P;})();
