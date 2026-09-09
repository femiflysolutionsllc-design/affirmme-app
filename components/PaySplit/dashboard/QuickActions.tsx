"use client";

import React from "react";
import SectionCard from "../paysplit-ui/SectionCard";
import ActionCard from "../../ui/ActionCard";
import type { PaySplitView } from "../PaySplitApp";

type QuickActionsProps = {
  onNavigate: (view: PaySplitView) => void;
};

export default function QuickActions({
  onNavigate,
}: QuickActionsProps) {
  return (
    <SectionCard title="Quick Actions">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <ActionCard
          icon="➕"
          title="Add Bill"
          subtitle="Track a new monthly bill"
          onClick={() => onNavigate("bills")}
        />

        <ActionCard
          icon="🏦"
          title="Accounts"
          subtitle="Manage your bank accounts"
          onClick={() => onNavigate("accounts")}
        />

        <ActionCard
          icon="🧾"
          title="Payment History"
          subtitle="View recent transactions"
          onClick={() => onNavigate("history")}
        />

        <ActionCard
          icon="🐷"
          title="Piggy Bank"
          subtitle="Grow your savings goals"
          onClick={() => onNavigate("piggybank")}
        />
      </div>
    </SectionCard>
  );
}