-- ============================================================
-- FIX: handle_new_user falla en toda alta vía GoTrue
-- ============================================================
-- GoTrue inserta en auth.users con el rol `supabase_auth_admin`,
-- cuyo search_path es solo `auth`. La función del trigger
-- handle_new_user es SECURITY DEFINER pero NO fijaba su propio
-- search_path y hacía `INSERT INTO profiles` (sin esquema), que
-- bajo search_path=auth no resuelve -> el trigger lanza excepción
-- y el signup falla con "Database error creating new user".
--
-- Solución: fijar search_path en la función y calificar la tabla
-- como public.profiles (práctica recomendada de Supabase).
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;
