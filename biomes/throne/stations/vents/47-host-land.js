// ================================================================= HOST — the land, the fields, the binding (vent country)
// The lava first (46: the kit's flow model) over the rift as 45 made it (the flank, the graben, the fissure's ramparts and
// cones): the fissure's young flow down the graben floor, two older flows on the shoulders. Then what is cut after it:
// the steam valley, the open cracks, the fissure's crack, the hollows, the pools and the mud pots, the marsh's floor.
// Then the fumaroles (the 'vent' field), the fields the kit reads (cached), BIO.init.
function landH0(x,z){return flankH(x,z)-grabenAt(x,z).drop+fissAt(x,z).h+coneAt(x,z).h;}
const FLOW_SRC=(function(){const S=(key,name,p,o)=>Object.assign({key,name,x:p[0],z:p[1]},o);
 return[S('fissure','The fissure\'s flow (four years old)',fissPt(1020),{age:4,len:1500,w:[90,220],th:[3,6],veer:0,wander:.35,seed:9801}),
  S('east','An old flow on the east shoulder',upAt(2650,760),{age:700,len:4800,w:[240,420],th:[5,8],veer:.1,wander:.4,seed:9802}),
  S('west','An ancient flow on the west shoulder',upAt(2650,-2050),{age:2600,len:5200,w:[260,460],th:[5,8],veer:-.1,wander:.4,seed:9803})];})();
_mark('stage');const FLOWS=THRONE.flowHistory({R:TERR.R+260,cell:8,baseH:landH0,flows:FLOW_SRC,old:THRONE.OLD});
const ageLabel=a=>a<1.5?Math.round(a*12)+' months':a<THRONE.OLD?Math.round(a)+' years':'no flow in the record';
_mark('flows');

// ---------------------------------------------------------------- what is cut after the lava
// THE OPEN CRACKS (gjár) on the graben floor, en echelon, a little oblique to the rift: ~9 m wide, ~7 deep, steaming
const CRACKS=(function(){reseed(4703);const o=[];for(let k=0;k<7;k++){const u=rr(-850,380),side=k%2?1:-1,l=GRABEN.pw(u)+side*rr(40,150),c=upAt(u,l),a=Math.atan2(UP[1],UP[0])+side*rr(.1,.22);
  if(Math.hypot(c[0]-HOLLOWS[0].x,c[1]-HOLLOWS[0].z)<HOLLOWS[0].r+150)continue;o.push({x:c[0],z:c[1],dx:Math.cos(a),dz:Math.sin(a),len:rr(110,240),hw:rr(5,7),d:rr(6,9)});}return o;})();
function crackAt(x,z){let c=0;for(const C of CRACKS){const dx=x-C.x,dz=z-C.z,a=dx*C.dx+dz*C.dz;if(Math.abs(a)>C.len)continue;const b=Math.abs(-dx*C.dz+dz*C.dx);if(b>C.hw*2)continue;
  c=Math.max(c,C.d*smooth(C.hw,C.hw*.35,b)*smooth(C.len,C.len*.7,Math.abs(a)));}return c;}
// the pools' and the pots' bowls; the hollows; the steam valley; the marsh's floor (hummocks of sulphur crust, level
// water among them, a bank rising all round it: down-rift a dam of sinter holds it)
function poolCut(x,z){let c=0;for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);if(d<P.r*2)c=Math.max(c,2.6*smooth(P.r*1.6,P.r*.4,d));}
 return c;}
function hollowCut(x,z){let c=0;for(const H of HOLLOWS){const d=Math.hypot(x-H.x,z-H.z);if(d<H.r*1.6)c=Math.max(c,H.depth*Math.pow(smooth(H.r*1.5,H.r*.3,d),1.2));}return c;}
const ridged=(x,z,s)=>1-Math.abs(fbm(x,z,s,3)*2-1);
const marshHum=(x,z)=>2.4*(fbm(x*.03,z*.03,4731,2)-.5)+.9*(fbm(x*.1,z*.1,4732,2)-.5);
const _tm={x:NaN,z:NaN,h:0};
function terrainH(x,z){if(x===_tm.x&&z===_tm.z)return _tm.h;const h=terrainH0(x,z);_tm.x=x;_tm.z=z;_tm.h=h;return h;}
function terrainH1(x,z){let h=landH0(x,z);const th=FLOWS.thickAt(x,z);h+=th;
 // the lava's skin: pahoehoe ropes and tumuli on the young flow, aa rubble on the old, softened with age
 const fl=smooth(.4,2.2,th);if(fl>0){const a=FLOWS.ageAt(x,z),k=fl*(1-.65*smooth(300,3500,a));h+=k*(1.4*ridged(x*.04,z*.04,4711)+.6*(fbm(x*.17,z*.17,4712,2)-.5)-.6);}
 return h-valleyAt(x,z).cut-crackAt(x,z)-5*fissAt(x,z).crack-hollowCut(x,z);}
