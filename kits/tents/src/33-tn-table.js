// ================================================================= THE TABLE: forms x sizes x roles, as plain data ([G data])
// One source for the tents' numbers: the defs (46-tn-defs.js) draw from it, the interiors set (kits/interiors/sets/tents.js)
// declares the same rooms (tests/test-tents.js compares them), and core/camp's mapping (core/camp/50-camp-tents.js) names
// the def keys it builds. No three.js, no DOM. Metres; a def's local frame has +z its front (the door), x its right.
//   TN_FORMS[form]      {name, style (the core/tags style word), sizes: {s|m|l: the form's parameters}, open (no door to shut),
//                        nest (no interior: too low, open-sided or a cart), door (the flap's kind by default)}
//   TN_ROLES[role]      {kind (the kits/interiors room kind), types (core/tags BUILDING_TYPES), job?, natural (the def a
//                        role takes when nothing else says: a form-size key)}
//   TN_TRADES[trade]    {kind, job}: a workshop tent's trade (smith, hide, seer, weaver)
//   tnKey(form, size)   'tn-<form>-<size>';  tnParse(key) -> {form, size}
//   tnDims(key)         {w, d, h}: the declared box, guy ropes and stakes counted (what core/camp pitches)
//   tnRoom(key)         {poly, h, door: {at, w, swing?}, posts: [[x, z], ...]} in the local frame (the inner face of the
//                       cover: what a walker and the furniture may use; posts the poles standing in it), or {skip: reason}
const TN_FORMS={
 ridge:{name:'Ridge tent',style:'ridge-tent',door:'roll',sizes:{s:{W:3,D:4,wall:1.5,ridge:2.6,door:1.0},m:{W:4,D:5.6,wall:1.7,ridge:3.0,door:1.1},l:{W:5,D:8,wall:1.9,ridge:3.6,door:1.2}}},
 bell:{name:'Bell tent',style:'bell-tent',door:'roll',sizes:{s:{r:2.2,wall:1.35,peak:3.3,door:1.0},m:{r:3,wall:1.45,peak:3.9,door:1.1},l:{r:4,wall:1.55,peak:4.7,door:1.2}}},
 yurt:{name:'Yurt',style:'ger',door:'leaf',sizes:{s:{r:2.6,wall:1.5,crown:2.7,door:.9},m:{r:3.3,wall:1.6,crown:3.1,door:.9},l:{r:4.5,wall:1.8,crown:3.8,door:1.0,posts:true}}},
 cone:{name:'Conical tent',style:'tipi',door:'flap',sizes:{s:{r:2.2,h:4.2,door:.8},m:{r:3,h:5.6,door:.9},l:{r:4,h:7,door:1.0}}},
 black:{name:'Black tent',style:'beit-shaar',open:true,sizes:{m:{w:7,d:4.5,rows:1,ph:2.3,front:1.7,back:.75},l:{w:11,d:5.5,rows:2,ph:2.5,front:1.8,back:.8}}},
 marquee:{name:'Marquee',style:'marquee',door:'tieback',sizes:{m:{s:6,wall:2.2,peak:4.2,door:2.0},l:{s:9,wall:2.4,peak:5.5,door:2.4}}},
 wedge:{name:'Wedge tent',style:'wedge',door:'roll',nest:'too low to furnish: two bedrolls are its own (FURNISH)',sizes:{s:{W:1.5,D:2.2,h:1.1,door:.8},m:{W:2,D:2.8,h:1.4,door:.9}}},
 fly:{name:'Fly (lean-to)',style:'lean-to',open:true,nest:'open-sided: its gear is placed by the builder',sizes:{m:{W:3.6,D:3,front:2.3,back:.8},l:{W:5,D:4,front:2.6,back:.9}}},
 awning:{name:'Awning (stall)',style:'awning',open:true,nest:'open-sided: a stall; its gear is placed by the builder',sizes:{m:{W:3,D:2.6,h:2.3}}},
 roundend:{name:'Round-ended tent',style:'round-ended',door:'roll',sizes:{m:{L:8,B:4,wall:1.6,ridge:3.0,door:1.2},l:{L:12,B:5,wall:1.8,ridge:3.6,door:1.4}}},
 wagon:{name:'Wagon tilt',style:'wagon-tilt',cls:'prop',nest:'a cart bed: loaded, not furnished',sizes:{m:{L:4.2,B:1.9,h:2.9}}},
 screen:{name:'Screen',style:'screen',open:true,nest:'a screen round a pit: not a room',sizes:{s:{W:1.6,D:1.6,h:1.8}}}
};
/* the roles core/camp deals people into (core/camp/PLAN.md section 3): the room kind each furnishes as, its core/tags types and
   job, and the def it takes by default (core/camp's culture rows say which form a people uses for it) */
