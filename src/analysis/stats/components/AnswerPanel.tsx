import {Box, Container, Title} from '@mantine/core';
import {AnswerPanelProps, StatsVisProps} from '../../types';
import {useEffect, useState} from 'react';
import {CheckboxResponse, DropdownResponse, RadioResponse} from '../../../parser/types';
import AnswerSubPanel from './AnswerSubPanel';
import AnswerSubPanelText from './AnswerSubPanelText';
import AnswerSubPanelNumerical from './AnswerSubPanelNumerical';

export default function AnswerPanel(props: AnswerPanelProps){
    const {data,config, trialName} = props;
    const [correctUser, setCorrectUser] = useState<Record<string,string[]>>({});
    const [incorrectUser, setIncorrectUser] = useState<Record<string,string[]>>({});
    const [stats, setStats] = useState<Record<string,StatsVisProps[]>>({});
    const [correctValue, setCorrectValue] = useState<Record<string,string | number>>({});
    const [textAnswers, setTextAnswers] = useState<Record<string,Map<string,string>>>({});
    const [numericalAnswers, setNumericalAnswers] = useState<Record<string,number[]>>({});

    const responses = config?.response;


    useEffect(() => {
        const statsRes : Record<string,StatsVisProps[]> ={};
        const correctAnsRes : Record<string,string> ={};
        const textAnswersRes: Record<string,Map<string,string>> ={};
        const numericalAnswersRes: Record<string,number[]> ={};
        const correctUserList: Record<string,string[]> ={};
        const incorrectUserList: Record<string,string[]> ={};

        if(responses){
            responses.forEach((response)=>{
                const correct:string[] = [];
                const incorrect:string[] = [];
                const {id, correctAnswer, type} = response;

                if(type === 'iframe'){
                    console.log(type,'type iframe');


                }else if(type === 'longText' || type === 'shortText'){
                    const map = new Map<string,string>();
                    for (const [user,answers] of Object.entries(data)) {
                        const ans:string = answers[id] as string;
                        map.set(user,ans);

                    }
                    textAnswersRes[id] = map;



                }else if(type === 'numerical' || type === 'slider' || type === 'likert'){
                   const dataAry = [];
                    for (const answers of Object.values(data)) {
                        const ans:number = answers[id] as number;
                        dataAry.push(ans);
                    }
                    numericalAnswersRes[id] = dataAry;

                }else if(type === 'checkbox'){
                    const map = new Map<string,number>();
                    for (const answers of Object.values(data)) {
                        const ans:string[] = answers[id] as string[];
                        ans.forEach((a)=>{
                            if(map.has(a)) {
                                map.set(a, map.get(a) as number + 1);
                            }
                            else{
                                map.set(a,1);
                            }
                        });
                    }

                    const categoryData: StatsVisProps[] = (response as CheckboxResponse).options.map((op) => {
                        return {
                            name: op.value as string,
                            value: map.get(op.value as string) || 0
                        } as StatsVisProps;
                    });
                    statsRes[id] = categoryData;
                }
                else{

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

                    if(response.type === 'radio') {
                        const categoryData: StatsVisProps[] = (response as RadioResponse).options.map((op) => {
                            return {
                                name: op.value as string,
                                value: map.get(op.value as string) || 0
                            } as StatsVisProps;
                        });
                        statsRes[id] = categoryData;
                    }
                    else if(response.type === 'dropdown'){
                        const categoryData: StatsVisProps[] = (response as DropdownResponse).options.map((op) => {
                            return {
                                name: op.value as string,
                                value: map.get(op.value as string) || 0
                            } as StatsVisProps;
                        });
                        statsRes[id] = categoryData;
                    }
                }


                if(correctAnswer){
                    correctAnsRes[id] = correctAnswer as string;
                    for (const [user, answers] of Object.entries(data)) {
                        const ans = answers[id];
                        //set correct incorrect data
                        if(ans === correctAnswer) {
                            correct.push(user);
                        }else{
                            incorrect.push(user);
                        }
                    }
                    correctUserList[id] = correct;
                    incorrectUserList[id] = incorrect;

                }
            });
            setStats(statsRes);
            setCorrectValue(correctAnsRes);
            setTextAnswers(textAnswersRes);
            setNumericalAnswers(numericalAnswersRes);
            setCorrectUser(correctUserList);
            setIncorrectUser(incorrectUserList);



        }
    }, [data]);
    console.log(data,'data in answer panel');
    console.log(config,'config in answer panel');




    return (
        <Container p ={10} fluid>

            {
               responses && responses.map((res) => {
                   switch (res.type) {
                       case 'shortText':
                           return  <AnswerSubPanelText textAnswers={textAnswers[res.id]} qid={res.id}
                                                       prompt={res.prompt}
                                                       type={res.type}
                                                       trialName={trialName}  />;
                       case 'longText':
                           return  <AnswerSubPanelText textAnswers={textAnswers[res.id]} qid={res.id}
                                                       prompt={res.prompt}
                                                       type={res.type}
                                                       trialName={trialName}  />;
                       case 'dropdown':
                           return <AnswerSubPanel
                               correctUser={correctUser[res.id]}
                           incorrectUser={incorrectUser[res.id]}
                           stats={stats[res.id]}
                           correctValue={correctValue[res.id] as string}
                           trialName={trialName}
                           type={res.type}
                           prompt={res.prompt}
                           qid={res.id} />;
                       case 'radio':
                           return <AnswerSubPanel correctUser={correctUser[res.id] }
                                                  incorrectUser={incorrectUser[res.id]}
                                                  stats={stats[res.id]}
                                                  correctValue={correctValue[res.id] as string}
                                                  trialName={trialName}
                                                  type={res.type}
                                                  prompt={res.prompt}
                                                  qid={res.id} />;
                          case 'checkbox':
                              return <AnswerSubPanel correctUser={correctUser[res.id] }
                                                     incorrectUser={incorrectUser[res.id]}
                                                     stats={stats[res.id]}
                                                     correctValue={correctValue[res.id] as string}
                                                     trialName={trialName}
                                                     type={res.type}
                                                     prompt={res.prompt}
                                                     qid={res.id} />;
                          case 'numerical':
                              return <AnswerSubPanelNumerical correctUser={correctUser[res.id] }
                                                     incorrectUser={incorrectUser[res.id]}
                                                     data={numericalAnswers[res.id]}
                                                     correctValue={correctValue[res.id] as number}
                                                     trialName={trialName}
                                                     type={res.type}
                                                     prompt={res.prompt}
                                                     qid={res.id}  max={res.max} min={res.min}/>;

                       default:
                           <Box><Title> Data type not supported</Title></Box>;
                   }



                })
            }

        </Container>
    );
}