MARSH.level=terrainH1(MARSH.x,MARSH.z)-1.2;
MUD.forEach(M=>M.base=terrainH1(M.x,M.z));
function terrainH0(x,z){let h=terrainH1(x,z);
 const d=marshD(x,z);if(d<1.7){const hb=MARSH.level-.08+marshHum(x,z)*smooth(1.0,.7,d)+5*Math.pow(smooth(.7,1.5,d),1.2);h=mix(h,hb,smooth(1.7,1.25,d));}
 // each mud pot: its floor flattened a little below the ground at its middle (on a slope a rim's low point would drown it)
 for(const M of MUD){const dm=Math.hypot(x-M.x,z-M.z);if(dm<M.r*1.8)h=mix(h,M.base-.4,smooth(M.r*1.7,M.r*.9,dm));}
 return h-poolCut(x,z);}
const ringLo=(P,k)=>{let lo=1e9;for(let i=0;i<20;i++){const a=i/20*TAU;lo=Math.min(lo,terrainH0(P.x+Math.cos(a)*P.r*k,P.z+Math.sin(a)*P.r*k));}return lo;};
const POOLL=POOLS.map(P=>ringLo(P,1.3)-.3),MUDL=MUD.map(M=>M.base-.2);
function waterH(x,z){if(marshD(x,z)<1.0)return MARSH.level;
 for(let i=0;i<POOLS.length;i++)if(Math.hypot(x-POOLS[i].x,z-POOLS[i].z)<POOLS[i].r*1.5)return POOLL[i];
 for(let i=0;i<MUD.length;i++)if(Math.hypot(x-MUD[i].x,z-MUD[i].z)<MUD[i].r*1.4)return MUDL[i];return -1e9;}

// ---------------------------------------------------------------- the fumaroles
// Down the fissure and round the cones' craters, along the open cracks, all down the steam valley's floor, by the pools,
// the pots and the marsh, at the scarps' feet, and a few on the shoulders. 86 draws their steam; the kit reads them as
// the 'vent' field (its bone bells stand in the thickest)
const STEAM=(function(){reseed(4704);const o=[],add=(p,s,R)=>o.push({x:p[0],z:p[1],s,R});
 for(let k=0;k<10;k++)add(fissPt(mix(FISS.u0+60,FISS.u1-60,(k+rr(.2,.8))/10)),rr(.4,.8),42);
 CONES.forEach(C=>{for(let k=0;k<2;k++){const a=rr(0,TAU),d=C.r*C.crater*rr(.3,.8);add([C.x+Math.cos(a)*d,C.z+Math.sin(a)*d],rr(.5,.8),38);}});
 CRACKS.forEach(C=>{for(let k=0;k<3;k++){const t=rr(-.8,.8)*C.len;add([C.x+C.dx*t,C.z+C.dz*t],rr(.5,.9),44);}});
 for(let u=VALLEY.u0-160;u>VALLEY.u1+200;u-=rr(55,95))add(upAt(u,valL(u)+rr(-12,12)),rr(.65,1),56);
 POOLS.forEach(P=>add([P.x,P.z],.4+.4*P.hot,40));MUD.forEach(M=>add([M.x,M.z],.5,30));
 for(let k=0;k<6;k++){const a=rr(0,TAU),r=rr(.3,1.1),c=upAt(MARSH.u+Math.cos(a)*MARSH.ru*r,MARSH.p+Math.sin(a)*MARSH.rp*r);add(c,rr(.4,.7),58);}
 for(let k=0;k<6;k++){const u=rr(-2000,2000),side=k%2?1:-1,l=GRABEN.pw(u)+side*(GRABEN.W(u)-24);add(upAt(u,l),rr(.35,.6),40);}
 for(let k=0;k<8;k++){const p=[rr(-2300,2300),rr(-2300,2300)];add(p,rr(.3,.6),50);}
 return o;})();

