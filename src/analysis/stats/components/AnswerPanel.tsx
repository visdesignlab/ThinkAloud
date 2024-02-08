import {Box, Container, Group} from '@mantine/core';
import {AnswerPanelProps, BarProps} from '../../types';
import CorrectVis from '../vis/CorrectVis';
import {useEffect, useState} from 'react';
import CategoricalVis from '../vis/CategoricalVis';
import {RadioResponse} from '../../../parser/types';

export default function AnswerPanel(props: AnswerPanelProps){
    const {data,config, trialName} = props;
    const [correctUser, setCorrectUser] = useState<string[]>([]);
    const [incorrectUser, setIncorrectUser] = useState<string[]>([]);
    const [categoricalStats, setCategoricalStats] = useState<BarProps[]>([]);
    const [correctValue, setCorrectValue] = useState<string>('');



    useEffect(() => {
        const responses = config?.response;
        const correct:string[] = [];
        const incorrect:string[] = [];
        if(responses){
            responses.forEach((response)=>{
                console.log(response,'response');
                const {id, correctAnswer} = response;
                if(correctAnswer){
                    setCorrectValue(correctAnswer as string);
                    for (const [user, answers] of Object.entries(data)) {
                        const ans = answers[id];
                        //set correct incorrect data
                        if(ans === correctAnswer) {
                            correct.push(user);
                        }else{
                            incorrect.push(user);
                        }
                    }
                    //set categorical data
                    if(response.type === 'radio'){
                        const map = new Map<string,number>();
                        for (const answers of Object.values(data)) {
                            const ans:string = answers[id] as string;
                                if(map.has(ans)) {
                                    map.set(ans, map.get(ans) as number + 1);
                                }
                                else{
                                    map.set(ans,1);
                                }
                            }

                        const categoryData:BarProps[] = (response as RadioResponse).options.map((op)=>{
                            return {
                                name: op.value as string,
                                value: map.get(op.value as string) || 0
                            };
                        });
                        setCategoricalStats(categoryData);

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
                <Box>
                    <CategoricalVis data={categoricalStats} trialName={trialName} correctValue={correctValue}/>
                </Box>

            </Group>

        </Container>
    );
}
