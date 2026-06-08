# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copiar descriptores de paquetes e instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código fuente
COPY . .

# Declarar los argumentos de compilación para las variables de entorno de Supabase
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

# Asignar los argumentos a variables de entorno para que Vite las embeba
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Construir el bundle de producción
RUN npm run build

# Stage 2: Serve stage
FROM nginx:alpine

# Copiar los archivos generados a la ruta por defecto de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar la configuración personalizada de Nginx para SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
