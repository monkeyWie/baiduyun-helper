export default $(`
<span class="g-dropdown-button last-button" style="display: inline-block;">
  <a class="g-button" href="javascript:;" title="PD下载" style="color:#fff;background: #f8645c;">
    <span class="g-button-right">
      <em class="icon icon-download" title="PD下载"> </em>
      <span class="text" style="width: auto;">PD下载</span>
    </span>
  </a>
  <span class="menu" style="width: 96px;z-index: 49;">
    <a data-menu-id="pd-direct" class="g-button-menu" href="javascript:;">直链下载</a>
    <a data-menu-id="pd-batch" class="g-button-menu" href="javascript:;">压缩链接下载</a>
    <a data-menu-id="pd-push" class="g-button-menu" href="javascript:;">批量推送下载</a>
    <div style="height:1px;width:100%;background:#e9e9e9;overflow:hidden;"></div>
    <a data-menu-id="pd-home" class="g-button-menu" target="_blank" href="https://github.com/proxyee-down-org/proxyee-down-extension/tree/master/baiduYun">使用教程</a>
  </span>
</span>
`)
  .hover(
    function() {
      $(this).addClass('button-open')
    },
    function() {
      $(this).removeClass('button-open')
    }
  )
  .on('click', 'a[data-menu-id]', function() {
    $(this)
      .parents('span.g-dropdown-button')
      .removeClass('button-open')
  })
