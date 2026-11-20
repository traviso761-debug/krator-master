// Silo 18: the people. About ten thousand live here, seventy-odd a level on average: every level has its count
// (its own, from what kind of level it is, give or take), and the readout gives it. Only the levels near the camera are
// drawn, and only the people out where you would see them: knots of neighbours talking on the walkway, someone in each
// doorway, people sat on the benches, children running the curve, people carrying things, people at home behind the
// windows, a queue at the washroom and at the kitchen's hatch, traders and buyers in the bazaar, hands in the farms,
// crews at the machines down deep. How many are out depends on the clock: the walkways fill at the change of shift,
// morning and evening, and empty at night, when more are indoors. All anonymous: one figure, tinted, seated or standing.
import {LH,RS,RW,RO,NL,yL,levelAt,kindOf,zoneOf,WATERV} from './levels.js';
import {personGeo} from './life.js';

const TAU=Math.PI*2;
const mkR=seed=>{let s=(seed*2654435761>>>0)%2147483647||1;return()=>((s=(s*16807)%2147483647)/2147483647);};
// how many live and work on a level of each kind (before the level's own give or take)
const BASE={home:82,commons:94,bazaar:124,farm:44,it:24,office:34,top:150,supply:46,water:28,cast:34,mech:38,hall:30};
export const residentsOn=n=>{if(n<1||n>NL)return 0;const k=kindOf(n),h=(n*2654435761>>>0)%1000/1000;return Math.round((BASE[k]||60)*(0.72+h*0.56));};
export const totalResidents=(()=>{let s=0;for(let n=1;n<=NL;n++)s+=residentsOn(n);return s;})();
// how much of the silo is out and about, by the hour: busiest at the change of shift
export const activity=h=>h<5||h>=23?0.12:h<6?0.4:h<8.5?1:h<17?0.7:h<19.5?1:0.55;

