// ================================================================= NECANYONS — the layout (data: the zones on the rock)
// The host hands the kit its rock as KSTACKS records (core/terrain/37-core-stacks.js) and its floor; NECANYONS.lay reads
// them once and answers, for any point, which zone it is in (biomes/necanyons/PLAN.md section 1):
//   floor   the canyon floor, the hyperjungle's                  foot    the floor within ~45 m of a wall: talus, seeps
//   wall    within 3 m of a wall's foot, or under its face (nothing roots)
//   ledge   a bed's top out from under the wall above it (< 22 m from that wall: the hanging gardens' strip)
//   rim     within 4 m of a top's edge (the cliff rule: nothing roots)
//   bench   a mesa's or butte's top below capY                  cap     a top at or above capY: bare and dry
//   stack   the top of a spire, fin or balanced rock (dry, small)
// and the wet things on the rock: SEEP (0..1: where water comes out under a cap rock, at a wall's foot; more on the north
// faces), PAN (0..1: the sand pans on a top), POTHOLES (rain pools on the caps and stack tops, records). Every value is a
// function of the records and the point, or a KRAND hash of a body's seed: no random draws, nothing placed here.
// No THREE, no DOM ([G data]).
const NECANYONS={};
(function(){
const K=KSTACKS,KR=KRAND,clamp=(v,a,b)=>v<a?a:v>b?b:v,sm=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
const SMALL={spire:1,fin:1,balanced:1};
let L=null,G=null;

// a body's seep round its walls: patches (noise round the angle) and the north faces (-z) wetter
function seepN(B,a){const n=KR.fbm(Math.cos(a)*2.2+40,Math.sin(a)*2.2+40,1,2,B.seed+31),north=Math.max(0,-Math.sin(a));
 return clamp(sm(.47,.66,n)*.8+.4*north*sm(.38,.58,n),0,1);}
NECANYONS.seepN=seepN;

// ---------------------------------------------------------------- lay: the grid of beds and wall distances
// o: {bodies, floor:(x,z)=>y, R, capY (330: a top this high is a cap), cell (5 m), seed}
NECANYONS.lay=function(o){
 L={bodies:o.bodies,floor:o.floor,R:o.R,capY:o.capY==null?330:o.capY,seed:o.seed==null?1:o.seed};
 const C=o.cell==null?5:o.cell,N=Math.ceil((o.R*2+400)/C),X0=-o.R-200,bodies=o.bodies;
 const who=new Int32Array(N*N),foot=new Float32Array(N*N);   // who: body*64+bed+1 (0: no rock); foot: m to the nearest wall foot (cap 60)
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=X0+(i+.5)*C,z=X0+(j+.5)*C,k=j*N+i;
  const a=K.at(bodies,x,z);if(a)who[k]=bodies.indexOf(a.S)*64+a.b.k+1;
  let fd=60;for(let b=0;b<bodies.length;b++){const B=bodies[b];if(Math.abs(x-B.x)>B.R+60||Math.abs(z-B.z)>B.R+60)continue;
   const q=B.beds[0],d=Math.hypot(x-q.cx,z-q.cz)-K.footR(q,Math.atan2(z-q.cz,x-q.cx));if(d<fd)fd=d;}
  foot[k]=fd;}
 // an edge cell (a neighbour on another bed): its points are looked up exactly
 const edge=new Uint8Array(N*N);
 for(let j=1;j<N-1;j++)for(let i=1;i<N-1;i++){const k=j*N+i,w=who[k];
  for(let dj=-1;dj<=1&&!edge[k];dj++)for(let di=-1;di<=1;di++)if(who[k+dj*N+di]!==w){edge[k]=1;break;}}
 G={C,N,X0,who,foot,edge};
 NECANYONS.POTHOLES=potholes();NECANYONS.SEEPS=seepLines();
 return NECANYONS;};

// ---------------------------------------------------------------- the height of the rock
const cellOf=(x,z)=>{const i=Math.floor((x-G.X0)/G.C),j=Math.floor((z-G.X0)/G.C);return (i<0||j<0||i>=G.N||j>=G.N)?-1:j*G.N+i;};
// {B, b, top} of the rock over (x,z), or null on the floor
NECANYONS.rockAt=function(x,z){const k=cellOf(x,z);if(k<0)return null;
 if(G.edge[k]){const a=K.at(L.bodies,x,z);return a?{B:a.S,b:a.b,top:a.top,d:a.d}:null;}
 const w=G.who[k];if(!w)return null;const B=L.bodies[(w-1)>>6],b=B.beds[(w-1)&63];return {B,b,top:K.topH(b,x,z),d:null};};
NECANYONS.top=function(x,z){const r=NECANYONS.rockAt(x,z);return r?r.top:-Infinity;};
NECANYONS.footD=function(x,z){const k=cellOf(x,z);if(k<0)return 60;const C=G.C,i=Math.floor((x-G.X0)/C),j=Math.floor((z-G.X0)/C),N=G.N;
 // bilinear between the cell centres
 const u=(x-G.X0)/C-i-.5,v=(z-G.X0)/C-j-.5,i0=u<0?i-1:i,j0=v<0?j-1:j,fu=u<0?u+1:u,fv=v<0?v+1:v;
 if(i0<0||j0<0||i0>=N-1||j0>=N-1)return G.foot[k];const k0=j0*N+i0;
 return G.foot[k0]*(1-fu)*(1-fv)+G.foot[k0+1]*fu*(1-fv)+G.foot[k0+N]*(1-fu)*fv+G.foot[k0+N+1]*fu*fv;};

// ---------------------------------------------------------------- the zone of a point
// {zone, rock, top, d (to the top's edge, < 0 inside), seep, pan, dry, footD, B (the body), b (the bed), small}
NECANYONS.at=function(x,z){const r=NECANYONS.rockAt(x,z);
 if(!r){const fd=NECANYONS.footD(x,z),f=fd<60?K.foot(L.bodies,x,z):null,B=f?f.S:null;
  const seep=B?seepN(B,Math.atan2(z-B.z,x-B.x))*sm(45,2,fd):0;
  return {zone:fd<3?'wall':fd<45?'foot':'floor',rock:false,top:L.floor(x,z),d:fd,seep,pan:0,dry:0,footD:fd,B,b:null,small:false};}
 const B=r.B,b=r.b,d=r.d!=null?r.d:(Math.hypot(x-b.cx,z-b.cz)-K.footR(b,Math.atan2(z-b.cz,x-b.cx))*(1-b.ch));
 const small=!!SMALL[B.kind],pn=KR.fbm(x*.016+7,z*.016-3,b.k*.31,2,B.seed+77),pan=small?0:sm(.6,.68,pn);
 let zone=small?'stack':(r.top>=L.capY?'cap':'bench'),seep=0;
 if(d>-4)zone='rim';
 else if(!small&&b.k<B.beds.length-1){const up=B.beds[b.k+1],out=Math.hypot(x-up.cx,z-up.cz)-K.footR(up,Math.atan2(z-up.cz,x-up.cx))*(1-up.nt);
  if(out<22){zone='ledge';seep=seepN(B,Math.atan2(z-up.cz,x-up.cx))*sm(22,3,out);}}
 const dry=zone==='cap'?1:zone==='stack'?.9:zone==='bench'?.45:zone==='ledge'?.25-.2*seep:.5;
 return {zone,rock:true,top:r.top,d,seep,pan,dry,footD:0,B,b,small};};

// ---------------------------------------------------------------- the wall: a point on a bed's face, and its outward normal
// u 0 the bed's foot .. 1 its top edge; a the angle about the bed's centre
NECANYONS.wall=function(B,b,a,u){const R=K.footR(b,a)*K.prof(b,u),x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R;
 const e=.01,R1=K.footR(b,a+e)*K.prof(b,u),tx=b.cx+Math.cos(a+e)*R1-x,tz=b.cz+Math.sin(a+e)*R1-z,tl=Math.hypot(tx,tz)||1;
 return {x,y:b.y+u*b.h,z,nx:tz/tl,nz:-tx/tl};};   // the outward normal: the tangent turned (the angle runs counter-clockwise here)

// ---------------------------------------------------------------- the seep lines (data: where the hanging gardens are)
// Under each cap rock (the top bed of a mesa's or butte's tier) water comes out of the parting at its foot: the line runs
// round the bed below's top edge. Points every ~7 m with their seep strength; the kit hangs its curtains and sundews there.
function seepLines(){const out=[];
 L.bodies.forEach((B,bi)=>{if(SMALL[B.kind])return;
  B.beds.forEach((b,k)=>{const last=k===B.beds.length-1||B.beds[k+1].tier!==b.tier;if(!last||k===0)return;const q=B.beds[k-1];
   const per=2*Math.PI*Math.max(q.rx,q.rz),n=Math.max(24,Math.round(per/7));
   for(let i=0;i<n;i++){const a=i/n*2*Math.PI,s=seepN(B,a);if(s<.08)continue;const R=K.footR(q,a)*(1-q.ch)*.995;
    out.push({id:B.id+'/s'+k+'.'+i,body:bi,bed:k-1,a,x:q.cx+Math.cos(a)*R,y:q.y+q.h,z:q.cz+Math.sin(a)*R,seep:s,nx:Math.cos(a),nz:Math.sin(a)});}});});
 return out;}

// ---------------------------------------------------------------- potholes: rain pools on the caps and the stacks' tops
function potholes(){const out=[];
 L.bodies.forEach((B,bi)=>{const b=B.beds[B.beds.length-1];if(!SMALL[B.kind]&&b.y+b.h<L.capY)return;
  const area=Math.PI*b.rx*b.rz,n=Math.min(40,Math.floor(area/(SMALL[B.kind]?900:1600)));
  for(let i=0;i<n;i++){const r=KR.stream(KR.hash(B.seed,i,0xB07)),a=r.range(0,2*Math.PI),rho=.85*Math.sqrt(r.next()),R=K.footR(b,a)*(1-b.ch)*rho;
   const x=b.cx+Math.cos(a)*R,z=b.cz+Math.sin(a)*R,pr=r.range(1.2,SMALL[B.kind]?2.4:4.5),A=K.at(L.bodies,x,z);
   if(!A||A.b!==b||A.d>-(pr+4))continue;if(out.some(p=>Math.hypot(p.x-x,p.z-z)<p.r+pr+3))continue;
   out.push({id:B.id+'/p'+i,body:bi,x,z,r:pr,y:K.topH(b,x,z)+.3});}});
 return out;}
NECANYONS.potholeAt=function(x,z){const P=NECANYONS.POTHOLES;for(let i=0;i<P.length;i++){const p=P[i];if(Math.abs(x-p.x)<p.r&&Math.abs(z-p.z)<p.r&&Math.hypot(x-p.x,z-p.z)<p.r)return p;}return null;};

// the layout as data (the export, Godot): the rock, the potholes, the seep lines
NECANYONS.records=function(){return {rock:K.export(L.bodies),capY:L.capY,potholes:NECANYONS.POTHOLES,seeps:NECANYONS.SEEPS};};
NECANYONS.bodies=()=>L.bodies;NECANYONS.capY=()=>L.capY;
})();
