// ---------- the surface of the park, close up: the parking lots and the Upper Visitor Center ----------
// From the air the park is a hole with a ring road round it. From the car it is a parking lot, a walk across a
// plaza under three flags, and a building with a gift shop in it - and that is the part every visitor saw,
// so it is drawn at the scale a visitor saw it.
//
//   parkinglot      a graded pad (tools/make-fleshpit.py levels it), striped: a drive lane round the edge,
//                   double rows of stalls between planted islands, light standards on the islands, a pay booth
//                   at the entry, disabled bays nearest the building, and cars - more of them the nearer the
//                   stall is to the walk in. Pickups in the works lot; RVs along the back of the overflow.
//   visitorcenter   the plaza between the wings: an entrance canopy with the name on it, doors, flags,
//                   planters and benches, the map board, a drinking fountain, the gift shop's windows and the
//                   ticket windows opposite, café tables, and on the rim side a terrace with coin telescopes.
//
// Fan work. Every shape and every word here is this project's own.
import { mkRng } from '../core/rng.js';
import { signBoard, faceTowards } from './signs.js';

export function surface(api){
  const {THREE,box,group,gh,animHooks,nightF,hour,mergeParts}=api;
  const R=mkRng(1989);
  const lampM=new THREE.MeshBasicMaterial({color:0xffc27a});
  const litM=new THREE.MeshBasicMaterial({color:0xfff1d6});
  animHooks.push(()=>{const n=nightF(hour());lampM.color.setRGB(0.25+0.75*n,0.22+0.54*n,0.18+0.3*n);
    litM.color.setRGB(0.55+0.45*n,0.55+0.4*n,0.52+0.3*n);});
  const concM=new THREE.MeshLambertMaterial({color:0xb8b0a0});
  const kerbM=new THREE.MeshLambertMaterial({color:0xcfc8b8});
  const mulchM=new THREE.MeshLambertMaterial({color:0x8a7458});
  const shrubM=new THREE.MeshLambertMaterial({color:0x6e7048,flatShading:true});
  const trunkM=new THREE.MeshLambertMaterial({color:0x5a4a3a});
  const poleM=new THREE.MeshLambertMaterial({color:0x6a6e72});
  const brownM=new THREE.MeshLambertMaterial({color:0x6a5040});
  const glassM=new THREE.MeshPhongMaterial({color:0x2a3a44,specular:0x9ab0c0,shininess:80});
  const tree=(x,y,z,s,out)=>{out.trunk.push(box(x,y,z,0.4*s,3*s,0.4*s,trunkM));
    const c=new THREE.Mesh(new THREE.IcosahedronGeometry(2.4*s,0),shrubM);c.position.set(x,y+3.6*s,z);c.scale.y=0.7;out.leaf.push(c);};

  // ---- the striping, drawn on canvas at four pixels to the metre ----
  function lotTexture(w,d,layout){
    const S=4,c=document.createElement('canvas');c.width=Math.round(w*S);c.height=Math.round(d*S);const g=c.getContext('2d');
    const X=x=>(x+w/2)*S,Z=z=>(z+d/2)*S;
    g.fillStyle='#3d3c3b';g.fillRect(0,0,c.width,c.height);
    for(let k=0;k<400;k++){                       // patching, oil, sun-bleach: no lot is one colour
      g.fillStyle=`rgba(${R()<0.5?'20,20,22':'120,116,108'},${(0.04+R()*0.08).toFixed(3)})`;
      const r=2+R()*18;g.beginPath();g.ellipse(R()*c.width,R()*c.height,r*S*0.5,r*S*0.3,R()*3,0,7);g.fill();}
    g.strokeStyle='#e8e4d8';g.lineWidth=0.14*S;
    for(const row of layout.rows){
      const z0=Z(row.z),z1=Z(row.z+row.dir*row.depth);
      for(let x=layout.x0;x<=layout.x1+0.01;x+=row.stall){g.beginPath();g.moveTo(X(x),z0);g.lineTo(X(x),z1);g.stroke();}
      if(row.disabled)for(const k of row.disabled){const x=layout.x0+k*row.stall;
        g.fillStyle='#2d5a9a';g.fillRect(X(x)+2,Math.min(z0,z1)+2,row.stall*S-4,Math.abs(z1-z0)-4);
        g.fillStyle='#e8e4d8';g.beginPath();g.arc(X(x+row.stall/2),(z0+z1)/2,0.7*S,0,7);g.fill();}
    }
    g.fillStyle='#e8e4d8';                        // arrows down the aisles and round the drive lane
    for(const a of layout.aisles)for(let x=layout.x0+12;x<layout.x1-6;x+=30){
      const zz=Z(a.z),xx=X(x),dir=a.dir;g.beginPath();
      g.moveTo(xx-dir*2.2*S,zz-0.35*S);g.lineTo(xx+dir*0.6*S,zz-0.35*S);g.lineTo(xx+dir*0.6*S,zz-0.9*S);g.lineTo(xx+dir*2*S,zz);
      g.lineTo(xx+dir*0.6*S,zz+0.9*S);g.lineTo(xx+dir*0.6*S,zz+0.35*S);g.lineTo(xx-dir*2.2*S,zz+0.35*S);g.fill();}
    if(layout.walk!==undefined){                 // the crossing at the walk in
      for(let k=-6;k<=6;k+=2){g.fillRect(X(layout.walk-2),Z(-d/2)+k*0.6*S+14*S,4*S,0.6*S);}
    }
    g.strokeStyle='#d9b23a';g.lineWidth=0.2*S;g.strokeRect(X(-w/2+1),Z(-d/2+1),(w-2)*S,(d-2)*S);
    const t=new THREE.CanvasTexture(c);t.anisotropy=8;return t;
  }

  // ---- a car: body, cabin, wheels, in a few shapes ----
  const CAR_COLS=[0xe8e6e0,0xb8bcc0,0x8a8e92,0x6a1e24,0x1e2a4a,0x1a1a1c,0xc8b89a,0x2e4a36,0xa8322a,0x4a5a6a,0xd0c8b0,0x3a2a22];
  const glass=new THREE.MeshLambertMaterial({color:0x1c2228});
  const wheelM=new THREE.MeshLambertMaterial({color:0x151515});
  const bodyM=new THREE.MeshLambertMaterial({color:0xffffff});
  const SHAPES={
    sedan:{body:[4.6,0.9,1.8,0,0.35,0],cab:[2.3,0.7,1.6,-0.3,1.25,0]},
    suv:{body:[4.8,1.2,1.9,0,0.4,0],cab:[3.2,0.8,1.8,-0.5,1.6,0]},
    pickup:{body:[5.4,1.0,1.95,0,0.45,0],cab:[1.9,0.85,1.8,0.7,1.45,0]},
    rv:{body:[10,2.6,2.5,0,0.5,0],cab:[1.4,0.9,2.3,4.6,1.6,0]},
  };
  function carFleet(list,parent){
    // one instanced mesh per shape and part: the whole lot is a handful of draw calls
    const by={};for(const c of list)(by[c.shape]=by[c.shape]||[]).push(c);
    const m=new THREE.Object3D(),col=new THREE.Color();
    for(const [shape,cars] of Object.entries(by)){
      const S=SHAPES[shape];
      const bg=new THREE.BoxGeometry(S.body[0],S.body[1],S.body[2]).translate(S.body[3],S.body[4]+S.body[1]/2,S.body[5]);
      const cg=new THREE.BoxGeometry(S.cab[0],S.cab[1],S.cab[2]).translate(S.cab[3],S.cab[4]+S.cab[1]/2-0.2,S.cab[5]);
      const B=new THREE.InstancedMesh(bg,bodyM,cars.length),Cb=new THREE.InstancedMesh(cg,shape==='rv'?bodyM:glass,cars.length);
      cars.forEach((c,i)=>{m.position.set(c.x,c.y,c.z);m.rotation.set(0,c.rot,0);m.updateMatrix();
        B.setMatrixAt(i,m.matrix);Cb.setMatrixAt(i,m.matrix);B.setColorAt(i,col.setHex(c.col));if(shape==='rv')Cb.setColorAt(i,col.setHex(0xdcd8d0));});
      B.castShadow=Cb.castShadow=true;parent.push(B,Cb);
    }
  }

  return {
    parkinglot(L){
      const [cx,cz,w,d]=L.rect,y=gh(cx,cz)+0.3,parts=[],trees={trunk:[],leaf:[]},kerbs=[],mulch=[],poles=[],heads=[],cars=[];
      const STALL=2.8,DEPTH=5.6,AISLE=7.6,ISLE=3.2,LANE=8;
      // the rows: down from the north edge, [stall][aisle][stall][island] repeated
      const layout={x0:-w/2+LANE,x1:w/2-LANE,rows:[],aisles:[]};
      layout.x1=layout.x0+Math.floor((layout.x1-layout.x0)/STALL)*STALL;
      const nStalls=Math.round((layout.x1-layout.x0)/STALL);
      let z=-d/2+LANE,k=0;const islands=[];
      while(z+DEPTH*2+AISLE<=d/2-LANE+0.01){
        const r1={z,dir:1,depth:DEPTH,stall:STALL},r2={z:z+DEPTH*2+AISLE,dir:-1,depth:DEPTH,stall:STALL};
        if(k===0&&L.disabled)r1.disabled=L.disabled.map(i=>L.disabledEnd==='w'?i:nStalls-1-i);
        layout.rows.push(r1,r2);layout.aisles.push({z:z+DEPTH+AISLE/2,dir:k%2?-1:1});
        z+=DEPTH*2+AISLE;
        if(z+ISLE+DEPTH*2+AISLE<=d/2-LANE){islands.push(z+ISLE/2);z+=ISLE;}
        k++;
      }
      layout.aisles.push({z:-d/2+LANE/2,dir:-1},{z:d/2-LANE/2,dir:1});
      if(L.walk!==undefined)layout.walk=L.walk;
      // the pad: striped asphalt on top, a kerb round it, and a skirt down to whatever the grading left
      const top=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:lotTexture(w,d,layout)}));
      top.rotation.x=-Math.PI/2;top.position.set(cx,y,cz);top.receiveShadow=true;parts.push(top);
      kerbs.push(box(cx,y-3,cz-d/2,w+0.6,3.2,0.6,kerbM),box(cx,y-3,cz+d/2,w+0.6,3.2,0.6,kerbM),
        box(cx-w/2,y-3,cz,0.6,3.2,d,kerbM),box(cx+w/2,y-3,cz,0.6,3.2,d,kerbM));
      // the islands: kerbed, mulched, a shrub every few metres and a tree every few stalls, lit
      for(const iz of islands){
        const len=layout.x1-layout.x0;
        kerbs.push(box(cx,y,cz+iz,len,0.22,ISLE,kerbM));mulch.push(box(cx,y+0.2,cz+iz,len-0.6,0.06,ISLE-0.6,mulchM));
        for(let x=layout.x0+3;x<layout.x1-2;x+=7){
          if(Math.round(x/7)%3===0)tree(cx+x,y+0.25,cz+iz,1+R()*0.3,trees);
          else{const s=new THREE.Mesh(new THREE.IcosahedronGeometry(0.8+R()*0.4,0),shrubM);s.position.set(cx+x,y+0.7,cz+iz);trees.leaf.push(s);}
        }
        for(let x=layout.x0+18;x<layout.x1-10;x+=38){          // light standards: a pole, an arm each way, two heads
          poles.push(box(cx+x,y+0.25,cz+iz,0.3,11,0.3,poleM),box(cx+x,y+11,cz+iz,0.2,0.2,4.2,poleM));
          heads.push(box(cx+x,y+10.6,cz+iz-2,0.7,0.35,1.1,lampM),box(cx+x,y+10.6,cz+iz+2,0.7,0.35,1.1,lampM));
        }
      }
      // the cars: busier nearer the walk in, and nobody parks in the far corner if they can help it
      const walkX=L.walk!==undefined?L.walk:layout.x1;
      layout.rows.forEach((row,ri)=>{
        for(let i=0;i<nStalls;i++){
          const x=layout.x0+(i+0.5)*STALL,near=1-Math.min(1,Math.abs(x-walkX)/(w*0.9));
          if(row.disabled&&row.disabled.includes(i)&&R()<0.5)continue;
          if(R()>(L.fill||0.5)*(0.45+0.9*near)*(1-ri*0.05))continue;
          const shape=L.trucks&&R()<0.7?'pickup':R()<0.3?'suv':'sedan';
          const zc=row.z+row.dir*DEPTH/2;
          cars.push({x:cx+x,y,z:cz+zc,rot:row.dir>0?Math.PI/2:-Math.PI/2,shape,col:CAR_COLS[Math.floor(R()*CAR_COLS.length)]});
        }
      });
      if(L.rvs)for(let i=0;i<L.rvs;i++)cars.push({x:cx-w/2+LANE+6+i*14,y,z:cz+d/2-LANE/2-0.5,rot:0,shape:'rv',col:[0xf0ece0,0xe0d8c8,0xd8d0c0][i%3]});
      carFleet(cars,parts);
      // the pay booth at the way in, with its sign
      if(L.booth){const [bx,bz]=L.booth;
        parts.push(box(cx+bx,y,cz+bz,2.4,2.8,2.4,brownM),box(cx+bx,y+2.8,cz+bz,3.4,0.3,3.4,kerbM),box(cx+bx,y+1.4,cz+bz+1.21,1.6,0.9,0.05,litM));
        const s=signBoard(THREE,[L.title||'PARKING','$3 per day · Pay at booth'],{w:5,h:2,lit:false});
        s.position.set(cx+bx+4,y+2.4,cz+bz);s.rotation.y=faceTowards(cx+bx+4,cz+bz,cx+bx+4,cz+bz+10);parts.push(s,box(cx+bx+4,y,cz+bz,0.2,1.4,0.2,poleM));}
      parts.push(mergeParts(kerbs,kerbM),mergeParts(mulch,mulchM));
      if(poles.length)parts.push(mergeParts(poles,poleM),mergeParts(heads,lampM));
      if(trees.trunk.length)parts.push(mergeParts(trees.trunk,trunkM));
      if(trees.leaf.length)parts.push(mergeParts(trees.leaf,shrubM));
      return group(L,parts);},

    visitorcenter(L){
      const P=[],trees={trunk:[],leaf:[]},K=[];
      const at=(x,z)=>gh(x,z)+0.2;
      const plazaY=at(-395,212);
      // the plaza between the wings: paved, with a pale border
      const pv=new THREE.Mesh(new THREE.BoxGeometry(84,0.3,27),new THREE.MeshLambertMaterial({color:0xb4a892}));pv.position.set(-395,plazaY-0.1,211.5);P.push(pv);
      for(let x=-432;x<=-358;x+=6)K.push(box(x,plazaY+0.06,211.5,0.15,0.02,26,kerbM));
      // the entrance canopy on the main building's south face, and what it says
      const cy=plazaY;
      K.push(box(-395,cy+5,203,52,0.6,11,kerbM));
      for(const x of [-418,-404,-386,-372])K.push(box(x,cy,207.8,0.6,5,0.6,brownM));
      const fascia=signBoard(THREE,['UPPER VISITOR CENTER','Mystery Flesh Pit National Park'],{w:30,h:2.4,lit:true});
      fascia.position.set(-395,cy+6.6,208.6);P.push(fascia);
      P.push(box(-395,cy,197.4,20,3.2,0.3,glassM),box(-395,cy+3.2,197.4,20,0.3,0.4,brownM));   // the doors
      for(let k=0;k<4;k++)P.push(box(-404+k*6,cy+0.1,197.7,0.08,3,0.1,brownM));
      // the flags: three poles by the walk in
      for(const [x,col] of [[-430,0xb8322a],[-426,0x2a3a7a],[-422,0xd8d0c0]]){
        K.push(box(x,cy,222,0.2,12,0.2,poleM));
        const f=new THREE.Mesh(new THREE.PlaneGeometry(2.6,1.6),new THREE.MeshLambertMaterial({color:col,side:THREE.DoubleSide}));
        f.position.set(x+1.3,cy+11,222);P.push(f);animHooks.push(now=>{f.rotation.y=0.25*Math.sin(now*0.002+x);});}
      // planters and benches down the middle, a tree in each planter
      for(const x of [-420,-395,-370]){
        K.push(box(x,cy,214,7,0.8,3,kerbM));K.push(box(x,cy+0.6,214,6.4,0.3,2.4,mulchM));tree(x,cy+0.8,214,1.1,trees);
        for(const sd of [-1,1]){K.push(box(x,cy,214+sd*3.2,4,0.45,0.6,brownM),box(x,cy+0.45,214+sd*3.5,4,0.6,0.12,brownM));}
      }
      // the map board, the drinking fountain, bins
      {const b=signBoard(THREE,['YOU ARE HERE','Rim Trail · Lifts · Amphitheatre · Monorail'],{w:4,h:2.4,lit:false});
       b.position.set(-440,cy+2.2,215);b.rotation.y=faceTowards(-440,215,-395,215);P.push(b,box(-440,cy,215,0.2,1.2,0.2,poleM));}
      K.push(box(-360,cy,221,0.6,1,0.6,concM));
      for(const x of [-432,-410,-380,-358])K.push(box(x,cy,219,0.6,0.9,0.6,new THREE.MeshLambertMaterial({color:0x3e4a3a})));
      // the gift shop's windows on the west wing's face, and the ticket windows on the east wing's
      const shop=(x,z,face,lines,colour)=>{
        for(let k=-1;k<=1;k++){const w=box(x,cy+0.5,z+k*9,0.3,2.6,7,litM);P.push(w);}
        const aw=new THREE.Mesh(new THREE.BoxGeometry(2.4,0.25,26),new THREE.MeshLambertMaterial({color:colour}));
        aw.position.set(x+face*1.2,cy+3.7,z);aw.rotation.z=-face*0.3;P.push(aw);
        const s=signBoard(THREE,lines,{w:10,h:1.6,lit:true});s.position.set(x+face*0.25,cy+5,z);s.rotation.y=face>0?Math.PI/2:-Math.PI/2;P.push(s);
      };
      shop(-437.6,212,1,['GIFT SHOP','Books · Film · Postcards · Caver Coop'],0x8a2a24);
      shop(-352.4,212,-1,['TICKETS  ·  THROAT TOURS','Lifts every 5 min · Tour $30'],0x2a4a6a);
      // café tables by the ticket windows, under umbrellas
      for(let k=0;k<5;k++){const x=-372+(k%3)*6,z=204+Math.floor(k/3)*7;
        K.push(box(x,cy,z,1.2,0.75,1.2,kerbM),box(x,cy,z,0.1,2.6,0.1,poleM));
        const u=new THREE.Mesh(new THREE.ConeGeometry(1.6,0.7,8),new THREE.MeshLambertMaterial({color:k%2?0xd8b040:0xe8e0cc}));u.position.set(x,cy+2.8,z);P.push(u);}
      // the lettering over the lobby, on the rim side, and the terrace out in front of it with coin telescopes
      const ly=at(-395,140);
      {const s=signBoard(THREE,['MYSTERY FLESH PIT NATIONAL PARK',''],{w:40,h:2.6,lit:true});
       s.position.set(-395,ly+10.5,145.9);s.rotation.y=Math.PI;P.push(s);
       P.push(box(-395,ly+1,145.8,40,5,0.3,glassM));}
      K.push(box(-395,ly,138,60,0.4,14,kerbM));
      for(let x=-424;x<=-366;x+=2)K.push(box(x,ly+0.4,131.2,0.12,1.1,0.12,poleM));
      K.push(box(-395,ly+1.45,131.2,60,0.1,0.1,poleM));
      for(const x of [-415,-400,-385,-372]){K.push(box(x,ly+0.4,133,0.2,1.1,0.2,poleM));
        const scope=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.24,0.9,8).rotateX(Math.PI/2-0.4),new THREE.MeshLambertMaterial({color:0x3a6a5a}));
        scope.position.set(x,ly+1.7,132.8);P.push(scope);}
      // the park store's awning and name, and the ranger station's
      {const y2=at(-300,162);const aw=box(-300,y2+3.2,162,36,0.25,3,new THREE.MeshLambertMaterial({color:0x2e4a36}));P.push(aw);
       const s=signBoard(THREE,['PARK STORE','Groceries · Ice · Film · Firewood'],{w:14,h:1.8,lit:true});s.position.set(-300,y2+4.6,161.3);P.push(s);
       P.push(box(-300,y2+0.4,161.2,30,2.4,0.2,litM));}
      {const y3=at(-520,178);const s=signBoard(THREE,['RANGER STATION','Information · Permits · First aid'],{w:10,h:1.8,lit:true});
       s.position.set(-520,y3+4,177.3);P.push(s,box(-520,y3,177.2,4,2.8,0.2,glassM));K.push(box(-508,y3,184,0.2,10,0.2,poleM));}
      // windows round the main building and the wings, lit at night
      const win=[];
      for(let x=-450;x<=-340;x+=6){win.push(box(x,at(x,162)+5.2,162.8,4.4,1.6,0.3,litM));}
      for(const [x0,x1] of [[-470,-440],[-350,-320]])for(let x=x0+3;x<=x1-3;x+=5)win.push(box(x,at(x,228)+3,228.3,3.4,1.4,0.3,litM));
      P.push(mergeParts(win,litM),mergeParts(K.filter(m=>m.material===kerbM),kerbM),mergeParts(K.filter(m=>m.material===brownM),brownM),
        mergeParts(K.filter(m=>m.material===poleM),poleM),mergeParts(K.filter(m=>m.material===mulchM),mulchM));
      for(const m of K)if(![kerbM,brownM,poleM,mulchM].includes(m.material))P.push(m);
      P.push(mergeParts(trees.trunk,trunkM),mergeParts(trees.leaf,shrubM));
      return group(L,P);},
  };
}
