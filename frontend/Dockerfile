# Используем Node.js образ для фронтенда
FROM node:18 AS build

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходные файлы проекта
COPY . .

# Собираем проект
RUN npm run build

# Теперь используем Nginx для обслуживания статики
FROM nginx:1.23-alpine

# Копируем собранные файлы
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем кастомный конфиг Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Открываем порт 80 для Nginx
EXPOSE 80

# Запускаем Nginx
CMD ["nginx", "-g", "daemon off;"]
