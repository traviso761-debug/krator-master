// ================================================================= HOST — station 6: the eye's floor in the vault (godstep's rille, stations/rille/98z-host-floor.js)
// The archive vault lies under the sheet: the host's camera guard must let the eye stand on its floor and the breakdown cone (STATION_FLOOR,
// 88t-host-tiguantin.js). src/99-host-take.js does not pass one, so the take is wrapped here to add it (the same shared change owed as godstep's:
// 99 passing STATION_FLOOR when a station defines it; KNOWN_ISSUES.md).
{const take0=KHOST.take;KHOST.take=o=>take0(Object.assign({floor:typeof STATION_FLOOR==='function'?STATION_FLOOR:undefined},o));}
