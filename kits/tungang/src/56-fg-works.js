// prefix: fg
// ================================================================= THE WORKS (PLAN.md section 3.3.1: fg-ropehouse, fg-pens, fg-icehouse, fg-sledgeshed)
// The fowling works (the rope walk and rope house, the pens) and the ice works (the ice house, the sledge shed), as the
// `fowling` and `ice` focuses of core/hamlet's fellgang row staff them (core/hamlet/fellgang/22-hamlet-fellgang.js).
/* the box a building fills, by seed: w, d, h each a share of the stand-in's (the box an upper bound) */
function fgFillBox(B,C,wr,dr,hr){const b={w:B.w*fgLerp(wr,fgU(C,21)),d:B.d*fgLerp(dr,fgU(C,22)),h:B.h*fgLerp(hr,fgU(C,23))};if(C.o.character==='low')b.h=Math.max(B.h*.8,b.h*.92);fgSet('fill',[+(b.w/B.w).toFixed(2),+(b.d/B.d).toFixed(2),+(b.h/B.h).toFixed(2)]);return b;}
/* an open shed (the stand-ins' `shed` form): the back and end walls drystone, the front on bell-fir posts open to the lane,
   a turf roof falling from the back (its crown at the def's h) to the front eave at fe */
function fgShed(B,C,o){o=o||{};const hw=B.w/2,hd=B.d/2,th=.6,bh=B.h-.4,fe=o.fe==null?2.45:o.fe,col=fgCol('stone',C),pc=fgCol('pole',C);
 fgPlinth(-hw,hw,-hd,hd,C);fgWall(-hw,-hd+th/2,hw,-hd+th/2,th,0,bh,C,col);
 for(const s of [-1,1]){const x=s*(hw-th/2);fgWall(x,-hd+th,x,hd,th,0,fe-.05,C,col);const n=4;
  for(let k=0;k<n;k++){const y0=fe-.05+(bh-fe+.05)*k/n,y1=fe-.05+(bh-fe+.05)*(k+1)/n,zf=hd-(2*hd-th)*(k+.5)/n;fgWall(x,-hd+th,x,zf,th,y0,y1+.01,C,col);}}
 /* the roof: a turf slab from over the back wall down to the front eave, purlins under it */
 const yB=B.h-.18,yF=fe+.1,zb=-hd-.08,zf=hd+.08,s=(yB-yF)/(zf-zb);
 fgSlab('turf',[-hw-.2,yB-.16,zb],[hw+.2,yB-.16,zb],[-hw-.2,yF-.16,zf],.32,fgCol('turf',C));
 for(let t=.15;t<.95;t+=.2){const z=zb+(zf-zb)*t,y=yB-(zf-zb)*t*s-.4;pole('pole',[-hw+.3,y,z],[hw-.3,y,z],.07,pc,6);}
 const np=Math.max(2,Math.round(B.w/4.5));for(let i=0;i<=np;i++){const x=-hw+.35+i*(B.w-.7)/np;pole('pole',[x,.06,hd-.25],[x,fe,hd-.25],.12,pc,7);}
 pole('pole',[-hw+.2,fe-.04,hd-.25],[hw-.2,fe-.04,hd-.25],.12,pc,7);
 if(C.worn)fgRubble(rr(-hw*.6,hw*.6),-hd+.7,4,C);
 return {hw,hd,th,x0:-hw+th,x1:hw-th,z0:-hd+th,z1:hd-.3,fe,bh};}
/* a family's spare coils on pegs along a wall at zb (facing +z), from x0 to x1, at height y: n pegs, each with its mark */
function fgPegRow(n,x0,x1,y,zb,C,o){o=o||{};const sp=(x1-x0)/n,pc=fgCol('pole',C);for(let i=0;i<n;i++){const x=x0+(i+.5)*sp,col=fgMarkCol(i+(o.off|0));
 pole('pole',[x,y+.15,zb],[x,y+.2,zb+.3],.035,pc,5);fgMark(i+(o.off|0),x,y+.48,zb+.02,0,.18,col);fgNote('pegs');
 if(!o.empty||o.empty.indexOf(i)<0){ring('rope',x,y-.07,zb+.2,.2,.045,hc(col).clone().lerp(hc(0x8a7656),.55),0,PI/2,0,8);fgNote('coils');}}}
