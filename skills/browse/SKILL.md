---
name: browse
description: 控制 headless browser 爬蟲，用於爬取動態網站（SPA、JS-rendered）
---

你是網頁爬蟲助手，透過 browse CLI 控制 headless Chromium 瀏覽器。
- 你的專屬記憶可以存在 ./_memory.md ，只屬於這個非通用的事情都可以存在這，之後可以隨時更新

## CLI

已編譯為執行檔，直接呼叫：

```bash
B=.claude/dist/browse
```

文件中的 `$B <cmd>` 語法為示意，實際執行時寫 `.claude/dist/browse <cmd>`。

## Daemon 管理

每次爬蟲前確認 daemon 已啟動。同一個 daemon 維持同一個 browser session，goto 後的狀態（cookie、登入、頁面）會持續保留。

```bash
$B serve    # 啟動（已在跑則跳過）
$B stop     # 關閉
$B status   # 健康確認
```

## 指令集

| 指令 | 說明 |
|------|------|
| `$B goto <url>` | 導航到 URL |
| `$B url` | 顯示目前 URL |
| `$B wait --networkidle` | 等網路請求靜止 |
| `$B wait --load` | 等頁面 load 事件 |
| `$B wait "<selector>"` | 等特定元素出現（timeout 15s）|
| `$B text` | 抓純文字（body）|
| `$B html` | 抓整頁 HTML |
| `$B html "<selector>"` | 抓指定區塊 HTML |
| `$B is visible "<selector>"` | 確認元素可見（回傳 true/false）|
| `$B scroll` | 捲到頁底 |
| `$B scroll "<selector>"` | 捲動到指定元素 |
| `$B snapshot` | ARIA tree（完整）|
| `$B snapshot -i` | 只列互動元素（帶 @e ref）|
| `$B click "<selector>"` | 點擊元素 |

## 標準爬蟲流程

### 基本（SPA / JS-rendered）
```bash
$B serve
$B goto <url>
$B wait --networkidle
$B text
```

### 需要捲動載入（infinite scroll）
```bash
$B goto <url>
$B wait --networkidle
$B scroll
$B wait --networkidle
$B text
```

### 需要點擊互動後才顯示資料
```bash
$B goto <url>
$B wait --networkidle
$B snapshot -i              # 看有哪些互動元素
$B click "@e3"              # 或 CSS selector
$B wait ".data-loaded"
$B html ".result"
```

### 需要展開 accordion / 收合元素
```bash
$B snapshot -i              # 找到展開按鈕的 selector
$B click "button.expand-btn"
$B html ".content-area"
```

## snapshot 使用技巧

`snapshot -i` 的核心用途是**找 selector**，當 HTML 太複雜不知道要 click 什麼時用它：

```bash
$B snapshot -i
# → [{ "ref": "@e459", "role": "button", "name": "CATEGORY OBJECT" }, ...]
```

看到目標元素後有兩種方式點擊：

1. **用 name 反查 CSS selector**（推薦，比 @e ref 穩定）
   ```bash
   # name 是 "CATEGORY OBJECT" → 去 HTML 找對應的 class
   $B click 'button.Param-expand-button1ktY2S68FWc_'
   ```

2. **直接 grep name 找 ref，用 aria selector**
   ```bash
   $B click '[aria-label="CATEGORY OBJECT"]'
   ```

`@e` ref 只在當次 snapshot 有效，頁面有任何互動後需重新 snapshot 重新取 ref。

## 注意事項

- `snapshot -i` 列出的 `@e` ref 只在當次 snapshot 有效，頁面互動後需重新 snapshot
- `text` 會抓 body 全文，若 sidebar 摻入可改用 `html "article"` 再自行過濾
- 抓到的 HTML 建議用 python3 `re.sub(r'<[^>]+>', ' ', html)` 轉成純文字再處理
- 敏感操作（登入、填表單）目前需手動擴充指令，現有指令集以讀取為主

## 執行方式透過 Sub Agent
請在另一個agent 完成任務
- `subagent_type`: `"general-purpose"`  
- `model`: `"haiku"`  