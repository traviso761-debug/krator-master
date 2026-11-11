// prefix: fg
// ================================================================= WILDCAT: drawing the scrap pueblo (PLAN.md 1.3.1, 3.3)
// The Kimr's pueblo built from a scrapyard: room blocks of drystone and rammed earth, stepped back storey by storey, their
// exposed faces FACED IN SALVAGE (corrugated sheet, rusted plate, the Ancients' white plate, wrecked cars' shells cut open,
// container panels) with the edges left raw; bell-fir vigas and scrap rail ends standing out of the walls in rows at every
// storey; parapets; no doors at the ground: T-doors framed in mammoth ivory onto the terraces, roof hatches of plate,
// ladders of pipe and fir. The round room (the great kiva) sunk in the plaza, its roof the Boast's stand; small kivas; the
// stockade of stakes and sheet round the knoll's foot. Everything drawn is a record of core/pueblo's plan or of the dress
// (44-fg-wc-plan.js): this fragment decides nothing about where.
//   fgWcBuild(P, C, o)     the whole plan (cells, doors, hatches, ladders, kivas, dress) in the def's frame; registers it
//                          in core/tags first when the placement is not dry (a host registers its own: TG.fg.puebloRegister)
//   fgWcCell / fgWcFace     a column: footing, body, earth roof; each exposed face's parapet, salvage and vigas
//   fgWcLadder, fgWcHatch, fgWcDoor, fgWcKiva, fgWcStockade, fgWcDressDraw
// Defs: fg-wc-greathouse, fg-wc-hamlet, fg-wc-block (one block, the sheet's row), fg-wc-round-room, fg-wc-kiva, fg-wc-stockade.
Object.assign(SVPAL,{
 /* rammed earth and the earth roofs; the paint of the wrecked cars' shells and the containers' panels (faded) */
 earth:[0x9a8064,0x8e765c,0xa48a6c],roofE:[0x6e5e4a,0x665644,0x76644e],carpaint:[0x4a6a7a,0x6a7a4a,0x8a4a3a,0x7a6a3a,0x3a4a6a,0xa89a7a],
 container:[0x8a3a2a,0x2e4a6a,0x4a6a4a,0x9a7a3a]});
const FG_WC_DARK=hc(0x141210);
/* the kit's palette (P), under a name the plan's parameter P does not shadow */
function fgWcPal(k){return P(k);}
/* the cell's points counter-clockwise as prism() takes them (x, z: a positive area) */
function fgWcCCW(pts){let a=0;for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[(i+1)%pts.length];a+=p[0]*q[1]-q[0]*p[1];}return a>0?pts:pts.slice().reverse();}
function fgWcInset(pts,t){const c=KPUEBLO.centroid(pts);return pts.map(p=>{const dx=p[0]-c[0],dz=p[1]-c[1],L=Math.hypot(dx,dz)||1;return [p[0]-dx/L*t,p[1]-dz/L*t];});}
/* ---------------------------------------------------------------- a column */
function fgWcCell(P,c,C,S){const h=P.storey,top=c.storeys*h,pts=fgWcCCW(c.pts),u=fgWcU(P,c.seg,c.row*7+c.bi,81);
 const g=Math.min(0,...c.pts.map(p=>C.gl(p[0],p[1])));prism('stone',pts,Math.max(C.lo-1,g-.4),.02,fgCol('stoneD',C));
 /* the body: drystone, or rammed earth on a third of the columns */
 const earth=u<.33;prism('stone',pts,0,top,fgCol(earth?'earth':'stone',C));
 prism('stoneD',fgWcInset(pts,.06),top,top+.14,fgCol('roofE',C));
 for(const E0 of KPUEBLO.EDGES){const side=E0[0],o2=c.nb[side]&&P.byId[c.nb[side]],nt=o2?o2.storeys*h:g;if(nt>=top-.01)continue;fgWcFace(P,c,side,nt,top,C,S);}}
