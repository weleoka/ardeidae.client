WebSocket Messaging Client for Ardeidae messaging server.

[Ardeidae homepage](http://www.student.bth.se/~kawe14/javascript/kmom10/webroot/index.php).

### Version
v1.2.2 (current)
v2.0.0


### Browser Support
Requires Javascript and enabled websockets in the browser.


### Overview
This is a simple client for linking up to a Ardeidae chat server. It's made using JQuery.


## Documentation
This client for the Ardeidae chat server comes with all login functionality and user signup, multiple styles, easy server select, private messaging and more.


### Installation
The client is HTML and Javascript. Host on any HTTP server and navigate to there with a websocket & javascript enabled browser to use it. Choose a server from the dropdown list.


Ardeidae personal chat server for node.js:
If you want to run your own server it can be found at:

'''
https://github.com/weleoka/ardeidae.git
'''
Or by Node Package Manager:
'''
$ npm install ardeidae
'''

### Current Features of Ardeidae client:
* After selecting a server the client makes a request to the server and adapts GUI depending on what the servers responds. If the server is in public or private mode the password field will be visible or not. The same for registering new user. The request is made using ajax and is set up to enable CORS.
* Maintain linebreaks in messages (alt + enter).
* Quick posting and login, accepts keyboard navigation.
* Private messaging to single or multiple peers.
* Visual feedback on operations and progress.
* Live stylesheet switching like daytime/night-time modes.
* Login to private server.
* New user registration directly with chat client.

* Bots to test functionality... add them on the BotButton... only for open server mode.


### Known Issues/Missing Features:
Functionality:
* Dynamic server list... requires independent ardeidae HUB.
* Chat room support.
* Needs media queries for responsive design.
* Stop users sending blank messages.
* Switch on and off server logging of your messages.
* A way to retrieve conversations to review historic message exchanges.

Specs and options:
* not formulated.

Security:
* Client side encryption of messages.

Code and style:
* Jquery .ajax object should use dataType: json and leave out dataFilter method to return parsed string.


## Contributing
If you'd like to contribute to Ardeidae's development, start by forking the GitHub repo:

https://github.com/weleoka/ardeidae

The best way to get your changes merged back on Gridless is as follows:

1. Clone your fork
2. Hack away
3. If you are adding significant new functionality, document it in the README
4. Do not change the version number, I will do that on my end
5. Push the repo up to GitHub
6. Send a pull request to [weleoka/ardeidae](https://github.com/weleoka/ardeidae)


## Licence
Creative Commons Share-Alike v4.0
