"use client";

import { AppProvider, useApp } from "@/contexts/AppContext";
import { OnboardingScreen } from "@/components/screens/OnboardingScreen";
import { CreateScreen }     from "@/components/screens/CreateScreen";
import { JoinScreen }       from "@/components/screens/JoinScreen";
import { HomeScreen }       from "@/components/screens/HomeScreen";
import { EntryScreen }      from "@/components/screens/EntryScreen";
import { AddScreen }        from "@/components/screens/AddScreen";
import { SettingsScreen }   from "@/components/screens/SettingsScreen";
import { InstallBanner }    from "@/components/ui/InstallBanner";

function AppShell() {
  const { state } = useApp();

  const screens = {
    onboarding: <OnboardingScreen />,
    create:     <CreateScreen />,
    join:       <JoinScreen />,
    home:       <HomeScreen />,
    entry:      <EntryScreen />,
    add:        <AddScreen />,
    settings:   <SettingsScreen />,
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        background: "var(--base)",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Global loading bar */}
      {state.loading && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            height: 2,
            background: "var(--mauve)",
            opacity: 0.6,
            zIndex: 50,
          }}
        />
      )}

      {screens[state.screen]}

      {/* PWA install prompt — only shown when installable */}
      <InstallBanner />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
