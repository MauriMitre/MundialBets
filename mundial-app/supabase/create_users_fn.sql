-- Pegar en Supabase SQL Editor y ejecutar ANTES de correr el script
-- Esta función crea los profiles directamente desde SQL (sin trigger)

CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_username TEXT,
  p_display_name TEXT,
  p_is_admin BOOLEAN DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, is_admin, total_points)
  VALUES (p_user_id, p_username, p_display_name, p_is_admin, 0)
  ON CONFLICT (id) DO UPDATE
    SET username = EXCLUDED.username,
        display_name = EXCLUDED.display_name,
        is_admin = EXCLUDED.is_admin;
END;
$$;
