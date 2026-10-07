// ================================================================= HOST — the land (after the lava), the fields, the binding (the kipuka)
// The station's lava: flows from vents up the flank (off the map to the east), every age from three years to thousands.
// The kit's flow model (46) runs them down the fall line and round the old hills; what no flow has covered for ~1,700
// years is KIPUKA: old forest, the hyperjungle kit's ground (the 'owned' field). Then the tube's skylights, the fields,
// and BIO.init with a mask the build swaps per kit (88).
const FLOW_SRC=(function(){const S=(key,name,x,z,o)=>Object.assign({key,name,x,z},o);
 return[
  S('oldflow','An old flow, long since forest',2560,1950,{age:2600,len:5600,w:[360,620],th:[6,9],veer:.15,wander:.45,seed:9201}),
  S('mature','A flow of six centuries (the tube runs under it)',2560,-420,{age:650,len:5800,w:[300,560],th:[7,10],veer:-.2,wander:.5,seed:9202}),
  S('young2','A flow of a hundred and thirty years',2560,950,{age:130,len:5400,w:[260,480],th:[5,8],veer:.25,wander:.5,seed:9203}),
  S('young1','A flow of thirty-five years',2560,-1750,{age:35,len:5200,w:[220,420],th:[5,7],veer:-.3,wander:.45,seed:9204}),
  S('new','The new flow (three years old)',2560,180,{age:3,len:4700,w:[160,320],th:[6,9],veer:.2,wander:.4,seed:9205}),
 ];})();
const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:8,baseH:landH0,flows:FLOW_SRC,old:THRONE.OLD});
const ageLabel=a=>a<1.5?Math.round(a*12)+' months':a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
const KIPUKA_AGE=1700;   // ground this long without a flow is forest again: the kipuka
// how old the ground is round a point (0 young lava .. 1 kipuka), smoothed over the flow grid's 8 m cells
const oldAt=(x,z)=>{let m=0;for(const [dx,dz] of [[0,0],[7,0],[-7,0],[0,7],[0,-7]])m+=FLOWS.ageAt(x+dx,z+dz)>=KIPUKA_AGE?1:0;return m/5;};
// THE STREAMS' LINES: of the lines down the fall line (offset across it every 50 m), the two that cross the most old ground
(function(){const score=o=>{const S=Object.assign({},STREAMS[0],{x:PERP[0]*o,z:PERP[1]*o});let n=0,t=0;
  for(let s=-3000;s<=3000;s+=40){const p=streamPt(S,s);if(Math.abs(p[0])>TERR.R-100||Math.abs(p[1])>TERR.R-100)continue;t++;if(FLOWS.ageAt(p[0],p[1])>=KIPUKA_AGE)n++;}return t?n/t*Math.min(1,t/60):0;};
 const C=[];for(let o=-2300;o<=2300;o+=50)C.push([o,score(o)]);C.sort((a,b)=>b[1]-a[1]);
 const o1=C[0][0],o2=(C.find(c=>Math.abs(c[0]-o1)>700)||C[1])[0];
 [o1,o2].forEach((o,i)=>{STREAMS[i].x=PERP[0]*o;STREAMS[i].z=PERP[1]*o;STREAMS[i].oldShare=+C.find(c=>c[0]===o)[1].toFixed(2);});})();
// a stream's cut, only through old ground (where a flow crosses its line the stream sinks under the lava)
function streamCut(x,z){const st=streamAt(x,z);if(st.cut<=0)return st;const k=oldAt(x,z);return{cut:st.cut*k,bank:st.bank*k,bed:st.bed*k};}

// ---------------------------------------------------------------- the tube and its skylights
const TUBE=(function(){const F=FLOWS.flows.find(f=>f.key==='mature'),P=F.path,a=Math.floor(P.length*.12),b=Math.floor(P.length*.8),pts=P.slice(a,b).map(p=>[p.x,p.z]);
 reseed(4711);const sky=[];let acc=0;
 for(let i=1;i<pts.length;i++){acc+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(acc>rr(240,380)){acc=0;sky.push({x:pts[i][0],z:pts[i][1],r:rr(10,22),d:rr(10,16)});}}
 return{pts,sky};})();
