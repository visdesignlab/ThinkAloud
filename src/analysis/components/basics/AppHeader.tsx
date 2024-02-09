import {
    Button,
    Container,
    Flex, Group,
    Header, Image, MediaQuery, Select, Title,
} from '@mantine/core';

import logo from '../../assets/revisitLogoSquare.svg';
import {IconHome, IconDeviceDesktopAnalytics} from '@tabler/icons-react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import React, {useState} from 'react';
import {HeaderProps} from '../../types';

export default function AppHeader(props:HeaderProps) {
    const { studyIds } = props;
    const [searchParams] = useSearchParams();
    const exp = searchParams.get('exp');

    const [activeExp, setActiveExp] = useState<string | null>(exp || null);
    const navigate = useNavigate();
    const page = location.pathname.split('/')[2];
    const selectorData = studyIds.map((id)=>{return {value: id, label: id};});

    const onExpChange = (value: string) => {
        setActiveExp(value);
        navigate(`/analysis/stats/?exp=${value}`);
    };

    return (
           <Header height={70} p="md">
               <Group>
                   <Image maw={50} src={logo} />
                   <MediaQuery smallerThan="md" styles={{ display: 'none' }}>
                        <Title span order={1}>reVISit Analytics Platform</Title>
                   </MediaQuery>

                   <Container fluid>
                        <Flex
                            gap="md"
                            justify="flex-end"
                            align="center"
                            direction="row"
                            wrap="wrap"
                        >
                                <Button
                                    color={'orange'}
                                    onClick={()=>{navigate('/analysis/dashboard');} }
                                    variant={page==='dashboard'? 'filled' : 'outline'}>
                                    <IconHome size={20} />
                                </Button>
                                <Button
                                    color={'orange'}
                                    onClick={()=>{navigate('/analysis/stats');} }
                                    variant={page==='stats'? 'filled' : 'outline'}>
                                    <IconDeviceDesktopAnalytics size={20} />
                                </Button>
                            {page === 'stats' && <Select
                                    placeholder="Select an experiment"
                                    data={selectorData}
                                    value={activeExp}
                                    onChange={onExpChange}
                                />
                            }

                        </Flex>
                    </Container>
               </Group>



           </Header>
    );
}
