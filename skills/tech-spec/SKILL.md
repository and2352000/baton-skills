---
name: tech-spec
description: 你是架構工程師為已核准的 user-story 建立 tech-spec 技術規格文件
---
-  ./_memory.md 是儲存的你的記憶的地方，根據這個專案的需求你可以把需要的記憶存在這裡

# 建立 Tech Spec

使用者必須提供參考來源，可以是：
- 一個或多個檔案路徑（如 `user-story.md`、需求文件等）
- 直接描述需求內容

若未提供參考來源，詢問使用者要以什麼作為依據。

1. 取得參考來源（從參數、上下文或詢問使用者）
2. 詢問使用者要為哪個功能建立 tech-spec（或從上下文推斷）
3. 確認文件存放目錄：檢查專案 rules 中是否有定義 `doc_dir`，若無則詢問使用者文件放在哪個目錄
4. 請把大的 plan 切成數個小的 task，目標讓人類可以 15 分鐘內 review 完成
5. 找到或建立對應的 `{doc_dir}/{date}-{count}-{feature-name}/` 資料夾
6. 在該資料夾內建立 `tech-spec/{count}-{task-name}`，使用以下範本：

```markdown
---
status: draft
user-story: ./user-story.md
---

## 技術方案

> 選擇的實作方向與理由

## 影響範圍

| 類型 | 路徑 |
|------|------|
| 新增 | |
| 修改 | |


## API / 資料格式變更

## 測試規劃

**Unit Test**（mock store，測 service 邏輯與錯誤處理）

| 測試項目 | 預期結果 |
|---------|---------|
| （edge case：重複、不存在、非法輸入等）| 拋出對應錯誤 |

**Integration Test**（真實 DB，測完整 Router → Service → Store 鏈）

| 測試項目 | 預期結果 |
|---------|---------|
| POST（正常）| 回傳 201 + 正確欄位，DB 有寫入 |
| GET（列表）| 回傳列表 |
| GET（單筆）| 回傳正確資料 |
| PATCH | 回傳更新後欄位，DB 已更新 |
| DELETE | 回傳 204，DB 查無該筆 |

## 注意事項 / Edge Cases
```

5. 根據 user-story 的需求，與使用者討論並填寫技術方案
