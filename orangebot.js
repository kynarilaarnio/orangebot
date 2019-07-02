// Require dependencies
const nconf = require("nconf"),
  fs = require("fs"),
  irc = require("irc"),
  named = require("named-regexp").named,
  dns = require("dns"),
  dgram = require("dgram"),
  request = require("request"),
  udpServer = dgram.createSocket("udp4"),
  TelegramBot = require("node-telegram-bot-api");

// Require bot modules
const Server = require("./server.js"),
  Rcons = require("./rcons.js"),
  Utils = require("./utils.js");

(function loadConfigs() {
  const confPath = "./config.json",
    defaults = require("./default-config.json");

  // Create configs from defaults if not exists
  if (!fs.existsSync(confPath)) {
    fs.writeFileSync(confPath, JSON.stringify(defaults, null, 2));
  }

  nconf.file({
    file: confPath
  });
})();

// Read configs
if (nconf.get("ip") === "") nconf.set("ip", require("ip").address());
const admins = nconf.get("admins"),
  statics = nconf.get("statics"),
  rconPass = nconf.get("rconPass"),
  whitelist = nconf.get("whitelist"),
  pool = nconf.get("pool"),
  telegram = nconf.get("telegram");

// Storing the bot state
const bot = {
  admins64: [],
  servers: {}
};



if (nconf.get("irc")) {
  bot.ircClient = new irc.Client(nconf.get("irc:server"), nconf.get("irc:nick"), {
    channels: nconf.get("irc:channels"),
    realName: nconf.get("irc:realname"),
    autoRejoin: true
  });
}

if (telegram && telegram.token.length && telegram.groupId.length) {
  bot.telegramBot = new TelegramBot(telegram.token, {
    polling: true
  });
}

function addServer(host, port, pass) {
  dns.lookup(host, 4, function(err, ip) {
    bot.servers[ip + ":" + port] = new Server({
      address: ip + ":" + port,
      pass: pass,
      nconf: nconf,
      bot: bot
    });
  });
}

for (const i in admins) {
  if (admins.hasOwnProperty(i)) {
    bot.admins64.push(Utils.id64(admins[i]));
  }
}

if (bot.hasOwnProperty("telegramBot")) {
  bot.telegramBot.on("message", function(msg) {
    if (!msg.text) {
      return;
    }

    // Only listen set group chat
    if (String(msg.chat.id) !== telegram.groupId) {
      return;
    }

    //const name = msg.from.username || msg.from.first_name;
    const message = msg.text;

    // Message have to be reply
    if (msg.reply_to_message) {
      const re = named(/@(:<addr>\d+\.\d+\.\d+\.\d+:\d+)/m);
      const match = re.exec(msg.reply_to_message.text);
      if (match !== null) {
        const addr = match.capture("addr");
        if (message.match(/^!/)) {
          bot.servers[addr].say(message);
        } else {
          bot.servers[addr].chat(" \x06Admin: \x10" + message);
          bot.servers[addr].center("Admin: " + message);
        }
      }
    }
  });
}

