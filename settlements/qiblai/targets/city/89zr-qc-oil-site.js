// TARGET: city — the oilfield and the mission by the town (the owner, 2026-11-16: "we need to also build the yuni
// mission/oilfield near town"; asked whose, the owner answered both). The Xanadu sim's tune (core/region/data/xan-tune.js,
// XAN_TUNE) puts the field ~2 km south-east of Qiblai (scale model px 925,1598; the town 922,1594): about 300 people work it
// as the Geomancers' concession, wells and a still-house, ~400 t of oil a year, most of it to Qiblai and a fifth to the
// Sultan's citadel as the licence; the Geomancers' caravans stop at Qiblai on their way in and out. The owner's lore (the
// same day): "if the geomancers have a presence at qiblai it will likely be partly electrified. the council will take its
// cut", and, relayed later that day: "Qiblai will be electrified along all major avenues and in buildings except in poor
// areas": the Prismarchy's generator burns its cut (a tenth; the Sultan's licence a fifth) and lights the town (90v), and the
// council keeps a tithe house on the field's road.
// Beside the concession stands Yuni's mission (the Order's chapter house, its school, bell tower and bathhouse behind a
// gatehouse). The site here is plain data (the records, the road, the pads); 90v-qc-oilfield.js draws it with the Yuni
// engine's kit (gen/69y-ykit-bundle.js: the Yuni kit's civic buildings, the Locus kit's petroleum, power and dwellings).
// The town's flora and its ground's zone mask keep off it (QC_OIL.mask: 89zq; QC_OIL.paint: 90q).
const QC_OIL=(function(){const B=QC_B,O=[960,B.z1+640],at=(dx,dz)=>[O[0]+dx,O[1]+dz],N=Math.PI;   /* N: a front turned north, to the town */
 const J=(id,k,a)=>((qcHash(id+':'+k)%1000)/1000-.5)*2*a;   /* a jitter seeded by the record's id, never by draw order */
 const A=[],add=(key,dx,dz,ry,o)=>{const p=at(dx,dz),id='oil:'+key+':'+A.length;A.push(Object.assign({key,x:p[0],z:p[1],ry:ry==null?0:ry,id,seed:qcHash(id)%100000,v:0,wealth:.5},o||{}));};
 // the Geomancers' yard: the still-house (Locus's refinery), its tanks in their bunds, the pipe racks between, the generator
 // house, two warehouses, drum stacks; their chapterhouse; the fuel station where the road comes in
 add('ind_refinery',0,0,N,{culture:'geomancer',site:'yard',name:'The still-house (the Geomancers\' refinery)'});
 for(const [dx,dz] of[[64,-30],[90,-30],[64,-4],[90,-4]])add('ind_oil_tank',dx,dz,0,{culture:'geomancer',site:'yard'});
 for(const [dx,dz,ry] of[[38,-22,N/2],[38,6,N/2]])add('prop_pipe_rack',dx,dz,ry,{culture:'geomancer',site:'yard'});
 add('ind_generator_house',-58,-26,N,{culture:'geomancer',site:'yard',name:'The generator house (the town\'s light)'});
 for(const [dx,dz] of[[-52,34],[-14,46]])add('locus_warehouse',dx,dz,N,{culture:'geomancer',site:'yard'});
 for(const [dx,dz] of[[-30,4],[18,36],[50,32],[-80,-8]])add('prop_drum_stack',dx,dz,0,{culture:'geomancer',site:'yard'});
 add('civic_geomancer_chapterhouse',-118,18,N,{culture:'geomancer',site:'yard',wealth:.6});
 add('trade_fuel_station',-132,-74,N,{culture:'geomancer',site:'road',name:'The caravans\' fuel station'});
 // the wells: twelve pumpjacks over the field to the east and south, each on its own spot (a grid, jittered by its id)
 for(let i=0;i<12;i++){const id='well'+i;add('ind_pumpjack',132+(i%4)*58+J(id,'x',14),-64+Math.floor(i/4)*86+J(id,'z',14),J(id,'r',N),{culture:'geomancer',site:'wells',v:i%2,wealth:.3+(i%3)*.2});}
 // the workers' village (about 300 people): stilt houses in three rows, the tent pavilions of the newest hands
 for(let r=0;r<3;r++)for(let c=0;c<8;c++){const id='house'+r+'.'+c,dx=-150+c*22+J(id,'x',3),dz=118+r*30+J(id,'z',3);
  if(r===2&&c>=4)add('tent_pavilion',dx,dz,N,{culture:'geomancer',site:'village'});else add((r+c)%3===0?'stilt_mid':'stilt_poor',dx,dz,N,{culture:'geomancer',site:'village',wealth:(r+c)%3===0?.5:.25});}
 // Yuni's mission: its chapter house behind a gatehouse on the road, the school, the bell tower, the bathhouse (its infirmary)
 add('park_gatehouse',-190,-178,N,{culture:'yuni',site:'mission',name:'The mission\'s gatehouse'});
 add('civic_chapter_house',-190,-232,N,{culture:'yuni',site:'mission',wealth:.6,name:'The mission (the Order\'s chapter house)'});
 add('civic_school',-246,-214,N/2,{culture:'yuni',site:'mission',name:'The mission school'});
 add('civic_bell_tower',-150,-246,0,{culture:'yuni',site:'mission',name:'The mission\'s bell tower'});
 add('civic_bathhouse',-136,-206,-N/2,{culture:'yuni',site:'mission',name:'The mission bathhouse (its infirmary)'});
 // the Prismarchy's generator house, by the south road under the walls: it burns the council's cut of the oil (a tenth; the
 // Sultan's licence a fifth) and lights the town (90v; the owner, relayed 2026-11-16: "Qiblai will be electrified along all
 // major avenues and in buildings except in poor areas ... just enough to use the cut of oil they get from Yuni")
 {const g=[34,B.z1+110];A.push({key:'ind_generator_house',x:g[0],z:g[1],ry:-N/2,id:'oil:council-generator',seed:qcHash('oil:council-generator')%100000,v:0,wealth:.6,
  culture:'geomancer',site:'town',name:'The Prismarchy\'s generator house (it burns the council\'s cut of the oil)'});}
 // the Prismarchy's tithe house on the road (the council's cut): a Qiblai gate temple, drawn with the city's own kit (90r)
 const tp=at(-96,-120);QC_PLACE.push({key:'qb_gate_temple',x:tp[0],z:tp[1],ry:-N*.79,o:{v:1,y:terrainH(tp[0],tp[1])},kind:'oil',id:'oil:tithe',h:14,
  name:'The Prismarchy\'s tithe house (the council\'s cut of the oil)'});
 // the road: off the town's south road 260 m out, past the tithe house and the mission's gate, to the fuel station and the yard;
 // tracks from the yard to each well. The pads: the yard, the village, the mission's court
 const road=[[0,B.z1+260],at(-300,-200),at(-170,-160),at(-132,-90),at(-60,-40)];
 const tracks=A.filter(R=>R.key==='ind_pumpjack').map(R=>[at(60,-14),[R.x,R.z]]);
 const pads=[{box:[O[0]-150,O[1]-60,O[0]+110,O[1]+60],kind:'yard'},{box:[O[0]-165,O[1]+100,O[0]+20,O[1]+190],kind:'village'},{box:[O[0]-280,O[1]-270,O[0]-110,O[1]-165],kind:'mission'},{box:[tp[0]-15,tp[1]-15,tp[0]+15,tp[1]+15],kind:'tithe'}];
 const segD=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L2=dx*dx+dz*dz,t=L2?Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/L2)):0;return Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);};
 const lineD=(x,z,P)=>{let d=1e9;for(let i=1;i<P.length;i++)d=Math.min(d,segD(x,z,P[i-1],P[i]));return d;};
 // no tree on the pads, the road (8 m and a margin), the tracks, or within 14 m of a well
 const cg=A.find(R=>R.id==='oil:council-generator');pads.push({box:[cg.x-16,cg.z-14,cg.x+16,cg.z+14],kind:'yard'});
 const mask=(x,z)=>{if(qcInBox(pads[pads.length-1].box,x,z,4))return true;
  if(Math.abs(x-O[0])>420||Math.abs(z-O[1])>380)return x>-30&&x<O[0]&&z>B.z1+200&&z<O[1]&&lineD(x,z,road)<10;
  for(const p of pads)if(qcInBox(p.box,x,z,6))return true;if(lineD(x,z,road)<10)return true;
  for(const t of tracks)if(segD(x,z,t[0],t[1])<5)return true;for(const R of A)if(R.key==='ind_pumpjack'&&Math.hypot(x-R.x,z-R.z)<14)return true;return false;};
 return{O,assets:A,road,tracks,pads,mask,tithe:tp};})();
