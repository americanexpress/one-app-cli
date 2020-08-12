# Using with Windows

## System Requirements

Since `one-app-runner` uses Docker, you will need to install Docker on your Windows machine. You need the following requirements:

* Windows 10 64-bit: Pro, Enterprise, Education (Build 16299 or later), Home (Version 2004 or higher)
* Hyper-V enabled
* If on Windows Home, enable the WSL 2 feature on Windows. For detailed instructions, refer to the [Microsoft documentation](https://docs.microsoft.com/en-us/windows/wsl/install-win10).
* The following hardware prerequisites are required to successfully run WSL 2 on Windows 10 Home:
  * 64 bit processor with Second Level Address Translation (SLAT)
  * 4GB system RAM

## Download Docker Desktop

If you haven't downloaded Docker, go ahead and [download Docker for Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows).

## Start Docker Desktop

Docker desktop does not start automatically after install. To start Docker Desktop, search for Docker, and select Docker Desktop in the search results. When the whale icon in the status bar stays steady, Docker Desktop is up-and-running, and is available in any terminal window.

## Use `one-app-runner`

Congratulations! You are now ready to use `one-app-runner` within your modules for local development!
