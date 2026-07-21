-- Seed users in auth.users
-- Admin user (id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
-- Password: 'Password123'
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('Password123', gen_salt('bf')),
  now(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "System Administrator", "role": "admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Normal user (id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12')
-- Password: 'Password123'
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  'authenticated',
  'authenticated',
  'user@example.com',
  crypt('Password123', gen_salt('bf')),
  now(),
  NULL,
  NULL,
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Jane Doe", "role": "user"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Seed some initial items for Jane Doe
INSERT INTO public.items (id, name, description, user_id, created_at, updated_at)
VALUES 
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'First Item', 'This is the first seeded item', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', now(), now()),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Second Item', 'This is another seeded item', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', now(), now())
ON CONFLICT (id) DO NOTHING;
