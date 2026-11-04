"use client";

import { AvatarCard } from "./avatar-card";
import { CustomerExtraInfo } from "./customer-extra-info";
import { PersonalDataSection } from "./personal-data-form";
import { PanelTitle } from "./settings-section";
import { useMe } from "./use-me";

export function AccountPage() {
  const me = useMe();
  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Mi cuenta" description={`Ingresás con ${me.email}.`} />
      <AvatarCard />
      <PersonalDataSection />
      {me.role === "CUSTOMER" && <CustomerExtraInfo />}
    </div>
  );
}