const TN_ROLES={
 family:{name:'Family tent',kind:'cottage',types:['dwelling-single'],natural:'tn-yurt-m'},
 sleeping:{name:'Sleeping tent',kind:'dormitory',types:['dwelling-multi'],natural:'tn-bell-m'},
 chief:{name:"Chief's tent",kind:'hall',types:['civic','dwelling-single'],natural:'tn-marquee-l'},
 council:{name:'Council tent',kind:'hall',types:['civic'],natural:'tn-marquee-m'},
 workshop:{name:'Workshop tent',kind:'workshop',types:['industry'],natural:'tn-ridge-m'},
 supply:{name:'Supply tent',kind:'store',types:['infrastructure'],job:'warehousing',natural:'tn-ridge-l'},
 trade:{name:'Trade tent',kind:'shop',types:['market'],job:'trading',natural:'tn-awning-m'},
 guard:{name:'Guard tent',kind:'barracks',types:['military'],natural:'tn-wedge-m'},
 mess:{name:'Mess tent',kind:'kitchen',types:['civic'],job:'baking',natural:'tn-roundend-m'},
 stable:{name:'Stable shelter',kind:'stable',types:['farm'],job:'herding',natural:'tn-fly-l'},
 latrine:{name:'Latrine screen',kind:null,types:['infrastructure'],natural:'tn-screen-s'}
};
const TN_TRADES={
 smith:{name:'smithy',kind:'smithy',job:'smithing'},
 hide:{name:'hidemaker',kind:'workshop',job:'tanning'},
 seer:{name:"seer's tent",kind:'shrine',job:'worship',types:['religious']},
 weaver:{name:'weaver',kind:'workshop',job:'weaving'}
};
const TN_SIZE_NAMES={s:'small',m:'medium',l:'large'};
function tnKey(form,size){return 'tn-'+form+'-'+size;}
function tnParse(key){const m=/^tn-([a-z]+)-([sml])$/.exec(key||'');return m?{form:m[1],size:m[2]}:null;}
function tnSpec(key){const p=tnParse(key);if(!p||!TN_FORMS[p.form])return null;const S=TN_FORMS[p.form].sizes[p.size];return S?Object.assign({form:p.form,size:p.size},S):null;}
const TN_R3=v=>Math.round(v*1000)/1000;
/* the declared box: what the builder draws, guy ropes and stakes counted */
function tnDims(key){const S=tnSpec(key);if(!S)return null;const f=S.form;
 if(f==='ridge')return {w:S.W+3.6,d:S.D+2.8,h:S.ridge+.45};
 if(f==='bell')return {w:2*S.r+3.3,d:2*S.r+3.3,h:S.peak+.6};
 if(f==='yurt')return {w:2*S.r+.8,d:2*S.r+.9,h:S.crown+.3};
 if(f==='cone')return {w:2*S.r+.5,d:2*S.r+.5,h:S.h+1.1};
 if(f==='black')return {w:S.w+1,d:S.d+5,h:S.ph+.6};
 if(f==='marquee')return {w:1.5*S.s+.5,d:1.5*S.s+.5,h:S.peak+.9};
 if(f==='wedge')return {w:S.W+1.2,d:S.D+2.4,h:S.h+.35};
 if(f==='fly')return {w:S.W+.6,d:S.D+3.4,h:S.front+.45};
 if(f==='awning')return {w:S.W+2.4,d:S.D+2.4,h:S.h+.5};
 if(f==='roundend')return {w:S.L+3.2,d:S.B+3.4,h:S.ridge+.5};
 if(f==='wagon')return {w:S.B+.6,d:S.L+1.8,h:S.h+.2};
 if(f==='screen')return {w:S.W+.4,d:S.D+.4,h:S.h+.1};
 return null;}
