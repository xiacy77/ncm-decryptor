# 星光所至 · 一周年纪念页

一个纯静态的沉浸式一周年纪念网站，使用 **Vite + Vue 3** 构建。

开场是水彩星空与九颗时光星子：自动缓慢逐颗亮起，也可以滚轮 / 拖动回看；九颗齐了会闪烁、定格，
点「继续」后，藏在星空里的日期先亮一下再隐去，随后地球、行星轨道、会说话的漂浮音符和逐句欢迎语依次出现。
之后进入会昼夜切换的花海，有爱情树、中央计时器、花间小窗、相册、一周年照片卡、日记、四款小游戏和信件。

所有摄像头与手势能力都在浏览器本地完成，没有后端。

- 九颗星子：自动慢播 + 流星接力 + 逐星运镜 + 远近景视差 + 手动回看
- 九星闪烁定格、继续按钮、隐藏日期预览，之后再出现地球
- 星空新增水彩星云、淡淡星座、流星、九星轨道和欢迎分隔花线
- 交互地球：鼠标拖动 / 方向键旋转，标出中国和成都、重庆、自贡、贵阳、安顺；透明行星轨道依次展开
- 会说话的漂浮音符在屏幕四周均匀分布，并逐个进场
- 进入花海后自动关闭手势摄像头，只在拍照时重新申请
- 恋爱计时器与下方花间小窗更大，中央覆盖在白天爱情树上；计时器有细金花饰
- 花海新增玫瑰藤蔓、小蝴蝶、柔光和更丰富的花丛层次
- 右上角白天 / 黑夜切换；黑夜有萤火虫、月亮和星空
- 四个场景 BGM：星空 / 花海 / 信件 / 烟花，换歌时交叉淡化，同曲不重播
- 花间小窗：相册 / 一周年专区 / 日记 / 耍起嘛 / 信
- 四款不直接剧透主题的小游戏：数字花园、元素图鉴、十道小题、故事花园
- 信件可返回花田；庆祝按钮进入全屏烟花页，烟花页可再打开纪念卡
- 蓝毛小女仆（DSH pet）桌面宠物形象，支持拖拽、点击说话和透明待机动画
- 桌面浏览器和手机屏幕都做了自适应；大屏更丰富，小屏自动精简点缀
- 没有摄像头也能完整走完所有剧情

---

## 1. 快速开始

环境要求：Node.js **>= 18.18**。

```bash
npm install
npm run dev
```

摄像头 API 需要安全环境：`localhost` 或 HTTPS。直接双击 `index.html`
（`file://`）无法加载 Vite 模块和摄像头，请使用本地开发服务器。

```bash
npm run dev              # 本地开发
npm run build            # 生成 dist/
npm run preview          # 预览 dist
npm run sync:mediapipe   # 只重新复制 MediaPipe 运行文件
```

`vite.config.js` 固定使用 `base: './'`，同一份 `dist` 可以放在域名根目录、
GitHub Pages 仓库子路径或秒哒静态目录。

---

## 2. 项目结构

```text
.
├─ index.html
├─ vite.config.js
├─ scripts/
│  └─ sync-mediapipe.mjs          # 复制本地 MediaPipe 运行文件
├─ public/
│  ├─ assets/
│  │  ├─ audio/                   # 分场景 BGM（mp3）/ chime.wav
│  │  ├─ album/                   # 相册占位照片
│  │  ├─ celebrate/               # 可选的庆祝页照片
│  │  ├─ pet/                     # 蓝毛小女仆透明待机动画 + 授权
│  │  └─ README.md
│  └─ mediapipe/                  # 构建时生成，不提交 Git
├─ src/
│  ├─ assets/geo/                 # Natural Earth 世界陆地 + 中国边界
│  ├─ config/
│  │  ├─ story.js                 # ★ 文案 / 时长 / 城市 / 菜单 / 日记 / 游戏 / 音乐
│  │  └─ gesture.js               # ★ 手势阈值与模型参数
│  ├─ composables/
│  │  ├─ useHandGestures.js
│  │  ├─ useAudioManager.js       # 分场景 BGM + 双通道交叉淡化
│  │  └─ useTypewriter.js
│  ├─ components/
│  │  ├─ StarfieldScene.vue       # 第一幕星空
│  │  ├─ CelestialDecor.vue       # 星云 / 星座 / 流星 / 星空轨道
│  │  ├─ MemoryTimeline.vue       # 九颗星子的流星接力与视差运镜
│  │  ├─ EarthJourney.vue         # 可拖动地球 / 中国 / 城市
│  │  ├─ StarWhispers.vue         # 会说话的漂浮音符
│  │  ├─ StarlightTransition.vue  # 星光隧道转场
│  │  ├─ HandCursor.vue           # 第一幕手势位置可视化
│  │  ├─ FlowerSeaScene.vue       # 第二幕花海 / 昼夜场景
│  │  ├─ LoveTree.vue             # 白天的水彩爱情树
│  │  ├─ FlowerDecor.vue          # 玫瑰藤蔓 / 小蝴蝶
│  │  ├─ CuteAlien.vue            # 蓝毛小女仆（可拖拽桌宠形象）
│  │  ├─ MemoryMenu.vue           # 花间小窗
│  │  ├─ TogetherTimer.vue        # 中央恋爱计时器
│  │  ├─ AlbumModal.vue           # 相册
│  │  ├─ FireworkScene.vue        # 庆祝按钮进入的烟花页
│  │  ├─ CelebrationScene.vue     # 一周年照片卡
│  │  ├─ DiaryModal.vue           # 日记专区
│  │  ├─ PlayZone.vue             # 游戏专区
│  │  ├─ HeartMathGame.vue        # 数字花园
│  │  ├─ ElementLoveGame.vue      # 元素图鉴
│  │  ├─ QuizGame.vue             # 十道小题
│  │  ├─ StoryGardenGame.vue      # 故事花园（情诗 / 散文 / 童话）
│  │  ├─ LetterScene.vue          # 蒲公英 / 信封 / 信纸
│  │  ├─ PhotoCaptureModal.vue    # 拍照 / 上传 / 预览
│  │  └─ ...                      # 花海、水彩等视觉组件
│  ├─ utils/
│  │  ├─ gestures.js
│  │  ├─ starText.js
│  │  ├─ downloadCelebrationCard.js
│  │  └─ math.js
│  ├─ styles/base.css
│  ├─ App.vue
│  └─ main.js
└─ .github/workflows/deploy.yml
```

