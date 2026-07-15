CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text,
	"avatar_url" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;

-- -------------------------------------------------------------
-- Helper Functions & Triggers
-- -------------------------------------------------------------

--> statement-breakpoint
-- Check if user is an admin (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--> statement-breakpoint
-- Create a trigger function to create a profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--> statement-breakpoint
-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------------
-- Row Level Security (RLS)
-- -------------------------------------------------------------

--> statement-breakpoint
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());

--> statement-breakpoint
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());

--> statement-breakpoint
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (public.is_admin());

--> statement-breakpoint
CREATE POLICY "Users can view own items" ON public.items
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

--> statement-breakpoint
CREATE POLICY "Users can insert own items" ON public.items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

--> statement-breakpoint
CREATE POLICY "Users can update own items" ON public.items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

--> statement-breakpoint
CREATE POLICY "Users can delete own items" ON public.items
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.is_admin());

--> statement-breakpoint
GRANT ALL ON TABLE public.profiles TO postgres, authenticated, anon, service_role;
--> statement-breakpoint
GRANT ALL ON TABLE public.items TO postgres, authenticated, anon, service_role;
--> statement-breakpoint
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, anon, service_role;
--> statement-breakpoint
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated, anon, service_role;