udpServer.on("message", function(msg, info) {
  const addr = info.address + ":" + info.port,
    text = msg.toString();

  console.log("<" + addr + "> " + Utils.clean(text).substring(3));

  let param, cmd, re, match;

  if (bot.servers[addr] === undefined && addr.match(/172.17.0./)) {
    bot.servers[addr] = new Server({
      address: String(addr),
      pass: String(rconPass),
      nconf: nconf,
      bot: bot
    });
  }

  // Connected
  re = named(/"(:<user_name>.+)[<](:<user_id>\d+)[>][<](:<steam_id>.*)[>]<>" connected/);
  match = re.exec(text);
  if (match !== null) {
    if (match.capture("steam_id") !== "BOT") {
      // Get player Steam ID
      const conName = match.capture("user_name"),
        conId = match.capture("steam_id"),
        conId64 = Utils.id64(conId);

      // Check if connecting user is a player
      request("https://akl.gg/akl-service/api/users/communityid/" + conId64, function(error, response, body) {
        if (error) {
          bot.servers[addr].chat(" \x10Letting " + conName + " connect because AKL API is not responding.");
          return;
        }

        if (response.statusCode === 200) {
          bot.servers[addr].chat(" \x10" + conName + " (connecting) is a registered user.");
        } else if (Utils.whitelisted(conId, whitelist)) {
          bot.servers[addr].chat(" \x10" + conName + " (connecting) is whitelisted.");
        } else {
          bot.servers[addr].chat(" \x10" + conName + " tried to connect, but is not registered.");
          bot.servers[addr].rcon("kickid " + conId + " This account is not registered on akl.gg");
        }

        if (body.match(/(ROLE_ADMIN|ROLE_REFEREE)/gm) && bot.admins64.indexOf(conId64) < 0) {
          bot.admins64.push(conId64);
        }
      });
    }
  }

  // Halftime
  re = named(/World triggered "Announce_Phase_End"/);
  match = re.exec(text);
  if (match !== null) {
    console.log('phase_end')
    // bot.servers[addr].halftime();
  }


  re = named(/World triggered "Start_Halftime"/);
  match = re.exec(text);
  if (match !== null) {
    console.log('start_halftime');
    bot.servers[addr].halftime();
  }

  // Join to a team
  re = named(
    /"(:<user_name>.+)[<](:<user_id>\d+)[>][<](:<steam_id>.*)[>]" switched from team [<](:<user_team>CT|TERRORIST|Unassigned|Spectator)[>] to [<](:<new_team>CT|TERRORIST|Unassigned|Spectator)[>]/
  );
  match = re.exec(text);
  if (match !== null) {
    if (bot.servers[addr].state.players[match.capture("steam_id")] === undefined) {
      if (match.capture("steam_id") !== "BOT") {
        const player = {};
        player.steamid = match.capture("steam_id");
        player.name = match.capture("user_name");
        player.team = match.capture("new_team");
        bot.servers[addr].state.players[match.capture("steam_id")] = player;
      }
    } else {
      bot.servers[addr].state.players[match.capture("steam_id")].steamid = match.capture("steam_id");
      bot.servers[addr].state.players[match.capture("steam_id")].team = match.capture("new_team");
      bot.servers[addr].state.players[match.capture("steam_id")].name = match.capture("user_name");
    }
    bot.servers[addr].lastlog = new Date().getTime();
  }

  // Clantag
  // re = named(/Team playing "(:<team>CT|TERRORIST)": (:<clan_tag>.+)/)
  // match = re.exec(text);
  // if (match !== null) {
  //   if (match.capture("team") === 'TERRORIST') {
  //     bot.servers[addr].state.setClan.TERRORIST = match.capture("clan_tag");
  //   } else if (match.capture("team") === 'CT') {
  //     bot.servers[addr].state.setClan.CT = match.capture("clan_tag");
  //   }
  //   bot.servers[addr].lastlog = new Date().getTime();
  // }
  

  // Disconnect
  re = named(
    /"(:<user_name>.+)[<](:<user_id>\d+)[>][<](:<steam_id>.*)[>][<](:<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" disconnected/
  );
  match = re.exec(text);
  if (match !== null) {
    if (bot.servers[addr].state.players[match.capture("steam_id")] !== undefined) {
      delete bot.servers[addr].state.players[match.capture("steam_id")];
    }
    bot.servers[addr].lastlog = new Date().getTime();
  }

  // Map loading
  re = named(/Loading map "(:<map>.*?)"/);
  match = re.exec(text);
  if (match !== null) {
    for (const prop in bot.servers[addr].state.players) {
      if (bot.servers[addr].state.players.hasOwnProperty(prop)) {
        delete bot.servers[addr].state.players[prop];
      }
    }
    bot.servers[addr].lastlog = new Date().getTime();
  }

  // Map started
  re = named(/Started map "(:<map>.*?)"/);
  match = re.exec(text);
  if (match !== null) {
    bot.servers[addr].newmap(match.capture("map"));
    bot.servers[addr].lastlog = new Date().getTime();
  }

  // Round start
  re = named(/World triggered "Round_Start"/);
  match = re.exec(text);
  if (match !== null) {
    bot.servers[addr].round();
    bot.servers[addr].lastlog = new Date().getTime();
  }

  // Round end
  re = named(
    /Team "(:<team>.*)" triggered "SFUI_Notice_(:<team_win>Terrorists_Win|CTs_Win|Target_Bombed|Target_Saved|Bomb_Defused)" \(CT "(:<ct_score>\d+)"\) \(T "(:<t_score>\d+)"\)/
  );
  match = re.exec(text);
  if (match !== null) {
    const score = {
      TERRORIST: parseInt(match.capture("t_score")),
      CT: parseInt(match.capture("ct_score")),
    };
    bot.servers[addr].score(score);
    bot.servers[addr].lastlog = new Date().getTime();
  }

  // Map end xd
  re = named(/Game Over:.*score (:<ct_score>\d+):(:<t_score>\d+).*/)
  match = re.exec(text);
  if (match !== null) {
    const t_score = parseInt(match.capture("t_score"));
    const ct_score = parseInt(match.capture("ct_score"));
    bot.servers[addr].mapEnd(t_score, ct_score);
    console.log(t_score);
    console.log(ct_score);
    bot.servers[addr].lastlog = new Date().getTime();
  }

  // !command
  re = named(
    /"(:<user_name>.+)[<](:<user_id>\d+)[>][<](:<steam_id>.*)[>][<](:<user_team>CT|TERRORIST|Unassigned|Spectator|Console)[>]" say(:<say_team>_team)? "[!\.](:<text>.*)"/
  );
  match = re.exec(text);
  if (match !== null) {
    const isAdmin = match.capture("user_id") === "0" || bot.servers[addr].admin(match.capture("steam_id"));
    param = match.capture("text").split(" ");
    cmd = param[0];
    param.shift();
    switch (String(cmd)) {
      case "admin":
        const message = param.join(" ").replace("!admin ", "");
        if (bot.hasOwnProperty("telegramBot")) {
          bot.telegramBot.sendMessage(
            telegram.groupId,
            "*" + match.capture("user_name") + "@" + addr + "*\n" + message + "\n*Admin called*",
            {
              parse_mode: "Markdown"
            }
          );
        } else {
          bot.servers[addr].chat(" \x05Telegram bot is not set.");
        }
        break;
      case "restore":
      case "replay":
        if (isAdmin) bot.servers[addr].restore(param);
        break;
      case "status":
      case "stats":
      case "score":
      case "scores":
        bot.servers[addr].stats(true);
        break;
      case "restart":
      case "reset":
      case "warmup":
        if (isAdmin) bot.servers[addr].warmup();
        break;
      case "maps":
      case "map":
      case "start":
      case "match":
      case "startmatch":
        if (isAdmin || !bot.servers[addr].get().live) {
          bot.servers[addr].start(param);
        }
        break;
      case "force":
        if (isAdmin) bot.servers[addr].ready(true);
        break;
      case "resume":
      case "ready":
      case "rdy":
      case "unpause":
        bot.servers[addr].ready(match.capture("user_team"));
        break;
      case "pause":
        bot.servers[addr].pause();
        break;
      case "stay":
        bot.servers[addr].stay(match.capture("user_team"));
        break;
      case "swap":
      case "switch":
        bot.servers[addr].swap(match.capture("user_team"));
        break;
      case "knife":
        bot.servers[addr].knife();
        break;
      case "disconnect":
      case "quit":
      case "leave":
        if (isAdmin) {
          bot.servers[addr].quit();
          delete bot.servers[addr];
          console.log("Disconnected from " + addr);
        }
        break;
      case "say":
        if (isAdmin) {
          bot.servers[addr].chat(" \x06Admin: \x10" + param.join(" "));
          bot.servers[addr].center("Admin: " + param.join(" "));
        }
        break;
      case "whitelist":
        if (isAdmin) whitelist.push(param.join(" "));
        break;
      case "debug":
        bot.servers[addr].debug();
        break;
      case "ban":
        bot.servers[addr].ban(param, match.capture("user_team"));
        break;
      case "pick":
        bot.servers[addr].pick(param, match.capture("user_team"));
        break;
      case "bo1":
        if (isAdmin) bot.servers[addr].matchformat("bo1");
        break;
      case "bo3":
        if (isAdmin) bot.servers[addr].matchformat("bo3");
        break;
      case "matchformat":
        if (isAdmin) bot.servers[addr].matchformat(param[0]);
        break;
      case "team":
         bot.servers[addr].setClanName(param, match.capture("user_team"));
        break;
      default:
        break;
    }

    bot.servers[addr].lastlog = new Date().getTime();
  }
});

