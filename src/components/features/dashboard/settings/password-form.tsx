"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { changePassword } from "@/lib/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function PasswordForm() {
  const [loading, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          const pw = fd.get("newPassword") as string;
          const confirm = fd.get("confirmPassword") as string;
          if (pw !== confirm) {
            toast.error("Password tidak cocok");
            return;
          }
          const res = await changePassword(fd);
          if (res?.error) toast.error(res.error);
          else toast.success("Password updated");
        });
      }}
      className="space-y-6"
    >
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29]">Change Password</h2>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-[#5A5550]">Current Password</Label>
        <Input type="password" name="currentPassword" required className="rounded-none border-[#E8E2D9] bg-white" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-[#5A5550]">New Password</Label>
        <Input type="password" name="newPassword" required className="rounded-none border-[#E8E2D9] bg-white" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-[#5A5550]">Confirm New Password</Label>
        <Input type="password" name="confirmPassword" required className="rounded-none border-[#E8E2D9] bg-white" />
      </div>
      <Button type="submit" disabled={loading} className="rounded-none bg-[#632626] text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c]">
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
