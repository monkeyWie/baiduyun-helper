$.extend({
  block: function() {
    let blockDiv = $('#pdownBlockDiv')
    if (blockDiv.size() == 0) {
      blockDiv = $(`
        <div id="pdownBlockDiv" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index: 95;background-color:rgba(255,255,255,.9)">
          <div style="position: absolute;top:50%;left:50%;color:#2d8cf0">请求中...</div>
        </div>
      `)
      $('body').append(blockDiv)
    } else {
      blockDiv.show()
    }
  },
  unblock: function() {
    $('#pdownBlockDiv').hide()
  }
})
