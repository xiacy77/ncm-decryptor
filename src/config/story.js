/**
 * ✨ 全部剧情文案、时长、颜色与素材路径都在这里集中管理。
 * 想改剧情节奏、换照片或换音乐，只需要动这一个文件。
 */

/** public/ 下的相对素材路径；兼容 GitHub Pages 子目录与 Vercel 根目录。 */
export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

/** 水彩星空专属色板：低饱和、偏灰粉与雾蓝，不用刺眼的赛博高光。 */
export const PALETTE = {
  night: '#070811',
  nightDeep: '#04050b',
  nightSoft: '#111426',
  cream: '#f8f1e8',
  creamSoft: '#f3e8dc',
  paper: '#f6e9d2',
  paperDeep: '#eeddc1',
  blush: '#e7b6c6',
  rose: '#d49aae',
  lavender: '#c4c4e6',
  sky: '#b8c9e4',
  sage: '#bccab9',
  sageDeep: '#8fa48e',
  gold: '#ead8b3',
  goldDeep: '#c9ad7e',
  ink: '#48434b',
  inkSoft: '#6b6268',
  white: '#fffaf4',
}

/** 幼圆优先；没有安装幼圆的系统会自动落到圆润的中文字体。 */
export const FONTS = {
  display: '"YouYuan", "幼圆", "Yuanti SC", "PingFang SC", "Microsoft YaHei", sans-serif',
  body: '"YouYuan", "幼圆", "Yuanti SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
  date: '"Cormorant Garamond", "Baskerville", "Georgia", "Times New Roman", serif',
}

/** 第一幕的隐藏纪念日 */
export const ANNIVERSARY_DATE = '2025.11.1'

/** 花海默认主题：'day' 白天，'night' 黑夜 */
export const FLOWER_DEFAULT_MODE = 'day'

/**
 * 在一起的起点。计时器会按系统时间实时跳动。
 * 如需修改时区，页面取的是访问者本地时间。
 */
export const TOGETHER_SINCE = {
  year: 2025,
  month: 11,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
}

/** 地球仪上点亮的城市 */
export const JOURNEY_CITIES = [
  { name: '成都', en: 'CHENGDU', lon: 104.06, lat: 30.67 },
  { name: '自贡', en: 'ZIGONG', lon: 104.78, lat: 29.34 },
  { name: '贵阳', en: 'GUIYANG', lon: 106.63, lat: 26.65 },
  { name: '安顺', en: 'ANSHUN', lon: 105.93, lat: 26.25 },
  { name: '重庆', en: 'CHONGQING', lon: 106.55, lat: 29.56 },
]

/**
 * 开场依次亮起的九颗「时光星子」。
 * event 是节点名，date 是显示在星子旁边的时间。
 */
export const MEMORY_NODES = [
  { id: 'first-meet', event: '初识', date: '2025年9月26日' },
  { id: 'first-date', event: '见面', date: '2025年10月8日' },
  { id: 'confession', event: '正式表白', date: '2025年11月1日' },
  { id: 'zigong', event: '自贡之旅', date: '2025年11月21日' },
  { id: 'new-year', event: '跨年', date: '2025年12月31日' },
  { id: 'day-200', event: '200天纪念日', date: '2026年5月20日' },
  { id: 'chengdu', event: '成都之旅', date: '2026年七月初' },
  { id: 'guilang', event: '贵阳重庆之旅', date: '2026年10月国庆' },
  { id: 'just-now', event: '此刻', date: 'just now', current: true },
]

/**
 * 掌心触碰漂浮音符时弹出的悄悄话。
 * 可以自由增删，界面会自动排布。
 */
export const WHISPERS = [
  { icon: '♥', text: '想你' },
  { icon: '★', text: '啦啦啦，拜倒在姐的石榴裙下吧' },
  { icon: '♪', text: '爱你' },
  { icon: '✦', text: '多喝水哦' },
  { icon: '♪', text: '最近有谣言说我喜欢你，我要澄清一下，那不是谣言' },
  { icon: '♥', text: '照顾好自己呀，虽然我也会尽可能照顾好你' },
  { icon: '♫', text: '在干啥' },
  { icon: '✦', text: '混蛋来的' },
  { icon: '♥', text: '莫文蔚的阴天，孙燕姿的雨天，都不如你和我聊天。' },
  { icon: '♪', text: '你好逗' },
  { icon: '♥', text: '你好可爱' },
  { icon: '♬', text: '有时候有点呆' },
  { icon: '✦', text: '行走的导航，出行不迷路' },
  { icon: '♥', text: '火鸡面大王' },
  { icon: '★', text: '小孩，你别狂' },
]

/**
 * 花间小窗的按钮。
 * id 用于内部路由，label / en 可以自由改写。
 */
export const MENU_ITEMS = [
  { id: 'album', label: '相册', en: 'ALBUM' },
  { id: 'anniversary', label: '一周年专区', en: 'ONE YEAR' },
  { id: 'diary', label: '日记', en: 'DIARY' },
  { id: 'play', label: '耍起嘛', en: 'PLAY' },
  { id: 'letter', label: '信', en: 'LETTER' },
]

/**
 * 日记专区初始内容。
 * 格式固定为 { date: 'YYYY-MM-DD', content: '...' }，可以连续添加多条。
 * 页面里也可以直接写新日记，会自动保存在浏览器 localStorage。
 */
