# vulcanshen.github.io

vulcan 的 app 推廣頁、支援頁與隱私權政策，用 GitHub Pages 發布：<https://vulcanshen.github.io/>

| App | 推廣頁 | 支援頁 | 隱私權政策 |
|---|---|---|---|
| Alphade | <https://vulcanshen.github.io/alphade/> | <https://vulcanshen.github.io/alphade/support/> | <https://vulcanshen.github.io/alphade/privacy/> |

App Store Connect 的「行銷網址」、「支援網址」與「隱私權政策網址」依序填該 app 的這三個網址；繁體中文的在地化欄位在網址後面加 `#zh-Hant`，打開會直接跳到中文段落。

## 結構

```
index.html            首頁：所有 app 的卡片
style.css             共用樣式
badges/               Apple 官方的下載徽章（第一個 app 上架時才加）
<app>/index.html      推廣頁
<app>/support/        支援頁（index.html）
<app>/privacy/        隱私權政策（index.html）
<app>/icon.png        頁首用的 icon（可再加 icon-dark.png）
<app>/screenshots/    推廣頁的截圖
```

純 HTML，不用 Jekyll（`.nojekyll`），本機開個靜態伺服器就能預覽，例如 `python3 -m http.server`。

## 加入一個 app

新增時複製 `alphade/` 資料夾改內容；它就是範例。

- **資料夾**：用小寫的 app 名稱，網址用資料夾，不出現 `.html`。
- **語言**：中英文寫在同一頁，分成 `<section id="en" lang="en">` 與 `<section id="zh-Hant" lang="zh-Hant">` 兩段，每段都要有 `lang`，中文才會用對字型。頁首放切換兩種語言的連結。
- **頁首**：icon、app 名稱、語言切換。每段開頭用 `.lead` 放一句話簡介，跟商店的副標題一致。
- **頁尾**：每段結尾放一組 `.section-links`（app 名稱連到推廣頁、支援、隱私權政策、所有 app），連結指向同一種語言的段落；最下面是 `© 年份 Vulcan Shen`。
- **推廣頁**：頁首跟其他頁一樣。每段依序是 `.lead` 一句話簡介、下載（`.download`）、功能、截圖（`.screenshots`）、系統需求，結尾一樣是 `.section-links`。
- **下載**：上架前寫「即將推出」，例如 `<p class="download">Coming soon to the App Store</p>` 與 `<p class="download">即將在 App Store 推出</p>`（Mac app 寫 Mac App Store）。上架當天換成 Apple 官方徽章：`<p class="download"><a href="商店網址"><img src="../badges/…" alt="Download on the App Store"></a></p>`。徽章從 Apple 的行銷資源下載對應語言的 SVG 放進 `badges/`，不要自己畫或改色。
- **截圖**：放在 `<app>/screenshots/`，縮小後再放，不要直接用商店的原圖。`<div class="screenshots">` 裡一張一個 `<img>`，都要寫 `alt`；中英文段落各放自己語言的截圖。直式的手機截圖一列會排好幾張；橫式的 Mac 截圖在 `.screenshots` 上設 `style="--shot-min: 100%"`，一張佔一列。
- **主色**：在 `<html>` 上設 `--accent-light`（淺色模式）與 `--accent-dark`（深色模式），首頁的卡片也一樣設在卡片上。
- **icon**：怎麼呈現由各 app 決定。macOS 的 icon 檔本身已經有形狀與陰影，直接放；iOS 的 icon 檔是滿版正方形，在頁面上設 `--icon-radius`（約 `22.37%`），要不要加邊框也自己決定。
- **警示**：需要醒目提醒時用 `<p class="notice">`。
- **聯絡方式**：各 app 自己填，例如 email，或這個 repo 的 issues（標題加 `[App 名稱]` 前綴）。
- **隱私權政策**：建議的章節順序是摘要、收集哪些資料、資料存在哪裡、第三方（例如 Apple 內購：購買、打賞）、兒童、政策變更、聯絡、最後更新日期。app 內也有政策的，以 app 內的版本為準，逐字一致，章節照 app 內的調整。政策改了，最後更新日期一起改。
- **首頁與上面的表格**：各加一行，在該 app 的分支加；表頭在 main。首頁卡片的 app 名稱連到推廣頁，下面的連結指向支援頁與隱私權政策。

## 注意

- 純 HTML 沒有共用的頁首頁尾，每頁各複製一份。改了版面要逐頁同步。
- 頁面跟著 app 一起公開：main 只放共用的骨架，每個 app 在自己的分支（例如 `alphade`、`helpknock`）做，從 main 開分支。App Review 會打開支援與隱私權政策網址，所以最晚在送審當天把該 app 的分支合併進 main 再推送。推送時只推 main，不要 `git push --all`。
- 推廣頁跟支援頁、隱私權政策放在同一個 app 分支，送審時一起公開，這時下載是「即將推出」；上架當天換上徽章與商店網址。
- 共用的東西（`style.css`、首頁版面、README 的表頭與這份說明）只在 main 改。app 分支要用到新的共用樣式時，把 main 合併進來（`git merge main`）。
