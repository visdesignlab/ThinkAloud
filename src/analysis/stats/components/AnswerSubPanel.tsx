import {Box, Group, Title, Text, Stack, Paper, Badge} from '@mantine/core';
import CorrectVis from '../vis/CorrectVis';
import CategoricalVis from '../vis/CategoricalVis';
import {AnswerSubPanelProps} from '../../types';


export default function AnswerSubPanel(props: AnswerSubPanelProps){
    const {correctUser, incorrectUser, stats, correctValue, trialName, type, qid, prompt} = props;
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


            <Box ml={10}>
                {stats && (type === 'dropdown' || type ==='radio' || type ==='checkbox') && <CategoricalVis data={stats} trialName={trialName} correctValue={correctValue}/>}
            </Box>
            <Box ml={10}>
                {correctUser && incorrectUser && correctValue ? <CorrectVis correct={correctUser} incorrect={incorrectUser} trialName={trialName}/> : <Title order={5}>Correct answer not provided</Title>}
            </Box>

        </Group>
    );
}
