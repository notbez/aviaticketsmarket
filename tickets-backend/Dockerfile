FROM node:18-alpine
WORKDIR /usr/src/app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# Удаляем dev зависимости после сборки
RUN rm -rf node_modules && npm ci --only=production && npm cache clean --force

EXPOSE 3000

# Используем node для запуска
CMD ["node", "dist/main.js"]