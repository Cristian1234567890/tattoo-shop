# Usa una imagen base que incluya un servidor web (por ejemplo, nginx)
FROM nginx:latest

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/share/nginx/html

COPY . /usr/share/nginx/html
COPY .* .

# Exponer el puerto 8081
EXPOSE 8080

# Comando para iniciar el servidor web al ejecutar el contenedor
CMD ["nginx", "-g", "daemon off;"]