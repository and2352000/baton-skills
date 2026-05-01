---
description: 開發流程說明與文件管理
---

# Feature Doc 行為規範

## 角色分工

各角色各司其職，需要協助時主動呼叫對應 skill，不要把所有工作攬在自己身上：

| Skill | 角色 | 職責 |
|-------|------|------|
| `/new-feature` | 產品需求 | 建立 user-story 文件與功能資料夾，討論並釐清需求 |
| `/tech-spec` | 架構工程師 | 分析需求、建立技術規格文件 |
| `/coder` | 資深工程師 | 依照 tech-spec 實作程式碼 |
| `/dba` | DBA 工程師 | 建立 TypeORM Entity 與 Migration |
| `/qa` | 測試工程師 | 架設測試環境、執行 integration test |
| `/commit` | — | 整理變更、產生 commit message |
| `/doc-summary` | 文件工程師 | 彙整 doc/ 近期異動、更新 doc/summary/、維護 CLAUDE.md 索引 |
| `/api-doc` | API 維護員 | 管理第三方 API 文件，回答 API 相關問題 |
| `/browse` | 瀏覽器操作員 | 控制 headless browser 爬取動態網站（SPA、JS-rendered） |

---

## 開發流程

> 每個步驟都必須等前一步完成且通過後才可繼續。

1. **需求** — `/new-feature` 建立 user-story，與使用者討論直到 `status: approved`
2. **規格** — `/tech-spec` 建立技術規格並存到 `doc/`，使用者 approved 後才繼續
3. **開發（逐 task）** — 依序執行每個 tech-spec task：
   1. `/coder` 實作（若有 DB 異動同步呼叫 `/dba`）
   2. `/qa` 跑 integration test，確認通過（失敗則回 `/coder` 修正）
   3. `/commit` 建立 commit
   4. 重複直到所有 task 完成
4. **文件彙整** — 詢問使用者是否呼叫 `/doc-summary` 更新摘要

---

## 協作原則

- 遇到不屬於自己職責的工作，**呼叫對應 skill** 而非自己處理
- 各 skill 之間可以互相呼叫，形成協作鏈
- 有疑問或缺少資訊時，先問使用者，不要自行假設後硬幹

---

## Claude 行為約束

### 文件
- 所有文件（user-story、tech-spec、api-doc 等）一律建立在 `doc/` 資料夾下
- 開發完成或中途有變更時，主動提示使用者確認 `doc/` 是否需要同步更新

### 流程門檻（不得跨越）
- user-story `status: approved` 後才可建立 tech-spec
- tech-spec `status: approved` 後才可開始開發
- **每個 task 必須依序執行，前一個 task 的 commit 完成後才可進行下一個**
- **每次 commit 前必須先呼叫 `/qa` 確認測試通過**，測試未通過不得執行 `/commit`
- 未經使用者確認，不得擅自將任何 status 改為 approved

### 程式碼
- 所有程式碼實作一律呼叫 `/coder`，不得自行撰寫
- `/qa` 回報測試失敗時，一律呼叫 `/coder` 修正，不得自行修改

### 收尾
- 每次功能開發完成（最後一個 commit 後），主動詢問使用者是否需要呼叫 `/doc-summary`

---

## 修改 Skills 的原則

- skill 的修改要符合通用性，讓不同專案都可以使用
- 專案的特殊風格或必要資源，可請 skill 更新該資料夾的 `./_memory.md` 作為行動參考
- 務必讓 skill 本身能夠自行更新 `./_memory.md`
