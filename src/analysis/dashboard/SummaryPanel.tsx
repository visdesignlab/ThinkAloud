import {Badge, Box, Button, Card, Center, Group, Title, Grid} from '@mantine/core';
import React, {useEffect, useState} from 'react';
import Linechart from '../components/charts/Linechart';
import {IconTable} from '@tabler/icons-react';
import {SummaryPanelProps} from '../types';
import {ParticipantData} from '../../storage/types';
import {DateRangePicker, DateRangePickerValue} from '@mantine/dates';
const SummaryPanel = (props: SummaryPanelProps) => {
    const {studyId,data} = props;
    const [rangeTime, setRangeTime] = useState<DateRangePickerValue | undefined>();
    const [completed, setCompleted] = useState<ParticipantData[]>([]);
    const [inprogress, setInprogress] = useState<ParticipantData[]>([]);

    useEffect(() => {
        if(data && data.length>0){
            setCompleted(data.filter((d)=>{
                return d.sequence.length - Object.keys(d.answers).length <= 1;
            })
            );

            setInprogress(data.filter((d)=>{
                return d.sequence.length - Object.keys(d.answers).length > 1;
            }));
        }

    }, [data]);



    const getCompletedStatsData = () => {
        if(completed) {
            let times:number[] = [];


            completed.forEach((d) => {
                for(let i = d.sequence.length-1;i>=0; i--){
                    const stageName = d.sequence[i];
                    if(Object.prototype.hasOwnProperty.call(d.answers, stageName)){
                        times.push(
                             +d.answers[stageName].endTime
                        );
                        break;
                    }
                }
            });
            times.sort((a, b) => a - b);

            if(rangeTime && rangeTime[0] && rangeTime[1]){
                console.log(rangeTime,'rangeTime');
                    // @ts-expect-error:will not be null
                times = times.filter((t)=> t<=rangeTime[1].getTime() && t>=rangeTime[0].getTime());
            }
           return times.map((t,idx)=>{
               return {
                   time: t,
                   value: idx+1
               };
           });
        }
        else
            return [];
    };




    return (
        <>
            {
                data && <Card p={'lg'} shadow={'md'} withBorder>
                    <Title mb={10} order={3} >{studyId}</Title>

                <Grid>
                    <Grid.Col span={8}>
                        <Group>
                            <Badge size={'md'} color={'orange'}>Total : {completed.length + inprogress.length}</Badge>
                            <Badge size={'md'} color={'green'}>Completed : {completed.length}</Badge>
                            <Badge size={'md'} color={'cyan'}>In Progress : {inprogress.length}</Badge>
                        </Group>
                    </Grid.Col>
                    <Grid.Col span={4}>
                        <Group >
                            <Button
                                // disabled={!storageEngine?.isConnected()}
                                leftIcon={<IconTable />}
                                mt="1em"
                                mr="0.5em"
                                // onClick={()=>setOpenDownload(true)}
                            >
                                Download Tidy Data
                            </Button>

                        </Group>

                    </Grid.Col>

                </Grid>


                    <Box m={10}>
                        <DateRangePicker
                            dropdownType="modal"
                            label="Time Filter"
                            placeholder="Pick dates range"
                            clearable
                            value={rangeTime}
                            onChange={setRangeTime}
                        />

                    </Box>




                        {/*<Center>*/}
                        {/*    <Button mt={20} color="red" radius="xl" onClick={toggleTimefilter}>*/}
                        {/*        Close*/}
                        {/*    </Button>*/}
                        {/*</Center>*/}


                    {completed.length >=2 ?
                        <Linechart domianH={[0,100]} rangeH={[10,200]} domainV={[0,100]} rangeV={[10,100]} data={getCompletedStatsData()} labelV={''} labelH={''} />
                        :
                        <Box h={230} pt={20}>
                            <Center>
                                <Title order={5}>Not enough participants for chart</Title>

                            </Center>
                        </Box>
                    }
                    {/*<Button disabled={data.length===0} color={'orange'} onClick={()=>setDeleteModalOpened(true)}>Delete All</Button>*/}
                    {/*<Modal opened={deleteModalOpened} onClose={onModalClose} title="Delete All">*/}
                    {/*    <TextInput*/}
                    {/*        placeholder="Type in Study ID"*/}
                    {/*        label="To proceed, please type in the study ID. This operation will delete all data related to this study"*/}
                    {/*        ref={modalInuptRef}*/}
                    {/*        onChange={checkStudyIdInput}*/}
                    {/*    />*/}
                    {/*    <Center>*/}
                    {/*        <Button mt={10} disabled={!studyIdValid} color={'orange'} onClick={deleteAll}>Proceed</Button>*/}
                    {/*    </Center>*/}
                    {/*</Modal>*/}


                </Card>
            }
        </>

    );
};

export default SummaryPanel;
