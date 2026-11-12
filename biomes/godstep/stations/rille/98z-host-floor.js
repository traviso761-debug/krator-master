// ================================================================= HOST — the eye's floor under the plan (station 2)
// The walked tube lies under the plain: the host's camera guard must let the eye stand on its floor (STATION_FLOOR, 87-host-tube.js), as the
// Godthrone's and the Twins' tube stations hand theirs to KHOST.take. src/99-host-take.js does not pass one, so the take is wrapped here
// to add it (a shared change owed: 99 passing STATION_FLOOR when a station defines it).
{const take0=KHOST.take;KHOST.take=o=>take0(Object.assign({floor:typeof STATION_FLOOR==='function'?STATION_FLOOR:undefined},o));}
