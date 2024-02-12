import {Box, Group, Title, Text, Stack, Code, ScrollArea, Badge, Paper} from '@mantine/core';
import CorrectVis from '../vis/CorrectVis';
import {AnswerSubPanelTextProps} from '../../types';


export default function AnswerSubPanelText(props: AnswerSubPanelTextProps){
    const {textAnswers, trialName, qid, prompt,correctUser,incorrectUser,correctValue} = props;
    return (
        <Group spacing={'xl'} mih={250} p ={10} m={10} sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>

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
                {
                textAnswers && Array.from(textAnswers.keys()).map((user)=>{
                    return <Box>
                        <Title order={5}>{user}</Title>
                        <ScrollArea mah={200}>
                            <Code>{textAnswers.get(user)}</Code>

                        </ScrollArea>
                    </Box>;
                })
                }
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
