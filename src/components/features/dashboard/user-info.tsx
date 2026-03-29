import { createClient } from "@/lib/supabase/server";

export const UserEmailDisplay = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <p className="text-[10px] text-[#5A5550]/60 truncate uppercase tracking-widest">
      {user.email}
    </p>
  );
};

export const UserAvatar = async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return <div className="w-8 h-8 rounded-full bg-[#EFEBDE] border border-[#2C2A29]/5" />;

  return (
    <div className="w-8 h-8 rounded-full bg-[#EFEBDE] border border-[#2C2A29]/5 flex items-center justify-center text-[10px] font-heading text-[#2C2A29]">
      {user.email?.[0].toUpperCase()}
    </div>
  );
};