/* one exposed face of a column, from nt (the neighbour's roof, or the ground) to top: the parapet, the salvage, the vigas */
function fgWcFace(P,c,side,nt,top,C,S){const E=fgWcEdge(c,side),h=P.storey,si=['front','right','back','left'].indexOf(side);
 W(E.m[0],0,E.m[1],E.ry,()=>{const L=E.L,col=fgCol('stone',C);
  /* the parapet: drystone, a third capped with a strip of sheet */
  box('stone',0,top,-.17,L+.02,.5,.34,col);if(fgWcU(P,c.seg*4+si,c.row*16+c.bi*97,83)<.33)box('rust',0,top+.5,-.17,L*.9,.04,.4,fgCol('rust',C),0,0,(fgWcU(P,c.seg,si,84)-.5)*.04);
  const j0=Math.max(0,Math.floor(nt/h+1e-6));
  for(let j=j0;j<c.storeys;j++){const y0=Math.max(nt,j*h),y1=(j+1)*h,u=fgWcU(P,c.seg*4+si,c.row*16+j+c.bi*97,82);
   /* the salvage facing: a third left raw (the drystone shows), the rest one kind of scrap, its edges ragged */
   if(u>=.32&&!(C.worn&&fgWcU(P,c.seg,j*4+si,85)<.45)&&!(side==='front'&&S.bare&&S.bare.has(c.id))){const w=L*(.55+.4*fgWcU(P,c.seg,j*4+si,86)),hh=(y1-y0)*(.62+.33*fgWcU(P,c.seg,j*4+si,87)),
     x=(fgWcU(P,c.seg,j*4+si,88)-.5)*(L-w),y=y0+.08+((y1-y0)-hh-.12)*fgWcU(P,c.seg,j*4+si,89),rz=(fgWcU(P,c.seg,j*4+si,90)-.5)*.06;
    if(u<.55)box('tin',x,y,.03,w,hh,.035,fgCol('tin',C),0,0,rz);
    else if(u<.72)box('rust',x,y,.03,w,hh,.04,fgCol('rust',C),0,0,rz);
    else if(u<.84){box('plate',x,y,.035,w,hh,.05,fgCol('plate',C),0,0,rz);for(const sx of [-1,1])for(const sy of [.15,.85])ellip('iron',x+sx*(w/2-.08),y+hh*sy,.07,.025,.025,.012,fgWcPal('iron'),0,4);}
    else if(u<.94){const pc=fgCol('carpaint',C),cw=Math.min(w,2.4),ch=Math.min(hh,1.5);S.cars++;
     /* a wrecked car's shell cut open and flattened on: a bowed panel, its window holes plated */
     W(x,y,.03,0,()=>{psurf('paint',(a,b)=>[(a-.5)*cw,b*ch,Math.sin(a*Math.PI)*.18],6,2,pc);psurf('paint',(a,b)=>[(a-.5)*cw,b*ch,Math.sin(a*Math.PI)*.18-.02],6,2,pc,{flip:true});
      box('rust',cw*.18,ch*.55,.2,cw*.32,ch*.3,.02,fgCol('rust',C));});}
    else{const pc=fgCol('container',C);box('paint',x,y,.03,w,hh,.04,pc,0,0,rz);for(let k=0;k<Math.floor(w/.32);k++)box('paint',x-w/2+.16+k*.32,y,.06,.06,hh,.02,pc.clone().multiplyScalar(.85),0,0,rz);}
    S.faced++;}
   /* the vigas: fir beam ends in a row under each storey's roof, a scrap rail or pipe end among them (the front and back faces) */
   if((side==='front'||side==='back')&&y1-y0>1.2){const n=Math.max(2,Math.floor(L/.9)),yv=y1-.32;
    for(let k=0;k<n;k++){const x=-L/2+(k+.5)*L/n,rail=fgWcU(P,c.seg*16+k,j*4+si,91)<.2;if(rail)box('iron',x,yv,.2,.09,.13,.42,fgWcPal('iron'));else box('pole',x,yv-.02,.22,.17,.17,.46,fgCol('pole',C));}S.vigas+=n;}}});}
