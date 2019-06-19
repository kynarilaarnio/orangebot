const SteamID = require("steamid");

function id64(steamid) {
  return new SteamID(String(steamid)).getSteamID64();
}

function clean(str) {
  return str.replace(/[^A-Za-z0-9: \-_,]/g, "");
}

function cleandemo(str) {
  return str.replace(/[^A-Za-z0-9\-_]/g, "");
}

function cleansay(str) {
  return str
    .replace("ä", "a")
    .replace("ö", "o")
    .replace(/[^A-Za-z0-9\(\)\[\]:<>.?! \-_,\x06\x10\x05\x0e\x0f\x08]/g, "");
}

function shuffle(array) {
  let m = array.length,
    t,
    i;

  // While there remain elements to shuffle
  while (m) {
    // Pick a remaining element
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

function getRandom(arr) {
  const newArr = arr.slice(0);
  shuffle(newArr);
  return newArr[0];
}

function whitelisted(steamid, whitelist) {
  for (const i in whitelist) {
    if (whitelist.hasOwnProperty(i) && id64(whitelist[i]) === id64(steamid)) {
      return true;
    }
  }
  return false;
}

String.prototype.format = function() {
  let formatted = this;
  for (let i = 0; i < arguments.length; i++) {
    const regexp = new RegExp("\\{" + i + "\\}", "gi");
    formatted = formatted.replace(regexp, arguments[i]);
  }
  return formatted;
};

module.exports = {
  id64: id64,
  clean: clean,
  cleandemo: cleandemo,
  cleansay: cleansay,
  getRandom: getRandom,
  whitelisted: whitelisted
};
