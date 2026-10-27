// node core/terrain/test-lava.js — KLAVA's contract (46-core-lava.js), each check with a broken input that must fail.
// --write rewrites golden-lava.json (the numbers klava.gd is held to).
const fs=require('fs'),path=require('path');
global.window=global;
eval(fs.readFileSync(path.join(__dirname,'..','rand','08-core-rand.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'30-core-field.js'),'utf8'));
eval(fs.readFileSync(path.join(__dirname,'46-core-lava.js'),'utf8'));
let bad=0;const ok=(name,pass,neg)=>{const r=pass&&!neg;if(!r)bad++;console.log((r?'PASS  ':'FAIL  ')+name+(neg?' (its negative passed)':''));};
const K=KLAVA,rhog=2600*9.81;
// an isothermal rheology: no cooling, eta and Sy fixed (log10 values)
const iso=(le,ly)=>({eta:[le,0],yld:[ly,0],emis:0,kc:0,Tvent:1400,Tsol:1000,etaMin:1});
const plane=(nx,nz,step,fn)=>{const H=new Float32Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)H[j*nx+i]=fn(i*step,j*step);return KFIELD.create({x0:0,z0:0,step,nx,nz,heights:H});};

// ---- 1. the pair's flux: Jeffreys' sheet without a yield, nothing below the yield thickness
{const he=4,dH=2,d=20,w=10,eta=1e3,sn=dH/Math.hypot(dH,d),J=w*rhog*sn*he*he*he/(3*eta);
 ok('flux: Sy 0 is Jeffreys\' sheet, w rho g sin(theta) h^3 / (3 eta)',Math.abs(K.flux(he,dH,d,w,eta,0,rhog)-J)<1e-9*J,Math.abs(K.flux(he,dH,d,w,eta*2,0,rhog)-J)<1e-9*J);
 const Sy=500,G=rhog*sn,hc=Sy/G,a=he/hc,M=Sy*hc*hc*w/(3*eta)*(a*a*a-1.5*a*a+.5);
 ok('flux: the factored form is MAGFLOW\'s (Sy hc^2 w / 3 eta)(a^3 - 3a^2/2 + 1/2)',Math.abs(K.flux(he,dH,d,w,eta,Sy,rhog)-M)<1e-9*M,false);
 ok('flux: none at or below the yield thickness hc = Sy / (rho g sin theta), some just above',K.flux(hc,dH,d,w,eta,Sy,rhog)===0&&K.flux(hc*.9,dH,d,w,eta,Sy,rhog)===0&&K.flux(hc*1.01,dH,d,w,eta,Sy,rhog)>0,K.flux(hc*.9,dH,d,w,eta,0,rhog)===0);
 const r=K.rheo(K.RHEO.basalt,1400),r2=K.rheo(K.RHEO.basalt,1173);
 ok('rheo: basalt eta ~10^3.5 Pa s hot, ~10^7 at the solidus; Sy 100 Pa to 100 kPa',Math.abs(Math.log10(r.eta)-3.5)<.01&&Math.abs(Math.log10(r2.eta)-7)<.01&&Math.abs(Math.log10(r.Sy)-2)<.01&&Math.abs(Math.log10(r2.Sy)-5)<.01,r.eta>r2.eta);
 const e=K.rheo(K.RHEO.etna,1360);ok('rheo: Etna\'s VFT viscosity (log10 eta = -4.643 + 5812.44 / (T - 427.04))',Math.abs(Math.log10(e.eta)-(-4.643+5812.44/(1360-427.04)))<1e-9,false);}

// ---- 2. a uniform sheet's velocity is Jeffreys' in any direction (the face weights)
{const sl=.05,h0=3,eta=1e4,u=rhog*sl/Math.sqrt(1+sl*sl)*h0*h0/(3*eta);
 const sheet=(dir)=>{const F=plane(41,41,10,(x,z)=>dir==='x'?-sl*x:-sl*(x+z)/Math.SQRT2);
  const s=K.create({field:F,rheo:iso(Math.log10(eta),-9),hmin:0});s.h.fill(h0);s.T.fill(1400);
  for(const v of [0,40])s.vent({x:v*10,z:v*10,Q:0});   // a source in two corners spans the box over the whole grid
  s.step(.01);return s.at(200,200);};
 const a=sheet('x'),b=sheet('d'),sb=Math.hypot(b.vx,b.vz);
 ok('a sheet down x: vx = rho g sin(theta) h^2 / (3 eta) within 1% (vz 0)',Math.abs(a.vx-u)<.01*u&&Math.abs(a.vz)<1e-9*u,Math.abs(a.vx-u*1.5)<.01*u);
 ok('a sheet down the diagonal: |v| within 6% of the same, along the diagonal',Math.abs(sb-u)<.06*u&&Math.abs(b.vx-b.vz)<1e-6*u,false);
 console.log('      (sheet speeds: down x '+a.vx.toFixed(5)+', diagonal '+sb.toFixed(5)+', Jeffreys '+u.toFixed(5)+' m/s)');}

// ---- 3. run-out on a slope: a Bingham flow stops at the yield thickness hc = Sy / (rho g sin theta), and runs V / (w hc)
{const sl=.1,sn=sl/Math.sqrt(1+sl*sl),Sy=2000,hc=Sy/(rhog*sn),st=5,nx=400;
 const F=plane(nx,2,st,x=>-sl*x),s=K.create({field:F,rheo:iso(3,Math.log10(Sy)),edge:'wall',hmin:.001,dtMax:5});
 const Vol=2*st*st*hc*60;s.vent({x:20,z:0,r:6,Q:Vol/600});                    // 60 cells' worth at hc, poured over 10 minutes
 s.run(600);s.vents[0].Q=0;s.run(48*3600);
 let n=0,sum=0,last=0;for(let i=0;i<nx;i++){const v=s.h[i];if(v>.01*hc){n++;sum+=v;last=i;}}
 const mean=sum/n,run=last*st-20,want=Vol/(2*st*hc);
 ok('a flow on a 1:10 slope stops at hc (mean thickness within 15%) after 48 h',Math.abs(mean-hc)<.15*hc&&s.molten>=0,Math.abs(mean-2*hc)<.15*hc);
 ok('it runs out V / (w hc) (within 20%)',Math.abs(run-want)<.2*want,false);
 const m=s.mass();ok('and no lava is made or lost (wall edges)',Math.abs(m.error)<1e-9*m.erupted&&m.lost===0,false);
 // the same with no yield never stops: it reaches the far wall
 const s0=K.create({field:F,rheo:iso(3,-9),edge:'wall',hmin:.001,dtMax:5});s0.vent({x:20,z:0,r:6,Q:Vol/600});s0.run(600);s0.vents[0].Q=0;s0.run(6*3600);
 let far=0;for(let i=0;i<nx;i++)if(s0.h[i]>1e-4)far=i;
 ok('without a yield the same volume runs much further',far*st-20>2*want,false);
 console.log('      (hc '+hc.toFixed(3)+' m, mean '+mean.toFixed(3)+' m; run-out '+run+' m, V/(w hc) '+want.toFixed(0)+' m; Newtonian past '+(far*st-20)+' m)');}

// ---- 4. mass, cooling, solidification, writing back, on a cone with a vent and a seeded roughness
const cone=()=>plane(81,81,25,(x,z)=>3000-.12*Math.hypot(x-1000,z-1000));
const mk=(seed)=>{const F=cone(),s=K.create({field:F,seed,rough:.4,dtMax:30});s.vent({x:1000,z:1000,r:30,Q:t=>t<4*3600?300*(1-t/(4*3600)):0,name:'summit'});return {F,s};};
{const {F,s}=mk(7),z0=Float64Array.from(s.z);s.run(4*3600);
 const m=s.mass();ok('mass: erupted = molten + frozen + lost (to 1e-9) with a vent, cooling and freezing',Math.abs(m.error)<1e-9*m.erupted&&m.molten>0&&m.frozen>0,Math.abs(m.error+1)<1e-9*m.erupted);
 ok('the flow is moving: a front and molten cells',s.molten>20&&s.front().length>4,false);
 let hot=0,cold=0,cn=0,hn=0;for(let k=0;k<s.N;k++){if(!(s.h[k]>.05))continue;const r=Math.hypot(s.x0+(k%s.nx)*s.cs-1000,s.z0+Math.floor(k/s.nx)*s.cs-1000);if(r<80){hot+=s.T[k];hn++;}else if(r>300){cold+=s.T[k];cn++;}}
 ok('it cools as it runs: the vent\'s lava hotter than the far lava',hn&&cn&&hot/hn>cold/cn+5,false);
 s.run(30*86400);const m2=s.mass();
 ok('solidification: a month on every drop has frozen (molten 0, frozen = erupted - lost)',s.molten===0&&m2.molten<1e-6*m2.erupted&&Math.abs(m2.frozen+m2.lost-m2.erupted)<1e-9*m2.erupted,false);
 let dz=0,dd=0;for(let k=0;k<s.N;k++){dz=Math.max(dz,Math.abs(s.z[k]-z0[k]-s.dep[k]));dd+=s.dep[k];}
 ok('the frozen flow is new ground: z = z0 + dep',dz<1e-9&&dd>0,dd===0);
 const before=Float32Array.from(F.heights),n1=s.writeBack(F),n2=s.writeBack(F);let er=0;
 for(let k=0;k<s.N;k++)er=Math.max(er,Math.abs(F.heights[k]-before[k]-s.dep[k]));
 ok('writeBack lifts the field by the deposits (once: a second call adds nothing)',n1>0&&n2===0&&er<1e-3,n1===0);
 {F.heights.set(before);let seen=0;const n3=s.writeBack(F,{all:true,each:(g,k)=>{if(g===F)seen++;}});let e3=0;for(let k=0;k<s.N;k++)e3=Math.max(e3,Math.abs(F.heights[k]-before[k]-s.dep[k]));
  ok('writeBack all: a page that put its field back gets every deposit again, each point named once',n3===n1&&seen===n1&&e3<1e-3,n3===0);}
 ok('KFIELD reads the new ground',Math.abs(F.h(1000,1000)-(before[40*81+40]+s.dep[40*81+40]))<1e-3,false);
 console.log('      (erupted '+(m2.erupted/1e6).toFixed(3)+' Mm3, lost off the edge '+(m2.lost/1e6).toFixed(3)+' Mm3, deposit up to '+Math.max(...s.dep).toFixed(2)+' m)');}

// ---- 5. determinism: the same seed, the same bits; another seed, other lobes; snapshot and restore
{const a=mk(7).s,b=mk(7).s,c=mk(8).s;a.run(3600);b.run(3600);c.run(3600);
 let same=true,diff=false;for(let k=0;k<a.N;k++){if(a.h[k]!==b.h[k]||a.T[k]!==b.T[k])same=false;if(a.h[k]!==c.h[k])diff=true;}
 ok('determinism: two runs on one seed agree to the bit; another seed differs',same&&diff,!diff);
 const snap=a.snapshot();a.run(1800);const h1=a.h.slice();a.restore(snap);a.run(1800);let rs=true;for(let k=0;k<a.N;k++)if(a.h[k]!==h1[k])rs=false;
 ok('snapshot and restore replay to the bit',rs,false);}

// ---- 6. stability: a huge step neither overshoots nor goes negative
{const F=cone(),s=K.create({field:F,rheo:iso(1,-9),dtMax:1e6});s.vent({x:1000,z:1000,r:60,Q:1e5});s.step(10);s.vents[0].Q=0;
 let H0=-Infinity;for(let k=0;k<s.N;k++)if(s.h[k]>0)H0=Math.max(H0,s.z[k]+s.h[k]);
 s.step(1e5);let H1=-Infinity,neg=false,nan=false;for(let k=0;k<s.N;k++){if(s.h[k]<0)neg=true;if(s.h[k]!==s.h[k])nan=true;if(s.h[k]>0)H1=Math.max(H1,s.z[k]+s.h[k]);}
 ok('a 1e5 s step: no negative or NaN thickness, the top surface not raised',!neg&&!nan&&H1<=H0+1e-9,neg);}

// ---- 7. a pond: a held lake spills over its lowest lip and only then
{// a bowl, its floor at -100, its rim's crest 10 m at r 260 but -50 in a notch on its east side; the ground falls away outside
 const F=plane(61,61,20,(x,z)=>{const r=Math.hypot(x-600,z-600),cr=x>600&&Math.abs(z-600)<45?-50:10;
  return r<200?-100+r*.1:r<260?-80+(r-200)/60*(cr+80):cr-(r-260)*.2;});
 const lip=-50,s=K.create({field:F,rheo:iso(3,2),dtMax:20});let lev=lip-5;
 const P=s.pond({inside:(x,z)=>Math.hypot(x-600,z-600)<250,level:()=>lev,name:'lake'});
 s.run(3600);const below=P.out,dry=s.at(600+400,600).h;lev=lip+8;s.run(3*3600);const m=s.mass();
 ok('a pond below its lip sends nothing out; over it, it spills (out > 0, through the notch)',below===0&&dry===0&&P.out>0&&s.at(600+400,600).h>0,P.out===0);
 ok('the pond\'s ledger is the erupted volume (mass to 1e-9)',Math.abs(m.error)<1e-9*m.erupted&&Math.abs(m.pondOut-P.out)<1e-6,false);
 ok('the spill runs down the notch side, not the far side',s.at(600+400,600).h>s.at(600-400,600).h,false);}

// ---- 8. the hazard: a bound sim answers KHAZ's state function by point
{global.KHAZ={STATES:{}};const {s}=mk(7);s.run(1800);const rec={id:'lava1'};K.bind(rec,s);
 const hz=s.hazard(),f=KHAZ.STATES['KLAVA.flow'];
 ok('bind registers KHAZ.STATES[\'KLAVA.flow\']; the record is kind lava with a box over the sim',typeof f==='function'&&hz.hazard.kind==='lava'&&hz.hazard.shape.type==='box'&&hz.hazard.stateFn==='KLAVA.flow',false);
 ok('molten at the vent (k 1), clear far off (k 0)',f(rec,hz.hazard,0,1,1000,1000).k===1&&f(rec,hz.hazard,0,1,20,20).k===0,f(rec,hz.hazard,0,1,20,20).k===1);
 K.bind(rec,null);ok('unbound: nothing',f(rec,hz.hazard,0,1,1000,1000).k===0,false);
 const hk=s.hazard({key:'flow-a'});K.bind('flow-a',s);ok('bound by a key (in the hazard seed): any record carrying it answers',hk.hazard.seed==='flow-a'&&f({id:'other'},hk.hazard,0,1,1000,1000).k===1,f({id:'other'},hz.hazard,0,1,1000,1000).k===1);K.bind('flow-a',null);}

// ---- 9. the export
{const {s}=mk(7);s.run(600);const e=s.export(),h=KFIELD.unb64(e.h,Float32Array);
 ok('export: krator-lava with h, T, dep as Float32 base64',e.format==='krator-lava'&&h.length===s.N&&Math.abs(h[40*81+40]-s.h[40*81+40])<1e-4,false);}

// ---- bake: eruptions one after another, frozen; the ground they added and which laid each cell's top
{const o={h:(x,z)=>-.065*z,box:[0,0,1980,1980],cell:20,seed:4,dtMin:60,dtMax:60,eruptions:[{x:700,z:300,r:20,Q:40,duration:6*3600},{x:1100,z:300,r:20,Q:40,duration:6*3600}]};
 const a=KLAVA.bake(o),b=KLAVA.bake(o),c=KLAVA.bake(Object.assign({},o,{seed:5}));let V=0,same=true,diff=false,ages=new Set();
 for(let k=0;k<a.dh.length;k++){V+=a.dh[k]*400;if(a.dh[k]!==b.dh[k]||a.age[k]!==b.age[k])same=false;if(a.dh[k]!==c.dh[k])diff=true;if(a.age[k])ages.add(a.age[k]);}
 const er=a.eruptions.reduce((s,e)=>s+e.volume-e.lost,0);
 ok('bake: all frozen, the ground added is the volume erupted less what left (Float32: 1e-5)',a.eruptions.every(e=>e.done)&&Math.abs(V-er)<1e-5*er,V===0);
 ok('bake: both eruptions named in age; the same seed the same bits, another seed other lobes',ages.has(1)&&ages.has(2)&&same&&diff,!diff);
 console.log('      (bake: '+a.ms+' ms, '+a.eruptions.map(e=>e.steps+' steps'+(e.quenched?' quenched':'')).join(', ')+')');}

// ---- the three.js halves parse (they run only on a page: core/terrain/host/46-core-lava-gpu.js, -draw.js)
for(const f of ['46-core-lava-gpu.js','46-core-lava-draw.js']){let e=null;try{new Function(fs.readFileSync(path.join(__dirname,'host',f),'utf8'));}catch(x){e=x;}
 ok('host/'+f+' parses',!e,false);if(e)console.log('      '+e.message);}

// ---- the golden file: a small run klava.gd repeats (core/terrain/klava_test.gd)
{const {F,s}=mk(7);s.run(2*3600);const m=s.mass(),pick=[0,40*81+40,40*81+44,44*81+40,36*81+36,40*81+52];
 const G={format:'krator-lava-golden',version:1,case:'cone 81x81 step 25, slope .12 from (1000,1000) at 3000 m; rough .4 seed 7; vent r 30 Q 300(1-t/4h); run 2 h, dtMax 30',
  heights:KFIELD.b64(F.heights),nx:F.nx,nz:F.nz,x0:F.x0,z0:F.z0,step:F.step,steps:s.steps,t:s.t,mass:{erupted:m.erupted,molten:m.molten,frozen:m.frozen,lost:m.lost},
  cells:pick.map(k=>({k,h:s.h[k],T:s.T[k],dep:s.dep[k]})),sumH:s.h.reduce((a,b)=>a+b,0)};
 const gp=path.join(__dirname,'golden-lava.json');
 if(process.argv.includes('--write')){fs.writeFileSync(gp,JSON.stringify(G,null,1)+'\n',{encoding:'utf8'});console.log('wrote '+gp);}
 const g=JSON.parse(fs.readFileSync(gp,'utf8'));
 ok('golden: the steps, the mass and the sample cells match golden-lava.json',g.steps===G.steps&&Math.abs(g.sumH-G.sumH)<1e-9*Math.max(1,G.sumH)&&g.cells.every((c,i)=>Math.abs(c.h-G.cells[i].h)<1e-9&&Math.abs(c.T-G.cells[i].T)<1e-6),false);}

console.log(bad?bad+' FAILED':'all passed');process.exit(bad?1:0);