/* the room inside (local frame, inner face of the cover), or why there is none */
function tnRoom(key){const S=tnSpec(key);if(!S)return null;const F=TN_FORMS[S.form];if(F.nest)return {skip:F.nest};
 const circ=(r,n)=>{const out=[];for(let i=0;i<n;i++){const a=(i+.5)/n*Math.PI*2;out.push([TN_R3(r*Math.sin(a)),TN_R3(r*Math.cos(a))]);}return out;};
 const rect=(w,d)=>[[TN_R3(-w/2),TN_R3(-d/2)],[TN_R3(w/2),TN_R3(-d/2)],[TN_R3(w/2),TN_R3(d/2)],[TN_R3(-w/2),TN_R3(d/2)]];
 const f=S.form;
 if(f==='ridge'){const w=S.W-.2,d=S.D-.2;return {poly:rect(w,d),h:S.wall,door:{at:[0,TN_R3(d/2)],w:S.door,swing:'none'},posts:[]};}
 if(f==='bell'){const r=S.r-.15;return {poly:circ(r,16),h:S.wall,door:{at:[0,TN_R3(r)],w:S.door,swing:'none'},posts:[[0,0]]};}
 if(f==='yurt'){const r=S.r-.18,cR=Math.max(.5,S.r*.17);return {poly:circ(r,16),h:S.wall,door:{at:[0,TN_R3(r)],w:S.door,swing:'in'},posts:S.posts?[[TN_R3(-cR*.5),0],[TN_R3(cR*.5),0]]:[]};}
 if(f==='cone'){const r=S.r*.72;return {poly:circ(r,12),h:TN_R3(S.h*.27),door:{at:[0,TN_R3(r)],w:S.door,swing:'none'},posts:[]};}
 if(f==='black'){const w=S.w-.5,d=S.d-.6,rows=S.rows===1?[[-.3,3]]:[[-1,4],[1,4]],posts=[];
  for(const q of rows)for(let i=0;i<q[1];i++)posts.push([TN_R3(-S.w/2+S.w*(i+.5)/q[1]),q[0]]);
  return {poly:rect(w,d),h:TN_R3(S.back+.85),door:{at:[0,TN_R3(d/2)],w:TN_R3(S.w*.55),swing:'none'},posts};}
 if(f==='marquee'){const s=S.s-.3;return {poly:rect(s,s),h:S.wall,door:{at:[0,TN_R3(s/2)],w:S.door,swing:'none'},posts:[[0,0]]};}
 if(f==='roundend'){const B=S.B-.3,hl=(S.L-S.B)/2,out=[];
  for(let i=0;i<=6;i++){const a=-Math.PI/2+i*Math.PI/6;out.push([TN_R3(hl+B/2*Math.cos(a)),TN_R3(B/2*Math.sin(a))]);}
  for(let i=0;i<=6;i++){const a=Math.PI/2+i*Math.PI/6;out.push([TN_R3(-hl+B/2*Math.cos(a)),TN_R3(B/2*Math.sin(a))]);}
  return {poly:out,h:S.wall,door:{at:[0,TN_R3(B/2)],w:S.door,swing:'none'},posts:[[TN_R3(-hl),0],[TN_R3(hl),0]]};}
 return {skip:'no room'};}
/* every def key the kit draws, in sheet order */
const TN_KEYS=[];for(const f in TN_FORMS)for(const s of ['s','m','l'])if(TN_FORMS[f].sizes[s])TN_KEYS.push(tnKey(f,s));
