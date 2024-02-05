import {GlobalConfig} from '../parser/types';
import {ParticipantData} from '../storage/types';

export interface DashBoardProps {
    globalConfig: GlobalConfig;
}

export interface SummaryBlockProps  {
    databaseSection: string;
    globalConfig: GlobalConfig;
}

export interface HeaderProps {
    studyIds: string[];
}
export interface SummaryPanelProps {
    studyId: string;
    data: ParticipantData[];
}

export interface LineChartData {
    time: number ;
    value: number;
}

export interface timeAxisProps {
    domain: Date[];
    range: number[];
}