export const DIARY_ENTRIES = [
  { date: '开篇寄语', content: '不是说想看下日记吗，当时写得还挺细的，翻出来看满是回忆。后来就没怎么记日记了，或许是天天都很开心，也或许是太忙，就很少动笔啦。下面这些是我当时记下的深刻回忆，一起来重温我们初识的过程哦。', isNote: 'top' },
  { date: '2025-10-08', content: '国庆假期回来，晚上网友面基给我送约定好带的吃的，第一次见面第一句是“你好”哈哈哈还挺搞笑的，然后和我说“拿了东西就快回去吧”，服了。后面wx上又后悔说早知道多玩一会儿了，天知道听到要见面，我有多紧张。' },
  { date: '2025-10-18', content: '晚上约我见面，在格致楼那里坐下聊了很久高中的事情。' },
  { date: '2025-10-19', content: '图书馆，他跟过来，这个家伙就带了个手机，不过还是陪了我好一会儿。' },
  { date: '2025-10-25', content: '出去的时候去爱达乐把人家的夹子拿出门了，笑晕了。对着喷泉拍，不知道拍啥，拍了个叔站中间。后来回学校在那里坐着，跳出来一只小猫，小猫偷吃他的麻糍。' },
  { date: '2025-10-29', content: '我们见面了，这个家伙不老实，亲我脸还偷亲我嘴，太坏了。' },
  { date: '2025-10-30', content: '在明德楼那里有个小姐姐把共享单车想开上路边，结果倒了。我去帮小姐姐捡起东西，他帮她扶车，还帮她把车推了上去，我们两是好市民。' },
  { date: '2025-11-01', content: '他表白了，让那小子如愿以偿了，但是好尴尬呀，哈哈，我感觉他真的不太会表白。' },
  { date: '2025-11-02', content: '晚上和室友以及其他几个朋友去了ktv，喝了点酒，叫他来接我的，把我载回去的还挺爽。暗爽ing' },
  { date: '2025-11-06', content: '买了奶茶去接他晚上放学，他还提前下课了。我还在细细品尝我的奶茶的时候，给他着急忙慌的，让他原地等我。他当时见到我，老远处跑过来，一蹦一跳的真的很可爱。' },
  { date: '2025-11-07', content: '立冬，我们下午放学去吃了烧烤，感觉我吃的比他多。' },
  { date: '2025-11-09', content: '我们出去了那个湿地公园，还去逛了万达，化了一个很好的妆，他给我买了一顶帽子，好看死了。' },
  { date: '2025-11-10', content: '我们晚上一起吃的饭，把他送回宿舍，然后我们吻别。' },
  { date: '2025-11-11', content: '晚上一起一食堂吃的饭，我开了车，他载着我，好安心。他去快递站取了他的羽绒服，他说他不喜欢折耳根，不爱吃苹果，不喜欢香菜，讨厌酸梅汤。' },
  { date: '2025-12-22', content: '不知不觉谈了有段时间了，快两个月了，已经没有当时的那种见面有点激动的感觉了，有种平平淡淡的感觉。不过这段时间相处都挺好的，就是有时候感觉他好毒舌，救命。' },
  { date: '2026-01-06', content: '晚上考完学科竞赛（现在已经凌晨了我还没睡），他还给我带了吃的，炸鸡腿香迷糊了好吃好吃。前几天他也是等我考完试来接我，给我带奶茶。我以后有空也要多接接他，喜欢是相互的，喜欢他就像呼吸一样简单。' },
  { date: '2026-01-07', content: '最近好喜欢他，完蛋了。和他一起跨年真的很开心，虽然我一直很困，在睡觉吧，但是就感觉很舒服，睡的很香很舒服。永远忘不掉我们一起泡的那个火鸡面，太好吃了，就是好辣，我好菜，救命。还有就是他很耐心，还是个很爱收拾东西的小孩，真棒。'},
   { date: '2026-10-30', content: '我这两天三还在对这个小网站修修补补（真没背着你干坏事哦） 然后加我们的照片，和一些嗯....不太好的地方还要改 明天你就能看到了，嘻嘻嘻。' }, 
  { date: '尾片寄语', content: '哎哟，翻到底啦，其他的回忆靠你脑子自己回忆了，欢迎找我补充说明哦，说不定我会写进我的绝美日记本，那个日记本暂时都还没记啥内容，这些都是我去年随手记手机备忘录的。感觉去年真是有点贪吃呢。', isNote: 'bottom' },
  
  // { date: '2026-10-28', content: '今天也想把普通的一天，写进我们的纪念册。' },
]

