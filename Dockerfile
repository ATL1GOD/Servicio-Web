# Usa una imagen de Node.js
FROM node:18-slim
# Crea el directorio de la app
WORKDIR /app
# Copia los archivos necesarios
COPY package*.json ./
COPY server.js ./
# Instala dependencias
RUN npm install
# Expone el puerto
EXPOSE 3000
# Comando para iniciar la app
CMD ["npm", "start"]
