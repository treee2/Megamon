// Вспомогательная функция для создания URL страниц
export function createPageUrl(pageName) {
  // Преобразуем название страницы в нижний регистр для URL
  return `/${pageName.toLowerCase()}`;
}