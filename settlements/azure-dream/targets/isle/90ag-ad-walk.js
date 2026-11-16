// ================================================================= GRĒṬ-ĀIL — walking into the Hall of Dreaming; the lotus ponds' water
// The Hall in core/walk (KWALK), as Qiblai's walk-in rooms are (settlements/qiblai 90t): the plinth and its covered kora, the
// steps up it, the hall's floor in two halves (the women's side east of the lattice, the men's west), the thresholds through its
// two doors (the foot's door and the Waking Door), and what a walker cannot pass: the walls (gapped at the doors), the 136
// columns, the lattice down the Keepers' Walk, the turnings' screens, the 256 cots, the shrine's altar, the kora's posts and
// its great wheel. The hall's two drawn doors (core/door, kits/qiblai qnDoor) are unlocked. _adWalk.walkIn() is verify.py's
// hall-walk-in: from the terrace before the steps, the doors open, a walker reaches the kora and both sides of the hall; from
// the shrine, the kora again (out by either door). Then the Lotus Garden's four ponds: their water on core/water (WATER.still,
// drawStill) over each pond's basin (89qa AD_POND). [web]: core/walk and core/door are plain data, the water draws.
reseed(34155);
const AD_WALK=(function(){const KW=typeof KWALK!=='undefined'?KWALK:null,S={floors:0,blocks:0,doors:0,leaves:[]};if(!KW)return S;
 const HP=AD_PLACE.find(p=>p.id==='hall-of-dreaming'),A=AD_HALL,y0=HP.o.y,P=A.P,HX=A.HX,HZ=A.HZ,T=A.T,yF=y0+P+.06;
 if(Math.abs(HP.ry)>1e-6)throw new Error('azure-dream: the hall\'s walk records assume it unturned');   /* KWALK.block is axis-aligned */
 const X=HP.x,Z=HP.z,tagP='hall:';
 const rect=(x0,x1,z0,z1,y,tag)=>{KW.poly({pts:[[X+x0,Z+z0,y],[X+x1,Z+z0,y],[X+x1,Z+z1,y],[X+x0,Z+z1,y]],name:tag,tag:tagP+tag});S.floors++;};
 const blk=(x0,x1,z0,z1,ya,yb,tag)=>{KW.block([X+x0,X+x1,Z+z0,Z+z1,ya,yb],tagP+tag);S.blocks++;};
 // the floors
 rect(-21,21,-33,33,y0+P,'kora');                                   /* the plinth's top: the covered kora round the hall */
 KW.strip({a:[X,Z+HZ+3.6+2.4,y0],b:[X,Z+33,y0+P],w:6,name:'hall steps',tag:tagP+'steps'});S.floors++;
 rect(0,HX-T,-(HZ-T),HZ-T,yF,'east');rect(-(HX-T),0,-(HZ-T),HZ-T,yF,'west');   /* the women's side and the men's, meeting on the lattice's line */
 KW.strip({a:[X,Z+HZ+.5,y0+P],b:[X,Z+HZ-T-.4,yF],w:2.2,name:'hall door',tag:tagP+'door'});
 KW.strip({a:[X-HX-.5,Z+26,y0+P],b:[X-HX+T+.4,Z+26,yF],w:1.3,name:'waking door',tag:tagP+'waking-door'});S.floors+=2;
 // the walls, gapped at the doors (the foot's x -1.4..1.4; the Waking Door's z 25.1..26.9 in the west wall)
 const W0=yF-.06,W1=yF+A.H1+1;
 for(const [a,b] of[[-HX,-1.4],[1.4,HX]])blk(a,b,HZ-T,HZ,W0,W1,'wall.foot');blk(-HX,HX,-HZ,-HZ+T,W0,W1,'wall.head');
 blk(HX-T,HX,-HZ+T,HZ-T,W0,W1,'wall.east');blk(-HX,-HX+T,-HZ+T,25.1,W0,W1,'wall.west');blk(-HX,-HX+T,26.9,HZ-T,W0,W1,'wall.west');
 // the columns, the lattice, the screens, the cots, the altar
 for(let z=24;z>=-24;z-=3)for(const x of[-12,-9,-6,-3,3,6,9,12])blk(x-.22,x+.22,z-.22,z+.22,yF,yF+A.H1,'column');
 blk(-.07,.07,-24,24,yF,yF+1.1,'lattice');
 for(const s of[-1,1])for(let k=0;k<=4;k++){const z=24-12*k;blk(s>0?4.2:-15,s>0?15:-4.2,z-.05,z+.05,yF,yF+1.2,'screen');}
 for(const c of A.cots)blk(c[0]-.98,c[0]+.98,c[2]-.4,c[2]+.4,yF,yF+.5,'cot');
 blk(-1.8,1.8,-HZ+T,-HZ+T+1.3,yF,yF+3.8,'shrine');
 // the kora's posts and its great wheel
 for(const s of[-1,1])for(let z=-32.6+1.6;z<=32.6-1.6;z+=3.2)blk(s*20.6-.15,s*20.6+.15,z-.15,z+.15,y0+P,y0+P+3.4,'kora.post');
 for(const s of[-1,1])for(let x=-20.6;x<=20.6;x+=3.2){if(s>0&&Math.abs(x)<2.5)continue;blk(x-.15,x+.15,s*32.6-.15,s*32.6+.15,y0+P,y0+P+3.4,'kora.post');}
 blk(-1.6,1.6,-32.6,-29.4,y0+P,y0+P+3.4,'kora.wheel');
 // the hall's two drawn doors, unlocked (core/door's records nearest each doorway)
 const near=(x,y,z,r)=>{let best=null,bd=r;for(const D of KDOOR.list){const d=Math.hypot(D.at[0]-x,D.at[2]-z);if(Math.abs(D.at[1]-y)<1.2&&d<bd){bd=d;best=D;}}return best;};
 for(const [x,z] of[[X,Z+HZ],[X-HX,Z+26]]){const D=typeof KDOOR!=='undefined'?near(x,y0+P,z,2.2):null;if(D){D.locked=false;S.leaves.push(D);S.doors++;}}
 // every drawn door's leaf a walk block (core/door: shut, it closes its doorway; open, it clears it), as Qiblai's lots and Locus do
 if(typeof KDOOR!=='undefined')KDOOR.walk(KW);
 // the walk-in check. Its negative first: the doors shut, the walker from the terrace stays out of the hall. Then the doors
 // opened: from the terrace before the steps, the kora and both sides; from the shrine, the kora
 S.walkIn=function(){const box=[X-48,X+48,Z-48,Z+52],step=()=>{for(let i=0;i<40;i++)KDOOR.step(.1);};
  const got=(R,t)=>R.reached.some(F=>F.tag===tagP+t),out=[],start=[[X,terrainH(X,Z+HZ+9),Z+HZ+9]];
  for(const D of S.leaves)KDOOR.close(D);step();
  const R0=KW.reach(start,{ground:terrainH,box}),shutIn=['east','west'].filter(t=>got(R0,t));
  for(const D of S.leaves)KDOOR.open(D,{by:'player'});step();
  const R1=KW.reach(start,{ground:terrainH,box});
  out.push({from:'the terrace before the steps',miss:['kora','east','west'].filter(t=>!got(R1,t))});
  const R2=KW.reach([[X,yF,Z-HZ+T+2.2]],{ground:terrainH,box});
  out.push({from:'the shrine',miss:['kora','east','west'].filter(t=>!got(R2,t))});
  for(const D of S.leaves)KDOOR.close(D);step();
  return{doors:S.leaves.length,routes:out,shutIn,ok:S.leaves.length===2&&!shutIn.length&&out.every(r=>!r.miss.length)};};
 return S;})();
window._adWalk=AD_WALK;
// ---------------------------------------------------------------- the lotus ponds' water
const AD_POND_WATER=AD_PONDS.map((p,i)=>{
 const a=AD_POND,hw=a.W/2-a.K,hd=a.D/2-a.K,pool=WATER.still({name:'Lotus pond '+(i+1),level:p.o.y+a.level,bounds:[p.x-hw,p.z-hd,p.x+hw,p.z+hd]});
 WATER.drawStill(pool,{color:0x2a5450,opacity:.92});return pool;});