setInterval(function() {
  for (const i in bot.servers) {
    if (bot.servers.hasOwnProperty(i)) {
      const now = new Date().getTime();
      if (bot.servers[i].lastlog < now - 1000 * 60 * 10 && bot.servers[i].state.players.length < 3) {
        console.log("Dropping idle server " + i);
        delete bot.servers[i];
        continue;
      }

      if (!bot.servers[i].state.live && bot.servers[i].state.pool.length === 0) {
        if (bot.servers[i].state.knife) {
          // Hotfix: show correct help
          //bot.servers[i].rcon(Rcons.WARMUP_KNIFE);
          bot.servers[i].rcon(Rcons.WARMUP);
        } else {
          bot.servers[i].rcon(Rcons.WARMUP);
        }
      } else if (bot.servers[i].state.paused && bot.servers[i].state.freeze) {
        bot.servers[i].rcon(Rcons.MATCH_PAUSED);
      }
    }
  }
}, 15000);

// Show map bans to GOTV
setInterval(function() {
  for (const i in bot.servers) {
    if (bot.servers.hasOwnProperty(i) && !bot.servers[i].state.live && bot.servers[i].state.pool.length > 0) {
      bot.servers[i].rcon(
        "tv_msg Ban: " +
          bot.servers[i].state.banned.join(", ") +
          "																										Left: " +
          bot.servers[i].state.pool.join(", ")
      );
    }
  }
}, 2000);

// Execute queued RCON commands
setInterval(function() {
  for (const i in bot.servers) {
    if (bot.servers.hasOwnProperty(i) && bot.servers[i].state.queue.length > 0) {
      const cmd = bot.servers[i].state.queue.shift();
      bot.servers[i].realrcon(cmd);
    }
  }
}, 100);

// Add static servers
for (const i in statics) {
  if (statics.hasOwnProperty(i)) {
    addServer(statics[i].host, statics[i].port, statics[i].pass);
  }
}

// Bind UDP server
udpServer.bind(nconf.get("port"));

process.on("uncaughtException", function(err) {
  console.log(err);
});

console.log("OrangeBot listening on " + nconf.get("port"));
console.log("Run this in CS console to connect or configure orangebot.js:");
console.log(
  "connect YOUR_SERVER;password YOUR_PASS;rcon_password YOUR_RCON;rcon sv_rcon_whitelist_address " +
    nconf.get("ip") +
    ";rcon logaddress_add " +
    nconf.get("ip") +
    ":" +
    nconf.get("port") +
    ";rcon log on;rcon rcon_password YOUR_RCON"
);
