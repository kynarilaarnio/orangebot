const
	WARMUP = 'script ScriptPrintMessageChatAll(" \x10Ready to play? Start a \x06map veto\x10 with \x06!start\x10 or start a \x06live\x10 match in current map with \x06!ready\x10.");script ScriptPrintMessageChatAll(" \x0eYou can restart a veto if you fuck up, but you can\'t reset a match without an !admin.")',
	WARMUP_KNIFE = WARMUP,
	KNIFE_DISABLED = 'script ScriptPrintMessageChatAll(" \x10Cancelled knife round.")',
	KNIFE_STARTING = 'mp_unpause_match;mp_warmup_pausetimer 0;mp_warmuptime 6;mp_warmup_start;mp_maxmoney 0;mp_t_default_secondary "";mp_ct_default_secondary "";mp_free_armor 1;mp_give_player_c4 0;log on;tv_stoprecord;tv_record "{0}";script ScriptPrintMessageChatAll(" \x10Both teams are \x06!ready\x10, starting knife round in:");script ScriptPrintMessageChatAll(" \x085...")',
	KNIFE_STARTED = 'script ScriptPrintMessageChatAll(" \x10Knife round started! GL HF!")',
	KNIFE_WON = 'mp_pause_match;mp_maxmoney 16000;mp_t_default_secondary "weapon_glock";mp_ct_default_secondary "weapon_hkp2000";mp_free_armor 0;mp_give_player_c4 1;script ScriptPrintMessageChatAll(" \x06{0} \x10won the knife round!");script ScriptPrintMessageChatAll(" \x10Do you want to \x06!stay\x10 or \x06!swap\x10?")',
	KNIFE_STAY = 'mp_unpause_match;mp_restartgame 1;script ScriptPrintMessageChatAll(" \x10Match started! GL HF!")',
	KNIFE_SWAP = 'mp_unpause_match;mp_swapteams;script ScriptPrintMessageChatAll(" \x10Match started! GL HF!")',
	PAUSE_ENABLED = 'mp_pause_match;script ScriptPrintMessageChatAll(" \x10Pausing match on freeze time!")',
	MATCH_STARTING = 'mp_maxmoney 16000;mp_unpause_match;mp_warmup_pausetimer 0;mp_warmuptime 6;mp_warmup_start;log on;tv_stoprecord;tv_record "{0}";script ScriptPrintMessageChatAll(" \x10Both teams are \x06!ready\x10, starting match in:");script ScriptPrintMessageChatAll(" \x085...")',
	MATCH_STARTED = 'script ScriptPrintMessageChatAll(" \x10Match started! GL HF!")',
	MATCH_PAUSED = 'mp_respawn_on_death_t 1;mp_respawn_on_death_ct 1;script ScriptPrintMessageChatAll(" \x10Match will resume when both teams are \x06!ready\x10.")',
	MATCH_UNPAUSE = 'mp_respawn_on_death_t 0;mp_respawn_on_death_ct 0;mp_unpause_match;script ScriptPrintMessageChatAll(" \x10Both teams are \x06!ready\x10, resuming match!")',
	ROUND_STARTED = 'mp_respawn_on_death_t 0;mp_respawn_on_death_ct 0',
	READY = 'script ScriptPrintMessageChatAll(" \x10{0} are \x06!ready\x10, waiting for {1}.")',
	LIVE = 'script ScriptPrintMessageChatAll(" \x03LIVE!");script ScriptPrintMessageChatAll(" \x0eLIVE!");script ScriptPrintMessageChatAll(" \x02LIVE!")',
	VETO = ' \x10Starting map veto. All picks are final! {0}, \x06!ban\x10 the first map. (\x06{1}\x10)',
	T = 'Terrorists',
	CT = 'Counter-Terrorists',
    CONFIG = 'game_type 0;game_mode 1;ammo_grenade_limit_default 1;ammo_grenade_limit_flashbang 2;ammo_grenade_limit_total 4;bot_quota 0;cash_player_bomb_defused 300;cash_player_bomb_planted 300;cash_player_damage_hostage -30;cash_player_interact_with_hostage 150;cash_player_killed_enemy_default 300;cash_player_killed_enemy_factor 1;cash_player_killed_hostage -1000;cash_player_killed_teammate -300;cash_player_rescued_hostage 1000;cash_team_elimination_bomb_map 3250;cash_team_hostage_alive 150;cash_team_hostage_interaction 150;cash_team_loser_bonus 1400;cash_team_loser_bonus_consecutive_rounds 500;cash_team_planted_bomb_but_defused 800;cash_team_rescued_hostage 750;cash_team_terrorist_win_bomb 3500;cash_team_win_by_defusing_bomb 3500;cash_team_win_by_hostage_rescue 3500;cash_player_get_killed 0;cash_player_respawn_amount 0;cash_team_elimination_hostage_map_ct 2000;cash_team_elimination_hostage_map_t 1000;cash_team_win_by_time_running_out_bomb 3250;cash_team_win_by_time_running_out_hostage 3250;ff_damage_reduction_grenade 0.85;ff_damage_reduction_bullets 0.33;ff_damage_reduction_other 0.4;ff_damage_reduction_grenade_self 1;mp_afterroundmoney 0;mp_autokick 0;mp_autoteambalance 0;mp_buytime 15;mp_c4timer 40;mp_death_drop_defuser 1;mp_death_drop_grenade 2;mp_death_drop_gun 1;mp_defuser_allocation 0;mp_do_warmup_period 1;mp_forcecamera 1;mp_force_pick_time 160;mp_free_armor 0;mp_freezetime 12;mp_friendlyfire 1;mp_halftime 1;mp_halftime_duration 15;mp_join_grace_time 30;mp_limitteams 0;mp_logdetail 3;mp_match_can_clinch 1;mp_match_end_changelevel 1;mp_match_end_restart 0;mp_match_restart_delay 120;mp_maxmoney 65535;mp_maxrounds 30;mp_molotovusedelay 0;mp_overtime_enable 1;mp_overtime_maxrounds 6;mp_overtime_startmoney 10000;mp_playercashawards 1;mp_playerid 0;mp_playerid_delay 0.5;mp_playerid_hold 0.25;mp_round_restart_delay 5;mp_roundtime 1.92;mp_roundtime_defuse 1.92;mp_solid_teammates 1;mp_startmoney 800;mp_teamcashawards 1;mp_teammatchstat_holdtime 0;mp_teammatchstat_txt "";mp_timelimit 0;mp_tkpunish 0;mp_weapons_allow_map_placed 1;mp_weapons_allow_zeus 1;mp_win_panel_display_time 15;spec_freeze_time 2.0;spec_freeze_panel_extended_time 0;spec_freeze_time_lock 2;spec_freeze_deathanim_time 0;sv_accelerate 5.5;sv_stopspeed 80;sv_allow_votes 0;sv_allow_wait_command 0;sv_alltalk 0;sv_alternateticks 0;sv_auto_full_alltalk_during_warmup_half_end 0;sv_cheats 0;sv_clockcorrection_msecs 15;sv_consistency 0;sv_contact 0;sv_damage_print_enable 0;sv_dc_friends_reqd 0;sv_deadtalk 0;sv_forcepreload 0;sv_friction 5.2;sv_full_alltalk 0;sv_gameinstructor_disable 1;sv_ignoregrenaderadio 0;sv_kick_players_with_cooldown 0;sv_kick_ban_duration 0;sv_lan 0;sv_log_onefile 0;sv_logbans 1;sv_logecho 0;sv_logfile 1;sv_logflush 0;sv_logsdir matches;sv_maxrate 0;sv_mincmdrate 30;sv_minrate 20000;sv_competitive_minspec 1;sv_competitive_official_5v5 1;sv_pausable 1;sv_pure 1;sv_pure_kick_clients 1;sv_pure_trace 0;sv_spawn_afk_bomb_drop_time 30;sv_steamgroup_exclusive 0;mp_respawn_on_death_t 0;mp_respawn_on_death_ct 0;mp_unpause_match;sv_vote_allow_in_warmup 1;sv_vote_allow_spectators 1;sv_vote_command_delay 2;sv_vote_count_spectator_votes 0;sv_vote_creation_timer 1;sv_vote_disallow_kick_on_match_point 1;sv_vote_failure_timer 1;sv_vote_issue_kick_allowed 0;sv_vote_issue_loadbackup_allowed 1;sv_vote_issue_restart_game_allowed 1;sv_vote_kick_ban_duration 0;sv_vote_quorum_ratio 0.7;sv_vote_timer_duration 30;sv_vote_to_changelevel_before_match_point 0;mp_warmuptime 15;mp_warmup_start;mp_warmup_pausetimer 1;mp_backup_round_file_pattern "%prefix%_round%round%.txt";mp_backup_round_file "backup";say \x10Match will start when both teams are \x06!ready\x10',
    GOTV_OVERLAY = 'mp_teammatchstat_txt "Match {0} of {1}"; mp_teammatchstat_1 "{2}"; mp_teammatchstat_2 "{3}"',
	RESTORE_ROUND = 'mp_backup_restore_load_file "{0}";say \x10Round \x06{1}\x10 has been restored, resuming match in:;say \x085...';

