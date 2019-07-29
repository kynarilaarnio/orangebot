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
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
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
