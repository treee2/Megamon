# Интеграция Stripe - Инструкция по настройке

## Шаг 1: Установка зависимостей

### Backend (Server)
```bash
cd server
npm install stripe dotenv
```

### Frontend (уже установлено)
Пакет `stripe` уже установлен в `package.json`

## Шаг 2: Получение API ключей Stripe

1. Зарегистрируйтесь или войдите на https://dashboard.stripe.com/
2. Перейдите в раздел "Developers" -> "API keys"
3. Скопируйте ваши ключи:
   - **Publishable key** (начинается с `pk_test_...`)
   - **Secret key** (начинается с `sk_test_...`)

## Шаг 3: Настройка переменных окружения

### Backend (.env в папке server)
Создайте файл `.env` в папке `server/`:
```env
PORT=3001
NODE_ENV=development
DATABASE_PATH=./database/apartment.db

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_ваш_секретный_ключ
STRIPE_PUBLISHABLE_KEY=pk_test_ваш_публичный_ключ
STRIPE_WEBHOOK_SECRET=whsec_ваш_webhook_secret

FRONTEND_URL=http://localhost:5173
```

### Frontend (.env в корневой папке)
Создайте файл `.env` в корневой папке проекта:
```env
PORT=5173
VITE_API_URL=http://localhost:3001/api
NODE_ENV=development

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_ваш_публичный_ключ
```

## Шаг 4: Настройка Webhook (опционально для продакшн)

1. Установите Stripe CLI: https://docs.stripe.com/stripe-cli
2. Войдите в аккаунт: `stripe login`
3. Запустите webhook listener:
```bash
stripe listen --forward-to localhost:3001/api/payments/webhook
```
4. Скопируйте Webhook Secret (начинается с `whsec_...`) в `.env`

## Шаг 5: Тестирование

### Тестовые карты Stripe:
- **Успешная оплата**: `4242 4242 4242 4242`
- **Требует аутентификации**: `4000 0025 0000 3155`
- **Отклоненная оплата**: `4000 0000 0000 9995`

Используйте любую будущую дату для срока действия и любой 3-значный CVV.

## Файлы, которые были изменены/созданы:

### Backend:
- ✅ `server/utils/stripe.js` - инициализация Stripe
- ✅ `server/routes/payments.js` - добавлены эндпоинты для Payment Intent и Webhook
- ✅ `server/.env.example` - пример конфигурации

### Frontend:
- ✅ `src/pages/Payment.jsx` - интеграция Stripe Elements
- ✅ `src/components/StripeCheckoutForm.jsx` - форма оплаты
- ✅ `src/utils/stripe.js` - инициализация Stripe Promise
- ✅ `.env.example` - пример конфигурации

## Как это работает:

1. Пользователь выбирает "Банковская карта" на странице оплаты
2. Frontend создает Payment Intent через API (`/api/payments/create-payment-intent`)
3. Stripe возвращает `clientSecret`
4. Отображается форма Stripe Elements для ввода данных карты
5. При отправке формы Stripe обрабатывает оплату
6. Webhook уведомляет backend о результате
7. Backend обновляет статус бронирования в базе данных

## Безопасность:

- ✅ Данные карты никогда не проходят через ваш сервер
- ✅ Stripe обрабатывает все чувствительные данные
- ✅ Используется PCI-compliant инфраструктура Stripe
- ✅ Secret ключ хранится только на backend
- ✅ Webhook подписи проверяются для безопасности

## Следующие шаги:

1. Установите зависимости: `npm install stripe` в папке server
2. Создайте файлы `.env` с вашими ключами
3. Перезапустите сервер: `npm run dev:all`
4. Протестируйте оплату с тестовой картой

## Переход в продакшн:

1. Замените тестовые ключи (`pk_test_...`, `sk_test_...`) на продакшн ключи (`pk_live_...`, `sk_live_...`)
2. Настройте webhook в Stripe Dashboard для продакшн URL
3. Включите 3D Secure для дополнительной безопасности
4. Настройте email уведомления в Stripe Dashboard