---

## 3. 开场：流星接力与地球

### 时间线

| 时间 | 内容 |
| --- | --- |
| 0–3.4s | 星光缓慢亮起；`2025.11.1` 藏在星光中 |
| 3.4–6s | 星光汇聚，彗星与星环 |
| 6–6.85s | 散成两道流星雨 |
| 6.85–9.2s | 星际隧道 |
| 9.2s 起 | 九颗星子自动缓慢逐颗亮起，每颗约 2.5s |
| 自动播放中 | 鼠标滚轮 / 左右拖动可以回看；「回看上一颗」按钮也会临时暂停自动播放 |
| 九颗齐了 | 镜头拉回全景，九颗星闪烁几下，定格，出现「继续」 |
| 点继续 | 星空里的 `2025.11.1` 先亮约 2.2s，再隐藏 |
| 约 2.85s 后 | 地球登场，透明行星轨道按顺序展开 |
| 地球后约 1s | 会说话的漂浮音符从四周逐个进场 |
| 地球后约 4.55s | 「宿主，欢迎您的到来」逐句淡入 |
| 欢迎语后约 3.6s | 出现进入下一幕的按钮 |

九颗星子默认**自动慢播**；滚轮 / 拖动 / 「回看上一颗」会暂停自动播放 6 秒，然后继续。
第一下点击 / 触摸 / 按键也会同时尝试启动第一幕 BGM。
想改自动间隔，调 `TIMING.starIntro.memoryAutoStep`；想换流星方向，
调 `MemoryTimeline.vue` 的 `entryVectors`。

### 九星定格、隐藏日期与探索

- 九颗齐了之后先闪烁 3 次，然后停在画面上，不会直接跳走。
- 「继续」按钮在 `MemoryTimeline` 里，点完才交棒给 `StarfieldScene`。
- 日期 `2025.11.1` 在九星阶段是隐藏的；点继续后会先完整亮一次，再隐去。
- 之后把掌心 / 鼠标移到星空顶部日期原来的位置，它会再次出现；握拳靠近还会有星光回应。
- 日期显示逻辑在 `StarfieldScene.vue` 的 `showHiddenDate()` 与 `drawDate()`。

### 地球、轨道、漂浮音符与欢迎语

- 地球比之前更大；行星轨道是四条半透明椭圆，分别延迟约 0.28 / 0.86 / 1.46 / 2.02s 出现。
- 会说话的漂浮音符在屏幕四周均匀排布，不再堆在地球中心；每个延迟 0.18s 依次进场。
- 欢迎文案拆成四行：欢迎语、副标题、手势提示、悄悄话提示，分别延迟淡入，不会一次全出现。
- 点击音符 / 用掌心碰音符会弹出悄悄话；日期附近也会重新亮起隐藏日期。

九颗星子：

| # | 星子 | 时间 |
| --- | --- | --- |
| 1 | 初识 | 2025年9月26日 |
| 2 | 见面 | 2025年10月8日 |
| 3 | 正式表白 | 2025年11月1日 |
| 4 | 自贡之旅 | 2025年11月21日 |
| 5 | 跨年 | 2025年12月31日 |
| 6 | 200天纪念日 | 2026年5月20日 |
| 7 | 成都之旅 | 2026年七月初 |
| 8 | 贵阳重庆之旅 | 2026年10月国庆 |
| 9 | 此刻 | just now |

