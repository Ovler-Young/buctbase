# BUCTBASE

由北化学生建立的一个分享网站，基于 [onedrive-vercel-index](https://github.com/spencerwooo/onedrive-vercel-index) 构建。

网站主要功能参见[原项目文档](https://onedrive-vercel-index.spencerwoo.com/zh) 中的相关部分。

修改：

- 增加 badage 统计功能

- 增加微信公众号显示功能

- 增加 robot.txt 规定哪些文件可以被搜索引擎检索

- 增加隐藏部分文件功能

- 增加自动获取上游更新的 GitHub-action

- 删除原项目的 FUNDING 文件

- 将 api.config.js 中 clientId 和 clientSecret 的获取方式增加 vervel 环境变量方式

- gitignore 文件增加 .env 文件


myl7-upstream：
- Fix missing filename urlencoding in multidownload spencerwooo/onedrive-vercel-index#639, which resolves discussion spencerwooo/onedrive-vercel-index#621
- Fix numeric password not working spencerwooo/onedrive-vercel-index#638, which resolves spencerwooo/onedrive-vercel-index#606
- Fix music volume reset to max automatically spencerwooo/onedrive-vercel-index#630, which resolves spencerwooo/onedrive-vercel-index#573
- Fix error report for search result item requests spencerwooo/onedrive-vercel-index#647
- Fix wrong auth url param name of EPUB preview spencerwooo/onedrive-vercel-index#659