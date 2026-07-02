"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  if (!email || !password) return { error: "Email dan password wajib diisi." };

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/login");
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();

  const currentPassword = formData.get("currentPassword")?.toString();
  const newPassword = formData.get("newPassword")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Semua field password wajib diisi." };
  }

  if (newPassword !== confirmPassword) {
    return { error: "Password baru tidak sama" };
  }

  if (newPassword.length < 6) {
    return { error: "Password baru minimal 6 karakter" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Tidak terautentikasi" };

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });
  if (signInError) return { error: "Password lama salah" };

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) return { error: updateError.message };

  return { success: true };
}
