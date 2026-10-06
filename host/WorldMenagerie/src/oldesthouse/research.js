// ---------- the Research Sector ----------
// Fan work after Remedy Entertainment's Control (2019); nothing of theirs is used.
//
// Laid out round its origin (data/cities/oldesthouse.json: research.at), x east, z south, y up, metres:
//   the way in        a corridor from the Executive's transit corridor at the east edge (x +180) to the atrium
//   Central Research  a tall bright atrium sixty metres square and forty high, three redwoods growing up through
//                     it to the skylight, white concrete balconies stepping round it at ten, twenty and thirty
//                     metres, planted along their fronts with greenery hanging down, a broad stair
//   the labs          a corridor west off the atrium with three labs either side - Synchronicity, Luck and
//                     Probability (shelves of beckoning cats, dice), Parapsychology; Hypnosis (the spiral),
//                     Extrasensory (the tanks), Protective Studies (the bunker doors) - and the Ritual Division
//                     at its end, its circle of candles on the floor
//   the Hedron        south, up at the twenty-metre balcony: a round chamber sixty metres across the radius and
//                     eighty from pit to roof, three walkways meeting in a Y over the drop, and over the middle
//                     the Hedron itself, a dark faceted crystal lit from within, turning; Dimensional Research
//                     off its east side
//   the Ashtray Maze  north, down a long corridor: a twisting passage of sunburst paper, red carpet, wainscot,
//                     sconces and doors. The event rides it while the walls and floor come apart and reassemble
//                     round you.
export function buildResearch(K){
  const {THREE,B,F,lights}=K,[ox,oy,oz]=K.O,R=K.rnd;
  const X=x=>ox+x,Y=y=>oy+y,Z=z=>oz+z;

  // ================================================================ the way in from the transit corridor
  B.room({floor:'terrazzo',wall:'panel',ceil:'ceiling:ceil'},X(30),Y(0),Z(-4),X(180),Y(5),Z(4),{w:[[0,8,5]],e:[[0,8,5]]});
  F.panels(X(36),Z(0),X(176),Z(0),Y(5),6,0.8,12);
  for(let x=40;x<180;x+=20){F.plant(X(x),Y(0),Z(-3.3),0.8);}

  // ================================================================ Central Research
  const AH=40;
  B.room({floor:'terrazzo',wall:'panel',ceil:'ceiling:ceil'},X(-30),Y(0),Z(-30),X(30),Y(AH),Z(30),
    {e:[[26,34,5]],w:[[26,34,5]],n:[[25.8,34.2,4.5]],s:[[26,34,25]]});
  // below the Hedron corridor's door in the south wall: wall again, up to the twenty-metre balcony
  B.box('panel',X(-4),Y(0),Z(29.8),X(4),Y(20),Z(30.2));
  // the skylight: the whole middle of the roof lit white, and the light coming down
  B.box('lightWhite',X(-17),Y(AH-0.3),Z(-17),X(17),Y(AH-0.1),Z(17),['py']);
  lights.add([X(0),Y(AH-3),Z(0)],0xf2fff0,1.5,75);
  for(const [a,b] of [[-14,-14],[14,-14],[14,14],[-14,14]])lights.add([X(a),Y(AH-4),Z(b)],0xe8f8e8,0.7,40);
  lights.zone([X(-30),Y(0),Z(-30)],[X(30),Y(AH),Z(30)],0xa8b8a0,0.35);
  // the balconies: north, west and south, at ten, twenty and thirty metres, each a different depth so the edges
  // step and jut; a planter along each front, greenery spilling over and hanging down; lights under each
  const balcony=(side,y,depth)=>{let x0,x1,z0,z1,front;
    if(side==='n'){x0=-30;x1=30;z0=-30;z1=-30+depth;front=[[-30,z1],[30,z1]];}
    else if(side==='s'){x0=-30;x1=30;z0=30-depth;z1=30;front=[[-30,z0],[30,z0]];}
    else{x0=-30;x1=-30+depth;z0=-30+(y===10?7:9);z1=30-(y===20?9:7);front=[[x1,z0],[x1,z1]];}
    B.box('panel',X(x0),Y(y-0.7),Z(z0),X(x1),Y(y),Z(z1));
    const [[fx0,fz0],[fx1,fz1]]=front,alongX=fz0===fz1,inX=side==='w'?-1:0,inZ=side==='n'?-1:side==='s'?1:0;
    // the planter: a slanted concrete trough along the front
    if(alongX){const zf=fz0;B.box('panel',X(fx0),Y(y),Z(Math.min(zf,zf-inZ*1.2)),X(fx1),Y(y+1.1),Z(Math.max(zf,zf-inZ*1.2)));
      B.box('leaf',X(fx0+0.3),Y(y+1.1),Z(Math.min(zf,zf-inZ*1.1)),X(fx1-0.3),Y(y+1.7),Z(Math.max(zf,zf-inZ*1.1)));}
    else{const xf=fx0;B.box('panel',X(xf-1.2),Y(y),Z(fz0),X(xf),Y(y+1.1),Z(fz1));B.box('leaf',X(xf-1.1),Y(y+1.1),Z(fz0+0.3),X(xf-0.1),Y(y+1.7),Z(fz1-0.3));}
    // greenery hanging over the front, in uneven strands
    const n=Math.floor(Math.hypot(fx1-fx0,fz1-fz0)/1.6);
    for(let k=0;k<n;k++){const t=(k+R())/n,hx=fx0+(fx1-fx0)*t,hz=fz0+(fz1-fz0)*t,L=0.8+R()*(y>12?3.2:1.8);if(R()<0.55)continue;
      B.blk('leaf',X(hx+(alongX?0:0.15)),Y(y-0.7-L),Z(hz+(alongX?(side==='n'?0.15:-0.15):0)),0.25+R()*0.35,L,0.2);}
    // the lights under the slab
    if(alongX)F.panels(X(-26),Z((z0+z1)/2),X(26),Z((z0+z1)/2),Y(y-0.7),6,0.7,11);
    else F.panels(X((x0+x1)/2),Z(z0+3),X((x0+x1)/2),Z(z1-3),Y(y-0.7),6,0.7,11);};
  balcony('n',10,7);balcony('n',20,10);balcony('n',30,5);
  balcony('w',10,8);balcony('w',20,6);balcony('w',30,10);
  balcony('s',10,6);balcony('s',20,7);balcony('s',30,8);
  // the broad stair up to the north balcony, and a second from there to the west's twenty-metre level
  B.stairs('panel',X(10),Y(0),Z(-5),Math.PI/2,8,0.25,0.425,40,'steelDark');
  B.stairs('panel',X(-25.5),Y(10),Z(-21),-Math.PI/2,4,0.25,0.425,40,'steelDark');
  // the lab fronts on the ground floor: glass in concrete frames along the east wall either side of the way in
  for(const zz of [-24,-14,14,24]){B.box('glass',X(29.6),Y(0.5),Z(zz-4),X(29.9),Y(4),Z(zz+4));B.box('panel',X(29.4),Y(4),Z(zz-4.5),X(30),Y(4.6),Z(zz+4.5));}
  // the redwoods: great tapering trunks through the full height, crowns high up under the skylight, each in a
  // planted bed
  const TREES=[[8,6,2.7],[-11,12,2.3],[13,-13,2.0]];
  for(const [tx,tz,r] of TREES){B.cyl('concreteDark',X(tx),Y(0),Z(tz),r+2.2,r+2.2,0.9,16,{caps:true});
    for(let k=0;k<8;k++){const a=k/8*Math.PI*2;B.blk('leaf',X(tx+Math.cos(a)*(r+1.3)),Y(0.9),Z(tz+Math.sin(a)*(r+1.3)),1.4,0.7+R()*0.6,1.4);}
    /* the trunk: flared at the foot, buttress roots out into the bed, tapering up through the whole atrium */
    B.cyl('bark',X(tx),Y(0),Z(tz),r*1.7,r*1.05,3,14);B.cyl('bark',X(tx),Y(3),Z(tz),r*1.05,r*0.42,AH+1,14);
    for(let k=0;k<6;k++){const a=k/6*Math.PI*2+R();B.beam('bark',[X(tx+Math.cos(a)*r*0.8),Y(2.6),Z(tz+Math.sin(a)*r*0.8)],[X(tx+Math.cos(a)*(r+2)),Y(0.2),Z(tz+Math.sin(a)*(r+2))],0.9,1.2);}
    /* the crown: tiers of branches from twenty metres up, long below and short at the top, each drooping a little
       and carrying a flat layer of dark needles - the narrow, layered spire a redwood makes */
    for(let h=19;h<=AH+3;h+=2.3){const u=(h-19)/(AH+3-19),Lb=7.5*(1-u)+1.6,n=6+Math.floor(R()*3),rr=r*(1.05-0.6*(h/(AH+4)));
      for(let k=0;k<n;k++){const a=k/n*Math.PI*2+R()*0.8+h,ex=tx+Math.cos(a)*(rr+Lb),ez=tz+Math.sin(a)*(rr+Lb),ey=h-Lb*0.25;
        B.beam('bark',[X(tx+Math.cos(a)*rr),Y(h),Z(tz+Math.sin(a)*rr)],[X(ex),Y(ey),Z(ez)],0.35,0.35);
        B.at(X(tx+Math.cos(a)*(rr+Lb*0.55)),Y(ey+0.2),Z(tz+Math.sin(a)*(rr+Lb*0.55)),-a);B.box(k%3?'leafDark':'leaf',-Lb*0.55,0,-1.1,Lb*0.55,0.9,1.1);B.box('leafDark',-Lb*0.4,-0.6,-1.6,Lb*0.4,0.1,1.6);B.pop();}}
    B.cyl('leafDark',X(tx),Y(AH+3),Z(tz),1.6,0.2,3.5,8);}
  for(let k=0;k<12;k++)F.plant(X(-26+R()*52),Y(0),Z(-26+R()*10+(k%2?40:0)),1.1);

  // ================================================================ the labs, west off the atrium
  B.room({floor:'carpetGrey',wall:'panel',ceil:'ceiling:ceil'},X(-120),Y(0),Z(-4),X(-30),Y(5),Z(4),
    {e:[[0,8,5]],w:[[0,8,5]],n:[[14,16,2.6],[39,41,2.6],[64,66,2.6]],s:[[14,16,2.6],[39,41,2.6],[64,66,2.6]]});
  F.panels(X(-116),Z(0),X(-34),Z(0),Y(5),5,0.8,10);
  const LABS=[['Synchronicity',-105,-1],['Luck and Probability',-80,-1],['Parapsychology',-55,-1],['Hypnosis',-105,1],['Extrasensory',-80,1],['Protective Studies',-55,1]];
  for(const [name,c,side] of LABS){const z0=side<0?-24:4,z1=side<0?-4:24;
    B.room({floor:name==='Hypnosis'?'carpetDark':'tile',wall:'panel',ceil:'ceiling:ceil'},X(c-11),Y(0),Z(z0),X(c+11),Y(5),Z(z1),side<0?{s:[[10,12,2.6]]}:{n:[[10,12,2.6]]});
    F.doorframe(X(c),Y(0),Z(side<0?-4:4),0,2,2.6);
    F.panels(X(c-7),Z((z0+z1)/2-4),X(c+7),Z((z0+z1)/2-4),Y(5),7,0.8,10);F.panels(X(c-7),Z((z0+z1)/2+4),X(c+7),Z((z0+z1)/2+4),Y(5),7,0.8,10);
    // the sign over the door: a dark plate
    B.box('steelDark',X(c-2),Y(2.9),Z(side<0?-3.95:3.75),X(c+2),Y(3.4),Z(side<0?-3.75:3.95));}
  // -- Synchronicity: clocks on every wall, all telling a different time; desks of terminals
  {const c=-105;for(let i=0;i<9;i++)for(const zz of [-23.85]){const x=c-9+i*2.25,y=2.4+(i%2)*0.8;B.box('white',X(x-0.45),Y(y-0.45),Z(zz),X(x+0.45),Y(y+0.45),Z(zz+0.05));
      const a=R()*6.3;B.beam('black',[X(x),Y(y),Z(zz+0.08)],[X(x+Math.cos(a)*0.35),Y(y+Math.sin(a)*0.35),Z(zz+0.08)],0.04,0.04);}
    for(let i=0;i<3;i++){F.desk(X(c-6+i*6),Y(0),Z(-14),0);F.terminal(X(c-6+i*6+0.4),Y(0),Z(-15.6),0);F.chair(X(c-6+i*6),Y(0),Z(-12.8),Math.PI);}}
  // -- Luck and Probability: tiers of beckoning cats along the back wall, a table of dice, a big die
  {const c=-80;for(let t=0;t<4;t++){B.box('woodDark',X(c-10),Y(0),Z(-23.8+t*0.6),X(c+10),Y(0.5+t*0.5),Z(-23.2+t*0.6));
      for(let i=0;i<26;i++){const x=c-9.6+i*0.75,y=0.5+t*0.5,zz=-23.5+t*0.6;B.box('white',X(x-0.12),Y(y),Z(zz-0.1),X(x+0.12),Y(y+0.26),Z(zz+0.1));
        B.box('white',X(x-0.11),Y(y+0.26),Z(zz-0.1),X(x+0.11),Y(y+0.46),Z(zz+0.1));B.box('red',X(x-0.05),Y(y+0.18),Z(zz+0.1),X(x+0.05),Y(y+0.22),Z(zz+0.12));
        B.box('white',X(x+0.1),Y(y+0.3),Z(zz-0.03),X(x+0.17),Y(y+0.52),Z(zz+0.03));}}
    B.box('wood',X(c-3),Y(0.8),Z(-12),X(c+3),Y(0.85),Z(-9));for(const s of [-1,1])B.box('steelDark',X(c+s*2.8-0.06),Y(0),Z(-11.8),X(c+s*2.8+0.06),Y(0.8),Z(-9.2));
    for(let i=0;i<14;i++){const x=c-2.5+R()*5,zz=-11.7+R()*2.4;B.box('white',X(x-0.06),Y(0.85),Z(zz-0.06),X(x+0.06),Y(0.97),Z(zz+0.06));}
    B.box('white',X(c+6),Y(0),Z(-10),X(c+7.4),Y(1.4),Z(-8.6));for(const [a,b] of [[0.3,0.3],[1.1,1.1],[0.7,0.7]])B.box('black',X(c+6+a-0.1),Y(1.4),Z(-10+b-0.1),X(c+6+a+0.1),Y(1.42),Z(-10+b+0.1));
    F.lamp(X(c-8),Y(3.6),Z(-14),0xffe0b0,0.6,7);}
  // -- Parapsychology: a round table, chairs round it, an orb glowing over it; heavy curtains
  {const c=-55;B.cyl('wood',X(c),Y(0.75),Z(-14),2.2,2.2,0.08,16,{caps:true});B.cyl('steelDark',X(c),Y(0),Z(-14),0.25,0.25,0.75,8);
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2;F.chair(X(c+Math.cos(a)*3),Y(0),Z(-14+Math.sin(a)*3),-a-Math.PI/2);}
    B.blk('lightBlue',X(c),Y(2.6),Z(-14),0.5,0.5,0.5);lights.add([X(c),Y(2.6),Z(-14)],0x9ac8ff,0.9,8);
    for(let i=0;i<8;i++)B.box('carpetDark',X(c-10.5+i*2.7),Y(0),Z(-23.8),X(c-9+i*2.7),Y(4.8),Z(-23.3+(i%2)*0.3));}
  // -- Hypnosis: the great spiral on the back wall, chairs facing it, a lamp
  {const c=-105,zw=23.85;let px=null;for(let i=0;i<=260;i++){const a=i*0.11,r=0.08+a*0.11,x=c+Math.cos(a)*r,y=2.5+Math.sin(a)*r;
      if(px&&r<2.4)B.beam(i%2?'black':'white',[X(px[0]),Y(px[1]),Z(zw)],[X(x),Y(y),Z(zw)],0.16,0.05);px=[x,y];}
    B.box('white',X(c-2.6),Y(0.1),Z(zw+0.02),X(c+2.6),Y(4.9),Z(zw+0.08));
    for(let i=0;i<4;i++)F.chair(X(c-4.5+i*3),Y(0),Z(14),Math.PI);F.lamp(X(c+7),Y(3.4),Z(10),0xffc880,0.6,8);}
  // -- Extrasensory: four sensory-deprivation tanks, white capsules with dark windows, pipes to the wall
  {const c=-80;for(let i=0;i<4;i++){const x=c-7.5+i*5;B.box('white',X(x-1.1),Y(0),Z(12),X(x+1.1),Y(1.4),Z(20));B.cyl('white',X(x),Y(0),Z(12),1.1,1.1,1.4,10,{a0:Math.PI,a1:Math.PI*2,caps:true});
      B.box('black',X(x-0.5),Y(1.4),Z(14),X(x+0.5),Y(1.42),Z(17));F.pipe([X(x),Y(0.4),Z(20)],[X(x),Y(0.4),Z(23.6)],0.15,'steel');}
    F.terminal(X(c+9),Y(0),Z(8),Math.PI);}
  // -- Protective Studies: two bunker doors in the back wall - thick steel, a wheel, hazard stripes round them
  {const c=-55,zw=23.6;for(const dx of [-5,5]){const x=c+dx;B.box('steelDark',X(x-1.8),Y(0),Z(zw-0.5),X(x+1.8),Y(3.6),Z(zw+0.4));
      for(let k=0;k<8;k++){const a=k/8*Math.PI*2,b=(k+1)/8*Math.PI*2;B.beam('steel',[X(x+Math.cos(a)*0.8),Y(1.8+Math.sin(a)*0.8),Z(zw-0.6)],[X(x+Math.cos(b)*0.8),Y(1.8+Math.sin(b)*0.8),Z(zw-0.6)],0.1,0.1);}
      for(let k=0;k<6;k++)B.box(k%2?'yellow':'black',X(x-2.2+k*0.73),Y(3.7),Z(zw-0.55),X(x-2.2+(k+1)*0.73),Y(4.0),Z(zw-0.45));}
    for(let i=0;i<4;i++)F.cabinet(X(c-9),Y(0),Z(6+i*0.7),Math.PI/2);}
  // -- the Ritual Division: a dim room at the corridor's end, a chalk circle, candles round it, the altar
  B.room({floor:'woodDark',wall:'concreteDark',ceil:'concreteDark:ceil'},X(-150),Y(0),Z(-15),X(-120),Y(7),Z(15),{e:[[11,19,5]]});
  {const cx=X(-135),cz=Z(0);B.ring('white',cx,Y(0.02),cz,5.6,5.85,32);B.ring('white',cx,Y(0.02),cz,3.2,3.4,24);
    for(let i=0;i<18;i++){const a=i/18*Math.PI*2,x=cx+Math.cos(a)*6.4,z=cz+Math.sin(a)*6.4;B.blk('white',x,Y(0),z,0.12,0.3,0.12);B.blk('lightWarm',x,Y(0.3),z,0.06,0.08,0.06);
      if(i%3===0)lights.add([x,Y(0.6),z],0xffb060,0.45,6);}
    B.blk('concrete',X(-147),Y(0),cz,2,1.1,4);for(const s of [-1,1])B.blk('lightWarm',X(-147),Y(1.1),cz+s*1.2,0.1,0.25,0.1);lights.add([X(-146),Y(1.6),cz],0xffa050,0.5,8);
    lights.zone([X(-150),Y(0),Z(-15)],[X(-120),Y(7),Z(15)],0x2a1e18,0.6);}

  // ================================================================ the Hedron Chamber, south, at the twenty-metre level
  const HC={x:X(0),z:Z(110),R:60,y0:Y(-10),yw:Y(20),y1:Y(70)};
  // the corridor from the atrium's south balcony
  B.room({floor:'grate',wall:'concrete',ceil:'concrete:ceil'},X(-4),Y(20),Z(30),X(4),Y(25),Z(50),{n:[[0,8,5]],s:[[0,8,5]]});
  F.panels(X(0),Z(33),X(0),Z(47),Y(25),5,0.8,9,0xdfeaff);
  // the drum: whole below the walkways and above them, broken at the walkway level for the two doors
  const g=0.075;
  B.cyl('concreteDark',HC.x,HC.y0,HC.z,HC.R,HC.R,30,48,{inward:true});
  B.cyl('concreteDark',HC.x,HC.yw,HC.z,HC.R,HC.R,5,22,{inward:true,a0:-Math.PI/2+g,a1:-g});
  B.cyl('concreteDark',HC.x,HC.yw,HC.z,HC.R,HC.R,5,40,{inward:true,a0:g,a1:Math.PI*1.5-g});
  B.cyl('concreteDark',HC.x,HC.yw+5,HC.z,HC.R,HC.R,45,48,{inward:true});
  B.ring('rockBlack',HC.x,HC.y0,HC.z,0,HC.R,40);
  B.ring('concrete:ceil',HC.x,HC.y1,HC.z,0,HC.R,40,true);
  // ribs up the drum, and a band of cold light round it near the top; a ledge round the walkway level
  for(let k=0;k<24;k++){const a=k/24*Math.PI*2,x=HC.x+Math.cos(a)*(HC.R-0.6),z=HC.z+Math.sin(a)*(HC.R-0.6);
    if(Math.abs(Math.atan2(Math.sin(a+Math.PI/2),Math.cos(a+Math.PI/2)))<0.15||Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))<0.15){B.blk('concrete',x,HC.yw+5,z,1.2,45,1.2);B.blk('concrete',x,HC.y0,z,1.2,30,1.2);}
    else B.blk('concrete',x,HC.y0,z,1.2,80,1.2);
    const b=a+Math.PI/24,lx=HC.x+Math.cos(b)*(HC.R-0.3),lz=HC.z+Math.sin(b)*(HC.R-0.3);B.blk('lightBlue',lx,Y(60),lz,1.5,0.4,1.5);
    lights.add([lx,Y(59),lz],0x9ac8ff,0.55,34);}
  B.ring('grate',HC.x,HC.yw,HC.z,HC.R-5,HC.R,48);
  {const P=[];for(let k=0;k<=48;k++){const a=k/48*Math.PI*2;P.push([HC.x+Math.cos(a)*(HC.R-5),HC.yw,HC.z+Math.sin(a)*(HC.R-5)]);}
    for(let k=0;k<48;k++)F.rail(P[k],P[k+1],1.05);}
  // the three walkways in a Y, a round platform where they meet, struts down to the drum
  B.cyl('steelDark',HC.x,HC.yw-0.5,HC.z,7,7,0.5,20,{caps:true});B.ring('grate',HC.x,HC.yw+0.01,HC.z,0,7,20);
  for(const a of [-Math.PI/2,Math.PI/6,Math.PI*5/6]){const c=Math.cos(a),s=Math.sin(a),p=[HC.x+c*7,HC.yw,HC.z+s*7],q=[HC.x+c*(HC.R-5),HC.yw,HC.z+s*(HC.R-5)];
    B.beam('steelDark',[p[0],p[1]-0.4,p[2]],[q[0],q[1]-0.4,q[2]],4,0.8);B.beam('grate',[p[0],p[1]-0.01,p[2]],[q[0],q[1]-0.01,q[2]],3.8,0.02);
    for(const sd of [-1,1]){const nx=-s*1.9*sd,nz=c*1.9*sd;F.rail([p[0]+nx,p[1],p[2]+nz],[q[0]+nx,q[1],q[2]+nz],1.05);}
    for(const t of [0.3,0.65]){const m=[p[0]+(q[0]-p[0])*t,HC.yw-0.8,p[2]+(q[2]-p[2])*t];B.beam('steelDark',m,[HC.x+c*(HC.R-0.5),HC.yw-14,HC.z+s*(HC.R-0.5)],0.5,0.5);}}
  for(let k=0;k<6;k++){const a=k/6*Math.PI*2+0.3;B.beam('steelDark',[HC.x+Math.cos(a)*5,HC.yw-0.6,HC.z+Math.sin(a)*5],[HC.x+Math.cos(a)*2,HC.y0+6,HC.z+Math.sin(a)*2],0.6,0.6);}
  lights.add([HC.x,Y(45),HC.z],0xc8e4ff,1.5,110);lights.add([HC.x,Y(10),HC.z],0x6a9ad8,0.6,60);
  lights.zone([HC.x-HC.R,HC.y0,HC.z-HC.R],[HC.x+HC.R,HC.y1,HC.z+HC.R],0x1e2c40,0.55);
  // the Hedron: dark, faceted, lit from within, slowly turning over the middle; shards drifting round it
  const hedron=new THREE.Group();hedron.position.set(HC.x,Y(45),HC.z);K.dyn.add(hedron);
  {const geo=new THREE.IcosahedronGeometry(1,0);geo.scale(9,15,9);
    const body=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:0x12182a,emissive:0x1c3c62,flatShading:true}));hedron.add(body);
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xaee4ff,transparent:true,opacity:0.8}));hedron.add(edges);}
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:K.T.dot,color:0x9ad8ff,transparent:true,opacity:0.55,depthWrite:false,blending:THREE.AdditiveBlending}));
  glow.scale.setScalar(60);glow.position.copy(hedron.position);K.dyn.add(glow);
  const SH=28,shards=new THREE.InstancedMesh(new THREE.TetrahedronGeometry(1.2,0),new THREE.MeshLambertMaterial({color:0x1a2438,emissive:0x2a5a8a,flatShading:true}),SH);
  shards.frustumCulled=false;K.dyn.add(shards);
  const shardP=[];for(let i=0;i<SH;i++)shardP.push({r:14+R()*10,a:R()*6.3,y:(R()-0.5)*24,sp:0.05+R()*0.12,s:0.6+R()*1.4,ph:R()*6.3});
  const dm=new THREE.Object3D();let hedronPulse=0;
  K.hooks.push((t,dt)=>{const sp=1+hedronPulse*6;hedron.rotation.y+=dt*0.06*sp;hedron.rotation.x=Math.sin(t*0.13)*0.08;hedron.position.y=Y(45)+Math.sin(t*0.4)*1.2;
    const k=1+hedronPulse*(0.25*Math.sin(t*9));hedron.scale.setScalar(k);glow.material.opacity=0.45+0.1*Math.sin(t*0.7)+hedronPulse*0.45;glow.scale.setScalar(60+hedronPulse*40*Math.abs(Math.sin(t*4)));
    for(let i=0;i<SH;i++){const p=shardP[i],a=p.a+t*p.sp*sp;dm.position.set(HC.x+Math.cos(a)*p.r,hedron.position.y+p.y+Math.sin(t*0.5+p.ph)*2,HC.z+Math.sin(a)*p.r);
      dm.rotation.set(t*0.3+p.ph,t*0.2,p.ph);dm.scale.setScalar(p.s);dm.updateMatrix();shards.setMatrixAt(i,dm.matrix);}shards.instanceMatrix.needsUpdate=true;});
  // Dimensional Research: off the drum's east side, a bridge from the ledge to its door
  B.box('grate',X(55),Y(19.6),Z(106),X(62),Y(20),Z(114));
  B.room({floor:'tile',wall:'panel',ceil:'ceiling:ceil'},X(62),Y(20),Z(92),X(100),Y(28),Z(128),{w:[[14,22,5]]});
  F.panels(X(68),Z(100),X(96),Z(100),Y(28),7,0.8,12,0xe8f0ff);F.panels(X(68),Z(120),X(96),Z(120),Y(28),7,0.8,12,0xe8f0ff);
  {const x=X(92),z=Z(110);B.box('steelDark',x-1,Y(20),z-5,x+1,Y(27.5),z-4);B.box('steelDark',x-1,Y(20),z+4,x+1,Y(27.5),z+5);B.box('steelDark',x-1,Y(27),z-5,x+1,Y(27.5),z+5);
    B.box('lightBlue',x-0.1,Y(20.5),z-0.25,x+0.1,Y(26.5),z+0.25);lights.add([x-1.5,Y(23.5),z],0x9adfff,1.1,18);
    for(let i=0;i<6;i++){F.terminal(X(70+i*3.2),Y(20),Z(95),0);F.chair(X(70+i*3.2),Y(20),Z(97),Math.PI);}
    for(let i=0;i<5;i++)F.pipe([x-1,Y(20.2),z-4+i*2],[X(66),Y(20.2),Z(104+i*3)],0.12,'steelDark');}

  // ================================================================ the Ashtray Maze, north
  // the long corridor out to it
  B.room({floor:'carpetGrey',wall:'panel',ceil:'ceiling:ceil'},X(-4),Y(0),Z(-200),X(4),Y(5),Z(-30),{n:[[1.8,6.2,4.5]],s:[[0,8,5]]});
  F.panels(X(0),Z(-196),X(0),Z(-34),Y(5),6,0.75,10);
  for(let z=-190;z<-40;z+=24){F.cabinet(X(3.4),Y(0),Z(z),-Math.PI/2);F.plant(X(-3.3),Y(0),Z(z+8),0.8);}
  // the maze: a twisting passage, right-angled turns, papered walls over a walnut wainscot, red carpet, a dark
  // coffered ceiling, sconces either side every four metres, doors here and there
  const MZ=[[0,-200],[0,-230],[30,-230],[30,-262],[-22,-262],[-22,-300],[26,-300],[26,-338],[-30,-338],[-30,-378],[10,-378],[10,-416]].map(([x,z])=>[X(x),Z(z)]);
  const HW=2.2,MH=4.5,y0=Y(0);
  const segN=i=>{const [ax,az]=MZ[i],[bx,bz]=MZ[i+1],l=Math.hypot(bx-ax,bz-az);return [-(bz-az)/l,(bx-ax)/l];};
  const LP=[],RP=[];
  for(let i=0;i<MZ.length;i++){let m;if(i===0)m=segN(0);else if(i===MZ.length-1)m=segN(i-1);else{const a=segN(i-1),b=segN(i);m=Math.abs(a[0]*b[0]+a[1]*b[1])>0.99?a:[a[0]+b[0],a[1]+b[1]];}
    LP.push([MZ[i][0]+m[0]*HW,MZ[i][1]+m[1]*HW]);RP.push([MZ[i][0]-m[0]*HW,MZ[i][1]-m[1]*HW]);}
  let doorN=0;
  for(let i=0;i+1<MZ.length;i++){const n=segN(i),[l0,l1,r0,r1]=[LP[i],LP[i+1],RP[i],RP[i+1]];
    B.quad('carpet',[l0[0],y0,l0[1]],[l1[0],y0,l1[1]],[r1[0],y0,r1[1]],[r0[0],y0,r0[1]],[0,1,0]);
    B.quad('woodDark:ceil',[l0[0],y0+MH,l0[1]],[l1[0],y0+MH,l1[1]],[r1[0],y0+MH,r1[1]],[r0[0],y0+MH,r0[1]],[0,-1,0]);
    for(const [p0,p1,sd] of [[l0,l1,-1],[r0,r1,1]]){const out=[n[0]*sd,0,n[1]*sd];
      B.quad('ashtray',[p0[0],y0+1,p0[1]],[p1[0],y0+1,p1[1]],[p1[0],y0+MH,p1[1]],[p0[0],y0+MH,p0[1]],out);
      B.quad('woodDark',[p0[0],y0,p0[1]],[p1[0],y0,p1[1]],[p1[0],y0+1,p1[1]],[p0[0],y0+1,p0[1]],out);
      // the cornice and the dado rail, a hand's breadth proud
      const ix=out[0]*0.06,iz=out[2]*0.06;B.beam('woodDark',[p0[0]+ix,y0+1,p0[1]+iz],[p1[0]+ix,y0+1,p1[1]+iz],0.1,0.08);B.beam('woodDark',[p0[0]+ix,y0+MH-0.12,p0[1]+iz],[p1[0]+ix,y0+MH-0.12,p1[1]+iz],0.14,0.24);
      const L=Math.hypot(p1[0]-p0[0],p1[1]-p0[1]),ns=Math.floor(L/4);
      for(let k=1;k<ns;k++){const t=k/ns,x=p0[0]+(p1[0]-p0[0])*t+out[0]*0.15,z=p0[1]+(p1[1]-p0[1])*t+out[2]*0.15;
        if(k%3===1&&(++doorN)%2){B.blk('woodDark',x-out[0]*0.08,y0,z-out[2]*0.08,Math.abs(out[2])>0.5?1.3:0.12,2.5,Math.abs(out[0])>0.5?1.3:0.12);B.blk('brass',x+out[0]*0.02,y0+1.2,z+out[2]*0.02,0.08,0.08,0.08);continue;}
        B.blk('brass',x,y0+2.4,z,0.12,0.5,0.12);B.blk('lightWarm',x+out[0]*0.12,y0+2.75,z+out[2]*0.12,0.32,0.36,0.32);lights.add([x+out[0]*0.4,y0+2.8,z+out[2]*0.4],0xffb070,0.55,7);}}
    // the coffers: beams across the ceiling every two metres
    const L=Math.hypot(MZ[i+1][0]-MZ[i][0],MZ[i+1][1]-MZ[i][1]);for(let k=1;k<L/2;k++){const t=k*2/L,x=MZ[i][0]+(MZ[i+1][0]-MZ[i][0])*t,z=MZ[i][1]+(MZ[i+1][1]-MZ[i][1])*t;
      B.beam('woodDark',[x+n[0]*HW,y0+MH-0.25,z+n[1]*HW],[x-n[0]*HW,y0+MH-0.25,z-n[1]*HW],0.2,0.5);}}
  // the far end: a door
  {const e=MZ[MZ.length-1],q=MZ[MZ.length-2],dx=Math.sign(e[0]-q[0]),dz=Math.sign(e[1]-q[1]),ex=e[0]+dx*HW,ez=e[1]+dz*HW;
    B.quad('ashtray',[ex-dz*HW,y0,ez+dx*HW],[ex+dz*HW,y0,ez-dx*HW],[ex+dz*HW,y0+MH,ez-dx*HW],[ex-dz*HW,y0+MH,ez+dx*HW],[-dx,0,-dz]);
    B.blk('woodDark',ex-dx*0.1,y0,ez-dz*0.1,dz?1.6:0.12,2.7,dx?1.6:0.12);lights.add([ex-dx*1.5,y0+3,ez-dz*1.5],0xffc080,0.6,6);}
  lights.zone([X(-40),Y(0),Z(-420)],[X(40),Y(5),Z(-198)],0x3a1410,0.55);

  // ---- the Ashtray Maze, moving: wall panels and floor tiles that come apart ahead of you and reassemble as you
  // arrive, and come apart again behind you. Hidden until the event runs.
  const mzS=[0];for(let i=1;i<MZ.length;i++)mzS.push(mzS[i-1]+Math.hypot(MZ[i][0]-MZ[i-1][0],MZ[i][1]-MZ[i-1][1]));const mzL=mzS[mzS.length-1];
  const along=s=>{s=Math.max(0,Math.min(mzL,s));let i=0;while(i<MZ.length-2&&mzS[i+1]<s)i++;const t=(s-mzS[i])/(mzS[i+1]-mzS[i]||1),[ax,az]=MZ[i],[bx,bz]=MZ[i+1],l=mzS[i+1]-mzS[i]||1;
    return {x:ax+(bx-ax)*t,z:az+(bz-az)*t,tx:(bx-ax)/l,tz:(bz-az)/l};};
  const SEG=3.9,NP=40,NF=14;
  const ptex=K.T.ashtray.clone();ptex.needsUpdate=true;ptex.repeat.set(SEG/1.2,MH/2.4);
  const ftex=K.T.carpet.clone();ftex.needsUpdate=true;ftex.repeat.set(SEG/2,2.1);
  const panels=new THREE.InstancedMesh(new THREE.BoxGeometry(SEG,MH-1,0.22),new THREE.MeshBasicMaterial({map:ptex,color:0xd8c8b0}),NP);
  const tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(SEG,0.2,HW*2-0.1),new THREE.MeshBasicMaterial({map:ftex,color:0x8a1a1c}),NF);
  for(const m of [panels,tiles]){m.frustumCulled=false;m.visible=false;K.dyn.add(m);}
  const ph=[];for(let i=0;i<NP+NF;i++)ph.push([R()*2-1,R()*2-1,R()*2-1,R()*6.3]);
  const ease=u=>u*u*(3-2*u);
  function poseMaze(camS,t){const base=Math.floor(camS/SEG)-3;
    for(let i=0;i<NP;i++){const k=base+(i>>1),sd=i&1?1:-1,s=(k+0.5)*SEG;if(s<0||s>mzL){dm.scale.setScalar(0);dm.updateMatrix();panels.setMatrixAt(i,dm.matrix);continue;}
      const p=along(s),nx=-p.tz,nz=p.tx,d=s-camS,f=d>3?ease(Math.min(1,(d-3)/11)):d<-3?ease(Math.min(1,(-d-3)/7)):0,[a,b,c,w]=ph[i];
      dm.position.set(p.x+nx*sd*(HW-0.14+f*(1.5+2.5*Math.abs(a)))+p.tx*f*4*c,y0+1+(MH-1)/2+f*(5*b+1.5*Math.sin(t*1.5+w)),p.z+nz*sd*(HW-0.14+f*(1.5+2.5*Math.abs(a)))+p.tz*f*4*c);
      dm.rotation.set(f*2.2*c,Math.atan2(-p.tz,p.tx)+f*1.8*a,f*2.0*b,'YXZ');dm.scale.setScalar(1);dm.updateMatrix();panels.setMatrixAt(i,dm.matrix);}
    for(let i=0;i<NF;i++){const k=base+i,s=(k+0.5)*SEG;if(s<0||s>mzL){dm.scale.setScalar(0);dm.updateMatrix();tiles.setMatrixAt(i,dm.matrix);continue;}
      const p=along(s),d=s-camS,f=d>5?ease(Math.min(1,(d-5)/18)):d<-3?ease(Math.min(1,(-d-3)/9)):0,[a,b,c,w]=ph[NP+i];
      dm.position.set(p.x+f*2*a,y0-0.08-f*(5+3*b),p.z+f*2*c);dm.rotation.set(f*0.9*a,Math.atan2(-p.tz,p.tx),f*0.9*c,'YXZ');dm.scale.setScalar(1);dm.updateMatrix();tiles.setMatrixAt(i,dm.matrix);}
    panels.instanceMatrix.needsUpdate=true;tiles.instanceMatrix.needsUpdate=true;}

  // ================================================================ the air, the places, the views, the cards
  K.zones.push({c:[X(0),Y(18),Z(0)],r:42,color:'#8a9a84',density:0.0035},{c:[HC.x,Y(30),HC.z],r:70,color:'#24384e',density:0.006},
    {c:[X(-135),Y(2),Z(0)],r:18,color:'#2a1a12',density:0.01},{c:[X(0),Y(2),Z(-310)],r:150,color:'#4a120c',density:0.011});
  K.places.push(['the Ritual Division',[X(-135),Y(2),Z(0)],17],['Dimensional Research',[X(81),Y(23),Z(110)],22],['the Hedron Chamber',[HC.x,Y(25),HC.z],64],
    ['the Research labs',[X(-75),Y(2),Z(0)],48],['Central Research',[X(0),Y(15),Z(0)],38],['the way to the Ashtray Maze',[X(0),Y(2),Z(-115)],88],
    ['the Ashtray Maze',[X(0),Y(2),Z(-310)],125],['the way into Research',[X(105),Y(2),Z(0)],76]);
  const V=(name,t,d,yaw,pitch,card,cut)=>K.views.push({name,group:'Research',t,d,yaw,pitch,card,cut:!!cut});
  V('Central Research',[X(-4),Y(13),Z(-2)],34,0.8,0.2,'research');
  V('The redwoods',[X(4),Y(24),Z(4)],52,2.3,-0.42,'redwoods');
  V('The balconies',[X(-18),Y(20),Z(-14)],32,0.75,0.12,'balconies');
  V('The labs',[X(-75),Y(2),Z(0)],24,Math.PI/2,0.06,'labs');
  V('Luck and Probability',[X(-80),Y(1.4),Z(-17)],11,0.25,0.18,'luck');
  V('The Hypnosis lab',[X(-105),Y(2.5),Z(21)],12,Math.PI,0.06,'hypnosis');
  V('Extrasensory',[X(-80),Y(1.2),Z(15)],12,2.7,0.35,'extrasensory');
  V('The Ritual Division',[X(-135),Y(0.6),Z(0)],14,1.3,0.55,'ritual');
  V('The Hedron Chamber',[HC.x,Y(30),HC.z],78,3.0,0.12,'hedron');
  V('The Hedron',[HC.x,Y(44),HC.z],34,2.4,-0.12,'hedron');
  V('Dimensional Research',[X(84),Y(22.5),Z(110)],18,-Math.PI/2+0.25,0.15,'dimensional');
  V('The Ashtray Maze',[X(0),Y(1.9),Z(-216)],8,0,0.04,'ashtray');
  V('Research from above',[X(0),Y(0),Z(-120)],560,0.5,1.2,'research',true);
  Object.assign(K.cards,{
    research:{h:'Central Research',p:'The heart of the Research Sector: an atrium of white concrete forty metres high under a skylight, balconies stepping round it with greenery spilling over their fronts, and redwoods growing up through the middle of it all. The Bureau studies the Paranatural here, and the House lets it.',sub:'Research Sector · Federal Bureau of Control'},
    redwoods:{h:'The redwoods',p:'Three trees older than anyone in the building, rooted in planters on the atrium floor and reaching to the skylight. Nobody files a report on where the light comes from.',sub:'Central Research'},
    balconies:{h:'The balconies',p:'Angular slabs of concrete at ten, twenty and thirty metres, each jutting a different distance, planted along their fronts. The twenty-metre balcony leads south to the Hedron Chamber.',sub:'Central Research'},
    labs:{h:'The labs',p:'A corridor west off the atrium: Synchronicity, Luck and Probability and Parapsychology on one side, Hypnosis, Extrasensory and Protective Studies on the other, and the Ritual Division at the end.',sub:'Research Sector'},
    luck:{h:'Luck and Probability',p:'Tiers of beckoning cats along the back wall, a table of dice, a die the size of a crate. Some of the cats are watched more closely than others.',sub:'Research Sector'},
    hypnosis:{h:'Hypnosis',p:'A spiral the height of the wall, and chairs set out to face it.',sub:'Research Sector'},
    extrasensory:{h:'Extrasensory',p:'Sensory-deprivation tanks in a row, white capsules with dark windows, piped to the wall.',sub:'Research Sector'},
    ritual:{h:'The Ritual Division',p:'A dim room at the end of the corridor: a chalk circle on the boards, candles round it, an altar. In this building a ritual is a procedure, and procedures work.',sub:'Research Sector'},
    hedron:{h:'The Hedron Chamber',p:'A drum of dark concrete sixty metres to the wall and eighty from the pit to the roof, three walkways meeting over the drop, and the Hedron: a great faceted crystal hanging in the air, dark and lit from inside, turning very slowly. Its light is cold.',sub:'Research Sector · Events: the Hedron'},
    dimensional:{h:'Dimensional Research',p:'Off the Hedron Chamber\'s east side: terminals in a row facing a frame of steel with a thin line of light standing in it.',sub:'Research Sector'},
    ashtray:{h:'The Ashtray Maze',p:'A corridor that will not stay where it is: sunburst paper over walnut, red carpet, sconces and doors, and every turn a right angle. Ride it from Events and watch it come apart round you.',sub:'Research Sector · Events: the Ashtray Maze'}});

  // ================================================================ the events
  K.events.push({key:'ashtraymaze',label:'The Ashtray Maze',card:'ashtray',start(api){api.setCut(false);
    let s=0;const zone={c:[X(0),Y(2),Z(-310)],r:170,color:'#8a2010',density:0.02};K.zones.push(zone);panels.visible=tiles.visible=true;const p0=new THREE.Vector3(),t0=new THREE.Vector3();
    return {update(t,dt){s+=dt*5.5;const a=along(s),b=along(s+5);poseMaze(s,t);
      p0.set(a.x,y0+1.75,a.z);t0.set(b.x,y0+1.65+Math.sin(t*0.9)*0.15,b.z);const d=p0.distanceTo(t0)||1;
      api.ctl.t.copy(t0);api.ctl.d=d;api.ctl.yaw=Math.atan2(p0.x-t0.x,p0.z-t0.z);api.ctl.pitch=Math.asin(Math.max(-1,Math.min(1,(p0.y-t0.y)/d)));
      const k=0.5+0.5*Math.sin(t*1.7);zone.color='#'+new THREE.Color(0x8a1a10).lerp(new THREE.Color(0xb0701a),k).getHexString();
      if(s>=mzL-6){panels.visible=tiles.visible=false;const i=K.zones.indexOf(zone);if(i>=0)K.zones.splice(i,1);return false;}}};}});
  K.events.push({key:'hedron',label:'The Hedron',card:'hedron',view:K.views.find(v=>v.name==='The Hedron'),start(){let u=0;
    return {update(t,dt){u+=dt;hedronPulse=Math.min(1,u/3)*Math.min(1,Math.max(0,(22-u)/4));if(u>22){hedronPulse=0;return false;}}};}});
  K.anchors.research={hedron,HC,maze:MZ};
}
