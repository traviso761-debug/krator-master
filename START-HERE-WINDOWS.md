# Krator Worlds on your Windows PC: a step-by-step guide

This guide gets the Krator Worlds running on a Windows computer, so you can explore them in **Google Chrome** on that
computer, and on any phone, tablet or laptop in your home. No programming knowledge is needed. It takes about
15 minutes the first time, most of it waiting for downloads.

You will do three things once: install Python, download Krator, and start it. After that, starting it again is a
double-click.

---

## Step 1: Install Python (one time only)

Python is a free program that Krator uses to run its small web server.

1. Open Chrome and go to **https://www.python.org/downloads/windows/**
2. Click the yellow **Download Python** button at the top of the page (any version **3.11 or newer** is fine).
3. Open the file you downloaded (it appears at the top right of Chrome, or in your **Downloads** folder).
4. **Important:** at the bottom of the first installer window, tick the box **"Add python.exe to PATH"**.
   If you miss this box, Krator cannot find Python.
5. Click **Install Now**, wait for it to finish, then click **Close**.

## Step 2: Download Krator (one time only)

1. In Chrome, go to **https://github.com/traviso761-debug/krator-master/archive/refs/heads/host-server.zip**.
   The download starts by itself. It is about 100 MB, so give it a few minutes.
2. Open your **Downloads** folder, right-click the downloaded file **krator-master-host-server.zip**, and choose
   **Extract All…**, then **Extract**.
3. You now have a folder called **krator-master-host-server**. You can move it anywhere you like, for example to
   your Desktop or Documents. Keep everything inside it together.

## Step 3: Start Krator

1. Open the **krator-master-host-server** folder.
2. Double-click **Start Krator** (with file extensions shown, it is `Start Krator.bat`).
3. A black window opens. **The first time only**, it prepares the worlds, which takes up to a minute. Then it
   shows lines like these:

   ```
   Krator site: Ctrl+C stops it.
   http://127.0.0.1:8001/
   http://192.168.1.20:8001/
   ```

   The second address is different on every network. Write it down: it is the one your other devices use.
4. **Windows may first ask whether to run the file,** because it came from the internet: a box titled
   *"Open File - Security Warning"* (click **Run**) or a blue *"Windows protected your PC"* box (click
   **More info**, then **Run anyway**).
5. **The first time, Windows Defender Firewall asks about Python** ("Windows Defender Firewall has blocked some
   features of this app"). Tick **Private networks** only and click **Allow access**. This lets the other devices
   in your home see Krator.

**Leave the black window open.** Krator runs as long as that window is open. To stop it, simply close the window.

## Step 4: Open Krator in Chrome

**On the same computer:** open Chrome and type **localhost:8001** in the address bar, then press Enter.

**On a phone, tablet or another computer** in your home: connect it to the same Wi-Fi, open Chrome, and type the
second address the black window showed, for example **192.168.1.20:8001**.

You will see the **Krator Worlds** gallery. Click any picture to open that world. Other pages:

| Type this after the address | To see |
|---|---|
| (nothing) | the Krator Worlds gallery |
| `/voth` | Voth, the city of cantons |
| `/menagerie` | the World Menagerie and all of its worlds |

**Tip:** once a page is open, press **Ctrl+D** (or tap the star in the address bar) to bookmark it, so next time you
only need to start Krator and click the bookmark.

## Make Chrome ready for 3D worlds

The worlds are 3D scenes that need your computer's graphics chip. Check this once:

1. In Chrome, open the menu (**⋮** at the top right) → **Settings** → **System**.
2. Make sure **Use graphics acceleration when available** is **on**. If you had to switch it on, click
   **Relaunch**.

While you explore:

- **Big worlds take a little while to appear.** The world is built on your computer when you open it. Most appear
  within a few seconds; the largest landscapes (the biomes such as *SW Lowlands* or *The Rift*) can take up to half
  a minute on an ordinary laptop. The page looks frozen during that time: that is normal.
- **If Chrome says "Page Unresponsive",** click **Wait**, not *Exit page*.
- **Open one world at a time,** and close a world's tab before opening the next. Each one uses a lot of memory.
- **Phones and small tablets** manage the smaller worlds and the kits well. The largest landscapes are best on a
  computer.

## Next time

1. Double-click **Start Krator** in the Krator folder.
2. Open your bookmark in Chrome (or type **localhost:8001**).
3. Close the black window when you are done.

## Getting a newer version

Do Step 2 again to download the newest Krator, extract it, and use the new folder in place of the old one (you can
delete the old folder). The first start of a new copy prepares the worlds again.

## If something goes wrong

| What you see | What to do |
|---|---|
| The black window says **"needs Python 3.11 or later"** | Python is missing, or the "Add python.exe to PATH" box was not ticked. Run the Python installer again, choose **Modify**, or uninstall and reinstall with the box ticked. Then restart the computer and try again. |
| Double-clicking **Start Krator** opens the **Microsoft Store** | Windows' own "python" shortcut is getting in the way. Install Python from python.org as in Step 1. If it still happens: Windows **Settings** → **Apps** → **Advanced app settings** → **App execution aliases**, and turn off the two **python** entries. |
| The black window flashes and disappears | Open the Krator folder, click the address bar at the top of the folder window, type **cmd** and press Enter. In the window that opens, type **"Start Krator"** (with the quotes) and press Enter. The message stays on screen; send it to whoever gave you Krator. |
| Chrome says **"This site can't be reached"** | Check the black window is still open. On another device, check it is on the same Wi-Fi and that you typed the address exactly, including **:8001**. |
| It works on this computer but not on my phone | Windows may be treating your home network as *public*. Windows **Settings** → **Network & internet** → your Wi-Fi → set **Network profile type** to **Private**. Then close the black window and start Krator again. |
| The black window says **"Address already in use"** | Krator is already running in another black window. Use that one, or close it and start again. |
| A world shows only a grey or black screen | Turn on graphics acceleration (see *Make Chrome ready for 3D worlds*), then reload the page with **F5**. |
| A world takes very long, or Chrome closes the tab | Close other tabs and programs and try again. The largest landscapes need a reasonably recent computer. |

## Good to know

- Krator works without an internet connection once it is downloaded.
- Only devices on your own network can see it. Do not change your router's settings to put it on the internet.
- Closing the black window stops Krator completely; nothing keeps running in the background.

*For technical details (Linux, macOS, other options and configuration), see `host/HOSTING.md`.*
