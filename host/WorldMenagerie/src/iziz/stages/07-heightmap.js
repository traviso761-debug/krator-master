// ---------- 1. heightmap ----------
function hillH(x,z){const dx=x-PALACE.x,dz=z-PALACE.z;return HILL*Math.exp(-(dx*dx+dz*dz)/(2*100*100));}
