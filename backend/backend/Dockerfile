# Usa una imagen base de Node.js
FROM node:18.16.1

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos necesarios del servidor Node.js al directorio de trabajo del contenedor
COPY package*.json ./

RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .
#RUN chmod -R a+x node_modules
#RUN npm run dev

# Exponer el puerto en el que el servidor Node.js escucha (por ejemplo, 3000)
EXPOSE 3100

# Comando para iniciar el servidor web al ejecutar el contenedor
CMD ["npm", "run", "dev"]

#nodemon app.js