/* ---------------------------------------------------------------- doors, windows, hatches */
/* a T-door onto its terrace: the dark opening (narrow below, wide above), a frame of two mammoth tusks under a fir lintel, a
   hide curtain or a plate leaf; a window: a small dark square with a plate shutter */
function fgWcDoor(P,r,C,S){const c=P.byId[r.cell],E=fgWcEdge(c,'front'),y0=r.y0,dk=FG_WC_DARK;
 W(E.m[0],0,E.m[1],E.ry,()=>{const x=(fgWcU(P,c.seg,r.storey,92)-.5)*Math.max(0,E.L-2);
  if(r.face==='door'){box('plain',x,y0+.02,.015,.62,1.3,.03,dk);box('plain',x,y0+1.3,.015,1.06,.6,.03,dk);
   for(const s of [-1,1])beam('skull',[x+s*.66,y0,.07],[x+s*.56,y0+1.98,.09],.075,fgWcPal('skull'),true,5,.04);
   pole('pole',[x-.82,y0+1.98,.1],[x+.82,y0+1.98,.1],.08,fgCol('pole',C),6);
   if(fgWcU(P,c.seg,r.storey,93)<.55)box('hide',x+.12,y0+.06,.05,.66,1.78,.03,fgCol('hide',C));else box('plate',x-.42,y0+.04,.22,.05,1.8,.66,fgCol('plate',C),.4);S.doors++;}
  else{box('plain',x,y0+1.25,.015,.44,.4,.03,dk);box('rust',x+.42,y0+1.2,.06,.4,.48,.03,fgCol('rust',C),-.5);}});}
function fgWcHatch(P,H,C,S){const c=P.byId[H.cell],ry=Math.atan2(c.n[0],c.n[1]);
 const hk=['rust','rust','wood','plate'][Math.floor(fgWcU(P,c.seg,c.row*7+c.bi,103)*4)];
 W(H.x,H.y+.14,H.z,ry,()=>{box(hk,0,0,0,.9,.06,.9,fgCol(hk,C));box('plain',0,.02,-.2,.6,.05,.25,FG_WC_DARK);
  if(H.ladder&&!C.worn)fgWcRails(-1,1.7,-.18,-.42,C,fgWcU(P,c.seg,c.row,94)<.6);});S.hatches++;}
/* two rails and rungs from (y0, z0) to (y1, z1) in the current frame, x = +-.24: pipe (iron) or bell fir */
function fgWcRails(y0,y1,z0,z1,C,pipe){const mk=pipe?'iron':'pole',rc=pipe?fgWcPal('iron'):fgCol('pole',C);
 for(const s of [-1,1])beam(mk,[s*.24,y0,z0],[s*.24,y1,z1],pipe?.035:.045,rc,true,5);
 for(let y=y0+.3;y<y1-.15;y+=.32){const t=(y-y0)/(y1-y0);box('pole',0,y,z0+(z1-z0)*t,.52,.065,.065,fgCol('pole',C));}}
/* a ladder record: its foot on the lower level .55 m out from the face, its top against the face, .9 m over the roof it reaches */
function fgWcLadder(L,C,P,S){if(C.worn&&fgWcU(P,L.x*10|0,L.z*10|0,95)<.66)return;
 W(L.x,L.y0,L.z,L.ry,()=>fgWcRails(L.y0>0?.14:0,L.y1-L.y0+.9,0,-.42,C,fgWcU(P,L.x*10|0,L.z*10|0,96)<.6));S.ladders++;}
/* ---------------------------------------------------------------- the kivas */
/* sunk in the plaza: the round rim of drystone standing over its earth roof, the hatch and its ladder out; the great kiva
   (the round room) carries the Boast's stand on its roof (a plate dais and the horned post) and skulls round its rim */
