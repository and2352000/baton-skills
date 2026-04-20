# Browse CLI 備忘錄

## 所有子命令總覽

### Navigation（5）
| 指令 | 說明 |
|------|------|
| `$B back` | 上一頁 |
| `$B forward` | 下一頁 |
| `$B goto <url>` | 導航到 URL |
| `$B reload` | 重新載入 |
| `$B url` | 顯示目前 URL |

### Reading（5）
| 指令 | 說明 |
|------|------|
| `$B accessibility` | 完整 ARIA tree |
| `$B forms` | 表單欄位（JSON）|
| `$B html [selector]` | 指定區塊或整頁 HTML |
| `$B links` | 所有連結 |
| `$B text` | 純文字內容 |

### Interaction（17）
| 指令 | 說明 |
|------|------|
| `$B cleanup [--ads] [--cookies] [--sticky] [--social] [--all]` | 移除廣告、cookie banner 等雜訊 |
| `$B click <sel>` | 點擊元素 |
| `$B cookie <name>=<value>` | 設定 cookie |
| `$B cookie-import <json>` | 從 JSON 匯入 cookie |
| `$B cookie-import-browser [browser]` | 從瀏覽器匯入 cookie |
| `$B dialog-accept [text]` | 自動接受 alert/confirm/prompt |
| `$B dialog-dismiss` | 自動關閉 dialog |
| `$B fill <sel> <val>` | 填入 input |
| `$B header <name>:<value>` | 設定 request header |
| `$B hover <sel>` | Hover 元素 |
| `$B press <key>` | 按鍵（Enter, Tab, Escape...）|
| `$B scroll [sel]` | 捲動到元素或頁底 |
| `$B select <sel> <val>` | 選擇 dropdown 選項 |
| `$B style <sel> <prop> <value>` | 修改 CSS 屬性 |
| `$B type <text>` | 在 focused 元素輸入文字 |
| `$B upload <sel> <file>` | 上傳檔案 |
| `$B useragent <string>` | 設定 user agent |
| `$B viewport <WxH>` | 設定視窗大小 |
| `$B wait <sel\|--networkidle\|--load>` | 等待元素 / 網路靜止 / 頁面載入 |

### Inspection（12）
| 指令 | 說明 |
|------|------|
| `$B attrs <sel>` | 元素屬性 JSON |
| `$B console [--errors]` | console 訊息 |
| `$B cookies` | 所有 cookie |
| `$B css <sel> <prop>` | computed CSS 值 |
| `$B dialog` | dialog 訊息 |
| `$B eval <file>` | 執行 JS 檔案 |
| `$B inspect [sel]` | 深度 CSS 檢查 |
| `$B is <prop> <sel>` | 狀態確認（visible/enabled/checked...）|
| `$B js <expr>` | 執行 JS 表達式 |
| `$B network` | 網路請求列表 |
| `$B perf` | 頁面載入時間 |
| `$B storage [set k v]` | localStorage / sessionStorage |

### Visual（5）
| 指令 | 說明 |
|------|------|
| `$B diff <url1> <url2>` | 兩頁文字 diff |
| `$B pdf [path]` | 存成 PDF |
| `$B prettyscreenshot [options] [path]` | 乾淨截圖（可清理雜訊、捲動定位）|
| `$B responsive [prefix]` | mobile/tablet/desktop 三張截圖 |
| `$B screenshot [options] [path]` | 截圖（支援元素裁切、viewport）|

### Snapshot（flags）
```bash
$B snapshot          # 基本 accessibility tree
$B snapshot -i       # 只顯示互動元素（@e refs）
$B snapshot -c       # compact 模式
$B snapshot -d N     # 限制 tree 深度
$B snapshot -s sel   # 只看某 selector 範圍
$B snapshot -D       # diff 對比上次 snapshot
$B snapshot -a       # 帶標注截圖
$B snapshot -o path  # 指定截圖輸出路徑（需搭配 -a）
$B snapshot -C       # cursor-interactive 元素（@c refs）
```

### Meta & Tabs（8）
| 指令 | 說明 |
|------|------|
| `$B chain` | 從 JSON stdin 批次執行命令 |
| `$B frame <sel\|main>` | 切換 iframe |
| `$B inbox` | sidebar scout 收件匣 |
| `$B watch [stop]` | 被動觀察模式 |
| `$B closetab [id]` | 關閉分頁 |
| `$B newtab [url]` | 開新分頁 |
| `$B tab <id>` | 切換分頁 |
| `$B tabs` | 列出所有分頁 |

### Server（10）
| 指令 | 說明 |
|------|------|
| `$B connect` | 啟動有頭 Chromium（含 extension）|
| `$B disconnect` | 切回 headless 模式 |
| `$B focus` | 把瀏覽器視窗帶到前景（macOS）|
| `$B handoff [message]` | 移交給使用者操作（CAPTCHA 等）|
| `$B restart` | 重啟 server |
| `$B resume` | 使用者操作完畢後恢復 AI 控制 |
| `$B state save\|load <name>` | 儲存 / 載入瀏覽器狀態 |
| `$B status` | 健康檢查 |
| `$B stop` | 關閉 server |

---

## 爬蟲備忘錄

## 動態網站爬蟲流程

### 基本流程（SPA / JS-rendered）

```bash
$B goto <url>
$B wait --networkidle        # 等網路請求靜止
$B wait ".target"            # 等目標元素出現
$B text                      # 抓純文字
$B html ".target"            # 抓特定區塊 HTML
```

### 需要捲動載入（infinite scroll）

```bash
$B goto <url>
$B wait --networkidle
$B scroll                    # 捲到底部觸發載入
$B wait --networkidle        # 再等一次
$B text
```

### 需要互動後才顯示資料

```bash
$B goto <url>
$B wait --networkidle
$B snapshot -i               # 看有哪些互動元素（@e refs）
$B click @e3                 # 點按鈕 / tab / dropdown
$B wait ".data-loaded"       # 等資料出現
$B html ".result"
```

### 需要登入後才能爬

```bash
$B goto <url>/login
$B snapshot -i
$B fill @e2 "user@email.com"
$B fill @e3 "password"
$B click @e4                 # 送出
$B wait --networkidle
$B goto <target-url>
$B wait ".content"
$B text
```

### 驗證資料有無載入

```bash
$B is visible ".target"      # 確認元素存在
$B console --errors          # 有無 JS 錯誤
$B network                   # 有無失敗的請求
```

---

## wait 的三種用法

| 指令 | 說明 |
|------|------|
| `$B wait --networkidle` | 等網路請求全部停止 |
| `$B wait --load` | 等頁面 load 事件觸發 |
| `$B wait ".selector"` | 等特定 CSS selector 出現（timeout 15s）|

---

## 常用組合技

```bash
# 截圖存證
$B screenshot /tmp/result.png

# 看 render 前後差異
$B snapshot                  # 存 baseline
$B click @e1
$B snapshot -D               # diff 顯示變化

# 抓不同螢幕尺寸
$B responsive /tmp/layout    # mobile + tablet + desktop

# 執行 JS 確認狀態
$B js "document.querySelectorAll('.item').length"
```
