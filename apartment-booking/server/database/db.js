import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Эти строки нужны для работы с путями в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к файлу базы данных
const dbPath = path.join(__dirname, 'apartments.db');

// Создаём или открываем базу данных
const db = new Database(dbPath);

// Включаем поддержку внешних ключей (это важно для связей между таблицами)
db.pragma('foreign_keys = ON');

// Функция для инициализации базы данных
export function initDatabase() {
  console.log('🔧 Инициализация базы данных...');
  
  try {
    // Читаем SQL-файл с инструкциями
    const initSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf-8');
    
    // Выполняем все SQL-команды
    db.exec(initSQL);
    
    console.log('✅ База данных успешно инициализирована!');
  } catch (error) {
    console.error('❌ Ошибка при инициализации базы данных:', error);
    throw error;
  }
}

// Экспортируем объект базы данных для использования в других файлах
export default db;