Strikr is a simple and interesting game i've made as a little side project. This "game" is still in extremely BETA AND EARLY ACCESS. LOTS OF GAME ELEMENTS WILL BE UNPOLISHED AND BUGGY AND UGLY. I'm working on constant updates but they take a lot of time so yeah! 

Welcome to the Plus version! This is an improved, better and more maintained version of the game! If you'd like to play AN ACCESS CODE IS REQUIRED!!!!! To get an access code Click on Issues and make a new request with:
1. Why do you want to play this version?
2. Do you agree to not leak your access code to anyone else?
3. Will you be willing to contribute to the game upon request?

I will pick you within a few hours or a few days if I'm busy! I will personally either message you or talk to you and generate a valid code.

Have fun!

Game has been Renamed to Strikr for educational purposes.

https://redsn0w1877.github.io/Strikr/

## Multiplayer development setup

The repository now ships with a lightweight Node.js WebSocket server that coordinates 4-player rooms.

```bash
cd server
npm install
npm run dev
```

By default the server listens on `ws://localhost:3001`. When serving `index.html` locally, the lobby overlay will prompt you to create or join a room using a 4–8 character code once the initial license and name flow completes. You can override the WebSocket endpoint by launching the page with `?server=ws://host:port` in the URL.