function fgWcKiva(k,C,P,S){const r=k.r,rt=k.roof,rim=k.great?.6:.38,sc=fgCol('stone',C),x=k.x,z=k.z;
 sector('stone',x,z,r-.5,r,0,TAU,-.4,rt+rim,sc,Math.max(18,Math.round(r*5)));
 cyl('stoneD',x,-.3,z,r-.45,rt+.3,fgCol('roofE',C),Math.max(16,Math.round(r*4)));
 /* the cribbing's log ends showing at the rim, the roof's earth on them */
 const nl=Math.round(r*2.2);for(let i=0;i<nl;i++){const a=i/nl*TAU;box('pole',x+Math.cos(a)*(r-.25),rt-.12,z+Math.sin(a)*(r-.25),.16,.16,.7,fgCol('pole',C),-a+PI/2);}
 const hx=k.hatch.x,hz=k.hatch.z;box('plain',hx,rt+.02,hz,1.2,.04,1.2,FG_WC_DARK);for(const s of [-1,1])box('pole',hx+s*.65,rt,hz,.12,.12,1.4,fgCol('pole',C));
 W(hx,rt,hz,0,()=>fgWcRails(-.4,2.7,.25,-.25,C,false));
 if(k.great){/* the Boast's stand: a dais of white plate, the horned post behind it */
  cyl('plate',x,rt,z,1.8,.36,fgCol('plate',C),20);cyl('stoneD',x,rt,z,2.1,.12,fgCol('stoneD',C),20);
  pole('pole',[x,rt+.36,z-1.4],[x,rt+3.6,z-1.4],.13,fgCol('pole',C),7);fgWcHorns(x,rt+3.5,z-1.32,0,1.5,C);
  if(!C.worn)for(let i=0;i<8;i++){const a=i/8*TAU;W(x+Math.cos(a)*(r-.25),rt+rim,z+Math.sin(a)*(r-.25),-a+PI/2,()=>fgWcSkull(0,0,0,0,.9,C));}}
 S.kivas++;}
/* an aurochs skull facing +z at (x, y, z), its horns sweeping out and up; s the scale */
function fgWcSkull(x,y,z,ry,s,C){W(x,y,z,ry,()=>{ellip('skull',0,.16*s,.02*s,.15*s,.17*s,.22*s,fgWcPal('skull'),0,6);ellip('skull',0,.07*s,.2*s,.09*s,.08*s,.11*s,fgWcPal('skull'),0,5);
 for(const sx of [-1,1]){beam('horn',[sx*.12*s,.24*s,0],[sx*.42*s,.34*s,.02*s],.05*s,fgWcPal('horn'),true,5,.035*s);beam('horn',[sx*.42*s,.34*s,.02*s],[sx*.55*s,.62*s,.08*s],.035*s,fgWcPal('horn'),true,5,.008*s);}});}
/* a great pair of aurochs horns on a frontlet of plate (the hero's crest, the Boast's post) */
function fgWcHorns(x,y,z,ry,span,C){W(x,y,z,ry,()=>{box('plate',0,-.25,.02,.5,.5,.06,fgCol('plate',C));ellip('skull',0,0,.08,.22,.26,.16,fgWcPal('skull'),0,6);
 for(const sx of [-1,1]){const a=[sx*.18,.12,.06],b=[sx*span*.32,.28,.14],c=[sx*span*.5,.72,.1],d=[sx*span*.44,1.05,0];
  beam('horn',a,b,.11,fgWcPal('horn'),true,6,.08);beam('horn',b,c,.08,fgWcPal('horn'),true,6,.05);beam('horn',c,d,.05,fgWcPal('horn'),true,5,.008);}});}
/* ---------------------------------------------------------------- the stockade */
/* stakes every ~.9 m along the ring (sharpened, leaning a little out), sheet panels lashed between them, tyres stacked at
   some posts; the gate: two tall posts, an aurochs skull over them, two plate leaves standing open. ring {pts, gate} (closed),
   or a run when o.open. The stakes stand on the ground (C.gl) */
