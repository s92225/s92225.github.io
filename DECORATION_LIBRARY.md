# Candy Jelly 裝飾圖庫 v1

玩家預覽：`http://127.0.0.1:4173/#decorations`

## 檔案

- 圖像：`public/assets/decoration-library-v1.png`
- 座標清單：`public/assets/decoration-library-v1.json`
- 網頁 helper：`src/decorations.js`

圖像是一張透明 4 × 4 sprite sheet，共 16 件互不重疊的裝飾。CSS class 由 `deco-bear-wave`、`deco-penguin-cheer` 等名稱選取格子；關卡地圖現已把角色、糖果、星星、雲、路牌與花邊散佈在路線、關卡卡片及終點。

## 分類

- 角色：桃桃熊揮手、薄荷企鵝打氣、桃桃熊探頭、薄荷企鵝睡雲。
- 糖果：金色星星、紫色啫喱、包裝糖、蜜桃心。
- 場景：紫雲、糖果彩虹、星光、薄荷葉。
- 框飾：紫色蝴蝶結、糖果路牌、啫喱氣球、糖果花邊。

## 生成紀錄

使用 Codex 內置 ImageGen，以現有 `mascots.png` 作角色及材質參考。最終 prompt：

> Use case: stylized-concept. Asset type: reusable transparent sprite sheet for a mobile game's decoration library. Create one polished 4 by 4 sprite sheet containing 16 separate Candy Jelly decorations, each centered in an equal square cell with generous clear padding and no overlap. Row 1: peach-pink gummy bear waving, mint-teal gummy penguin cheering, peach gummy bear peeking over an invisible edge, mint gummy penguin sleeping on a tiny cloud. Row 2: golden translucent star candy, lavender jelly orb cluster, pastel wrapped candy, glossy peach heart. Row 3: soft lavender cloud, peach-mint rainbow arch, three-star sparkle cluster, mint jelly leaf plant. Row 4: glossy lavender bow, candy-land signpost with no writing, pastel balloon cluster, scalloped candy ribbon flourish. The supplied Candy Jelly mascot image is the character and material reference; preserve the bear and penguin identities, their proportions, faces, translucent glossy gummy material, black bead eyes, blush, pastel peach/mint/lavender/gold palette, and soft studio highlights. Genuinely transparent background; no platform and no shadows extending into adjacent cells. Cute premium 3D gummy toy render. Exact orthographic 4x4 grid, one isolated decoration per cell, consistent scale, no cropping. No text, letters, numbers, logos, watermark, grid lines, border, extra characters; every cell visually separable for CSS sprite cropping.
