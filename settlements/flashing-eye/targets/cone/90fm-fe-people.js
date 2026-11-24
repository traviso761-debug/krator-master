// ================================================================= THE FLASHING EYE — its people drawn (src/41-fe-people.js)
// [web] Where each one is, walking, standing or sitting, is FE_PEOPLE's answer at the page's clock (feNow, FE_ENV: the vent's and
// the watch's clock, 90fh), never decided here: the monks at their offices, the Rift Watch and the readers on the Mirror Hall's
// balcony, the novices in their yard, the lay brothers on the cap, the Rim Watch at the Eye Post on FE_WATCH's rota, the pilgrims
// on the Way of Shrines, the lower kora and the Way of Breath up to the Threshold Chorten, and on a Station's night (FE_WATCH's
// kora flag) the procession three times round the rim. Indoors they are hidden.
//   the figures  core/charactermodels (read in place, kit.json): a record per look (KCHAR.stranger on the Xanadu people's draw:
//                the Order's robes from the Historians' outfits dyed crimson (the novices' ochre: the novice's short skirt flares through the
//                cross-legged sitting pose), shaven; the lay brothers and the pilgrims in Xanadu's
//                townsfolk dress, a few pilgrims in the jama and turban), each baked still by KCharCrowd standing, at four frames
//                of the walk and sitting, and drawn instanced: one draw per look and pose. The pieces load from the sidecars beside
//                the page (dist/kchar, FE_KCHAR.pieces) after the page is up; till a look is baked its people are not drawn
//   the ground   each figure's feet on the floor core/walk has there nearest its height (the stairs, the balcony, the bridges, the
//                platform), else on the drawn ground (terrainH), lifted onto a yard's plinth; the Way of Shrines along its drawn
//                line (the stair up the nose, the stairs round the crowns, the decks: 90fi), mapped from FE_PEOPLE's f along it
//   the record   every resident in core/tags before it is drawn (class life, kind person, at its home's door), the day's
//                pilgrims as one item set whose instances are the pilgrims drawn now; the bench's six stairs (the axis's two and
//                the lower kora's four) in core/walk as the kit's stair plan lays them
// ?people=0 draws none; ?far=N the radius drawn (220 m); ?station=1 opens on the next Station's night at 20:45.
// window._fePeople reports; FE_LIFE.place(t, cam, far) places everyone for a check and returns what it drew.
const FE_LIFE=(function(){
 const Q=new URLSearchParams(location.search),S={on:false,residents:FE_PEOPLE.people.length,registered:0,pilgrimSet:null,looks:[],ready:0,shown:0,byAct:{},errors:[],loads:0,stairs:0,bakeMs:0};
 window._fePeople=S;const W=typeof KWALK!=='undefined'?KWALK:null,T0=KTAGS.page||(KTAGS.page=KTAGS.create({build:'xanadu'}));
 const FAR=Q.has('far')?Math.max(10,Q.get('far')==null||isNaN(+Q.get('far'))?220:+Q.get('far')):220;
 // ---------------------------------------------------------------- the bench's stairs into core/walk (the kit's plan: qnStairPlan)
 if(W&&typeof qnStairPlan==='function')for(const P of FE.L.parts.filter(p=>p.kind==='stair_way')){
  const R=qnStairPlan(P.rise),u0=P.box[0],x=/^st\.kora/.test(P.id)?(P.box[2]+P.box[3])/2:0,w=P.w==null?6:P.w,yh=feTY(u0-1);
  for(const s of R.segs){if(s.k==='land')W.floor({rect:[x-w/2,x+w/2,u0+s.z0,u0+s.z1],y:yh+s.y,name:P.name+' (a landing)',tag:'flashing-eye:stair'});
   else W.strip({a:[x,u0+s.z0,yh+s.y0],b:[x,u0+s.z1,yh+s.y1],w,name:P.name,tag:'flashing-eye:stair'});S.stairs++;}}
 // ---------------------------------------------------------------- every resident in core/tags, at its home's door; the pilgrims a set
 const LABEL={monk:'A monk of the Flashing Eye',elder:'An elder of the Flashing Eye',novice:'A novice of the Flashing Eye',lay:'A lay brother of the Flashing Eye','pilgrim':'A pilgrim','pilgrim.rich':'A pilgrim'};
 const homeAt=P=>{const d=FE_PEOPLE.PLACES[P.home]&&FE_PEOPLE.PLACES[P.home][1],p=d||(()=>{const q=FE.L.parts.find(q=>q.id===P.home);return q?[(q.box[0]+q.box[1])/2,(q.box[2]+q.box[3])/2]:[0,0];})();return[p[1],terrainH(p[1],p[0]),p[0]];};
 for(const P of FE_PEOPLE.people){T0.add({id:P.id,class:'life',kind:'person',key:'fe_'+P.look,name:LABEL[P.look]+' ('+P.office+')',at:homeAt(P),r:.3,h:1.75,
  tags:{culture:'xanadu'},note:'the Order of the Flashing Eye: '+P.group+', '+P.office+', sleeps in '+P.home+(P.watch!=null?', the Rim Watch\'s watch '+P.watch:'')});S.registered++;}
 const PIL=[];   /* the pilgrims drawn now: [x, y, z, ry] */
 try{const g=FE_P(-3,-80),rec=T0.addSet({class:'life',kind:'person',key:'fe_pilgrim',name:'The pilgrims of the Flashing Eye',at:[g[0],0,g[1]],r:.3,h:1.75,tags:{culture:'xanadu'},note:'the day\'s pilgrims, as FE_PEOPLE.pilgrims(d) has them; an instance a pilgrim drawn now'},
  {n:()=>PIL.length,pos:(i,out)=>{const p=PIL[i]||[0,0,0];out[0]=p[0];out[1]=p[1];out[2]=p[2];return out;},ry:i=>(PIL[i]||[0,0,0,0])[3]});S.pilgrimSet=rec.id;}
 catch(e){S.errors.push('tags: '+(e&&e.message||e));}
 // ---------------------------------------------------------------- the Way of Shrines as drawn: the nose stair, each crown's stair, the decks
 const SHR=(function(){const pts=[],A=FE_NOSE.from,S0=FE_STACKS[0],Bp=S0.land,Ln=Math.hypot(Bp[0]-A[0],Bp[1]-A[1]);let y=-1e9;
  for(let s=0;s<=Ln+1e-6;s+=Math.min(4,Ln-s>0?4:1)){const t=Math.min(1,s/Ln),x=A[0]+(Bp[0]-A[0])*t,z=A[1]+(Bp[1]-A[1])*t;y=Math.min(S0.landing,Math.max(y,terrainH(x,z)+.12));pts.push([x,y,z]);if(t>=1)break;}
  FE_STACKS.forEach((S,i)=>{pts.push([S.land[0],S.landing,S.land[1]]);const rise=S.top-S.landing,R=S.r*1.12,a0=Math.atan2(S.dir[1],S.dir[0]),turns=rise/24,n=Math.max(6,Math.round(turns*6));
   let pv=null;for(let k=0;k<=n;k++){const t=k/n,a=a0+.45+t*turns*Math.PI*2;pv=[S.x+Math.cos(a)*R,S.landing+rise*t,S.z+Math.sin(a)*R];pts.push(pv);}
   pts.push([S.x+(pv[0]-S.x)*.8,S.top,S.z+(pv[2]-S.z)*.8]);for(const p of FE_BRIDGES[i].pts)pts.push(p);});
  const g=FE_P(-3,-80);pts.push([g[0],0,g[1]]);const s=[0];for(let i=1;i<pts.length;i++)s.push(s[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1],pts[i][2]-pts[i-1][2]));
  return{pts,s,L:s[s.length-1]};})();
 S.shrinesM=Math.round(SHR.L);
 function shrineAt(f,o){const d=Math.max(0,Math.min(1,f))*SHR.L;let lo=0,hi=SHR.s.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(SHR.s[m]<=d)lo=m;else hi=m;}
  const a=SHR.pts[lo],b=SHR.pts[hi],k=SHR.s[hi]>SHR.s[lo]?(d-SHR.s[lo])/(SHR.s[hi]-SHR.s[lo]):0;o.x=a[0]+(b[0]-a[0])*k;o.y=a[1]+(b[1]-a[1])*k;o.z=a[2]+(b[2]-a[2])*k;o.h=Math.atan2(b[0]-a[0],b[2]-a[2]);return o;}
 // ---------------------------------------------------------------- a pose on the page: x = v, z = u; the feet on the floor nearest, or the ground
 function yAt(x,z,y,lift){if(lift==null)lift=0;const tH=terrainH(x,z),want=(y==null?tH:y)+lift;let best=null,bd=1.5;
  if(W)for(const f of W.floorsAt(x,z)){const dd=Math.abs(f[0]-want);if(dd<bd){bd=dd;best=f[0];}}
  if(best!=null)return best;if(y!=null&&y-tH>.05&&y-tH<1.2)return y+lift;return tH+lift;}
 function world(o,out){out=out||{};if(o.way==='shrines'){shrineAt(o.f,out);if(o.dir<0)out.h+=Math.PI;return out;}
  out.x=o.v;out.z=o.u;out.y=yAt(o.v,o.u,o.y,o.lift);out.h=o.h;return out;}
 // ---------------------------------------------------------------- the looks: records, baked when the pieces are in
 const D=typeof FE_KCHAR!=='undefined'?FE_KCHAR:null,NOW=()=>typeof feNow==='function'?feNow():0;
 const CRIMSON='#d23a3a',OCHRE='#d8803a';
 const bodyOf=P=>P.office==='prismarch'?'mpfb_male':KRAND.unit(KRAND.hash(P.seed,11))<.5?'mpfb_male':'mpfb_female';
 const LOOKS=[],lookIx={},POSES=['idle','walk0','walk1','walk2','walk3','sit'],WALKN=4;
 const key=P=>P.look+'|'+bodyOf(P);
 if(D&&!(Q.get('people')==='0')){const X=D.peoples.find(p=>p.id==='xanadu'),Hs=D.peoples.find(p=>p.id==='historians');
  const spec={monk:['historians','monk',{torso:CRIMSON},true],elder:['historians','elder',{torso:CRIMSON,head:'#d8a830'},true],novice:['historians','monk',{torso:OCHRE},true],
   lay:['xanadu','town',null,false],pilgrim:['xanadu','town',null,false],'pilgrim.rich':['xanadu','rich',null,false]};
  for(const look in spec)for(const body of['mpfb_male','mpfb_female']){const [pid,tier,dye,shaven]=spec[look];
   const people=Object.assign({},X,{id:pid,outfits:(pid==='historians'?Hs:X).outfits,tiers:[[tier,1]]});
   const rec=KCHAR.stranger(KRAND.hash(34400,look.length*7+(body==='mpfb_male'?1:2),tier.length),D.bodies[body].kit,people);
   if(dye)rec.dye=Object.assign({},rec.dye||{},dye);if(shaven){rec.hair=null;rec.beard=null;}
   lookIx[look+'|'+body]=LOOKS.length;LOOKS.push({look,body,rec,sets:null,n:0,label:LABEL[look]});}
  S.looks=LOOKS.map(L=>({look:L.look,body:L.body,ready:false}));}
 /* the pieces, from the sidecars (the page's dist/kchar) */
 const side={},wait={};
 window.KCHAR_SIDE=function(k,t){side[k]=t;const w=wait[k];delete wait[k];if(w)w.forEach(f=>f[0](t));};
 function text(base){if(side[base]!=null)return Promise.resolve(side[base]);
  return new Promise((ok,no)=>{const first=!wait[base];(wait[base]=wait[base]||[]).push([ok,no]);if(!first)return;S.loads++;
   const s=document.createElement('script');s.src='kchar/'+base.replace('/','__')+'.js';
   s.onerror=()=>{const w=wait[base];delete wait[base];(w||[]).forEach(f=>f[1](new Error('no piece '+base)));};document.head.appendChild(s);});}
 const b64=s=>{const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return u.buffer;};
 const gunzip=buf=>{const u=new Uint8Array(buf);if(u[0]!==0x1f||u[1]!==0x8b)return Promise.resolve(buf);return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();};
 const raw=k=>{const base=k.replace(/\.morph$/,''),line=base===k?0:1;return text(base).then(t=>{const s=t.split('\n')[line];if(!s)throw new Error(k+': no such line');return gunzip(b64(s));});};
 const cache={};function load(k){if(!cache[k])cache[k]=raw(k).then(buf=>new Promise((ok,no)=>new THREE.GLTFLoader().parse(buf,'',ok,no)));return cache[k];}load.raw=raw;
 /* how many of each look can be out at once: its residents, and every pilgrim for a pilgrim's look */
 for(const P of FE_PEOPLE.people){const L=LOOKS[lookIx[key(P)]];if(L)L.n++;}
 for(const L of LOOKS)if(/^pilgrim/.test(L.look))L.n=520;
 let bakeP=null;
 function bake(){if(bakeP)return bakeP;if(!LOOKS.length||typeof KCharFigure==='undefined'||!THREE.GLTFLoader){S.errors.push('no core/charactermodels on the page');return bakeP=Promise.resolve();}
  KCharFigure.posture=(D.posture&&D.posture.bodies)||{};KCharFigure.props={};const FIG={},figFor=b=>FIG[b]||(FIG[b]=new KCharFigure(D.bodies[b],D.sliders,load)),t0=performance.now();
  let chain=Promise.resolve();
  for(const L of LOOKS){if(!L.n)continue;chain=chain.then(()=>{const f=figFor(L.body);return f.apply(L.rec).then(()=>KCharCrowd.bake(f,'idle',.5)).then(a=>{const w=f.clips&&f.clips.walk?f.clips.walk.duration:1;let ch=Promise.resolve([a]);
    for(let k=0;k<WALKN;k++)ch=ch.then(G=>KCharCrowd.bake(f,'walk',w*(k+.25)/WALKN).then(b=>G.concat([b])));return ch;}).then(G=>KCharCrowd.bake(f,'sit_floor',.6).then(d=>G.concat([d])))
    .then(G=>{L.sets=G.map((g,k)=>{const im=KCharCrowd.set(g.geo,L.n);im.name='the Flashing Eye\'s people: '+L.look+' ('+L.body.slice(5)+', '+POSES[k]+')';im.userData.people=true;im.userData.probeSkip=true;im.userData.lodSkip=true;im.userData.inspectLabel=L.label;scene.add(im);return im;});
     S.ready++;S.looks[LOOKS.indexOf(L)].ready=true;S.tris=(S.tris==null?0:S.tris)+G.reduce((a,g)=>a+g.tris,0);});}).catch(e=>{S.errors.push('bake '+L.look+' '+L.body+': '+(e&&e.message||e));});}
  return bakeP=chain.then(()=>{S.bakeMs=Math.round(performance.now()-t0);S.on=S.ready>0;});}
 // ---------------------------------------------------------------- each frame: place everyone within `far` of the camera
 const o={},STRIDE=1.45,use=new Map(),DRAWN=[];
 function place(t,cam,far){const all=FE_PEOPLE.at(t,FE_ENV),R2=far*far;let shown=0;const by={};PIL.length=0;DRAWN.length=0;
  for(const L of LOOKS)use.set(L,new Array(POSES.length).fill(0));
  for(const [P,q] of all){if(q.hidden)continue;world(q,o);const dx=o.x-cam.x,dz=o.z-cam.z;if(dx*dx+dz*dz>R2)continue;
   if(P.group==='pilgrim')PIL.push([o.x,o.y,o.z,o.h]);
   const L=LOOKS[lookIx[key(P)]];by[q.act]=(by[q.act]==null?0:by[q.act])+1;if(!L||!L.sets)continue;
   const k=q.act==='walk'?1+Math.floor(((t*(q.speed==null?1:q.speed)/STRIDE+KRAND.unit(KRAND.hash(P.seed,13)))%1)*WALKN)%WALKN:q.act==='sit'?5:0,u=use.get(L),j=u[k]++;
   if(j>=L.n)continue;L.sets[k].put(j,o.x,o.y,o.z,o.h);DRAWN.push([P.id,lookIx[key(P)],k,j,o.x,o.y,o.z,P.group,q.act]);shown++;}
  for(const L of LOOKS){if(!L.sets)continue;const u=use.get(L);for(let k=0;k<POSES.length;k++)L.sets[k].flush(Math.min(L.n,u[k]));}
  S.shown=shown;S.byAct=by;S.pilgrimsNow=PIL.length;return DRAWN;}
 if(LOOKS.length){setTimeout(()=>{bake();},1200);
  FRAME_HOOKS.push(()=>{if(!S.ready)return;try{place(NOW(),camera.position,FAR);}catch(e){if(S.errors.length<5)S.errors.push('place: '+(e&&e.stack||e));}});}
 // ---------------------------------------------------------------- the page's hooks: the next Station's night; the people now
 const nextStation=(h)=>{let d=FE_PEOPLE.dayOf(NOW());while(!FE_PEOPLE.stationNight(d))d++;return d*86400+(h==null?20.75:h)*3600;};
 if(Q.get('station')==='1'&&typeof FE_CLOCK!=='undefined'){const t=nextStation(FE_SKY.hour);FE_SKY.day=Math.floor(t/86400);FE_CLOCK.t0=t;FE_CLOCK.start=performance.now();}   /* with ?hour=20.75 the procession is on the rim */
 return{S,place,world,yAt,bake,nextStation,LOOKS,DRAWN,shrineAt,SHR,
  ready:ms=>{const t0=performance.now();const wait=()=>new Promise(r=>setTimeout(r,250));const go=()=>bake().then(()=>S.ready>=LOOKS.length||performance.now()-t0>(ms==null?120000:ms)?S:wait().then(go));return go();},
  /* the instance a drawn person is: its matrix read back, x y z */
  drawnAt:(li,k,j)=>{const L=LOOKS[li];if(!L||!L.sets)return null;const m=new THREE.Matrix4();L.sets[k].getMatrixAt(j,m);return[m.elements[12],m.elements[13],m.elements[14]];}};})();
if(typeof FE_API!=='undefined'){   /* the clock to the next Station's night at hour h (20.75), running */
 FE_API.stationNight=h=>{const t=FE_LIFE.nextStation(h);FE_SKY.day=Math.floor(t/86400);FE_SKY.hour=(t%86400)/3600;FE_CLOCK.t0=t;FE_CLOCK.start=performance.now();FE_CLOCK.set=null;return t;};
 FE_API.people=()=>window._fePeople;}