- 每颗星子从不同方向拖着一小段流星尾迹飞入，镜头同时向它靠近。
- 星图前后各有一层视差星尘：远景移动慢，近景移动快，让运镜有层次。
- 全景点会在最后拉远，不会一上来就把所有节点摊平。
- 自动播放期间仍可以回看；九星全部出现后才进入闪烁 / 定格 / 继续。

### 地球

- 使用 `d3-geo` 的正交投影 + Natural Earth 110m 陆地/中国边界，在浏览器本地绘制。
- **鼠标拖动 / 手指拖动** 可以旋转地球，**方向键**也可以小幅旋转。
- 中国区域用暖金色高亮，并标注「中国」。
- 成都、重庆、自贡、贵阳、安顺五座城市会显示在地球上；旋转到背面时会隐藏。
- 打开时自动把中国转到正面。
- 这个地球比上一版更大，并保留了水彩感的柔光、外圈与星尘。
- 数据来源：Natural Earth（public domain），不需要联网。

### 第一幕手势

| 手势 | 效果 | 无摄像头替代 |
| --- | --- | --- |
| 🖐 张开手掌 | 星光追随掌心 | 鼠标 / 触屏 |
| ✊ 握拳 | 掌心聚成光球；对准日期有反馈 | 左侧「星光手势」→ 握拳 |
| 👍 点赞 | 小簇彩星烟花 | 「星光手势」→ 烟花 |
| 👌 OK | 爱心星光炸开 | 「星光手势」→ 心动 |
| 🤟 爱你 | 爱心星雨 | 「星光手势」→ 爱你 |
| 🫶 十指相扣 | 静谧模式 | 「星光手势」→ 静谧 |
| ✌️ 剪刀手 | 进入花海 | 「也可以点这里开启下一幕」 |

漂浮音符 / 爱心被掌心或鼠标碰到时会弹出悄悄话，内容在 `WHISPERS`。

---

## 4. 花海：昼夜、爱情树与中央计时器

### 进入花海后关闭摄像头

- 第一幕手势结束后，在切到花海的同时调用 `gesture.stop()`，关闭 MediaPipe 和摄像头轨道。
- 花海主页面、相册、日记、小游戏都不再运行摄像头，性能更好。
- 只有打开「一周年专区」并选择拍照时，`PhotoCaptureModal` 才会重新请求摄像头。
- 也可以从相册上传，不授权摄像头也能拍照位。

### 中央恋爱计时器

页面正中央、白天爱情树上方显示：

```text
♥ 在一起
361 天
23:55:08
```

- 起点：`2025-11-01 00:00:00`（`TOGETHER_SINCE`）
- 天数、小时、分钟、秒随系统时间跳动
- 想修改起点：`src/config/story.js` 的 `TOGETHER_SINCE`
- 计时器在相册 / 日记 / 游戏 / 信件全屏页中会自动隐藏，回到花海再出现
- 这一版把计时器放大了（桌面约 440px 宽，手机约 310px），下方花间小窗也同步放大

### 白天 / 黑夜

右上角有主题按钮：

- **白天**：蓝色天空、太阳、云、白色水彩爱情树；计时器正好覆盖在树冠上。
- **黑夜**：更深的蓝紫夜空、月亮、星星、萤火虫；爱情树隐藏，计时器变成深色玻璃。
- 默认是白天；想默认黑夜，改 `src/config/story.js` 的 `FLOWER_DEFAULT_MODE = 'night'`。
- 昼夜切换有 1.8s 的淡入淡出，不会硬切。
- 爱情树在 `LoveTree.vue`，用模糊、半透明白色模板绘制；想更清晰可以改
  `.love-tree.is-visible` 的 opacity 或 SVG 的 `feGaussianBlur`。

### 蓝毛小女仆（DSH pet）

- 花海左下角换成了 **蓝毛小女仆 / Blue-Haired Little Maid** 的透明桌面宠物形象：
  蓝色长发、白色女仆头饰、深蓝女仆裙、白色围裙和蓝色小鲸鱼徽章。
- 使用透明动画 WebP 待机（呼吸 / 轻微动作），PNG 作为回退；颜色柔和处理，
  叠加了淡淡的柔光和投影，融入花海水彩。
- 可以**鼠标 / 手指拖动**到花海任意位置；拖拽后位置会保留在当前页面。
- 点一下或拖拽结束后点一下会弹出可爱台词。
- 台词在 `src/config/story.js` 的 `ALIEN_LINES`，已追加你给的五条。
- 素材来自 MIT 开源的 `cute-fat-fish-pet` / `@tuweizhi/dsh-pet`，详见
  `public/assets/pet/README.md` 与 `public/assets/pet/LICENSE.txt`。

