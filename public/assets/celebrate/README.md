# 庆祝页照片

这个目录预留给「庆祝」纪念卡的可替换照片。

你可以选择：

1. **直接在页面里上传**：打开信件末尾的「庆祝」页，点击左侧或右侧照片卡槽，
   选择拍照或从系统相册上传。
2. **写死在配置里**：把照片放在这个目录，修改 `src/config/story.js`：

```js
export const CELEBRATION = {
  // ...
  leftPhoto: 'assets/celebrate/left.jpg',
  rightPhoto: 'assets/celebrate/right.jpg',
}
```

照片会以竖版 9:16 居中裁切展示，建议使用手机竖拍照片。
留空时，页面会显示可点击的空白卡槽。
