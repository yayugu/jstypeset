$(function() {
  var box, canvas, canvasContext, height, t, width;
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
  t = new JSType(canvasContext);
  test("split string", function() {
    var chars;
    chars = t.stringToChars("あいうHelloえお");
    equal(chars[0], "あ");
    equal(chars[1], "い");
    equal(chars[2], "う");
    equal(chars[3].char, "Hello");
    equal(chars[4], "え");
    return equal(chars[5], "お");
  });
  test("insert spring", function() {
    var chars;
    chars = t.stringToChars("あいHelloう");
    chars = t.insertSprings(chars, 5, 5);
    equal(chars[0], "あ");
    equal(chars[1].type, "spring");
    equal(chars[2], "い");
    equal(chars[3].type, "spring");
    equal(chars[4].char, "Hello");
    equal(chars[5].type, "spring");
    equal(chars[6], "う");
    equal(chars[7], void 0);
    return deepEqual(chars[1], {
      type: 'spring',
      plus: 5,
      minus: 5
    });
  });
  test("propose rows", function() {
    var chars, charsList;
    chars = t.stringToChars("あいうえ");
    chars = t.insertSprings(chars, 5, 5);
    t.fontSize = 10;
    charsList = t.proposeRows(chars, 20);
    equal(charsList.length, 2);
    equal(charsList[0].charsLength, 20);
    return equal(charsList[1].charsLength, 30);
  });
  test("choice best row", function() {
    var chars, charsList, row;
    chars = t.stringToChars("あいうえ");
    chars = t.insertSprings(chars, 5, 5);
    t.fontSize = 10;
    charsList = t.proposeRows(chars, 20);
    row = t.choiceRow(charsList, 20);
    equal(row.charsLength, 20);
    chars = t.stringToChars("あいうえおかき");
    chars = t.insertSprings(chars, 5, 5);
    t.fontSize = 20;
    charsList = t.proposeRows(chars, 120);
    row = t.choiceRow(charsList, 120);
    return equal(row.charsLength, 120);
  });
  return test("typeset row justify", function() {
    var chars, row;
    chars = t.stringToChars("あいうえ");
    chars = t.insertSprings(chars, 5, 5);
    row = t.typesetRowWithSpring(chars, 10, 25);
    equal(row.chars[row.chars.length - 1].x, 15);
    chars = t.stringToChars("あいうえ");
    chars = t.insertSprings(chars, 5, 0);
    row = t.typesetRowWithSpring(chars, 10, 25);
    return equal(row.chars[row.chars.length - 1].x, 15);
  });
});