// export const DIARY_ENTRIES = [
//   { date: '开篇寄语', content: '不是说想看下日记吗，当时写得还挺细的，翻出来看满是回忆。后来就没怎么记日记了，或许是天天都很开心，也或许是太忙，就很少动笔啦。下面这些是我当时记下的深刻回忆，一起来重温我们初识的过程哦。' },
//   { date: '2025-10-08', content: '国庆假期回来，晚上网友面基给我送约定好带的吃的，第一次见面第一句是“你好”哈哈哈还挺搞笑的，然后和我说“拿了东西就快回去吧”，服了。后面wx上又后悔说早知道多玩一会儿了，天知道听到要见面，我有多紧张。' },
//   { date: '2025-10-18', content: '晚上约我见面，在格致楼那里坐下聊了很久高中的事情。' },
//   { date: '2025-10-19', content: '图书馆，他跟过来，这个家伙就带了个手机，不过还是陪了我好一会儿。' },
//   { date: '2025-10-25', content: '出去的时候去爱达乐把人家的夹子拿出门了，笑晕了。对着喷泉拍，不知道拍啥，拍了个叔站中间。后来回学校在那里坐着，跳出来一只小猫，小猫偷吃他的麻糍。' },
//   { date: '2025-10-29', content: '我们见面了，这个家伙不老实，亲我脸还偷亲我嘴，太坏了。' },
//   { date: '2025-10-30', content: '在明德楼那里有个小姐姐把共享单车想开上路边，结果倒了。我去帮小姐姐捡起东西，他帮她扶车，还帮她把车推了上去，我们两是好市民。' },
//   { date: '2025-11-01', content: '他表白了，让那小子如愿以偿了，但是好尴尬呀，哈哈，我感觉他真的不太会表白。' },
//   { date: '2025-11-02', content: '晚上和室友以及其他几个朋友去了ktv，喝了点酒，叫他来接我的，把我载回去的还挺爽。暗爽ing' },
//   { date: '2025-11-06', content: '买了奶茶去接他晚上放学，他还提前下课了。我还在细细品尝我的奶茶的时候，给他着急忙慌的，让他原地等我。他当时见到我，老远处跑过来，一蹦一跳的真的很可爱。' },
//   { date: '2025-11-07', content: '立冬，我们下午放学去吃了烧烤，感觉我吃的比他多。' },
//   { date: '2025-11-09', content: '我们出去了那个湿地公园，还去逛了万达，化了一个很好的妆，他给我买了一顶帽子，好看死了。' },
//   { date: '2025-11-10', content: '我们晚上一起吃的饭，把他送回宿舍，然后我们吻别。' },
//   { date: '2025-11-11', content: '晚上一起一食堂吃的饭，我开了车，他载着我，好安心。他去快递站取了他的羽绒服，他说他不喜欢折耳根，不爱吃苹果，不喜欢香菜，讨厌酸梅汤。' },
//   { date: '2025-12-22', content: '不知不觉谈了有段时间了，快两个月了，已经没有当时的那种见面有点激动的感觉了，有种平平淡淡的感觉。不过这段时间相处都挺好的，就是有时候感觉他好毒舌，救命。' },
//   { date: '2025-01-06', content: '晚上考完学科竞赛（现在已经凌晨了我还没睡），他还给我带了吃的，炸鸡腿香迷糊了好吃好吃。前几天他也是等我考完试来接我，给我带奶茶。我以后有空也要多接接他，喜欢是相互的，喜欢他就像呼吸一样简单。' },
//   { date: '2026-01-07', content: '最近好喜欢他，完蛋了。和他一起跨年真的很开心，虽然我一直很困，在睡觉吧，但是就感觉很舒服，睡的很香很舒服。永远忘不掉我们一起泡的那个火鸡面，太好吃了，就是好辣，我好菜，救命。还有就是他很耐心，还是个很爱收拾东西的小孩，真棒。'},
//   { date: '尾片寄语', content: '哎哟，翻到底啦，其他的回忆靠你脑子自己回忆了，欢迎找我补充说明哦，说不定我会写进我的绝美日记本，那个日记本暂时都还没记啥内容，这些都是我去年随手记手机备忘录的。感觉去年真是有点贪吃呢。'}
//   // { date: '2026-10-28', content: '今天也想把普通的一天，写进我们的纪念册。' },
// ]

/** 小游戏结束时会随机出现的情话卡片 */
export const LOVE_NOTES = [
  '今天也想把一点点喜欢，悄悄放进你手里。',
  '你不用很完美，你在我这里就很好。',
  '想把所有普通的日子，都过成和你有关的纪念日。',
  '你一出现，我的世界就自动变成柔光。',
  '以后也一起吃饭、散步、看很多次晚霞吧。',
  '我没有很会说话，但我很会想你。',
  '你是我在认真挑选的家人。',
  '慢慢来，说不定我们真有一辈子呢。',
  '想和你把春夏秋冬都过n遍。',
  '你是我所有计划里，最舍不得删掉的那一项。',
  '世界很大，我最想回去的地方是你身边。',
  '今天也辛苦啦，来我这里领一个抱抱。',
  '喜欢你这件事，我从来没打算停。',
  '花会再开，我们也会一直在一起。',
]

/** 蓝毛小女仆的可爱台词 */
export const ALIEN_LINES = [
  '嗷呜～今天也要开心呀',
  '我在这里陪着你',
  '要不要抱一下？',
  '这里的花，都是为你开的',
  '我们都会犯错 天性如何并不重要 重要的是你开始改变',
  '不必太纠结于 也不必太忧虑未来 当你经历过一些事情的时候 眼前的风景 已经和从前不一样了',
  '浪漫自由 洒脱勇敢 没有枷锁 这才是我人生的关键词',
  '爱不是来自情人节，巧克力或是花，更不是小狗，它来自你们的心',
  '永远不会丢下自己爱的人',
]

/**
 * 游戏专区。
 * 游戏名字故意做得普通，不在入口处说明主题；
 * 情话和结果只在玩完之后出现。
 */
