# 钓鱼佬 - 像素风钓鱼模拟游戏

一款面向钓鱼爱好者的像素风移动端趣味应用，集钓鱼模拟、百科图鉴、社区推荐、钓鱼日记于一体。

## 功能模块

### 1. 模拟钓鱼 (首页)

交互式钓鱼模拟游戏，完整还原钓鱼流程：

- **选饵** — 6 种鱼饵（蚯蚓/玉米/面饵/小鱼/路亚/虾），每种对不同鱼种有不同效果
- **抛竿** — 蓄力条控制抛投距离
- **等待** — 浮漂在水面浮动，鱼 AI 根据鱼饵匹配度决定是否咬钩
- **上钩** — 浮漂下沉提示，2.5 秒内点击设钩
- **遛鱼** — 核心玩法：控制线张力（太松脱钩/太紧断线），画圈手势收线，消耗鱼体力
- **收获** — 展示鱼的像素图、重量、稀有度，自动记入图鉴

### 2. 钓鱼百科

- **鱼种图鉴** — 12 种鱼（鲫鱼/草鱼/青鱼/鲤鱼/鲶鱼/鲢鱼/鳜鱼/黑鱼/罗非鱼/大口黑鲈/黄颡鱼/锦鲤），含属性、栖息地、实钓小贴士
- **钓具大全** — 11 种装备（鱼竿/鱼线/鱼钩）含属性对比
- **钓法教程** — 5 种钓法（台钓/底钓/路亚/飞蝇/夜钓）含操作步骤

### 3. 钓鱼社区

- **社区推荐** — 6 个钓鱼论坛/App/公众号推荐
- **钓点推荐** — 5 类钓鱼场所（水库/鱼塘/河流/黑坑/海边矶钓）含实用建议

### 4. 钓鱼记录

- **钓鱼日记** — 记录每次钓鱼的地点、天气、时长、鱼获
- **数据统计** — 出钓次数、总钓获、图鉴收集进度

## 技术栈

| 技术 | 用途 |
|------|------|
| React Native + Expo SDK 54 | 跨平台框架 |
| expo-router | 文件路由系统 |
| Zustand | 状态管理 |
| AsyncStorage | 本地数据持久化 |
| Supabase | 云端数据库（可选） |
| React Native Animated | 动画系统 |
| PanResponder | 手势交互 |

## 项目结构

```
fish-agent/
├── app/                          # Expo Router 文件路由
│   ├── _layout.tsx               # 根布局
│   └── (tabs)/
│       ├── _layout.tsx           # Tab 导航 (4 个 Tab)
│       ├── index.tsx             # 钓鱼模拟游戏
│       ├── encyclopedia/         # 百科模块
│       │   ├── index.tsx         # 鱼种图鉴列表
│       │   ├── [fishId].tsx      # 鱼种详情
│       │   ├── gear.tsx          # 钓具目录
│       │   └── techniques.tsx    # 钓法教程
│       ├── community/            # 社区模块
│       │   ├── index.tsx         # 社区推荐
│       │   └── spots.tsx         # 钓点列表
│       └── records/              # 记录模块
│           ├── index.tsx         # 钓鱼日记时间线
│           ├── new.tsx           # 新建记录
│           └── stats.tsx         # 统计面板
├── src/
│   ├── components/common/        # 像素风 UI 组件
│   ├── data/                     # 静态数据 (鱼种/钓具/鱼饵/社区)
│   ├── game/types.ts             # TypeScript 类型定义
│   ├── stores/                   # Zustand 状态管理
│   ├── theme/                    # 主题 (颜色/间距/字体)
│   └── utils/supabase.ts        # Supabase 客户端
├── supabase/migrations/          # 数据库迁移脚本
├── vercel.json                   # Vercel 部署配置
└── app.json                      # Expo 配置
```

## 像素风设计

所有视觉元素均通过代码绘制，无需外部图片资源：

- 鱼类精灵使用 2D 数字矩阵 + 调色板渲染
- 场景元素（天空、太阳、树木、草地、水面）使用 View 组件拼接
- 水面动画使用正弦波驱动蓝色方块的垂直偏移
- UI 组件统一使用像素风边框和配色方案

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 启动 Web 版本
npx expo start --web

# 启动 iOS 模拟器
npx expo start --ios

# 启动 Android 模拟器
npx expo start --android
```

## 部署

### Vercel (Web)

项目已配置 `vercel.json`，支持一键部署：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

或通过 GitHub 连接 Vercel 实现自动部署。

### Supabase (可选)

如需云端数据同步：

1. 创建 Supabase 项目
2. 复制 `.env.example` 为 `.env` 并填入 Supabase 凭据
3. 执行 `supabase/migrations/001_initial_schema.sql` 创建数据库表

## 环境变量

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## License

MIT
