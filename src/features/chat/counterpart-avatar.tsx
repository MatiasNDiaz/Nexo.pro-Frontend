import { UserX } from "lucide-react";
import { RemoteImage } from "@/components/catalog/remote-image";
import { Avatar } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { counterpartName, type Conversation } from "./api";

/** Foto de la otra parte; iniciales si no tiene, y un ícono neutro si dio de baja su cuenta. */
export function CounterpartAvatar({ conversation, size = "md" }: { conversation: Conversation; size?: "md" | "lg" }) {
  const { counterpart } = conversation;
  const box = size === "lg" ? "size-12" : "size-11";
  if (counterpart.deactivated && !counterpart.avatarUrl) {
    return (
      <span aria-hidden="true" className={cn("grid shrink-0 place-items-center rounded-full bg-canvas text-muted ring-1 ring-line", box)}>
        <UserX className="size-5" />
      </span>
    );
  }
  if (counterpart.avatarUrl) {
    return (
      <span className={cn("relative shrink-0 overflow-hidden rounded-full bg-brand-100", box)}>
        <RemoteImage src={counterpart.avatarUrl} alt="" fill sizes="48px" className="object-cover" />
      </span>
    );
  }
  return <Avatar name={counterpartName(conversation)} size={size === "lg" ? "lg" : "md"} className={box} />;
}
