# Используем Node.js образ
FROM node:18

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --only=production

# Копируем весь проект
COPY . .

# Указываем порт для сервера
EXPOSE 2050

# Запуск приложения
CMD ["node", "index.js"]
