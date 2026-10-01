@echo off
rem Starts the Krator site: the first time it also sets it up. Close this window to stop it.
rem See START-HERE.md. (The work is done by host\sitectl.bat.)
call "%~dp0host\sitectl.bat" %*
