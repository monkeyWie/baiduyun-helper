# 百度云下载扩展

基于 proxyee-down 扩展模块开发，在安装成功后访问百度云页面可以看到 PD 下载按钮。  
![效果](https://github.com/monkeyWie/baiduyun-helper/raw/master/.imgs/example1.png)

## 直链下载

只能用于单个文件下载。

## 压缩链接下载

可以支持单文件、多文件、文件夹一起下载，使用压缩链接下载时，百度云会将选择的文件打包成一个 zip 文件下载完毕后解压出来就是之前在勾选下载的文件。

#### 注意

1. 由于百度云的 bug，压缩链接下载文件夹的时候文件夹以及父文件夹名称中不能包含`+`号，不然会导致获取下载链接失败，需要把名字中的`+`去掉再下载。
2. 由于百度云的限制，压缩链接下载文件时有最大文件数量下载限制，选择的文件不能超过 2000。
3. 由于百度批量下载的 zip 压缩包不是 zip64 格式，在压缩包里有超过 4G 文件的时候普通的解压工具并不能正确的识别文件大小从而导致解压失败，遇到这种情况时可以用[bdy-unpack](https://github.com/monkeyWie/bdy-unpack)进行解压。
4. 实测 2018 年 9 月 11 号开始，百度云已经限制了压缩链接下载，当选择的文件总大小超过 300M 就不能下载了，建议使用批量推送来下载多个文件和文件夹。

## 批量推送下载

直接将选中的文件以 Proxyee Down 默认的下载设置推送到任务列表，每个文件单独创建一个任务。

## 常见问题

- [百度云下载速度太慢](https://community.pdown.org/topic/52)

## BUG 提交

[issue](https://github.com/monkeyWie/baiduyun-helper/issues)

## 更新日志

[releases](https://github.com/monkeyWie/baiduyun-helper/releases)