// require dependencies
const
    nconf = require('nconf'),
    fs = require('fs'),
    irc = require('irc'),
    named = require('named-regexp').named,
    dns = require('dns'),
    dgram = require('dgram'),
    request = require('request'),
    udpServer = dgram.createSocket('udp4'),
    SteamID = require('steamid'),
    TelegramBot = require('node-telegram-bot-api');

// Require bot modules
const
	Server = require('./server.js'),
	Player = require('./player.js');

(function loadConfigs() {
    const
        confPath = './config.json',
        defaults = require('./default-config.json');

	// Create configs from defaults if not exists
    if (!fs.existsSync(confPath)) {
        fs.writeFileSync(confPath, JSON.stringify(defaults, null, 2));
    }

    nconf.file({
        file: confPath
    });
})();

// Read configs
if(nconf.get('ip') === '') nconf.set('ip', require('ip').address());
const
	admins = nconf.get('admins'),
    statics = nconf.get('statics'),
    rconPass = nconf.get('rconPass'),
    whitelist = nconf.get('whitelist'),
    pool = nconf.get('pool'),
    gotv = nconf.get('gotv'),
	telegram = nconf.get('telegram');

// Storing the bot state
const bot = {
    admins64: [],
    servers: {}
};

let ircClient;
if (nconf.get('irc') !== null) {
	ircClient = new irc.Client(nconf.get('irc:server'), nconf.get('irc:nick'), {
        channels: nconf.get('irc:channels'),
        realName: nconf.get('irc:realname'),
        autoRejoin: true
    });
}