export const MINI_GAMES = {
  math: {
    id: 'math',
    index: '01',
    title: '数字花园',
    en: 'NUMBER GARDEN',
    // 每一组都是 13、14、520，连起来就是 1314520。
    // 想换题，只需要替换 expression / answer / hint；答案请保持 13、14、520。
    sets: [
      [
        { expression: '7 + 6 = ?', answer: 13, hint: '先算 7 + 6。' },
        { expression: '2 × 7 = ?', answer: 14, hint: '二七十四。' },
        { expression: '13 × 40 = ?', answer: 520, hint: '13 个 40 相加。' },
      ],
      [
        { expression: '26 ÷ 2 = ?', answer: 13, hint: '把 26 平均分成两份。' },
        { expression: '20 − 6 = ?', answer: 14, hint: '20 减去 6。' },
        { expression: '1040 ÷ 2 = ?', answer: 520, hint: '把 1040 对半分开。' },
      ],
      [
        { expression: '5² − 12 = ?', answer: 13, hint: '先算 5 的平方。' },
        { expression: '√196 = ?', answer: 14, hint: '14 × 14 是多少？' },
        { expression: '260 + 260 = ?', answer: 520, hint: '两个 260。' },
      ],
      [
        { expression: '3! + 7 = ?', answer: 13, hint: '3! = 3 × 2 × 1。' },
        { expression: '100 − 86 = ?', answer: 14, hint: '从 100 往回数 86。' },
        { expression: '521 − 1 = ?', answer: 520, hint: '比 521 少 1。' },
      ],
    ],
    codeParts: [13, 14, 520],
    successCode: '1314520',
    successTitle: '刚好是我们',
    successText: '13 · 14 · 520，连起来刚好是 1314520。',
  },
  chemistry: {
    id: 'chemistry',
    index: '02',
    title: '元素图鉴',
    en: 'ELEMENT DECK',
    // 每局会从下面随机抽 6 个元素，其中 Mg / Zn 一定会出现。
    pairs: [
      { symbol: 'H', name: '氢' },
      { symbol: 'O', name: '氧' },
      { symbol: 'C', name: '碳' },
      { symbol: 'Mg', name: '镁', always: true },
      { symbol: 'Zn', name: '锌', always: true },
      { symbol: 'Ca', name: '钙' },
      { symbol: 'Fe', name: '铁' },
      { symbol: 'Na', name: '钠' },
      { symbol: 'K', name: '钾' },
      { symbol: 'Al', name: '铝' },
    ],
    successTitle: '你的“镁”偷走了我的“锌”',
    successText: 'Mg + Zn = 镁 + 锌，也等于：你的美，偷走了我的心。',
  },
  quiz: {
    id: 'quiz',
    index: '03',
    title: '十道小题',
    en: 'TEN QUESTIONS',
    // 【👉请按你们的真实情况修改】questions 可以继续增加，每局会随机抽 10 道。
    questionCount: 10,
    points: 10,
    questions: [
       {
        q: '和我最配的身高是(这把小试牛刀)？',
        options: ['180', '170', '175', '165'],
        answer: 0,
      },
     
      {
        q: '我喝奶茶通常点？',
        options: ['全糖', '七分糖', '半糖', '无糖'],
        answer: 1,
      },
      {
        q: '我们第一次一起旅行的城市是？',
        options: ['成都', '重庆', '自贡', '贵阳'],
        answer: 2,
      },
      {
        q: '我心情不好时，最想要？',
        options: ['一个人待着', '吃甜的', '抱抱', '出去走走'],
        answer: 2,
      },
      {
        q: '我目前最喜欢的歌手是？',
        options: ['周杰伦', '林俊杰', '陈奕迅', '郑润泽'],
        answer: 3,
      },
       {
        q: '我喜欢的人是(这把给你上难度)？',
        options: ['我自己', '刘雨宏', '彭于晏', '吴彦祖'],
        answer: 1,
      },
      {
        q: '从以下几个菜选出我最喜欢的菜是？',
        options: ['蒸鱼、烤鱼', '可乐鸡翅', '糖醋排骨', '都喜欢'],
        answer: 3,
      },
      {
        q: '我们正式在一起的日子是？',
        options: ['2025.9.26', '2025.10.8', '2025.11.1', '2025.12.31'],
        answer: 2,
      },
      {
        q: '我鞋码是？',
        options: ['34', '35', '36', '37'],
        answer: 2,
      },
      {
        q: '我睡觉的时候，有什么小习惯？(可能有点歧议)',
        options: ['怕黑，喜欢有光', '容易怕冷，要盖好被子', '睡眠很浅，很容易被吵醒', '沾枕头就睡，睡得很沉'],
        answer: 2,
      },
      {
        q: '我们看的第一部电影是？',
        options: ['疯狂动物城', '飞驰人生3', '阿嬷的情书', '寻梦环游记'],
        answer: 0,
      },
      {
        q: '200天是哪一天？',
        options: ['2026年5月22日', '2026年5月21日', '2026年5月20日', '2026年5月23日'],
        answer: 2,
      },
      {
        q: '我最喜欢的小动物是？',
        options: ['猫', '狗', '兔子', '蓝色小外星人'],
        answer: 0,
      },
    ],
    tiers: [
      {
        min: 90,
        label: '满分默契',
        title: '你把我记得很清楚',
        text: '有些小事我自己都快忘了，你却还记得。',
        tone: 'rose',
      },
      {
        min: 70,
        label: '很懂我呀',
        title: '大部分都答对了',
        text: '剩下的小秘密，留着以后慢慢告诉你。',
        tone: 'peach',
      },
      {
        min: 50,
        label: '还在靠近',
        title: '我们还有很多可以聊',
        text: '没关系，喜欢本来就是一个慢慢了解的过程。',
        tone: 'lavender',
      },
      {
        min: 0,
        label: '以后再告诉你',
        title: '这次先记在小本本上',
        text: '下次再考你，答对了有奖励。',
        tone: 'sage',
      },
    ],
  },
  story: {
    id: 'story',
    index: '04',
    title: '故事花园',
    en: 'STORY GARDEN',
    // 【👉可自由增删】点击每一张卡片读一小段；读完所有卡片会出现一段结尾。
    items: [
      {
        id: 'guan-ju',
        kind: '诗经',
        title: '关雎',
        author: '《诗经 · 周南》',
        excerpt: '关关雎鸠，在河之洲。\n窈窕淑女，君子好逑。',
        note: '几千年前的人，也把喜欢写得这样坦荡。',
      },
      {
        id: 'zhi-xiang-shu',
        kind: '情诗',
        title: '致橡树',
        author: '舒婷',
        excerpt: '我如果爱你——\n绝不像攀援的凌霄花，\n借你的高枝炫耀自己。',
        note: '好的爱不是依附，是并肩站着，各自生长。',
      },
      {
        id: 'flowering-tree',
        kind: '情诗',
        title: '一棵开花的树',
        author: '席慕蓉',
        excerpt: '如何让你遇见我，\n在我最美丽的时刻。',
        note: '原来所有盛放，都可以是在等一个人。',
      },
      {
        id: 'little-prince',
        kind: '童话',
        title: '小王子',
        author: '圣埃克苏佩里',
        excerpt: '正是你为你的玫瑰花费的时光，\n才使你的玫瑰变得如此重要。',
        note: '重要的不是玫瑰本身，是你愿意为她花掉的时间。',
      },
      {
        id: 'little-mermaid',
        kind: '童话',
        title: '小美人鱼',
        author: '安徒生',
        excerpt: '她愿意用三百年的寿命，\n去换一个不灭的灵魂。',
        note: '小时候听的是王子，长大后才听懂她的勇敢。',
      },
      {
        id: 'sleeping-beauty',
        kind: '童话',
        title: '睡美人',
        author: '格林童话',
        excerpt: '王子穿过荆棘，\n走到沉睡的公主面前。',
        note: '长大以后才明白，叫醒我们的从来不是魔法，是有人愿意来。',
      },
    ],
    finalTitle: '故事读完了',
    finalText: '小时候听的是童话，长大后读的是我们。愿我们一直有故事可讲，也有人愿意听。',
  },
}

