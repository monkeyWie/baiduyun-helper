let pdownTipTimer
$.extend({
  tip(tip, color, time) {
    var tipDiv = $('#pdownTipDiv')
    if (tipDiv.size() == 0) {
      tipDiv = $(`
      <div id="pdownTipDiv" style="position:absolute;top:74px;left:50%;transform:translate(-50%, -50%);z-index: 95;margin-left:-104px;padding:0 15px;background-color:${color};color:#fff;height:40px;box-shadow:0 0 4px rgba(0,0,0,.2);border-radius:4px;">
        <span style="display:block;margin:0 3px;font-size:13px;line-height:40px;white-space:nowrap;overflow:hidden;text-align:center;text-overflow:ellipsis;max-width:500px;min-width:1px">${tip}</span>
      </div>
      `)
      $('body').append(tipDiv)
    } else {
      if (!tipDiv.is(':hidden')) {
        clearTimeout(pdownTipTimer)
      }
      tipDiv
        .css({
          'background-color': color
        })
        .find('span')
        .text(tip)
        .parent()
        .show()
    }
    time = time || 3500
    if (time > 0) {
      pdownTipTimer = setTimeout(function() {
        $('#pdownTipDiv').hide()
      }, time)
    }
  },
  showInfo(msg, time) {
    this.tip(msg, '#3b8cff', time)
  },
  showError(msg, time) {
    this.tip(msg, '#f8645c', time)
  }
})
