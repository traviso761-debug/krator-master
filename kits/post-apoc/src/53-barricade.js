// prefix: br
// ---------------------------------------------------------------- BARRICADE (infrastructure). A straight salvage line with a gate, for a camp or an
// outpost that closes a road, a gorge or a canyon floor (settlements/span: Dalab's Line across the Deep Reach). It is the walled compound's own
// work (54-compound.js) laid out straight: its wall runs either side (cpRun: shipping containers, earth-filled tyre walls, sheet metal on timber,
// the container bastion), its gate tower in the middle (cpGate: container piers, hinged corrugated leaves, the wall-walk deck and guard cabin, the
// flag, banner, emblem, paint and awning sockets). Takes 54-compound.js: a bundle names both fragments.
// o.L: the length along x (60; at least 24); o.v: 0 the gate open, 1 shut (and the runs' order mirrored). The outside, where the spikes face, is +z.
function brBarricade(o){const L=Math.max(24,o.L==null?60:o.L),G={zf:-2},h=L/2,v=o.v|0;
 const SPEC=[[{t:'tyre'},{t:'cont',pcs:[CT.L40]},{t:'sheet'},{t:'car'}],[{t:'sheet'},{t:'tyre'},{t:'cont',pcs:[CT.L40]},{t:'sheet'}]];
 // a run too short for its mix (each flexible piece under 4 m) is one sheet-metal run
 const fit=(spec,len)=>{const fixed=spec.reduce((a,s)=>a+(s.pcs?s.pcs.reduce((x,y)=>x+y,0):0),0),nf=spec.filter(s=>!s.pcs).length;return (len-fixed)/nf>=4?spec:[{t:'sheet'}];};
 cpRun(h,G.zf,5.74,G.zf,fit(SPEC[v%2],h-5.74));
 cpRun(-5.74,G.zf,-h,G.zf,fit(SPEC[(v+1)%2],h-5.74));
 cpGate(G,{v:v});}
defBuilding({key:'barricade',name:'Barricade',seed:5230,tags:{type:['infrastructure'],size:'large',core:'shipping container',materials:['containers','earth-filled tyres','sheet metal','timber']},w:60,d:8,h:11,build:brBarricade});
// ---------------------------------------------------------------- PALISADE (infrastructure). A stockade round a camp: sharpened timber stakes of
// uneven height on two rails, braced inside every 12 m, patched with scrap sheet, a gate in the front (+z) side between two heavy posts with
// a lintel (banner, flag and emblem sockets on them). o.w, o.d: the enclosure (60 x 40); o.h: the stakes (3.4); o.gate: the opening (8);
// o.gateAt: the gate's offset along the front from its middle (0). Settlements/span rings the highlanders' quarter and its arena with one.
function brPalisade(o){const W=o.w==null?60:o.w,D=o.d==null?40:o.d,H=o.h==null?3.4:o.h,GW=o.gate==null?8:o.gate,GX=o.gateAt==null?0:o.gateAt;
 const wood=()=>jc(pick([0x6a5238,0x5c4630,0x7a5e40,0x524030]),.06),rail=jc(0x5c4630,.06);
 // a side from a to b (local x,z), stakes every .46 m, skipping [g0, g1] along it (the gate)
 const side=(ax,az,bx,bz,g0,g1,inx,inz)=>{const L=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/L,uz=(bz-az)/L,n=Math.floor(L/.46);
  for(let k=0;k<=n;k++){const t=k*L/n;if(g0!=null&&t>g0&&t<g1)continue;const x=ax+ux*t,z=az+uz*t,h=H*rr(.86,1.08);
   beam('wood',[x,0,z],[x,h,z],rr(.11,.15),wood(),true,6);beam('wood',[x,h,z],[x,h+.38,z],.02,wood(),true,4);}
  const run=(t0,t1)=>{if(t1-t0<.5)return;const m0=[ax+ux*t0,az+uz*t0],m1=[ax+ux*t1,az+uz*t1],cx=(m0[0]+m1[0])/2+inx*.2,cz=(m0[1]+m1[1])/2+inz*.2,ry=Math.atan2(-uz,ux);
   for(const y of [.8,H*.72])box('plank',cx,y,cz,t1-t0,.14,.1,rail,ry);
   for(let t=t0+6;t<t1-3;t+=12){const x=ax+ux*t,z=az+uz*t;beam('wood',[x+inx*.2,H*.8,z+inz*.2],[x+inx*2.4,0,z+inz*2.4],.08,rail);}
   for(let q=0;q<Math.floor((t1-t0)/9);q++){const t=t0+rr(1,t1-t0-1),pw=rr(1.2,2.6);box(pick(['sheet','corr']),ax+ux*t+inx*.25,rr(.3,1.4),az+uz*t+inz*.25,pw,rr(.8,1.5),.04,pick([P('rust'),P('galv'),P('paint')]),ry);}};
  if(g0!=null){run(0,g0);run(g1,L);}else run(0,L);};
 const hw=W/2,hd=D/2;
 side(-hw,hd,hw,hd,hw+GX-GW/2,hw+GX+GW/2,0,-1);side(hw,hd,hw,-hd,null,null,-1,0);side(hw,-hd,-hw,-hd,null,null,0,1);side(-hw,-hd,-hw,hd,null,null,1,0);
 // the gate: two heavy posts, a lintel, the cloth on them; the way in
 for(const s of [-1,1]){const x=GX+s*(GW/2+.25);beam('wood',[x,0,hd],[x,H+1.6,hd],.24,jc(0x4a3a2a,.05),true,8);
  sock('banner',x,H+1.2,hd+.26,0,{w:.9,h:2.6});}
 box('wood',GX,H+1.3,hd,GW+1.2,.36,.4,jc(0x4a3a2a,.05));sock('emblem',GX,H+.9,hd+.22,0,{w:1,h:1});
 beam('wood',[GX-GW/2-.25,H+1.6,hd],[GX-GW/2-.25,H+3.4,hd],.05,jc(0x5c4630,.06),true,5);sock('flag',GX-GW/2-.25,H+3.5,hd,0,{w:1.3,h:.6});
 entry(GX,0,hd,GW,H);}
defBuilding({key:'palisade',name:'Palisade',seed:5240,front:{x:0,z:20,yaw:0},tags:{type:['infrastructure'],size:'large',core:'timber stakes',materials:['timber','sheet metal','rope']},w:60,d:40,h:8.6,build:brPalisade});