let telegramBot;
if (telegram.token.length) {
	telegramBot = new TelegramBot(telegram.token, {
        polling: true
    });
}

// Duplicate
function clean(str) {
    return str.replace(/[^A-Za-z0-9: \-_,]/g, '');
}

function addServer(host, port, pass) {
    dns.lookup(host, 4, function (err, ip) {
        bot.servers[ip + ':' + port] = new Server({
            address: ip + ':' + port,
            pass: pass,
            nconf: nconf,
			bot: bot
        });
    });
}

function whitelisted(steamid) {
	for (const i in whitelist) {
		if (whitelist.hasOwnProperty(i) && id64(whitelist[i]) === id64(steamid)) {
			return true;
		}
	}
	return false;
}

function id64(steamid) {
	return (new SteamID(String(steamid))).getSteamID64();
}

for (const i in admins) {
	bot.admins64.push(id64(admins[i]));
}

String.prototype.format = function () {
	let formatted = this;
	for (let i = 0; i < arguments.length; i++) {
		const regexp = new RegExp('\\{' + i + '\\}', 'gi');
		formatted = formatted.replace(regexp, arguments[i]);
	}
	return formatted;
};

if(telegramBot) {
    telegramBot.on('message', function (msg) {
        if (!msg.text) return;

        // Only listen set group chat
        if (msg.chat.id !== telegram.groupId) return;

        const name = msg.from.username || msg.from.first_name;
        const message = msg.text;

        // Message have to be reply
        if (msg.reply_to_message) {
            const re = named(/@(:<addr>\d+\.\d+\.\d+\.\d+:\d+)/m);
            const match = re.exec(msg.reply_to_message.text);
            if (match !== null) {
                const addr = match.capture('addr');
                if (message.match(/^!/)) {
                    bot.servers[addr].say(message);
                } else {
                    bot.servers[addr].chat(' \x06Admin: \x10' + message);
                    bot.servers[addr].center('Admin: ' + message);
                }
            }
        }
    });
}

