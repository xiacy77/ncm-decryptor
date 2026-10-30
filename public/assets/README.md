# 素材替换指南

这个目录里的图片和音频都是**可替换的本地占位素材**。页面不会请求外部图床，
部署时把这些文件一起带上即可。

## 1. 背景音乐

- 当前文件：`public/assets/audio/bgm.wav`
- 页面配置：`src/config/story.js` → `AUDIO.bgm`
- 【👉在此替换背景音乐文件】把你要用的 `.mp3` / `.wav` / `.ogg` 放进
  `public/assets/audio/`，然后把 `AUDIO.bgm` 改成新文件名，例如：

```js
bgm: 'assets/audio/our-song.mp3',
```

- 替换成方大同的歌曲前，请确保你拥有对应音乐的使用授权。
- 音乐会在第二幕星光转场时淡入，右上角有播放 / 静音按钮。
- 如果浏览器拦截自动播放，点一下右上角音乐按钮即可解锁。

## 2. 通关提示音

- 当前文件：`public/assets/audio/chime.wav`
- 页面配置：`AUDIO.chime`
- 【👉在此替换通关提示音文件】格式支持同上。

## 3. 相册照片

- 当前文件：`public/assets/album/my-01.svg` / `you-01.svg` / `my-02.svg` …
- 页面配置：`src/config/story.js` → `ALBUM.spreads`
- 【👉在此替换我的照片】左侧页面的 `my.src`
- 【👉在此替换对方的照片】右侧页面的 `partner.src`
- 推荐使用竖版 3:4 图片，例如 900 × 1200；jpg / png / webp / svg 均可。
- 增加一组照片：在 `ALBUM.spreads` 数组里复制一个对象，修改 `id`、标题、
  文案和图片路径；相册会自动增加页码。

## 4. 庆祝页照片

- 目录：`public/assets/celebrate/`
- 页面配置：`CELEBRATION.leftPhoto` / `CELEBRATION.rightPhoto`
- 【👉在此替换你的照片】可选：预置左 / 右照片的路径；也可以留空，
  打开庆祝页后直接在页面里拍照或从相册上传。
- 推荐使用竖版 9:16 手机照片，页面会按比例居中裁切。
- 具体操作见 `public/assets/celebrate/README.md`。

## 5. 全部路径规则

所有素材都通过 `assetUrl()` 转成相对路径，因此：

- 不要写 `http://` 或 `https://` 外链；
- 不要写以 `/` 开头的绝对路径；
- 路径按 `assets/...` 写在 `src/config/story.js` 中即可；
- 构建后会自动位于 `dist/assets/...`，能兼容 GitHub Pages 子目录、Vercel
  和秒哒静态资源托管。