/**
 * 时间单位均为 milliseconds。
 * 节奏偏慢，所有淡入淡出都留了足够的呼吸感。
 */
export const TIMING = {
  starIntro: {
    emergeDuration: 3400,
    gatherAt: 3400,
    gatherDuration: 2600,
    burstAt: 6000,
    burstDuration: 850,
    warpAt: 6850,
    warpDuration: 2350,
    homeAt: 9200, // 星际隧道结束、回到可交互星空
    memoryStartDelay: 400,
    // 自动逐颗播放的间隔；手动滚轮 / 拖动会临时暂停自动播放。
    memoryAutoStep: 2500,
    memoryAutoStartDelay: 900,
    // 每颗星子一次镜头聚焦的间隔；镜头过渡由 CSS 平滑完成。
    memoryFocusStep: 2500,
    memoryFocusTransition: 1300,
    memoryNodeDuration: 950,
    memoryPanoramaHold: 900,
    memoryPanoramaTransition: 2100,
    // 九星全部出现后闪烁、定格、等待“继续”
    memoryFinaleFlash: 1900,
    datePreviewDuration: 2200,
    earthRevealDelay: 260,
    earthRevealAfterDate: 650,
    earthCityStep: 430,
    whispersDelayAfterEarth: 1000,
    welcomeDelayAfterEarth: 4550,
    readyDelayAfterWelcome: 3600,
    triggerFlash: 520,
    dateFlashDuration: 390,
    dateFlashCount: 3,
    bubbleDelay: 620,
    bubbleHold: 1500,
    warpOutDelay: 160,
  },
  sceneTransition: {
    coverDelay: 900,
    overlayFade: 1700,
  },
  star: {
    palmRadius: 250,
    quietSpeed: 0.32,
    quietAlpha: 0.46,
    fistOrbRadius: 112,
    dateRevealMs: 2000,
    trailLife: 620,
    thumbCooldown: 900,
  },
  bloom: {
    contentDelay: 2800,
    dialogueDelay: 300,
    menuDelayAfterDialogue: 900,
    chimeDelay: 250,
    zoomBeforeLetter: 900,
  },
  letter: {
    envelopeDelay: 3000,
    typeSpeed: 94,
    linePause: 520,
    holdAfterTyping: 3000,
    dateEchoAfter: 3400,
    dateEchoDuration: 5600,
    footerDelay: 1500,
  },
  audio: {
    bgmVolume: 0.42,
    fadeIn: 3000,
    fadeOut: 900,
    // 页面打开后多久尝试启动第一幕 BGM（浏览器可能仍需第一次交互才放行）
    initialStartDelay: 3000,
    // 同一场景内 / 换歌时的自然交叉淡化；单首场景也可以在 AUDIO 里写 fade 覆盖
    sceneFade: 1800,
    letterDuck: 0.2,
  },
}

/** 所有用户能读到的文字都收在这里，方便整体改写。 */
export const COPY = {
  welcomeLine1: '宿主，欢迎您的到来 ~',
  welcomeLine2: '系统宝宝已等你多时了。',
  starHint: '可以用手掌控制星光哦，试试做出不同手势，会有惊喜✨',
  whisperHint: '掌心轻轻碰一碰漂浮的音符，会听见一些悄悄话',
  manualAdvance: '请对着摄像头比出我拍照惯用手势，也可以点这里，开启下一幕',
  triggerBubble: '恭喜宿主触发系统新线索，请宿主做好准备开启新的旅程。',
  bloomDialogue: '短暂隐去，只为更隆重地相见。',
  albumTitle: '我们的拾光集',
  albumSubtitle: '把这一年的光，轻轻收好',
  albumClose: '合上相册',
  pageMy: '朋友',
  pageYou: '恋人',
  letterHint: '轻触信封，拆开这一封',
  letterText: '我思来想去，信还是亲手写的更好，这里就不做多赘述啦~但就补充一下，你很好的，请一定相信自己，别总瓜兮兮先往坏处设想。不必反复怀疑自己，在我这里，你已经足够珍贵！我的小破网站就到这啦，但我们的故事还在继续......\n一周年快乐呀小宝~',
  celebrationButton: '庆祝',
  endingFooter: '我们还有无数个周年，慢慢奔赴。',
  cameraSkip: '跳过手势',
  cameraManual: '用鼠标继续',
  cameraRetry: '重新连接摄像头',
  cameraPrivacy: '画面只在本地识别，不会上传。',
}

