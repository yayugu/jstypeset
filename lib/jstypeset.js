/*
char: 1トークン，一文字とは限らない
text: 一連の文字や文字的なものの並び，StringではなくArray
*/
var JSType;
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
          chars = chars.concat(stringToArray(string.slice(0, m.index - 1)));
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
  JSType.prototype.typesetRow = function(text, fontSize, rowSize) {
    var c, chars, cursor, last, _i, _len;
    last = 0;
    cursor = 0;
    chars = [];
    for (_i = 0, _len = text.length; _i < _len; _i++) {
      c = text[_i];
      if (c.type === 'word_propotional') {
        if (cursor + c.width <= rowSize) {
          chars.push({
            char: c.char,
            x: cursor
          });
          cursor += c.width;
        } else {
          break;
        }
      } else {
        if (cursor + fontSize <= rowSize) {
          chars.push({
            char: c,
            x: cursor
          });
          cursor += fontSize;
        } else {
          break;
        }
      }
      last++;
    }
    return {
      chars: chars,
      overflow: text.slice(last)
    };
  };
  JSType.prototype.typesetRowWithSpring = function(text, fontSize, rowSize) {
    var c, chars, cursor, cursorMax, cursorMin, last, lengthMax, lengthMin, _i, _len;
    last = 0;
    cursor = 0;
    cursorMin = 0;
    cursorMax = 0;
    lengthMin = 0;
    lengthMax = 0;
    chars = [];
    for (_i = 0, _len = text.length; _i < _len; _i++) {
      c = text[_i];
      switch (c.type) {
        case 'word_propotional':
          if (cursor + c.width <= rowSize) {
            chars.push({
              char: c.char,
              x: cursor
            });
            cursor += c.width;
          } else {
            break;
          }
          break;
        case 'spring':
          cursorMin += c.plus;
          cursorMax += c.minus;
          break;
        default:
          if (cursor + fontSize <= rowSize) {
            chars.push({
              char: c,
              x: cursor
            });
            cursor += fontSize;
          } else {
            break;
          }
      }
      last++;
    }
    while (true) {
      if (cursor + springMin > rowSize) {} else if (cursor + springMax < rowSize) {} else {
        break;
      }
    }
    return {
      chars: chars,
      overflow: text.slice(last)
    };
  };
  JSType.prototype.typesetBox = function(text, fontSize, lineSpace, rowSize, colSize) {
    var box, c, i, numLine, row, _i, _len, _ref;
    numLine = Math.floor((colSize - fontSize) / (fontSize + lineSpace) + 1);
    box = [];
    i = 0;
    while (i < numLine) {
      row = this.typesetRow(text, fontSize, rowSize);
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
$(function() {
  var box, canvas, canvasContext, chars, height, res, row, t, width, _i, _len, _ref;
  box = $('.typeset-box');
  width = box.attr('width');
  height = box.attr('height');
  canvas = $('<canvas />');
  canvas.attr({
    width: '500px',
    height: '500px',
    style: 'border: solid 1px #000000;'
  });
  canvasContext = canvas[0].getContext("2d");
  canvasContext.font = "15px sans-serif";
  /*
    drawChars context, [
      {char: 'い', x: 20, y: 30}
      {char: 'ろ', x: 35, y: 30}
    ]
    */
  t = new JSType(canvasContext);
  chars = t.stringToChars("Web の開発、制作者は少なくとも Safari, Chrome, Firefox のいずれかは使っていると思う。これらのブラウザを使っているならぜひオススメ。毎回の reload から完全に解放されるのはちょっと想像以上にインパクトが大きい。ただ、個人的にはイチオシの LiveReload だけど Windows 環境ではちょっと制限が厳しい。ちゃんと手順に従えば間違いなく動く（1.6については）ので、コスト計算がちゃんとできる人にはぜひ試してもらいたい。");
  res = t.typesetBox(chars, 15, 5, 120, 1000);
  _ref = res.box;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    row = _ref[_i];
    t.drawChars(row, 10, 60);
  }
  return box.append(canvas);
});