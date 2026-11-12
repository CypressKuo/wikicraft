# Chrome Web Store 上架素材與審核填表指南 (Store Listing Guide)

打包上架檔案指令：
```bash
npm run zip
```
產出的上傳檔案位於：`dist/wikicraft-1.0.0-chrome.zip`

---

## 1. 商品詳情文案 (Store Listing Copy)

### 繁體中文 (`zh_TW`)

- **標題 (Name)**：`WikiCraft — 維基百科現代極簡閱讀主題`
- **簡短說明 (Summary, ≤ 132 字)**：
  受 Notion 與 Craft 啟發的 Wikipedia 現代極簡主題，打造卡片式資訊框、舒適排版與無縫深淺色切換體驗。
- **詳細說明 (Detailed Description)**：
  ```text
  WikiCraft 為維基百科（Wikipedia）帶來如同 Notion 與 Craft 般乾淨、溫潤且專注的現代閱讀體驗，同時完整保留維基百科原生功能（編輯、討論頁、多語系切換與歷史紀錄）。

  ✨ 核心特色：
  • 極簡現代筆記美學：精心調校的無襯線字體堆疊、行距與舒適閱讀欄寬，支援中英日等多語系混排最佳化。
  • 零設定深淺色雙模式：內建質感暖白（Light）與柔和深灰（Dark）主題，支援跟隨系統外觀自動切換，並於頁面載入瞬間生效（零閃爍 No FOUC）。
  • 卡片式資訊框與表格重塑：將右上角資訊框（Infobox）、資料表格與底部導覽框改造為圓角卡片，並自動清理條目內突兀的寫死內聯背景色。
  • 智慧精簡版面：將左側目錄美化為現代大綱樣式，自動隱藏重複的原生外觀設定欄，讓版面呼吸感十足。
  • 雙入口快速切換：可透過維基百科頂欄右上角的低調膠囊按鈕，或點擊瀏覽器工具列圖示隨時切換深淺色與啟用狀態。

  🔒 隱私承諾：
  WikiCraft 僅在 `*.wikipedia.org` 網域運作，完全在本地端執行，不收集、不追蹤、亦不傳輸任何個人或瀏覽資料。
  ```

### English (`en`)

- **Name**: `WikiCraft — Modern Theme for Wikipedia`
- **Summary (≤ 132 chars)**:
  A clean, Notion & Craft-inspired reading theme for Wikipedia with card-styled infoboxes and seamless Light/Dark modes.
- **Detailed Description**:
  ```text
  WikiCraft transforms Wikipedia into a calm, distraction-free reading environment inspired by Notion and Craft — while preserving 100% of Wikipedia's native functionality (editing, talk pages, language switching, and revision history).

  ✨ Key Features:
  • Modern Note-App Aesthetics: Carefully tuned typography, line height, and reading column width optimized for long-form reading across English and CJK languages.
  • Zero-Config Light & Dark Modes: A single, finely crafted neutral palette with Light, Dark, and System modes — applied instantaneously at document_start with zero flash of unstyled content (No FOUC).
  • Card-Styled Infoboxes & Tables: Redesigns right-hand infoboxes, data tables, and bottom navboxes into clean rounded cards while sanitizing jarring hardcoded inline background colors.
  • Smart Sidebar Decluttering: Restyles the left Table of Contents into a clean sticky outline and hides redundant native appearance panels.
  • Dual-Entry Toggle: Switch modes effortlessly from the subtle pill button in Wikipedia's top header or via the toolbar popup.

  🔒 Privacy First:
  WikiCraft runs strictly on `*.wikipedia.org` locally in your browser. Zero analytics, zero tracking, and zero external network requests.
  ```

---

## 2. 隱私權分頁填表說明 (Privacy Tab Justifications)

在 Chrome Web Store Developer Dashboard 的 **Privacy practices** 頁面可直接複製以下內容（用英文填寫審核最快）：

- **Single Purpose Description（單一用途說明）**:
  ```text
  Applies a clean, customizable Light and Dark reading theme to Wikipedia desktop pages (*.wikipedia.org).
  ```

- **Permission Justification — `storage`（權限理由）**:
  ```text
  Used solely to store the user's theme preference (enabled/disabled state and Light/Dark/System mode) locally across browser sessions via chrome.storage.sync.
  ```

- **Host Permission Justification — `*://*.wikipedia.org/*`（網域權限理由）**:
  ```text
  Required by the content script to inject the custom CSS theme, normalize inline table/infobox styles, and render the theme mode toggle button on Wikipedia pages.
  ```

- **Data Usage Certification（資料使用宣告）**:
  - 勾選 **「I do not collect or use any user data」**（所有資料收集項目皆不勾選，並勾選底部的三項合規聲明）。