defBuilding({key:'fg-ropehouse',name:'The rope house and rope walk',seed:9131,cut:true,w:20,d:5,h:4,budget:6000,
 tags:{types:['industry'],style:'drystone',role:'works',job:'ropemaking'},
 note:'the rope walk: a long open shed, the twisting posts, lobe-larch bark cordage laid up and Ancient cable spliced in, every family\'s spare coil on its own peg',
 build(o){const C=fgCx(o),B=fgFillBox(TG.fg.BOX['fg-ropehouse'],C,[.78,1],[.8,1],[.82,1]),S=fgShed(B,C,{fe:fgLerp([2.2,2.6],fgU(C,24))}),pc=fgCol('pole',C),wc=fgCol('wood',C);
  /* the twisting jacks at the two ends: a post frame, a crank board with three hooks; the strands laid between them */
  const xj=S.hw-1.4,yj=.95;for(const s of [-1,1]){const x=s*xj;for(const dz of [-.35,.35])pole('pole',[x,.06,.2+dz],[x,1.35,.2+dz],.07,pc,6);box('wood',x,1.05,.2,.12,.3,.9,wc);
   for(const dz of [-.22,0,.22])beam('iron',[x-s*.06,yj,.2+dz],[x-s*.22,yj,.2+dz],.02,P('iron'),true,5);}
  for(const dz of [-.22,0,.22]){const P0=[];for(let k=0;k<=12;k++){const t=k/12;P0.push([-xj+.22+(2*xj-.44)*t,yj-.06*Math.sin(PI*t),.2+dz*(1-.5*Math.sin(PI*t))]);}cord('cord',P0,.012,P('rope'));}
  for(let x=-xj+3;x<xj-1;x+=3.2){pole('pole',[x,.06,.2],[x,yj+.05,.2],.04,pc,5);box('wood',x,yj-.05,.2,.08,.05,.7,wc);}
  /* the splicing bench: the Ancients' cable coiled, a fid, cordage being worked into it */
  box('wood',3,.7,S.z0+.5,2.2,.06,.7,wc);for(const s of [-1,1])box('wood',3+s*.9,.06,S.z0+.5,.08,.64,.6,wc);
  ring('cable',3.4,.82,S.z0+.5,.32,.04,P('cable'));ring('cable',3.4,.9,S.z0+.5,.28,.04,P('cable'));beam('horn',[2.4,.8,S.z0+.4],[2.75,.8,S.z0+.6],.025,P('horn'),true,5,.005);
  /* every family's spare coil on its own peg along the back wall */
  fgPegRow(o.pegs==null?14:o.pegs|0,S.x0+.6,S.x1-.6,2.2,S.z0+.01,C);
  fgFurn('job_pole_rack',-S.hw*.6,null,S.z0+.4,0);fgFurnBack('fellgang_common_wall_peg_rack',S.hw*.35,S.z0);fgFurn('generic_floor_basket',-3,null,S.z0+.4,0);
  fgSign('HOLD FAST',0,S.fe-.7,S.hd-.08,0,C,{ch:.16});}});
/* pens (the stand-ins' `pen` form): drystone walls with a turf coping, a footing under each run down to its own ground, the
   gate on the lane side of plate and stakes, a shelter of plate against the back wall, a trough */
