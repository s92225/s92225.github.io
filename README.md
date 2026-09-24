# 夾夾島 · Candy Jelly 1.0.1

Candy Jelly 是一款手機優先的 3D 夾爪網頁遊戲，包含 30 個關卡、32 件原創收藏品、三星挑戰、遊戲金幣及三種錦囊。

正式網站：https://s92225.github.io/

## 本機開發

```sh
npm ci
npm run dev
npm test
npm run build
```

開發伺服器只綁定 `127.0.0.1`。正式建置輸出到 `dist/`，由 GitHub Actions 自動測試及發佈到 GitHub Pages。

## 正式服務

- Google AdSense publisher：`ca-pub-8769011123659282`
- 獎勵廣告：Google H5 Games Ad Placement API；只會在完整觀看後派發錦囊
- 網站擁有權驗證：AdSense script、meta tag、`public/ads.txt`
- 搜尋引擎：`robots.txt`、`sitemap.xml`、canonical URL
- 安裝體驗：Web App Manifest、獨立顯示模式及主題色
- 私隱：遊戲內私隱政策及 Google CMP 同意訊息
- 儲存：玩家進度、設定、金幣及收藏保存在瀏覽器本機

## 發佈

推送 `main` 後，`.github/workflows/deploy-pages.yml` 會執行測試、正式建置及 GitHub Pages 發佈。發佈前應確保 `npm test`、`npm run build` 及 `npm audit` 全部通過。

## 遊戲規則

- 每關第一次移動會開始十秒倒數，逾時自動落夾。
- 目標物件必須進入出口才會計分；同一夾可以計算多件物件。
- 三星條件分別為目標數量內完成、每夾十秒內完成及全關不用錦囊。
- 錦囊使用遊戲金幣補充；遊戲金幣沒有現金價值，亦不可兌換實物。
- 收藏品只登錄一次，以圖鑑方式顯示。

## 技術

- Vite
- Three.js
- cannon-es
- Node.js 測試套件
