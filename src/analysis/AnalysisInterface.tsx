import {AppShell} from '@mantine/core';

import AppHeader from './components/basics/AppHeader';
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

    return (
            <AppShell>
                <AppHeader studyIds={props.globalConfig.configsList}/>
                {/*<AppNav />*/}
                {page === 'dashboard' && <Dashboard globalConfig={props.globalConfig}/>}
                {page === 'stats' && <StatsBoard globalConfig={props.globalConfig}/>}

            </AppShell>

    );
}
