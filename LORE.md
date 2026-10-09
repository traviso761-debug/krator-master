# Krator: lore so far

## 0. Krator: what is Krator?

Krator is a world where the highs are high and the lows are low. This is both physical and metaphorical. It is a world that contains airless peaks taller than Earth’s, and deep abysses where the air is so thick an Earthling could barely breathe. It is also a world where the rewards of adventure can be priceless but the dangers can be swift and brutally lethal.

Krator is at base, an open world squad RPG with exploration, base building, and stealth/platforming elements. The play will start as a single person or small group of people, with little resources, and go on to succeed or fail.

Exploration is a given in an open world – with it comes new opportunities for profit or power. Over the horizon there may be an arcology holding lost Ancient technology that many would kill for.

Stealth and platforming come from what happens when the exploration pays off – one must delve into the arcology to get the spoils. There are traps the ancients laid; there are hazards from 1000 years of decay and neglect; and there may be inhabitants none too pleased to find you there.

Base building comes from exploring the open world, and becoming a part of it. Facing a long delve into an arcology, one may need to set up a camp or outpost to support the delvers. Once one has their spoils, one may well need to process them or exploit them – a blueprint for an ancient raygun is much more valuable if you can build and sell the rayguns yourself! And a player party may eventually turn into a real venturing or mercenary company, tasked with exploring sites and turning in bounties from all over the map by NPC factions.

There is no Chosen One. If there is an overarching plot, there is one that can go many ways. The primary win condition is when the player has accomplished their roleplaying goals, or no longer feels a challenge.

The primary goal of the game is survival. The environment is often hostile and filled with people and creatures just as hostile. After that, the goal can be exploring every arcology to discover the lore of the world, building a great settlement, taking down your least favorite NPC faction, or whatever else you choose.

The game is a simulation and the player takes part in the same systems as the NPCs, to a greater or lesser degree. NPCs will send parties to raid or trade with each other; if the player settles in a faction’s lands, it may decide to raid or trade with him. NPCs will be found all over the map engaged in their own business which the player may or may not want to or be capable of interfering with.

Krator has been here before you, and it can and will go on without you.

## 1. The world in one paragraph

Krator is a tidally locked moon of a gas giant. Its people live (for the most part) in and around one vast crater with two walls. Dead center: a volcano, the Throne. Its inner rampart, the **Inner Wall**, rings a deep, sweltering hyperjungle heartland and the **Ring Sea**. Between the Inner Wall and the **Outer Wall** lie lowlands, highlands, deserts and bays. In the damper west, the basins of this crater have filled into lakes and seas; in the dry east, they form the deep and still-wild Abyss.

A lost high civilisation, **the Ancients**, built everything that matters and then vanished. A thousand or more years later, every culture on Krator lives in their ruins: it salvages them, worships them, fights over them, or tries to understand them. Electric light, kept alive from Ancient machines, is the mark of power everywhere.

## 2. The sky, the planet and its physics

| | |
|---|---|
| Body | A tidally locked moon of a gas giant (Neptune-to-Saturn class). [settlements/voth/src/21-sky.js; dalab/src/81-sky.js] |
| The giant | Fixed in the sky at altitude ~25°, azimuth ~66° (NE), "over **Korona**". About 30° across ("sixty full moons wide"), banded, stormy and greenish. Its rings sit almost edge-on, seen as a hairline. At night its glow ("giantshine") lights clouds and snow. [dalab/src/81-sky.js:3; biomes/eastabyss/src/82-host-sky.js; biomes/nhighlands/src/82-host-sky.js] |
| Moons | Two small moons, well away from the giant. The Republic's orrery shows sun, giant, Krator and two moons. [settlements/highlands/NOTES.md:83-92] |
| Sun | Sets WNW in every kit (canon placement). Eclipses come in seasons round each equinox. |
| Day | 24 h: one orbit of the giant. |
| Year and tilt | Tilt ~23°, so seasons are Earth-like. The year is 365 days in the sky docs and `YEAR=360` in the shared sky code (see §12). The southern summer solstice falls on day 350. [jimjam/DESIGN.md:81-91] |
| Latitude | "Climate, day length and seasons all depend on latitude, not longitude." The reference site (Voth, Jimjam) is at 40° S, in the westerlies, so the sun crosses through the north. |
| Gravity | 7.4 m/s² (about 0.75 g). |
| Air | Dense, varying with altitude: ~0.8 atm on the high plateau, ~1.3 at Yuni, ~1.6 on the Voth lowland, ~1.9 on the hypertropic lee shore, ~2.0 on the Ring Sea, thicker still in the Abyss. Krator's climate classes add **X, abyssal** (above 1.9 atm) and **H, hyperalpine** (below 0.6 atm) to Köppen. [mavs-refuge/src/21-sky.js; biomes/WORLD.md] |
| Soil | Red: "Tharnish red soil" in the hyperjungle. |

The air pressure has real consequences. Dalab's genepriests sell **pressure adaptation** as a body modification, so moving between altitudes is a problem people live with. The highlands are for the most part earthlike; the lowlands, and especially the central crater, the Eastern Abyss, and the Rift, are not quite like anything on Earth – they are about as far under the atmosphere as the Marianas Trench; an atm of 2.0 has great consequences. Insects and flying creatures grow larger, the air is more humid, and fires burn so hot that even a charcoal flame is enough to smelt steel.

## 3. Geography

### 3.1 The shape of the crater

See https://claude.ai/artifact/N76KxfMXL5C7hfRGHKJK5q for scale map; some regions and settlements may be subject to change. Ignore far eastern areas with the small crater, this is “expansion pack territory” most likely.