function fgWcStockade(R,C,P,S,o){o=o||{};const pts=R.pts,n=pts.length,gate=R.gate,gw=gate?gate.w:0,pc=fgCol('pole',C);let acc=0;
 const segs=o.open?n-1:n;
 for(let i=0;i<segs;i++){const p=pts[i],q=pts[(i+1)%n],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<1e-6)continue;const ux=(q[0]-p[0])/L,uz=(q[1]-p[1])/L,nx=uz,nz=-ux;
  for(let t=0;t<L;t+=.9){const x=p[0]+ux*t,z=p[1]+uz*t;if(gate&&Math.hypot(x-gate.x,z-gate.z)<gw/2)continue;const g=C.gl(x,z),hs=2.3+fgWcU(P,i,t*10|0,97)*.8,lean=.18;
   beam('pole',[x,g-.4,z],[x+nx*lean,g+hs,z+nz*lean],.075,pc,true,5,.012);S.stakes++;
   acc+=.9;if(acc>=2.7){acc=0;const kind=['rust','tin','plate','scrap','rust'][Math.floor(fgWcU(P,i,t*10|0,98)*5)];if(C.worn&&fgWcU(P,i,t*10|0,99)<.4)continue;
    W(x-ux*1.3,g+.25,z-uz*1.3,Math.atan2(nx,nz),()=>box(kind,0,0,.06,2.4,1.5+fgWcU(P,i,t*10|0,100)*.4,.04,fgCol(kind==='plate'?'plate':kind,C),0,.04,(fgWcU(P,i,t*10|0,101)-.5)*.08));S.panels++;}
   if(fgWcU(P,i,t*10|0,102)<.04)for(let k=0;k<3;k++)ring('tyre',x-nx*.6,g+.18+k*.3,z-nz*.6,.38,.12,fgWcPal('tyre'),0,PI/2,0,10);}}
 if(gate){W(gate.x,0,gate.z,gate.ry,()=>{const g=C.gl(gate.x,gate.z);
  for(const s of [-1,1]){pole('pole',[s*gw/2,g-.5,0],[s*gw/2,g+4.2,0],.16,pc,7);box('plate',s*(gw/2-.1),g+.05,.9,.06,2.6,1.9,fgCol('plate',C),s*.25);}
  pole('pole',[-gw/2-.3,g+4,0],[gw/2+.3,g+4,0],.13,pc,7);fgWcSkull(0,g+4.05,.1,0,1.4,C);});}}
