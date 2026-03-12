# 钓鱼佬 × AI — "AI 入侵" 游戏设计文档

## 概述

将现有像素风钓鱼模拟游戏升级为一个融合 AI 主题的趣味游戏。核心概念：真实的钓鱼世界正在被 AI "入侵"，玩家在钓鱼时除了普通鱼，还会随机钓上 AI 生物。钓到的 AI 碎片可以用来组装和升级 AI 助手，助手反过来增强钓鱼能力。

**调性**：轻松幽默 / 梗文化。"你本来想钓条鲫鱼，结果钓上来一个 ChatGPT，它开始教你怎么钓鱼。"

**核心循环**：钓上 AI 生物(收集) → 获得 AI 资源(材料) → 组装 AI 助手(养成) → 助手帮你钓到更稀有的东西(增强) → 循环

## 1. AI 生物系统

### 1.1 生物列表（首批 8 种）

在现有 12 种真鱼基础上，新增 8 种 AI 生物到同一物种池：

| 名称 | 稀有度 | 难度 | fightStrength | 重量范围 | 梗点 |
|------|--------|------|---------------|----------|------|
| Prompt 精灵 | 普通 (common) | 1 | 0.2 | 0.1-0.5kg | 你说什么它就做什么，但经常理解错误 |
| Token 小鱼群 | 普通 (common) | 1 | 0.15 | 0.01-0.1kg | 一群闪闪发光的小鱼，每条价值 $0.001 |
| Hallucination 水母 | 稀有 (rare) | 2 | 0.4 | 0.5-2kg | 信誓旦旦地说自己是鲨鱼，坚称从未被钓过 |
| 过拟合章鱼 | 稀有 (rare) | 3 | 0.5 | 1-5kg | 只会重复上次被钓的动作，换饵就不认识了 |
| GAN 双生鱼 | 稀有 (rare) | 3 | 0.55 | 0.5-3kg | 一真一假两条鱼，你永远分不清哪条是生成的 |
| Transformer 鲸 | 史诗 (epic) | 4 | 0.8 | 10-50kg | 庞然大物，自带注意力机制，能同时注意 8 个鱼饵 |
| Loss 深海鱼 | 史诗 (epic) | 4 | 0.3 | 5-20kg | 住在损失函数的最低点，极难找到但一旦找到就不会逃跑 |
| AGI 锦鲤 | 传说 (legendary) | 5 | 0.95 | 0.5-100kg | 传说中的通用智能体，没人真的见过，据说能解决一切 |

### 1.2 出现机制

AI 生物混入现有鱼群的抽奖池，复用现有的 `bait.effectiveness[fishId]` 机制：

- 基础出现率：普通 15%、稀有 8%、史诗 3%、传说 0.5%
- AI 主题鱼饵大幅提升 AI 生物咬钩率
- 真鱼依然正常出现，保持核心钓鱼体验

### 1.3 AI 生物数据结构

复用现有 `FishSpecies` 类型，扩展 `category` 字段：

```typescript
// 扩展现有类型
interface FishSpecies {
  // ... 现有字段
  category: 'fish' | 'ai_creature';   // 新增：分类
  quoteOnCatch?: string;              // 新增：捕获时的搞笑台词
  drops?: ResourceDrop[];             // 新增：资源掉落
}

interface ResourceDrop {
  type: 'prompt_fragment' | 'model_params' | 'training_data' | 'compute_crystal';
  amount: number;
}
```

### 1.4 收获反馈

钓到 AI 生物时，结果界面增加：
- 紫色主题背景（区别于真鱼的蓝色）
- "★★★ AI 实体捕获！★★★" 标题
- 搞笑台词显示
- 资源掉落展示
- 成就进度提示

台词示例：
- Hallucination 水母："我不是水母！我是 2024 年图灵奖得主！（来源：我自己）"
- Transformer 鲸："Attention is all I need... 还有你的鱼饵"
- AGI 锦鲤："恭喜你实现了 AGI！...开玩笑的，我只是条鱼"
- 过拟合章鱼："上次你用蚯蚓钓我的...等等，这次怎么是玉米？我不认识玉米"
- GAN 双生鱼："哪条是真的？其实我们自己也不知道"
- Token 小鱼群："请注意：本次捕获消耗了 0.003 美元"
- Prompt 精灵："你说'钓鱼'？好的，正在为您生成一首关于钓鱼的诗..."
- Loss 深海鱼："你找到了全局最优解...或者只是局部最优？"

## 2. AI 助手养成系统

### 2.1 资源体系