- **The crater.** The whole inhabited world lies inside or near one vast crater.
- **The Inner Wall.** "The crater's great rampart": mountains ringing the central basin, with temperate highlands on their flanks and snowy peaks whose "summits are in the sky".
- **The Outer Wall Mountains.** The crater's outer rim: airless, glaciated peaks. Yuni sits in a side valley of it. The lowlands lie between the two walls.
- **The highlands:** the rings of the inner and outer Wall mountains form the most temperate and earthlike conditions on Krator. The Iron Republic and its rustic highland relatives live here.
- **The central crater** holds the hyperjungle where trees grow taller than redwoods and centipedes grow to the size of horses, it also holds the Ring Sea and the volcano. Iziz, Voth, the Hykkousoi, the Beast Riders, and other smaller cultures lie here.
- **The Ring Sea.** An inland sea. Mav's Refuge sits on its NE lee shore, the Hykkousoi on the NW. Its sailing cultures are listed in §9. Islands here are variously rocky and infertile or lush and valuable, especially for the spice trade. Many geysers.
- **The great volcano.** Seen from almost everywhere: north-northeast from Voth, far south from the Hexahedron, northeast of Iziz. It always smokes; some of the time the plume thickens and the summit glows. Its ash, and great rain shadow, make it fertile, but its nature is treacherous.
- **The Lowlands.** In between the Inner and Outer Wall are basin regions, with higher pressure than Earth, just enough that an unadapted human might have health problems from chronic hyperbaric conditions. Dalab lies in the SW lowlands.
- **The Eastern Abyss.** East of the high desert, the plateau ends in a 740 m cliff. The high desert's river pours over it as a cataract onto a basin floor, which holds multiple salt lakes. The basin wall, "the shelf", hides the sun and the giant's ring from Locus. Yuni controls Locus and the southern portion of the Abyss.
- **The Godthrone.** Massive volcano south of the crater, almost Olympus Mons size. Upper reaches are completely airless.
- **The Rift.** South of the main crater: a volcanic rift valley, almost as deep as the central crater, forming a long east-west trough of salt lakes (yellow, pink, blue-green), jungle and mesa ridges. As one must climb the Outer wall to get here, it is quite isolated compared to the rest of Krator, but traders covet the riches of the sultans of Xanadu, so they attempt the trek regardless. It is also known for its hostile Lizardmen and strange wildlife deep in its depths.
- **The scablands (candidate).** In the northern semiarid country a closed basin once held a lake three times the size of Lake Bonneville. When it broke its rim it tore south in one flood, leaving dry falls, coulees and bare scoured rock (`biomes/WORLD.md`). The basin is dry today; when and why the lake filled, and what broke it, is open (§12).
- **Tuff country (candidate).** The Catch, a dry walled basin SE of the Godthrone and downwind of it, could hold ash plains worn into hoodoos with carved underground cities, if the Godthrone ever erupted explosively. That is a lore decision (`biomes/WORLD.md`).
- **Korona.** A planned region in the NE, under the giant. It is formed of a type of volcanic structure or ‘corona’ that does not exist on Earth, but does exist elsewhere in the Solar System, forming a crazy quilt of small plateau, depressions, and microclimates. Known to be home to bandits and ghouls.

### 3.2 Regions [biomes/WORLD.md]

