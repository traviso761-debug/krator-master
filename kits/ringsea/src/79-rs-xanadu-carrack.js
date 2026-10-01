// ---------------------------------------------------------------- vessel: Xanadu Bullion Carrack
// How the valley's gold reaches the sea: a 40 m maroon-and-gold carrack with a tall three-storey
// aftcastle and an overhanging forecastle under turquoise tile, fighting tops on the masts, saffron
// square sails bordered in maroon with the gold eight-spoked wheel, a lateen on the mizzen, and a
// guarded deck of iron-bound bullion chests. Every sail's foot rides above the castles.
function rsXanaduWheel(g,W,H,P){rsCloth(g,W,H,'#e89a2a',8,'v');g.save();rsPolyPath(g,P);g.clip();g.strokeStyle='#7a1a24';g.lineWidth=W*.08;rsPolyPath(g,P);g.stroke();
 g.strokeStyle='#d8a838';g.lineWidth=W*.015;rsPolyPath(g,rsInset(P,W*.07));g.stroke();const [cx,cy]=rsCentroid(P),R=Math.min(W,H)*.2;
 g.strokeStyle='#7a1a24';g.lineWidth=R*.14;g.beginPath();g.arc(cx,cy,R,0,TAU);g.stroke();g.lineWidth=R*.08;for(let i=0;i<8;i++){const a=i/8*TAU;g.beginPath();g.moveTo(cx+Math.cos(a)*R*.2,cy+Math.sin(a)*R*.2);g.lineTo(cx+Math.cos(a)*R*1.18,cy+Math.sin(a)*R*1.18);g.stroke();}
 g.fillStyle='#d8a838';g.beginPath();g.arc(cx,cy,R*.24,0,TAU);g.fill();g.restore();}
