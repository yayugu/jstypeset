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
  canvasContext.font = "20px sans-serif";
  t = new JSType(canvasContext);
  chars = t.stringToChars("Web の開発、制作者は少なくとも Safari, Chrome, Firefox のいずれかは使っていると思う。これらのブラウザを使っているならぜひオススメ。毎回の reload から完全に解放されるのはちょっと想像以上にインパクトが大きい。ただ、個人的にはイチオシの LiveReload だけど Windows 環境ではちょっと制限が厳しい。ちゃんと手順に従えば間違いなく動く（1.6については）ので、コスト計算がちゃんとできる人にはぜひ試してもらいたい。");
  chars = t.insertSprings(chars, 3, 3);
  res = t.typesetBox(chars, 20, 5, 120, 1000);
  _ref = res.box;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    row = _ref[_i];
    t.drawChars(row, 10, 60);
  }
  return box.append(canvas);
});