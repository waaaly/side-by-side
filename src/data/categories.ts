export interface CategoryGroup {
  id: string
  name: string
  emoji: string
  bgColor: string
  textColor: string
}

export interface CategoryItem {
  value: string
  label: string
  emoji: string
  groupId: string
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  { id: 'food', name: '饮食', emoji: '🍔', bgColor: 'bg-amber-50', textColor: 'text-amber-600' },
  { id: 'housing', name: '居住', emoji: '🏠', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600' },
  { id: 'transport', name: '出行', emoji: '🚗', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
  { id: 'shopping', name: '消费', emoji: '🛍️', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
  { id: 'growth', name: '成长', emoji: '📚', bgColor: 'bg-teal-50', textColor: 'text-teal-600' },
  { id: 'personal', name: '人情', emoji: '❤️', bgColor: 'bg-pink-50', textColor: 'text-pink-600' },
  { id: 'misc', name: '杂项', emoji: '🧰', bgColor: 'bg-gray-50', textColor: 'text-gray-600' },
]

export const CATEGORIES: CategoryItem[] = [
  { value: 'dining', label: '餐饮', emoji: '🍜', groupId: 'food' },
  { value: 'vegetable', label: '蔬菜', emoji: '🥬', groupId: 'food' },
  { value: 'fruit', label: '水果', emoji: '🍎', groupId: 'food' },
  { value: 'beverage', label: '饮料', emoji: '🥤', groupId: 'food' },
  { value: 'alcohol', label: '烟酒', emoji: '🍺', groupId: 'food' },
  { value: 'snack', label: '零食', emoji: '🍿', groupId: 'food' },
  { value: 'rent', label: '住房', emoji: '🏠', groupId: 'housing' },
  { value: 'home', label: '居家', emoji: '🛋️', groupId: 'housing' },
  { value: 'daily', label: '日用', emoji: '🧴', groupId: 'housing' },
  { value: 'communication', label: '通讯', emoji: '📞', groupId: 'housing' },
  { value: 'utility', label: '水电', emoji: '💡', groupId: 'housing' },
  { value: 'transit', label: '交通', emoji: '🚌', groupId: 'transport' },
  { value: 'car', label: '汽车', emoji: '🚗', groupId: 'transport' },
  { value: 'travel', label: '旅行', emoji: '✈️', groupId: 'transport' },
  { value: 'hotel', label: '酒店', emoji: '🏨', groupId: 'transport' },
  { value: 'general', label: '购物', emoji: '🛍️', groupId: 'shopping' },
  { value: 'clothing', label: '服饰', emoji: '👗', groupId: 'shopping' },
  { value: 'beauty', label: '美容', emoji: '💄', groupId: 'shopping' },
  { value: 'digital', label: '数码', emoji: '📱', groupId: 'shopping' },
  { value: 'electronics', label: '电子', emoji: '🖥️', groupId: 'shopping' },
  { value: 'entertainment', label: '娱乐', emoji: '🎮', groupId: 'shopping' },
  { value: 'sports', label: '运动', emoji: '⛹', groupId: 'shopping' },
  { value: 'social', label: '社交', emoji: '🤝', groupId: 'shopping' },
  { value: 'books', label: '书籍', emoji: '📖', groupId: 'growth' },
  { value: 'learning', label: '学习', emoji: '🎓', groupId: 'growth' },
  { value: 'elderly', label: '长辈', emoji: '👴', groupId: 'personal' },
  { value: 'children', label: '孩子', emoji: '👶', groupId: 'personal' },
  { value: 'giftMoney', label: '礼金', emoji: '🧧', groupId: 'personal' },
  { value: 'pet', label: '宠物', emoji: '🐾', groupId: 'personal' },
  { value: 'medical', label: '医疗', emoji: '🏥', groupId: 'misc' },
  { value: 'delivery', label: '快递', emoji: '📦', groupId: 'misc' },
  { value: 'internet', label: '网络', emoji: '🌐', groupId: 'misc' },
  { value: 'finance', label: '理财', emoji: '💰', groupId: 'misc' },
]

export function getCategory(value: string): CategoryItem | undefined {
  return CATEGORIES.find((c) => c.value === value)
}

export function getGroup(groupId: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((g) => g.id === groupId)
}

export function getCategoriesByGroup(groupId: string): CategoryItem[] {
  return CATEGORIES.filter((c) => c.groupId === groupId)
}
