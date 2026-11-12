# WikiCraft — 維基百科現代極簡閱讀主題

[English](./README.md) | **繁體中文**

受 **Notion** 與 **Craft** 啟發的維基百科（Wikipedia, `*.wikipedia.org`）現代極簡閱讀主題，基於 **WXT + TypeScript + Manifest V3** 開發。

---

## ✨ 核心特色

- **原地排版與閱讀體驗升級**：完整保留維基百科原生功能（條目編輯、討論頁、多語系切換與修訂歷史），集中重塑字體階層、行距與舒適閱讀欄寬。
- **極致打磨的深淺色雙模式（零設定）**：內建質感暖白（Light）與柔和深灰（Dark）兩種純粹配色，並支援跟隨作業系統外觀自動切換。
- **零閃爍載入（No FOUC）**：在 `document_start` 階段即透過快取掛載主題 CSS 變數，解決頁面載入瞬間的閃白問題。
- **卡片化資訊框、表格與導覽列**：將右側資訊框（Infobox）、資料表格（`.wikitable`）與底部導覽框（Navbox）重塑為圓角現代卡片，並智慧清理條目中手寫死顏色的內聯背景色。
- **智慧精簡版面**：自動隱藏右側重複的原生「外觀（Appearance）」面板，並將左側目次（TOC）改造成 Notion 風格的懸浮大綱。
- **雙入口切換控制**：可直接透過維基百科頂欄右上角的低調膠囊按鈕切換外觀，亦可點擊 Chrome 工具列圖示開啟極簡面板隨時啟用或暫停主題。

---

## 🛠 本地開發與打包建置

```bash
# 安裝相依套件
npm install

# 啟動本地開發模式（支援 HMR 熱重載）
npm run dev

# 執行 TypeScript 型別檢查
npm run typecheck

# 建置未封裝擴充功能（輸出至 dist/chrome-mv3）
npm run build

# 打包 Chrome Web Store 上架用壓縮檔（輸出至 dist/wikicraft-1.0.0-chrome.zip）
npm run zip
```

---

## 📦 在 Chrome 中載入未封裝項目進行測試

1. 執行 `npm run build`。
2. 在 Chrome 瀏覽器網址列輸入 `chrome://extensions/`。
3. 開啟右上角的 **「開發人員模式（Developer mode）」**。
4. 點擊左上角 **「載入未封裝項目（Load unpacked）」**，選擇專案中的 `dist/chrome-mv3` 資料夾。
5. 前往任意維基百科頁面（如 [臺灣條目](https://zh.wikipedia.org/zh-tw/臺灣)）即可檢視效果。

---

## 📄 Chrome Web Store 上架說明

上架中英文文案、單一用途宣告與隱私權權限審核填表資訊請參閱 [STORE_LISTING.md](./STORE_LISTING.md)。

---

## 🔒 隱私權承諾

WikiCraft 僅在 `*.wikipedia.org` 網域於本地端執行，完全不收集、不追蹤、亦不傳輸任何使用者資料或瀏覽紀錄。
