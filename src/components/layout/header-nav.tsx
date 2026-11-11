"use client";

import { LayoutDashboard, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PHOTO_NAV } from "@/components/catalog/profile-photo-transition";
import { Button, ButtonLink } from "@/components/ui/button";
import { NotificationBell } from "@/features/notifications/notification-bell";
import { useSignOut } from "@/features/session/sign-out";
import { AccountMenu } from "./account-menu";
import { Sheet } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/feedback";
import { isActive, mainNavFor, type NavItem } from "@/config/navigation";
import { useViewer, type Viewer } from "@/features/session/viewer";
import { cn } from "@/lib/cn";

/**
 * Navegación que depende de la ruta actual y de la sesión. Es la única parte cliente del header:
 * el logo y el contenedor se renderizan en el servidor.
 */
export function HeaderNav() {
  const viewer = useViewer();
  const pathname = usePathname();
  const items = mainNavFor(viewer);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav aria-label="Principal" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {items.map((item) => (
            <li key={item.href}>
              <DesktopLink item={item} active={isActive(item.href, pathname)} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex items-center gap-2">
        {/* Notificaciones: con sesión (cuenta activa o por verificar, como permite el backend). */}
        {viewer.status === "authenticated" && (viewer.user.status === "ACTIVE" || viewer.user.status === "PENDING_VERIFICATION") && (
          <NotificationBell />
        )}
        <div className="hidden items-center gap-2 md:flex">
          <AccountActions viewer={viewer} />
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          className="grid size-11 place-items-center rounded-xl text-brand-800 transition-colors hover:bg-brand-50 md:hidden"
        >
          <Menu className="size-6" aria-hidden="true" />
          <span className="sr-only">Abrir menú</span>
        </button>
      </div>

      <Sheet open={menuOpen} onClose={closeMenu} title="Menú">
        <nav aria-label="Principal (móvil)" className="flex flex-col gap-6 p-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    transitionTypes={[PHOTO_NAV]}
                    onClick={closeMenu}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-12 items-center rounded-xl px-4 text-base font-medium transition-colors",
                      active ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-brand-50",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col gap-2 border-t border-line pt-6">
            <AccountActions viewer={viewer} stacked onNavigate={closeMenu} />
          </div>
        </nav>
      </Sheet>
    </>
  );
}

function DesktopLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      // Ir a "Profesionales" desde un perfil hace volver la foto a su tarjeta (ProfilePhotoTransition).
      transitionTypes={[PHOTO_NAV]}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex h-10 items-center rounded-lg px-3.5 text-[0.9375rem] font-medium transition-colors",
        active ? "text-brand-800" : "text-muted hover:bg-brand-50 hover:text-brand-800",
        // Indicador de la sección actual.
        "after:absolute after:inset-x-3.5 after:-bottom-[13px] after:h-0.5 after:rounded-full after:bg-brand-700 after:transition-transform after:duration-300",
        active ? "after:scale-x-100" : "after:scale-x-0",
      )}
    >
      {item.label}
    </Link>
  );
}

function SignOutButton({ onDone }: { onDone?: () => void }) {
  // Pregunta antes de salir; al terminar cierra el menú (onDone) y avisa.
  const signOut = useSignOut(onDone);
  return (
    <>
      <Button variant="secondary" fullWidth onClick={signOut.ask}>
        <LogOut className="size-4" aria-hidden="true" />
        Cerrar sesión
      </Button>
      {signOut.dialog}
    </>
  );
}

/** Ingresar/Registrarse sin sesión; menú de la cuenta con sesión; un lugar reservado mientras se resuelve. */
function AccountActions({
  viewer,
  stacked = false,
  onNavigate,
}: {
  viewer: Viewer;
  stacked?: boolean;
  onNavigate?: () => void;
}) {
  if (viewer.status === "loading") {
    return <Skeleton className={stacked ? "h-11 w-full" : "h-10 w-44"} />;
  }
  if (viewer.status === "authenticated") {
    if (!stacked) return <AccountMenu user={viewer.user} />;
    return (
      <>
        <p className="px-1 text-sm text-muted">
          Ingresaste como <span className="font-semibold text-ink">{viewer.user.firstName}</span>
        </p>
        <ButtonLink href="/panel" onClick={onNavigate} variant="primary" fullWidth>
          <LayoutDashboard className="size-4" aria-hidden="true" />
          Mi panel
        </ButtonLink>
        <SignOutButton onDone={onNavigate} />
      </>
    );
  }
  return (
    <>
      <ButtonLink
        href="/ingresar"
        onClick={onNavigate}
        variant={stacked ? "secondary" : "ghost"}
        size={stacked ? "md" : "sm"}
        fullWidth={stacked}
      >
        Ingresar
      </ButtonLink>
      <ButtonLink href="/registro" onClick={onNavigate} variant="accent" size={stacked ? "md" : "sm"} fullWidth={stacked}>
        Crear cuenta
      </ButtonLink>
    </>
  );
}