/* ---------------------------------------------------------------- the dress */
function fgWcDressDraw(P,D,C,S){
 for(const s of D.crest){if(s.kind==='crest')fgWcHorns(s.x,s.y,s.z,s.ry,s.span,C);else if(!C.worn)fgWcSkull(s.x,s.y,s.z,s.ry,.75,C);S.crest++;}
 for(const t of D.trophies){const g=0;pole('pole',[t.x,g-.3,t.z],[t.x,g+t.h,t.z],.09,fgCol('pole',C),6);
  W(t.x,g+t.h,t.z,0,()=>{if(t.what==='helmet'){/* a Labber's helmet: a white Ancient dome with its visor */
    lathe('plate',0,0,[[.24,-.05],[.25,.08],[.2,.2],[.1,.27],[0,.29]],12,fgCol('plate',C));box('plain',0,.02,.2,.34,.08,.06,hc(0x1c2a30));}
   else if(t.what==='scale'){/* a Lizard's scale, big as a shield, green and dull */box('paint',0,-.2,.04,.5,.62,.04,hc(0x4a6a3a),0,0,PI/4);}
   else if(t.what==='horns')fgWcHorns(0,-.2,.05,0,1.1,C);
   else for(let k=0;k<3;k++)fgWcSkull(0,-.35-k*.42,.08,k*.4,.7,C);});
  cord('cord',[[t.x+.08,t.h-.6,t.z],[t.x+.3,t.h-1.4,t.z+.15]],.012,fgWcPal('rope'));S.trophies++;}
 for(const d of D.deeds){W(d.x,d.y,d.z,d.ry,()=>{fgText('THE DEEDS',0,d.h-.28,.012,0,.24,fgWcPal('white'));const n=d.boasts.length,cw=(d.w-.6)/n;
   for(let i=0;i<n;i++){const b=d.boasts[i],x=-d.w/2+.3+(i+.5)*cw;fgMark(b.mark,x,d.h-.75,.012,0,Math.min(.34,cw*.9),0xe8e2d4);
    if(b.made)box('plain',x,.3,.012,cw*.5,cw*.5,.01,hc(0xe8e2d4));else for(const a of [PI/4,-PI/4])box('plain',x,.25,.012,.05,cw*.75,.01,hc(0xa8321e),0,0,a);
    for(let k=0;k<1+(i*7%4);k++)box('plain',x-cw*.3+k*cw*.18,.02,.012,.04,.2,.01,hc(0xe8e2d4));}});S.deeds++;}
 for(const s of D.slogans){W(s.x,0,s.z,s.ry,()=>{const w=fgTextW(s.text,s.ch);fgText(s.text,s.aurochs?-1.2:0,s.y,0,0,s.ch,fgWcPal('red'));
   if(s.aurochs){/* a painted aurochs head beside the words: the brow, the muzzle, the great horns */const x=w/2+.6,y=s.y+s.ch*.4,k=hc(0xe8e2d4);
    box('plain',x,y-.35,.012,.5,.75,.01,k);box('plain',x,y-.6,.012,.34,.3,.01,k);for(const sx of [-1,1]){box('plain',x+sx*.45,y+.22,.012,.55,.12,.01,k,0,0,sx*.35);box('plain',x+sx*.78,y+.5,.012,.1,.42,.01,k,0,0,-sx*.3);}}});S.slogans++;}
 for(const s of D.shells){W(s.x,s.y,s.z,s.ry,()=>{const r=s.r;ellip('horn',0,.02,0,r,r*.62,r*.82,hc(0x6a5a40),0,10);ring('horn',0,.12,0,r*.95,.07,hc(0x4e4232),0,PI/2,0,14);
   for(let k=0;k<7;k++){const a=k/7*TAU;ellip('horn',Math.cos(a)*r*.55,r*.45,Math.sin(a)*r*.48,r*.2,r*.07,r*.18,hc(0x7a6a4c),a,6);}});S.shells++;}
 for(const f of D.drums)fgFurn(f.key,f.x,null,f.z,f.ry);}
/* ---------------------------------------------------------------- the whole plan */
/* register the plan's records as the current record's children (a placement that is not dry), before anything is drawn */
function fgWcRegister(P,D,T,parent,at,ry,name){const r=KPUEBLO.register(P,T,{parent,culture:'fellgang',at,ry,name,frag:KIT.frag});let n=r.count;
 const fx=(kind,name2,x,y,z,size,role)=>{T.child(parent,{'class':'fixture',kind,key:'fg-wc-'+kind,name:name+': '+name2,at:at(x,y,z),ry,size,tags:{culture:'fellgang',part:kind,role},frag:KIT.frag});n++;};
 D.crest.forEach(s=>fx(s.kind==='crest'?'crest':'skull',s.kind==='crest'?'the hero\'s horned crest':'an aurochs skull on the parapet',s.x,s.y,s.z,s.kind==='crest'?[s.span,.6,1.2]:[.8,.4,.6],'trophy'));
 D.trophies.forEach(t=>fx('trophy-pole','a trophy pole ('+t.what+')',t.x,0,t.z,[.6,.6,t.h+.4],'trophy'));
 D.deeds.forEach(d=>fx('deeds','the Deeds (every boast, and whether it was made good)',d.x,d.y,d.z,[d.w,.05,d.h],'record'));
 D.slogans.forEach(s=>fx('slogan','a slogan ('+s.text+')',s.x,s.y,s.z,[fgTextW(s.text,s.ch),.02,s.ch],'sign'));
 D.shells.forEach(s=>fx('cistern','a glyptodont shell as a cistern',s.x,s.y,s.z,[2*s.r,2*s.r,s.r*.7],'water'));
 return n;}
