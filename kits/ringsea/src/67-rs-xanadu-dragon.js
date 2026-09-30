// ---------------------------------------------------------------- vessel: Xanadu Dragon Boat
// Xanadu's festival racer, rowed out of the Sultanate's harbour for the Water Festival: an 18 m shell
// scaled turquoise and gold, a gilded druk (the thunder dragon of the valley's temples) rearing from
// the bow on a scaled neck, a curling gilt tail at the stern, twenty paddlers in maroon and saffron
// to the drum, a steersman on a long oar, a parasol over the patron, and prayer-flag pennants.
// THE HEAD (rsDruk): a gilt skull and upturned snout with curled nostrils, an open jaw with fangs
// and a curling red tongue, bulging eyes under heavy brows, branched antlers, a flame mane in
// turquoise, whiskers and a beard. Built in its own frame (facing +x, origin at the back of the
// skull) so another vessel can borrow it.
function rsDruk(B,p,k,cols){const c=Object.assign({gold:0xd8a838,mane:0x2aa8a0,mane2:0x7ad0b0,horn:0xf0e6cc,tongue:0xc02a1e,eye:0xf0d040,teeth:0xfaf6ea},cols||{});
 const P=(x,y,z)=>[p[0]+x*k,p[1]+y*k,p[2]+z*k];const T=(pts,r,col,mk,seg)=>rsTube(B,mk||'metal',pts.map(q=>P(q[0],q[1],q[2]||0)),typeof r==='number'?r*k:(t=>r(t)*k),col,seg||16,8);
 // skull, cheeks, brow ridge
 rsSphere(B,'metal',.62*k,P(0,0,0),[1.15*k/k,.85,.8],c.gold,16,12);
 for(const s of[-1,1]){rsSphere(B,'metal',.3*k,P(.25,-.12,s*.36),[1.2,.9,.8],c.gold,10,8);
  T([[.05,.42,s*.2],[.4,.5,s*.34],[.75,.36,s*.36]],t=>.13*(1-.5*t),c.gold);
  // eyes: gold ball, black pupil, set forward under the brow
  rsSphere(B,'paint',.17*k,P(.52,.26,s*.33),null,c.eye,12,10);rsSphere(B,'paint',.08*k,P(.64,.27,s*.4),null,0x111111,8,6);}
 // the upturned snout and its curled nostrils
 T([[.35,.12],[.9,.1],[1.45,.16],[1.78,.4],[1.72,.62]],t=>.34*(1-.55*t),c.gold);
 for(const s of[-1,1])rsScroll(B,P(1.5,.28,s*.2),.18*k,1.4,.06*k,c.gold,1,'metal',p[2]+s*.2*k);
 // lower jaw hanging open, the fangs and the teeth rows, the tongue
 T([[.2,-.28],[.8,-.62],[1.35,-.7],[1.6,-.6]],t=>.24*(1-.45*t),c.gold);
 for(let i=0;i<6;i++){const x=.7+i*.16;for(const s of[-1,1]){rsCone(B,'paint',.04*k,(i===4?.34:.16)*k,P(x,-.02+i*.012,s*.18),[Math.PI,0,0],c.teeth,5);
  rsCone(B,'paint',.04*k,(i===4?.3:.14)*k,P(x+.05,-.58-i*.01,s*.15),null,c.teeth,5);}}
 T([[.6,-.42],[1.2,-.5],[1.8,-.36],[2.2,-.1],[2.3,.15]],t=>.09*(1-.8*t),c.tongue,'paint');
 // antlers: a main tine sweeping back and up, with two branches
 for(const s of[-1,1]){const a=[[-.1,.5,s*.22],[-.45,.95,s*.38],[-.85,1.3,s*.5],[-1.35,1.45,s*.56]];T(a,t=>.09*(1-.7*t),c.horn,'paint');
  T([[-.45,.95,s*.38],[-.3,1.35,s*.5],[-.38,1.62,s*.55]],t=>.055*(1-.7*t),c.horn,'paint');T([[-.85,1.3,s*.5],[-.75,1.62,s*.62],[-.88,1.85,s*.66]],t=>.05*(1-.7*t),c.horn,'paint');}
 // flame mane fanning from the back of the skull, alternating turquoise and pale jade
 for(let i=0;i<11;i++){const a=-1.1+i*.22,s=i%2?1:-1,len=.9+.35*Math.sin(i*1.7)**2;const b=[-.3,.1+Math.sin(a)*.3,Math.cos(a)*.28*s];
  T([b,[b[0]-len*.5,b[1]+Math.sin(a)*len*.5+.2,b[2]*1.6],[b[0]-len*.9,b[1]+Math.sin(a)*len*.7+.5,b[2]*2.1],[b[0]-len*.8,b[1]+Math.sin(a)*len*.7+.8,b[2]*2]],t=>.14*(1-t*.95),i%2?c.mane:c.mane2,'paint',12);}
 // whiskers from the snout, curling back; the beard under the jaw
 for(const s of[-1,1]){T([[1.4,.05,s*.28],[1.3,-.1,s*.8],[.6,-.1,s*1.2],[.1,-.35,s*1.1],[-.1,-.6,s*.8]],.025,c.gold,'metal',24);
  for(let i=0;i<3;i++)T([[.9-i*.2,-.78,s*(.08+i*.06)],[.7-i*.2,-1.1,s*(.12+i*.08)],[.8-i*.2,-1.4,s*(.1+i*.1)]],t=>.08*(1-.9*t),c.mane,'paint',8);}}
