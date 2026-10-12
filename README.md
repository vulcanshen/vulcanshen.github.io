# vulcanshen.github.io

vulcan 的 app 推廣頁、支援頁與隱私權政策，用 GitHub Pages 發布：<https://vulcanshen.github.io/>

| App | 推廣頁 | 支援頁 | 隱私權政策 |
|---|---|---|---|
| HelpKnock | <https://vulcanshen.github.io/helpknock/> | <https://vulcanshen.github.io/helpknock/support/> | <https://vulcanshen.github.io/helpknock/privacy/> |

App Store Connect 的「行銷網址」、「支援網址」與「隱私權政策網址」依序填該 app 的這三個網址。繁體中文的在地化欄位：支援網址在後面加 `#zh-Hant`，打開會直接跳到中文段落；行銷網址填該 app 中文推廣頁的網址。

## 結構

```
index.html            首頁：所有 app 的卡片
style.css             首頁、支援頁、隱私權政策共用的樣式
template/             支援頁與隱私權政策的範本，新 app 從這裡複製
<app>/index.html      推廣頁（各 app 自己設計，樣式也放在 <app>/ 裡）
<app>/support/        支援頁（index.html）
<app>/privacy/        隱私權政策（index.html）
<app>/icon.png        頁首用的 icon（可再加 icon-dark.png）
```

純 HTML，不用 Jekyll（`.nojekyll`），本機開個靜態伺服器就能預覽，例如 `python3 -m http.server`。

## 加入一個 app

1. **支援頁與隱私權政策**：把 `template/support/`、`template/privacy/` 複製成 `<app>/support/`、`<app>/privacy/`，把 `{{…}}` 換掉、照註解填內容，最後刪掉註解。這兩頁每個 app 都長一樣，只換內容，不改版面與樣式。
2. **推廣頁**：`<app>/index.html` 依該 app 的特性與受眾自己設計，版面、文案、樣式、中英文怎麼分都由各 app 決定，不跟其他 app 統一。樣式放在該 app 的資料夾裡（例如 `alphade/promo.css`），不要加進共用的 `style.css`。
3. **icon**：放 `<app>/icon.png`，有深色版就再放 `icon-dark.png`。
4. **首頁與上面的表格**：各加一行，在該 app 的分支加；表頭在 main。首頁卡片的 app 名稱連到推廣頁，下面的連結指向支援頁與隱私權政策。

## 支援頁與隱私權政策的規則

`template/` 已經照下面的規則做好。要改規則時，`template/`、`style.css` 和這裡一起改，再通知各 app 跟著改。

- **資料夾**：用小寫的 app 名稱，網址用資料夾，不出現 `.html`。
- **語言**：中英文寫在同一頁，分成 `<section id="en" lang="en">` 與 `<section id="zh-Hant" lang="zh-Hant">` 兩段，每段都要有 `lang`，中文才會用對字型。頁首放切換兩種語言的連結。
- **頁首**：icon、app 名稱、語言切換。
- **支援頁**：`h2` 是「Support／支援」，接著 `.lead` 放商店的副標題，需要時放 `.notice`。之後依序是這些 `h3`：聯絡、開始使用（步驟用 `<ol>`）、該 app 自己的問答（每題一個 `h3`）、隱私（一兩句，連到隱私權政策）、系統需求。
- **隱私權政策**：`h2` 是「Privacy Policy／隱私權政策」，接著 `.meta` 放最後更新日期（`Last updated: October 12, 2026`／`最後更新：2026 年 10 月 12 日`），再來 `.lead` 用一句話摘要這份政策。
  - 章節依序是：收集哪些資料、資料存在哪裡、第三方（例如 Apple 內購：購買、打賞）、兒童、政策變更、聯絡，每一節都要有。該 app 特有的章節（例如藍牙送出什麼、權限）插在「第三方」之前。
  - app 內也有政策的，兩邊逐字一致：照這裡的章節寫，app 內的版本跟著改。政策改了，最後更新日期一起改。
- **聯絡方式**：每個 app 都一樣，先放這個 repo 的 issues，再放 email（`vulcan.shen.2304@gmail.com`）給沒有 GitHub 帳號的人；issue 標題與 email 主旨都預先帶 `[App 名稱]`。文字照範本，支援頁可以再加一句請對方附上哪些資訊。隱私權政策的「聯絡」用同一組。
- **頁尾**：每段結尾放一組 `.section-links`（app 名稱連到推廣頁、支援、隱私權政策、所有 app），連結指向同一種語言的段落；最下面是 `© 年份 Vulcan Shen`。
- **主色**：在 `<html>` 上設 `--accent-light`（淺色模式）與 `--accent-dark`（深色模式），首頁的卡片也一樣設在卡片上。
- **icon**：macOS 的 icon 檔本身已經有形狀與陰影，直接放；iOS 的 icon 檔是滿版正方形，在 `<html>` 上設 `--icon-radius`（約 `22.37%`）。
- **警示**：需要醒目提醒時用 `<p class="notice">`。

## 注意

- 純 HTML 沒有共用的頁首頁尾，每頁各複製一份。改了版面要逐頁同步。
- 頁面跟著 app 一起公開：main 只放共用的骨架，每個 app 在自己的分支（例如 `alphade`、`helpknock`）做，從 main 開分支。App Review 會打開支援與隱私權政策網址，所以最晚在送審當天把該 app 的分支合併進 main 再推送。推送時只推 main，不要 `git push --all`。
- 推廣頁跟支援頁、隱私權政策放在同一個 app 分支，送審時一起公開。上架前還沒有商店連結，下載的地方不要放點了沒反應的按鈕；上架當天再換上 Apple 官方徽章與商店網址。
- 共用的東西（`style.css`、首頁版面、README 的表頭與這份說明）只在 main 改。app 分支要用到新的共用樣式時，把 main 合併進來（`git merge main`）。