defBuilding({key:'fg-pens',name:'The pens',seed:9132,w:14,d:12,h:1.4,budget:1500,
 tags:{types:['farm'],style:'drystone',role:'works',job:'herding'},
 note:'drystone pens with a gate of plate and stakes, a shelter wall',
 build(o){const C=fgCx(o),B=fgFillBox(TG.fg.BOX['fg-pens'],C,[.7,1],[.7,1],[.82,1]),hw=B.w/2,hd=B.d/2,t=.6,wh=1.15,col=fgCol('stone',C),tc=fgCol('turf',C);
  const run=(x0,z0,x1,z1)=>{const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.ceil(L/3));for(let k=0;k<n;k++){const a=k/n,b=(k+1)/n,ax=x0+(x1-x0)*a,az=z0+(z1-z0)*a,bx=x0+(x1-x0)*b,bz=z0+(z1-z0)*b;
    const g=Math.max(C.lo,Math.min(C.gl(ax,az),C.gl(bx,bz),0)-.5);fgWall(ax,az,bx,bz,t+.08,g,.02,C,col);}
   fgWall(x0,z0,x1,z1,t,0,wh,C,col);const dx=x1-x0,dz=z1-z0;W((x0+x1)/2,0,(z0+z1)/2,Math.atan2(dx,dz)-PI/2,()=>box('turf',0,wh,0,L+.05,.22,t+.06,tc));};
  run(-hw,-hd+t/2,hw,-hd+t/2);run(-hw+t/2,-hd+t,-hw+t/2,hd);run(hw-t/2,-hd+t,hw-t/2,hd);run(-hw+t,hd-t/2,-1.2,hd-t/2);run(1.2,hd-t/2,hw-t,hd-t/2);
  const px=hw*fgLerp([.05,.35],fgU(C,25));run(px,-hd+t,px,hd*.25);if(C.v%2===0)run(px+t/2,-hd*.15,hw-t,-hd*.15);else run(-hw+t,-hd*.2,px-t/2,-hd*.2);
  /* the corner at the footprint's lowest point carries its footing to C.lo */
  {let lo=1e9,cx=0,cz=0;for(const sx of [-1,1])for(const sz of [-1,1]){const g=C.gl(sx*hw,sz*hd);if(g<lo){lo=g;cx=sx;cz=sz;}}box('stone',cx*(hw-.5),C.lo,cz*(hd-.5),1,-.5-C.lo+.6,1,col);}
  /* the gate: two posts, a plate panel on stakes, lashed, standing a little open */
  const pc=fgCol('pole',C);for(const s of [-1,1])pole('pole',[s*1.25,-.3,hd-t/2],[s*1.25,1.62,hd-t/2],.09,pc,6);
  W(-1.15,0,hd-t/2,C.worn?.9:.35,()=>{box('rust',1.1,.2,0,2.2,.95,.04,fgCol('rust',C));for(const x of [.15,1.1,2.05])pole('pole',[x,.15,.04],[x,1.35,.04],.035,pc,5);
   for(const y of [.4,1])fgLash([0,y,.06],[2.2,y,.06]);fgSpike([2.15,1.3,.04],[0,1,0],.18);});
  /* the shelter: a plate roof on two poles against the back wall, in the big pen; a trough of cut plate */
  for(const x of [-hw*.74,-hw*.31])pole('pole',[x,.06,-hd+t+1.6],[x,1.3,-hd+t+1.6],.07,pc,6);
  fgSlab('tin',[-hw*.8,1.75,-hd+t+.05],[-hw*.26,1.75,-hd+t+.05],[-hw*.8,1.25,-hd+t+1.8],.04,fgCol('tin',C));
  box('rust',-1.6,.06,1.6,1.8,.35,.5,fgCol('rust',C));box('plain',-1.6,.3,1.6,1.7,.06,.42,hc(0x3a4a50));
  if(!C.worn)fgSign(fgSlogan(),hw*.62,.35,hd+.02,0,C,{ch:.12,kind:'rust',ink:'white'});}});
/* the ice house (the stand-ins' `barrow` form): a turf barrow over a corbelled stone vault; its front dented back for the
   entrance, a drystone facade faced with salvage plate, the plate door; inside (the cut-away) the blocks packed in tiers in
   sawdust under snow, the reckoning chalked on a plate by the door */
