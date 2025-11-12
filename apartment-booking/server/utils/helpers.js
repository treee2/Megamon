// Функция для генерации уникального ID
export function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}