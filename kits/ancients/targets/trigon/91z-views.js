// Presets, DERIVED from TG_SITE, which buildTrigon fills before this runs. The
// face normals are at 214 (terrace), 334 (portal) and 94 (balcony) degrees,
// measured from +x toward +z; the portal/balcony arris is at 34.
//
// The camera is 50 degrees vertical, so a frame is 0.933 x the sight line tall:
// nothing that holds all 1 100 m of the spike can stand closer than ~1 250 m.
const TGDEF={x:0,z:0,RI:105.94,PL:18,YA:1100,YP:1030,HP:1082,RP:143.94,FALL:48*Math.PI/180,LAND:null,
 SPY0:300,SPY1:690,PORT:[{yb:18,yt:258,wb:82.6,db:-26.5}],
 DY:y=>105.94*(1100-y)/1082};
const TGA=Object.assign({},TGDEF,{x:-2400},TG_SITE[0]||{});
const TGB=Object.assign({},TGDEF,{x:2400},TG_SITE[1]||{});
const TGAZ=a=>a*Math.PI/180;
// a world point at azimuth a (degrees), horizontal radius r, height y, on site S
const TGP=(S,a,r,y)=>[S.x+Math.cos(TGAZ(a))*r,y,S.z+Math.sin(TGAZ(a))*r];
// a point ON face k (r from the axis, s along the face) — the builder's own map
const TGF=(S,k,r,s,y)=>[S.x+Math.cos(TGAZ([214,334,94][k]))*r-Math.sin(TGAZ([214,334,94][k]))*s,y,
 S.z+Math.sin(TGAZ([214,334,94][k]))*r+Math.cos(TGAZ([214,334,94][k]))*s];
const TGHERO=S=>TGP(S,28,1750,380).concat([S.x,540,S.z]);
const VIEWS={
 // THE HERO: between the balcony face (lit, the grid of balconies and its
 // chevrons) and the portal face (in its own shade, five lit triangles), with
 // the chamfered arris between them running from the plinth to the beacon.
 'Trigon':                TGHERO(TGA),
 // each face square on, from 1 500 m
 'The terrace face':      TGP(TGA,214,1500,420).concat([TGA.x,520,TGA.z]),
 'The balcony face':      TGP(TGA,94,1500,420).concat([TGA.x,520,TGA.z]),
 'The portal face':       TGP(TGA,334,1500,420).concat([TGA.x,520,TGA.z]),
 // the terraces raking: standing off the face at mid-height and looking back
 // along the treads so their planting and the stair read as steps
 'The terraces':          TGF(TGA,0,330,-190,640).concat(TGF(TGA,0,TGA.DY(470),40,470)),
 // UP THE ARRIS: at the foot of the portal/balcony corner, looking up it
 'Up the arris':          TGP(TGA,34,360,3).concat(TGP(TGA,34,2*TGA.DY(520),520)),
 // the pyramidion and beacon, 1 030-1 100 m up
 'The apex':              TGP(TGA,70,175,1085).concat([TGA.x,1045,TGA.z]),
 // people on the portal-side stair and the great gate over them
 'The plinth':            TGF(TGA,1,300,-40,1.7).concat(TGF(TGA,1,120,0,55)),
 // through the glass of the great portal into its atrium
 'The portal atrium':     TGF(TGA,1,175,0,62).concat(TGF(TGA,1,-10,0,120)),
 'Trigon at night':       TGHERO(TGA).concat([1]),
 'Ruined':                TGHERO(TGB),
 // THE SHEAR, from above and behind the high side
 'The shear':             TGP(TGB,140,300,1000).concat([TGB.x,780,TGB.z]),
 // THE FALLEN APEX, from across its length
 'The fallen apex':       (function(S){const f=S.FALL,cx=S.x+Math.cos(f)*560,cz=S.z+Math.sin(f)*560;
                            return[cx-Math.sin(f)*430,110,cz+Math.cos(f)*430,cx,25,cz];})(TGB),
 // THE SPALLED ARRIS, 300-690 m, floor plates laid open
 'The spalled arris':     TGP(TGB,30,480,470).concat(TGP(TGB,34,2*TGB.DY(500),500)),
 // the portal face ruined: glazing gone, five black caves
 'The dark portals':      TGP(TGB,334,1300,380).concat([TGB.x,430,TGB.z]),
 // the terraces slumped and overgrown
 'Slumped terraces':      TGF(TGB,0,640,-150,420).concat(TGF(TGB,0,TGB.DY(380),20,360)),
};
