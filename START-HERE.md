# Krator Worlds at home: a step-by-step guide

This guide gets the Krator Worlds running on your computer, so you can explore them in **Google Chrome** on that
computer, and on any phone, tablet or laptop in your home. It works on **Windows**, **Mac** and **Linux**, and no
programming knowledge is needed. The first time takes about 15 minutes, most of it waiting for downloads.

You do three things once: **install Python**, **download Krator**, and **start it**. After that, starting it again
takes one double-click (Windows and Mac) or one command (Linux).

**Jump to your computer:** [Windows](#windows) · [Mac](#mac) · [Linux](#linux) · then
[open Krator in Chrome](#open-krator-in-chrome).

---

## Windows

### 1. Install Python (one time only)

Python is a free program Krator uses to run its small web server.

1. Open Chrome and go to **https://www.python.org/downloads/windows/**
2. Click the yellow **Download Python** button (any version **3.11 or newer** is fine).
3. Open the downloaded file (top right of Chrome, or your **Downloads** folder).
4. **Important:** at the bottom of the first installer window, tick **"Add python.exe to PATH"**. If you miss this
   box, Krator cannot find Python.
5. Click **Install Now**, wait, then click **Close**.

### 2. Download Krator (one time only)

1. In Chrome, go to **https://github.com/traviso761-debug/krator-master/archive/refs/heads/host-server.zip**.
   The download (about 100 MB) starts by itself.
2. Open your **Downloads** folder, right-click **krator-master-host-server.zip**, choose **Extract All…**, then
   **Extract**.
3. You now have a folder called **krator-master-host-server**. Move it wherever you like (Desktop, Documents);
   keep everything inside it together.

### 3. Start Krator

1. Open the **krator-master-host-server** folder and double-click **Start Krator** (`Start Krator.bat`).
2. **Windows may ask whether to run it,** because it came from the internet: click **Run** on *"Open File - Security
   Warning"*, or **More info** then **Run anyway** on a blue *"Windows protected your PC"* box.
3. A black window opens. **The first time only**, it prepares the worlds (up to a minute). Then it shows the
   addresses Krator answers at, [as described below](#what-the-window-shows).
4. **The first time, Windows Defender Firewall asks about Python.** Tick **Private networks** only and click
   **Allow access**, so the other devices in your home can see Krator.

**Leave the black window open:** Krator runs as long as it is open. Close the window to stop Krator.

Now [open Krator in Chrome](#open-krator-in-chrome).

---

## Mac

### 1. Install Python (one time only)

The Python a Mac may already have is too old for Krator, so install the current one.

1. Open Chrome (or Safari) and go to **https://www.python.org/downloads/macos/**
2. Click the yellow **Download Python** button (any version **3.11 or newer** is fine).
3. Open the downloaded **.pkg** file and click **Continue** and **Install** through the installer, entering your
   Mac's password when asked. Close it when it says the installation was successful.

### 2. Download Krator (one time only)

1. Go to **https://github.com/traviso761-debug/krator-master/archive/refs/heads/host-server.zip**.
   The download (about 100 MB) starts by itself.
2. Open your **Downloads** folder in Finder and double-click **krator-master-host-server.zip** to unpack it
   (Safari may already have unpacked it for you).
3. You now have a folder called **krator-master-host-server**. Move it wherever you like; keep everything inside
   it together.

### 3. Start Krator

1. Open the **krator-master-host-server** folder and double-click **Start Krator** (`Start Krator.command`).
2. **The first time, macOS will probably refuse,** saying it cannot check the file for malicious software or that it
   is from an unidentified developer. That is because it came from the internet. To allow it:
   - Click **Done** (or **OK**), then open the Apple menu → **System Settings** → **Privacy & Security**, scroll down to the
     message about *Start Krator.command*, and click **Open Anyway**. Confirm with **Open** and your password.
   - On older macOS versions you can instead hold **Control**, click the file, choose **Open**, then **Open** again.
3. A **Terminal** window opens. **The first time only**, it prepares the worlds (up to a minute). Then it shows the
   addresses Krator answers at, [as described below](#what-the-window-shows).
4. **If macOS asks** *"Do you want the application Python to accept incoming network connections?"*, click
   **Allow**, so the other devices in your home can see Krator.

**Leave the Terminal window open:** Krator runs as long as it is open. To stop Krator, close the window (click
**Terminate** if Terminal asks) or press **Control+C** in it.

Now [open Krator in Chrome](#open-krator-in-chrome).

---

## Linux

### 1. Check Python (one time only)

Most current Linux systems (Ubuntu 23.04 or newer, Debian 12, Fedora, Linux Mint 22) already have a new enough
Python, and you can skip to step 2. If step 3 later says Krator *"needs Python 3.11 or later"*: on Ubuntu 22.04 or
Linux Mint 21, open **Terminal** and type `sudo apt install python3.11`, then press Enter and type your password.

### 2. Download Krator (one time only)

1. In Chrome, go to **https://github.com/traviso761-debug/krator-master/archive/refs/heads/host-server.zip**.
   The download (about 100 MB) starts by itself.
2. In your **Downloads** folder, right-click **krator-master-host-server.zip** and choose **Extract Here** (or
   **Extract**).
3. You now have a folder called **krator-master-host-server**. Move it wherever you like.

### 3. Start Krator

1. Open the **krator-master-host-server** folder, right-click an empty space in it, and choose **Open in Terminal**.
2. In the Terminal window, type `./start-krator.sh` and press Enter.
3. **The first time only**, it prepares the worlds (up to a minute). Then it shows the addresses Krator answers at,
   [as described below](#what-the-window-shows).

**Leave the Terminal window open:** Krator runs as long as it is open. To stop Krator, close the window or press
**Ctrl+C** in it. (Linux usually has no firewall in the way. If yours does, see *If something goes wrong*.)

Now [open Krator in Chrome](#open-krator-in-chrome).

---

## What the window shows

When Krator is ready, its window shows lines like these:

```
Krator site: Ctrl+C stops it.
http://127.0.0.1:8001/
http://192.168.1.20:8001/
```

The **second** address is different on every network. Write it down: it is the one your phone, tablet and other
computers use.

## Open Krator in Chrome

**On the computer running Krator:** open Chrome and type **localhost:8001** in the address bar, then press Enter.

**On a phone, tablet or another computer** in your home: connect it to the same Wi-Fi, open Chrome, and type the
second address the window showed, for example **192.168.1.20:8001**.

You will see the **Krator Worlds** gallery. Click any picture to open that world. Other pages:

| Type this after the address | To see |
|---|---|
| (nothing) | the Krator Worlds gallery |
| `/voth` | Voth, the city of cantons |
| `/menagerie` | the World Menagerie and all of its worlds |

**Tip:** bookmark the gallery (**Ctrl+D** on Windows and Linux, **⌘+D** on a Mac, or the star in the address bar),
so next time you only need to start Krator and click the bookmark.

## Make it run smoothly

**Let Chrome use your graphics chip** (check once): open Chrome's menu (**⋮** at the top right) → **Settings** →
**System**, and make sure **Use graphics acceleration when available** is **on**. If you had to switch it on, click
**Relaunch**.

**Choose the level of detail.** Every Krator world has a small **LOD** button in its bottom-left corner. Click it to
switch between:

| Level | What it does |
|---|---|
| **high** | the world exactly as made: the sharpest picture, the most work for the computer |
| **medium** | a slightly softer picture and simpler shadows; tiny far-away objects are skipped |
| **low** | a softer picture, no shadows, fewer small objects, and a steady 30 frames a second: for older or smaller computers, phones and tablets |

The page reloads with the new level, and that browser remembers your choice for that world. The biggest landscapes
start at **medium**. If a world is slow, jerky, or makes Chrome close the tab, try **low**. (The World Menagerie's
pages have their own settings and no LOD button.)

**While you explore:**

- **Worlds take a moment to appear,** because each one is built on your computer when you open it. Most appear
  within a few seconds; the largest landscapes (such as *SW Lowlands* or *The Rift*) can take 15 to 20 seconds. The
  page looks frozen during that time: that is normal.
- **If Chrome says "Page Unresponsive",** click **Wait**, not *Exit page*.
- **Open one world at a time,** and close a world's tab before opening the next. Each one uses a lot of memory.

## Next time

1. Start Krator: double-click **Start Krator** (Windows or Mac), or open Terminal in the Krator folder and type
   `./start-krator.sh` (Linux).
2. Open your bookmark in Chrome (or type **localhost:8001**).
3. Close the Krator window when you are done.

## Getting a newer version

Download Krator again (step 2 for your computer), unpack it, and use the new folder in place of the old one (you can
delete the old folder). The first start of a new copy prepares the worlds again. On a Mac, you may need to allow
**Start Krator** again the first time, as in step 3.

## If something goes wrong

**On any computer:**

| What you see | What to do |
|---|---|
| The window says **"needs Python 3.11 or later"** | Install Python as in step 1 for your computer, then start Krator again. On Windows, make sure "Add python.exe to PATH" was ticked, and restart the computer afterwards. |
| Chrome says **"This site can't be reached"** | Check the Krator window is still open. On another device, check it is on the same Wi-Fi and that you typed the address exactly, including **:8001**. |
| The window says **"Address already in use"** | Krator is already running in another window. Use that one, or close it and start again. |
| A world shows only a grey or black screen | Turn on graphics acceleration (see *Make it run smoothly*), then reload the page (**F5**, or **⌘+R** on a Mac). |
| A world is very slow, or Chrome closes the tab | Click the **LOD** button and choose **low**. Close other tabs and programs. |

**Windows:**

| What you see | What to do |
|---|---|
| Double-clicking **Start Krator** opens the **Microsoft Store** | Windows' own "python" shortcut is in the way. Install Python from python.org as in step 1. If it still happens: **Settings** → **Apps** → **Advanced app settings** → **App execution aliases**, and turn off the two **python** entries. |
| The black window flashes and disappears | Open the Krator folder, click the address bar at the top of the folder window, type **cmd** and press Enter. Then type **"Start Krator"** (with the quotes) and press Enter. The message stays on screen; send it to whoever gave you Krator. |
| It works on this computer but not on my phone | Windows may be treating your home network as *public*: **Settings** → **Network & internet** → your Wi-Fi → **Network profile type** → **Private**. Then close the black window and start Krator again. |

**Mac:**

| What you see | What to do |
|---|---|
| macOS will not open **Start Krator** | Allow it in **System Settings** → **Privacy & Security** → **Open Anyway** (see step 3). |
| Terminal says **"Permission denied"** | Open **Terminal** (in Applications → Utilities), type `bash ` (with a space after it), drag the **Start Krator** file into the Terminal window, and press Enter. |
| It works on this Mac but not on my phone | Python was not allowed through the firewall: **System Settings** → **Network** → **Firewall** → **Options**, and set **Python** to *Allow incoming connections*. Then start Krator again. |

**Linux:**

| What you see | What to do |
|---|---|
| Terminal says **"Permission denied"** | Type `bash start-krator.sh` instead and press Enter. |
| There is no **Open in Terminal** | Open **Terminal** yourself, type `cd ` (with a space), drag the Krator folder into the Terminal window, press Enter, then type `./start-krator.sh`. |
| It works on this computer but not on my phone | A firewall is blocking it. On Ubuntu and Mint: in Terminal, type `sudo ufw allow 8001/tcp` and press Enter. |

## Good to know

- Krator works without an internet connection once it is downloaded.
- Only devices on your own network can see it. Do not change your router's settings to put it on the internet.
- Closing the Krator window stops it completely; nothing keeps running in the background.

*For technical details (the commands behind these steps, running Krator as a background service on Linux, and
changing each world's starting level of detail), see `host/HOSTING.md`.*
