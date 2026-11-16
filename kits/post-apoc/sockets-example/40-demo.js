// prefix: sd
// The smallest possible building that uses the socket system: a wall, a door, a stall, a pole. It never names a culture.
// It DECLARES five sockets (awning, banner, flag, emblem, sign); whichever culture pack is active draws into them.
defBuilding({key:'sock-demo',name:'Socket demo wall',seed:9100,tags:{type:['market/shop'],size:'small',core:'sheet wall',materials:['sheet metal','timber']},w:11,d:6,h:6.4,build:sdBuild});
function sdBuild(o){
 box('corr',0,0,-1,9,3.4,.2,jc(0x9a9a92,.05));                                        // the wall the sockets hang on (front face at z = -0.9)
 box('plank',0,0,.4,9.4,.16,2.8,jc(0x6a5a44,.08));                                    // a boarded floor
 box('iron',-2.4,.16,-.86,1.1,2.1,.05,jc(0x2a2826,.03));                              // a door opening
 box('plank',2.2,.16,-.5,3.2,1.0,.8,jc(0x7a5c3c,.06));                                // a stall counter
 // poles the cloth hangs from: the socket draws the cloth, the BUILDING supplies what holds it up
 beam('wood',[3.9,0,1.6],[3.9,4.4,1.6],.09,jc(0x5c4630,.06),true,6);beam('wood',[3.9,4.3,1.6],[3.9,4.3,.9],.06,jc(0x5c4630,.06),true,5);
 beam('wood',[-4.4,0,-.7],[-4.4,6.2,-.7],.08,jc(0x5c4630,.06),true,6);
 // SOCKETS: sock(type, x,y,z, ry, {w,h,d,drop,trade}); frame = +z out of the surface, +x along it, y up
 sock('awning',-2.4,2.5,-.9,0,{w:2.2,d:1.3,drop:.5,h:2.5});                            // over the door: anchored to the wall's top edge, posts to the ground
 sock('awning',2.2,2.3,-.9,0,{w:3.4,d:1.4,drop:.5,h:2.3});                             // over the stall
 sock('banner',3.9,4.2,1.25,0,{w:.8,h:2});                                             // hung from the pole's arm
 sock('flag',-4.4,6.2,-.7,0,{w:1.2,h:.7});                                             // on the pole top
 sock('emblem',0,2.6,-.9,0,{w:.9,h:.9});                                               // a plate on the wall
 sock('sign',0,3.45,-.85,0,{w:2.6,h:.95,trade:o.v===1?'WEAPONS':'FOOD'});
}
