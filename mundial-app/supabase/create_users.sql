-- ============================================================
-- CREAR USUARIOS - MUNDIAL 2026
-- Pegar en: Supabase Dashboard > SQL Editor > New Query > Run
-- ============================================================

-- Paso 1: hacer el trigger resiliente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Paso 2: borrar usuarios previos si existían (para re-correr limpio)
DELETE FROM auth.users WHERE email LIKE '%@mundial.app';

-- Paso 3: crear los usuarios
DO $$
DECLARE uid UUID;
BEGIN

  -- Mauricio
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mauricio@mundial.app', crypt('111111', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"Mauricio","display_name":"Mauricio"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'mauricio@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'mauricio@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'Mauricio', 'Mauricio', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ Mauricio';

  -- TomasFa
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tomasfa@mundial.app', crypt('222222', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"TomasFa","display_name":"Tomas Fa"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'tomasfa@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'tomasfa@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'TomasFa', 'Tomas Fa', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ TomasFa';

  -- TomasFlo
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tomasflo@mundial.app', crypt('333333', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"TomasFlo","display_name":"Tomas Flo"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'tomasflo@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'tomasflo@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'TomasFlo', 'Tomas Flo', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ TomasFlo';

  -- LucasM
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lucasm@mundial.app', crypt('444444', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"LucasM","display_name":"Lucas M"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'lucasm@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'lucasm@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'LucasM', 'Lucas M', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ LucasM';

  -- LucasL
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'lucasl@mundial.app', crypt('555555', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"LucasL","display_name":"Lucas L"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'lucasl@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'lucasl@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'LucasL', 'Lucas L', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ LucasL';

  -- Gonzalo
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'gonzalo@mundial.app', crypt('666666', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"Gonzalo","display_name":"Gonzalo"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'gonzalo@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'gonzalo@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'Gonzalo', 'Gonzalo', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ Gonzalo';

  -- JuanBor
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'juanbor@mundial.app', crypt('777777', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"JuanBor","display_name":"Juan Bor"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'juanbor@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'juanbor@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'JuanBor', 'Juan Bor', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ JuanBor';

  -- JuanRea
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'juanrea@mundial.app', crypt('888888', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"JuanRea","display_name":"Juan Rea"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'juanrea@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'juanrea@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'JuanRea', 'Juan Rea', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ JuanRea';

  -- Elio
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'elio@mundial.app', crypt('999999', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"Elio","display_name":"Elio"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'elio@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'elio@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'Elio', 'Elio', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ Elio';

  -- Ramiro
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ramiro@mundial.app', crypt('101010', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"Ramiro","display_name":"Ramiro"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'ramiro@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'ramiro@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'Ramiro', 'Ramiro', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ Ramiro';

  -- Julian
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'julian@mundial.app', crypt('121212', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"Julian","display_name":"Julian"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'julian@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'julian@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'Julian', 'Julian', false, 0) ON CONFLICT (id) DO NOTHING;
  RAISE NOTICE '✅ Julian';

  -- MauroAdmin
  uid := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_super_admin)
  VALUES (uid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mauroadmin@mundial.app', crypt('admin2026', gen_salt('bf')), NOW(), '', '', '', '', '{"provider":"email","providers":["email"]}', '{"username":"MauroAdmin","display_name":"Admin"}', NOW(), NOW(), false);
  INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (uid, uid, 'mauroadmin@mundial.app', jsonb_build_object('sub', uid::text, 'email', 'mauroadmin@mundial.app'), 'email', NOW(), NOW(), NOW());
  INSERT INTO profiles (id, username, display_name, is_admin, total_points) VALUES (uid, 'MauroAdmin', 'Admin', true, 0) ON CONFLICT (id) DO UPDATE SET is_admin = true;
  RAISE NOTICE '✅ MauroAdmin [ADMIN]';

END;
$$;
