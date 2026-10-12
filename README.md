# vulcanshen.github.io

vulcan 的 app 支援頁與隱私權政策，用 GitHub Pages 發布：<https://vulcanshen.github.io/>

| App | 支援頁 | 隱私權政策 |
|---|---|---|
| HelpKnock | <https://vulcanshen.github.io/helpknock/support/> | <https://vulcanshen.github.io/helpknock/privacy/> |

App Store Connect 的「支援網址」與「隱私權政策網址」填該 app 的這兩個網址；繁體中文的在地化欄位在網址後面加 `#zh-Hant`，打開會直接跳到中文段落。

## 結構

```
index.html          首頁：所有 app 的卡片
style.css           共用樣式
<app>/index.html    支援頁
<app>/privacy/      隱私權政策（index.html）
<app>/icon.png      頁首用的 icon（可再加 icon-dark.png）
```

純 HTML，不用 Jekyll（`.nojekyll`），本機開個靜態伺服器就能預覽，例如 `python3 -m http.server`。

## 加入一個 app

新增時複製 `alphade/` 資料夾改內容；它就是範例。

- **資料夾**：用小寫的 app 名稱，網址用資料夾，不出現 `.html`。
- **語言**：中英文寫在同一頁，分成 `<section id="en" lang="en">` 與 `<section id="zh-Hant" lang="zh-Hant">` 兩段，每段都要有 `lang`，中文才會用對字型。頁首放切換兩種語言的連結。
- **頁首**：icon、app 名稱、語言切換。每段開頭用 `.lead` 放一句話簡介，跟商店的副標題一致。
- **頁尾**：每段結尾放一組 `.section-links`（支援、隱私權政策、所有 app），連結指向同一種語言的段落；最下面是 `© 年份 Vulcan Shen`。
- **主色**：在 `<html>` 上設 `--accent-light`（淺色模式）與 `--accent-dark`（深色模式），首頁的卡片也一樣設在卡片上。
- **icon**：怎麼呈現由各 app 決定。macOS 的 icon 檔本身已經有形狀與陰影，直接放；iOS 的 icon 檔是滿版正方形，在頁面上設 `--icon-radius`（約 `22.37%`），要不要加邊框也自己決定。
- **警示**：需要醒目提醒時用 `<p class="notice">`。
- **聯絡方式**：各 app 自己填，例如 email，或這個 repo 的 issues（標題加 `[App 名稱]` 前綴）。
- **隱私權政策**：建議的章節順序是摘要、收集哪些資料、資料存在哪裡、第三方（例如 Apple 內購：購買、打賞）、兒童、政策變更、聯絡、最後更新日期。app 內也有政策的，以 app 內的版本為準，逐字一致，章節照 app 內的調整。政策改了，最後更新日期一起改。
- **首頁與上面的表格**：各加一行。app 的頁面要公開時才加。

## 注意

- 純 HTML 沒有共用的頁首頁尾，每頁各複製一份。改了版面要逐頁同步。
- 頁面跟著 app 一起公開：main 只放共用的骨架，每個 app 在自己的分支（例如 `alphade`、`helpknock`）做，從 main 開分支。App Review 會打開支援與隱私權政策網址，所以最晚在送審當天把該 app 的分支合併進 main 再推送。推送時只推 main，不要 `git push --all`。
