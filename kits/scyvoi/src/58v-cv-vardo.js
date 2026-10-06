// prefix: cv
// ================================================================= THE CHIEF'S VARDO: a carved living wagon
// A ledge wagon in the Romani manner: a narrow lower body between the wheels, a ledge, and an upper body that flares out over
// them; a barrel roof overhanging front and back; red lacquer, gilt scrollwork and gold-ribbed panels; side and back windows
// with curtains; a double door onto a porch, a striped ladder down to the ground; cream wheels (big at the back, small at
// the front so the fore-carriage can turn); shafts propped on a stand; a stovepipe. Inside: a bed across the back, a bench,
// a stove, cushions and a lantern (cut-away). Frame: origin on the ground under the middle of the whole footprint (body,
// porch, ladder and shafts), +z the front (the door and the shafts). The body's own centre is CV_VD.bz.
const CV_VD={bz:-1.45,L:3.6,yF:1.05,low:.7,ledge:.55,hw:1.0,top:1.75,arch:.55,roofW:1.2};
/* a gilt scroll in the plane facing +z (local frame): a spiral of n turns from radius r, mirrored by s (+1 / -1) */
function cvScroll(x,y,z,r,s,turns,face){const pts=[];const N=Math.round(14*(turns||1.3));for(let i=0;i<=N;i++){const t=i/N,a=t*TAU*(turns||1.3),rr2=r*(1-.78*t);
 const px=x+s*Math.cos(a)*rr2,py=y+Math.sin(a)*rr2;pts.push(face==='x'?[z,py,px]:[px,py,z]);}cord('brass',pts,Math.max(.008,r*.09),0xd8a840);}
