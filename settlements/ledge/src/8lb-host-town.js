// ================================================================= HOST — the head's and the foot's towns, the Ancients' halls, the station's mouth
// [draw] Each part of the layout to the builder its key names, at the part's footprint centre on its ground, turned by its ry; no
// position is decided here (the layout's):
//   dalab_*     the Dalab set, read in place (settlements/dalab): VERN.place
//   fg-*        the Fellgang set (kits/tungang, sealed as TG): TG.fg.draw, one call for the head's quarter and one for the foot's
//   anc:*       the Ancients' own pieces here, in the shell's panel (LB): the lift halls, the mole, the station's mouth
//   tg:*        a Tungang def: a tagged stand-in until the tg set merges (claude/loj-twenny-059a5e): the winding house drawn as a block
//               in rust, the loj's buildings inside their decks left undrawn (they are tagged)
//   yard, halting: the page's own (fenced earth; the Travellers' barrel-top wagons)
const LTOWN=(function(){const L=LEDGE_LAYOUT,G=L.ground,W=L.world,placed=[],missing=[],own=[],standin=[];
 const dr=(id,i,salt)=>LEDGE.draw(W,id,i,salt),box=LB.box;
 const C=p=>{const b=LEDGE.bbox(p.shape);return [(b[0]+b[1])/2,(b[2]+b[3])/2,b];};
 const t0=performance.now();
 // ---- the Dalab set
 L.parts.forEach(p=>{if(!p.key||p.key.indexOf('dalab_')!==0)return;const c=C(p);
  if(typeof VERN==='undefined'||!VERN.defs[p.key]){missing.push(p.id);return;}
  const g=VERN.place(scene,p.key,c[0],c[1],p.ry||0,{y:p.y,v:KRAND.hash(LEDGE.seed(W,p.id),7)%3});
  if(g){placed.push(p.id);own.push({id:p.id,kit:'dalab',w:c[2][1]-c[2][0],d:c[2][3]-c[2][2],ry:p.ry||0,def:[VERN.defs[p.key].w,VERN.defs[p.key].d]});}else missing.push(p.id);});
 // ---- the Fellgang set: the head's quarter and the foot's, each one draw (TG.fg.draw seats each record on the ground itself)
 const fg={};
 ['Z0','Z5'].forEach(z=>{const ps=L.parts.filter(p=>p.zone===z&&p.key&&p.key.indexOf('fg-')===0);if(!ps.length)return;
  const recs=ps.map(p=>{const c=C(p),q=Math.abs(Math.sin(p.ry||0))>.5,bw=c[2][1]-c[2][0],bd=c[2][3]-c[2][2];
   return {key:p.key,id:'ledge.'+p.id,x:c[0],z:c[1],ry:p.ry||0,w:q?bd:bw,d:q?bw:bd,h:p.h};});
  const pop=ps.reduce((a,p)=>a+p.people,0);
  if(typeof TG==='undefined'||!TG.fg){ps.forEach(p=>missing.push(p.id));return;}
  const M=TG.fg.draw({id:'ledge-'+(z==='Z0'?'head':'foot'),focus:z==='Z0'?'trade':'fishing',census:{pop},records:recs},
   {scene,ground:LEDGE_H,seed:4376+(z==='Z0'?0:1),label:z==='Z0'?'The head\'s Fellgang quarter':'The foot\'s Fellgang quarter',character:z==='Z0'?'stony':'low'});
  fg[z]=M;const miss=M.missing||{};
  ps.forEach(p=>{if(miss[p.key])missing.push(p.id);else{placed.push(p.id);own.push({id:p.id,kit:'fellgang'});}});});
 // ---- the Ancients' own pieces and the stand-ins (LB, flushed into one group)
 const AG=new THREE.Group();AG.name='the Ancients\' halls';scene.add(AG);
 L.parts.forEach(p=>{if(!p.shape||!p.key)return;const c=C(p),b=c[2],sx=b[1]-b[0],sz=b[3]-b[2];
  if(p.key==='anc:lifthall'){box('panel',c[0],p.y+p.h/2,c[1],sx,p.h,sz);
   const front=b[3]>0&&b[2]>=0?b[3]:b[2];const out=front===b[3]?1:-1;
   [-.25,.25].forEach(f=>box('dead',c[0]+f*sx,p.y+Math.min(10,p.h*.6)/2,front+out*.15,Math.min(24,sx*.3),Math.min(10,p.h*.6),.3));
   for(let x=b[0]+6;x<b[1]-4;x+=6)box('win',x,p.y+p.h-4,front+out*.15,3.4,2.2,.3);
   placed.push(p.id);own.push({id:p.id,kit:'ancient'});}
  else if(p.key==='anc:mole'){const bed=Math.min(LEDGE_H(b[0],b[3]),LEDGE_H(b[1],b[3]))-.5;box('panel',c[0],(bed+p.y)/2,c[1],sx,p.y-bed,sz);
   for(let z=b[2]+10;z<b[3]-4;z+=20){box('rust',b[0]+1,p.y+.5,z,.8,1,.8);box('rust',b[1]-1,p.y+.5,z,.8,1,.8);}
   placed.push(p.id);own.push({id:p.id,kit:'ancient'});}
  else if(p.key==='anc:station'){/* its mouth on the dressed face over deck 20's concourse (the platforms are in the rock) */
   const d1=LEDGE.deckBox(L,L.decks.find(d=>d.id==='d.20.c')),d2=LEDGE.deckBox(L,L.decks.find(d=>d.id==='d.20.e1')),x0=Math.max(b[0],d1.x0)+4,x1=Math.min(b[1],d2.x1)-4;
   box('dead',(x0+x1)/2,p.y+9,.15,x1-x0,18,.3);box('lampG',(x0+x1)/2,p.y+19,.35,x1-x0-20,.6,.3);
   placed.push(p.id);own.push({id:p.id,kit:'ancient'});}
  else if(p.key==='tg:tg_lift_head'){/* the winding house over the great lifts: a stand-in block and its two headframes */
   box('rust',c[0],p.y+p.h/2,c[1],sx,p.h,sz);
   L.lifts.filter(lf=>lf.kind==='car').forEach(lf=>{[-6,6].forEach(o=>box('rust',lf.x+o,p.y+p.h*1.3,lf.z,1.2,p.h*2.6+p.h*.0,1.2));box('rust',lf.x,p.y+p.h*2.6,lf.z,14,1.4,2);});
   placed.push(p.id);standin.push(p.id);own.push({id:p.id,kit:'tungang-standin'});}
  else if(p.key.indexOf('anc:')===0||p.key.indexOf('tg:')===0){placed.push(p.id);if(p.key.indexOf('tg:')===0)standin.push(p.id);}});
 // the tg stand-ins with no shape (inside their decks): registered, not drawn
 L.parts.forEach(p=>{if(!p.shape&&p.key&&p.key.indexOf('tg:')===0){placed.push(p.id);standin.push(p.id);}});
 // ---- the yards: fenced earth; the halting place: barrel-top wagons in loose rows
 L.parts.forEach(p=>{if(p.kind!=='yard'&&p.kind!=='halting')return;const c=C(p),b=c[2],y=p.y;
  box(p.kind==='yard'?'earth':'grass',c[0],y+.03,c[1],b[1]-b[0],.06,b[3]-b[2]);
  if(p.kind==='yard'){const post=(x,z)=>box('timber',x,y+.75,z,.25,1.5,.25);
   for(let x=b[0];x<=b[1]+.01;x+=4){post(x,b[2]);post(x,b[3]);}for(let z=b[2]+4;z<b[3];z+=4){post(b[0],z);post(b[1],z);}
   [[.6],[1.2]].forEach(h=>{box('timber',c[0],y+h[0],b[2],b[1]-b[0],.14,.12);box('timber',c[0],y+h[0],b[3],b[1]-b[0],.14,.12);
    box('timber',b[0],y+h[0],c[1],.12,.14,b[3]-b[2]);box('timber',b[1],y+h[0],c[1],.12,.14,b[3]-b[2]);});}
  else{let n=0;for(let z=b[2]+8;z<b[3]-6;z+=13)for(let x=b[0]+8;x<b[1]-6;x+=11){if(dr(p.id,n,1)<.25){n++;continue;}
   const ry=(dr(p.id,n,2)-.5)*.8,q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),ry),cs=Math.cos(ry),sn=Math.sin(ry);
   box('timber',x,y+.9,z,1.9,.6,4.2,{q});
   for(let a=0;a<5;a++){const t=a/4*Math.PI,hx=Math.cos(t)*1.0,hy=Math.sin(t)*1.0;box(n%3?'canvas':'canvas2',x+hx*cs,y+1.2+hy,z-hx*sn,.7,.12,4.0,{q:new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),ry).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),t-Math.PI/2))});}
   [[-1,-1.4],[1,-1.4],[-1,1.4],[1,1.4]].forEach(w=>box('timber',x+w[0]*cs+w[1]*sn,y+.45,z-w[0]*sn+w[1]*cs,.15,.9,.9,{q}));n++;}}
  placed.push(p.id);own.push({id:p.id,kit:'page'});});
 const mats=Object.assign({},LMAT,{timber:MAT.timber||LMAT.ochre,earth:new THREE.MeshLambertMaterial({color:0x7a6a52}),grass:new THREE.MeshLambertMaterial({color:0x5e6e3e}),
  canvas:new THREE.MeshStandardMaterial({color:0xd8cdb0,roughness:1,side:THREE.DoubleSide}),canvas2:new THREE.MeshStandardMaterial({color:0x8a5a3a,roughness:1,side:THREE.DoubleSide})});
 const meshes=LB.flush(AG,mats,'the Ancients\' halls, the yards, the halting place');
 /* the Dalab set draws through the Ancients kit's instancing (kput): bake its instances into the scene once, after every place */
 if(typeof kbake==='function')kbake(scene);
 return {placed,missing,own,standin,fg,meshes,ms:Math.round(performance.now()-t0)};})();