/**
 * 👉 在此替换音乐 / 音效文件。
 * 支持 mp3、wav、ogg；替换后把这里改成新文件名即可。
 * 注意：请使用你拥有版权或已获授权的音乐。方大同的歌曲需要自行取得授权。
 */
// export const AUDIO = {
//   // 【👉在此替换背景音乐文件】public/assets/audio/bgm.wav
//   bgm: 'public/assets/audio/方大同 - 特别的人.mp3',
//   // 【👉在此替换通关提示音文件】public/assets/audio/chime.wav
//   chime: 'assets/audio/chime.wav',
// }
export const AUDIO = {
  // 通用短音效（不变）
  chime: 'assets/audio/chime.wav',

  // 各个场景独立 BGM
  // 新增场景时：在 sceneBgm 里加一个 key（下面的 album 是示例），
  // 再把 BGM_SCENES 里对应区域改成这个 key 即可。
  sceneBgm: {
    stars: {
      src: 'assets/audio/李荣浩 - 不将就.mp3',
      volume: 0.42,
      // fade: 2200, // 可选：单独覆盖全局 sceneFade
    },
    bloom: {
      src: 'assets/audio/方大同 - 特别的人.mp3',
      volume: 0.42,
    },
    letter: {
      src: 'assets/audio/方大同 - 特别的人.mp3',
      volume: 0.35,
    },
    fireworks: {
      src: 'assets/audio/郭一凡 - 有我呢.mp3',
      volume: 0.42,
    },

    // 示例：给相册单独一首歌。取消注释后，把 BGM_SCENES.album 改成 'album'。
    // 注意：林俊杰这首文件约 216 MB，建议先压缩到 128–192 kbps 再上线。
    album: {
      src: 'assets/audio/林俊杰 - 将故事写成我们.mp3',
      volume: 0.35,
    },
  },
}

/**
 * 区域 → 场景 BGM 的映射。
 * App.vue 会按这张表切换音乐；新增区域时优先改这里，不要散落写字符串。
 *
 * 默认 album / anniversary / diary / play 都复用 bloom；
 * 想独立，就在 AUDIO.sceneBgm 里加同名 key，并把这里改成那个 key。
 */
export const BGM_SCENES = {
  stars: 'stars',
  bloom: 'bloom',
  letter: 'letter',
  fireworks: 'fireworks',

  // 花间小窗里的子区域
  album: 'bloom',
  anniversary: 'bloom',
  diary: 'bloom',
  play: 'bloom',
}
/**
 * 👉 在此替换相册照片。
 * 左侧固定放「我」的照片，右侧固定放「你」的照片；
 * 一个 spread 就是相册的一页，可以继续复制对象来增加页数。
 * 图片支持 jpg / png / webp / svg，放进 public/assets/album/ 后修改 src。
 */
export const ALBUM = {
  spreads: [
     {
      id: 'winter',
      title: '冬日恋歌',
      date: '二〇二五 · 冬',
      caption: '冬日的浪漫很简单：热气腾腾的食物，和身边的你。',
      my: {
        // 【👉在此替换我的照片 · 第一页】public/assets/album/my-01.svg
        src: 'assets/album/D166972959B3D00E0E87A42C12B66DF2.jpg',
        alt: '我的照片占位图，第一页',
      },
      partner: {
        // 【👉在此替换对方的照片 · 第一页】public/assets/album/you-01.svg
        src: 'assets/album/0906118029F11E867A2BBA922E32DD87.jpg',
        alt: '你的照片占位图，第一页',
      },
     },
    {
      id: 'spring',
      title: '春日序曲',
      date: '二〇二六 · 春',
      caption: '风很轻，你笑起来的时候，整座花海都亮了。',
      my: {
        // 【👉在此替换我的照片 · 第一页】public/assets/album/my-01.svg
        src: 'assets/album/B1E019261937CCEFCED0FAB025073067.jpg',
        alt: '第二页',
      },
      partner: {
        // 【👉在此替换对方的照片 · 第一页】public/assets/album/you-01.svg
        src: 'assets/album/52F899DBEC6A8277D362D3EE2FB5B629.jpg',
        alt: '第二页',
      },
    },
    {
      id: 'summer',
      title: '夏夜微光',
      date: '二〇二六 · 夏',
      caption: '我们曾一起把晚风、月亮和没说完的话，收进同一个夜晚。',
      my: {
        // 【👉在此替换我的照片 · 第二页】public/assets/album/my-02.svg
        src: 'assets/album/E7F4D447AB2EFC34986CE280BC129BF7.jpg',
        alt: '第三页',
      },
      partner: {
        // 【👉在此替换对方的照片 · 第二页】public/assets/album/you-02.svg
        src: 'assets/album/624E62E3AE732F1BED7016C9E72C1266.jpg',
        alt: '第三页',
      },
    },
    {
      id: 'autumn',
      title: '秋日来信',
      date: '二〇二六 · 秋',
      caption: '日子慢慢走，我们把普通的一天，也过成了值得收藏的纪念。',
      my: {
        // 【👉在此替换我的照片 · 第三页】public/assets/album/my-03.svg
        src: 'assets/album/111.jpg',
        alt: '第四页',
      },
      partner: {
        // 【👉在此替换对方的照片 · 第三页】public/assets/album/you-03.svg
        src: 'assets/album/2223.jpg',
        alt: '第四页',
      },
    },
  ],
}

