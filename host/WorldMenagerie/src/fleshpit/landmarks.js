// ---------- the park's own landmarks ----------
// Almost everything on the surface is a mapped building and the engine draws it. These are the things that
// are not buildings, and they are what make the surface read as this place rather than any installation in
// the desert: the lip of the orifice itself, which is a hole, and a hole cannot be clicked on; the oil field
// the pit was found in, still nodding; Anodyne's billboards on the park road; the park's entrance sign; and
// the mascot the company drew to sell a hole in the ground to families with small children.
//
// Fan work: Mystery Flesh Pit National Park is Trevor Roberts's project. The geometry, the lettering and the
// mascot's drawing here are this project's own; nothing of his, and nothing of the Park Service's, is copied.
import { mkRng } from '../core/rng.js';
import { signBoard, signTexture, faceTowards } from './signs.js';

export function landmarks(api){
  const {THREE,box,group,gh,animHooks,nightF,hour,ROADS,mergeParts}=api;
  const R=mkRng(1981);
  const roadPts=name=>{const r=(ROADS||[]).find(q=>q.name===name);return r?r.pts:null;};
  // ---- the lining of the funnel ----
  // One surface laid over the ground from the edge of the apron down to where the shaft takes over, coloured by
  // how far down it is: the Park Service's paved apron, poured in slabs; then the lip, where the caliche is
  // stained and starting to give; then the animal, with the veins running down into the dark. It sits a little
  // above the terrain and faces up only, so from outside and below - the section view - it is not there.
  function lining(x,z,RR){
    const C=api.C,MOUTH=(C.groundHole&&C.groundHole.r||96)-1,OUT=RR+90,LIP=MOUTH+(RR-MOUTH)*0.42,SEG=160;
    const cA=new THREE.Color('#b3a68c'),cS=new THREE.Color('#9a7466'),cF=new THREE.Color('#8a4c50'),cD=new THREE.Color('#5d2f36');
    const pos=[],col=[],idx=[],rows=[];const c=new THREE.Color();
    const radii=[];for(let r=OUT;r>MOUTH;r-=r>RR?6:3)radii.push(r);radii.push(MOUTH);
    for(const r of radii){
      const row=[];
      for(let k=0;k<SEG;k++){
        const a=k/SEG*Math.PI*2,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;
        row.push(pos.length/3);pos.push(px,gh(px,pz)+0.25,pz);
        if(r>=RR){                                                    // the apron: slabs, and their joints
          const joint=(Math.abs(Math.sin(a*48))<0.05||Math.abs(Math.sin(r*0.35))<0.06)?0.86:1;
          c.copy(cA).multiplyScalar(joint*(0.96+0.04*Math.sin(a*7+r*0.1)));
        }else if(r>=LIP){                                             // the lip: stained, streaked downhill
          const u=(RR-r)/(RR-LIP),streak=0.5+0.5*Math.sin(a*37+Math.sin(a*5)*3);
          c.copy(cA).lerp(cS,Math.min(1,u*1.4)).lerp(cF,Math.max(0,u-0.55)*streak*1.4);
        }else{                                                        // the animal: veins, darkening into the throat
          const u=(LIP-r)/(LIP-MOUTH),vein=Math.pow(Math.max(0,Math.cos(a*22+Math.sin(r*0.04)*1.6)),6);
          c.copy(cF).lerp(cD,u*0.8).multiplyScalar(0.92+0.35*vein);
        }
        col.push(c.r,c.g,c.b);
      }
      rows.push(row);
    }
    for(let i=0;i+1<rows.length;i++)for(let k=0;k<SEG;k++){
      const a=rows[i][k],b=rows[i][(k+1)%SEG],d=rows[i+1][k],e=rows[i+1][(k+1)%SEG];
      idx.push(a,e,b,a,d,e);             // wound to face up
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));
    g.setIndex(idx);g.computeVertexNormals();
    const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    m.receiveShadow=true;
    return m;
  }
  return {
    orifice(L,x,z){
      const RR=L.rim||266,parts=[];
      const rail=new THREE.MeshLambertMaterial({color:0xb9b2a2}),post=new THREE.MeshLambertMaterial({color:0x6a5040});
      const lamp=new THREE.MeshBasicMaterial({color:0xffd9a0});
      // the rail: posts and two runs of pipe the whole way round the lip
      const rails=[];
      for(let k=0;k<96;k++){
        const a=k/96*Math.PI*2,px=x+Math.cos(a)*RR,pz=z+Math.sin(a)*RR,gy=gh(px,pz);
        rails.push(box(px,gy,pz,0.5,1.25,0.5,rail));
        if(k%2===0){const s=box(px,gy+1.15,pz,0.35,0.16,RR*2*Math.PI/96*1.1,rail);s.rotation.y=-a;rails.push(s);}
      }
      parts.push(mergeParts(rails,rail));
      parts.push(lining(x,z,RR));
      // the interpretive signs at the three overlooks, lettered, and the lamps over them
      const SAY=[['THE ORIFICE','520 m across · the collar is 146 m down'],['EVERYTHING YOU CAN SEE IS ALIVE','Please stay behind the rail'],
        ['DO NOT THROW OBJECTS INTO THE PIT','It will throw them back']];
      [0.35,2.5,4.4].forEach((a,i)=>{
        const px=x+Math.cos(a)*(RR+9),pz=z+Math.sin(a)*(RR+9),gy=gh(px,pz);
        const panel=signBoard(THREE,SAY[i],{w:3.2,h:1.6,lit:false});
        panel.position.set(px,gy+1.5,pz);panel.rotation.order='YXZ';panel.rotation.y=faceTowards(px,pz,x+Math.cos(a)*(RR+30),z+Math.sin(a)*(RR+30));panel.rotation.x=-0.45;
        parts.push(panel,box(px,gy,pz,0.3,1.1,0.3,post));
        parts.push(box(px,gy+3.4,pz,0.5,0.4,0.5,lamp),box(px,gy,pz,0.24,3.4,0.24,post));
      });
      const g=group(L,parts);
      animHooks.push(()=>{const n=nightF(hour());lamp.color.setRGB(n,n*0.85,n*0.62);});
      return g;},

    // ---- the oil field ----
    // Pumpjacks across the plain, each nodding on its own crank. A skid, the samson post, the walking beam with
    // the horse head on one end and the pitman arms on the other, and the crank with its counterweights.
    pumpjacks(L,x0,z0){
      const n=L.count||40,parts=[],jacks=[];
      const bodyM=new THREE.MeshLambertMaterial({color:0x6f6a5a}),headM=new THREE.MeshLambertMaterial({color:0x3d3a34});
      const weightM=new THREE.MeshLambertMaterial({color:0x8a3a2a}),padM=new THREE.MeshLambertMaterial({color:0xa89878});
      const avoid=[[x0,z0,780],[980,-880,560],[-1180,760,330],[-2760,240,200],[-395,250,300]];
      let tries=0;
      while(jacks.length<n&&tries++<2000){
        const x=x0+(R()-0.5)*5600,z=z0+(R()-0.5)*5600;
        if(avoid.some(([ax,az,ar])=>Math.hypot(x-ax,z-az)<ar))continue;
        if(jacks.some(j=>Math.hypot(j.x-x,j.z-z)<120))continue;
        const y=gh(x,z),a=R()*Math.PI*2;
        const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=a;
        const st=[];
        st.push(new THREE.Mesh(new THREE.BoxGeometry(14,0.3,9).translate(0,0.15,0),padM));   // the caliche pad
        st.push(new THREE.Mesh(new THREE.BoxGeometry(10,0.7,2.4).translate(0,0.5,0),bodyM));
        for(const sd of [-1,1]){const leg=new THREE.Mesh(new THREE.BoxGeometry(0.4,6.6,0.4).translate(0,3.3,0),bodyM);
          leg.position.set(0.2,0.8,sd*1.0);leg.rotation.x=-sd*0.14;st.push(leg);}
        st.push(new THREE.Mesh(new THREE.BoxGeometry(1.4,1.2,1.4).translate(-4.4,1.4,0),bodyM));   // the gearbox
        st.push(new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,2.2,5).translate(5,1.1,0),headM));   // the wellhead
        g.add(mergeParts(st,bodyM));
        const beam=new THREE.Group();beam.position.set(0.2,7.1,0);
        beam.add(new THREE.Mesh(new THREE.BoxGeometry(10,0.6,0.5),bodyM));
        const head=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,0.7,12,1,false,-0.9,1.8).rotateX(Math.PI/2),headM);head.position.set(4.6,-0.6,0);beam.add(head);
        const pit=new THREE.Mesh(new THREE.BoxGeometry(0.3,5,0.3).translate(0,-2.5,0),headM);pit.position.set(-4.6,0,0);beam.add(pit);
        const rod=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,6,4).translate(0,-3,0),headM);rod.position.set(6.6,-0.6,0);beam.add(rod);
        g.add(beam);
        const crank=new THREE.Group();crank.position.set(-4.4,2.0,0);
        for(const sd of [-1,1]){const w=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.1,0.35).translate(-0.9,0,0),weightM);w.position.z=sd*0.9;crank.add(w);}
        g.add(crank);
        parts.push(g);jacks.push({x,z,beam,crank,ph:R()*6.28,w:0.9+R()*0.6});
      }
      const gp=group(L,parts);
      animHooks.push(now=>{const t=now/1000;for(const j of jacks){const u=t*j.w+j.ph;j.beam.rotation.z=0.24*Math.sin(u);j.crank.rotation.z=-u;}});
      return gp;},

    // ---- the billboards on the park road ----
    // A board on two legs with a catwalk and three lamps, angled towards traffic coming in from Gumption,
    // alternating sides of the road. What they say is in the data.
    billboards(L){
      const pts=roadPts('Park Road');if(!pts)return null;
      const boards=L.boards||[],parts=[],legM=new THREE.MeshLambertMaterial({color:0x5a5048});
      const lampM=new THREE.MeshBasicMaterial({color:0xfff0c8});
      // walk the road from the gate end, and put a board every so often
      let acc=0,next=380,i=0;
      for(let k=0;k+1<pts.length&&i<boards.length;k++){
        const [ax,az]=pts[k],[bx,bz]=pts[k+1],len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len;
        while(acc+len>=next&&i<boards.length){
          const s=next-acc,sd=i%2?1:-1,off=38;
          const x=ax+ux*s-uz*off*sd,z=az+uz*s+ux*off*sd,y=gh(x,z);
          const [t1,t2,bg,fg]=boards[i];
          const tex=billboardTexture(THREE,t1,t2,bg,fg);
          const face=new THREE.Mesh(new THREE.PlaneGeometry(14,5),new THREE.MeshLambertMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:0.0}));
          const back=new THREE.Mesh(new THREE.BoxGeometry(14.4,5.4,0.3),legM);
          const g=new THREE.Group();g.position.set(x,y,z);
          // face back down the road, towards the traffic, turned a little in towards it
          g.rotation.y=faceTowards(x,z,x-ux*100+uz*30*sd,z-uz*100-ux*30*sd);
          back.position.y=7.5;face.position.set(0,7.5,0.17);g.add(back,face);
          for(const lx of [-5,-1.5,2,5.5]){const l=new THREE.Mesh(new THREE.BoxGeometry(1,0.3,0.6),lampM);l.position.set(lx-0.25,10.4,0.8);g.add(l);}
          for(const lx of [-4.5,4.5])g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5,5.2,0.5).translate(lx,2.6,0),legM));
          g.add(new THREE.Mesh(new THREE.BoxGeometry(14,0.2,1.2).translate(0,4.9,0.6),legM));
          g.userData.face=face.material;parts.push(g);i++;next+=320;
        }
        acc+=len;
      }
      const gp=group(L,parts);
      animHooks.push(()=>{const n=nightF(hour());lampM.color.setRGB(0.3+0.7*n,0.3+0.66*n,0.3+0.5*n);
        for(const g of parts)g.userData.face.emissiveIntensity=0.55*n;});
      return gp;},

    // ---- the park entrance sign ----
    // Built as a group standing at the origin and then turned to face the road in, so the piers stay either
    // side of the board whichever way that is.
    entrance(L,x,z){
      const stoneM=new THREE.MeshLambertMaterial({color:0x9a8a72}),g=new THREE.Group();
      g.add(box(0,0,0,11,1.4,2.2,stoneM));
      for(const sd of [-1,1])g.add(box(sd*5,0,0,1.6,3.8,2.2,stoneM));
      const b=signBoard(THREE,['MYSTERY FLESH PIT','NATIONAL PARK'],{w:8.4,h:2.6,lit:false,depth:0.4});
      b.position.set(0,2.6,0);g.add(b);
      g.position.set(x,gh(x,z),z);g.rotation.y=faceTowards(x,z,x-200,z+20);
      return group(L,[g]);},

    // ---- Caver Coop ----
    // A painted plywood cut-out by the entrance station: the mascot in his hard hat, holding the rail, and
    // what he says in a bubble over his head. The drawing is done here on canvas, in this project's own hand.
    mascot(L,x,z){
      const g=new THREE.Group(),legM=new THREE.MeshLambertMaterial({color:0x6a5040});
      const cut=new THREE.Mesh(new THREE.PlaneGeometry(3.2,6.4),new THREE.MeshLambertMaterial({map:mascotTexture(THREE),alphaTest:0.5,side:THREE.DoubleSide}));
      cut.position.set(0,3.3,0);
      const bubble=signBoard(THREE,['HOLD THE RAIL!','— Caver Coop'],{w:4.2,h:1.8,lit:false,style:'warn'});
      bubble.position.set(2.2,6.9,-0.1);
      g.add(cut,bubble,box(0,0,-0.2,0.2,1.2,0.2,legM),box(2.2,0,-0.25,0.2,6,0.2,legM));
      g.position.set(x,gh(x,z),z);g.rotation.y=faceTowards(x,z,x-100,z-30);
      return group(L,[g]);},
  };
}