### 花间小窗

对话从「还记得吗....」开始。打字结束后，底部浮出「花间小窗」：

1. **相册**：左右分页，关闭后可再次打开。
2. **一周年专区**：拍照 / 上传 / 预览 / 保存纪念卡。
3. **日记**：日期 + 内容格式的日记本，可预填，也可在页面里写。
4. **耍起嘛**：四款小游戏。
5. **信**：进入蒲公英与信封的结尾。

「花间小窗」可以收起成小按钮，再重新展开。

---

## 5. 小游戏

这一版去掉了「花海接光点」，也不再用手势玩游戏。四款游戏都不需要摄像头。

入口不写游戏介绍，名字也做得比较普通：

| 名字 | 内容 | 结果 |
| --- | --- | --- |
| 数字花园 | 每局从多组算式里随机抽一组，依次算 3 个答案 | 13、14、520 → **1314520** |
| 元素图鉴 | 每局随机抽 6 个元素，Mg / Zn 一定出现 | 拼出「你的镁偷走了我的锌」 |
| 十道小题 | 从题库随机抽 10 道，每题 10 分 | 总分 / 100，按分数给不同卡片与话 |
| 故事花园 | 六篇情诗 / 散文 / 童话摘录，逐篇翻开 | 读完六篇给一段结尾与随机情话 |

### 数字花园

- 配置在 `MINI_GAMES.math.sets`，每一组都是 13、14、520。
- 想换题，只改每组的 `expression`、`answer`、`hint`，答案保持 13、14、520。
- 三个答案拼起来是 `1314520`。
- 每次进入或点「再来一次」都会随机换一组题。

### 元素图鉴

- 配置在 `MINI_GAMES.chemistry.pairs`。
- 每局随机抽 6 个元素，带 `always: true` 的 Mg / Zn 一定会出现。
- 符号和中文名会重新打乱。
- 全部配对后会显示情话。

### 十道小题

- 配置在 `MINI_GAMES.quiz.questions`，目前有 12 道样例题，每局随机抽 10 道。
- 每题 10 分，总分 100。
- 题目、选项和正确答案都是框架示例，**请按你们的真实情况修改**。
- 分数对应 4 档结果卡片：满分默契 / 很懂我呀 / 还在靠近 / 以后再告诉你。
- 每档有不同颜色、标题和话语，并额外从 `LOVE_NOTES` 随机抽一句情话。
- 想增加题目，继续往 `questions` 里加即可；想固定 10 道，把多余题目删掉。

### 故事花园

- 配置在 `MINI_GAMES.story.items`，目前是 6 篇：《关雎》《致橡树》《一棵开花的树》《小王子》《小美人鱼》《睡美人》。
- 每张卡片显示类型、篇名、作者；点开后是摘录与一句短评，点「收下这段」记为已读。
- 六篇读完出现结尾卡片，并从 `LOVE_NOTES` 随机抽一句情话。
- 想增删篇章，继续往 `items` 里加对象：`kind / title / author / excerpt / note`。
- 摘录都是短句；如果用于公开部署，请确认相应译本 / 文本的使用授权。

### 情话模板

`LOVE_NOTES` 内置了 14 句情话，数字花园与元素图鉴完成时会随机抽一句。
想增加模板，直接往数组里加字符串。

---

## 6. 相册、信件、烟花与庆祝页

### 相册

- 从花间小窗进入，左右分页，左侧「我」、右侧「你」。
- 点击合上后回到花海，不再自动进入信件；可以再次打开。
- 照片路径在 `ALBUM.spreads`。

### 信件

- 从花间小窗点「信」进入。
- 左上角新增 **返回花田**，随时可以回到花海小窗。
- 返回后 BGM 会从 letter 场景切回 bloom 场景（同一首歌只把音量柔和调回去，不重播），花海重新回到未放大的状态。
- 轻触信封拆开，逐字显示信件。
- 这一版把信件字号调小了（桌面约 22px，手机约 15px），信纸更精致：
  信封与信纸边缘加了玫瑰、藤蔓与细金线，拆开时纸面会展开并浮起一层柔光。
- 信纸文字下方有圆形「庆祝」按钮。
- 点击「庆祝」不再直接打开照片卡，而是进入全屏烟花页 `FireworkScene.vue`；音乐同时切到 fireworks 场景。
- 烟花页有 1.3 秒淡入；黑色夜空、粉色 / 红金烟花、点击任意处追加烟花。
- 烟花页顶部是「恋爱一周年 / ONE YEAR OF LOVE」，中间是祝福语，文案在
  `FIREWORKS` 里；当前使用你改过的「这一年温柔落幕，下一段旅途，我们一起出发」。
