// ================================================================= THEODIGA — the Dome on the Water: the drawing
// Draws THEODOME.plan's records into buildDam's group (src/77-dam.js calls it when this target is on the page; without
// it the dam keeps its old low public dome). ctx: {gx,gz} the group's world offset, {H,SPAN,BOW,CREST} the dam's
// numbers, zc the dam's arc, WL the reservoir level. Registers every record with core/tags before drawing it. Draws no
// rng(): the dam's own draws (fins, tunnels, decay) are the same with the dome as without it.
THEODOME.draw=function(G,d,ctx){
 const dd=d>0,P=THEODOME.plan({seed:9270,d:d,dam:{H:ctx.H,SPAN:ctx.SPAN,BOW:ctx.BOW,CREST:ctx.CREST}});
 const skin=SHELL(d),conc=CONC(d),bandM=dd?MAT.verdigris:MAT.pipe,cx=P.cx,cz=P.cz,S=P.shell,DK=P.deck,DR=P.drum;
 const h=(a,b,c)=>KRAND.h3(a,b,c,P.seed);
 const polar=(r,a,y)=>[cx+r*Math.cos(a),y,cz+r*Math.sin(a)];

 // ---- core/tags: one record per placed thing, before anything is drawn ---------------------------------------
 {const T=KTAGS.theodiga||(KTAGS.theodiga=KTAGS.create({build:'ancients-theodiga'}));
  const pre=(dd?'ruin':'intact')+'/',W=(x,y,z)=>[x+ctx.gx,y,z+ctx.gz],st=dd?'ruined':'intact';
  const B=T.add({id:pre+P.id,'class':'building',kind:'dome',key:'ancients:theodiga-dome',name:'The Dome on the Water',
   at:W(cx,DK.y,cz),r:DK.r,h:P.top-DK.y,tags:{culture:'ancient',types:['civic','religious'],state:st,landmark:true}});
  const part=(id,kind,at,o)=>T.child(B.id,Object.assign({'class':'part',kind:kind,key:id,at:at},o||{}));
  part(DK.id,'deck',W(cx,DK.y,cz),{r:DK.r});
  part(DR.id,'drum',W(cx,DR.y,cz),{r:DR.r,h:DR.h});
  part(S.id,'shell',W(cx,S.y,cz),{r:S.R,h:S.top});
  part(P.lantern.id,'lantern',W(cx,P.lantern.y,cz),{r:P.lantern.r,h:P.lantern.h});
  part(P.hall.id,'hall',W(cx,DK.y,cz),{r:P.hall.r,h:P.hall.h});
  for(const p of P.piers)part(p.id,'pier',W(p.x,0,p.z),{r:p.r1,h:p.top,tags:{role:p.ring,state:p.broken?'ruined':st}});
  for(const b of P.beams)part(b.id,'beam',W(cx,b.y,cz),{r:b.r,h:b.h});
  for(const r of P.rubble)T.child(B.id,{'class':'prop',kind:'rubble',key:r.id,at:W(r.x,r.on==='deck'?DK.y:P.wl,r.z),tags:{variant:r.kind}});}

 // ---- the deck, the piers and the ring beams: one concrete mesh ------------------------------------------------
 const CON=[];
 const deckHole=(u,v)=>THEODOME.deckGone(P,u*TAU,v*DK.r);
 CON.push(gridSurface((u,v)=>polar(v*DK.r,u*TAU,DK.y),72,12,{uS:DK.r*TAU/8,vS:DK.r/8,hole:deckHole}));
 CON.push(gridSurface((u,v)=>polar(v*DK.r,u*TAU,DK.y-DK.t),72,12,{uS:DK.r*TAU/8,vS:DK.r/8,hole:deckHole}));
 CON.push(gridSurface((u,v)=>polar(DK.r,u*TAU,DK.y-DK.t+v*DK.t),72,1,{uS:DK.r*TAU/8,vS:1,hole:u=>THEODOME.deckGone(P,u*TAU,DK.r)}));
 for(const p of P.piers){
  const rf=p.broken?()=>p.r0:y=>p.r0+(p.r1-p.r0)*Math.pow(y/p.top,6);
  CON.push(lathe({rFn:rf,H:p.top,nu:12,nv:p.broken?2:8}).translate(p.x,0,p.z));
  if(p.broken)kput(BOXC(d),[p.x,p.top+.6,p.z],qEuler(h(p.i,7,1)*.4,h(p.i,7,2)*3,h(p.i,7,3)*.4),[p.r0*1.6,1.6,p.r0*1.6],null);}
 for(const b of P.beams){
  const gone=u=>{const a=u*TAU,q=polar(b.r,a,0);return THEODOME.onDam(P,q[0],q[2],1)||THEODOME.inSector(P,a,.05);};
  for(const r of [b.r-b.dep/2,b.r+b.dep/2])CON.push(gridSurface((u,v)=>polar(r,u*TAU,b.y+v*b.h),120,1,{uS:b.r*TAU/8,vS:1,hole:gone}));
  for(const y of [b.y,b.y+b.h])CON.push(gridSurface((u,v)=>polar(b.r-b.dep/2+v*b.dep,u*TAU,y),120,1,{uS:b.r*TAU/8,vS:1,hole:gone}));}
 meshMerged(CON,conc,G);

 // ---- the drum, the shell and the lantern: one skin mesh ------------------------------------------------------
 const SK=[];
 SK.push(lathe({rFn:()=>DR.r,H:DR.h,nu:DR.arcades*4,nv:4,hole:(u,y)=>{const f=(u*DR.arcades)%1;
   if(f>.25&&f<.75&&y>2&&y<12)return true;
   return dd&&THEODOME.inSector(P,u*TAU,-.05)&&y>3+6*h(Math.floor(u*96),1,0);}}).translate(cx,DR.y,cz));
 // six cells a bay (the first is the rib), seven a tier (the first is the band line): the panes are holes, glazed by
 // the glass shell inside it when intact; the lowest tier is solid
 const NU=S.ribs*6,NV=S.tiers*7;
 SK.push(lathe({rFn:y=>THEODOME.shellR(P,y),H:S.top,nu:NU,nv:NV,hole:(u,y)=>{
   const bk=u*S.ribs,isRib=bk-Math.floor(bk)<1/6,t=y/S.top*S.tiers,tk=Math.floor(t),line=t-tk<1/7;
   if(dd&&THEODOME.shellGone(P,u*TAU,y,isRib))return true;
   return !isRib&&!line&&tk>=1;}}).translate(cx,S.y,cz));
 SK.push(lathe({rFn:()=>P.lantern.r,H:P.lantern.h,nu:32,nv:2}).translate(cx,P.lantern.y,cz));
 meshMerged(SK,skin,G);
 // the glazing: blue glass when intact; in the ruin the kit's dark void behind the empty frames (as the old public
 // dome's), open where the sector tore, so the gap reads as a hole in the dome and not as one more empty bay
 if(!dd)mesh(lathe({rFn:y=>Math.max(.5,THEODOME.shellR(P,y)-.8),H:S.top,nu:72,nv:24}),MAT.glass,G,cx,S.y,cz);
 else mesh(lathe({rFn:y=>Math.max(.5,THEODOME.shellR(P,y)-1.2),H:S.top,nu:NU,nv:NV,
  hole:(u,y)=>THEODOME.shellGone(P,u*TAU,y,false)}),MAT.dark,G,cx,S.y,cz);

 // ---- the copper bands: one at every tier line, one round the lantern's head ----------------------------------
 const BD=[];
 for(let k=0;k<S.tiers;k++){const yb=k===0?1:k*S.top/S.tiers;
  BD.push(lathe({rFn:yy=>THEODOME.shellR(P,yb-.8+yy)+.7,H:1.6,nu:96,nv:1,
   hole:dd?(u=>THEODOME.shellGone(P,u*TAU,yb,false)):null}).translate(cx,S.y+yb-.8,cz));}
 BD.push(lathe({rFn:()=>P.lantern.r+.6,H:1.4,nu:32,nv:1}).translate(cx,P.lantern.y+P.lantern.h-1.4,cz));
 meshMerged(BD,bandM,G);

 // ---- the drum's strip lights --------------------------------------------------------------------------------
 for(const l of P.lights)kput('strip',polar(DR.r+.6,l.a,DR.y+14.5),qEuler(0,-l.a-Math.PI/2,0),[6,1,1],l.lit?CYAN:DEAD);

 // ---- the hall: the crest's old fluted public dome, now standing on the deck under the great one -------------
 mesh(lathe({rFn:y=>44*Math.pow(clamp(1-Math.pow(y/26,2),0,1),.55),H:26,flutes:24,amp:.06,sharp:2,nu:96,nv:14,
  hole:(u,y)=>Math.cos(u*TAU*24)<.3&&y>3&&y<22}),skin,G,cx,DK.y,cz);
 mesh(lathe({rFn:y=>(dd?40:42)*Math.pow(clamp(1-Math.pow(y/26,2),0,1),.55),H:26,nu:48,nv:10}),dd?MAT.dark:MAT.glass,G,cx,DK.y,cz);

 // ---- what fell ----------------------------------------------------------------------------------------------
 // the mud's height is read off buildDam's own silt surface (src/77-dam.js, the reservoir), so a piece lies on it
 const mudY=(x,z)=>{const u=x/(ctx.SPAN+40)+.5,v=clamp((z+700)/(700+ctx.zc(x)-2),0,1);return ctx.WL-6+30*fbm(u*5,v*5,2500,2)*v*v;};
 for(const r of P.rubble){const y=r.on==='deck'?DK.y:mudY(r.x,r.z),s=r.size;
  if(r.kind==='rib')kput('postR',[r.x,y+1,r.z],qEuler(Math.PI/2+r.tilt*.3,r.ry,0),s,null);
  else if(r.kind==='slab')kput(BOXC(d),[r.x,y+s[1]*.3,r.z],qEuler(r.tilt,r.ry,r.tilt*.6),s,null);
  else kput('boxR',[r.x,y+.5,r.z],qEuler(r.tilt*1.4,r.ry,r.tilt),s,null);}

 REGISTER({name:'Theodiga — the Dome on the Water ('+STATE(d)+')',x:cx,z:cz,r:DK.r+6,y:DK.y-4,h:P.top-DK.y+8});
 REGISTER({name:'Theodiga — the dome\'s piers',x:cx,z:cz,r:DK.r,y:0,h:DK.y-DK.t});
 return P;};