// ---------------------------------------------------------------- the fields (cached below; these are the definitions)
// The world's and the Throne's (BIOME-API.md), and the station's own: graben (its floor), marsh, pools (the sinter and
// the mats round the pools and pots), valley, hollow, fiss (the fissure's hot ground); and sulph, the kit's (the sulphurous
// ground: the marsh and its banks, the vents' crusts, the steam valley's floor; not the pools' sinter, not the hollows)
// THE HOT GROUND: the fissure's ramparts and crack, where the young flow still glows under its crust, and its spatter cones:
// nothing lives on it (the owner: "they shouldn't be living there")
function hotAt(x,z){const u=uOf(x,z),e=smooth(FISS.u0-120,FISS.u0+40,u)*smooth(FISS.u1+120,FISS.u1-40,u);return Math.max(e*smooth(48,30,Math.abs(pOf(x,z)-fissL(u))),coneAt(x,z).k);}
function ventAt(x,z){let v=0;for(const S of STEAM){const d=Math.hypot(x-S.x,z-S.z);if(d<S.R*2.2)v=Math.max(v,S.s*Math.exp(-Math.pow(d/S.R,2)));}return clamp(v,0,1);}
function fieldsAt(x,z,h,slope){const G=grabenAt(x,z),V=valleyAt(x,z),F=fissAt(x,z),cn=coneAt(x,z),th=FLOWS.thickAt(x,z),age=FLOWS.ageAt(x,z),pl=plumeAt(x,z),vent=ventAt(x,z);
 const md=marshD(x,z),marsh=smooth(1.15,.9,md);
 let pools=0,acid=smooth(1.3,.85,md);for(const P of POOLS){const d=Math.hypot(x-P.x,z-P.z);pools=Math.max(pools,smooth(P.r*2.2,P.r*1.4,d));acid=Math.max(acid,smooth(P.r*3.4,P.r*1.6,d));}
 for(const M of MUD){const d=Math.hypot(x-M.x,z-M.z);pools=Math.max(pools,smooth(M.r*2.4,M.r*1.3,d));acid=Math.max(acid,smooth(M.r*3.5,M.r*1.5,d));}
 let hollow=0;for(const H of HOLLOWS)hollow=Math.max(hollow,smooth(H.r*1.15,H.r*.85,Math.hypot(x-H.x,z-H.z)));
 const crack=smooth(.5,2,crackAt(x,z)),fiss=Math.max(F.crack,F.k*smooth(30,4,age)*.6);
 const bare=smooth(.4,2,th)*smooth(380,25,age),walls=smooth(.6,.9,slope)*Math.max(G.scarp,crack,smooth(.5,2,th),V.fl>0?1:0);
 const rock=clamp(Math.max(bare,walls*.9,crack),0,1),cin=Math.max(cn.k,F.k*.8)*(1-.6*smooth(.5,2,th)*smooth(10,2,age));
 // away from the steam the acid rain and the gas keep the ground sparse: the life crowds the vents, the marsh, the pools
 const sparse=.55*(1-smooth(.04,.22,vent))*(1-smooth(.2,.6,acid))*(1-V.fl)*(.75+.5*fbm(x*.003,z*.003,4742,2));
 return{wet:clamp(.25+.35*V.fl+.4*marsh+.15*acid,0,1),flow:V.fl,upland:0,canyon:0,rim:0,rock,dune:0,oasis:0,slope,abyss:0,salt:0,cold:0,geo:0,
  barren:Math.max(hollow,pools*.9,F.crack,crack,clamp(sparse,0,.7),smooth(.2,.45,hotAt(x,z))),humid:0,plume:pl,vent,acid:clamp(acid,0,1),cinder:clamp(cin,0,1),skylight:0,ash:pl*(1-smooth(.5,.85,slope))*.55*(1-marsh),
  owned:0,kedge:0,knear:0,field:0,clear:0,coast:0,edge:0,city:0,path:0,graben:G.in,marsh,pools,valley:V.fl,hollow,fiss,
  sulph:clamp(Math.max(smooth(1.3,.85,md),smooth(.22,.6,vent),V.fl*.55),0,1)*(1-hollow)*(1-pools)*(1-smooth(.2,.45,hotAt(x,z)))};}
const FNAMES=['wet','flow','upland','canyon','rim','rock','dune','oasis','slope','abyss','salt','cold','geo','barren','humid','plume','vent','acid','cinder','skylight','ash','owned','kedge','knear','field','clear','coast','edge','city','path','graben','marsh','pools','valley','hollow','fiss','sulph'];
const FC=(function(){const N=600,S=TERR.R*2.2,a={};FNAMES.forEach(n=>a[n]=new Float32Array(N*N));a.h=new Float32Array(N*N);
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
const waterMask=(x,z)=>{const w=waterH(x,z);if(w>-1e8){const d=terrainH(x,z)-w;if(d<.7)return d<.15?0:(d-.15)/.55;}return 1;};
// and nothing roots on the hot ground (exact, not the cached field: a cluster's outliers and the cones' narrow flanks)
let MASK=(x,z)=>hotAt(x,z)>.35?0:waterMask(x,z);
// the LOD spine: down the graben, the fissure and its cones, the marsh, the pools, the steam valley, the hollows
const SPINE=[];for(let u=-2200;u<=2200;u+=600)SPINE.push(upAt(u,GRABEN.pw(u)));
CONES.forEach(C=>SPINE.push([C.x,C.z]));SPINE.push([MARSH.x,MARSH.z],upAt(MARSH.u+260,MARSH.p),upAt(MARSH.u-260,MARSH.p));POOLS.slice(0,3).forEach(P=>SPINE.push([P.x,P.z]));
for(let u=1600;u>=-1600;u-=640)SPINE.push(upAt(u,valL(u)));HOLLOWS.forEach(H=>SPINE.push([H.x,H.z]));
BIO.init({THREE:THREE,scene:scene,terrainH:terrainH,waterH:waterH,mask:(x,z)=>MASK(x,z),
 obstacles:OBSTACLES,ticks:tick,seed:48,origin:SPINE,center:[0,0],fields:FIELD,register:REGISTER,err:reportErr,
 lod:{hero:260,mid:700,far:2400,floor:[230,560]},
 windows:{water:[-TERR.R*1.1,-TERR.R*1.1,TERR.R*1.1,TERR.R*1.1]}});
BIO.setSun(SUN_POS);