/* a curving gilt bracket: a C-scroll from a to b bulging by `bulge` along (bx, by) */
function cvBracket(a,b,bulge,n){const P=[];n=n||8;for(let i=0;i<=n;i++){const t=i/n,k=Math.sin(PI*t)*bulge;P.push([lerp(a[0],b[0],t)+k*(a[3]||0),lerp(a[1],b[1],t)+k,lerp(a[2],b[2],t)]);}cord('brass',P,.022,0xd8a840);}
defBuilding({key:'wagon-chief',name:"Chief's vardo",seed:5805,cls:'building',cut:true,w:2.6,d:7.4,h:4.4,budget:90000,
 tags:{types:['dwelling-single'],wealth:'rich',style:'vardo',role:'chief'},
 note:"the chief's carved living wagon: red lacquer and gilt, a barrel roof, a porch and ladder; it travels with the band and stands by the great tent in camp",
 build(o){const V=CV_VD,L=V.L,L2=L/2,yF=V.yF,yLd=yF+V.ledge,yT=yF+V.top,hw=V.hw,RED=null,GOLD=0xd8a840,CREAM=0xe8d49a,DARK=0x2a1410;
  W(0,0,V.bz,0,()=>{
  // ---- the running gear: wheels, axles, the fore-carriage, springs (outside the cut-away)
  tkNoCut(()=>{
   for(const s of [-1,1]){cvWheel(s*.98,-1.05,.8,14,CREAM);cvWheel(s*.82,1.05,.56,12,CREAM);}
   for(const [z,r] of [[-1.05,.8],[1.05,.56]]){beam('iron',[-1.02,r,z],[1.02,r,z],.07,0x2e2a26,true,8);for(const s of [-1,1])sph('lacq',s*.98,r,z,.09,RED);}
   beam('wood',[0,.82,-1.4],[0,.7,1.4],.12,P('woodD'),false);   // the perch
   cyl('iron',0,.62,1.05,.42,.06,0x2e2a26,18);box('wood',0,.68,1.05,1.3,.14,.22,P('woodD'));   // the turntable and the fore-bed
   for(const s of [-1,1])for(const z of [-1.05,1.05]){box('iron',s*.62,(z<0?.85:.62),z,.1,.08,.6,0x3a3632);box('iron',s*.62,(z<0?.93:.7),z,.08,.06,.42,0x3a3632);}   // leaf springs
  });
  // ---- the lower body: narrow, between the wheels; gilt mouldings and scroll medallions on each panel
  tkCutFloor(yF);
  for(const s of [-1,1])box('lacq',s*(V.low-.025),yF-.02,0,.05,V.ledge+.02,L,RED);   // hollow: two side walls, the back, the front round the door
  box('lacq',0,yF-.02,-L2+.025,V.low*2,V.ledge+.02,.05,RED);
  for(const s of [-1,1])box('lacq',s*(V.low+.42)/2,yF-.02,L2-.025,V.low-.42,V.ledge+.02,.05,RED);
  box('wood',0,yF-.08,0,V.low*2+.04,.08,L+.04,DARK);
  for(const s of [-1,1]){
   box('brass',s*(V.low+.012),yF+.04,0,.02,.04,L-.1,GOLD);box('brass',s*(V.low+.012),yF+V.ledge-.1,0,.02,.04,L-.1,GOLD);
   for(const z of [-1.05,0,1.05]){cvScroll(s*(V.low+.03),yF+.28,z-.16,.11,-1,1.4,'x');cvScroll(s*(V.low+.03),yF+.28,z+.16,.11,1,1.4,'x');}}
  // ---- the ledge, flaring out over the wheels, carried on gilt brackets
  for(const s of [-1,1])box('carved',s*(V.low+hw+.05)/2,yLd,0,hw-V.low+.1,.08,L+.06,0x8a2a1a);   // a strip each side: the interior stays open
  for(const s of [-1,1])for(const z of [-1.5,-.6,.3,1.2]){const P=[];for(let i=0;i<=8;i++){const t=i/8;P.push([s*lerp(V.low+.02,hw-.02,t),yLd-.02-(1-t)*(1-t)*.42,z]);}cord('brass',P,.024,GOLD);cvScroll(s*(V.low+.06),yF+.16,z,.06,1,1.2,'x');}
  // ---- the upper body: side walls leaning out a little, gold ribs, a window each side
  const lean=.06,wy0=yLd+.08,wh=yT-wy0;
  for(const s of [-1,1]){
   W(s*(hw+.0),wy0,0,0,()=>{box('lacq',0,0,0,.06,wh,L,RED,0,0,-s*lean);});
   const xr=y=>s*(hw+.035+(y-wy0)*lean);
   for(let z=-L2+.15;z<=L2-.14;z+=.2){if(Math.abs(z)<.48)continue;beam('brass',[xr(wy0+.05),wy0+.05,z],[xr(yT-.12),yT-.12,z],.035,GOLD,false);}   // gilt ribs
   box('brass',xr(wy0),wy0,0,.03,.05,L,GOLD,0,0,-s*lean);box('brass',xr(yT-.1),yT-.12,0,.03,.06,L,GOLD,0,0,-s*lean);
   // the window: gilt frame, glass, curtains drawn back, a carved pediment
   const wy=wy0+.38,xw=xr(wy+.3)+s*.02;
   box('glass',xw,wy,0,.02,.62,.78,0x9ab8c0);
   for(const zz of [-.3,.3])withCloth(clothHang(.6,.03),()=>W(xw+s*.01,wy+.62,zz,s>0?PI/2:-PI/2,()=>psurf('flag',(u,v)=>[(u-.5)*.22,-v*.6,0],3,4,0xb01a28)));
   for(const zz of [-.41,.41])box('brass',xw,wy-.03,zz,.04,.7,.05,GOLD);box('brass',xw,wy-.05,0,.05,.05,.88,GOLD);box('brass',xw,wy+.64,0,.05,.05,.88,GOLD);
   cvScroll(xw+s*.02,wy+.82,-.18,.12,-1,1.3,'x');cvScroll(xw+s*.02,wy+.82,.18,.12,1,1.3,'x');sph('brass',xw+s*.02,wy+.84,0,.05,GOLD);}
  // ---- the back wall and its window
  W(0,wy0,-L2,0,()=>{box('lacq',0,0,0,hw*2+.12,wh,.06,RED);box('glass',0,.45,-.04,.6,.5,.02,0x9ab8c0);
   for(const x of [-.33,.33])box('brass',x,.42,-.05,.05,.56,.04,GOLD);box('brass',0,.4,-.05,.72,.05,.04,GOLD);box('brass',0,.96,-.05,.72,.05,.04,GOLD);
   for(const x of [-.75,-.6,.6,.75])beam('brass',[x,.05,-.045],[x,wh-.12,-.045],.03,GOLD,false);
   cvScroll(-.2,1.2,-.05,.13,-1,1.3);cvScroll(.2,1.2,-.05,.13,1,1.3);});
  // ---- the front: the double door with glazed upper leaves, carved pilasters, a gilt sunburst over it
  W(0,wy0,L2,0,()=>{const dW=.84;
   for(const s of [-1,1]){box('lacq',s*(dW/2+.32),0,0,.64,wh,.06,RED);
    for(const x of [.5,.65,.8])beam('brass',[s*x,.05,.04],[s*x,wh-.12,.04],.03,GOLD,false);
    cvScroll(s*(dW/2+.32),.45,.05,.14,s,1.4);cvScroll(s*(dW/2+.32),1.05,.05,.1,-s,1.3);}
   box('lacq',0,wh-.32,0,dW,.32,.06,RED);
   for(const s of [-1,1])W(s*dW/2,-(wy0-yF),.03,s*1.25,()=>{box('lacq',-s*dW/4,0,0,dW/2-.02,wh+(wy0-yF)-.34,.05,0x9a1a1a);   // the leaves, half open
    box('glass',-s*dW/4,.88,.03,dW/2-.14,.4,.02,0xb04050);   /* the leaf's frame stands on the floor: its glazed top half */box('brass',-s*dW/4,.6,.035,dW/2-.12,.04,.02,GOLD);cvScroll(-s*dW/4,.32,.04,.1,s,1.3);});
   const sb=[];for(let i=0;i<=12;i++){const a=PI*i/12;sb.push([Math.cos(a)*.42,wh-.18+Math.sin(a)*.14,.05]);}cord('brass',sb,.025,GOLD);
   for(let i=1;i<12;i+=2){const a=PI*i/12;beam('brass',[0,wh-.2,.05],[Math.cos(a)*.38,wh-.2+Math.sin(a)*.12,.05],.015,GOLD,true,4);}});
  door(0,yF,L2+.1,0,.84);
  // ---- the barrel roof, overhanging front and back; its gilt fascia and scroll brackets; the stovepipe
  const rw=V.roofW,rz0=-L2-.32,rz1=L2+.62,roofY=(x)=>yT+.02+V.arch*Math.pow(Math.max(0,1-Math.pow(x/rw,2)),.62);
  psurf('canvas',(u,v)=>{const x=-rw+u*2*rw;return [x,roofY(x),rz0+v*(rz1-rz0)];},14,10,0x6a1a18);
  psurf('patArch',(u,v)=>{const x=(-rw+u*2*rw)*.96;return [x,roofY(x/.96)-.04,rz0+.05+v*(rz1-rz0-.1)];},12,8,null,{flip:true});   // the painted ceiling
  for(const z of [rz0,rz1]){const P=[];for(let i=0;i<=16;i++){const x=-rw+i/16*2*rw;P.push([x,roofY(x)-.03,z]);}cord('brass',P,.035,GOLD);
   const Q=[];for(let i=0;i<=16;i++){const x=(-rw+i/16*2*rw)*.92;Q.push([x,roofY(x/.92)-.16,z]);}cord('brass',Q,.02,GOLD);
   for(let i=0;i<6;i++){const x=-rw*.8+i*rw*1.6/5;cvScroll(x,roofY(x)-.1,z,.07,i%2?1:-1,1.2);}}
  for(const s of [-1,1])for(const z of [L2+.02,-L2-.02]){cvBracket([s*hw,yT-.55,z],[s*rw*.96,yT+.02,z+(z>0?.5:-.25)],.12,8);sph('brass',s*rw*.97,yT+.02,z+(z>0?.56:-.3),.05,GOLD);}   // the hood brackets
  tkNoCut(()=>{const cx=-.45,cz=L2-.75;pole('iron',[cx,yT-.2,cz],[cx,roofY(cx)+.75,cz],.06,0x2a2622,10);cyl('iron',cx,roofY(cx)+.7,cz,.12,.06,0x2a2622,12);cone('iron',cx,roofY(cx)+.76,cz,.13,.18,0x2a2622,12);smokeAt(cx,roofY(cx)+1.0,cz,{r:.15,kind:'flue'});});
  // ---- the porch: boards on the fore-bed, a gilt rail at each side, lanterns under the hood
  box('wood',0,yF-.06,L2+.31,1.5,.06,.62,P('wood'));
  for(const s of [-1,1]){beam('brass',[s*.7,yF,L2+.62],[s*.7,yF+.7,L2+.62],.03,GOLD,true,6);beam('brass',[s*.7,yF+.7,L2],[s*.7,yF+.7,L2+.62],.03,GOLD,true,6);}
  for(const s of [-1,1])FURNISH_HANG('scyvoi_hanging_lantern',s*.85,yT+.05,L2+.45,0,{setting:'outdoor'});
  // ---- outside the cut-away: the ladder from the porch, the shafts and their stand
  tkNoCut(()=>{const zl0=L2+.6,zl1=L2+1.45,stripe=(a,b,w)=>{for(let i=0;i<8;i++){const t0=i/8,t1=(i+1)/8;beam(i%2?'plain':'wood',[lerp(a[0],b[0],t0),lerp(a[1],b[1],t0),lerp(a[2],b[2],t0)],[lerp(a[0],b[0],t1),lerp(a[1],b[1],t1),lerp(a[2],b[2],t1)],w,i%2?0x1a1410:CREAM,false);}};
   for(const s of [-1,1])stripe([s*.32,yF,zl0],[s*.32,0,zl1],.06);
   for(let k=1;k<5;k++){const t=k/5;box('wood',0,yF*(1-t)-.03,lerp(zl0,zl1,t),.64,.04,.18,CREAM);}
   for(const s of [-1,1]){stripe([s*.52,.95,1.25],[s*.58,1.0,4.9],.08);sph('brass',s*.58,1.0,4.95,.05,GOLD);}
   beam('wood',[-.58,1.0,4.6],[.58,1.0,4.6],.06,CREAM,true,6);
   for(const s of [-1,1]){beam('wood',[s*.7,0,4.75],[s*.6,.97,4.55],.05,CREAM,true,6);beam('wood',[s*.45,0,4.35],[s*.6,.97,4.55],.05,CREAM,true,6);}});
  // ---- inside: a bed across the back (drawers under it), a bench along one side, a little stove under the pipe, cushions
  box('wood',0,yF,0,V.low*2-.04,.02,L-.06,P('woodD'));
  box('lacq',0,yF,-L2+.5,V.low*2-.1,V.ledge,.95,RED);for(const x of [-.4,0,.4]){box('brass',x,yF+.18,-L2+.98,.3,.22,.02,GOLD);sph('brass',x,yF+.29,-L2+1.0,.025,GOLD);}   // the bed box, drawers to the front
  box('patFelt',0,yLd+.08,-L2+.5,hw*2-.12,.14,.92,null);   // the bed across the full width, on the box and the ledges
  box('lacq',.55,yF,.25,.28,V.ledge,1.4,RED);box('stone',-.45,yF,L2-.75,.4,.62,.42,0x2a2622);box('iron',-.45,yF+.62,L2-.75,.44,.05,.46,0x3a3632);
  FURNISH('scyvoi_floor_cushion',.72,yLd+.08,-.1,-PI/2);FURNISH('scyvoi_floor_cushion',.72,yLd+.08,.6,-PI/2,{v:1});
  FURNISH('scyvoi_bolster',0,yLd+.22,-L2+.3,0);FURNISH('scyvoi_bolster',.35,yLd+.22,-L2+.66,0,{v:1});
  FURNISH('scyvoi_tea_set',-.45,yF+.67,L2-.75,0);FURNISH_HANG('scyvoi_hanging_lantern',0,yT+.25,-.2,0);
  FURNISH('scyvoi_wall_felt',0,yF+.9,-L2+.06,0,{v:1});
  });}});
