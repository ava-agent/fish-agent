import { GearItem } from '../game/types';

export const AI_EQUIPMENT: GearItem[] = [
  {
    id: 'neural_line',
    name: 'Neural Network Line',
    nameCn: '神经网络鱼线',
    type: 'line',
    description: '张力自动向最佳区间微调',
    stats: { strength: 8, diameter: 0.25, sensitivity: 9, autoTension: 0.05 },
  },
  {
    id: 'attention_rod',
    name: 'Attention Rod',
    nameCn: '注意力鱼竿',
    type: 'rod',
    description: '等待阶段显示 2 个浮漂',
    stats: { length: 4.5, power: 8, sensitivity: 10, dualBobber: 1 },
  },
  {
    id: 'gradient_hook',
    name: 'Gradient Descent Hook',
    nameCn: '梯度下降鱼钩',
    type: 'hook',
    description: '鱼体力消耗速度逐渐加快',
    stats: { size: 6, sharpness: 9, strength: 8, acceleratingDrain: 0.001 },
  },
];
