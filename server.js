const named = require("named-regexp").named,
  rcon = require("simple-rcon");

const Rcons = require("./rcons.js"),
  Utils = require("./utils.js");

module.exports = class Server {
  constructor(cfg) {
    this.cfg = {
      ip: cfg.address.split(":")[0],
      port: cfg.address.split(":")[1] || 27015,
      pass: cfg.pass,
      adminip: cfg.adminip,
      adminid: cfg.adminid,
      adminname: cfg.adminname,
      nconf: cfg.nconf,
      bot: cfg.bot
    };

    this.state = {
      live: false,
      map: "",
      maps: [],
      knife: false,
      score: [],
      round: 0,
      knifewinner: false,
      paused: false,
      freeze: false,
      unpause: {
        TERRORIST: false,
        CT: false
      },
      ready: {
        TERRORIST: false,
        CT: false
      },
      steamid: [],
      admins: [],
      queue: [],
      players: {},
      banner: "",
      pool: [],
      banned: [],
      picked: [],
      stats: "",
      format: "bo1"
    };

    this.setup();
  }

  setup() {
    if (this.cfg.adminid !== undefined && this.state.steamid.indexOf(this.cfg.adminid) === -1) {
      this.state.steamid.push(Utils.id64(this.cfg.adminid));
      this.state.admins.push(this.cfg.adminname);
    }

    this.rcon(
      "sv_rcon_whitelist_address " +
        this.cfg.nconf.get("ip") +
        ";logaddress_add " +
        this.cfg.nconf.get("ip") +
        ":" +
        this.cfg.nconf.get("port") +
        ";log on"
    );
    this.status();

    const that = this;
    setTimeout(function() {
      that.chat(
        " \x10Hi! I'm OrangeBot." +
          (that.state.admins.length > 0 ? " \x0e" + that.state.admins.join(", ") + "\x10 is now my admin." : "")
      );
      that.chat(" \x10Start a match with \x06!start map \x08map map");
    }, 1000);

    console.log("Connected to " + this.cfg.ip + ":" + this.cfg.port + ", pass " + this.cfg.pass);
  }

  get() {
    return this.state;
  };

  // Queue RCON command
  rcon(cmd) {
    if (cmd === undefined) return;
    this.state.queue.push(cmd);
  }

  // Send RCON command instantly
  realrcon(cmd) {
    if (cmd === undefined) return;
    const that = this;
    const conn = new rcon({
      host: that.cfg.ip,
      port: that.cfg.port,
      password: that.cfg.pass
    })
      .on("authenticated", function() {
        cmd = cmd.split(";");
        for (const i in cmd) {
          if (cmd.hasOwnProperty(i)) {
            conn.exec(String(cmd[i]));
          }
        }
        conn.close();
      })
      .on("error", function(err) {
        console.error(err);
      })
      .connect();
  }

  // Try solve team name
  clantag(team) {
    if (team !== "TERRORIST" && team !== "CT") {
      return team;
    }
    const tags = {};
    let ret = "Team";
    if (team === "TERRORIST") ret = Rcons.T;
    else if (team === "CT") ret = Rcons.CT;

    for (const i in this.state.players) {
      if (
        this.state.players.hasOwnProperty(i) &&
        this.state.players[i].team === team &&
        this.state.players[i].clantag !== undefined
      ) {
        if (tags[this.state.players[i].clantag] === undefined) {
          tags[this.state.players[i].clantag] = 0;
        }
        tags[this.state.players[i].clantag]++;
      }
    }
    let max = 0;
    for (const prop in tags) {
      if (tags.hasOwnProperty(prop) && tags[prop] > max) {
        ret = prop;
        max = tags[prop];
      }
    }
    ret = Utils.clean(ret);
    if (team === "CT" && this.clantag("TERRORIST") === ret) {
      ret = ret + "2";
    }
    return ret;
  }

  // Call admin via Telegram
  admin(steamid) {
    return (
      this.state.steamid.indexOf(Utils.id64(steamid)) >= 0 || this.cfg.bot.admins64.indexOf(Utils.id64(steamid)) >= 0
    );
  }

  // Calculate stats
  stats(tochat) {
    const team1 = this.clantag("TERRORIST");
    const team2 = this.clantag("CT");
    const stat = {};
    stat[team1] = [];
    stat[team2] = [];

    for (const i in this.state.maps) {
      if (this.state.score[this.state.maps[i]] !== undefined) {
        if (this.state.score[this.state.maps[i]][team1] !== undefined) {
          stat[team1][i] = this.state.score[this.state.maps[i]][team1];
        } else {
          stat[team1][i] = "x";
        }
        if (this.state.score[this.state.maps[i]][team2] !== undefined) {
          stat[team2][i] = this.state.score[this.state.maps[i]][team2];
        } else {
          stat[team2][i] = "x";
        }
      } else {
        stat[team1][i] = "x";
        stat[team2][i] = "x";
      }
    }

    const maps = [];
    const scores = [];

    for (let j = 0; j < this.state.maps.length; j++) {
      maps.push(this.state.maps[j] + " " + stat[team1][j] + "-" + stat[team2][j]);
      scores.push(stat[team1][j] + "-" + stat[team2][j]);
    }

    const out = team1 + " [" + scores.join(", ") + "] " + team2;
    const chat = " \x10" + team1 + " [\x06" + maps.join(", ") + "\x10] " + team2;

    if (tochat) {
      this.chat(chat);
    } else {
      this.rcon('mp_teammatchstat_txt "' + out + '"');
      this.state.stats = out;
    }

    return out
      .replace(/\x10/g, "")
      .replace(/\x06/g, "")
      .replace(/_/g, "\\_");
  }

  // Restore round
  restore(round) {
    let roundNum = parseInt(round);
    if (isNaN(roundNum)) {
      this.rcon('Cannot parse round number!');
      return;
    }
    if (roundNum >= this.state.round || !this.state.live) {
      this.rcon("say That round has not been played yet!");
      return;
    }
    this.state.round = roundNum;
    if (roundNum < 10) roundNum = "0" + roundNum;
    this.rcon(Rcons.RESTORE_ROUND.format("backup_round" + roundNum + ".txt", round));
    const that = this;
    setTimeout(function() {
      that.rcon("say \x054...");
    }, 1000);
    setTimeout(function() {
      that.rcon("say \x063...");
    }, 2000);
    setTimeout(function() {
      that.rcon("say \x102...");
    }, 3000);
    setTimeout(function() {
      that.rcon("say \x0f1...");
    }, 4000);
    setTimeout(function() {
      that.rcon(Rcons.LIVE + ";mp_unpause_match");
    }, 5000);
  }

  // Start round
  round() {
    this.state.freeze = false;
    this.state.paused = false;
    this.rcon(Rcons.ROUND_STARTED);
    this.state.round++;
  }

  // Match end
  win() {
    const channels = this.cfg.nconf.get("irc:channels");
    for (const i in channels) {
      if (channels.hasOwnProperty(i)) {
        this.cfg.bot.ircClient.send(
          "NOTICE",
          this.cfg.nconf.get("irc:channels")[i],
          "Matsi päättyi! (" + this.state.stats + ")"
        );
      }
    }

    const message =
      this.state.stats +
      "\n" +
      this.state.maps
        .join(" ")
        .replace(this.state.map, "*" + this.state.map + "*")
        .replace(/de_/g, "") +
      "\n*Match ended*";
    this.cfg.bot.telegramBot.sendMessage(
      this.cfg.nconf.get("telegram:groupId"),
      "*Console@" + this.cfg.ip + ":" + this.cfg.port + "*\n" + message,
      {
        parse_mode: "Markdown"
      }
    );
  }

  // Pause match
  pause() {
    if (!this.state.live) return;
    const message = this.clantag("TERRORIST") + " - " + this.clantag("CT") + "\n*Match paused*";
    this.cfg.bot.telegramBot.sendMessage(
      this.cfg.nconf.get("telegram:groupId"),
      "*Console@" + this.cfg.ip + ":" + this.cfg.port + "*\n" + message,
      {
        parse_mode: "Markdown"
      }
    );
    this.rcon(Rcons.PAUSE_ENABLED);
    this.state.paused = true;
    this.state.unpause = {
      TERRORIST: false,
      CT: false
    };
    if (this.state.freeze) {
      this.rcon(Rcons.MATCH_PAUSED);
    }
  }

  // Get current map and players
  status() {
    const that = this;
    const conn = new rcon({
      host: that.cfg.ip,
      port: that.cfg.port,
      password: that.cfg.pass
    })
      .on("error", function(err) {
        console.error(err);
      })
      .exec("status", function(res) {
        // Get current map
        let re = named(/map\s+:\s+(:<map>.*?)\s/),
          match = re.exec(res.body);
        if (match !== null) {
          const map = match.capture("map");

          if (that.state.maps.indexOf(map) >= 0) {
            that.state.map = map;
          } else {
            that.state.maps = [map];
            that.state.map = map;
          }

          that.stats(false);
        }

        // ???
        const regex = new RegExp('"(:<user_name>.*?)" (:<steam_id>STEAM_.*?) .*?' + that.cfg.adminip + ":", "");
        re = named(regex);
        match = re.exec(res.body);
        if (match !== null) {
          for (const i in match.captures.steam_id) {
            if (
              match.captures.steam_id.hasOwnProperty(i) &&
              that.state.steamid.indexOf(Utils.id64(match.captures.steam_id[i])) === -1
            ) {
              that.state.steamid.push(Utils.id64(match.captures.steam_id[i]));
              that.state.admins.push(match.captures.user_name[i]);
            }
          }
        }
        conn.close();
      })
      .connect();
  }

  // Start match
  start(maps) {
    this.state.score = [];
    if (maps.length > 0) {
      this.state.maps = maps;
      if (this.state.map !== maps[0]) {
        this.rcon("changelevel " + this.state.maps[0]);
      } else {
        this.newmap(maps[0], 0);
      }
    } else {
      this.state.pool = this.cfg.nconf.get("pool").slice(0);
      this.state.banned = [];
      this.state.picked = [];
      this.state.banner = Utils.getRandom(["CT", "TERRORIST"]);
      this.chat(Rcons.VETO.format(this.clantag(this.state.banner), this.state.pool.join(", ")));
    }
  }

  // Pick map
  pick(map, team) {
    if (this.state.banner !== team) {
      this.chat(" \x10It's not your turn, " + this.clantag(team) + "!");
      return;
    }
    if (this.state.live) return;

    map = map.join(" ");
    let picked = "";

    if ([5, 4].includes(this.state.pool.length) && map.length > 2 && this.state.format === "bo3") {
      for (let i = 0; i < this.state.pool.length; i++) {
        if (this.state.pool[i].match(map)) {
          picked = this.state.pool.splice(i, 1);
          break;
        }
      }

      if (picked !== "") {
        this.state.picked.push(picked);
        let message = " \x10" + this.clantag(this.state.banner) + " picked " + picked + ". ";
        if (this.state.pool.length > 1) {
          if (this.state.banner === "CT") this.state.banner = "TERRORIST";
          else this.state.banner = "CT";
          const nextcmd = this.state.pool.length === 4 ? "pick" : "ban";
          message +=
            this.clantag(this.state.banner) +
            ", \x06!" +
            nextcmd +
            "\x10 the next map. (\x06" +
            this.state.pool.join(", ") +
            "\x10)";
        } else {
          this.state.picked.push(this.state.pool[0]);
          message += "Starting a BO3 match. (\x06" + this.state.picked.join(", ") + "\x10)";
          const vetomaps = [];
          for (let i = 0; i < this.state.picked.length; i++) {
            vetomaps.push("de_" + this.state.picked[i]);
          }
          const that = this;
          setTimeout(function() {
            that.start(vetomaps);
          }, 10000);
        }

        this.chat(message);
      }
    } else {
      this.chat(" \x10I don't undestand.");
    }
  }

  // Ban map
  ban(map, team) {
    if (this.state.banner !== team) {
      this.chat(" \x10It's not your turn, " + this.clantag(team) + "!");
      return;
    }
    if (this.state.live) return;
    map = map.join(" ");
    let banned = "";
    if (([7, 6, 3, 2].includes(this.state.pool.length) && map.length > 2) || this.state.format === "bo1") {
      for (let i = 0; i < this.state.pool.length; i++) {
        if (this.state.pool[i].match(map)) {
          banned = this.state.pool.splice(i, 1);
          break;
        }
      }

      if (banned !== "") {
        this.state.banned.push(banned);
        let message = " \x10" + this.clantag(this.state.banner) + " banned " + banned + ". ";

        if (this.state.pool.length > 1) {
          if (this.state.banner === "CT") this.state.banner = "TERRORIST";
          else this.state.banner = "CT";
          const nextcmd = [6, 2].includes(this.state.pool.length) || this.state.format === "bo1" ? "ban" : "pick";
          message +=
            this.clantag(this.state.banner) +
            ", \x06!" +
            nextcmd +
            "\x10 the next map. (\x06" +
            this.state.pool.join(", ") +
            "\x10)";
        } else {
          this.state.picked.push(this.state.pool[0]);
          message += "Starting a " + this.state.format + " match. (\x06" + this.state.picked.join(", ") + "\x10)";
          const vetomaps = [];
          for (let i = 0; i < this.state.picked.length; i++) {
            vetomaps.push("de_" + this.state.picked[i]);
          }

          const that = this;
          setTimeout(function() {
            that.start(vetomaps);
          }, 10000);
        }

        this.chat(message);
      }
    } else {
      this.chat(" \x10I don't undestand.");
    }
  }

  matchformat(newFormat) {
    if (newFormat === undefined) {
      this.rcon("say \x10Current format is: " + this.state.format);
      return;
    }
    if (newFormat === "bo1" || newFormat === "bo3") {
      this.state.format = newFormat;
      this.chat("\x10Format changed.");
    } else {
      this.chat("\x10Wrong format!");
    }
  }

  // Set team to be ready
  ready(team) {
    if (this.state.live && this.state.paused) {
      if (team === true) {
        this.state.unpause.TERRORIST = true;
        this.state.unpause.CT = true;
      } else {
        this.state.unpause[team] = true;
      }

      if (this.state.unpause.TERRORIST !== this.state.unpause.CT) {
        this.rcon(
          Rcons.READY.format(
            this.state.ready.TERRORIST ? Rcons.T : Rcons.CT,
            this.state.ready.TERRORIST ? Rcons.CT : Rcons.T
          )
        );
      } else if (this.state.unpause.TERRORIST === true && this.state.unpause.CT === true) {
        this.rcon(Rcons.MATCH_UNPAUSE);
        this.state.paused = false;
        this.state.unpause = {
          TERRORIST: false,
          CT: false
        };
      }
    } else if (!this.state.live) {
      if (team === true) {
        this.state.ready.TERRORIST = true;
        this.state.ready.CT = true;
      } else {
        this.state.ready[team] = true;
      }

      if (this.state.ready.TERRORIST !== this.state.ready.CT) {
        this.rcon(
          Rcons.READY.format(
            this.state.ready.TERRORIST ? Rcons.T : Rcons.CT,
            this.state.ready.TERRORIST ? Rcons.CT : Rcons.T
          )
        );
      } else if (this.state.ready.TERRORIST === true && this.state.ready.CT === true) {
        this.state.live = true;
        this.state.round = 0;
        const demo =
          "matches/" +
          new Date()
            .toISOString()
            .replace(/T/, "_")
            .replace(/:/g, "-")
            .replace(/\..+/, "") +
          "_" +
          this.state.map +
          "_" +
          Utils.cleandemo(this.clantag("TERRORIST")) +
          "-" +
          Utils.cleandemo(this.clantag("CT")) +
          ".dem";
        const that = this;
        if (this.state.knife) {
          this.rcon(Rcons.KNIFE_STARTING.format(demo));
          setTimeout(function() {
            that.rcon(Rcons.KNIFE_STARTED);
          }, 9000);
        } else {
          this.rcon(Rcons.MATCH_STARTING.format(demo));
          setTimeout(function() {
            that.rcon(Rcons.MATCH_STARTED);
          }, 9000);
        }
        const message =
          this.stats(false) +
          "\n" +
          this.state.maps
            .join(" ")
            .replace(this.state.map, "*" + this.state.map + "*")
            .replace(/de_/g, "") +
          "\n*Match started*";
        this.cfg.bot.telegramBot.sendMessage(
          this.cfg.nconf.get("telegram:groupId"),
          "*Console@" + this.cfg.ip + ":" + this.cfg.port + "*\n" + message,
          {
            parse_mode: "Markdown"
          }
        );
        const gotv = this.cfg.nconf.get("gotv");
        if (gotv[this.cfg.ip][this.cfg.port] !== undefined && Object.keys(this.state.players).length >= 5) {
          const teams = this.clantag("TERRORIST") + " - " + this.clantag("CT");
          const channels = this.cfg.nconf.get("irc:channels");
          for (const i in channels) {
            if (channels.hasOwnProperty(i)) {
              this.cfg.bot.ircClient.send(
                "NOTICE",
                this.cfg.nconf.get("irc:channels")[i],
                "Matsi alkaa! (" + teams + ") GOTV osoitteessa " + gotv[this.cfg.ip][this.cfg.port]
              );
            }
          }
        }
        setTimeout(function() {
          that.chat(" \x054...");
        }, 1000);
        setTimeout(function() {
          that.chat(" \x063...");
        }, 2000);
        setTimeout(function() {
          that.chat(" \x102...");
        }, 3000);
        setTimeout(function() {
          that.chat(" \x0f1...");
        }, 4000);
        setTimeout(function() {
          that.rcon(Rcons.LIVE);
          that.rcon('script ScriptPrintMessageCenterAll("Match is LIVE! GL HF!")');
        }, 5000);
      }
    }
  }

  // Change map
  newmap(map, delay) {
    if (delay === undefined) delay = 10000;

    let index = -1;
    if (this.state.maps.indexOf(map) >= 0) {
      index = this.state.maps.indexOf(map);
      this.state.map = map;
    } else {
      this.state.maps = [map];
      this.state.map = map;
    }

    const that = this;
    setTimeout(function() {
      if (index >= 0 && that.state.maps[index + 1] !== undefined) {
        that.rcon("nextlevel " + that.state.maps[index + 1]);
      } else {
        that.rcon('nextlevel ""');
      }
      that.stats(false);
      that.warmup();
      if (index === 2) that.knife = true;
    }, delay);
  }

  // Start knife round
  knife() {
    if (this.state.live) return;
    if (!this.state.knife) {
      this.state.knife = true;
      this.rcon(Rcons.WARMUP_KNIFE);
    } else {
      this.state.knife = false;
      this.rcon(Rcons.KNIFE_DISABLED);
    }
  }

  // ???
  score(score) {
    const tagscore = {};
    tagscore[this.clantag("CT")] = score.CT;
    tagscore[this.clantag("TERRORIST")] = score.TERRORIST;
    this.state.score[this.state.map] = tagscore;
    this.stats(false);

    if (score.TERRORIST + score.CT === 1 && this.state.knife) {
      this.state.knifewinner = score.TERRORIST === 1 ? "TERRORIST" : "CT";
      this.state.knife = false;
      this.rcon(Rcons.KNIFE_WON.format(this.state.knifewinner === "TERRORIST" ? Rcons.T : Rcons.CT));
    } else if (this.state.paused) {
      this.rcon(Rcons.MATCH_PAUSED);
    }
    this.state.freeze = true;
  }

  // Use current teams
  stay(team) {
    if (team === this.state.knifewinner) {
      this.state.round = 0;
      this.rcon(Rcons.KNIFE_STAY);
      this.state.knifewinner = false;
    }
  }

  // Swap current tems
  swap(team) {
    if (team === this.state.knifewinner) {
      this.state.round = 0;
      this.rcon(Rcons.KNIFE_SWAP);
      this.state.knifewinner = false;
    }
  }

  // Makes bot leave from server
  quit() {
    this.rcon("logaddress_delall;log off;say \x10I'm outta here!");
  }

  // Print server state
  debug() {
    this.rcon(
      "say \x10round: " +
        this.state.round +
        ", live: " +
        this.state.live +
        ", paused: " +
        this.state.paused +
        ", freeze: " +
        this.state.freeze +
        ", knife: " +
        this.state.knife +
        ", knifewinner: " +
        this.state.knifewinner +
        ", ready: T:" +
        this.state.ready.TERRORIST +
        ", CT:" +
        this.state.ready.CT +
        ", unpause: T:" +
        this.state.unpause.TERRORIST +
        ", CT:" +
        this.state.unpause.CT +
        ", pool: " +
        this.state.pool.join(",") +
        ", format: " +
        this.state.format
    );
    this.stats(true);
  }

  say(msg) {
    this.rcon("say " + Utils.cleansay(msg));
  }

  chat(msg) {
    this.rcon('script ScriptPrintMessageChatAll("' + Utils.cleansay(msg) + '")');
  }

  center(msg) {
    this.rcon('script ScriptPrintMessageCenterAll("' + Utils.cleansay(msg) + '")');
  }

  warmup() {
    this.state.ready = {
      TERRORIST: false,
      CT: false
    };
    this.state.unpause = {
      TERRORIST: false,
      CT: false
    };
    this.state.live = false;
    this.state.paused = false;
    this.state.freeze = false;
    this.state.knifewinner = false;
    this.state.knife = true;
    this.state.pool = [];
    this.state.banner = "";
    this.state.round = 0;
    this.rcon(Rcons.CONFIG);
  }
};