| 资源 | 图标 | 来源 | 用途 |
|------|------|------|------|
| Prompt 碎片 | 💎 | Prompt 精灵、普通 AI 生物 | 升级「生成」属性 |
| 模型参数 | 🔮 | Transformer 鲸、GAN 双生鱼等稀有+ | 升级「推理」属性 |
| 训练数据 | 📊 | 任何鱼（真鱼也掉，但少）| 升级「感知」属性 + 通用经验值 |
| 算力晶体 | 🔴 | 史诗/传说级 AI 生物、完成成就 | 升级「算力」属性 |

### 2.2 AI 助手属性

玩家拥有一个 AI 助手（像素风小机器人），4 个可升级属性：

| 属性 | 效果 | 等级上限 | 升级材料 |
|------|------|----------|----------|
| 感知 (Perception) | 等待阶段显示鱼影提示气泡；Lv.3+ 提前预判咬钩时机 | Lv.5 | 训练数据 |
| 推理 (Reasoning) | 咬钩时显示鱼种预测（"87% 概率是 Transformer 鲸"）| Lv.5 | 模型参数 |
| 生成 (Generation) | 选饵界面标注"AI 推荐"最佳鱼饵 | Lv.5 | Prompt 碎片 |
| 算力 (Compute) | 遛鱼时降低难度：鱼体力消耗加速 | Lv.5 | 算力晶体 |

### 2.3 助手等级

总等级 = 4 个属性等级之和 / 4（向下取整）

| 等级 | 称号 | 外观变化 |
|------|------|----------|
| Lv.1 | "Hello World" | 基础灰色机器人 |
| Lv.2 | "Training..." | 眼睛发光 |
| Lv.3 | "Fine-tuning" | 身体变蓝 |
| Lv.4 | "Production Ready" | 金色边框 |
| Lv.5 | "AGI Candidate" | 全身发光 + 光环 |

### 2.4 状态管理

新增 `useAgentStore` (Zustand + AsyncStorage 持久化)：

```typescript
interface AgentState {
  level: number;
  perception: number;      // 0-5
  reasoning: number;       // 0-5
  generation: number;      // 0-5
  compute: number;         // 0-5
  resources: {
    promptFragments: number;
    modelParams: number;
    trainingData: number;
    computeCrystals: number;
  };
  // Actions
  upgradeAttribute: (attr: AgentAttribute) => boolean;
  addResources: (drops: ResourceDrop[]) => void;
}
```

## 3. 装备系统生效

### 3.1 装备属性影响战斗

现有 14 种装备数据已有属性值，现在让它们真正生效：

| 装备类型 | 属性 → 机制映射 |
|----------|-----------------|
| 鱼竿 | `power` → 抛竿距离上限（更远=稀有鱼概率高）；`sensitivity` → bite 阶段反应窗口时长（2.5s → 最高 4s） |
| 鱼线 | `strength` → 断线张力阈值（0.85 → 最高 0.95）；`diameter` → 张力自然衰减速度 |
| 鱼钩 | `sharpness` → 咬钩成功率加成；`size` → 可钓鱼种范围（小钩钓不了大鱼） |

### 3.2 装备获取

- 低概率钓到装备碎片
- 3 个同类碎片合成一件装备

### 3.3 AI 主题特殊装备（3 种）

| 名称 | 效果 | 获取 |
|------|------|------|
| 神经网络鱼线 | 张力自动向最佳区间微调（±0.05/tick）| 钓 AI 生物小概率掉落 |
| 注意力鱼竿 | 等待阶段显示 2 个浮漂，选择更多的 | 钓到 Transformer 鲸后解锁 |
| 梯度下降鱼钩 | 鱼体力消耗速度逐渐加快（每 tick +0.001）| 钓到 Loss 深海鱼后解锁 |

### 3.4 状态管理

新增 `useEquipmentStore` (Zustand + AsyncStorage)：

```typescript
interface EquipmentState {
  equipped: {
    rod: string | null;
    line: string | null;
    hook: string | null;
  };
  inventory: EquipmentItem[];
  fragments: Record<string, number>;  // fragmentId → count
  // Actions
  equip: (slot: EquipmentSlot, itemId: string) => void;
  addFragment: (fragmentId: string) => void;
  craftEquipment: (fragmentId: string) => boolean;  // 3 fragments → 1 item
}
```

## 4. 新增鱼饵（2 种）

| 鱼饵 ID | 名称 | 解锁条件 | AI 生物效果 | 真鱼效果 |
|---------|------|----------|------------|----------|
| data_fragment | 数据碎片 | 成就"初次接触" | 0.7-0.9 | 0.1 |
| compute_chip | 算力芯片 | 成就"全栈钓手" | 0.8-0.95（史诗/传说）；0.3（普通） | 0.05 |

## 5. 成就系统

### 5.1 成就列表