// A billboard face: a big line and a smaller one, on a flat colour, with a border. The hand of a 1970s sign
// painter is out of reach; the size and the loudness are not.
function billboardTexture(THREE,a,b,bg,fg){
  const c=document.createElement('canvas');c.width=1024;c.height=366;const g=c.getContext('2d');
  g.fillStyle=bg;g.fillRect(0,0,1024,366);
  g.fillStyle=fg;g.fillRect(0,0,1024,14);g.fillRect(0,352,1024,14);
  g.textAlign='center';g.textBaseline='middle';g.fillStyle=fg;
  let s=120;g.font=`900 ${s}px Impact, 'Arial Black', sans-serif`;while(g.measureText(a).width>940&&s>30){s-=4;g.font=`900 ${s}px Impact, 'Arial Black', sans-serif`;}
  g.fillText(a,512,b?150:183);
  if(b){let s2=56;g.font=`bold ${s2}px 'Helvetica Neue', Arial, sans-serif`;while(g.measureText(b).width>900&&s2>20){s2-=2;g.font=`bold ${s2}px 'Helvetica Neue', Arial, sans-serif`;}g.fillText(b,512,270);}
  for(let k=0;k<120;k++){g.fillStyle=`rgba(255,250,235,${(0.02+(k%7)*0.012).toFixed(3)})`;g.fillRect((k*397)%1024,(k*211)%366,20+(k%11)*9,3+(k%4)*2);}
  const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t;
}