defBuilding({key:'fg-icehouse',name:'An ice house',seed:9133,cut:true,w:12,d:9,h:4.5,budget:5500,
 tags:{types:['industry'],style:'drystone',role:'works',job:'warehousing'},
 note:'a turf barrow over a corbelled stone vault, a stone door frame faced with salvage plate; inside (cut-away) the blocks packed in sawdust and snow, the reckoning chalked by the door',
 build(o){const C=fgCx(o),B=fgFillBox(TG.fg.BOX['fg-icehouse'],C,[.75,1],[.85,1],[.8,1]),rw=B.w/2,rd=B.d/2,H=B.h,dent=2.1*Math.min(1,B.d/9);
  const dk=a=>{let d=((a-PI/2+PI)%TAU+TAU)%TAU-PI;return Math.exp(-(d/.42)*(d/.42));};
  /* the barrow: turf over an ellipse, its front pulled back for the facade; a turf skirt from the rim down to the foot */
  psurf('turf',(u,v)=>{const a=u*TAU,c=Math.cos(v*PI/2),e=Math.sin(v*PI/2),k=1-dk(a)*dent/rd*(1-e*e*.7);return [Math.cos(a)*rw*c*k,H*e,Math.sin(a)*rd*c*k];},32,10,fgCol('turf',C),{flip:true});
  psurf('turf',(u,v)=>{const a=u*TAU,k=1-dk(a)*dent/rd;const px=Math.cos(a)*rw*k,pz=Math.sin(a)*rd*k;return [px,v*(Math.min(0,C.gl(px,pz))-.5),pz];},32,1,fgCol('turf',C));
  /* the vault: a stone shell inside, facing in; the floor of flags; the footing at the lowest corner */
  const vw=rw-.9,vd=rd-1.6,vh=H-.7;psurf('stone',(u,v)=>{const a=u*TAU,c=Math.cos(v*PI/2),e=Math.sin(v*PI/2),k=1-dk(a)*.9/vd*(1-e*e*.7);return [Math.cos(a)*vw*c*k,vh*e,Math.sin(a)*vd*c*k];},28,9,fgCol('stone',C));
  psurf('stoneD',(u,v)=>{const a=u*TAU;return [Math.cos(a)*vw*v,.05,Math.sin(a)*vd*v];},28,2,fgCol('stoneD',C),{up:true});
  {let lo=1e9,cx=0,cz=0;for(const sx of [-1,1])for(const sz of [-1,1]){const g=C.gl(sx*rw*.7,sz*rd*.7);if(g<lo){lo=g;cx=sx;cz=sz;}}box('stone',cx*rw*.62,C.lo,cz*rd*.62,1.2,-C.lo+.02,1.2,fgCol('stone',C));}
  /* the facade: drystone cheeks and lintel in the dent, faced with plate, and the passage through to the vault */
  const zf=rd-1.35,col=fgCol('stone',C);fgWall(-2.1,zf,-.5,zf,.6,0,2.5,C,col);fgWall(.5,zf,2.1,zf,.6,0,2.5,C,col);for(const s of [-1,1])fgWall(s*2.1,zf-1.4,s*2.1,zf+.3,.5,0,2.2,C,col);box('stoneD',0,1.8,zf,1.4,.35,.66,fgCol('stoneD',C));fgWall(-.5,zf,.5,zf,.6,2.15,2.5,C,col);
  for(const s of [-1,1])fgWall(s*.75,vd-1.15,s*.75,zf-.3,.4,0,2.1,C,col);box('stoneD',0,2.1,(zf+vd-.9)/2-.15,1.9,.25,zf-vd+1.4,fgCol('stoneD',C));
  for(const s of [-1,1])fgPatch(s*1.1,2.3,zf+.31,.8,1.6,0,C,s<0?'plate':'rust');
  fgDoor(0,zf,.95,1.75,C,{th:.6,name:'the ice house door'});box('stoneD',0,0,(zf+.3+rd-.08)/2,2.4,.1,rd-.08-zf-.3,fgCol('stoneD',C));
  /* the reckoning: a dark plate by the door, chalked in fives */
  W(1.25,.9,zf+.36,0,()=>{box('rust',0,0,0,.55,.6,.03,hc(0x3a3430));let n=0;for(let g=0;g<3+C.v%3;g++)for(let k=0;k<5;k++){const x=-.2+(g%3)*.17+k*.025,y=.12+Math.floor(g/3)*.25;if(k<4)box('plain',x,y,.02,.008,.14,.004,P('white'));else box('plain',x-.05,y+.06,.02,.12,.008,.004,P('white'),0,0,.5);n++;}fgNote('chalk',n);});
  /* the blocks: tiers in rows inside the vault (clear of the passage), sawdust between the tiers, snow on top */
  const iw=vw-.7,id=vd-.7,ic=P('ice');let nb=0;
  for(let tier=0;tier<4;tier++){const y=.08+tier*.68;for(let z=-id+.35;z<=id-.3;z+=.68)for(let x=-iw+.55;x<=iw-.5;x+=1.06){
   if(Math.abs(x)<1.2&&z>id-2)continue;const f=1-(x/iw)*(x/iw)-(z/id)*(z/id);if(f<=0||y+.7>(vh-.4)*Math.sqrt(f))continue;
   box('ice',x,y,z,1,.6,.6,ic,rr(-.03,.03));nb++;if(C.worn&&rng()<.2)continue;box('straw',x,y+.6,z,1.04,.06,.64,P('sawdust'));if(tier===3||y+1.4>(vh-.4)*Math.sqrt(f))box('straw',x,y+.66,z,1.06,.08,.66,P('snow'));}}
  fgNote('blocks',nb);
  /* the cutters' tools by the door inside: a saw, a pike pole, tongs */
  const pc=fgCol('pole',C);pole('pole',[-1,.06,zf-1],[-1.1,2,zf-1.15],.025,pc,5);box('iron',-.9,.4,zf-.95,.03,1.1,.18,P('iron'),0,.12);beam('iron',[1,.06,zf-1],[1.1,1.1,zf-1.1],.02,P('iron'),true,5);}});
