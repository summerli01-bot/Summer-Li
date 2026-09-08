# EL FBS 官方仓 all in one

网站源码与公开 SOP 资料备份。包含入仓指南、费用比较和服务端 Free Trial 查询接口。

## 构建与验证

需要 Node.js 22.13 或以上，无额外依赖。

```sh
npm run build
npm test
```

构建输出为 `dist/server/index.js` 和 `dist/client/sop.pdf`。
测试仅使用虚构的四站点名单，不含真实店铺或主体数据。

## 托管说明

这是 Cloudflare Workers 兼容的服务端项目，不能直接把完整功能部署到 GitHub Pages。
需提供 ASSETS 静态资源绑定及私有运行时配置：ROSTER_REVISION、ROSTER_UPDATED_AT、ROSTER_PART_COUNT、ROSTER_PART_0 等。
名单是 JSON 数组，每行含 site、shopId、ggp；经 gzip 后转 base64 并分段保存在私有运行时配置中。切勿将真实名单提交至本仓库。

GitHub 保存源码不代表新网站已上线。原托管地址存在外部浏览器被平台拦截的问题，新托管与外网验证仍待完成。

成本结果是方案比较估算，未涵盖全部费用。名单为手动同步快照，不自动读取 Google Sheets。