- 底部「返回首页」回到花海；「纪念卡」可以继续打开原来的一周年照片卡。
- 进入烟花页会从 letter 场景交叉淡化到 `fireworks` 场景的专属 BGM；右上角音乐按钮可以播放 / 暂停。
- 文字结束后停留 3 秒，小爱心铺满屏幕。

### 烟花庆祝页

- 背景是纯黑画布，烟花由 `FireworkScene.vue` 内部 Canvas 实时绘制，没有额外依赖。
- 每 0.3 秒左右自动升空一枚，并随机出现四连发；点击画面会在点击位置放一朵。
- 页面是 Vue 全屏层，不是跳转到独立 HTML，所以不会丢失当前花海 / 信件状态。
- 烟花页的「纪念卡」会打开 `CelebrationScene`，照片卡关闭后回到烟花页。
- 想改文案 / 按钮：`FIREWORKS`；想改烟花颜色 / 密度：`FireworkScene.vue` 的
  `colors`、`spawnTimer > 18` 和 `Math.random() < 0.015`。

### 一周年专区

- 中间爱心，左右各一张 9:16 竖版照片卡槽。
- 点击卡槽：前置摄像头拍照，或从系统相册上传。
- 支持保存、取消、重拍、重新上传。
- 右下角显示系统年月日。
- 两张照片都有后，可以保存整张纪念卡 PNG。
- 照片可以现场拍，也可以预置在 `CELEBRATION.leftPhoto` / `rightPhoto`。

---

## 7. 日记

- 初始内容为空；`DIARY_ENTRIES` 可以预填。
- 格式固定为：

```js
{ date: '2026-10-28', content: '今天发生了什么，慢慢写下来。' }
```

- 页面里可以点「写下这一页」，填写日期与内容，自动保存在浏览器 `localStorage`。
- 按日期倒序显示，每条都是「日期 + 内容」。
- 数据不上传。

---

## 8. 配置索引

全部在 `src/config/story.js`：

| 配置 | 用途 |
| --- | --- |
| `TOGETHER_SINCE` | 恋爱计时起点 |
| `FLOWER_DEFAULT_MODE` | 花海默认白天 / 黑夜 |
| `MEMORY_NODES` | 九颗星子的事件与日期 |
| `JOURNEY_CITIES` | 地球城市名称与经纬度 |
| `LOVE_NOTES` | 游戏结束时的情话模板 |
| `ALIEN_LINES` | 蓝毛小女仆的台词 |
| `FIREWORKS` | 烟花页标题、祝福语、按钮与音乐文案 |
| `AUDIO.sceneBgm` | 各场景 BGM 文件、音量、可选淡入淡出时长 |
| `BGM_SCENES` | 区域 → 场景 BGM 的映射 |
| `MINI_GAMES.math` | 数字花园题库与结果 |
| `MINI_GAMES.chemistry` | 元素图鉴元素池 |
| `MINI_GAMES.quiz` | 十道小题题库、分值、结果档位 |
| `MINI_GAMES.story` | 故事花园的六篇摘录与结尾 |
| `DIARY_ENTRIES` | 日记预填内容 |
| `MENU_ITEMS` | 花间小窗按钮 |
| `TIMING.starIntro` | 开场、流星接力、地球、欢迎文案节奏 |
| `TIMING.bloom` | 花海对话与菜单出现节奏 |
| `PALETTE` | 全局主色 |

`src/config/gesture.js` 控制手势阈值和模型参数。

---

## 9. 素材替换

### 音乐 / 场景 BGM

当前已经拆成四个场景，互相对应对白 / 区域：

| 场景 key | 播放区域 | 文件 | 音量 |
| --- | --- | --- | --- |
| `stars` | 第一幕星空、九颗星子、地球与欢迎 | `李荣浩 - 不将就.mp3` | 0.42 |
| `bloom` | 花海、相册、日记、游戏、一周年专区 | `方大同 - 特别的人.mp3` | 0.42 |
| `letter` | 信件与信封 | 同一首《特别的人》 | 0.35 |
| `fireworks` | 庆祝按钮进入的烟花页 | `郭一凡 - 有我呢.mp3` | 0.45 |

播放逻辑：

- 页面打开约 **3 秒**后会自动尝试启动 BGM 并渐入，默认先播 `stars`。
  浏览器如果拦截自动播放，会转为“待播放 / 点此播放”，第一次点击 / 触摸 / 按键会重试。
- 3 秒对应 `TIMING.audio.initialStartDelay`；渐入时长是 `TIMING.audio.fadeIn`（3000ms）。
- 进入花海时，`stars` 与 `bloom` 两首歌交叉淡化约 **1.8 秒**。
- 花海 → 信件：因为用的是同一首《特别的人》，**不会从头重播**，只把音量从 0.42 柔和降到 0.35。
- 信件 → 烟花：`letter` 淡出，`fireworks` 淡入。
- 烟花 → 返回花海：`fireworks` 淡出，`bloom` 从上次暂停的位置继续。
- 同一首歌切换场景不重播；不同歌曲使用两个 Audio 通道交叉淡化；静音按钮使用淡出，不会硬切。
- 淡化时长默认是 `TIMING.audio.sceneFade`（1800ms），也可以给某个场景单独写 `fade` 覆盖。

