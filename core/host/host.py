#!/usr/bin/env python3
"""The host shell's file list (core/host/README.md; ROADMAP.md section 10). A build.py takes the shell the way it takes
core/biome: it names the files it wants (SHELL is the set every build on the shell takes) and resolves them, a local src/
copy with the same name winning for that build (record the override in that build's KNOWN_ISSUES.md):

    sys.path.insert(0, os.path.join(ROOT, 'core', 'host'))
    import host as khost
    CORE_HOST = khost.SHELL
    khost.resolve(PATH, CORE_HOST)          # PATH: {fragment name: path}; adds the ones the build does not have

The world clock is core/clock's (91-host-loop.js owns a KCLOCK), so it is in the list too."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
CORE = os.path.dirname(HERE)
# fragment name -> the core folder it lives in
WHERE = {
    '20-core-clock.js': 'clock',
    '90-host-camera.js': 'host',
    '91-host-loop.js': 'host',
    '92-host-panel.js': 'host',
    '94-host-polytool.js': 'host',   # opt-in: the authoring tools (inspect, polygon, path)
    '95-host-probe.js': 'host',
}
SHELL = ['20-core-clock.js', '90-host-camera.js', '91-host-loop.js', '92-host-panel.js', '95-host-probe.js']


def path(name):
    return os.path.join(CORE, WHERE[name], name)


def resolve(paths, names=SHELL):
    """Add each named shell file to `paths` unless the build has its own copy of that name. Returns the overrides."""
    own = []
    for f in names:
        if f in paths:
            own.append(f)
        else:
            paths[f] = path(f)
    return own
