// TARGET: spire — view presets. The first entry is the opening shot.
// DERIVED from SHZ_SITE, which buildSpire fills per decay (this file runs after
// 90-scene.js); SHDEF is the fallback if a builder threw.
const SHDEF={x:0,z:0,YTOP:804,B2:540,HL:900,OR:624,CC:[250,400,250],RC:240,
 HUNG:{x:90,z:90,y0:360,y1:500,r:16,yU:537},INCL:{p:[315,358,315],o:[.58,.58,.58],u:[.5,-.7,.5]},FALL:[480,330]};
const SHS=d=>Object.assign({},SHDEF,{x:SITEX(ROWS.spire,d)},SHZ_SITE[d]||{});
const SHI=SHS(0),SHR=SHS(1),SHH=SHS(3);
const SHV=(S,c,t,n)=>[S.x+c[0],c[1],S.z+c[2],S.x+t[0],t[1],S.z+t[2]].concat(n?[1]:[]);
// THE HERO: three-quarter from the south-east, the +x and +z faces toward the
// camera (the ruin's failed sector is on the south-east arris, square in the middle of it).
const SHHERO=(S,n)=>SHV(S,[1080,230,1500],[0,330,0],n);
const shHung=S=>{const h=S.HUNG||SHDEF.HUNG;return SHV(S,[h.x+95,h.y1+14,h.z+150],[h.x,h.y1+6,h.z]);};
const shIncl=S=>{const ic=S.INCL||SHDEF.INCL;return SHV(S,[ic.p[0]+ic.o[0]*70+40,ic.p[1]+ic.o[1]*70+25,ic.p[2]+ic.o[2]*70-40],ic.p);};
const VIEWS={
 'The Hanging City':        SHHERO(SHI),
 // square on to the south face: the octahedral lattice drawn as triangles
 'South elevation':         SHV(SHI,[0,430,2250],[0,400,0]),
 // into the lattice from just outside the +z face, half way up
 'Into the lattice':        SHV(SHI,[170,470,360],[-80,420,-60]),
 // a hung tower and the node it hangs from
 'A hung tower':            shHung(SHI),
 // an inclinator cab on its rails up the south-east arris
 'Inclinator':              shIncl(SHI),
 // from a boat in the lagoon: piers, the podium ring, a causeway
 'Piers and podium':        SHV(SHI,[300,12,740],[60,60,430]),
 // standing on the water under the frame, looking straight up the core
 'Up through the frame':    SHV(SHI,[32,9,24],[0,700,8]),
 'From above':              SHV(SHI,[0,2700,380],[0,0,0]),
 'By night':                SHHERO(SHI,1),
 'Ruined':                  SHHERO(SHR),
 // the failed sector of the south-east arris, from outside it
 'The collapse':            SHV(SHR,[SHR.CC[0]+560,SHR.CC[1]-40,SHR.CC[2]+420],[SHR.CC[0]-40,SHR.CC[1]-40,SHR.CC[2]]),
 // what fell: members, nodes and two hung towers lying in the lagoon
 'Fallen in the lagoon':    (function(S){const f=S.FALL||SHDEF.FALL;return SHV(S,[f[0]+230,55,f[1]+300],[f[0],6,f[1]]);})(SHR),
 'Ruin inside the lattice': SHV(SHR,[170,470,360],[-80,420,-60]),
 'Rehabilitated':           SHHERO(SHH),
 'Rehabilitated podium':    SHV(SHH,[300,12,740],[60,60,430]),
 'The row':                 [0,1600,5000,0,300,0],
};
