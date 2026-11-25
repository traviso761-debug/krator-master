// The kipuka's five flows frozen by core/terrain's lava-flow module, baked once (build.py --station kipuka runs it when its inputs change; node only):
//   node bake-flows.js <out.json> <hash>
// It reads core/rand, the biome core's head (BIO.fn: the noise the land is made of), core/terrain's lava (KLAVA), the kit's flow history
// (src/46: each flow's path down the fall line, exactly as the page runs it) and the kipuka's FLOWS-INPUT block (45: the land, the hills) and
// FLOWS-SRC block (47: the flows). A flow of the windward flank is tube-fed: it advances by BREAKOUTS from the front of its tube, so each flow
// is baked as breakouts along its own path every BREAK m, oldest flow first, each in a box of its own on one shared 20 m lattice, over the ground
// the earlier ones left (the hills part the lobes; a young flow rides on an old one). Volume: the kit's sheet's (length x mean width x mean
// thickness, x .8). Writes {format, hash, x0, z0, cell, nx, nz, dh (base64 Uint16 cm), top (base64 Uint8: 1 + the flow's index in FLOW_SRC
// that froze last over a cell where it laid .35 m or more), flows: [{key, volume, frozen, lost, breakouts, ms}], ms}. Deterministic
// (KRAND, BIO.fn's seeded stream, no Math.random): the same inputs give the same bytes.
const fs=require('fs'),path=require('path'),vm=require('vm');
const HERE=__dirname,ROOT=path.join(HERE,'..','..','..','..'),out=process.argv[2],hash=process.argv[3]||'';
const read=p=>fs.readFileSync(p,'utf8');
const block=(f,a,b)=>{const t=read(path.join(HERE,f)),i=t.indexOf(a),j=t.indexOf(b);if(i<0||j<0)throw new Error('bake-flows: no '+a+' block in '+f);return t.slice(t.indexOf('\n',i)+1,j);};
globalThis.window=globalThis;
for(const f of ['core/rand/08-core-rand.js','core/biome/10-core-head.js','core/terrain/46-core-lava.js','biomes/throne/src/46-biome-throne-flows.js'])vm.runInThisContext(read(path.join(ROOT,f)),{filename:f});
vm.runInThisContext(`const {TAU,clamp,lerp,mix,smooth,reseed,rng,rr,ri,pick,fbm}=BIO.fn;
 ${block('45-host-stage.js','/*FLOWS-INPUT-BEGIN','/*FLOWS-INPUT-END*/')}
 ${block('47-host-land.js','/*FLOWS-SRC-BEGIN','/*FLOWS-SRC-END*/')}
 function landH0(x,z){return slopeH(x,z)+hillH(x,z);}
 globalThis.__in={TERR,FLOW_SRC,landH0};`,{filename:'kipuka FLOWS-INPUT'});
const {TERR,FLOW_SRC,landH0}=globalThis.__in,R=TERR.R+260,CELL=20,BREAK=480,Q=120,T=1420;
/* the kit's paths, exactly as the page's THRONE_KLAVA_FLOWS runs them (shared/46k: the sheets of thickness 0) */
const FL=THRONE.flowHistory({R,cell:8,baseH:landH0,old:THRONE.OLD,flows:FLOW_SRC.map(F=>Object.assign({},F,{th:[0,0]}))});
/* the shared lattice: the bake's boxes are cut from it, so their points are its points */
const X0=-R,Z0=-R,NX=Math.floor(2*R/CELL)+1,NZ=NX,acc=new Float32Array(NX*NZ),top=new Uint8Array(NX*NZ);
const accAt=(x,z)=>{const u=Math.min(NX-1.001,Math.max(0,(x-X0)/CELL)),v=Math.min(NZ-1.001,Math.max(0,(z-Z0)/CELL)),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j,k=j*NX+i;
 return acc[k]*(1-fu)*(1-fv)+acc[k+1]*fu*(1-fv)+acc[k+NX]*(1-fu)*fv+acc[k+NX+1]*fu*fv;};
const ground=(x,z)=>landH0(x,z)+accAt(x,z);
const snap=v=>X0+Math.round((v-X0)/CELL)*CELL,t0=Date.now(),rec=[];
const order=FLOW_SRC.map((F,n)=>n).sort((a,b)=>FLOW_SRC[b].age-FLOW_SRC[a].age);
for(const n of order){const S=FLOW_SRC[n],F=FL.flows.find(f=>f.key===S.key),P=F.path,t1=Date.now();
 const V=S.len*(S.w[0]+S.w[1])/2*(S.th[0]+S.th[1])/2*.8;
 /* the breakouts: along the path, every BREAK m from 100 m in, on the map */
 const B=[];let s=0,next=100;for(let k=1;k<P.length;k++){s+=Math.hypot(P[k].x-P[k-1].x,P[k].z-P[k-1].z);if(s>=next){next+=BREAK;if(Math.abs(P[k].x)<R-160&&Math.abs(P[k].z)<R-160)B.push(k);}}
 let vol=0,fr=0,lost=0;
 B.forEach((k,b)=>{const p=P[k],q=P[Math.min(P.length-1,k+20)],dx=q.x-p.x,dz=q.z-p.z,dl=Math.hypot(dx,dz)||1,cx=p.x+dx/dl*260,cz=p.z+dz/dl*260;
  const box=[Math.max(X0,snap(cx-700)),Math.max(Z0,snap(cz-700)),Math.min(X0+(NX-1)*CELL,snap(cx+700)),Math.min(Z0+(NZ-1)*CELL,snap(cz+700))];
  const r=KLAVA.bake({h:ground,box,cell:CELL,seed:KRAND.hash(571,n,b),rough:.4,dtMin:600,dtMax:600,vStop:.02,edge:'drain',
   eruptions:[{x:p.x,z:p.z,r:25,Q,duration:V/B.length/Q,T}]});
  const ia=Math.round((box[0]-X0)/CELL),ja=Math.round((box[1]-Z0)/CELL);
  for(let j=0;j<r.nz;j++)for(let i=0;i<r.nx;i++){const d=r.dh[j*r.nx+i];if(!(d>0))continue;const K=(ja+j)*NX+(ia+i);acc[K]+=d;if(d>.35)top[K]=n+1;}
  const e=r.eruptions[0];vol+=e.volume;fr+=e.frozen;lost+=e.lost;});
 rec[n]={key:S.key,volume:Math.round(vol),frozen:Math.round(fr),lost:Math.round(lost),breakouts:B.length,ms:Date.now()-t1};}
const u16=new Uint16Array(acc.length);for(let k=0;k<u16.length;k++)u16[k]=Math.max(0,Math.min(65535,Math.round(acc[k]*100)));
const b64=u=>Buffer.from(u.buffer,u.byteOffset,u.byteLength).toString('base64');
fs.writeFileSync(out,JSON.stringify({format:'throne-kipuka-flows',hash,x0:X0,z0:Z0,cell:CELL,nx:NX,nz:NZ,ms:Date.now()-t0,flows:rec,dh:b64(u16),top:b64(top)})+'\n');
console.log('bake-flows: '+rec.map(r=>r.key+' '+(r.frozen/1e6).toFixed(1)+' Mm3 ('+r.breakouts+' breakouts, '+(r.lost/1e6).toFixed(2)+' lost)').join('; ')+' in '+(Date.now()-t0)+' ms -> '+out);
