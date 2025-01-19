# 7 Days to Die daytime bot

A Discord bot that reports the daytime and the current player count of a _7 Days to Die_ game server
as the bot activity state. The bot switches its _afk_ status to _Idle_ when there are no players on the server,
and _Online_ when there are players.

Example statuses:
```
🕊️Day 118/119, 12:00 🧍1
💀Day 119, 12:00 🧍2
💀Day 120, 03:00 🧍4
🕊️Day 120/126, 04:01 🧍1
🕊️Paused at Day 122/126, 04:11
```

Currently, there are some assumptions on the game server configurations:
- `TelnetEnabled` is set to `true`
- `TelnetPort` and `TelnetPassword` values have been specified
- `BloodMoonRange` has a default value of `0`

## Installation

### Discord bot

- Create a new bot application in the Discord Developer Portal
- In _Settings > Bot_: use the _Reset Token_ button to generate a new token, copy that for later
- In _Settings > Bot > Privileged Gateway Intents_: enable _PRESENCE INTENT_ and _MESSAGE CONTENT INTENT_
- In _Settings > OAuth2 > Url Generator_: check the scope `bot` and bot permissions `Read Messages/View Channels`,
  `Send Messages`, and `Use Embedded Activities`
- Use the generated URL to invite the bot in your Discord channel.

### Node application

If your game server is running on the https://github.com/Didstopia/7dtd-server container image,
you can simply run the bot in a Docker container next to your game instance. Adjust the variables and volume mappings
accordingly. Or set up a container created from the `jaakkytt/7days-to-die-time-bot:latest` image,
and additionally specify the `TELNET_HOST` and `TELNET_PORT` variables. 

In case your `serverconfig.xml` property `BloodMoonFrequency` is not 7, you can either map a folder containing the
config file to `/usr/src/app/data` for the bot container (as in the example below), or pass the frequency as the
`SERVER_CONFIG_BLOOD_MOON_FREQUENCY` env variable to the container.

```
services:
  game:
    container_name: 7d2d
    image: didstopia/7dtd-server:latest
    restart: unless-stopped
    ports:
      - "26900:26900/tcp"
      - "26900:26900/udp"
      - "26901:26901/udp"
      - "26902:26902/udp"
    volumes:
      - ./game:/steamcmd/7dtd
      - ./data:/app/.local/share/7DaysToDie
    environment:
      - SEVEN_DAYS_TO_DIE_UPDATE_CHECKING=0
      - SEVEN_DAYS_TO_DIE_BRANCH=public
      - SEVEN_DAYS_TO_DIE_TELNET_PORT=8081
      - SEVEN_DAYS_TO_DIE_TELNET_PASSWORD=
  bot:
    container_name: time-bot
    image: jaakkytt/7days-to-die-time-bot:latest
    restart: unless-stopped
    volumes:
    - ./data:/usr/src/app/data
    depends_on:
      - game
    environment:
      - DISCORD_TOKEN=
      - DISCORD_LOGIN_TIMEOUT=60000
      - DISCORD_UPDATE_INTERVAL=20000
      - TELNET_HOST=game
      - TELNET_PORT=8081
      - TELNET_PASSWORD=
```

If you wish to run the Node.js application outside the container:
- clone this repo,
- run `npm install`,
- run `npm run build`,
- create an `.env` file from `.env.example` and fill in the variables in that file,
- and run `node dist/app.js`