function skyCut(x,z){let c=0;for(const S of TUBE.sky){const d=Math.hypot(x-S.x,z-S.z);if(d<S.r*1.6)c=Math.max(c,S.d*smooth(S.r*1.15,S.r*.7,d)+1.5*smooth(S.r*1.5,S.r*1.1,d));}return c;}
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH0(x,z);const th=FLOWS.thickAt(x,z);h+=th;h-=streamCut(x,z).cut;
 // the lava's skin: aa rubble and pressure ridges, sharper the younger (the wet weathers it fast)
 const fl=smooth(.4,2.2,th);if(fl>0){const a=FLOWS.ageAt(x,z),k=fl*(1-.75*smooth(150,1500,a));h+=k*(1.5*ridged(x*.045,z*.045,4711)+.6*(fbm(x*.17,z*.17,4712,2)-.5)-.6);}
 return h-skyCut(x,z);}
// THE STREAMS' WATER: a ribbon on the stream's bed, half a metre deep, where no flow has buried the bed
const streamLevel=(S,s)=>{const p=streamPt(S,s);return terrainH0(p[0],p[1])+.55;};
function waterH(x,z){for(const S of STREAMS){const g=streamD(x,z,S);if(g.d>S.w*1.3)continue;const p=streamPt(S,g.s);if(oldAt(p[0],p[1])<.99)continue;return streamLevel(S,g.s);}return -1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's fields and the Throne's (BIOME-API.md). Here: humid 1 (the windward climate); no plume, no vents.
//   owned  the kipuka: the hyperjungle kit's ground. kedge the rim just inside one (the great ruffs); knear the
//          younger lava just outside one (its seedlings, the lava casts)
const isOld=(x,z)=>FLOWS.ageAt(x,z)>=KIPUKA_AGE?1:0;
function ringMean(x,z,r){let m=0;for(let k=0;k<10;k++){const a=k/10*TAU;m+=isOld(x+Math.cos(a)*r,z+Math.sin(a)*r);}return m/10;}
function fieldsAt(x,z,h,slope){const st=streamCut(x,z),th=FLOWS.thickAt(x,z),age=FLOWS.ageAt(x,z);
 let sky=0;for(const S of TUBE.sky)sky=Math.max(sky,smooth(S.r*1.7,S.r*.8,Math.hypot(x-S.x,z-S.z)));
 const old=isOld(x,z),m60=ringMean(x,z,60),m140=ringMean(x,z,140);
 const owned=old*(1-st.bank)*(1-smooth(.3,.6,sky));
 const bare=smooth(.4,2,th)*smooth(60,8,age),walls=smooth(.62,.92,slope)*Math.max(sky,smooth(.5,2,th));
 return{wet:clamp(.8+.15*st.bank+.1*sky,0,1),flow:st.bank,upland:0,canyon:0,rim:0,rock:clamp(Math.max(bare,walls*.9),0,1),dune:0,oasis:0,slope,
  abyss:0,salt:0,cold:0,geo:0,barren:0,humid:1,plume:0,vent:0,acid:0,cinder:0,skylight:sky,ash:0,
  owned,kedge:old*smooth(.98,.7,m60)*(1-st.bank),knear:(1-old)*smooth(.02,.35,Math.max(m60,m140*.8))};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear'];
const FC=(function(){const N=560,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));

// ---------------------------------------------------------------- the host binding
// THE MASK is swapped per kit by the build (88): the Throne kit roots anywhere out of the water; the hyperjungle only on
// the kipuka (owned), and nowhere near the Throne's own big trees (the great ruffs, the siphons: OBSTACLES)
const OBSTACLES=[];
const waterMask=(x,z)=>{const w=waterH(x,z);if(w<-1e8)return 1;const d=terrainH(x,z)-w;return d<.15?0:d<.7?(d-.15)/.55:1;};
const kipukaMask=(x,z)=>smooth(.4,.8,FIELD.owned(x,z))*waterMask(x,z);
let MASK=waterMask;
// the LOD spine: the kipuka's rims (where the forest meets the young lava), the skylights, the streams, the new flow
const SPINE=[];
for(let z=-2200;z<=2200;z+=550)for(let x=-2200;x<=2200;x+=550){const ke=FIELD.kedge(x,z)+FIELD.knear(x,z);if(ke>.25)SPINE.push([x,z]);}
TUBE.sky.forEach((S,i)=>{if(i%2===0)SPINE.push([S.x,S.z]);});
STREAMS.forEach(S=>{for(let s=-1800;s<=1800;s+=900)SPINE.push(streamPt(S,s));});
{const F=FLOWS.flows.find(f=>f.key==='new');for(let i=0;i<F.path.length;i+=Math.floor(F.path.length/4))SPINE.push([F.path[i].x,F.path[i].z]);}
const WWIN=[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1];
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:37,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:280,mid:760,far:2400,floor:[250,620]},
 windows:{water:WWIN}});
BIO.setSun(SUN_POS);
