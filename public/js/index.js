function convertStringToArray(str, maxPartSize){

  const chunkArr = [];
  let leftStr = str;
  do {

    chunkArr.push(leftStr.substring(0, maxPartSize));
    leftStr = leftStr.substring(maxPartSize, leftStr.length);

  } while (leftStr.length > 0);

  return chunkArr;
};
