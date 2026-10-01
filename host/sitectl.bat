@echo off
rem Krator site server for Windows. Run it from cmd or PowerShell:
rem     host\sitectl.bat setup      first time: pull the Menagerie pages, build the gallery
rem     host\sitectl.bat serve      run the site until Ctrl+C
rem     host\sitectl.bat help       every command
rem Needs Python 3.11 or later (python.org). host\sitectl.py does the work; see host\HOSTING.md.
setlocal
set "PYTHONUTF8=1"
set "PY="
py -3 -c "import tomllib" >nul 2>&1
if not errorlevel 1 set "PY=py -3"
if not defined PY (
  python -c "import tomllib" >nul 2>&1
  if not errorlevel 1 set "PY=python"
)
if not defined PY (
  echo sitectl: needs Python 3.11 or later. Install it from https://www.python.org/downloads/windows/
  echo          ^(tick "Add python.exe to PATH"^), then open a new terminal and run this again.
  exit /b 1
)
%PY% "%~dp0sitectl.py" %*
exit /b %errorlevel%
