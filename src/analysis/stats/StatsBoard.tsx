import {
    Badge,
    Box,
    Container,
    Group, MultiSelect, Paper,
    SelectItem,
    Stack, Tabs,
    Text,
    Title
} from '@mantine/core';
import React, {useEffect, useState} from 'react';
import {DashBoardProps} from '../types';
import {ParticipantData} from '../../storage/types';
import {FirebaseStorageEngine} from '../../storage/engines/FirebaseStorageEngine';
import {getConfig} from '../utils';
import Loading from '../components/basics/Loading';
import { IconSquareCheck, IconProgressBolt, IconArrowUp} from '@tabler/icons-react';
import {useSearchParams} from 'react-router-dom';
import StatsVis from './StatsVis';
import {StudyConfig} from '../../parser/types';


export function StatsBoard(props: DashBoardProps){
    const { globalConfig } = props;
    // console.log(globalConfig,'globalConfig');

    const [activeExp, setActiveExp] = useState<string | null>(null);
    const [config, setConfig] = useState<StudyConfig>();
    const [expData, setExpData] = useState<ParticipantData[]>([]);
    const [completed, setCompleted] = useState<ParticipantData[]>([]);
    const [inprogress, setInprogress] = useState<ParticipantData[]>([]);
    const [loading, setLoading] = useState(false);
    const [dropdownData, setDropdownData] = useState<SelectItem[]>([]);
    const [activeParticipants, setActiveParticipants] = useState<string[]>([]);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        if(activeParticipants.includes('All')){
            setDropdownData([{label:'All',value:'All'},...completed.map((d)=>{return {value:d.participantId,label:d.participantId, disabled:true};})]);
        }else
            setDropdownData([{label:'All',value:'All'}, ...completed.map((d)=>{return {value:d.participantId,label:d.participantId};})]);
    }, [completed, activeParticipants]);

    useEffect(() => {
        const updateParams = async () => {
            const exp = searchParams.get('exp');
            if(exp){
                console.log('reset');
                setActiveParticipants([]);
                setActiveExp(exp);
                setConfig(await getConfig(exp, globalConfig));

            }
        };
        updateParams();


    }, [searchParams]);



    useEffect(() => {
        // if(expData.length>0){
        //     if(activeParticipants.length>1){
        //         if(completed.length>0)
        //             setActiveSequence(completed[0].sequence);
        //     }else{
        //         const data = expData.filter((d)=>d.participantId === activeParticipant);
        //         if(data.length>0){
        //             setActiveSequence(data[0].sequence);
        //         }
        //     }
        // }

    }, [activeParticipants]);



    useEffect(() => {

        const getData = async () => {
            setLoading(true);
            const fetchData = async () => {
                if(activeExp){
                    const storageEngine = new FirebaseStorageEngine();
                    const config = await getConfig(activeExp, globalConfig);
                    if(!config || !storageEngine) return;
                    await storageEngine.connect();
                    await storageEngine.initializeStudyDb(activeExp, config);
                    const data = (await storageEngine.getAllParticipantsData()).filter((d)=>d.sequence.length>0);
                    setExpData(data);
                    setCompleted(data.filter((d)=>{
                            return d.sequence.length - Object.keys(d.answers).length <= 1;
                        })
                    );

                    setInprogress(data.filter((d)=>{
                        return d.sequence.length - Object.keys(d.answers).length > 1;
                    }));
                }
                setLoading(false);

            };
            await fetchData();
        };
        getData();


    }, [activeExp]);

    return (
        <>
            <Container  fluid>
                {(activeExp && expData)?<Box
                    mt={10}
                    p={10}
                >

                    <Paper  p={10} sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>
                        <Group>
                                <Stack spacing={'xs'} mb={10}>
                                    <Title order={3}> {activeExp}</Title>
                                    <Text>Total Participants: {expData.length}</Text>
                                    {/*<Text>Completed: {completed.length}</Text>*/}
                                    {/*<Text>In Progress: {inprogress.length}</Text>*/}
                                </Stack>
                                <Tabs defaultValue="completed" orientation="vertical">
                                    <Tabs.List>
                                        <Tabs.Tab
                                            rightSection={
                                                <Badge
                                                    color={'green'}
                                                    sx={{ width: 16, height: 16, pointerEvents: 'none' }}
                                                    variant="filled"
                                                    size="xs"
                                                    p={0}
                                                >
                                                    {completed.length}
                                                </Badge>
                                            }
                                            value="completed"
                                            icon={<IconSquareCheck color={'green'} size={12}
                                            />}>
                                            Completed
                                        </Tabs.Tab>

                                        <Tabs.Tab
                                            rightSection={
                                                <Badge
                                                    color={'yellow'}
                                                    sx={{ width: 16, height: 16, pointerEvents: 'none' }}
                                                    variant="filled"
                                                    size="xs"
                                                    p={0}
                                                >
                                                    {inprogress.length}
                                                </Badge>
                                            }
                                            value="inprogress"
                                            icon={<IconProgressBolt
                                                color={'orange'}
                                                size={12} />}>
                                            In Progress
                                        </Tabs.Tab>

                                    </Tabs.List>
                                    <Tabs.Panel value="completed" pt="xs">
                                        <Paper p={10}>
                                            <MultiSelect  maxDropdownHeight={400}
                                                          clearable miw={300}
                                                          data={dropdownData}
                                                          onChange={setActiveParticipants}
                                                          value={activeParticipants}
                                            />

                                        </Paper>
                                    </Tabs.Panel>

                                    <Tabs.Panel value="inprogress" pt="xs">
                                        For In progress users, a seperate view.
                                    </Tabs.Panel>

                                </Tabs>
                        </Group>

                    </Paper>
                </Box>:
                    <Box ml={'50%'}>
                        <Box ml={200}>
                            <IconArrowUp size={30} display={'block'}/>
                        </Box>
                        <Title>Please select an experiment</Title>
                    </Box>}
                <Loading isLoading={loading} />

                {activeParticipants.length>1 && config && <StatsVis  config={config} data={completed.filter((d)=>activeParticipants.includes(d.participantId))} />}
                {activeParticipants.length ===0 && <Title ml={200} order = {4}><IconArrowUp size={30}/>Select 1 participant to check individual detials, select 2+ participants to check stats</Title>}
            </Container>
        </>

    );
}
