# Usa la imagen oficial de Nginx como base
FROM nginx:latest

# Establece el directorio de trabajo en /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Copia los archivos estáticos al contenedor
COPY . .

# Exponer el puerto 8081
EXPOSE 8080

# Comando para iniciar el servidor Nginx en primer plano (no se detiene el contenedor cuando el proceso principal termina)
CMD ["nginx", "-g", "daemon off;"]