import {InfoPanelProps, BasicStats} from '../../types';
import {useEffect, useState} from 'react';
import MeanVis from '../vis/MeanVis';
import {Badge, Box, Container, Flex, Group, Text, Title} from '@mantine/core';
import {toDisplayData} from '../../utils';


export default function InfoPanel(props: InfoPanelProps) {
    const {data,trialName,config} = props;
    console.log(data,'data in info panel');
    const [timeStats, setTimeStats] = useState<BasicStats>();



    useEffect(() => {
        // console.log(data,'info panel data update');
        function calculateStats(){
            let max = 0;
            let min = Number.MAX_VALUE;
            let minUser = '';
            let maxUser = '';
            let sum = 0;
            const durationAry:number[] = [];

           Object.entries(data).forEach(([pid, answers]) => {
               const duration = answers.endTime - answers.startTime;
               sum += duration;
               durationAry.push(duration);
                if(duration>max){
                     max = duration;
                     maxUser = pid;
                }
                if(duration<min){
                    min = duration;
                    minUser = pid;
                }
           });
           durationAry.sort((a,b)=>a-b);
           const mean = sum/durationAry.length;
           const mid = durationAry.length%2 === 0 ? (durationAry[durationAry.length/2] + durationAry[durationAry.length/2-1])/2 : durationAry[Math.floor(durationAry.length/2)];
            setTimeStats({
                           max,
                           min,
                           minUser,
                           maxUser,
                           mean,
                           mid
                       });

        }
        if(data)
            calculateStats();
    }, [data]);

    return (
        <Container fluid p ={10}>
            <Flex gap="lg"
                  justify="center"
                  align="flex-start"
                  direction="row"
                  wrap="wrap">

                <Box mih={100} p = {5}  sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>
                    {
                        <Box maw={400}>
                            <Badge color={'green'} radius={'xs'} sx={{ display: 'inline' }}>instruction:</Badge>
                            <Text span>{ config?.instruction? ' '+config?.instruction : ' no instruction provided'}</Text>
                        </Box>
                    }
                    {

                        <Box maw={400}>
                            <Badge color={'green'} radius={'xs'} sx={{ display: 'inline' }}>description:</Badge>
                            <Text span>{ config?.description? ' '+config?.description : 'no description provided'}</Text>
                        </Box>
                    }

                </Box>


                {/*meta*/}

                <Box miw={100} maw={300} p={5} mih={105} sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>
                    {config && config.meta ? (
                        <Box>
                            <Title order={5}>Meta Data</Title>
                            {Object.entries(config.meta).map(([key, value]) => (
                                <Box key={key}>
                                    <Badge color={'green'} radius={'xs'} sx={{ display: 'inline' }}>{key}:</Badge>
                                    <Text span>{' ' + value}</Text>
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Title order={5}>No Meta Data</Title>
                    )}
                </Box>
            { timeStats && trialName.length>0 &&
                <Group  sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>
                    <Box mih={105} p={5}>
                        <Box>
                            <Badge radius={'xs'} sx={{display:'inline'}}>Fastest:</Badge>
                            <Text span>{' ' + timeStats.minUser}</Text>
                        </Box>
                        <Box>
                            <Badge radius={'xs'} sx={{display:'inline'}}>Slowest:</Badge>
                            <Text span>{' ' + timeStats.maxUser}</Text>
                        </Box>
                        <Box>
                            <Badge radius={'xs'} sx={{display:'inline'}}>Mean:</Badge>
                            <Text span>{ ' ' + toDisplayData(timeStats.mean)}</Text>
                        </Box>
                        <Box>
                            <Badge radius={'xs'} sx={{display:'inline'}}>Median:</Badge>
                            <Text span>{' ' + toDisplayData(timeStats.mid)}</Text>

                        </Box>
                    </Box>
                    <MeanVis trialName={trialName} stats={timeStats}/>

                </Group>}
            </Flex>



        </Container>


    );

}