### 自由添加音乐 / 划分新区域

可以，不需要改 `useAudioManager.js`，只要按下面四层布局改：

```text
① AUDIO.sceneBgm        →  歌曲数据（key、文件、音量、可选 fade）
② BGM_SCENES            →  区域到场景 key 的映射
③ App.vue               →  在进入 / 离开区域时 setScene / startScene
④ 任意组件              →  需要时 inject(AUDIO_KEY) 手动切歌
```

#### 1. 放文件

把 mp3 / wav / ogg 放进 `public/assets/audio/`。建议：

- 128–192 kbps 的 mp3 就够，手机加载更快；
- 文件名避免特殊符号；中文名可以用，但部署后要注意 URL 编码；
- 不要把 200 MB 以上的无损文件直接放进 `public/`，它会原样进入 dist。

#### 2. 加场景数据

在 `AUDIO.sceneBgm` 里加一个新 key，例如给相册单独一首歌：

```js
export const AUDIO = {
  chime: 'assets/audio/chime.wav',
  sceneBgm: {
    stars: { src: 'assets/audio/李荣浩 - 不将就.mp3', volume: 0.42 },
    bloom: { src: 'assets/audio/方大同 - 特别的人.mp3', volume: 0.42 },
    letter: { src: 'assets/audio/方大同 - 特别的人.mp3', volume: 0.35 },
    fireworks: { src: 'assets/audio/郭一凡 - 有我呢.mp3', volume: 0.45 },

    // 新场景：key 自己取，src / volume 必填，fade 可选
    album: {
      src: 'assets/audio/林俊杰 - 将故事写成我们.mp3',
      volume: 0.38,
      fade: 1600,
    },
  },
}
```

`story.js` 里已经留了这段 `album` 的注释示例；如果用林俊杰那首 216 MB 的文件，建议先压缩到 128–192 kbps 再上线。

#### 3. 把区域指过去

在 `BGM_SCENES` 里把对应区域从默认的 `bloom` 改成新 key：

```js
export const BGM_SCENES = {
  stars: 'stars',
  bloom: 'bloom',
  letter: 'letter',
  fireworks: 'fireworks',

  album: 'album',       // ← 相册现在用 album 场景
  anniversary: 'bloom', // 其他区域仍复用 bloom
  diary: 'bloom',
  play: 'bloom',
}
```

默认情况下 `album` / `anniversary` / `diary` / `play` 都映射到 `bloom`，所以不改它们也不会影响现有页面。

#### 4. 新区域如何触发

- **已经是花间小窗里的区域**（相册 / 一周年专区 / 日记 / 耍起嘛）：
  `App.vue` 的 `handlePanel()` 会自动读 `BGM_SCENES[id]` 并调用 `audio.startScene()`；
  关闭时 `closePanel()` 会切回 `BGM_SCENES.bloom`。你只要改第 2、3 步即可。
- **全新弹窗 / 新页面**：在组件里注入音频管理器，然后自己调用：

```js
import { inject } from 'vue'
import { AUDIO_KEY } from '@/keys'
import { BGM_SCENES } from '@/config/story'

const audio = inject(AUDIO_KEY, null)

// 进入新区域
audio?.startScene('album')

// 离开新区域
audio?.setScene(BGM_SCENES.bloom)
```

`startScene()` 会确保音乐已经启动；`setScene()` 只切场景，不主动开始播放，适合关闭 / 回退时使用。

#### 代码布局

| 位置 | 作用 |
| --- | --- |
| `AUDIO.sceneBgm` | 所有歌名、音量、可选淡入淡出，集中在这里 |
| `BGM_SCENES` | 区域到场景的映射，避免在页面里散落写字符串 |
| `useAudioManager.js` | 双通道、交叉淡化、同曲续播、静音、自动播放失败重试 |
| `App.vue` | 花海 / 信件 / 烟花 / 相册等区域的切换时机 |
| 任意组件 + `AUDIO_KEY` | 新增弹窗、独立页面时局部切歌 |

支持 mp3 / wav / ogg；替换前请确认版权。

### 相册照片与增加页数

相册数据在 `src/config/story.js` 的 `ALBUM.spreads`：

- **一个 spread 就是相册的一页**，左右两张照片；
- 数组顺序就是翻页顺序；
- 总页数、页码、上一页 / 下一页、圆点导航都由 `AlbumModal.vue` 自动计算，**不需要改组件**。

#### 替换照片