/**
 * 信件末尾「庆祝」按钮进入的烟花页面。
 * 文案可自由修改；背景音乐沿用全站 BGM。
 */
export const FIREWORKS = {
  title: '恋爱一周年',
  subtitle: 'ONE YEAR OF LOVE',
  blessing: '这一年温柔落幕，下一段旅途，我们一起出发',
  blessingSub: '愿我们前路漫漫，万事顺意，越来越好',
  back: '返回首页',
  card: '纪念卡',
  musicOff: '播放音乐',
  musicOn: '音乐播放中',
  musicBlocked: '点此播放音乐',
}

/**
 * 一周年照片卡（花间小窗「一周年专区」仍然进入这里）。
 * 照片不写死：左边默认留空，现场拍照或上传；
 * 右边可以在下面预置你的照片，也可以直接在页面里上传。
 */
export const CELEBRATION = {
  kicker: 'OUR FIRST ANNIVERSARY',
  title: '我们一周年啦！',
  english: 'One year with you, and many more to come.',
  subtitle: '把今天，收进我们的纪念卡。',
  footerSign: '2025.11.1 — JUST NOW',
  foreverLine: '2025.11.1 — FOREVER & ALWAYS',
  cardFooter: 'TO BE CONTINUED, WITH YOU',
  // 【👉在此替换你的照片】可选：预先放入右侧照片，例如 assets/celebrate/you.jpg
  rightPhoto: '',
  // 【👉在此替换另一张照片】可选：预置左侧照片；留空则打开时是空白卡槽
  leftPhoto: '',
  // 保存后的文件名前缀
  downloadName: '我们的一周年纪念卡',
}

/** 手势指南与识别提示 */
export const GESTURES = [
  {
    icon: '🖐',
    name: '张开手掌',
    description: '第一幕让星光追随掌心。进入花海后摄像头会关闭，改用鼠标或触屏。',
  },
  {
    icon: '✊',
    name: '握拳',
    description: '让星光在掌心凝成光球；对准纪念日所在的位置，会有隐藏回应。',
  },
  {
    icon: '👍',
    name: '竖起大拇指',
    description: '放一簇细碎的烟花星屑。',
  },
  {
    icon: '👌',
    name: 'OK 手势',
    description: '在心口炸开一圈爱心星光。',
  },
  {
    icon: '🤟',
    name: '爱你手势',
    description: '让一整场爱心星雨落下来。',
  },
  {
    icon: '🫶',
    name: '双手十指相扣',
    description: '让星光慢下来，进入安静的静谧模式。',
  },
  {
    icon: '✌️',
    name: '剪刀手',
    description: '在第一幕结尾比一个「耶」，开启花海小窗。',
  },
  {
    icon: '🖱',
    name: '鼠标 / 触屏',
    description: '所有关键操作都有可点击的替代入口，没有摄像头也能完整看完故事。',
  },
]

/** 相机不可用时的温和提示 */
export const CAMERA_NOTES = {
  requesting: '正在请求摄像头权限，允许后可以用手掌触碰星光',
  loading: '正在加载本地手势模型，请稍等片刻',
  denied: '没有拿到摄像头权限，已为你切换到鼠标模式',
  unsupported: '当前浏览器或环境不支持摄像头，已切换到鼠标模式',
  busy: '摄像头似乎正被其他程序占用，已切换到鼠标模式',
  error: '手势识别没有成功启动，已切换到鼠标模式',
  ready: '手势已连接，用掌心去碰一碰星光吧',
  manual: '已切换为鼠标模式，点击光点和按钮也能完整游览',
}

/**
 * 界面级小文案。
 * 剧情大段文案在上面的 COPY，这里集中放按钮、状态、无障碍标签。
 */