function fgWcBuild(P,C,o){o=o||{};const D=o.dress||fgWcDress(P),S={faced:0,cars:0,vigas:0,doors:0,hatches:0,ladders:0,kivas:0,crest:0,trophies:0,deeds:0,slogans:0,shells:0,stakes:0,panels:0};
 /* the faces the Deeds are painted on stay bare drystone */
 Object.defineProperty(S,'bare',{value:new Set([].concat(...D.deeds.map(d=>d.cells))),enumerable:false});
 if(!PLACE_DRY&&CURREC&&CURREC.tid&&SVTAGS){const M=CM.clone(),at=(x,y,z)=>{const v=new THREE.Vector3(x,y,z).applyMatrix4(M);return [+v.x.toFixed(4),+v.y.toFixed(4),+v.z.toFixed(4)];};
  fgSet('registered',fgWcRegister(P,D,SVTAGS,CURREC.tid,at,CURREC.ry,CURREC.name));}
 P.cells.forEach(c=>fgWcCell(P,c,C,S));
 P.rooms.forEach(r=>{if(r.face)fgWcDoor(P,r,C,S);});
 P.hatches.forEach(H=>fgWcHatch(P,H,C,S));
 P.ladders.forEach(L=>fgWcLadder(L,C,P,S));
 P.kivas.forEach(k=>fgWcKiva(k,C,P,S));
 fgWcDressDraw(P,D,C,S);
 if(C.worn)P.cells.filter(c=>!c.nb.back).forEach((c,i)=>{if(i%3)return;const E=fgWcEdge(c,'back');W(E.m[0],0,E.m[1],E.ry,()=>fgRubble(0,.4,4,C));});
 fgSet('plan',P.id);fgSet('cells',P.cells.length);fgSet('rooms',P.rooms.length);fgSet('pop',P.census.pop);for(const k in S)fgSet(k,S[k]);
 /* the house's door (core/engine's record front): the way in, the first entry ladder's foot */
 const L0=P.ladders.find(L=>L.kind==='entry')||P.ladders[0];if(L0)door(L0.x,0,L0.z,L0.ry,1,2);
 return S;}
/* the declared boxes: the default plan's footprint, the ladders' feet and parapets, the crest */
function fgWcBox(P,dw,dd,dh){return {w:+(P.bounds.w+dw).toFixed(2),d:+(P.bounds.d+dd).toFixed(2),h:+(P.bounds.h+dh).toFixed(2)};}
const FG_WC_GB=fgWcBox(fgWcPlan(FG_WC.GREAT),1.2,1.4,2),FG_WC_HB=fgWcBox(fgWcPlan(FG_WC.HAMLETS[0]),1.2,1.4,1.6),FG_WC_BB=fgWcBox(fgWcPlan(FG_WC.block(0)),1.2,1.4,1.8);
defBuilding({key:'fg-wc-greathouse',name:'Wildcat: the great house',seed:9201,cut:false,w:FG_WC_GB.w,d:FG_WC_GB.d,h:FG_WC_GB.h,budget:600000,
 tags:{types:['dwelling-multi','military'],wealth:'middle',style:'salvage',role:'dwelling'},
 note:'the scrap pueblo (core/pueblo): one great house of Pueblo Bonito\'s scale, a D of room blocks stepping up five storeys from two plazas, faced in salvage over drystone and rammed earth; no doors at the ground, ladders pulled up at night; the round room in the west plaza, the Deeds on the front, the hero\'s rooms under a horned crest',
 build(o){const C=fgCx(o),P=o.plan||fgWcPlan(FG_WC.GREAT);fgWcBuild(P,C,o);}});
defBuilding({key:'fg-wc-hamlet',name:'Wildcat: a scrap-pueblo hamlet',seed:9202,w:FG_WC_HB.w,d:FG_WC_HB.d,h:FG_WC_HB.h,budget:80000,
 tags:{types:['dwelling-multi'],wealth:'poor',style:'salvage',role:'dwelling'},
 note:'a small scrap pueblo (core/pueblo: a U or an L of room blocks round a yard, a kiva in it)',
 build(o){const C=fgCx(o),P=o.plan||fgWcPlan(FG_WC.HAMLETS[(o.v|0)%2]);fgWcBuild(P,C,o);}});