1. 把照片放进 `public/assets/album/`，例如 `my-04.jpg`、`you-04.jpg`；
2. 找到要替换的 spread，改 `my.src` 与 `partner.src`；
3. 同时改 `alt`，方便读屏和图片加载失败时显示。

```js
{
  id: 'winter-2',
  title: '冬日恋歌',
  date: '二〇二五 · 冬',
  caption: '冬日的浪漫很简单：热气腾腾的食物，和身边的你。',
  my: {
    src: 'assets/album/my-04.jpg',
    alt: '我的照片 · 冬日',
  },
  partner: {
    src: 'assets/album/you-04.jpg',
    alt: '你的照片 · 冬日',
  },
}
```

#### 增加一页 / 多页

在 `ALBUM.spreads` 数组里复制一个完整对象，放到你想要的顺序位置，然后改：

- `id`：**必须唯一**（例如 `winter-2`、`spring-2`）；
- `title` / `date` / `caption`：这一页的文案；
- `my.src` / `partner.src`：左右照片路径；
- `alt`：图片描述。

```js
export const ALBUM = {
  spreads: [
    { /* 第 1 页 */ },
    { /* 第 2 页 */ },

    // 新增第 3 页
    {
      id: 'trip-2026',
      title: '我们的旅行',
      date: '二〇二六 · 秋',
      caption: '把沿途的风，也一起收进这一页。',
      my: {
        src: 'assets/album/my-05.jpg',
        alt: '我的照片 · 旅行',
      },
      partner: {
        src: 'assets/album/you-05.jpg',
        alt: '你的照片 · 旅行',
      },
    },
  ],
}
```

保存后开发服务器会自动刷新；正式部署需要重新 `npm run build`，因为 `public/assets/album/` 会被复制进 `dist/`。

#### 照片规格建议

- 竖版最稳：**3:4 或 4:5**，例如 1200×1600、1600×2000；
- 格式：jpg / png / webp / svg；
- 单张尽量控制在 300–800 KB，避免手机相册翻页卡顿；
- 左右两张最好同方向、同色调，翻页时更整齐；
- 当前配置有 4 个 spread；前两个的 `id` 都还是 `spring`，建议后续改成不同值，避免以后做收藏 / 分享时冲突（不影响现在翻页）。

#### 一周年照片卡

一周年专区的照片卡是另一套，在 `CELEBRATION`：

```js
export const CELEBRATION = {
  rightPhoto: 'assets/celebrate/you.jpg',
  leftPhoto: '',
}
```

- 照片卡槽是 **9:16 竖版**，建议 1080×1920；
- 留空就在页面里现场拍照或上传；
- 也可以在烟花页点「纪念卡」进入；
- 上传 / 拍照的图片只保存在当前浏览器会话中，不会上传服务器。

### 烟花页文案

```js
export const FIREWORKS = {
  title: '恋爱一周年',
  subtitle: 'ONE YEAR OF LOVE',
  blessing: '这一年温柔落幕，下一段旅途，我们一起出发',
  blessingSub: '愿我们前路漫漫，万事顺意，越来越好',
  back: '返回首页',
  card: '纪念卡',
}
```

烟花页的音乐是 `AUDIO.sceneBgm.fireworks`，不是单独的 `background.mp3`；想换庆祝曲，
改 `fireworks.src` 或替换 `郭一凡 - 有我呢.mp3` 即可。

### 视觉细节与自适应

这一版在功能之外做了一层整体视觉增强：

- **星空**：`CelestialDecor.vue` 增加了柔和星云、淡淡的星座连线、缓慢流星和两条大轨道；
  `MemoryTimeline` 增加了九星舞台光环与两条星轨，节点仍保持清晰的阅读层级。
- **地球**：增加柔光晕、星尘闪光；行星轨道依次出现，避免一次全部堆上来。
- **花海**：`FlowerDecor.vue` 增加左右玫瑰藤蔓和 4 只小蝴蝶；计时器上方增加细金花饰；
  白天更浪漫，黑夜则自动降低这些装饰的亮度，让萤火虫成为主角。
- **欢迎语**：新增金色分隔花线，四行文字依次淡入。
- **蓝毛小女仆**：`CuteAlien.vue` 使用 DSH pet 的透明待机动画切片，
  在花海左下角呼吸、轻轻浮动；颜色做了柔和处理，和整体粉蓝水彩融合。
- **自适应**：主要断点仍是 `760px` / `700px` / `380px`；
  大屏保留全部星云、藤蔓和蝴蝶，小屏自动缩小或隐藏部分装饰，计时器、菜单、信件和
  故事花园都按手机宽度重新排版。
- 动效统一使用 transform / opacity，避免影响滚动和触摸；`prefers-reduced-motion`
  下会减少花藤和蝴蝶动画。

---

## 10. 部署

### GitHub Pages

仓库包含 `.github/workflows/deploy.yml`：

