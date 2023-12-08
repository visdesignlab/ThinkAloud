import { AppShell } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import AppAside from './interface/AppAside';
import AppHeader from './interface/AppHeader';
import AppNavBar from './interface/AppNavBar';
import HelpModal from './interface/HelpModal';

export function StepRenderer() {
  return (
    <AppShell navbar={{ width: 300, collapsed: { desktop: false, mobile: false }, breakpoint: 0}}>
      <HelpModal />
      <AppHeader />
      <AppNavBar />
      <AppShell.Main><Outlet /></AppShell.Main>
      <AppAside />
    </AppShell>
  );
}