function buildRsXanaduDragon(){reseed(71700);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const T1=0x1f8a86,T2=0x36b0a2,GOLD=0xd8a838,MAR=0x7a1a24,SAF=0xe89a2a;
 const H=rsHull({L:18,B:1.6,fb:.6,dr:.35,sheerF:.9,sheerA:.8,sp:3,pb:2.6,pa:2.4,q:.6,n:2.2,flare:.1,rakeF:.3,rakeA:.3,keelEnd:.1});
 rsHullMesh(B,H,'paint',(u,h,s)=>{if(h>.9)return GOLD;if(h<.3)return MAR;const row=Math.floor(h*6);return(Math.floor(u*56+row*.5)%2)?T1:T2;},72,10);rsFoam(B,H,.4);
 const dY=rsDeck(B,H,{bw:.2,col:0x7a5a38});rsWale(B,H,.92,.04,'metal',GOLD);
 // the scaled neck: rooted 1.6 m inside the hull, rising and arching forward to the head
 const pb=H.pt(1,0,1),uN=H.uAt(pb[0]-1.6);const neck=[[pb[0]-1.6,H.ys(uN)-.25,0],[pb[0]-.4,pb[1]+.2,0],[pb[0]+.1,pb[1]+1.1,0],[pb[0]+.1,pb[1]+1.9,0],[pb[0]+.5,pb[1]+2.4,0]];
 rsTube(B,'paint',neck,t=>.3*(1-.25*t),T1,40,10);
 for(let i=0;i<9;i++){const t=.1+i*.09,q=new THREE.CatmullRomCurve3(neck.map(rsV)).getPointAt(t);rsCone(B,'metal',.07,.4,[q.x-.22,q.y+.1,0],[0,0,.9],GOLD,5);
  for(const s of[-1,1])rsSphere(B,'paint',.09,[q.x,q.y,s*.25],null,i%2?T2:MAR,6,4);}
 rsDruk(B,[pb[0]+.75,pb[1]+2.55,0],.62);
 // the tail: out of the hull and curling up over the stern
 const pS=H.pt(0,0,1),uT=H.uAt(pS[0]+1.4);rsTube(B,'metal',[[pS[0]+1.4,H.ys(uT)-.2,0],[pS[0]+.5,pS[1]-.02,0],[pS[0]+.15,pS[1]-.05,0]],.16,GOLD,10,8);
 rsScroll(B,[pS[0]+.15,pS[1]-.05,0],.9,1.3,.18,GOLD,-1,'metal');for(let i=0;i<5;i++)rsCone(B,'paint',.06,.5,[pS[0]-.1-i*.12,pS[1]+.2+i*.25,0],[0,0,-.7],T2,5);
 // twenty paddlers in pairs, the drummer and drum at the bow, the steersman, the patron's parasol
 const pts=[];for(let i=0;i<10;i++){const x=lerp(-5.5,5.5,i/9);const y=dY(H.uAt(x));pts.push([x,y+.62,H.halfAt(H.uAt(x),y)*.5]);}
 for(const P of pts)for(const s of[-1,1])rsFigure(B,[P[0]-.25,P[1]-.62,s*P[2]],0,s<0?MAR:SAF,true);
 rsOars(V,H,{name:'paddles',points:pts.map(p=>[p[0],p[1]+.3,p[2]+.25]),len:1.6,inb:.25,r:.03,bladeL:.5,bladeW:.18,col:GOLD,sweep:.55,lift:.3,rate:.9,pitch:1.1,immerse:.18});
 {const x=6.7,y=dY(H.uAt(x));rsCyl(B,'paint',.38,.38,.5,[x,y+.5,0],[0,0,Math.PI/2],MAR,14);rsCyl(B,'cloth',.39,.39,.52,[x,y+.5,0],[0,0,Math.PI/2],0xf0e0c0,14);rsFigure(B,[x-.8,y,0],0,SAF,true);}
 {const x=-7.8,y=dY(H.uAt(x));rsFigure(B,[x,y,0],0,MAR);rsLink(B,'wood',[x+.4,y+1.3,.2],[x-3.6,-.3,.4],.045,0x7a5a38,5);}
 {const x=-6.4,y=dY(H.uAt(x));rsLink(B,'metal',[x,y,0],[x,y+2.2,0],.03,GOLD,5);for(let k=0;k<2;k++)rsCone(B,'cloth',.9-k*.3,.35,[x,y+2+k*.35,0],null,k?SAF:MAR,16);rsFigure(B,[x,y,0],0,0xe8d8b0,true);}
 // prayer-flag pennants in the five colours along both gunwales
 for(const a of rsAlong(H,.15,.85,8,1)){const top=[a.p[0],a.p[1]+1.8,a.p[2]];rsLink(B,'wood',a.p,top,.02,0x6a4a2c,4);rsPennant(B,top,.9,.35,[[0x2a5ab8,0xf0ece0,0xc02a1e,0x2a8a4a,0xe8c040][Math.floor(rng()*5)]],.05);}
 rsBake(B,V.group,'xanaduDragon');V.deckY=dY(.5);return V;}
RS_VESSEL({key:'xanaduDragon',name:'Xanadu Dragon Boat',culture:'xanadu',L:21,B:6,H:5,
 tags:{type:['ceremonial','racing'],propulsion:['paddles'],hull:'monohull',wealth:'rich',crew:24,role:'festival racer'},
 blurb:'A turquoise-and-gold scaled racer under a gilded thunder dragon, twenty paddlers to the drum, prayer-flag pennants.',build:buildRsXanaduDragon});