| **Region** | **Neighbours** | **People known there** |
|---|---|---|
| Central hyperjungle | N highlands, S highlands (steep borders) | Beast Riders (Girder, Mav’s Refuge), Screamers (Hexahedron), the Izani (Iziz) |
| Eastern Abyss | E high desert (steep) | the abyssal salt-marsh people; Geomancers (Locus) |
| Eastern high desert | Abyss (steep), E badlands, S highlands | Eastern Nomads (Shade), dune raiders |
| The Rift | Vale of Xanadu | Lizardmen |
| Southwest bay (central crater) | S highlands (steep) | (Voth's volcanic bay matches its description; see §12) |
| Southwestern lowlands | NW lowlands, S highlands | Dalab |
| Crater drylands (two regions: N and W of the Throne; S of it) | SW bay, the savannah south of the hyperjungle | the Scyvoi |
| East Rift Highlands / Vale of Xanadu | the Rift | the Sultanate of Xanadu (Erewhon) |
| Northwestern lowlands | SW lowlands, N highlands, Korona | ??? only a sketch at this point |
| Northern highlands | NW lowlands, hyperjungle, NW bay, Korona | Iron Republic, Rustic Clansmen, Painted Men |
| *In progress / planned:* NW bay, E badlands, Korona, S highlands, E highlands; *possibly* S badlands | | Jimjam, ????, ghouls, bandits, ruffians |

The **Krator Scale Model** artifact holds the terrain: 3,098 × 2,786 km at 2 km a pixel, elevation from −2,600 to +17,100 m, plus climate rasters. Its database holds 35 named cultural and political region polygons, among them the **Inner Crater**, the **Empire of Iziz**, **The Rift** and the **Vale of Xanadu**.

## 4. The Ancients

**“No one truly knows who the Ancients were, or why they fell, or how exactly;** we only know their works, and that they were our ancestors; and that they, and by extension we, came from Somewhere Else.”

The Ancients were the original civilization that colonized Krator, with roots, however distant, in Earth. At least 1000 years ago they collapsed – so thoroughly and so extensively that it is no longer remembered exactly how long, except perhaps by a rare few. They collapsed long enough for their works to rust, but not so long they have entirely rusted away. In any case, while their civilization did not last, many of their works did.

**How they built.**

- House style: "Cyclopean · Modernist · Organic" (late Gaudí, Goldberg, Moebius, Soleri).
- Gleaming white metal in seamed panels, or blue-transparent glass; board-formed concrete; copper or bronze ring bands.
- "Some structures alienating, many dwarf the individual." Not light-and-airy.
- After the fall: metal tarnished, rusted or overgrown; glass gone.
- Their light was **cyan strips**, always dead in a ruin, but perhaps sometimes glow in forgotten corners.

**What they left.** Wreckage of a civilization:

- Workplaces and services: labs, factories, silos, fuel depots, data centres, robotics works, radar, dishes, hospitals, libraries, police stations, starports, ports with container ships, drone carriers and submarines.
- Military: bunkers, AA batteries.
- Housing: skyscrapers, "corn-cob" apartments.
- Huge **arcologies**, after Soleri: dam cities (**Veladiga**, **Theodiga**), the **Hexahedron** (1,100 m, 170,000 people), **Arcube**, **Arcbeam**, **Plymouth** ("the one people actually live in by the hundred thousand"), the cliff **Arcoindian**s, and the spomenik-style memorial cities (the Wing, the Drum, the Blades).
- The **Hanging City**.
- **The Unnamed**, a leaning 260 m prism "of unclear purpose".
- **The Engines**: ten cyclopean machines of unclear purpose on one plain (the Harrow, Strider, Breech, Gyre, Press, Sleeper, Carapace, Retorts, Needle and Ram).
- **Roketstad's spaceport**: five launch pads. Four ships flew and left empty pads; one never flew.

**Did they mean to leave?** There are signs that they fled, or some did. It is clear that there must have been a war or large scale conflict given the scars and craters seen over many arcologies, and the lost machines of war that still get unearthed to this day. Who fought who, over what, has been long forgotten.

**Decay is history.** Every Ancient building comes in one of six states: intact, ruined, toppled, rehabilitated/reclaimed, worn. "This building outlived its builders, and someone is living in it now." Reoccupiers patch the buildings with corrugate, timber and tarp, and their warm firelight sits against the dead cyan.

**Ancient survivals still running**

- **“The God”** at Dalab: the central AI of an Ancient genetic laboratory (see §6.1). At some point the descendants of its scientists forgot how to clear its context window and it has been ever slower and more erratic since, but its instructions are still considered divine.
- The **Grand Vault** at Yuni: one of the only working Ancient power plants known. A geothermal plant that supplies the settlement with plentiful power. Its output has been faltering in recent years; most think due to wear; but some scholars fear that the Vault may not have been built to keep people out, but to keep something else *in*, which grows ever stronger.
- The Izani Empire's last walking **mechs**: recovered from the ruins of the city and key to their empire. ~9 m bipeds kept going in the Forgemaster's Hall. Not originally war mechs, but anything is a war mech when you are mostly fighting people with swords.
- **The Ear**: the one Ancient satellite dish the Order of the History Monks can still point at the sky.
- Salvaged Ancient engines driving generators (Locus, Xanadu).
- **Ancient’s Valley** (also the Valley of the Ancients): In the far west (name subject to change), there lies a region of dense ruins which is believed to have been the Ancient’s capital. Now it is home only to mutants, killer robots, and the rare bandit desperate enough to seek refuge there.
- **Hub 01:** the merchants that pass from the crater to Xanadu through the Bowl and the Catch here rumors of robotic stalkers that strike in the night; this ruined arcology, high in the chill and thin-aired mountains, is their home.

## 5. Themes that run through every culture

1. **Life in the ruins.** Every culture is defined partly by how it treats the Ancient remains:
  - Dalab worships them, unknowingly.
  - The Order of the History Monks studies and hides them.
  - The Salvagers' guilds (of the Republic, Iziz and more) strip them.
  - The Screamers feed captives to one, that warps them into more Screamers.
  - The abyssal people recycle them "with pride and colour, not as squalor".
1. **Electric light is power.** It is not entirely rare, but precious, tenuous, and jealously guarded.
  - Iziz: military, rich and civic buildings only, from hilltop generators.
  - Yuni and Locus: The only fully electrified cities in the world.
  - Dalab: The God's cold teal light "is the priests' to give".
  - Xanadu: Jealously guarded by the Sultan, who is resented for the extravagance of his Pleasure Dome.
  - The Republic: electric light for the rich, and industrial purposes.
  - Voth: for the nobility and defensive purposes only. In conquered arcologies a bit more widespread, but unreliable.
  - Little to no electric light at all: Hykkousoi, the Rustic Clansmen, Reed Lake, nomads and the abyssal people.
1. **Wealth is legible in material.** Each culture has a tiered palette, with poor, common and court tiers in the furniture catalog. Stone and gold go to the top, timber or thatch to the bottom, salvage to the middle and bottom.
1. **Wealth climbs with height.** Erewhon, Iziz's hills and Yuni's oligarch towers all put the powerful high and the poor and industry low, by the water.
1. **Caravans.** Caravanserais at Yuni, Iziz, Locus, Shade, Jimjam and the abyss suggest one long-distance trade network across the crater. Major goods include spice, gold, petrol, relics, scrap, and medicines.
1. **Big beasts do most of the work.** Millipedes turn capstans and are ranched; giant beetles are livestock at Voth; elephant bugs carry passengers; flyers and riding spiders are ridden.
1. **Vehicles are present, but again rare and precious.** Yuni can call on a small fleet of dune buggies; otherwise there are the Izizian mechs, and perhaps a few others here and there, but motor vehicles are otherwise rare. In general, the terrain outside the flat desert limits wheeled vehicles’ utility.
1. **Firearms:** Present, but not as useful as might seem. The Republic is the most skilled in their production, and generally can make musket and cannon level technology. Though they can maintain ancient automatic weapons, ammunition is vanishingly rare and modern attempts to replicate it, unreliable. Izizian shield technology made projectile weapons of little use as a weapon of war for many centuries; with their downfall, it is beginning to make a comeback.

## 6. Peoples and polities

### 6.1 Dalab: the mound-builders (SW lowlands)

- The descendants of the staff, patients and test subjects of an **Ancient genetic laboratory**, a domed compound at the centre of their land. **They do not remember this.**
- The staff's descendants became the caste of **priests and rulers**.
- **The God** is the lab's AI. Its counsel keeps biomedical knowledge alive, and it "grows more erratic every century". Its seat is a sunken chamber of cabinet banks: "a plant room to a stranger and a shrine to a priest". Its image is a rayed head with **one great eye**.
- Nearly everyone carries the photosynthesis mod and is **green-skinned**.
- **Genepriests** sell modifications to outsiders in the **Halls of Reformation**: night vision, pressure adaptation, extra limbs. Dalab healers are prized across Krator.
- **The Giant tribes of the south-west came from here.** The priests keep Giant guards: four-armed ceremonial guards at the temples, and two-armed street patrols in threes.
- Priests commune with The God from earth mounds built to imitate the Ancient domes. Each town's mound faces the lab. The High Priest's mound faces *away* from it, behind a ring earthwork guarded by giants.
- Castes:
  - Peasants: rammed earth, thatch and scrap, round plans.
  - Traders: timber frames.
  - Nobles: grey megalithic stone.
  - Priests: stone temples on the mounds.
- Look: "Cahokian monumentality in rammed earth, wood, stone and scrap", with Tiwanaku and Mesoamerican stone (trilithon gates, steles). "The red marks what is holy." Priests wear white with gold head-dresses.
- **Embassies** of Iziz, Voth, Yuni, and the Iron Republic.
- Livestock: the Dalab lizard (2.4 m, striped; frilled bulls). Also a monster pen of genetic aberrations and experiments.
- Six outlying towns ring the lab: Ashfold, Greenmarch, Reedholm, Oakhaven, Cornwell, Stonebrook.
- Daranch: a larger agricultural settlement, true center of their experimental breeding program.
- Blade, Span: wrecked arcologies that are northern Dalab outposts against the machines and mutants of Ancient’s Valley
- Ledge: an outpost on the eastern Rift, across the Outer Wall. As the Dalab cope well with altitude, they don’t find it too hard to keep supplied.

### 6.2 The Empire of Iziz: the Izani (hyperjungle)

- It is believed that Iziz was a very important city to the Ancients; certainly it contains the largest collection of Ancient ruins outside the Valley of the Ancients itself. But it was long abandoned and covered by jungle when the Izani tribe adopted it as their new home. It is not clear where the Izani came from originally, though their legends suggest they came from a destroyed arcology and wandered the jungle for many generations. Using the mechs and shield technology found there in the ruins, they were able to establish an Empire of the Crater that lasted almost 800 years; though this Empire had only toeholds outside the Inner Wall, it was the largest polity seen since the Cataclysm. But the technology has degraded and with it, so has the Empire. Around 300 years ago, a succession dispute drove one claimant, Mav of House Duxun, into exile; when she and her followers learned to ride the quetzal, they impressed the disparate Beast Rider tribes and united them into a unified force for the first time ever, launching an invasion to reclaim her throne. This invasion failed, but the western territories used it as an opportunity to declare independence, just in time for the Vothic invasions across the Inner Wall were beginning. The Empire of Iziz has seen better days, but with the recent recapture of Hook from Vothic control, things may be beginning to turn around….Copper roofs "where the Empire still can".
- City:
  - Walled, with a moat and four gates.
  - Three mesa hills "like the hills of Rome": the palace citadel, the temple hill and the arena hill.
  - A ruined spaceport on the NW causeway; a farm belt.
- Palace: its hall is a converted Ancient hangar "for entertaining Izani and foreign nobles". Emblem: an **orb**; the culture's sign elsewhere is a **sun**.
- Materials by class:
  - Timber: everyone.
  - Reclaimed Ancient metal: poor and middle.
  - Plaster: middle.
  - Orange ashlar and verdigris copper: rich and civic.
  - Palm thatch: poor.
- Guilds:
  - Farmers.
  - Beast Hunters (trophy hall with a great skull).
  - Forgemasters (the mechs).
  - Salvagers, in an Ancient lab, "the Reliquary".
  - Mercenaries, in an Ancient police station, "the Watch".
- Ancient Iziz Style: Iziz forms built the Ancients' way, such as tripod markets hung from reclaimed skyscrapers.
- Ships: a turtle ship plated with Ancient hex plate, a dhoni, a wheel galley, a salvage lighter.
- **History:** the Izani Empire once held Roketstad as a munitions hub until the **Mutiny of the 3rd Legion**.
- **The Izani Empire at its height controlled the whole central crater, the central highlands, much of the eastern desert, and large parts of the N, NW and SW lowlands.**
- **Now controls the SW crater and some stretches of desert leading to eastern and southern trade routes**
- **Settlements:**
  - Talia (gateway to the east)
  - Port Tobin (major port, Iziz proper is landlocked)
  - Fort Vaklu (fort against the beast riders)
  - Hook (ancient port city; recently recaptured from Voth)
  - Verge Upper City
- **The city of Dilihan (NW crater, “The Cut” region) was settled by Izani colonists and is a loyalist stronghold landlocked and cut off from the main empire. The northern lowlands also had many loyalists.**

### 6.3 The Iron Republic (highlands of the Inner Wall)

- The most settled, developed highland state. Russian and Transylvanian Saxon architecture; Peleș villas for the grand; East-Asian dougong on civic eaves; Tlingit/PNW-coast formline carving.
- **Capital: Roketstad**. "Once an Ancient spaceport, a munitions hub of the Izani Empire, and since the Mutiny of the 3rd Legion, the capital and forge town of the Iron Republic, ~5 000 souls"; later made the capital and doubled in size.
  - Districts: Scraptown, the Scrap Kontor, a wreck market.
  - **The Fallen Arcology**: a crashed ship broken in two, with a poor town in the cleft.
- **Emblem**: a triskelion of three arms, each fist holding a sword at 90°. Colour: red.
- **Faith:** polytheist?. The **Temple of the Pantheon** has the gods as carved pillars round the precinct, plus animal totems of gods and guilds. [ed: this is sort of a placeholder atm and subject to change]. Totems proper are tribal only.
- Guilds:
  - Mercenaries.
  - Alchemists (high explosives).
  - Farmers.
  - Smiths.
  - Mechanics (clockwork).
  - Astronomers (orrery, observatory).
  - **Salvagers**, formerly Scavengers: "those who strip the Ancient ruins".
  - **Rocketeers**.
- Capital institutions: the Hall of the Republic, the **Arsenal** (racks of rockets), the Mint and Treasury, the Forgehouse.
- A salvage culture: houses in fuel tanks, rocket stages and hull plate. **Shipbreakers** dismantle the ships "that came down short of the port".
- Murals: Norse and Celtic knots, triskele, tree of life, wolves, Mjölnir, the green gas giant, and **rockets** (Republic only).
- Landlocked: no ships.

### 6.4 The Rustic Clansmen (northeast of the Republic)

- "Relatively civilised" Norse and Alpine villages: stave churches, longhalls, dragon heads, falu red. No electric light.
- Highland dwellers.
- Sign: the **fir**. Clan crests, clan totems, antler trophies.

### 6.5 The Painted Men (high-country raider tribes)

- "The Painted Men and other raider tribes of the northeast high country."
- Raw logs and bamboo; whole painted house-fronts; totems everywhere; thunderbird finials.
- **Cliff settlements** hung on rock faces.
- Formline crests: salmon, orca, thunderbird, bear; poles of eagle, bear and frog. Faces are out ("creepy").
- Sign: the **raven**. Shamans' houses, warriors' halls, stone circles.

### 6.6 The Beast Riders (hyperjungle; Mav's Refuge, Girder)

- Divided into tribes, they were subjugated by the Izani Empire for hundreds of years until the exiled Queen Mav defected, impressed them with her natural talent as a quetzal-whisperer, and united the tribes. The civil war was a stalemate but they secured their independence. Current kings and queens must keep many tribal chiefs happy to exercise any real power
- Known tribes:
  - Quetzal (reigning)
  - Wingclaw (giant archeopteryx)
  - Dragonfly
  - Nightwing (giant bat)
  - Spider
  - [Veloci-] Raptor
  - Staghorn [Beetle]
  - Threehorn [triceratops]
  - Hardshell [glyptodont]
  - Tiger
  - Mammoth
  - Longcrawler [millipede]
  - More? TBD
- **Mav's Refuge**: a tree city on 300–480 m hypertrees on the NE lee shore of the Ring Sea (1.9 atm, 33 °C).
  - Three **gateway trees** are giant baobabs carved down to ~30 m, with spiral ramps and beast lifts: "un-assailable".
  - The central platform, **Mav's Crown**, carries the **Council Chamber**, with speakers' stones at the quarters.
  - Holds: Ghostwood Hold, Prism Hold, Highbough, Southbank Hold, Riders' Rest. Also the Rookery and the Silk Loft.
- **Girder**: an outlying village in a cyclopean Ancient ruin of four rusted 30-storey frame towers.
  - Only the top and bottom floors are lived in; the middle has gone to vines.
  - Roost decks on top; a palisade, farms and a round tajug-roofed assembly hall below.
- **Pinnacle Rock:** Planned settlement build; a series of rookery platforms on rock stacks overlooking a canyon.
- Mounts: quetzalcoatlus, giant bats, giant archaeopteryx, giant dragonflies. Riders carry lances. **Spider-riders** ride giant spiders that climb trunks and leap on draglines; they live in silk houses and work silk looms.
- Architecture: Javanese joglo and limasan, Viking stave, Kashyyyk.
- Sign: the **claw** (three talon slashes), green. Skull poles; "simple but not primitive".
- Barracks are named by **Wing**. Nature shrines: First Bough, Rain Mother, Winged Ones, Deep Root, Green Silence.
- Ships: a double-hulled voyaging canoe with a flyer's perch; a rookery raft.

### 6.7 The Screamers (north of the central crater; the Hexahedron)

- A tribe living in and under the ruined **Hexahedron** arcology (1,100 m, a double pyramid held 300 m up on shafts).
- The Screamers are notable for two things: one, they seem to eschew ordinary speech and language, and communicate solely by screaming, yelling, and grunting at each other. This seems to be enough for them to get by, as they appear to have something like a functioning tribal village based out of a ruined arcology, the Hexahedron. This would make them more of a curiosity except for their habit of kidnapping outsiders and whisking them away to the Hexahedron, after which, they are never seen again… or if they are, they’re seen screaming and grunting along with everyone else at the next Screamer raid. Whether this is due to some kind of genetic or technochemical process, or even contagious mental illness, is not clear. None have ever returned and most caravans give the Hexahedron a wide berth, lest they fall into a Screamer punji trap, or wake up in the night by screaming raiders with nets and lassos.

The Screamers’ mental faculties are a bit warped, but they are not stupid. They don’t know much of the wider world but, but they do know they are surrounded on all sides by foreigners babbling nonsense at each other, and it’s doing them a favor to bring them back to the village so the elders can make them Talk Good.

- "The Ancients left no way in at ground level, so the tribe cut one."
- They keep the intact waist promenade cut back from the jungle.
- **The chief's palace** is a ruined skyscraper lashed to the promenade.
- **Captives:** warriors bring captives, "pale and unpainted", to a pen. Escorts later lead them into the Hexahedron, "where they go in and do not come out", or if they do, they
- Amazonian post-apocalyptic: lashed hardwood, palm thatch, salvaged sheet. Rust and plastic are "worn as treasure".
- Sign: the **skull**; painted dots.
- Economy: millipede ranches, orchards.

### 6.8 The Eastern Nomads (eastern high desert; Shade)

- **Shade**: a sunken sandstone basin of about 1,000 people.
  - A 46 m fall drops into a turquoise plunge pool.
  - Petra-style carved facades, Mesa Verde cliff dwellings, adobe pueblos and black goat-hair tents.
  - One switchback is "the only way up".
- Factions: the Shade clans, the **Wardens of the Deep Aquifer** (priests), the canyon guard, visiting caravaneers and the **dune raiders**.
  - The raiders come as a convoy of camel riders every few days; they water and trade.
- Faith: the **Shrine of the Deep Aquifer**, carved behind the falls. Worship at dawn and dusk.
- The Khan (caravanserai), camel lines. Sign: **horns**.

### 6.9 The abyssal people and the Geomancers (eastern Abyss; Locus; Yuni)

- **Abyssal people**: "who live on the salt marshes and river deltas at the edge of the eastern abyss, beside the Geomancers' oil works and the ruins of the Ancients".
  - Scavengers and recyclers, proud of it.
  - Houses on piles; shade first (sails, umbrellas); bright paint and pastel lime-wash.
  - Repurposed tanks and containers.
  - Swoop-and-horn thatch with gilded tips is reserved for the sacred and noble. Tin-mirror cladding marks wealth and sanctity.
  - Nothing electric.
  - Faith: the **Temple of the Altar**, "the altar of the abyss": a stepped salt-white altar with a fire bowl and a ring of glowing blue crystals.
  - Ruler: the Headman.
  - Catalog culture `eastabyss` (Maghrebi/Arab): sign a **star**, mashrabiya.
- **The Geomancers**: a guild that drills for oil (refinery "still-house", pumpjacks, a generator on a salvaged Ancient engine).
  - Their oil town **Locus** (~2,650 people) sits on a delta at the red salt lake, farming salt-rice.
  - Their Chapterhouse holds a rock relief-map table, drill cores and a brass gnomon.
  - In Yuni they hold the Cloisters. Culturally "mostly Yuni".
  - Lizard riders patrol in sixes.

### 6.10 Reed Lake: the lake people

- Live on reed islands in the lakes of the Eastern Abyss; cousins of the Abyssal culture
- Floating islands of piled reed in the shallows: "the lake's answer to the Highland tribes' cliff settlements".
- **A completely different culture** from the Highland tribes. No totems and no formline; Andean textile geometry instead (the chakana, step-frets). Puma prows on the boats.
- Mudhif halls, a spirit circle, watchtowers "against raiders". Water buffalo. Fire always sits on lake mud.
- Sign: the **fish**.

### 6.11 Yuni (far SE, Outer Wall)

- Yuni: a former Ancient installation under a 400 m Devil's-Tower-like butte, in a Mediterranean side valley of the Outer Wall. ~10,000 people.
- De facto run by the Geomancers; their greatest stronghold (the Vault)
- Large History Monk presence (see 6.15)
- **Ruled by an Emir**: "in practice an oligarchy; the prominent families choose a new one". The families compete in height with tower-houses.
- "The Ancients were here first": their buildings stand as superblocks inside the wall, and Yuni's radial grid is laid around them.
  - The **Reliquary** (an Ancient lab).
  - The **Starfish** (a starport ruin on the summit).
  - The Grand Vault, with six sealed doors in its antechamber: "the first room of a whole complex".
- Look: Gaudí + Burmecia + Sahelian for the rich; Musgum, Mandara and Tiebele mud architecture for the poor; neo-African civic buildings.
- Gates: Shepherds', Caravan, North, River, Potters'. The slum is **the Thatch**. Desert nomads come to the caravanserai.
- Sign: the **hyperboloid**, yellow. No ships.
- Controls Locus, Verge lower city, and an outpost to their north [TBD].

### 6.12 Voth (SW Bay of Ring Sea)

- If Iziz is Rome, the Vothic kingdom is less Carthage and more the Ottomans. The Chichani tribes of the SW basin had long been on again, off again client states of the Empire of Iziz. As the Empire fell into civil war, the Chichani were on the warpath as well. On the eve of the death of the heirless old Chichani chief (or so the legends say), a lone adventurer arrived to the kingsmoot in the city of Shim. He bore a golden staff and demonstrated he could strike a dozen men down at once with a blast of light from its tip., and claimed he had travelled for many months in the uncharted peaks of Giant Country and climbed a holy mountain to obtain it. This was clear evidence of his divine favor and the priests declared him Tzintzun, or "Son of the Sun". With this power, and the army's newfound fanaticism, Tzintzun went on to lead the Chichani personally in victory against their neighbors and rivals, the Ruin-dwellers of Nazar, who were enslaved. In the meantime, the western settlements of the Empire had declared independence after the civil war raged on. The Chichani moved against the arcology of Wing, to their north, and destroyed and enslaved the settlement when they refused to submit. After this, the nearby cities of Hook, Torus, and Drum felt they had no choice but to surrender. The capital of this new kingdom, Voth (meaning 'Victory') was established about 200 years before present at the most auspicious site the priests could augur, a brackish but bountiful bay on the edge of the Ring Sea. Here he reigned, and still reigns; He does not seem to age. He has led his people to countless victories over the peoples to the North and extended the empire, founding the port cities of Almua and Zey-Danin to foster control over the rich Spice Isles of the Ring Sea. Most of their neighbors call this the Vothic Kingdom, though to themselves it is called Tzintzuntzan, or "Realm of the Sun of the Sun".
- Before Tzintzun's arrival, the Chichani believed the Sun needed a human sacrifice on the winter solstice every year to give it new life. Under Tzintzun, this practice has expanded dramatically, both as a means of social control and because Tzintzun declared the Sun's favor was key to their prosperity. Some Monks of History note the existence of records of ancient devices that could transfer life force from one individual to another, and have drawn a connection; one particular proponent of this got himself executed, and the Order itself banned from the Kingdom, by saying this too loudly in front of a priest. Suspected Monks or their agents are still hunted down to this day by the secret police
- Krator grew out of the Voth project hence many legacy files may point to it.
- Aesthetically and architecturally inspired by Morrowind Dunmer and the Aztecs
- Capital is A Venice/Vivec - like city of **cantons**: platforms over water joined by causeways (Palace, Temple, Arsenal, Guild, Foreign, Granary, Market, Arena, Ancestry, Port, Fortress).
- Other major Chichani-majority cities are Shim (old capital), Almua (major port), Temora (spice port), Zey’danin (gateway to the Volcano)
- Main ethnicity is Chichani, but substantial plurality of conquered peoples including
  - Arcology chiefdoms (Torus, Drum;)
  - Ruin tribes (Agropolitans [ed: name subject to change], Nazarites)
  - Nomads (some Scyvoi tribes)
  - Slaves: Nazarites and Wingmen (of the destroyed arcology)
- **Ancestry canton**: a pyramid necropolis of family tombs and hanging gardens.
- Palace: "flying buttresses between tiers, skylights and atria, a lot of gold, a teeny bit of porphyry and black trim".
- Giant beetles are livestock. **Elephant bugs** carry passengers. **Cliff racers** fly over land.
- Arena: gladiators from noon to sundown.
- **Ordinators**: temple guards in green-and-gold armour, about 180 of them. A branch of them forms the secret police. Also purple-robed priests; a crimson-and-gold high priest; grey-robed penitents in threes; monks; pilgrims on shrine circuits.
- Sign: the **diamond**, ash-white on deep purple. Ships: the Ordinator flagship, chitin biremes, cargo hulks.
- An embassy (a clan compound) stands in Iziz and Roketstad.
- **Language and script.** Vothic descends, very distantly, from English; its sounds sit between Purépecha and Morrowind's Dunmer: aspirated stops and affricates (p/ph, t/th, k/kh, tz/tzh, ch/chh), a high central vowel ï, tap r and retroflex rh, a breathed hl, and v, z, dh. Regular changes from English: s- > tz (sun > *tzun*, son > *tzin*: Tzintzun, "Son of the Sun"), st- > tzh, sp- > ph, sk- > kh, sl- > hl, tr- > ch, str- > chh, sh > s, ch/j > sh, f/w > v, final r > rh, final b/d/g devoice, unstressed syllables fall (victory > *Voth*). *-tzan* "realm, place of" is a Chichani survival. The script has 33 letters, Georgian bowls crossed with Daedric blades, in English alphabetical order, each named for a worn-down English word (*Ash*, *Bon* "bone", *Tzun* "sun", *Hlev* "slave"); three marks are systematic: the thorn (aspiration, and hl), the bar (d > dh) and the root (n > ng, r > rh). The full stop is the diamond. Chart, letter names and a transliterator: `lore/vothic-script.html`. [the owner, Oct 2026]

### 6.13 The Sultanate of Xanadu (East Rift Highlands)

- "The remote southern Sultanate": a rich hilly valley "like Shangri-La". **Gold is on everything wealthy, religious or civic; the valley's mines pay for it.**
- Look: Tibetan massing with Indian, Turkish and Persian detail; Andean "cholet" paint. **No minarets, great prayer wheels instead.**
- Rulers: the Sultan's Palace, the **Pleasure Dome**, the **Grand Vizier**.
- Guilds: Farmers, Miners, Goldsmiths ("the richest house in the valley"), Alchemists, Masons, Spicers.
- Faith: temples, monasteries and a pilgrims' circuit of prayer wheels.
- **Erewhon, Pearl of Xanadu** [Ed: city is half built rn as hill placement is broken and haven’t been able to spare a session for it].
  - 20,000 people on a mountain lake.
  - The palace sits on a plateau above a cliff; the prison is in a cliff.
  - The **Pleasure Dome of the Bay** is the Sultans' own extravagance, built for their feasts. It is not Ancient: no Ancient dome stood there. [the owner, Oct 2026]
  - **The Caves of Ice** are an Ancient construction, not a natural cave. Something deep inside keeps them unnaturally cold. The sacred river Alph. [the owner, Oct 2026]
- **Origins:** the Xanadui likely descend from **Theodiga**, the Ancient dam arcology at the valley mouth that harnessed the cascade (§4). *Xanadu*, *Alph* and the *Caves of Ice* are Ancient names, taken from Coleridge's *Kubla Khan*. [the owner, Oct 2026]
- What to say of the fabled city of Erewhon, Pearl of Xanadu, Queen of Cities? Its great wealth and great remoteness make it a byword for exoticism and luxury among the peoples of the northern crater. The Vale of Xanadu is blessed by geography – a lush vale in an eastern rift lake, rising above the abyssal lakes that stretch west; to the north, rough high passes, often blocked by lava flows or earthquakes, are the most direct way to reach the teeming peoples of the Crater. With this ruggedness, only brave adventurers and traders brave the country, its bandits, and the robotic stalkers rumored to haunt it to venture south to Xanadu. But ah, what rewards! For Xanadu has plentiful gold mines and lush fields of cacao and other spices to match. Even the poorest of Erewhon eat like nobles elsewhere – and the Sultan himself? Well, the feasts and orgies of the Pleasure Dome have made Xanadu a byword for decadence as well. With its closest neighbors being the peaceful History Monks of the chilly Oidong Valley, and the lowlands tribes of Lizardmen who occasionally raid, but find the highland air too thin and chilly, the Sultanate has enjoyed splendid isolation for most of its history; even Iziz at its height was not so arrogant as to try to conquer it.
- Things may be poised to change however. The current Sultan, a tremendously fat man who relies on 4 servants to carry him around in a palanquin, is such a prodigal spender that even the Sultanate’s ledgers are running in the red; and his longsuffering Grand Vizier has been pulling his beard out trying to muster up more money for guard patrols. The Lizardmen, from as much as can be gathered about that famously hostile race, seem to have new leadership, and their raids grow increasingly bold. While rich, the Sultanate is rather deficient in iron ore and scrap, and their best weapons are always obtained from Izizian and Yuni traders. If something were to cut that trade off, trouble may well come to paradise….
- Sign: the **eight-spoked wheel**, saffron and maroon. Ships: a swan barge, a dragon boat, a bullion carrack.

### 6.14 Jimjam

- An exotic city of red and yellow brick with white marble trim, domes, staged spires and Tudor chimneys.
- Ruled by **the Raja**.
- At its heart, a **solstice sun temple** whose arch frames the summer-solstice sunset. Emblem: a gold sun on red banners.
- Not snowy. Biome and location not yet given. [ed: I keep flip flopping on where to put them but they are not in the central crater or Rift]

### 6.15 The Monks of History (or Order of Historians)

- **The Monks of History** "attempt to learn the details of the obscured past, preserve ancient relics, and in some cases hide away the more dangerous ones."
  - Saffron-robed monks and academics; only they and the geomancers may enter the **Vault**.
  - Their saffron is the Order's colour.
  - Chapterhouses at Dalab, Iziz and Locus.
  - They keep the Ear.
  - Main monastery is at Oidong (far south, over the outer wall.)
  - Rumored to have techniques to speed up and slow down time.

### 6.16 Hykkousoi

- **Hykkousoi**: a seafaring people, Greek + Polynesian + organic. Nacre, olive wood, sea-linen, bronze. Sign: the **wave-sun** in gold. Their fleet includes a 162-oar trireme, a siege hexareme and a pearl-diving mother ship. No buildings yet.
- **Capital**: Ys, the half-drowned city [ed: under construction]
- The Hykkousoi's enemies disparage them as fish-men, but in truth, they are more man than fish. This slur comes from their most well-known quality as a people however: the rib-gills most trueborn Hykkousoi have on their back and chest. A bare-chested Hykkousoi sailor has no fear of drowning, and indeed their most sacred sites are said to lie on the bottom of the Ring Sea. They are still men, not fish, though, and prefer the land - they prefer fire-cooked food and unrusted metal the same as others. But their half-drowned capital of Ys is notoriously hard for outlanders to navigate, with its half-drowned streets, and the Amphitriton, the great assembly hall and refuge of their people, is surrounded by water on all sides and virtually unassailable. The Hykkousoi are also notable in their close friendship to molluscs; Hykkousoi pearldivers and mother-of-pearl workers are the finest in the world, and even their buildings seem more grown than built. Ys, that half-drowned city, resembles nothing so much as a collection of reefs and barnacles growing around the still-standing towers of an Ancient city whose name is long-lost. The Hykkousoi are also the finest sailors in the world. Children may ask, why does a man who breathes water need a ship? You may as well ask why a man who has legs needs a horse. Swimming across the Ring Sea would be a fool's errand, particularly given the monsters that lurk in the depths. But the sailors - and pirates - of this nation are well known throughout all the Ring Isles. The Hykkousoi tend to get painful, and ultimately fatal gill-wither if they tarry too long in dry environments; hence they hug the northwest coast. Inland, in the rain shadow of the Inner Wall, their long time enemies, the nomadic Scyvoi dwell. The Vothic conquests to the south have put them both next in line in their march up the coast. For this, they have sought and obtained an alliance with Iziz. There is tension, however, as the Hykkousoi must always make clear they intend alliance, not fealty, much as the Empire would like it otherwise, particularly as it would re-unite them with the landlocked loyalist city of Dilihan. But the Hykkousoi are proud and intend to stay independent. The Hykkousoi indeed have a reputation for headstrong, even fractious. The major settlements - Ys, Tethys, Trigon - have their own proud histories and maintain separate armies, navies and outposts, and jockey for position amongst themselves. Disputes are settled at the Amphitriton, where their leader the Archon presides. The Archon, who is elected by a complicated tradition involving both elections and the casting of lots, is often an inoffensive compromise candidate, but the newly elected Archon, Jathrocles, is young, vigorous, and has his people ready to resist any Vothic invasion.

### 6.17 Peoples known only by name or kit

- **Ring Sea Islanders**: Polynesian and Ashlander. Sign: the **white island moon**. Boats: oruwa, karakoa, lakatoi.
- **Lizardmen**: reptilian, Amerindian. Sign: the **serpent**. Basking slabs instead of beds; jade scale inlay. Live in the deep Rift. Recently united under a warlord according to traveler tales.
- **The Giant tribes of the SW**: engineered at Dalab (§6.1). Some rebelled and now live independently in Giant Country.
- **Salvagers**: crews who refloat Ancient hulls.
- **Scyvoi**: nomadic **human** riders of **theropod-like lizards**, in the crater drylands (`biomes/crater-drylands`). Enemies of the Hykkousoi; some tribes are subjects of Voth (§6.12). They do not overheat easily. They live on the granite kopjes the wildfires go round, come down to reap what blossoms after a burn, and the most daring use the flames to trap game. [the owner, Oct 2026]
- **Post-Apoc settlers**: a culture-neutral salvage society. Its kit has a "big man's" house, a shaman hut, prisoner cages and a **Thunderdome** arena. Shop signs are pictographs, not writing. Sign: the **gear**. [ed: this is a generic kit to flesh out settlements esp reclaimed arcologies]
- **Shining Kingdom**: Northwestern lowlands, populous, destination for trade routes over the inner Wall. Control a city on the NE ocean known as Farport: mysterious traders visit from time to time, but no one from Krator has ever crossed this sea. Kingdom is vaguely Chinese inspired [ed: or perhaps Assyrian? Very much in flux, I haven’t fleshed them out yet]

## 7. Peoples of Krator (species and kinds)

- **Humans**, in most cultures.
  - **Dalabites:** green skinned, chloroplast mod, famine resistant, often with other mods including night vision, pressure adaptation, extra limbs.
  - **Chichani:** tendency to ashen grey skin and night vision.
  - **Hykkousoi:** famed for rib-gills; water breathers
- **Giants**: engineered at Dalab, some four-armed.
- **Lizardmen.**
- **Mutants, aka ghouls (Korona, Valley of the Ancients)**

## 8. Ecology highlights (detail in each `biomes/*/NOTES.md` and `biomes/FRUIT.md`)

- **Hyperjungle**:
  - Hypertrees 150–480 m: Ironbark, Ghostwood, Prism gum, Gate baobab, Krator mahogany, Crimson kapok.
  - Fauna: sky rays (6–12 m soarers), striders, bough sloths, giant butterflies, glowing spore motes.
  - Food: gatepod chalk, which keeps a year.
- **Eastern Abyss**: a Carboniferous coal-swamp jungle that flowers straight off the trunk. Sky scale-trees (100–124 m, iridescent), seal-trees, giant horsetails, and mat reed for boats and thatch. Salt-cone kernels are poisonous until steeped a week in the salt lake.
- **Eastern high desert**: a red US-south-west desert with Socotran flora (dragon trees, boojums, quiver trees). One alien note: glowing pastel **twist-candles**. Desert kites, sand striders.
- **The Rift**: "the jungle Earth's flora never quite reached". Madagascar and Cretaceous forms, coral and anemone shapes; **iridescence is the rule**. Canon colours: **Vain fronds purple**, the purple fan shrub "sweet-potato purple".
- **SW bay**: a fungoid canopy (cap-trees 30–62 m), prism gums, a volcano 8 km NE.
- **Crater drylands** ("kiln country, which is also bloom country"): the crater floor in the rain shadow, ~1.9 atm. At that pressure plants lose about half the water an Earth plant would, and ~0.4 atm of oxygen makes dry scrub burn fast and hot, so the land is a **mosaic of burns of every age**. The burns are the places most alive: fire lilies in the char, then drifts of fireweed, poppies, lupine and flame plumes. **Prism mallee** (a small cousin of the prism gum, iridescent green to orange-red, resprouting from its root crown), **pyre pillars** (banded frond columns), the **frill-tree** that bursts in a fire and throws its fireproof seed, long-trunked parasol pines and ghost gums whose crowns stand above the flames, the **sword spire** that flowers once after a fire. Granite kopjes are the refuges.
- **NW bay** (the biome of Ys): Krabi's green-topped karst stacks in a turquoise bay, with cliff figs dropping root curtains to the waterline, travertine pools, black lava coves and mangroves. Up the dry slope stands a **tsingy** massif: rows of knife-edged limestone fins with spinewands (octopus trees) and silver rock bottles (Pachypodium) in its fissures. At its edge a **tiankeng**, 84 m deep, holds a rainforest of traveller's fans; in the jungle, **cenotes** reach down to the water table. Avenue baobabs stand on the lowland.
- **SW lowlands**: the US South turning Californian. What makes it alien is width (sprawl oaks ~80 m across) and red or pale bark. Cork groves are stripped red.
- **NW lowlands**: Asian and Australian forms at ~1.5× Earth heights; Ediacaran **sea pens** as shrubs; self-lit glow-willows.
- **Northern highlands**: "ancient, gnarled, never unfriendly"; broadleaf low down, bushy conifers.
  - **Great trumpets** (30–50 m) hold clean water all summer, and travellers drink from them.
  - Glowing bell-bulbs and lantern pods.
- **Southern highlands**: the spiral biome (the owner, Oct 2026). The Inner Wall's flank above the hyperjungle, where the cloud sea (the jungle's dense air, pooled below the Wall) laps against the scarp every day. Every plant grows in a spiral, and **every spiral turns the same way**: right-handed. A mirror-handed tree is rare, and the people of the Wall count it a sign.
  - Cloud forest: coilbarks wrung like cloth, **spiral trumpets** (long fluted funnels whose ribs twist; some climb the trunk in a corkscrew of funnels), **volute trees** whose limbs end in leafy scrolls, **spiral frill trees** (the Rift's frill tree come up into the
    cloud, its fins climbing the column in spirals), crozier tree ferns, screw palms; escargot begonias and corkscrew bells.
  - Above the cloud, a paramo of giant rosettes: the **ruffle-crown** (one great rosette of coral-edged leaves on a trunk), giant groundsels, spiral lobelias, spiral aloes; the **Whorl Stone**, a tor whose ledges spiral to its top.
