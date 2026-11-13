# Enterprise: the pile

Improvements to `/enterprise` (`src/enterprise/`), not yet started. The owner wants all of them (2026-11-12); the order
within a section is a rough priority. Take an item out when it is done, and note it in the commit.

Done (2026-11-12): Q1 the mission smoke tests (`tools/test-enterprise.py`, `#mauto`), G2 damaged systems (`systems.js`,
and the `limp` orders), P1 the career (`ent-career`, the service record). Run `tools/test-enterprise.py` after any change
to the orders or the systems they use.

## Gameplay

- **G1. Fly the saucer and the stardrive apart.** Separation is a scripted event now (`events.js` `separate()`): the
  saucer lifts off and docks again. Make it flyable: the stardrive goes into the fight while the saucer withdraws;
  missions that call for it (evacuate, defend); docking the two halves again as a manoeuvre, on the starbases'
  approach control.
- **G3. Choices in comms that last.** A standing with each faction, kept between visits: a good first contact
  opens Ossari traffic and trade, firing first makes them hostile; the Kethri remember who broke a swarm.
- **G4. Deeper combat.** Shield facings (fore, aft, port, starboard), so which way the ship turns matters; target a
  raider's engines to disable it, then tractor it in (the tractor beam exists); the Lattice adapts to the weapon
  used on it, so switching weapons is a real tactic, not just a loading line.
- **G5. Away teams with choices.** When B sends a team down, a short text scene in an LCARS panel: two or three
  choices, an outcome drawn from the mission's seed, a report into the captain's log. Injured team members come
  back to sickbay.
- **G6. Fuel and the warp core.** Antimatter and dilithium run down at warp and fill at a starbase; a warp-core
  breach event with a countdown and an "eject the core" order, after which the ship has impulse only until it is
  towed or repaired.
- **G7. Hunting a cloaked ship.** Cloaking exists (`hostile.js`, `factions.js`). A tachyon sweep: lay a net of
  scans, watch for the ripple, then fire where it was. A mission kind built on it.
- **G8. Places that change the rules.** A nebula where shields fail and sensors go short-range; a minefield to
  sweep or go round; an asteroid field to chase a stolen ship through.
- **G9. Ships in trouble while you are at warp.** Dropping out of warp for an encounter on the way (a distress
  call, a derelict, an ambush), some of them traps.
- **G10. Diplomatic passengers.** Carry ambassadors between worlds; they hail the bridge with complaints, and two
  delegations aboard at once can make trouble that has to be settled before arrival.
- **G11. Call for help.** Summon another Starfleet ship from traffic (`traffic.js`) to join a fight or take an
  escort, at a cost to standing with Command if it is used for small things.
- **G12. Rewards from the starbases.** Standing with Starfleet buys refits at a starbase: better torpedoes, a
  stronger shield grid, a faster transporter cycle.
- **G13. Missions against the clock.** Life support failing on a rescued ship counts down in the orders panel;
  arriving late saves fewer people, and the log says so.

## Progression

- **P2. Mission chains.** One mission leads to the next: a recovered probe's readings point to the wormhole, a
  derelict's log points to the relic ring. A story without hand-written campaigns.
- **P3. A seed you can share.** `#seed=<n>` in the URL deals the same run of orders, so two people can fly the
  same night and compare logs.
- **P4. Commendations.** Small marks for things done well (no shots fired on first contact, a rescue with no one
  lost, a swarm broken with shields above half), shown on the service record.

## Things to see

- **V1. A view from the bridge.** A camera at the bridge window on top of the saucer, looking forward over the hull,
  with LCARS chrome round it.
- **V2. More life round the ship.** Shuttles in and out of the bays (the shuttle event exists), workbees at the
  starbases, running lights blinking on the traffic, ships berthed at a starbase's arms.
- **V3. Going to warp.** A stretch and flash on the jump, the nacelles brightening as warp builds, the stars
  smearing in proportion to the warp factor.
- **V4. Red alert on the hull.** The window rings on the saucer dim and red-alert lights strobe along the hull, not
  only on the interface.
- **V5. Damage you can see.** Scorch marks painted into the skin where hits land (the skin is painted texel by
  texel already: `skin.js`), venting plasma from a hit nacelle, and both repaired at a starbase.
- **V6. Photo mode.** Freeze the scene, free the camera (the director camera exists), hide the interface, save a
  picture.
- **V7. Low orbit.** Close approach to a planet down to where the atmosphere's edge glows round the ship, and
  cloud systems pass under it.
- **V8. The library computer.** An LCARS panel of every ship class and faction met so far, each turning on its
  own small stage (the builders in `factions.js` already make them), and every place charted, with what the
  sensors read there.

## Sound

- **S1. Bridge ambience.** A synthesised warp-core hum that rises with warp factor, console chirps, the hull
  creaking under a hard turn. Every sound stays synthesised by the page.
- **S2. The captain's log read aloud.** The Web Speech API reads each entry when it is written (off by default,
  a toggle in the log).
- **S3. A music bed.** Generated, quiet, a different mode for exploring, red alert and first contact.

## Across the Menagerie

- **X1. The other ships' pages.** `/voyager` and `/ds9` share `src/starship/`. A place on the chart for the DS9
  station, docking there with a link to its page; Voyager met as traffic.
- **X2. One renderer's gains for all three.** Whatever goes into `src/starship/` for the Enterprise (photo mode,
  the bridge view, the warp effect) offered to Voyager and DS9 too.

## Quality

- **Q2. Help and the first visit.** A `?` overlay listing every key (F, J, H, N, B, K, O, P, Z, and the rest); a
  first-run walkthrough that uses the orders panel's next-step lines.
- **Q3. Touch.** A virtual stick for heading and throttle beside the helm strip (`helm.js`), so a phone can fly.
- **Q4. A gamepad.** The Gamepad API: sticks for heading and throttle, buttons for the helm strip's orders.
- **Q5. Keys you can change, and access.** Rebindable keys; a colour-blind LCARS palette; reduced motion (no
  screen shake, no warp flash).
- **Q6. Loading faster.** The hull's textures and planets are painted when the page loads. Do the painting in a
  worker, and cache the result in IndexedDB keyed by the code's hash, so a second visit starts at once.
- **Q7. A performance budget.** Frame time and draw calls measured in the busiest places (a starbase with traffic,
  the swarm fight) on a phone and a laptop, with numbers written down and held.
