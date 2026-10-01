# Jimjam helper API — Round 1

All measurements are metres. Builders use a local frame, ground at `y=0`, and front toward `+z`. `JJ.def()` registers definitions; `JJ.place(scene,key,x,z,ry,o)` places one and adds a tagged inspection volume. `jjColor()` converts palette hex colours for instanced rendering.

## Main helpers

```js
jjWall(x,y,z,w,h,d,ry,{band})
jjPlinth(x,y,z,w,h,d,ry,options)
jjStairs(x,y,z,w,run,rise,steps,ry,options)
jjColumn(x,y,z,r,h,{lattice,pattern})
jjBrickShaft(x,y,z,r,h,{pattern,section,base,cap,relief,c})
jjChimneyStack(x,y,z,{n,patterns,h})
jjArch(x,y,z,w,h,ry,{depth})
jjArcade(x,y,z,n,bayWidth,h,ry,{depth})
jjDome(x,y,z,r,{kind,shape,ribs})
jjSpire(x,y,z,r,stages,options)
jjTurret(x,y,z,r,h,options)
jjPorthole(x,y,z,ry,r)
jjWindow(x,y,z,w,h,ry,options)
jjDoor(x,y,z,w,h,ry,options)
jjCrenel(x,y,z,w,d,h,options)
jjCornice(x,y,z,w,d,ry,options)
jjRoundPlaza(x,y,z,r,{raised,inlay})
jjAwning(x,y,z,ry,options)   // culture socket
jjBanner(x,y,z,ry,options)   // culture socket
```

`pattern` is one of `spiral`, `chevron`, `diamond`, `ogee`, `fleur`, `tracery`, or `plain`. Shaft sections are round, octagonal, or square. Dome finishes are gold, slate, or terracotta; profiles are hemispherical, onion, or ribbed.

## Inspection contract

`window._api` exposes `totals`, `typeStats()`, `regOccupancy()`, `nanSweep()`, `tagAudit()`, `defs()`, `views()`, `setView(...)`, and `solsticeCheck()`. For Round 1 the last call reports `pending`: there is no temple axis to test. The culture socket bridge adapts the unchanged `core/sockets/37-sockets.js` and `80-cultures.js` drawing calls to Jimjam materials and instancing.