- **Eastern highlands**: the cushion plateau (the owner, Oct 2026): an altiplano at about 0.6 atm under a deep blue sky, snow-capped volcanoes on every horizon. **Everything grows toward the giant**: cushions rise on its side, spikes and towers tilt to it, the ragbark's crowns fan out toward it; a traveller can steer by the plants.
  - Poured cushions (a llareta grown to Krator's size), and **the Mother Cushion**, one plant over a whole hill; woolbacks (vegetable sheep), thorn cushions, vigil spikes (whole stands flower together, then stand as dead torches), ragbark woods in the gullies, glass towers, hoar cereus; a cushion bog, a frozen tarn, a geyser field.
  - **Pallidine** (a placeholder name): the glass towers' alkaloid. A fungus in the moth larvae that eat the towers' roots makes it a mild, prized tonic (**wormwick**); the wild bees that work the towers carry it whole into their honey (**tower honey**, the dangerous version).
- **Vale of Xanadu**: "as if somebody kept it". Untrimmed-bonsai habits, petrified-wood colours, fairy rings, cacao, lotus.
- **Fauna in towns**: millipedes (draught), giant beetles (Voth), elephant bugs, cliff racers, the Dalab lizard, salt-lake flamingos and marsh emus (Locus), riding flyers and spiders. All fauna will go to one fauna kit, tagged by biome.

## 9. The Ring Sea fleets

| **Culture** | **Vessels** |
|---|---|
| Hykkousoi | trireme, scroll-sail galley, siege hexareme, pearl baghlah, amphora corbita |
| Voth (Ordinators) | Ordinator flagship (junk, green battened sails, gold wave), chitin bireme, cargo hulk |
| Xanadu | swan barge, dragon boat, bullion carrack |
| Iziz | turtle ship, dhoni, wheel galley, salvage lighter |
| Beast Riders | voyaging canoe, rookery raft |
| Ring Sea Islanders | oruwa, karakoa, lakatoi |
| Salvagers | refloated Ancient steel tug |
| Not seafaring | the Iron Republic (landlocked), Dalab, Yuni |

(An early commit also lists a Dalab galley and a Yuni junk; later notes say those cultures have no ships.)

## 10. Signs, colours and emblems

| **Culture** | **Sign** | **Colours** |
|---|---|---|
| Voth | diamond | ash-white on deep purple (the Ordinators wear green and gold) |
| Iziz | sun (palace: orb) | orange, teal, cream; striped awnings |
| Iron Republic | triskelion of sword-arms | deep red, ochre, cream |
| Yuni | hyperboloid | yellow (the Order: blue) |
| Beast Riders | claw | green |
| Xanadu | eight-spoked wheel (also a sun-and-moon roundel) | saffron, maroon, turquoise, gold |
| Hykkousoi | wave-sun | gold, pale linen, slate blue |
| Ring Sea Islanders | white moon | bark, sand, sea teal |
| Dalab | eye in the sun | terracotta, cream, turquoise; The God's cold teal light |
| Jimjam | gold sun | red banners |
| Screamers | skull | painted dots |
| Eastern Nomads | horns | |
| East Abyss | star | red lacquer, teal and gold for the sacred |
| Rustic | fir | falu red, red-check |
| Painted Men | raven | black, red, teal formline |
| Reed Lake | fish, chakana | madder, ochre, black, undyed white |
| Lizardmen | serpent | jade, turquoise |
| Post-Apoc | gear | faded rust red, teal, mustard, olive |

Rule: a building never names a culture. Its sockets (awning, banner, flag, emblem, sign) are dressed by whichever culture holds it.

## 11. Who knows whom (contacts on record)

- **Embassies in Dalab:** Iziz, Voth, the Order of Historians (Yuni), the Iron Republic.
- **Embassy in Iziz:** Voth, as a clan compound.
- **The Order of Historians:** chapterhouses at Dalab, Iziz and Locus.
- **The Geomancers:** Locus and Yuni.
- **The Izani Empire and the Iron Republic:** connected by the Mutiny of the 3rd Legion at Roketstad.
- **Dalab and the NW Giant tribes:** the giants came from Dalab.
- **Caravans:** Yuni and the desert nomads; the Eastern Nomads and the dune raiders.
- **The Ring Sea:** a shared sea for the Hykkousoi, Voth, Xanadu, Iziz, Beast Riders and Islanders.

## 12. Contradictions and open questions

**Contradictions in the repo**

1. **Year length.** The sky docs say 365 days; the shared sky code uses `YEAR=360`. The solstice is day 350.
1. **Jimjam's latitude.** Specified as 30° (N?), sunset ~297°. As built: 40° S, ~242°.
1. **Yuni's valley mouth.** Faces NE in one comment, NW in the code.
1. **When the Ancients fell.** "A thousand years" at Yuni and Iziz, "millennia" elsewhere.
1. **Hypertree heights.** 290–480 m at Mav's, 150–270 m at Girder, and the Krator mahogany (245–305 m) called "the tallest in the belt".
1. **The drylands' rain shadow.** §6.16 puts the Scyvoi "in the rain shadow of the Inner Wall"; the crater drylands kit (Oct 2026) puts its desert in the Throne's. Both may hold.

**Open questions (nothing on record)**

- Why did the Ancients fall?
- What lurks under Yuni?
- Does Tzintzun actually have godlike powers or does he have some secret to make people think he does?
- What does the abyssal people's ruler call themselves (the Headman placeholder)?
- What exactly do the Screamers do with their captives in the Hexahedron?
- What is Korona? Who lives in the NW bay, the badlands and the southern highlands?
- When did the scablands' lake fill and break (the Ancients' time, a wetter age)? Did the Godthrone ever erupt explosively, laying the tuff of the Catch?
- What are the religions of Iziz, Yuni, the Beast Riders and the Hykkousoi? On record so far: The God at Dalab, the Republic's Pantheon, Voth's Temple and ancestor cult, Xanadu's prayer-wheel faith, the Altar of the Abyss, the Deep Aquifer, Jimjam's sun, and the Beast Riders' nature shrines.
- Is there a calendar, a common language, coinage (the Republic has a Mint), or writing (post-apoc signs are pictographs)?
