function convertStringToArray(str, maxPartSize){

  const chunkArr = [];
  let leftStr = str;
  do {

    chunkArr.push(leftStr.substring(0, maxPartSize));
    leftStr = leftStr.substring(maxPartSize, leftStr.length);

  } while (leftStr.length > 0);

  return chunkArr;
};

function safeEncode(str) {
    return btoa(encodeURI(str));
}

function safeDecode(str, toText) {
    var res;
    if (toText) {
        ok = false;
        do {
            try {
                res = atob(str);
                ok = true;
            } catch (e) {
                str = str.substring(0, str.length - 1);
            }
        } while (!ok && str.length);
        console.log("OK!!! %s");
    } else {
        try {
            res = atob(str);
        } catch (e) {
            res = str;
        }
    }
    try {
        res = decodeURI(res);
    } catch (e) {}
    if (toText) {
        res = res.replace(/<[^>]*>/g, '');
    }
    return res;
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