// Caver Coop: round face, big grin, a yellow hard hat with a lamp on it, a ranger-brown shirt, one hand on a
// rail and the other giving a thumbs-up. Drawn with the canvas's own circles and rectangles.
function mascotTexture(THREE){
  const c=document.createElement('canvas');c.width=256;c.height=512;const g=c.getContext('2d');
  const ink='#2a1c14';g.lineWidth=5;g.strokeStyle=ink;g.lineJoin='round';
  const shape=(fill,fn)=>{g.beginPath();fn();g.fillStyle=fill;g.fill();g.stroke();};
  // legs and boots
  shape('#4a5a6a',()=>{g.rect(86,360,34,110);g.rect(136,360,34,110);});
  shape('#3a2a1e',()=>{g.rect(76,460,50,30);g.rect(130,460,50,30);});
  // the shirt, the belt, and the rail he is holding
  shape('#8a6a44',()=>{g.moveTo(70,230);g.lineTo(186,230);g.lineTo(196,370);g.lineTo(60,370);g.closePath();});
  shape('#3a2a1e',()=>{g.rect(64,350,128,16);});
  shape('#b9b2a2',()=>{g.rect(0,300,70,12);g.rect(20,300,10,120);});
  // the arms: one to the rail, one up with the thumb
  shape('#8a6a44',()=>{g.moveTo(72,240);g.lineTo(40,300);g.lineTo(58,312);g.lineTo(90,262);g.closePath();});
  shape('#8a6a44',()=>{g.moveTo(184,240);g.lineTo(222,200);g.lineTo(236,214);g.lineTo(198,268);g.closePath();});
  shape('#f0c8a0',()=>{g.arc(48,306,13,0,7);});
  shape('#f0c8a0',()=>{g.arc(230,196,15,0,7);});
  shape('#f0c8a0',()=>{g.rect(224,160,12,30);});
  // the badge
  shape('#d9b040',()=>{g.moveTo(150,262);g.lineTo(162,262);g.lineTo(168,276);g.lineTo(156,290);g.lineTo(144,276);g.closePath();});
  // the head
  shape('#f0c8a0',()=>{g.arc(128,170,62,0,7);});
  // the eyes and the grin
  g.fillStyle=ink;g.beginPath();g.arc(106,160,7,0,7);g.arc(150,160,7,0,7);g.fill();
  g.beginPath();g.arc(128,182,30,0.15*Math.PI,0.85*Math.PI);g.stroke();
  shape('#ffffff',()=>{g.moveTo(104,196);g.quadraticCurveTo(128,214,152,196);g.closePath();});
  shape('#e89a8a',()=>{g.arc(92,186,8,0,7);g.arc(164,186,8,0,7);});
  // the hard hat, its brim, and the lamp
  shape('#e8b82a',()=>{g.arc(128,128,66,Math.PI,0);g.closePath();});
  shape('#e8b82a',()=>{g.rect(52,122,152,14);});
  shape('#dcdcdc',()=>{g.arc(128,92,14,0,7);});
  shape('#fff6c0',()=>{g.arc(128,92,8,0,7);});
  const t=new THREE.CanvasTexture(c);return t;
}
