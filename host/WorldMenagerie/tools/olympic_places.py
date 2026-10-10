"""The Olympic Peninsula's landmarks, views and settings, for tools/make-olympic.py (which writes them into
data/cities/olympic.json). Positions are the published ones, checked against OpenStreetMap; models are in
src/olympic/landmarks.js."""


def config(view, bounds, origin):
    S, W, N, E = bounds
    L = []

    def lm(name, la, lo, info, model=None, **kw):
        d = {"name": name, "at": [round(la, 5), round(lo, 5)], "info": info}
        if model:
            d["model"] = model
        d.update(kw)
        L.append(d)

    # ---- the mountains
    lm("Mount Olympus", 47.80131, -123.71083, "2,432 m, the highest of the Olympics, and it is hardly ever seen from anywhere a road goes: it stands in the middle of the range behind its own ridges. Its three summits carry the Blue, Hoh, White and Humes glaciers; it gets more snow than almost anywhere in the United States, because the storms off the Pacific hit it first.", None)
    lm("Blue Glacier", 47.8130, -123.6930, "The largest glacier on Mount Olympus, four kilometres long, flowing north off the summits into the valley of Glacier Creek. Like every glacier in the range it has been shrinking for a century.", None)
    lm("Mount Constance", 47.7753, -123.1286, "2,371 m, the peak at the north end of the range's eastern front, which Seattle sees across the Sound.", None)
    lm("The Brothers", 47.6503, -123.1322, "The double summit over Hood Canal, 2,092 m: the other half of Seattle's view west.", None)
    lm("Mount Angeles", 47.9997, -123.4610, "1,960 m, the mountain behind Port Angeles, with Hurricane Ridge running east from it.", None)
    lm("Mount Deception", 47.8133, -123.2343, "2,374 m, the second highest in the range.", None)
    lm("Enchanted Valley", 47.6797, -123.3908, "The upper East Fork of the Quinault: walls a thousand metres high with waterfalls coming down them by the dozen in spring, and the 1930 chalet that the river has been undermining.", "chalet")

    # ---- the north: the Strait, Hurricane Ridge, Lake Crescent, the Elwha
    lm("Hurricane Ridge Visitor Center", 47.96934, -123.49832, "At 1,598 m, an hour's drive up from Port Angeles: the road ends here, the meadows are full of deer and marmots, and Mount Olympus stands up across the Elwha valley.", "visitorcenter", turn=0.3)
    lm("Lake Crescent", 48.0622, -123.8290, "A glacier-carved lake 190 m deep, so clear and so poor in nitrogen that algae hardly grow in it; the water is blue down to twenty metres. Its trout are a strain found nowhere else.", None)
    lm("Lake Crescent Lodge", 48.05867, -123.80112, "1915, on Barnes Point: Franklin Roosevelt stayed here in 1937, and a year later signed the bill that made the national park.", "lodge", turn=2.6, wings=2)
    lm("Marymere Falls", 48.04722, -123.78706, "Falls Creek dropping 27 m off a cliff in old-growth forest, a short walk from the lake.", "waterfall", drop=27, width=4, turn=0.8)
    lm("Sol Duc Falls", 47.95330, -123.83400, "The Sol Duc River splitting into three or four channels and dropping 15 m into a narrow slot canyon.", "waterfall", drop=15, width=12, turn=2.4, cascade=1)
    lm("Sol Duc Hot Springs", 47.96964, -123.86350, "Hot springs in the upper Sol Duc valley, a resort since 1912.", "lodge", turn=0.2, wings=1, small=1)
    lm("Glines Canyon", 48.0002, -123.5998, "Where the Glines Canyon Dam stood, 64 m of concrete across the Elwha, from 1927 until it was taken down in 2014 - the largest dam removal anywhere. The salmon came back up the river within weeks.", None)
    lm("Elwha River mouth", 48.1490, -123.5660, "The new delta: seventy years of sediment held behind the two dams came down the river once they were gone and built a beach where there had been none.", None)
    lm("Port Angeles", 48.1181, -123.4307, "The peninsula's biggest town, on its harbour behind the long sand spit of Ediz Hook; the MV Coho sails from here to Victoria across the Strait.", None)
    lm("Ediz Hook", 48.1405, -123.4030, "A natural sand spit five kilometres long that makes Port Angeles's harbour; the Coast Guard air station is at its end.", None)
    lm("New Dungeness Lighthouse", 48.18170, -123.11060, "At the end of the Dungeness Spit, nine kilometres of sand into the Strait, the longest natural spit in the country. The light has been lit since 1857; the walk out and back is the whole of a day.", "lighthouse", height=28, colour="#f4f2ec", top="#2a2a2a")
    lm("Sequim", 48.0796, -123.1018, "In the rain shadow of the Olympics: forty centimetres of rain a year, where the Hoh, sixty kilometres west, gets three and a half metres. It grows lavender.", None)
    lm("Point Wilson Lighthouse", 48.14430, -122.75470, "1879, on the point where the Strait turns into Admiralty Inlet, at Fort Worden in Port Townsend.", "lighthouse", height=15, colour="#f4f2ec", top="#a8302a")
    lm("Port Townsend", 48.1145, -122.7560, "A Victorian seaport that expected the railroad, built for it in brick and wooden gingerbread in the 1880s, and was left exactly as it was when the railroad went to Tacoma.", None)
    lm("Hood Canal Bridge", 47.8586, -122.6236, "The longest floating bridge in the world over salt water, 2.4 km of pontoons across the mouth of Hood Canal; it opens in the middle for ships and submarines.", "floatingbridge", turn=1.2, length=2400)

    # ---- the west: the coast, the rainforest
    lm("Cape Flattery", 48.38420, -124.71460, "The north-westernmost point of the contiguous United States, on the Makah Reservation: sea caves and cliffs, and Tatoosh Island off it with its lighthouse.", None)
    lm("Cape Flattery Lighthouse", 48.39170, -124.73640, "On Tatoosh Island, 1857, where the Makah had a summer fishing village for a thousand years before it.", "lighthouse", height=20, colour="#f4f2ec", top="#2a2a2a", house=1)
    lm("Neah Bay", 48.3681, -124.6250, "The Makah town, at the very end of the road. The Makah Museum holds what the mudslide at Ozette kept for five hundred years.", None)
    lm("Lake Ozette", 48.0500, -124.6500, "The largest unaltered natural lake in Washington, three kilometres from the sea; boardwalks run through the forest from it to Cape Alava and Sand Point.", None)
    lm("Rialto Beach", 47.92060, -124.63830, "Sea stacks, driftwood logs as big as houses, and the arch of Hole-in-the-Wall a walk to the north.", None)
    lm("Hole-in-the-Wall", 47.93460, -124.65410, "A sea arch the waves have bored through a headland north of Rialto Beach; you walk through it at low tide.", "seaarch", turn=1.2)
    lm("La Push", 47.90780, -124.63800, "The Quileute town at the mouth of the Quillayute River, with James Island standing off First Beach.", None)
    lm("James Island", 47.90500, -124.64460, "A'ka'lat, the Quileute's: a sea stack with forest on top, off the mouth of the river.", None)
    lm("Second Beach", 47.88890, -124.62500, "A walk through the forest to a beach of sea stacks and tide pools; the Quillayute Needles stand off it.", None)
    lm("Forks", 47.9504, -124.3855, "A logging town, the rainiest in the lower 48 - and then, because of a novel set here, a place people come to see.", None)
    lm("Hoh Rain Forest", 47.86040, -123.93480, "The wettest place in the contiguous states, three and a half metres of rain a year: Sitka spruce and western hemlock ninety metres tall, bigleaf maples hung with club moss, nurse logs with rows of young trees growing out of them. The Hall of Mosses is a short loop from the visitor center.", "visitorcenter", turn=1.0, small=1)
    lm("Ruby Beach", 47.71080, -124.41670, "Where Cedar Creek reaches the sea: sea stacks, a beach of driftwood, and Abbey Island off it. The sand is red with garnet in places, which is the name.", None)
    lm("Kalaloch Lodge", 47.61280, -124.37470, "Cabins on the bluff over the beach, built in the 1920s; the sunsets from here are the coast's.", "lodge", turn=1.5, wings=1, small=1)
    lm("Tree of Life", 47.60810, -124.37430, "A Sitka spruce at Kalaloch that has lost the ground under it: the creek has washed the bluff away, and it stands across the gap on its roots.", "rootstree")
    lm("Queets River", 47.5470, -124.3320, "The least visited of the rainforest valleys: a gravel road, a ford, and spruce.", None)
    lm("Lake Quinault Lodge", 47.46640, -123.84560, "1926, on the south shore of Lake Quinault, built in fifty-three days: Roosevelt had lunch here in 1937 on the trip that made the park.", "lodge", turn=0.4, wings=2)
    lm("Lake Quinault", 47.4740, -123.8520, "A glacial lake on the Quinault Nation's land, at the foot of the rainforest; the world's largest Sitka spruce stands on its south shore.", None)
    lm("Quinault Big Spruce", 47.47030, -123.84890, "The largest Sitka spruce in the world: 58 m tall, 5.9 m across, a thousand years old.", "bigtree", height=58, girth=5.9)
    lm("Staircase", 47.5150, -123.3290, "The south-eastern entrance, up the North Fork Skokomish above Lake Cushman: old growth along the river and the rapids.", None)
    lm("Aberdeen", 46.9754, -123.8157, "The lumber port on Grays Harbor at the mouth of the Chehalis and the Wishkah; Kurt Cobain's town.", None)

    view_ = {
        "Hurricane Ridge": view((47.9660, -123.4900), (47.80131, -123.71083), 25, 400),
        "Mount Olympus": view((47.8500, -123.6200), (47.80131, -123.71083), 900, -200),
        "The Blue Glacier": view((47.8350, -123.6800), (47.8130, -123.6930), 500, -50),
        "Lake Crescent": view((48.0700, -123.7600), (48.0622, -123.8290), 300, 0),
        "Lake Crescent Lodge": view((48.0560, -123.7965), (48.05867, -123.80112), 30, 8),
        "The Hoh Rain Forest": view((47.8590, -123.9300), (47.8640, -123.9450), 35, 15),
        "Ruby Beach": view((47.7135, -124.4120), (47.70500, -124.42200), 45, 0),
        "Rialto Beach": view((47.9165, -124.6350), (47.9346, -124.6541), 25, 0),
        "La Push and James Island": view((47.9100, -124.6290), (47.90500, -124.64460), 40, 10),
        "Cape Flattery": view((48.3800, -124.7050), (48.39170, -124.73640), 80, 0),
        "Lake Quinault": view((47.4580, -123.8250), (47.4800, -123.8800), 250, 0),
        "Port Angeles and the Strait": view((48.0700, -123.4600), (48.1405, -123.4030), 700, 0),
        "The Dungeness Spit": view((48.1400, -123.1700), (48.18170, -123.11060), 450, 0),
        "Port Townsend": view((48.1000, -122.7750), (48.1145, -122.7560), 160, 0),
        "The Hood Canal Bridge": view((47.8350, -122.6600), (47.8586, -122.6236), 250, 0),
        "Enchanted Valley": view((47.6650, -123.4050), (47.6950, -123.3800), 400, 0),
        "The whole peninsula": view((46.70, -123.65), (47.80, -123.65), 52000, 0),
        "The range from the Strait": view((48.3000, -123.4000), (47.80, -123.60), 2500, 0),
        "The timberlands": view((47.6000, -124.1000), (47.5000, -124.0500), 3000, 0),
    }
    return {
        "name": "Olympic National Park",
        "note": "Generated by tools/make-olympic.py (and tools/olympic_places.py), which write this file, olympic-osm.json and olympic-land.json: edit the scripts, not this. The whole Olympic Peninsula on the shared engine: 162 by 167 km of the real ground (AWS Terrain Tiles on a 200 m grid, sea level at y = 0) and OpenStreetMap's roads, rivers, lakes, glaciers and buildings.",
        "origin": list(origin), "defaultSeed": 1938, "defaultHour": 10.0, "defaultView": "Hurricane Ridge",
        "bounds": [S, W, N, E], "osm": "data/cities/olympic-osm.json",
        "attribution": "Map data © <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> contributors · elevation: AWS Terrain Tiles (SRTM/NED)",
        "seaLevelWater": True,
        "sky": {"day": {"top": "#6a8fb8", "hor": "#d4dde4"}, "dusk": {"top": "#3a4466", "hor": "#e0956a"}, "night": {"top": "#05080f", "hor": "#141a26"}},
        "fog": 5.5e-06, "overcast": 0.22,
        "terrainColours": {"low": "#3e5a36", "high": "#2c4a2c", "steep": "#6a665e", "far": "#2f4a52"},
        "terrainLOD": [12000, 30000],
        "farLevel": -1.5, "waterColour": "#2a4f60", "lakeColour": "#2f5a66", "lakeSheen": "#7a9aa8",
        "litWindows": 0.5, "streetTrees": 0.2, "parkedCars": 0.35, "traffic": 0.2, "people": 0.2, "streetFurniture": False,
        "beacons": False, "lowRiseFar": 12000, "flight": True, "riverBoats": {"sail": 0, "motor": 0, "kayak": 0},
        "roofPitch": 0.6, "roofColours": ["#4a4e52", "#5a5e62", "#3e4246", "#6a4a3a", "#3a4a3e", "#7a6a5a"],
        "palette": {"brick": ["#c8c0b0", "#a8b0b4", "#d8d0c0", "#8a9a8a", "#b8a890", "#e8e4dc", "#6a7a8a", "#9a6a5a"], "stone": ["#d8d4cc", "#c0bcb4"]},
        "roadColours": {"trail": "#9a8a6a"},
        "districts": {"_": "[name, hex colour, base height, tallest, box]",
                      "portangeles": ["Port Angeles", "#a8a090", 5, 14, [48.08, -123.50, 48.15, -123.36]],
                      "porttownsend": ["Port Townsend", "#b8a888", 5, 14, [48.08, -122.82, 48.16, -122.73]],
                      "sequim": ["Sequim", "#a8a080", 5, 10, [48.05, -123.15, 48.12, -123.05]],
                      "forks": ["Forks", "#8a8a7a", 4, 9, [47.92, -124.42, 47.98, -124.36]],
                      "aberdeen": ["Aberdeen and Hoquiam", "#9a9488", 5, 14, [46.95, -123.95, 47.01, -123.75]],
                      "park": ["Olympic National Park", "#3a5a3a", 3, 8, [47.45, -124.0, 48.05, -123.15]],
                      "outer": ["The Olympic Peninsula", "#5a6a5a", 4, 10, None]},
        "focus": [], "landmarks": L, "views": view_,
        "olympic": {"_": "src/olympic/: the forest, the rainforest, the timber, the glaciers, the surf, the sea stacks, the elk and the weather",
                    "forestNear": 3600, "forestTile": 800, "forestPerTile": 3800, "forestFull": 1100, "clouds": 160, "cloudBase": 1500,
                    "surfFar": 9000, "elk": 3},
    }
