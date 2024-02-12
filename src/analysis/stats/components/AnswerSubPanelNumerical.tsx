import {Box, Group, Title, Text, Stack, Paper, Badge} from '@mantine/core';
import CorrectVis from '../vis/CorrectVis';
import {AnswerSubPanelNumericalProps} from '../../types';
import NumericalVis from '../vis/NumericalVis';
import * as d3 from 'd3';


export default function AnswerSubPanelNumerical(props: AnswerSubPanelNumericalProps){
    const {max, min,correctUser, incorrectUser, data, correctValue, qid, prompt,trialName} = props;

    const domainMax = max || (data && d3.max(data));
    const domainMin = min || (data && d3.min(data));
    return (
        <Group spacing={'xl'} mih={250} m={10} p ={10} sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>
            <Stack spacing={'xl'} p ={5} sx={{border: '1px solid grey', borderRadius:5}}>
                <Paper>
                    <Badge>Qid:</Badge>
                    <Text span>{qid}</Text>
                </Paper>
                <Paper>
                    <Badge>Prompt:</Badge>
                    <Text>{prompt}</Text>
                </Paper>
            </Stack>


            <Box ml={0}>
                {data && domainMin && domainMax && <NumericalVis data={data} trialName={trialName} correctValue={correctValue} min={domainMin} max={domainMax}/> }
            </Box>

            <Box ml={10}>
                {correctUser && incorrectUser && correctValue ?
                    <CorrectVis correct={correctUser} incorrect={incorrectUser} trialName={trialName}/>
                    :
                    <Title order={5}>Correct answer not provided</Title>}
            </Box>

        </Group>
    );
}
