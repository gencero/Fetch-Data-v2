function idexNameFormat(str) {
  var n = str.indexOf("-");
  var str2 = str.substr(0, n);
  var str = str2 + "ETH";

  return str;
}

function bittrexNameFormat(str) {
  var n = str.indexOf("-");
  var str2 = str.substr(n + 1);
  var str = str2 + "ETH";

  return str;
}

function kucoinNameFormat(str) {
  var n = str.indexOf("-");
  var str2 = str.substr(0, n);
  var str = str2 + "ETH";

  return str;
}

function poloNameFormat(str) {
  var n = str.indexOf("_");
  var str2 = str.substr(n + 1);
  var str = str2 + "ETH";

  return str;
}

function ftxNameFormat(str) {
  var n = str.indexOf("/");
  var str2 = str.substr(0, n);
  var str = str2 + "ETH";

  return str;
}

module.exports = {idexNameFormat, bittrexNameFormat, kucoinNameFormat, poloNameFormat, ftxNameFormat};