export const UI = {
  camera: {
    fallback: '已切换为鼠标模式，点击光点和按钮也能完整游览',
    guideAction: '手势说明',
    dismiss: '收起提示',
    switchToMouse: '跳过手势',
    preparing: '准备接入星光手势',
  },
  sound: {
    blocked: '点此播放音乐',
    enable: '开启背景音乐',
    pending: '音乐将在旅程开始后响起',
    resume: '继续播放背景音乐',
    mute: '静音背景音乐',
    shortcut: '点此播放',
    label: '音乐',
  },
  status: {
    manual: '鼠标模式',
    manualHint: '查看手势与摄像头设置',
    connecting: '连接手势…',
    requestingHint: '正在请求摄像头权限',
    loading: '加载手势…',
    loadingHint: '正在加载本地手势模型',
    readyPrefix: '手势已连接',
    readyHint: '查看手势指南',
    idle: '开启手势',
    waiting: '等待手势',
    recognized: '手已识别',
  },
  guide: {
    kicker: 'A LITTLE GUIDE',
    title: '星光手势指南',
    close: '关闭手势指南',
    connected: '摄像头已连接',
    manual: '当前为鼠标模式',
    connecting: '正在连接摄像头',
    waiting: '等待开启手势',
    manualDescription: '当前使用鼠标模式，所有关键操作都可以点击完成。',
    notConnected: '还没有连接手势',
    privacySuffix: '手势识别完全在浏览器本地完成。',
    busy: '正在连接…',
    manualOn: '鼠标模式已开启',
    continue: '继续游览',
  },
  star: {
    manualAdvance: '比出我拍照万能手势/可以点这里开启下一幕',
    quiet: '静谧模式 · 星光慢了下来',
    fallbackLabel: '星光手势',
    fallbackPanel: '鼠标手势替代按钮',
    fist: '握拳',
    fireworks: '烟花',
    ok: '心动',
    love: '爱你',
    quietShort: '静谧',
    fistHint: '握拳：星光聚在一起',
    fistAria: '模拟握拳手势',
    fireworksHint: '点赞：放一场小烟花',
    fireworksAria: '模拟点赞手势',
    okHint: 'OK：心口炸开爱心星光',
    okAria: '模拟 OK 手势',
    loveHint: '爱你：下一场爱心星雨',
    loveAria: '模拟爱你手势',
    quietHint: '静谧模式',
    quietAria: '切换静谧模式',
    whisperLabel: '悄悄话',
    whisperHint: '用掌心碰一碰这些音符',
    timelineTitle: '我们的星轨',
    timelineHint: '鼠标滚轮 / 左右拖动，可以回看上一颗',
    timelineBack: '回看上一颗',
    timelineContinue: '继续',
  },
  album: {
    previous: '上一页',
    next: '下一页',
    pageDots: '相册页码',
    jumpTo: (index) => `跳到第 ${index} 页`,
  },
  letter: {
    envelopeAria: '拆开这封信',
    paperAria: '一周年信件',
    back: '返回花田',
  },
  flower: {
    day: '白天',
    night: '黑夜',
    switchToDay: '切换到白天',
    switchToNight: '切换到黑夜',
  },
  alien: {
    label: '蓝毛小女仆',
  },
  menu: {
    kicker: 'A LITTLE GARDEN FOR US',
    title: '花间小窗',
    hint: '点开一扇小窗，把我们的故事慢慢收好。',
    toggleOpen: '打开花间小窗',
    toggleClose: '收起花间小窗',
  },
  timer: {
    label: '在一起',
    days: '天',
    from: '从 2025.11.1 开始',
    aria: '在一起的时间',
  },
  earth: {
    title: '这颗星球上，我们点亮过的地方',
    cityHint: '成都 · 重庆 · 自贡 · 贵阳 · 安顺',
    chinaLabel: '中国',
    dragHint: '拖动地球，看看我们去过的地方',
    draggedHint: '已为中国点亮五座城市',
  },
  diary: {
    kicker: 'OUR LITTLE DIARY',
    title: '日记专区',
    subtitle: '把今天写成一页，留给以后慢慢读。',
    empty: '这里还空着。等你把某一页，慢慢写进来。',
    add: '写下这一页',
    dateLabel: '日期',
    contentLabel: '内容',
    contentPlaceholder: '今天发生了什么？',
    save: '保存这一页',
    cancel: '取消',
    saved: '这一页已经收好啦',
    close: '合上日记',
    localHint: '保存在本机浏览器里，不会上传。',
    storageError: '浏览器没有允许保存，关闭页面后这一页会消失。',
  },
  play: {
    title: '耍起嘛',
    subtitle: '随便挑一个，玩一会儿吧。',
    close: '回到花间',
    back: '返回选择',
    again: '再来一次',
    start: '开始',
    questionNumber: (index) => `第 ${index} 题`,
    answerAria: '答案',
    symbolLabel: '元素符号',
    nameLabel: '元素中文名',
    mathInput: '把答案填进来',
    mathCheck: '解开这道题',
    mathWrong: '差一点点，再看看提示。',
    mathHint: '小小提示',
    mathSuccess: '数字花园的答案已经解开',
    mathCodeAria: (code) => `数字 ${code}`,
    chemistrySelect: '先点元素，再点名字',
    chemistryWrong: '再想想，它们好像不是一对。',
    chemistryProgress: (matched, total) => `已配对 ${matched} / ${total}`,
    chemistrySuccess: '元素图鉴已经拼好',
    chemistryAgain: '重新配对',
    chemistryCaption: '→ 一段小小的化学反应',
  },
  quiz: {
    progress: (current, total) => `第 ${current} / ${total} 题`,
    pointsHint: (points) => `每题 ${points} 分`,
    choose: '选一个答案',
    result: '你的总分',
    again: '再来一次',
    noteLabel: '写给你的一句话',
  },
  celebration: {
    close: '关闭',
    leftLabel: '小狗',
    rightLabel: '小猫',
    leftEmpty: '点击放入照片',
    rightEmpty: '点击放入照片',
    leftAria: '左侧照片卡槽',
    rightAria: '右侧照片卡槽',
    changePhoto: '点击更换照片',
    save: '保存纪念卡',
    saving: '正在保存…',
    saveHint: '放好左右两张照片后，就能保存这张纪念卡',
    downloaded: '纪念卡已保存到本地',
    datePrefix: '记录于',
    photoReady: '照片已放好',
  },
  photo: {
    title: '放一张照片进来',
    subtitle: '可以现在拍一张，也可以从系统相册上传。',
    kickerChoose: 'A LITTLE PHOTO MOMENT',
    kickerCamera: 'FRONT CAMERA',
    kickerPreview: 'PREVIEW',
    emptySub: 'CAMERA / GALLERY',
    takePhoto: '现在拍照',
    upload: '从相册上传',
    cancel: '取消',
    shoot: '拍下这一刻',
    retake: '重拍',
    reupload: '重新上传',
    savePhoto: '保存照片',
    cameraStarting: '正在打开摄像头…',
    cameraError: '暂时无法打开摄像头，可以先从相册上传。',
    fileError: '这张图片读取失败了，换一张试试。',
    mirrored: '前置摄像头画面为镜像，保存时会自动校正。',
    captureSuccess: '照片预览',
    closeAria: '关闭照片选择',
  },
  starDateAria: (text) => `星光拼成的 ${text}`,
}

