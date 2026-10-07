// ================================================================= HOST — the land, the fields, the binding (the ash desert)
// Two old flows (46: the kit's flow model) laid over the flank and half buried by the ash; then the ash's own forms over
// everything (the dunes, the yardangs), the rhyolite hills, the CO2 hollow; the fields the kit reads (cached); BIO.init.
const FLOW_SRC=(function(){const S=(key,name,u,p,o)=>{const c=[UP[0]*u+PERP[0]*p,UP[1]*u+PERP[1]*p];return Object.assign({key,name,x:c[0],z:c[1]},o);};
 return[S('olda','An old flow under the ash',2500,-900,{age:3800,len:5200,w:[300,520],th:[5,8],veer:.15,wander:.4,seed:9701}),
  S('oldb','An older flow under the ash',2500,1300,{age:6200,len:4600,w:[260,460],th:[4,7],veer:-.2,wander:.45,seed:9702})];})();
_mark('stage');const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:8,baseH:landH0,flows:FLOW_SRC,old:THRONE.OLD});
const ageLabel=a=>a<1.5?Math.round(a*12)+' months':a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('flows');
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
// THE DUNES: across the wind, a long gentle windward face and a steep slip face downwind; only on the south-east half
const duneK=(x,z)=>smooth(300,-700,uOf(x,z))*(1-smooth(.2,.6,FLOWS.thickAt(x,z)/6));
function duneAt(x,z){const k=duneK(x,z);if(k<=0)return{h:0,slip:0};const u=-uOf(x,z),p=pOf(x,z),L=150+30*Math.sin(p*.0021);
 const s=u/L+.18*Math.sin(p*.0047+1.3)+.35*(fbm(x*.002,z*.002,4703,2)-.5),f=s-Math.floor(s),H=(4+6*fbm(x*.003+2,z*.003,4704,2))*k;
 return{h:f<.8?H*f/.8:H*(1-f)/.2,slip:k*smooth(.78,.84,f)};}
function yardAt(x,z){let h=0;for(const Y of YARDANGS){const dx=x-Y.x,dz=z-Y.z,a=dx*UP[0]+dz*UP[1],b=dx*PERP[0]+dz*PERP[1];if(Math.abs(a)>Y.len||Math.abs(b)>Y.w*1.6)continue;
  // blunt at the windward (up) end, tapering away downwind
  const t=a>0?smooth(Y.len*.4,Y.len*.15,a):smooth(-Y.len,-Y.len*.1,a);h=Math.max(h,Y.h*Math.pow(smooth(Y.w*1.5,0,Math.abs(b)),1.3)*t);}return h;}
function hillAt(x,z){let h=0,k=0;for(const H of HILLS){const d=Math.hypot(x-H.x,z-H.z);if(d>H.r*1.2)continue;const p=Math.pow(Math.max(0,1-Math.pow(d/H.r,2)),1.3);h=Math.max(h,H.h*p*(.85+.3*ridged(x*.01,z*.01,4705)));k=Math.max(k,smooth(H.r*1.1,H.r*.7,d));}return{h,k};}
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH0(x,z){let h=landH0(x,z);const th=FLOWS.thickAt(x,z);h+=th;
 const fl=smooth(.4,2.2,th);if(fl>0)h+=fl*.9*(1.5*ridged(x*.045,z*.045,4711)+.6*(fbm(x*.17,z*.17,4712,2)-.5)-.6)*(1-smooth(0,.5,duneK(x,z)));
 h+=duneAt(x,z).h+yardAt(x,z)+hillAt(x,z).h;
 const dh=Math.hypot(x-HOLLOW.x,z-HOLLOW.z);if(dh<HOLLOW.r*1.6)h-=HOLLOW.depth*Math.pow(smooth(HOLLOW.r*1.5,HOLLOW.r*.3,dh),1.2);
 return h;}
function waterH(x,z){return -1e9;}

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's and the Throne's (BIOME-API.md): plume (~1: the axis), ash (deep in the dunes, shallow on the hills, the
// yardangs and the scoured lava), rock, barren (the hollow; the dunes' slip faces), humid 0; and the station's own: dune,
// hill, yard, hollow
function fieldsAt(x,z,h,slope){const th=FLOWS.thickAt(x,z),age=FLOWS.ageAt(x,z),D=duneAt(x,z),hl=hillAt(x,z),yd=smooth(1,5,yardAt(x,z)),dk=duneK(x,z);
 const dh=Math.hypot(x-HOLLOW.x,z-HOLLOW.z),hollow=smooth(HOLLOW.r*1.15,HOLLOW.r*.85,dh);
 const scoured=smooth(.4,2,th)*(1-dk);
 const ash=clamp(.55+.45*dk-.4*hl.k-.4*yd-.5*scoured,0,1);
 const rock=clamp(Math.max(smooth(.55,.85,slope)*Math.max(hl.k,yd),scoured*.7,smooth(.7,.95,slope)),0,1);
 return{wet:.12,flow:0,upland:0,canyon:0,rim:0,rock,dune:dk,oasis:0,slope,abyss:0,salt:0,cold:0,geo:0,barren:Math.max(hollow,D.slip*.7),
  humid:0,plume:plumeAt(x,z),vent:0,acid:0,cinder:0,skylight:0,ash,owned:0,kedge:0,knear:0,field:0,clear:0,coast:0,edge:0,city:0,path:0,
  hill:hl.k,yard:yd,hollow,ashdeep:smooth(.5,.85,ash)};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','hill','yard','hollow','ashdeep'];
const FC=(function(){const N=520,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
 const cs=S/(N-1);
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){a.h[j*N+i]=terrainH((i/(N-1)-.5)*S,(j/(N-1)-.5)*S);}
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i/(N-1)-.5)*S,z=(j/(N-1)-.5)*S,k=j*N+i;
  const hx=a.h[j*N+Math.min(N-1,i+1)]-a.h[j*N+Math.max(0,i-1)],hz=a.h[Math.min(N-1,j+1)*N+i]-a.h[Math.max(0,j-1)*N+i],slope=clamp(Math.hypot(hx,hz)/(2*cs)*1.6,0,1);
  const F=fieldsAt(x,z,a.h[k],slope);FNAMES.forEach(n=>a[n][k]=F[n]);}
 const L={x:NaN,z:NaN,k:0,fu:0,fv:0};
 const at=(arr,x,z)=>{if(x!==L.x||z!==L.z){const u=clamp((x/S+.5)*(N-1),0,N-1.001),v=clamp((z/S+.5)*(N-1),0,N-1.001),i=Math.floor(u),j=Math.floor(v);L.x=x;L.z=z;L.k=j*N+i;L.fu=u-i;L.fv=v-j;}
  const k=L.k,fu=L.fu,fv=L.fv;return arr[k]*(1-fu)*(1-fv)+arr[k+1]*fu*(1-fv)+arr[k+N]*(1-fu)*fv+arr[k+N+1]*fu*fv;};
 return{N,S,a,at};})();
const FIELD={};FNAMES.forEach(n=>FIELD[n]=(x,z)=>FC.at(FC.a[n],x,z));_mark('fields');

// ---------------------------------------------------------------- the host binding
const OBSTACLES=[];
let MASK=(x,z)=>1;
const SPINE=[[0,0],[HOLLOW.x,HOLLOW.z],[-800,-800],[900,900],[-300,1400],[1300,-200]];HILLS.forEach(H=>SPINE.push([H.x+H.r*.8,H.z+H.r*.3]));YARDANGS.slice(0,3).forEach(Y=>SPINE.push([Y.x,Y.z]));
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:47,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:260,mid:700,far:2400,floor:[230,560]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