| ID | 名称 | 条件 | 奖励 |
|----|------|------|------|
| first_contact | 初次接触 | 钓到第 1 个 AI 生物 | 解锁"数据碎片"鱼饵 |
| hallucination_master | 幻觉大师 | 钓到 3 只 Hallucination 水母 | Prompt 碎片 ×10 |
| full_stack | 全栈钓手 | 真鱼和 AI 生物各集齐 5 种 | 解锁"算力芯片"鱼饵 |
| attention | Attention! | 钓到 Transformer 鲸 | 算力晶体 ×3 |
| combo_5 | 连续 Combo | 连续钓到 5 条不断线 | 装备碎片 ×1 |
| all_hallucination | 都是幻觉 | 被 Hallucination 水母的预测骗 3 次 | 专属称号"幻觉鉴定师" |
| agi_achieved | AGI 已达成？ | 钓到 AGI 锦鲤 | AI 助手直升 3 级 |

### 5.2 状态管理

新增 `useAchievementStore` (Zustand + AsyncStorage)：

```typescript
interface AchievementState {
  achievements: Record<string, AchievementProgress>;
  // Actions
  checkAndUnlock: (event: GameEvent) => Achievement[];  // 返回新解锁的成就
  getProgress: (achievementId: string) => AchievementProgress;
}

interface AchievementProgress {
  unlocked: boolean;
  progress: number;
  target: number;
  unlockedAt?: string;
}
```

## 6. UI 架构变更

### 6.1 Tab 结构

从 4 Tab 改为 5 Tab：

| 位置 | 原 Tab | 新 Tab | 变化 |
|------|--------|--------|------|
| 1 | 钓鱼 🎣 | 钓鱼 🎣 | 增加装备栏、AI 助手 HUD、数据粒子效果 |
| 2 | 百科 📖 | AI 助手 🤖 | 新增：养成界面 |
| 3 | 社区 👥 | 图鉴 📖 | 改造：合并真鱼+AI 生物，增加筛选 |
| 4 | 记录 📝 | 成就 🏆 | 新增：成就列表和进度 |
| 5 | - | 记录 📝 | 保留原有功能 |

### 6.2 钓鱼主界面新增元素

- **AI 助手 HUD**（右上角）：显示助手等级、推荐鱼饵、鱼种预测
- **装备栏**（底部左）：显示当前装备
- **鱼饵栏**（底部右）：显示当前鱼饵 + AI 推荐标签
- **数据流粒子**（水面）：浮动的 `01`、`AI`、`∇` 符号，暗示 AI 生物出没

### 6.3 收获界面分叉

- 真鱼：保持现有蓝色主题
- AI 生物：紫色主题 + 搞笑台词 + 资源掉落展示

## 7. 文件变更清单

### 新增文件

| 文件 | 用途 |
|------|------|
| `src/data/aiCreatures.ts` | 8 种 AI 生物数据定义 |
| `src/data/achievements.ts` | 成就定义 |
| `src/data/aiEquipment.ts` | 3 种 AI 特殊装备数据 |
| `src/stores/agentStore.ts` | AI 助手状态管理 |
| `src/stores/achievementStore.ts` | 成就状态管理 |
| `src/stores/equipmentStore.ts` | 装备状态管理 |
| `app/(tabs)/agent.tsx` | AI 助手 Tab 页面 |
| `app/(tabs)/achievements.tsx` | 成就 Tab 页面 |

### 修改文件

| 文件 | 变更内容 |
|------|----------|
| `src/game/types.ts` | 扩展 FishSpecies 类型，新增资源/装备/成就类型 |
| `src/data/fish.ts` | 真鱼数据增加 `category: 'fish'` 字段 |
| `src/data/bait.ts` | 新增 2 种 AI 鱼饵 |
| `src/stores/gameStore.ts` | 战斗公式加入装备修正 + AI 助手加成 |
| `src/stores/fishDexStore.ts` | 支持 AI 生物图鉴 |
| `app/(tabs)/index.tsx` | 游戏界面增加 HUD 元素、装备栏、数据粒子 |
| `app/(tabs)/_layout.tsx` | 5 Tab 布局 |
| `app/(tabs)/encyclopedia/index.tsx` | 合并展示真鱼 + AI 生物 |

## 8. 实施优先级

按以下顺序增量实施，每步可独立验证：

1. **数据层** — AI 生物数据 + 类型扩展 + AI 鱼饵
2. **物种池混合** — 修改 gameStore 让 AI 生物出现在钓鱼中
3. **收获界面** — AI 生物专属结果弹窗（台词 + 紫色主题）
4. **资源系统** — agentStore 资源收集
5. **AI 助手养成** — 助手 Tab + 属性升级
6. **助手游戏内效果** — HUD 提示 + 属性加成生效
7. **装备系统** — equipmentStore + 装备影响战斗
8. **成就系统** — achievementStore + 成就 Tab
9. **图鉴改造** — 合并展示 + 筛选
10. **Tab 重组** — 5 Tab 布局调整
