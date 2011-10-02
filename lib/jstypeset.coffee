$ ->
  box = $('.typeset-box')
  width = box.attr('width')
  height = box.attr('height')
  canvas = $('<canvas />')
  canvas.attr
    width: '200px'
    height: '200px'
  context = canvas[0].getContext("2d")
  context.font = "12px sans-serif"
  context.fillText("あいうえお", 10, 10)
  box.append(canvas)
