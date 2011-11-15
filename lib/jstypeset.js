var CharAndSpringList, JSType;
CharAndSpringList = (function() {
  function CharAndSpringList(fontSize) {
    this.fontSize = fontSize;
    this.chars = [];
    this.springPlus = 0;
    this.springMinus = 0;
    this.charsLength = 0;
    this.charsAndSprings = [];
  }
  CharAndSpringList.prototype.push = function(char) {
    this.charsAndSprings.push(char);
    switch (char.type) {
      case 'spring':
        this.springPlus += Math.abs(char.plus);
        return this.springMinus -= Math.abs(char.minus);
      case 'word_propotional':
        this.chars.push(char);
        return this.charsLength += char.width;
      default:
        this.chars.push(char);
        return this.charsLength += this.fontSize;
    }
  };
  CharAndSpringList.prototype.maxLength = function() {
    return this.charsLength + this.springPlus;
  };
  CharAndSpringList.prototype.minLength = function() {
    return this.charsLength + this.springMinus;
  };
  CharAndSpringList.prototype.stretchRatio = function(rowSize) {
    return (rowSize - this.charsLength) / (this.charsLength < rowSize ? this.springPlus : this.springMinus);
  };
  CharAndSpringList.prototype.makeFuncStretchedWidthOfSpring = function(rowSize) {
    var sign, stretchRatio;
    stretchRatio = this.stretchRatio(rowSize);
    sign = rowSize - this.charsLength;
    return function(spring) {
      return stretchRatio * (sign > 0 ? spring.plus : -spring.minus);
    };
  };
  CharAndSpringList.prototype.clone = function() {
    var c;
    c = new CharAndSpringList(this.fontSize);
    c.chars = this.chars.slice();
    c.springPlus = this.springPlus;
    c.springMinus = this.springMinus;
    c.charsLength = this.charsLength;
    c.charsAndSprings = this.charsAndSprings.slice();
    return c;
  };
  return CharAndSpringList;
})();
/*
char: 1トークン，一文字とは限らない
text: 一連の文字や文字的なものの並び，StringではなくArray
*/
JSType = (function() {
  function JSType(canvasContext) {
    this.canvasContext = canvasContext;
  }
  JSType.prototype.drawChars = function(chars, offsetX, offsetY) {
    var c, _i, _len, _results;
    if (offsetX == null) {
      offsetX = 0;
    }
    if (offsetY == null) {
      offsetY = 0;
    }
    _results = [];
    for (_i = 0, _len = chars.length; _i < _len; _i++) {
      c = chars[_i];
      _results.push(this.canvasContext.fillText(c.char, c.x + offsetX, c.y + offsetY));
    }
    return _results;
  };
  JSType.prototype.stringToChars = function(string) {
    var chars, m, stringToArray;
    stringToArray = function(string) {
      var c, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = string.length; _i < _len; _i++) {
        c = string[_i];
        _results.push(c);
      }
      return _results;
    };
    chars = [];
    while (true) {
      if (m = string.match(/[a-zA-Z]+/)) {
        if (m.index !== 0) {
          chars = chars.concat(stringToArray(string.slice(0, m.index)));
        }
        chars.push(this.wordToChar(m[0]));
        string = string.slice(m.index + m[0].length);
      } else {
        chars = chars.concat(stringToArray(string));
        break;
      }
    }
    return chars;
  };
  JSType.prototype.wordToChar = function(word) {
    return {
      char: word,
      type: 'word_propotional',
      width: this.canvasContext.measureText(word).width
    };
  };
  JSType.prototype.insertSprings = function(chars, plus, minus) {
    var c, result, _i, _len;
    if (plus == null) {
      plus = 5;
    }
    if (minus == null) {
      minus = 5;
    }
    result = [];
    for (_i = 0, _len = chars.length; _i < _len; _i++) {
      c = chars[_i];
      result.push(c);
      result.push({
        type: 'spring',
        plus: plus,
        minus: minus
      });
    }
    result.pop();
    return result;
  };
  JSType.prototype.typesetRow = function(text, fontSize, rowSize) {
    var c, char, chars, cursor, last, width, _i, _len;
    last = 0;
    cursor = 0;
    chars = [];
    for (_i = 0, _len = text.length; _i < _len; _i++) {
      c = text[_i];
      if (c.type === 'word_propotional') {
        width = c.width;
        char = c.char;
      } else {
        width = fontSize;
        char = c;
      }
      if (cursor + width <= rowSize) {
        chars.push({
          char: char,
          x: cursor
        });
        cursor += width;
      } else {
        break;
      }
      last++;
    }
    return {
      chars: chars,
      overflow: text.slice(last)
    };
  };
  JSType.prototype.proposeRows = function(rawChars, rowSize) {
    var c, chars, charsList, cursor, last, _i, _len;
    last = 0;
    cursor = 0;
    charsList = [];
    chars = new CharAndSpringList(this.fontSize);
    for (_i = 0, _len = rawChars.length; _i < _len; _i++) {
      c = rawChars[_i];
      chars = chars.clone();
      chars.push(c);
      if ((chars.minLength() <= rowSize && rowSize <= chars.maxLength()) && c.type !== 'spring') {
        charsList.push(chars);
      } else if (rowSize < chars.minLength()) {
        break;
      }
    }
    if (charsList.length === 0) {
      return [chars];
    } else {
      return charsList;
    }
  };
  JSType.prototype.choiceRow = function(charsList, rowSize) {
    return charsList.sort(function(a, b) {
      return a.stretchRatio(rowSize) - b.stretchRatio(rowSize);
    })[0];
  };
  JSType.prototype.typesetRowJustify = function(chars, rowSize) {
    var c, char, cursor, row, stretchedWidthOfSpring, width, _i, _len, _ref;
    stretchedWidthOfSpring = chars.makeFuncStretchedWidthOfSpring(rowSize);
    cursor = 0;
    row = [];
    _ref = chars.charsAndSprings;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      c = _ref[_i];
      if (c.type === 'spring') {
        cursor += stretchedWidthOfSpring(c);
        continue;
      }
      if (c.type === 'word_propotional') {
        width = c.width;
        char = c.char;
      } else {
        width = this.fontSize;
        char = c;
      }
      row.push({
        char: char,
        x: cursor
      });
      cursor += width;
    }
    return row;
  };
  JSType.prototype.typesetRowWithSpring = function(rawChars, fontSize, rowSize) {
    var chars, charsList, row;
    this.fontSize = fontSize;
    charsList = this.proposeRows(rawChars, rowSize);
    chars = this.choiceRow(charsList, rowSize);
    row = this.typesetRowJustify(chars, rowSize);
    return {
      chars: row,
      overflow: rawChars.slice(chars.charsAndSprings.length)
    };
  };
  JSType.prototype.typesetBox = function(text, fontSize, lineSpace, rowSize, colSize) {
    var box, c, i, numLine, row, _i, _len, _ref;
    numLine = Math.floor((colSize - fontSize) / (fontSize + lineSpace) + 1);
    box = [];
    i = 0;
    while (i < numLine) {
      row = this.typesetRowWithSpring(text, fontSize, rowSize);
      _ref = row.chars;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        c = _ref[_i];
        c.y = i * (fontSize + lineSpace);
      }
      box.push(row.chars);
      text = row.overflow;
      if (text.length === 0) {
        break;
      }
      i++;
    }
    return {
      box: box,
      overflow: text
    };
  };
  return JSType;
})();