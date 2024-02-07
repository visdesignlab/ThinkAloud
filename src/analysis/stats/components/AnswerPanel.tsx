import {Box, Container} from '@mantine/core';
import {AnswerPanelProps} from '../../types';

export default function AnswerPanel(props: AnswerPanelProps){
    const {data,config} = props;
    console.log(data,'data in answer panel');
    console.log(config,'config in answer panel');



    return (
        <Container p ={10} sx={{boxShadow:'1px 2px 2px 3px lightgrey;', borderRadius:'5px'}}>
            <Box>AnswerPanelfsdds</Box>

        </Container>
    );
}