udpServer.on('message', function (msg, info) {
	const
		addr = info.address + ':' + info.port,
		text = msg.toString();

	console.log(clean(text));

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
		if (match.capture('steam_id') !== 'BOT') {
			// Get player Steam ID
			const
				conName = match.capture('user_name'),
				conId = match.capture('steam_id'),
				conId64 = id64(conId);

			// Check if connecting user is a player
			request('http://akl.tite.fi/akl-service/api/users/communityid/' + conId64, function (error, response, body) {
				if (error) {
					bot.servers[addr].chat(' \x10Letting ' + conName + ' connect because AKL API is not responding.');
					return;
				}

				if (response.statusCode === 200) {
					bot.servers[addr].chat(' \x10' + conName + ' (connecting) is a registered user.');
				} else if (whitelisted(conId)) {
					bot.servers[addr].chat(' \x10' + conName + ' (connecting) is whitelisted.');
				} else {
					bot.servers[addr].chat(' \x10' + conName + ' tried to connect, but is not registered.');
					bot.servers[addr].rcon('kickid ' + conId + ' This account is not registered on akl.tite.fi');
				}

				if (body.match(/(ROLE_ADMIN|ROLE_REFEREE)/gm) && bot.admins64.indexOf(conId64) < 0) {
					bot.admins64.push(conId64);
				}
			});
		}
	}

	// Join to a team
	re = named(/"(:<user_name>.+)[<](:<user_id>\d+)[>][<](:<steam_id>.*)[>]" switched from team [<](:<user_team>CT|TERRORIST|Unassigned|Spectator)[>] to [<](:<new_team>CT|TERRORIST|Unassigned|Spectator)[>]/);
	match = re.exec(text);
	if (match !== null) {
		if (bot.servers[addr].state.players[match.capture('steam_id')] === undefined) {
			if (match.capture('steam_id') !== 'BOT') {
				bot.servers[addr].state.players[match.capture('steam_id')] = new Player(match.capture('steam_id'), match.capture('new_team'), match.capture('user_name'), undefined);
			}
		} else {
			bot.servers[addr].state.players[match.capture('steam_id')].steamid = match.capture('steam_id');
			bot.servers[addr].state.players[match.capture('steam_id')].team = match.capture('new_team');
			bot.servers[addr].state.players[match.capture('steam_id')].name = match.capture('user_name');
		}
		bot.servers[addr].lastlog = new Date().getTime();
	}

	// Clantag
	re = named(/"(:<user_name>.+)[<](:<user_id>\d+)[>][<](:<steam_id>.*?)[>][<](:<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" triggered "clantag" \(value "(:<clan_tag>.*)"\)/);
	match = re.exec(text);
	if (match !== null) {
		if (bot.servers[addr].state.players[match.capture('steam_id')] === undefined) {
			if (match.capture('steam_id') !== 'BOT') {
				bot.servers[addr].state.players[match.capture('steam_id')] = new Player(match.capture('steam_id'), match.capture('user_team'), match.capture('user_name'), match.capture('clan_tag'));
			}
		} else {
			bot.servers[addr].state.players[match.capture('steam_id')].clantag = match.capture('clan_tag') !== '' ? match.capture('clan_tag') : undefined;
		}
		bot.servers[addr].lastlog = new Date().getTime();
	}

	// Disconnect
	re = named(/"(:<user_name>.+)[<](:<user_id>\d+)[>][<](:<steam_id>.*)[>][<](:<user_team>CT|TERRORIST|Unassigned|Spectator)[>]" disconnected/);
	match = re.exec(text);
	if (match !== null) {
		if (bot.servers[addr].state.players[match.capture('steam_id')] !== undefined) {
			delete bot.servers[addr].state.players[match.capture('steam_id')];
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
		if (bot.servers[addr].state.round > 14) {
			bot.servers[addr].win();
		}
		bot.servers[addr].lastlog = new Date().getTime();
	}

	// Map started
	re = named(/Started map "(:<map>.*?)"/);
	match = re.exec(text);
	if (match !== null) {
		bot.servers[addr].newmap(match.capture('map'));
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
	re = named(/Team "(:<team>.*)" triggered "SFUI_Notice_(:<team_win>Terrorists_Win|CTs_Win|Target_Bombed|Target_Saved|Bomb_Defused)" \(CT "(:<ct_score>\d+)"\) \(T "(:<t_score>\d+)"\)/);
	match = re.exec(text);
	if (match !== null) {
		const score = {
			'TERRORIST': parseInt(match.capture('t_score')),
			'CT': parseInt(match.capture('ct_score'))
		};
		bot.servers[addr].score(score);
		bot.servers[addr].lastlog = new Date().getTime();
	}

	// !command
	re = named(/"(:<user_name>.+)[<](:<user_id>\d+)[>][<](:<steam_id>.*)[>][<](:<user_team>CT|TERRORIST|Unassigned|Spectator|Console)[>]" say(:<say_team>_team)? "[!\.](:<text>.*)"/);
	match = re.exec(text);
	if (match !== null) {
		const isadmin = match.capture('user_id') === '0' || bot.servers[addr].admin(match.capture('steam_id'));
		param = match.capture('text').split(' ');
		cmd = param[0];
		param.shift();
		switch (String(cmd)) {
			case 'admin':
				const message = param.join(' ').replace('!admin ', '');
				if (telegramBot) {
                    telegramBot.sendMessage(telegram.groupId, '*' + match.capture('user_name') + '@' + addr + "*\n" + message + "\n*Admin called*", {
                        parse_mode: 'Markdown'
                    });
				} else {
                    bot.servers[addr].chat(' \x05Telegram bot is not set.');
				}
				break;
            case 'restore':
			case 'replay':
                if (isadmin) bot.servers[addr].restore(param);
                break;
			case 'status':
			case 'stats':
			case 'score':
			case 'scores':
				bot.servers[addr].stats(true);
				break;
			case 'restart':
			case 'reset':
			case 'warmup':
				if (isadmin) bot.servers[addr].warmup();
				break;
			case 'maps':
			case 'map':
			case 'start':
			case 'match':
			case 'startmatch':
				if (isadmin || !bot.servers[addr].get().live) {
					bot.servers[addr].start(param);
				}
				break;
			case 'force':
				if (isadmin) bot.servers[addr].ready(true);
				break;
			case 'resume':
			case 'ready':
			case 'rdy':
			case 'unpause':
				bot.servers[addr].ready(match.capture('user_team'));
				break;
			case 'pause':
				bot.servers[addr].pause();
				break;
			case 'stay':
				bot.servers[addr].stay(match.capture('user_team'));
				break;
			case 'swap':
			case 'switch':
				bot.servers[addr].swap(match.capture('user_team'));
				break;
			case 'knife':
				bot.servers[addr].knife();
				break;
			case 'disconnect':
			case 'quit':
			case 'leave':
				if (isadmin) {
					bot.servers[addr].quit();
					delete bot.servers[addr];
					console.log('Disconnected from ' + addr);
				}
				break;
			case 'say':
				if (isadmin) {
					bot.servers[addr].chat(' \x06Admin: \x10' + param.join(' '));
					bot.servers[addr].center('Admin: ' + param.join(' '));
				}
				break;
			case 'whitelist':
				if (isadmin) whitelist.push(param.join(' '));
				break;
			case 'debug':
				bot.servers[addr].debug();
				break;
			case 'ban':
				bot.servers[addr].ban(param, match.capture('user_team'));
				break;
			case 'pick':
				bot.servers[addr].pick(param, match.capture('user_team'));
				break;
			default:
				break;
		}

		bot.servers[addr].lastlog = new Date().getTime();
	}
});

setInterval(function () {
	for (const i in bot.servers) {
		if (!bot.servers.hasOwnProperty(i)) return;

		const now = new Date().getTime();
		if (bot.servers[i].lastlog < now - 1000 * 60 * 10 && bot.servers[i].state.players.length < 3) {
			console.log('Dropping idle server ' + i);
			delete bot.servers[i];
			continue;
		}

		if (!bot.servers[i].state.live && bot.servers[i].state.pool.length === 0) {
			if (bot.servers[i].state.knife) {
				bot.servers[i].rcon(WARMUP_KNIFE);
			} else {
				bot.servers[i].rcon(WARMUP);
			}
		} else if (bot.servers[i].state.paused && bot.servers[i].state.freeze) {
			bot.servers[i].rcon(MATCH_PAUSED);
		}
	}
}, 15000);

setInterval(function () {
	for (const  i in bot.servers) {
		if (!bot.servers.hasOwnProperty(i)) return;
		if (!bot.servers[i].state.live && bot.servers[i].state.pool.length > 0) {
			bot.servers[i].rcon('tv_msg Ban: ' + bot.servers[i].state.banned.join(', ') + '                                                                                                        Left: ' + bot.servers[i].state.pool.join(', '));
		}
	}
}, 2000);

setInterval(function () {
	for (const i in bot.servers) {
		if (bot.servers.hasOwnProperty(i) && bot.servers[i].state.queue.length > 0) {
			const cmd = bot.servers[i].state.queue.shift();
			bot.servers[i].realrcon(cmd);
		}
	}
}, 100);

for (const i in statics) {
    if (statics.hasOwnProperty(i)) {
        addServer(statics[i].host, statics[i].port, statics[i].pass);
    }
}

// Bind UDP server
udpServer.bind(nconf.get('port'));

process.on('uncaughtException', function (err) {
	console.log(err);
});

console.log('OrangeBot listening on ' + nconf.get('port'));
console.log('Run this in CS console to connect or configure orangebot.js:');
console.log('connect YOUR_SERVER;password YOUR_PASS;rcon_password YOUR_RCON;rcon sv_rcon_whitelist_address ' + nconf.get('ip') + ';rcon logaddress_add ' + nconf.get('ip') + ':' + nconf.get('port') + ';rcon log on;rcon rcon_password YOUR_RCON');
