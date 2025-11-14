# 🚀 Railway Deployment Guide

## 📁 Структура проекта

Проект настроен для деплоя на Railway:
- **Frontend**: React + Vite (порт динамический)
- **Backend**: Express + SQLite (порт динамический)

## 📋 Предварительные требования

1. Аккаунт на [Railway.app](https://railway.app)
2. GitHub репозиторий с вашим кодом
3. Git установлен локально

## 🎯 Рекомендуемый метод: Два отдельных сервиса

### Шаг 1: Подготовка репозитория

```bash
cd apartment-booking
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Шаг 2: Деплой Backend Service

1. **Войдите на Railway.app** → Создайте новый проект
2. **New Service** → **GitHub Repo** → Выберите ваш репозиторий
3. **Settings** → Root Directory: `server`
4. **Variables** → Добавьте переменные:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.railway.app
   ```
5. Railway автоматически:
   - Установит зависимости (`npm install`)
   - Запустит сервер (`npm start`)
   - Присвоит порт через переменную `PORT`

6. **Получите URL** backend сервиса (например: `https://backend-production-xxxx.railway.app`)

### Шаг 3: Деплой Frontend Service

1. В том же проекте **New Service** → **GitHub Repo** → Тот же репозиторий
2. **Settings** → Root Directory: `оставьте пустым` (корень)
3. **Variables** → Добавьте переменные:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   NODE_ENV=production
   ```
4. Railway автоматически:
   - Установит зависимости
   - Соберет проект (`npm run build`)
   - Запустит preview сервер

### Шаг 4: Обновление CORS

В Railway Dashboard → Backend Service → Variables → Добавьте:
```
FRONTEND_URL=https://your-frontend-url.railway.app
```

## 🔄 Альтернативный метод: Monorepo (один сервис)

Если хотите один сервис (не рекомендуется для production):

1. Используйте файл `nixpacks.toml` в корне
2. Установите переменные:
   ```
   NODE_ENV=production
   ```
3. Railway запустит `npm run start:all`

## 📝 Структура файлов для Railway

```
apartment-booking/
├── railway.json              # Конфигурация Railway
├── nixpacks.toml            # Инструкции сборки (monorepo)
├── .railwayignore           # Игнорируемые файлы
├── .env.example             # Пример переменных окружения
├── RAILWAY_DEPLOY.md        # Эта инструкция
├── package.json             # Frontend dependencies
├── vite.config.js
├── src/
│   └── api/
│       └── base44Client.js  # Использует VITE_API_URL
└── server/
    ├── nixpacks.toml        # Инструкции для backend
    ├── .railwayignore
    ├── package.json         # Backend dependencies
    ├── index.js             # Использует process.env.PORT
    └── database/
        ├── db.js
        └── init.sql
```

## ⚙️ Переменные окружения

### Backend Service
```env
PORT=автоматически           # Устанавливается Railway
NODE_ENV=production
FRONTEND_URL=https://...     # URL вашего frontend
```

### Frontend Service
```env
PORT=автоматически           # Устанавливается Railway
NODE_ENV=production
VITE_API_URL=https://...     # URL вашего backend + /api
```

## ✅ Проверка деплоя

1. Backend: `https://your-backend.railway.app/api/apartments` → должен вернуть JSON
2. Frontend: `https://your-frontend.railway.app` → должна открыться страница
3. Проверьте логи в Railway Dashboard при ошибках

## ⚠️ Важные моменты

### SQLite на Railway
- ❌ **Не персистентна** - данные теряются при рестарте/редеплое
- ✅ Подходит только для тестирования
- 💡 Для production используйте PostgreSQL

### Миграция на PostgreSQL

1. **В Railway Dashboard**:
   - New → Database → PostgreSQL
   - Скопируйте `DATABASE_URL`

2. **Обновите Backend**:
   ```bash
   cd server
   npm install pg
   ```

3. **Обновите `server/database/db.js`**:
   ```javascript
   import pg from 'pg';
   const { Pool } = pg;
   
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   ```

4. **Измените SQL синтаксис** в `init.sql` для PostgreSQL

### Изображения
- Сейчас хранятся как base64 в БД
- Для production рекомендуется использовать:
  - Cloudinary
  - AWS S3
  - Railway Volumes (для SQLite persistence)

## 🐛 Troubleshooting

### "Cannot GET /"
- Frontend не собран: проверьте Build Logs
- Неправильный Start Command

### "CORS error"
- Проверьте `FRONTEND_URL` в Backend Variables
- Убедитесь, что URL без trailing slash

### "Failed to fetch"
- Проверьте `VITE_API_URL` в Frontend Variables
- URL должен включать `/api`

### "Database is locked"
- SQLite не подходит для Railway
- Мигрируйте на PostgreSQL

## 📚 Дополнительные ресурсы

- [Railway Docs](https://docs.railway.app)
- [Nixpacks Docs](https://nixpacks.com)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)

## 🎉 Готово!

После успешного деплоя:
1. ✅ Backend работает на `https://your-backend.railway.app`
2. ✅ Frontend доступен на `https://your-frontend.railway.app`
3. ✅ Приложение полностью функционально

**Не забудьте**:
- Добавить домен (опционально)
- Настроить PostgreSQL для production
- Настроить систему хранения файлов для изображений