1. push 到 `main`。
2. **Settings → Pages → Source** 选择 **GitHub Actions**。
3. 等待 Actions 完成。

`base: './'` 已处理子目录；本项目验证过放在 `/repo/` 子目录时资源正常加载。

### Vercel

- Framework Preset：Vite
- Build Command：`npm run build`
- Output Directory：`dist`

### 秒哒

```bash
npm run build
```

把 `dist/` **里面的全部内容**上传：

- `index.html`
- `assets/`
- `mediapipe/`（约 23 MB，不能漏）
- `favicon.svg`

音频会进入 `dist/assets/audio/`。`public/assets/audio/` 里目前还放着一首
未使用的 `林俊杰 - 将故事写成我们.mp3`（约 216 MB），Vite 会把它原样复制进 dist。
如果不准备把它接到某个场景，建议先删除或压缩，否则部署包会非常大。

---

## 11. 摄像头与隐私

- MediaPipe Hands 模型本地运行，不需要 Python 后端，不上传视频。
- 第一幕会启动摄像头和手势识别。
- **进入花海时自动停止摄像头**，花海、相册、日记、游戏都不再运行手势。
- 打开「一周年专区」并选择拍照时，才会单独请求摄像头；关闭拍照页后释放。
- 选择从相册上传时，不请求摄像头。
- 摄像头失败时自动回退鼠标模式；第一幕依然可以完整通过。

---

## 12. 常见问题

| 问题 | 处理 |
| --- | --- |
| 手机没有摄像头权限 | 使用 HTTPS；检查站点权限；第一幕可跳过手势 |
| 模型加载失败 / 404 | 执行 `npm run sync:mediapipe`；部署时带上 `dist/mediapipe/` |
| 手势不灵 | 正对镜头、光线均匀、手距 40–70 cm |
| 为什么花海没有手势了 | 这一版进入花海会主动关闭摄像头，节省性能 |
| 想改地球城市 | 改 `JOURNEY_CITIES` 的经纬度 / 名称 |
| 想换地球默认视角 | 改 `EarthJourney.vue` 的 `rotation = ref([-104, -26, 0])` |
| 想改计时起点 | 改 `TOGETHER_SINCE` |
| 想默认黑夜 | 改 `FLOWER_DEFAULT_MODE = 'night'` |
| 想改爱情树 | 改 `LoveTree.vue` |
| 想改蓝毛小女仆台词 | 改 `ALIEN_LINES` |
| 想改游戏题 | 改 `MINI_GAMES.math` / `chemistry` / `quiz` |
| 想改故事花园 | 改 `MINI_GAMES.story.items` 与 `finalText` |
| 想改情话模板 | 改 `LOVE_NOTES` |
| 想填日记 | 改 `DIARY_ENTRIES`，或在日记页里写 |
| 想回看星子 | 滚轮向上 / 向左拖动，或点「回看上一颗」 |
| 3 秒了还没有音乐 | 浏览器可能拦截自动播放；点一下页面或右上角音乐按钮即可重试 |
| 第一次进入没有音乐 | 浏览器禁止自动播放；先点一下页面。第一下点击会从 `stars` 开始 |
| 切换场景时音乐没有淡入淡出 | 检查 `AUDIO.sceneBgm` 的 key 与 `BGM_SCENES` 是否对应；同一首歌只会调音量，不重播 |
| 想加一首 BGM / 新区域 | 见「9. 素材替换 → 自由添加音乐」四步 |
| 相册想加一页 | 见「9. 素材替换 → 相册照片与增加页数」 |
| 大音频部署很慢 | 把 mp3 压到 128–192 kbps；未使用的 216 MB 文件不要带上 |
| 保存纪念卡没反应 | 确认左右照片都放好；部分手机会把下载放到「下载」 |
| GitHub Pages 空白 | 使用构建后的 `dist`，确认工作流成功 |
| 本地双击 index.html 空白 | 用 `npm run dev` 或静态服务器 |

---

## 13. 依赖与版权

- Vue 3、Vite 5
- `@mediapipe/hands`（Apache-2.0）
- `d3-geo`（ISC）用于地球正交投影
- Natural Earth 110m 陆地和中国边界（public domain）
- 蓝毛小女仆素材来自 MIT 开源的 `cute-fat-fish-pet` / `@tuweizhi/dsh-pet`，
  原作者 Mikolu，早期基础来自 PC2005-cloud 的 dsh-pet；本页只做了裁剪、透明化、
  待机动画重导出和轻微调色，授权文件见 `public/assets/pet/LICENSE.txt`
- 当前 BGM 引用了李荣浩《不将就》、方大同《特别的人》、郭一凡《有我呢》；
  音乐版权归各自权利人所有，公开部署前请确认你拥有使用授权
- 相册占位图为项目生成，可直接替换

---

祝你们一周年快乐。  
愿星光所至，都是你们慢慢奔赴的以后。