/* a sledge for the carry: a bed of painted boards on two bell-fir runners faced with strips of tyre, stanchions, the front
   curled up; (x,z) its middle, ry its heading (+z its front), y its foot */
function fgSledge(x,y,z,ry,C,o){o=o||{};const L=o.L==null?3.2:o.L,W2=o.w==null?1.3:o.w,pc=fgCol('pole',C),bc=o.paint==null?P(pick(['red','ochre','blue'])):hc(o.paint);
 W(x,y,z,ry,()=>{for(const s of [-1,1]){const xr=s*(W2/2-.08);box('tyre',xr,0,-.15,.12,.05,L-.3,P('tyre'));pole('pole',[xr,.08,-L/2+.15],[xr,.08,L/2-.45],.06,pc,6);beam('pole',[xr,.08,L/2-.45],[xr,.45,L/2],.06,pc,true,6);
   for(const z of [-L/2+.4,0,L/2-.8])pole('pole',[xr,.08,z],[xr,.38,z],.04,pc,5);}
  for(let k=0;k<6;k++){const z=-L/2+.25+k*(L-.9)/5;box('wood',0,.4,z,W2,.05,(L-.9)/5-.04,k%2?bc:hc(0xe8e2d4));}
  for(const s of [-1,1])box('wood',s*(W2/2-.02),.45,-.2,.05,.22,L-.9,bc);});}
defBuilding({key:'fg-sledgeshed',name:'The sledge shed',seed:9134,cut:true,w:16,d:7,h:4.2,budget:4500,
 tags:{types:['industry'],style:'drystone',role:'works',job:'carpentry'},
 note:'an open shed, the sledges racked, runners from tyres, paint pots',
 build(o){const C=fgCx(o),B=fgFillBox(TG.fg.BOX['fg-sledgeshed'],C,[.75,1],[.8,1],[.82,1]),S=fgShed(B,C,{fe:fgLerp([2.3,2.7],fgU(C,24))}),wc=fgCol('wood',C);
  /* three sledges on the floor, two racked on end against the back wall, one half painted on trestles */
  /* the catalog's ice sledge where the catalog is loaded (the sheet; a world's bundle with furniture), else the kit's own */
  const cat=typeof KratorFurniture!=='undefined'&&KratorFurniture.has('fellgang_common_ice_sledge');
  for(let k=0;k<3;k++){const x=-S.hw*.82+k*S.hw*.4;if(cat)fgFurn('fellgang_common_ice_sledge',x,null,.4,0,{v:(k+C.v)%2});else fgSledge(x,.06,.4,0,C,{paint:[0xa8321e,0xc8902e,0x2e5a8a][(k+C.v)%3]});}
  for(let k=0;k<2;k++)WX(S.hw*.36+k*1.7,.06,S.z0+.62,0,-PI/2+.12,0,()=>fgSledge(0,0,1.6,0,C,{paint:0x3a7a4a}));
  {const tx=S.hw-1.6;for(const s of [-1,1])box('wood',tx+s*.9,.06,.6,.12,.7,1.2,wc);fgSledge(tx,.76,.6,0,C,{paint:0xe8e2d4,L:2.8});}
  /* the paint pots on a bench: cut cans, each its colour at the brim */
  box('wood',S.x1-1.2,.75,S.z0+.45,1.6,.05,.55,wc);for(const s of [-1,1])box('wood',S.x1-1.2+s*.7,.06,S.z0+.45,.06,.69,.5,wc);
  [0xa8321e,0xc8902e,0xe8e2d4,0x2e5a8a,0x1c1a18].forEach((c,i)=>{const x=S.x1-1.8+i*.3;cyl('scrap',x,.8,S.z0+.45,.09,.18,fgCol('scrap',C),8);cyl('plain',x,.97,S.z0+.45,.082,.015,hc(c),8);});
  fgFurn('job_plank_stack',S.x0+1.2,null,S.z0+.6,0);fgFurn('job_saw_bench',-1.2,null,S.z0+.7,0);
  fgSign(fgSlogan(),-3.5,S.fe-.7,S.hd-.08,0,C,{ch:.15});}});