defBuilding({key:'fg-wc-block',name:'Wildcat: a room block',seed:9203,w:FG_WC_BB.w,d:FG_WC_BB.d,h:FG_WC_BB.h,budget:40000,
 tags:{types:['dwelling-multi'],wealth:'middle',style:'salvage',role:'dwelling'},
 note:'one block of the scrap pueblo alone: three rows stepping up to three storeys from its yard, stores below and homes above; the even seeds carry the hero\'s rooms under the horned crest',
 build(o){const C=fgCx(o);fgWcBuild(fgWcPlan(FG_WC.block(o.v|0)),C,o);}});
defBuilding({key:'fg-wc-round-room',name:'Wildcat: the round room',seed:9204,w:22.6,d:22.6,h:6.4,budget:30000,
 tags:{types:['civic'],wealth:'middle',style:'salvage',role:'civic'},
 note:'the Kimr\'s round room, the great kiva sunk in the plaza: its roof the Boast\'s stand (a hero stands on the dais and says what they will do), its floor where the hands are counted; skulls round its rim, trophy poles round it, no spirits on its walls',
 build(o){const C=fgCx(o),P={world:14700+(o.v|0),storey:2.6,byId:{}},k={id:'rr',x:0,z:0,r:8.5,depth:3,roof:.45,great:true,hatch:{x:2.55,z:-2.1}},S={kivas:0,trophies:0,crest:0,deeds:0,slogans:0,shells:0};
  fgWcKiva(k,C,P,S);fgWcDressDraw(P,{crest:[],trophies:[0,1,2,3,4,5].map(i=>({x:Math.cos((i+.3)/6*TAU)*10.9,z:Math.sin((i+.3)/6*TAU)*10.9,what:['helmet','scale','skulls','horns','helmet','skulls'][i],h:4+(i%3)*.6})),
   deeds:[],slogans:[],shells:[],drums:[{key:'fellgang_common_war_drum',x:7,z:7,ry:-.8},{key:'fellgang_common_brazier',x:-7.4,z:6.6,ry:0}]},C,S);fgSet('trophies',S.trophies);}});
defBuilding({key:'fg-wc-kiva',name:'Wildcat: a kiva',seed:9205,w:7.4,d:7.4,h:3.6,budget:8000,
 tags:{types:['civic'],wealth:'middle',style:'salvage',role:'civic'},
 note:'a small kiva, sunk: a household\'s or a band\'s round room, entered by its ladder through the roof',
 build(o){const C=fgCx(o),P={world:14710+(o.v|0),storey:2.6,byId:{}};fgWcKiva({id:'k',x:0,z:0,r:3.2+(o.v|0)%2*.2,depth:2.4,roof:.45,great:false,hatch:{x:.96,z:-.8}},C,P,{kivas:0});}});
defBuilding({key:'fg-wc-stockade',name:'Wildcat: the stockade',seed:9206,w:30,d:1.6,h:4.8,budget:60000,
 tags:{types:['military','infrastructure'],style:'salvage',role:'defence'},
 note:'stakes and scrap round the knoll\'s foot: sharpened fir stakes, sheet panels lashed between them, tyres stacked at some posts; the gate under an aurochs skull. A host passes the plan\'s ring (o.ring); alone, a 30 m run with its gate',
 build(o){const C=fgCx(o),P={world:14720+(o.v|0)},S={stakes:0,panels:0};
  if(o.ring)fgWcStockade(o.ring,C,P,S);else fgWcStockade({pts:[[-14.6,0],[14.6,0]],gate:{x:0,z:0,w:4,ry:0}},C,P,S,{open:true});fgSet('stakes',S.stakes);fgSet('panels',S.panels);}});
