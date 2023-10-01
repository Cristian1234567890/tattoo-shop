# Usa una imagen base que incluya un servidor web (por ejemplo, nginx)
FROM nginx:latest

# Copia los archivos de la aplicación al directorio de trabajo del contenedor
COPY . /usr/share/nginx/html

# Exponer el puerto 8081
EXPOSE 8081

# Comando para iniciar el servidor web al ejecutar el contenedor
CMD ["nginx", "-g", "daemon off;"]