function buildRsXanaduCarrack(){reseed(72900);
 const V={group:new THREE.Group(),anims:[]};const B=rsBucket();
 const MAR=rsLin(0x6a1a24),MAR2=rsLin(0x3a0e14),GOLD=0xd8a838,TURQ=rsLin(0x1f9aa8),CREAM=rsLin(0xe8dcc0),WOOD=rsLin(0x5a3a24);
 const H=rsHull({L:40,B:11,fb:3.8,dr:3,sheerF:3,sheerA:4.2,sp:2.2,pb:2,pa:1.9,q:.45,n:2.8,flare:.06,rakeF:3.4,rakeA:1,transom:.4,keelEnd:1.2});
 rsHullMesh(B,H,'wood',(u,h,s)=>h>.94?GOLD:h>.9?MAR:h>.87?GOLD:h<.42?MAR2:MAR);rsFoam(B,H,1.4);
 const dY=rsDeck(B,H,{bw:1,col:rsLin(0x8a6a4a)});rsWale(B,H,.87,.1,'metal',GOLD);rsWale(B,H,.7,.14,'wood',MAR2);rsWale(B,H,.56,.14,'wood',MAR2);rsSpine(B,H,.28,MAR2);
 for(const a of rsAlong(H,.25,.75,9,.78))rsDecal(B,H,a.u,a.s,.78,.35,GOLD,'metal',14,.1);
 // the castles: three storeys aft, one overhanging forward, turquoise tile hip roofs
 let aTop=dY(.12);[[10,9.6,2.4],[7.5,8.4,2.2],[5,6.8,2.1]].forEach(([w,d,h],i)=>{const x=H.xAt(.12,1)+w/2-1.5+i*.6;
  rsCabin(B,{x,y:aTop,w,d,h,mk:'wood',wall:i?MAR:CREAM,win:Math.round(w/1.3),winCol:0x100808,roof:'hip',roofMk:'tile',roofCol:TURQ,rh:.9+i*.2,over:.35,flare:.2});aTop+=h+.2;});
 aTop+=1.4;
 const fx=H.xAt(.88,1),fTop=rsCabin(B,{x:fx+1,y:dY(.88),w:7,d:9.4,h:2.3,mk:'wood',wall:MAR,win:4,winCol:0x100808,roof:'hip',roofMk:'tile',roofCol:TURQ,rh:1.2,over:.5,flare:.2})+.2;
 for(const a of rsAlong(H,.25,.8,26,1))rsLink(B,'metal',a.p,[a.p[0],a.p[1]+1,a.p[2]],.04,GOLD,5);
 // masts: fore (square), main (course + topsail, fighting top), mizzen (lateen above the aftcastle)
 const mast=(mx,mh,r)=>{const b=dY(H.uAt(mx));rsLink(B,'wood',[mx,b-.5,0],[mx,b+mh,0],r,WOOD,10,r*.6);return b;};
 const sq=(mx,y0,y1,w,a,key,bel)=>{rsRig(B,[mx,0]);const U=[Math.sin(a),0,Math.cos(a)];const S=rsSail(B,{key,O:[mx+.5,y0,0],U,V:[0,1,0],belly:bel,A:t=>[(t-.5)*w,y1-y0],Bf:t=>[(t-.5)*w*.92,0],draw:rsXanaduWheel});
  rsSailEdge(B,S,0,.17,WOOD);rsSailEdge(B,S,1,.1,WOOD);rsRigEnd(B);return S;};
 const fb=mast(11,20,.3);sq(11,fTop+1.4,fb+17,11,1,'xanadu-wheel',-1.2);
 const mb=mast(0,31,.42);const cT=mb+21;sq(0,mb+5,cT,15,1,'xanadu-wheel',-1.6);sq(0,cT+1.4,mb+29,10,1,'xanadu-wheel',-.9);
 rsCyl(B,'wood',1.1,.9,1.1,[0,cT+.7,0],null,MAR,14);rsCyl(B,'wood',.9,.75,.9,[11,fb+17.6,0],null,MAR,12);
 const zb=mast(-12,17,.24);rsRig(B,[-12,0],{gain:.5});const S3=rsSail(B,{key:'xanadu-wheel',O:[0,0,.35],U:[1,0,0],V:[0,1,0],belly:.8,nu:16,nv:8,
  A:t=>[lerp(-6.5,-20,t),lerp(aTop+.2,zb+19,t)],Bf:t=>[lerp(-17,-20,t),lerp(aTop,zb+19,t)],draw:rsXanaduWheel});
 {const yd=[];for(let k=0;k<=10;k++)yd.push(S3.at(k/10,0));rsTube(B,'wood',yd,.14,WOOD,20,6);}rsRigEnd(B);
 for(const [mx,top] of[[11,fb+20],[0,mb+31],[-12,zb+17]]){rsRope(B,[mx,top,0],[mx+ (mx>5?9:-8),mx>5?fTop:aTop-1.4,0]);rsPennant(B,[mx,top+.2,0],4.5,.9,[MAR,GOLD]);}
 // the bullion: iron-bound chests stacked amidships, guards in maroon
 for(let i=0;i<12;i++){const x=rr(-4,4),z=rr(-3,3),y=dY(H.uAt(x))+.35+(i%3)*.72;rsBox(B,'wood',[1.2,.7,.8],[x,y,z],[0,rr(-.2,.2),0],WOOD);rsBox(B,'metal',[1.24,.1,.84],[x,y+.25,z],[0,0,0],GOLD);rsBox(B,'metal',[.1,.72,.84],[x,y,z],[0,0,0],0x2a2a2a);}
 for(const [x,z] of[[-5,3.2],[5,-3.2],[5.5,3],[-6,-3],[14,1]])rsFigure(B,[x,x>10?fTop-.2:dY(H.uAt(x)),z],rr(0,TAU),[MAR,GOLD][Math.floor(rng()*2)]);
 {const p=H.pt(0,0,.2);rsBox(B,'wood',[2.6,5,.4],[p[0]-1.1,p[1]+.8,0],null,MAR2);}
 rsBake(B,V.group,'xanaduCarrack');V.deckY=mb;return V;}
RS_VESSEL({key:'xanaduCarrack',name:'Xanadu Bullion Carrack',culture:'xanadu',L:48,B:16,H:38,
 tags:{type:['cargo','merchant','carrack'],propulsion:['sail'],hull:'monohull',wealth:'royal',crew:90,role:'carries the valley gold to the coast markets'},
 blurb:'A maroon-and-gold carrack under turquoise-tiled castles, saffron sails with the gold wheel, a guarded deck of bullion chests.',build:buildRsXanaduCarrack});
