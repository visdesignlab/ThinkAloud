import { AppShell } from '@mantine/core';

import AppHeader from './components/basics/AppHeader';
import AppNav from './components/basics/AppNav';
import {GlobalConfig} from '../parser/types';
import {useLocation} from 'react-router-dom';
import {Dashboard} from './dashboard/Dashboard';
import {StatsBoard} from './stats/StatsBoard';

export interface AnalysisInterfaceProps {
    globalConfig: GlobalConfig
}

export function AnalysisInterface(props: AnalysisInterfaceProps) {
    const location = useLocation();

    const page = location.pathname.split('/')[2];
    console.log(page,'page');

    return (
            <AppShell>
                <AppHeader />
                <AppNav />
                {page === 'dashboard' && <Dashboard globalConfig={props.globalConfig}/>}
                {page === 'stats' && <StatsBoard globalConfig={props.globalConfig}/>}

            </AppShell>
    );
}
