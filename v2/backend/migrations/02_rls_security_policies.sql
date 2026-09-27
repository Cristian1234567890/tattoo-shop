-- Habilitar Row Level Security en las tablas principales
ALTER TABLE tatuadores_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscription ENABLE ROW LEVEL SECURITY;

-- Política 1: Los clientes y tatuadores pueden ver los perfiles públicos de tatuadores
CREATE POLICY "Perfiles de tatuadores son públicos" 
ON tatuadores_data FOR SELECT 
USING (true);

-- Política 2: Los tatuadores solo pueden actualizar su propia información
CREATE POLICY "Tatuadores actualizan su propio perfil" 
ON tatuadores_data FOR UPDATE 
USING (auth.uid() = id);

-- Política 3: Inserción permitida solo para el usuario dueño del perfil
CREATE POLICY "Tatuadores crean su propio perfil" 
ON tatuadores_data FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Política 4: Suscripciones solo pueden ser leídas por el propio usuario o el rol de servicio
CREATE POLICY "Usuarios ven su propia suscripción" 
ON user_subscription FOR SELECT 
USING (auth.uid() = user_id);

-- Política 5: Solo administradores (service role) o el propio usuario pueden actualizar suscripciones
CREATE POLICY "Actualizar suscripción" 
ON user_subscription FOR UPDATE 
USING (auth.uid() = user_id);