export function buildCrowd(THREE,K,M){
  const {clip,turn}=M,CAP=1500,SCAP=420,PCAP=220;
  const mat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide,clippingPlanes:clip});
  const stand=new THREE.InstancedMesh(personGeo(K),mat,CAP),sit=new THREE.InstancedMesh(personGeo(K,{seated:true,lap:true}),mat,SCAP);
  const packs=new THREE.InstancedMesh(new THREE.BoxGeometry(0.5,0.45,0.4),new THREE.MeshLambertMaterial({color:'#8a6a4a',clippingPlanes:clip}),PCAP);
  // (three r128 sizes instanceColor by the mesh's count when it is first set: make it at full size, then empty the mesh)
  for(const m of [stand,sit]){const w=new THREE.Color(1,1,1);for(let i=0;i<m.count;i++)m.setColorAt(i,w);}
  for(const m of [stand,sit,packs]){m.frustumCulled=false;m.count=0;}
  const o=new THREE.Object3D(),c=new THREE.Color();
  const CLOTH={top:['#c8c4b8','#8a96a0','#a89070','#6e7a84','#8a6a5a','#b0a890'],mid:['#6f8a5a','#8a9a6a','#a89a6a','#5e7a5e','#8a7a5a','#6a6a5a'],
    deep:['#4a5a7a','#5a6a80','#7a6a5a','#40506a','#8a5a2a','#5a5048'],kid:['#c8643a','#3a7ac8','#d8b040','#6a9a4a','#b04a6a']};
  // ---- the people on one level, in the level's own frame (angles before the level's turn) ----
  function level(n,act){const R=mkR(n*7919+13),k=kindOf(n),z=zoneOf(n),pal=CLOTH[z]||CLOTH.mid,P=[];
    const add=(a,r,face,o2={})=>P.push(Object.assign({a,r,face,col:pal[(R()*pal.length)|0],sh:0.85+R()*0.3},o2));
    const out=x=>R()<act*x;                                       // is this one out at this hour?
    const res=k==='home'||k==='commons'||k==='bazaar'||k==='top';
    if(res){
      // knots of two to four, talking, on the walkway
      for(let g=0;g<6;g++){if(!out(0.9))continue;const a=R()*TAU,r=13.2+R()*5.8,m=2+(R()*3|0);
        for(let q=0;q<m;q++){const f=q/m*TAU+R(),ax=a+Math.cos(f)*0.55/r,rx=r+Math.sin(f)*0.55;add(ax,rx,Math.atan2(Math.sin(a)*r-Math.sin(ax)*rx,Math.cos(a)*r-Math.cos(ax)*rx));}}
      // someone in a doorway, looking out; a few sat on the benches; people carrying things along the walkway
      const rooms=k==='commons'?12:36;
      for(let i=0;i<rooms;i++){if(R()<0.22*(0.5+act)){const a=(i+0.28)/rooms*TAU;add(a,RW-0.55,a+Math.PI);}}
      for(let i=0;i<8;i++){if(out(0.7)){const a=(i+0.8)/8*TAU+(R()-0.5)*0.03;add(a,20.55,a+Math.PI,{seat:true});}}
      for(let q=0;q<6;q++){if(out(0.8)){const a=R()*TAU,r=14+R()*5;add(a,r,a+(R()<0.5?1:-1)*Math.PI/2,{pack:true});}}
      // children running the curve (they move)
      for(let q=0;q<5;q++){if(out(0.8)){const a=R()*TAU,r=13.5+R()*5;add(a,r,0,{kid:true,run:(R()<0.5?1:-1)*(0.25+R()*0.3),col:CLOTH.kid[(R()*5)|0],sh:0.55+R()*0.12});}}
      // people at home behind the windows: more of them at night
      for(let i=0;i<rooms;i++){if(R()<0.35*(1.3-act)){const a=(i+0.5+(R()-0.5)*0.3)/rooms*TAU,r=RW+2.5+R()*7;add(a,r,R()*TAU,{seat:R()<0.4});}}
      if(k==='commons'){// queues: at the washroom doors and the kitchen's
        for(const i of [0,6,4,10]){const a=(i+0.28)/12*TAU;const m=Math.round(3+act*4);for(let q=0;q<m;q++){const aq=a+(q+1)*0.7/RW;add(aq,RW-1.0,a+Math.PI/2);}}
        for(let i=0;i<12;i++){const t=i%6,a=(i+0.5)/12*TAU,a0=i/12*TAU,st=TAU/12;
          if(t===2){// the schoolroom: pupils along the benches facing the chalkboard, a teacher at it (fewer out of school hours)
            const on=act>0.5&&act<0.9;for(let row=0;row<5;row++)for(let q=0;q<3;q++){const r=RW+8+q*4,aa=a0+st*(0.3+row*0.13)+0.32/r;
              for(const dr of [-1,-0.3,0.4,1.1])if(R()<(on?0.8:0.15))add(aa,r+dr,aa-Math.PI/2,{seat:true,sh:0.6+R()*0.08,col:CLOTH.kid[(R()*5)|0]});}
            if(on)add(a0+st*0.12,RW+12,a0+st*0.12+Math.PI/2);continue;}
          const m=t===4?6:t===5?5:3;for(let q=0;q<m;q++){if(R()<0.5+act*0.5)add(a+(R()-0.5)*0.12,RW+5+R()*16,R()*TAU,{seat:t===4||t===5});}}}
      if(k==='bazaar'){// traders behind their stalls, buyers in front of them, a crowd between
        for(const [r,nn] of [[18.6,26],[14.8,20]])for(let i=0;i<nn;i++){const a=(i+0.5)/nn*TAU;if(Math.abs(((a+Math.PI)%TAU)-Math.PI)<0.32)continue;
          add(a+(R()-0.5)*0.02,r+0.75,a+Math.PI);const m=Math.round(1+act*3*R());for(let q=0;q<m;q++)add(a+(R()-0.5)*1.4/r,r-1.3-R()*0.8,a+(R()-0.5)*0.8);}
        for(let q=0;q<Math.round(30*act);q++){const a=R()*TAU;add(a,16.6+R()*0.6,a+(R()<0.5?1:-1)*Math.PI/2,{pack:R()<0.3});}}
      if(k==='top'){// the queue at the kitchen's hatch, and talk at the cafeteria's door
        const K1=(50+13)*Math.PI/180;for(let q=0;q<Math.round(4+act*8);q++){const r=RW+6+q*0.8,aq=K1+1.3/r+(q%2)*0.15/r;add(aq,r,aq-Math.PI/2,{world:true});}}}
    else if(k==='farm'){for(let r=17.5;r<=46;r+=5){const m=Math.round((2+r/12)*(0.4+act));for(let q=0;q<m;q++){const a=R()*TAU;add(a,r,a+Math.PI/2*(R()<0.5?1:-1),{pack:R()<0.15});}}}
    else if(k==='office'){for(let i=0;i<12;i++)for(let d=0;d<4;d++)if(R()<0.6*act+0.1){const a=(i+0.2+d*0.2)/12*TAU;add(a,RW+13.4,a+Math.PI,{seat:true});}}
    else if(k==='it'){for(let q=0;q<Math.round(10*act+3);q++){const a=R()*TAU;add(a,RW+5+R()*18,a+Math.PI/2);}}
    else if(k!=='hall'){// the works: crews at the machines and on the walkway, some carrying
      // (on the sewage floors no one stands in the basins: the crews keep to the floor between them and outside them)
      const sew=k==='water'&&WATERV[n]===1,inBasin=(a,r)=>sew&&r>24.8&&r<35.2&&a>4*Math.PI/180&&a<170*Math.PI/180;
      for(let q=0;q<Math.round(16*act+4);q++){const a=R()*TAU,inside=R()<0.6,r=inside?RW+4+R()*22:13+R()*6;if(inBasin(a,r))continue;add(a,r,R()*TAU,{pack:R()<0.25});}}
    return P;}
  // ---- fill the instanced meshes with the levels round the camera ----
  let key='',kids=[];
  function rebuild(Lc,act){let ns=0,nsit=0,np=0;kids=[];
    for(let n=Math.max(1,Lc-5);n<=Math.min(NL-1,Lc+5);n++){const y=yL(n),tn=turn[n]||0;
      for(const p of level(n,act)){const wa=p.world?p.a:p.a-tn,x=Math.cos(wa)*p.r,z=Math.sin(wa)*p.r,face=p.world?p.face:p.face-tn;
        const sc=p.sh;o.position.set(x,y,z);o.rotation.set(0,-face,0);o.scale.set(sc,sc,sc);o.updateMatrix();
        if(p.seat){if(nsit>=SCAP)continue;sit.setMatrixAt(nsit,o.matrix);sit.setColorAt(nsit,c.set(p.col).multiplyScalar(0.8+(n%5)*0.06));nsit++;continue;}
        if(ns>=CAP)continue;stand.setMatrixAt(ns,o.matrix);stand.setColorAt(ns,c.set(p.col).multiplyScalar(0.82+((ns*7)%9)*0.04));
        if(p.kid)kids.push({i:ns,a:wa,r:p.r,y,run:p.run,sc});
        if(p.pack&&np<PCAP){o.position.set(x,y+1.62*sc,z);o.scale.set(1,1,1);o.updateMatrix();packs.setMatrixAt(np++,o.matrix);}
        ns++;}}
    stand.count=ns;sit.count=nsit;packs.count=np;for(const m of [stand,sit,packs]){m.instanceMatrix.needsUpdate=true;if(m.instanceColor)m.instanceColor.needsUpdate=true;}}
  const api={meshes:[stand,sit,packs],count:residentsOn,total:totalResidents,
    tick(camera,hour,t,dt,show){const p=camera.position,r=Math.hypot(p.x,p.z),Lc=levelAt(p.y);
      const on=show&&r<RO+90&&Lc>=1&&Lc<=NL;for(const m of api.meshes)m.visible=on;if(!on){key='';return;}
      const act=activity(hour),k=Lc+'|'+Math.round(act*20);if(k!==key){key=k;rebuild(Lc,act);}
      // the children run
      for(const q of kids){q.a+=q.run*dt/q.r*4;o.position.set(Math.cos(q.a)*q.r,q.y+Math.abs(Math.sin(t*9+q.i))*0.08,Math.sin(q.a)*q.r);o.rotation.set(0,-(q.a+Math.sign(q.run)*Math.PI/2),0);o.scale.set(q.sc,q.sc,q.sc);o.updateMatrix();stand.setMatrixAt(q.i,o.matrix);}
      if(kids.length)stand.instanceMatrix.needsUpdate=true;}};
  return api;}
