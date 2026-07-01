"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { changePassword } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton } from "@/components/ui/input-group";

export function PasswordForm() {
  const [loading, startTransition] = useTransition();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form
      action={(fd) => {
        startTransition(async () => {
          const pw = fd.get("newPassword") as string;
          const confirm = fd.get("confirmPassword") as string;
          if (pw !== confirm) {
            toast.error("Kata sandi tidak cocok");
            return;
          }
          const res = await changePassword(fd);
          if (res?.error) toast.error(res.error);
          else toast.success("Kata sandi diperbarui");
        });
      }}
      className="space-y-6"
    >
      <h2 className="text-lg font-heading uppercase tracking-wider text-[#2C2A29]">Ubah Kata Sandi</h2>

      <div className="space-y-1.5">
        <Label className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#5A5550]">Kata Sandi Saat Ini</Label>
        <InputGroup className="border-[#E8E2D9] bg-white rounded-none">
          <InputGroupInput
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            placeholder="••••••••"
            required
            className="text-sm"
          />
          <InputGroupAddon align="inline-end" className="border-none">
            <InputGroupButton
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="text-[#5A5550]/40 hover:text-[#8B5E56]"
              aria-label={showCurrent ? "Sembunyikan" : "Tampilkan"}
            >
              <HugeiconsIcon icon={showCurrent ? ViewOffSlashIcon : ViewIcon} strokeWidth={2} className="size-5" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#5A5550]">Kata Sandi Baru</Label>
        <InputGroup className="border-[#E8E2D9] bg-white rounded-none">
          <InputGroupInput
            name="newPassword"
            type={showNew ? "text" : "password"}
            placeholder="••••••••"
            required
            className="text-sm"
          />
          <InputGroupAddon align="inline-end" className="border-none">
            <InputGroupButton
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="text-[#5A5550]/40 hover:text-[#8B5E56]"
              aria-label={showNew ? "Sembunyikan" : "Tampilkan"}
            >
              <HugeiconsIcon icon={showNew ? ViewOffSlashIcon : ViewIcon} strokeWidth={2} className="size-5" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] tracking-[0.2em] uppercase font-medium text-[#5A5550]">Konfirmasi Kata Sandi Baru</Label>
        <InputGroup className="border-[#E8E2D9] bg-white rounded-none">
          <InputGroupInput
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder="••••••••"
            required
            className="text-sm"
          />
          <InputGroupAddon align="inline-end" className="border-none">
            <InputGroupButton
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-[#5A5550]/40 hover:text-[#8B5E56]"
              aria-label={showConfirm ? "Sembunyikan" : "Tampilkan"}
            >
              <HugeiconsIcon icon={showConfirm ? ViewOffSlashIcon : ViewIcon} strokeWidth={2} className="size-5" />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="rounded-none bg-[#632626] text-white px-6 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-[#4a1c1c]"
      >
        {loading ? (
          <>
            <HugeiconsIcon icon={Loading03Icon} strokeWidth={2} className="size-4 animate-spin mr-2" />
            Menyimpan...
          </>
        ) : (
          "Perbarui Kata Sandi"
        )}
      </Button>
    </form>
  );
}
