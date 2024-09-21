"use client";

import React, { useState,useRef, useEffect, RefObject } from "react";
import { Box, Tab, Badge } from "@mui/material";
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import { TabContext, TabList, TabPanel } from "@mui/lab";
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import GetFriend from "../friend/page";
import GetRoom from "../room/page";
import MyPage from "../mypage/page";

function Main() {
  const [tabValue, setTabValue] = useState(0);
  const websocket = useRef<WebSocket | null>(null); // useRef로 WebSocket 참조
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  useEffect(() => {
    if(websocket.current){
      setNotificationsEnabled(true);
    }else{
      setNotificationsEnabled(false);
    }
  },[]
)
  function onTabListChanged(_: React.SyntheticEvent, newValue: number) {
    setTabValue(newValue);
  };
  const openWebSocket = () => {
    if (websocket.current) return; // 이미 연결되어 있으면 종료

    const token = localStorage.getItem('accessToken');
    websocket.current = new WebSocket(`ws://localhost:8000/notifications?token=${token}`);

    websocket.current.onopen = () => {
      console.log("WebSocket connection opened");
      setNotificationsEnabled(true); // 연결이 성공적으로 열리면 상태 업데이트
    };

    websocket.current.onmessage = (event) => {
      const message = event.data;
      setNotificationMessage(message);

      setTimeout(() => {
        setNotificationMessage('');
      }, 3000);
    };

    websocket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setNotificationsEnabled(false);
    };

    websocket.current.onclose = () => {
      console.log("WebSocket connection closed");
      setNotificationsEnabled(false); // 연결이 닫히면 상태 업데이트
      websocket.current = null; // WebSocket 참조 초기화
    };
  };

  // WebSocket 연결 해제 함수
  const closeWebSocket = () => {
    if (websocket.current) {
      websocket.current.close();
      websocket.current = null; // WebSocket 참조 초기화
      setNotificationsEnabled(false); // 상태 업데이트
      console.log("WebSocket connection closed on cleanup");
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <TabContext value={tabValue}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList 
            onChange={onTabListChanged}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            
            <Tab value="1" icon={<GroupRoundedIcon />} label="친구목록" />
            <Tab value="2" icon={<Badge color="error" variant="dot" invisible={notificationMessage === ''}>
                  <EmailRoundedIcon />
                </Badge>} label="대화" />
            <Tab value="3" icon={<PersonRoundedIcon />} label="마이페이지" />
          </TabList>
        </Box>
        <TabPanel value="1">
          <GetFriend/>
        </TabPanel>
        <TabPanel value="2">
          <GetRoom websocket={websocket} />
        </TabPanel>
        <TabPanel value="3">
          <MyPage  notificationEnabled={notificationsEnabled} openWebSocket={openWebSocket} closeWebSocket={closeWebSocket}/>
        </TabPanel>
      </TabContext>
    </Box>
  );
}

export default Main;
