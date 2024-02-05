import {
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Grid,
    ScrollArea,
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
import {IconArrowDown, IconSquareCheck, IconProgressBolt, IconArrowUp} from '@tabler/icons-react';
import {useSearchParams} from 'react-router-dom';


export function StatsBoard(props: DashBoardProps){
    const [activeExp, setActiveExp] = useState<string | null>(null);
    const [expData, setExpData] = useState<ParticipantData[]>([]);
    const [completed, setCompleted] = useState<ParticipantData[]>([]);
    const [inprogress, setInprogress] = useState<ParticipantData[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeParticipant, setActiveParticipant] = useState<string>('');
    const [activeSequence, setActiveSequence] = useState<string[]>([]);
    const [activeTrial, setActiveTrial] = useState<string>('');
    const [activeAnswer, setActiveAnswer] = useState<Record<string, string>>({});
    const [searchParams] = useSearchParams();

    const { globalConfig } = props;
    // const studyIds = globalConfig.configsList;
    // const selectorData = studyIds.map((id)=>{return {value: id, label: id};});

    console.log(activeAnswer);
    useEffect(() => {
        const exp = searchParams.get('exp');
        if(exp){
            setActiveExp(exp);
        }
    }, [searchParams]);

    const selectParticipant = (p:string) => {
        setActiveParticipant(p);
    };



    useEffect(() => {
        setActiveAnswer({});
    }, [activeTrial]);





    useEffect(() => {
        if(expData.length>0){
            if(activeParticipant === 'all'){
                if(completed.length>0)
                    setActiveSequence(completed[0].sequence);
            }else{
                const data = expData.filter((d)=>d.participantId === activeParticipant);
                if(data.length>0){
                    setActiveSequence(data[0].sequence);
                }
            }
        }

    }, [activeParticipant]);

    const reSetSelection = () => {
        setActiveParticipant('');
        setActiveSequence([]);
        setActiveTrial('');
        setActiveAnswer({});

    };


    useEffect(() => {

        const getData = async () => {
            setLoading(true);
            reSetSelection();
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

    useEffect(() => {
        console.log(expData,'expData');
    }, [expData]);


    useEffect(() => {
        console.log(activeSequence,'activeSequence');
    }, []);

    return (
        <>
            <Container  fluid>
                {/*<Box maw={300} m={10}>*/}
                {/*    <Select*/}
                {/*        label="Select an experiment"*/}
                {/*        placeholder="Pick one"*/}
                {/*        data={selectorData}*/}
                {/*        value={activeExp}*/}
                {/*        onChange={setActiveExp}*/}
                {/*    />*/}
                {/*</Box>*/}
                {/*<Divider />*/}
                {(activeExp && expData)?<Box
                    mt={10}
                    p={10}
                >
                    <Grid>
                        <Grid.Col span={4} p={10} maw={300} sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>
                            <ScrollArea style={{ height: 550 }} type="scroll" >
                                <Stack mb={10}>
                                    <Title> {activeExp}</Title>
                                    <Text>Total Participants: {expData.length}</Text>
                                    <Text>Completed: {completed.length}</Text>
                                    <Text>In Progress: {inprogress.length}</Text>
                                </Stack>
                                <Divider />

                                <Tabs defaultValue="completed">
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

                                        <Tabs.Panel value="completed" pt="xs">
                                            <Stack m={10}>
                                                <Button variant={activeParticipant==='all'?'filled':'outline'} onClick={()=>{selectParticipant('all');}} size={'xs'}>All Completed</Button>
                                                {
                                                    completed.map((d)=>{
                                                        return <Button variant={activeParticipant===d.participantId?'filled':'outline'} onClick={()=>{selectParticipant(d.participantId);}} size={'xs'} color={'green'}>{d.participantId}</Button>;
                                                    })}
                                            </Stack>
                                        </Tabs.Panel>

                                        <Tabs.Panel value="inprogress" pt="xs">
                                            <Stack m={10}>


                                                {
                                                    inprogress.map((d)=>{
                                                        return <Button variant={activeParticipant===d.participantId?'filled':'outline'} onClick={()=>{selectParticipant(d.participantId);}} size={'xs'} color={'yellow'}>{d.participantId}</Button>;
                                                    })
                                                }
                                            </Stack>
                                        </Tabs.Panel>

                                    </Tabs.List>
                                </Tabs>
                            </ScrollArea>
                        </Grid.Col>
                            <Grid.Col span={3}>
                                <ScrollArea style={{ height: 550 }} type="scroll" miw={70}>
                                    {activeSequence.length>0 && <Title order={4} mb={10}>Experiment Stages</Title>}
                                    {activeSequence.length>0 && activeSequence.map((trialName)=>{
                                        return trialName === 'end'?<Button fullWidth mt={10} variant={'outline'} size={'xs'}>{trialName}</Button>
                                            :<Box>

                                                <Stack sx={{alignItems:'center'}}>
                                                    <Button variant={activeTrial===trialName?'filled':'outline'} mt={10}
                                                            fullWidth  size={'xs'}
                                                            onClick={()=>{setActiveTrial(trialName);}}>
                                                        {trialName}
                                                    </Button>
                                                    <IconArrowDown size={15} display={'block'}/>
                                                </Stack>
                                            </Box>;

                                    })}
                                </ScrollArea>
                            </Grid.Col>
                    </Grid>
                </Box>:
                    <Box ml={'50%'}>
                        <Box ml={200}>
                            <IconArrowUp size={30} display={'block'}/>
                        </Box>
                        <Title>Please select an experiment</Title>
                    </Box>}
                <Loading isLoading={loading} />



            </Container>
        </>

    );
}
