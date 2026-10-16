// prefix: ah
// ================================================================= TETHERING AND PENS: the beetle line, the millipede corral, the runner pen
// The tying post is catalog furniture (ashnomad_tying_post), shown as a one-piece def of class 'furniture'. The beetle line
// is a feature: a rope between two posts, three beetles on it, a grub trough. The pens: a corral of cast millipede rings
// stood on end and lashed (the herd's own chitin) for the millipedes; a fence of stakes and woven ash screens with nest
// baskets for the six-legged runners. Each pens its herd as nested placements of the herd defs (56-sa-beasts.js).
defBuilding({key:'tether-post',name:'Beetle tying post',seed:5901,cls:'furniture',w:1.0,d:1.0,h:2.4,budget:12000,front:{x:0,z:.5,yaw:0},
 tags:{setting:'outdoor'},note:'a beetle tethering post with a carved mandible top and a ring',build(o){FURNISH('ashnomad_tying_post',0,0,0,0,{setting:'outdoor'});}});
defBuilding({key:'beetle-line',name:'Beetle line',seed:5903,cls:'feature',kind:'picket line',w:14,d:8,h:3.4,budget:200000,front:{x:0,z:4,yaw:0},
 tags:{role:'tethering'},note:'a picket line between two tying posts: three beetles tied, a grub trough',
 build(o){const L=11;for(const s of [-1,1])FURNISH('ashnomad_tying_post',s*L/2,0,-2.6,0,{setting:'outdoor'});
  sagRope('rope',[-L/2,1.6,-2.6],[L/2,1.6,-2.6],.3,.024,0x9a8a6a,12);
  ['beetle-riding','beetle-pack','beetle-riding'].forEach((k,i)=>{const x=-3.6+i*3.6;place(k,x,.4,PI+(i-1)*.1,{v:i,activity:'WAIT'});
   sagRope('rope',[x,1.5,-2.6],[x,1.2,-1.2],.2,.014,0x9a8a6a,4);});
  FURNISH('ashnomad_grub_trough',0,0,3.2,0,{setting:'outdoor'});}});
/* the corral of cast millipede rings: curved plates stood on end round a circle, lashed to stakes, a gap at +z */
function ahRingCorral(r){const n=Math.round(TAU*r/.9);for(let i=0;i<n;i++){const a=(i+.5)/n*TAU;if(tkNearDoor(a,.28))continue;
  W(Math.cos(a)*r,0,Math.sin(a)*r,Math.atan2(Math.cos(a),Math.sin(a)),()=>{psurf('plates',(u,v)=>{const t=(u-.5)*1.6;return [Math.sin(t)*.5,v*rr(1.3,1.5),-Math.cos(t)*.18+.18];},6,2,P('ashG'));
   pole('wood',[.48,0,0],[.48,1.6,0],.035,P('woodD'),5);cord('rope',[[-.45,1.05,.02],[.48,1.05,.02]],.015,0x9a8a6a);});}}
/* the runner fence: stakes with woven screens between, painted with a red and yellow band */
function ahScreenFence(r){const n=Math.round(TAU*r/1.6);for(let i=0;i<n;i++){const a0=i/n*TAU,a1=(i+1)/n*TAU;if(tkNearDoor((a0+a1)/2,.3))continue;
  const p0=[Math.cos(a0)*r,Math.sin(a0)*r],p1=[Math.cos(a1)*r,Math.sin(a1)*r];pole('wood',[p0[0],0,p0[1]],[p0[0],1.3,p0[1]],.04,P('woodD'),6);
  alWall(p0,p1,L=>{psurf('rug',(u,v)=>[-L/2+u*L,.08+v*1.0,0],4,2,P('ashP'));akBand(L,.55,.3,{z:.012,figs:['tooth','fret'],bg:false});});}}
function ahPen(key,name,seed,herd,o){return defBuilding({key,name,seed,cls:'feature',kind:o.kind,w:o.r*2+o.pad,d:o.r*2+o.pad,h:o.h||1.8,budget:o.budget||200000,front:{x:0,z:o.r,yaw:0},
 tags:{role:'herding'},note:o.note,
 build(p){o.fence(o.r);if(o.extra)o.extra();
  for(let i=0;i<o.n;i++){const a=i*2.39996+.5,rad=o.r*o.spread*Math.sqrt((i+.5)/o.n);place(i<o.young?herd+'-young':herd,Math.cos(a)*rad,Math.sin(a)*rad,rng()*TAU,{seed:i,mode:i%3===2?'idle':'graze'});}}});}
ahPen('millipede-corral','Millipede corral',5906,'millipede',{r:8,pad:2.6,n:3,young:0,spread:.45,kind:'millipede corral',h:2.2,budget:260000,fence:r=>ahRingCorral(r),
 extra:()=>{FURNISH('ashnomad_grub_trough',-3,0,-4.6,.4,{setting:'outdoor'});FURNISH('ashnomad_grub_trough',3,0,-4.6,-.4,{setting:'outdoor'});FURNISH('ashnomad_plate_stack',5.4,0,-3.0,-.8,{setting:'outdoor'});},
 note:'the millipedes corralled inside a ring of their own cast rings stood on end; the moulted plates stacked, grub troughs'});
ahPen('runner-pen','Runner pen',5907,'runner',{r:4.6,pad:2.4,n:9,young:3,spread:.62,kind:'runner pen',fence:r=>ahScreenFence(r),
 extra:()=>{FURNISH('ashnomad_egg_basket',-2.6,0,-2.4,.6,{setting:'outdoor'});FURNISH('ashnomad_grub_trough',2.2,0,-2.6,-.4,{setting:'outdoor'});},
 note:'the six-legged runners penned behind stakes and woven ash screens, a basket for the eggs, a trough'});
