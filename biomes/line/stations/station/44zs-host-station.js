// ================================================================= HOST — the station: which window of the Line this page draws, and in which state
// biomes/line/PLAN.md section 5, station 3, `station`: the Twenny junction, an Ancient station cavern in three states (?state=built|kept|abandoned;
// kept by default): as the Ancients left it (their light, a built train), kept by a loj (the lamp code, a kept train, the Tungangs' few things), or
// abandoned (dark, dust, a derelict train).
const STATION=(function(){const q=new URLSearchParams(location.search).get('state'),st=['built','kept','abandoned'].indexOf(q)>=0?q:'kept';
 return {key:'station',name:'The Twenny junction (station 3)',num:3,state:st,states:['built','kept','abandoned'],
  hint:"Station 3 of the Line: the Twenny junction (bore km 218), an Ancient station cavern 52 m wide and 20 m to its vault, "+st+"; the tracks splay round the island platform, side platforms at the walls, footbridges to the mezzanine in the vault's haunches, the doors to the station's rooms, the branch toward Loj Twenny (25 km east) and the great shaft's foot (2.2 km up to the fells); 2200 m under the fells"};})();
