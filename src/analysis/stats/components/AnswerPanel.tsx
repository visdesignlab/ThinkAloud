import {Box, Container, Group} from '@mantine/core';
import {AnswerPanelProps} from '../../types';
import CorrectVis from '../vis/CorrectVis';
import {useEffect, useState} from 'react';

export default function AnswerPanel(props: AnswerPanelProps){
    const {data,config, trialName} = props;
    const [correctUser, setCorrectUser] = useState<string[]>([]);
    const [incorrectUser, setIncorrectUser] = useState<string[]>([]);


    useEffect(() => {
        const responses = config?.response;
        const correct:string[] = [];
        const incorrect:string[] = [];
        if(responses){
            responses.forEach((response)=>{
                const {id, correctAnswer} = response;
                if(correctAnswer){
                    for (const [user, answers] of Object.entries(data)) {
                        const ans = answers[id];
                        if(ans === correctAnswer) {
                            correct.push(user);
                        }else{
                            incorrect.push(user);
                        }
                    }
                }
            });
            setCorrectUser(correct);
            setIncorrectUser(incorrect);
        }
    }, [data]);
    console.log(data,'data in answer panel');
    console.log(config,'config in answer panel');



    return (
        <Container p ={10} sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>
            <Group mih={400}>
                <Box>
                    <CorrectVis correct={correctUser} incorrect={incorrectUser} trialName={trialName} />
                </Box>
                <Box></Box>

            </Group>

        </Container>
    );
}
