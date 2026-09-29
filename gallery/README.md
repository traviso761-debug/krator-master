# gallery/

The shareable gallery of every built world: https://claude.ai/artifact/UhTfQ2kioZEbrzZR1agHv9

It is private until you share it from the page's Share menu.

## Update it

```
python3 gallery/build_gallery.py        # rebuilds every listed build, then writes gallery/site/
```

Then ask Claude to republish `gallery/site/index.html` to the URL above, with
every file in `gallery/site/worlds/` attached. `gallery/site/` is not committed.

To add a world, add a line to `ENTRIES` in `build_gallery.py`. The page itself
is `index.template.html`; the script fills in the entry list.
