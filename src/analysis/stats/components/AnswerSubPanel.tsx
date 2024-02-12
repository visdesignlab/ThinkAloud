import {Box, Group, Title, Text, Stack} from '@mantine/core';
import CorrectVis from '../vis/CorrectVis';
import CategoricalVis from '../vis/CategoricalVis';
import {AnswerSubPanelProps} from '../../types';


export default function AnswerSubPanel(props: AnswerSubPanelProps){
    const {correctUser, incorrectUser, stats, correctValue, trialName, type, qid, prompt} = props;
    return (
        <Group mih={400} m={10} p ={10} sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>
            <Stack>
                <Text>{qid}</Text>
                <Text>{prompt}</Text>
            </Stack>


            <Box>
                {stats && (type === 'dropdown' || type ==='radio' || type ==='checkbox') && <CategoricalVis data={stats} trialName={trialName} correctValue={correctValue}/>}
            </Box>
            <Box>
                {correctUser && incorrectUser && correctValue ? <CorrectVis correct={correctUser} incorrect={incorrectUser} trialName={trialName}/> : <Title order={5}>Correct answer not provided</Title>}
            </Box>

        </Group>
    );
}
