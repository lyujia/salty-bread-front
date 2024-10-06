"use client"; // 클라이언트 컴포넌트로 설정
import React, { useState, useEffect, useRef, MutableRefObject, useImperativeHandle, forwardRef } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box, List, ListItem, ListItemText, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useRouter } from 'next/navigation';
interface Message {
  senderId: string;
  senderName: string;
  timestamp: string;
  message: string;
}

interface ChatRoomProps {
  roomId: string;
  roomTitle: string;
  onExit: (roomId: string) => void;
  onClose: () => void;
  websocket: MutableRefObject<WebSocket | null>;
}

interface UserInfo {
  userId: string;
  name: string;
  email: string;
}

const ChatRoom = forwardRef<{updateMessage: (messageText: string, senderName: string) => void}, ChatRoomProps>(({ roomId, roomTitle, onExit, onClose, websocket}, ref)=>{
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [scrollingUp, setScrollingUp] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState(roomTitle);
  const [inviteFriend, setInviteFriend] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [currentRoomTitle, setCurrentRoomTitle] = useState(roomTitle);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false); // 검색 모드 상태
  const [senderName, setSenderName] = useState(''); // 발송자 이름 상태
  const [keyword, setKeyword] = useState(''); // 키워드 상태
  const [sendDate, setSendDate] = useState<string>(''); // 날짜 상태
  const [showInviteInput, setShowInviteInput] = useState(false);
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const [searchMessages, setSearchMessages] = useState<Message[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchMessages = async () => {
      
      if (messagesContainerRef.current) {
        const scrollTop = messagesContainerRef.current.scrollTop;
      try {
        const response = await fetch(`https://api.saltybread.party/messages/${roomId}?limit=16`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const data = await response.json();
        if (data.statusCode === 200) {
          setMessages(data.body);
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = 0;
          }
        }else if(data.statusCode === 403){
          localStorage.removeItem('accessToken');
          router.push('/');
        } else {
          console.error('Error fetching messages:', data.message);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
    if (websocket.current) {
      websocket.current.onmessage = () => {
        fetchMessages;
      };
    }
  }}, [roomId, websocket]);
  
  useEffect(() => {
    
    const fetchMessages = async () => {
      
      if (messagesContainerRef.current) {
        const scrollTop = messagesContainerRef.current.scrollTop;
      try {
        const response = await fetch(`https://api.saltybread.party/messages/${roomId}?limit=16`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const data = await response.json();
        if (data.statusCode === 200) {
          setMessages(data.body);
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = 0;
          }
        } else if(data.statusCode === 403){
          localStorage.removeItem('accessToken');
          router.push('/');
        }else {
          console.error('Error fetching messages:', data.message);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    }
    fetchMessages();
  }, [roomId]);

  const handleSendMessage = async () => {
    try {
      const response = await fetch(`https://api.saltybread.party/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ message: newMessage, roomId }),
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        setMessages((prevMessages) => [...prevMessages, data.body]);
        setNewMessage('');
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = 0;
          console.log(messagesContainerRef.current.scrollTop);
        }
      } else if(data.statusCode === 403){
        localStorage.removeItem('accessToken');
        router.push('/');
      }else {
        setNewMessage('');
        alert('메세지 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  const handleShowRoomInfo = async () => {
    try {
      const response = await fetch(`https://api.saltybread.party/chatRooms/${roomId}/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        setUsers(data.body);
        setShowRoomInfo(true);
      }else if(data.statusCode === 403){
        localStorage.removeItem('accessToken');
        router.push('/');
      } else {
        alert('방 정보를 읽는 것에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching room info:', error);
    }
  };
  const handleScroll =  () => {
    if (messagesContainerRef.current) {
      if (-messagesContainerRef.current.scrollTop >= messagesContainerRef.current.scrollHeight - messagesContainerRef.current.clientHeight - 1&& !scrollingUp ) {
        if(!loadingOlderMessages){
        setLoadingOlderMessages(true);
         fetchOlderMessages();
        }
      }else {
        setScrollingUp(false);
      }
    }
  };

  const fetchOlderMessages = async () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const previousScrollHeight = container.scrollHeight;
      const previousScrollTop = container.scrollTop;
      try {
        const response = await fetch(`https://api.saltybread.party/messages/${roomId}?limit=8&cursor=${messages[0].timestamp}`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const data = await response.json();
        if (data.statusCode === 200) {
          setMessages((prevMessages) => [...data.body, ...prevMessages]);
          setScrollingUp(true);
          if (messagesContainerRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            messagesContainerRef.current.scrollTop =  previousScrollTop + newScrollHeight- previousScrollHeight;
          }
        }else if(data.statusCode === 403){
          localStorage.removeItem('accessToken');
          router.push('/');
        } else {
          console.error('Error fetching older messages:', data.message);
        }
      } catch (error) {
        console.error('Error fetching older messages:', error);
      } finally {
        setLoadingOlderMessages(false);
      }  
    }
  };
  

  const handleLeaveRoom = async() => {{
    try{
      const response = await fetch(`https://api.saltybread.party/chatRooms/${roomId}/users`,{
        method: "DELETE",
        headers : {
            'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        setMessages((prevMessages) => [...data.body, ...prevMessages]); // !! 새로운 메시지를 기존 메시지 앞에 추가
        onExit(`${roomId}`);
      } else if(data.statusCode === 403){
        localStorage.removeItem('accessToken');
        router.push('/');
      }else {
        console.error('Error fetching older messages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching older messages:', error);
    } 
    }
  };


  const handleChangeTitle = async () => {
    try {
      const response = await fetch(`https://api.saltybread.party/chatRooms/${roomId}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ title: newRoomTitle }),
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        setEditingTitle(false);
        setShowRoomInfo(false); // 모달을 닫아서 배경을 어둡게 유지하지 않음
        setCurrentRoomTitle(newRoomTitle);
        alert('방 제목이 변경되었습니다.');
      } else if(data.statusCode === 403){
        localStorage.removeItem('accessToken');
        router.push('/');
      }else {
        alert('방 제목 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error changing room title:', error);
    }
  };

  const handleInvite = async () => {
    try {
      const response = await fetch(`https://api.saltybread.party/chatRooms/${roomId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ friendEmails: [inviteFriend] }),
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        alert('친구가 초대되었습니다.');
        setInviteFriend('');
        setShowInviteInput(false);
        setShowRoomInfo(false); 
      } else if(data.statusCode === 403){
        localStorage.removeItem('accessToken');
        router.push('/');
      }else {
        alert('친구 초대에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error inviting friend:', error);
    }
  }



  const handleSearchMessages = async () => {
    const searchParams = new URLSearchParams();
    if (senderName) searchParams.append('senderName', senderName);
    if (keyword) searchParams.append('keyword', keyword);
    if (sendDate) searchParams.append('sendDate', sendDate);
    
    try {
      const response = await fetch(`https://api.saltybread.party/messages/${roomId}?${searchParams.toString()}&limit=100`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      console.log(data);
      if (data.statusCode === 200) {
        setSearchMessages(data.body);
        console.log(data.body);
        console.log(searchMessages);
      }else if(data.statusCode === 403){
        localStorage.removeItem('accessToken');
        router.push('/');
      } else {
        console.error('Error fetching messages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  const toggleSearchMode = () => {
    setIsSearchMode(!isSearchMode);
    if (isSearchMode) {
      setSenderName('');
      setKeyword('');
      setSendDate('');
      setSearchMessages([]);
    }
  };
  useImperativeHandle(ref, () => ({
    updateMessage(messageText: string, senderName: string){
      const newMessage: Message = {
        senderId: "Unknown",
        senderName: senderName,
        timestamp: new Date().toISOString(), // 현재 시간의 타임스탬프
        message: messageText,
      };
      setMessages((prevMessages) => [...prevMessages,newMessage]);
    }
  }
  ));
 

  return (
    <Box sx={{ padding: 3, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isSearchMode ? (
        <>
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box
              ref={messagesContainerRef}
              sx={{
                height: '60vh', // 고정된 높이 설정
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                padding: 1,
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
              onScroll={handleScroll}
            >
              {loadingOlderMessages && ( // !! 로딩 중일 때 스피너 표시
                <Typography align="center" sx={{ padding: 2 }}>
                  메시지 로딩 중...
                </Typography>
              )}
              <div ref={messageEndRef} />
              <List>
                {messages.map((message) => (
                  <ListItem key={message.senderId}>
                    <ListItemText
                      primary={message.senderName}
                      secondary={message.message}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
              <TextField
                variant="outlined"
                label="메시지 입력"
                fullWidth
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="contained" onClick={handleSendMessage} sx={{ ml: 1 }}>
                전송
              </Button>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 1 }}>
            <Button variant="outlined" color="error" onClick={onClose}>
              채팅 닫기
            </Button>
            <Button variant="outlined" onClick={toggleSearchMode}>
              메시지 검색하기
            </Button>
            <Button variant="outlined" onClick={handleShowRoomInfo}>
              방 정보
            </Button>
          </Box>
  
          {/* 방 정보 모달 */}
          <Dialog open={showRoomInfo} onClose={() => setShowRoomInfo(false)}>
            <DialogTitle>
              {currentRoomTitle}
              <IconButton onClick={() => setEditingTitle(true)} size="small">
                <EditIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              {users.length > 0 ? (
                <List>
                  {users.map((user) => (
                    <ListItem key={user.userId}>
                      <ListItemText
                        primary={user.name}
                        secondary={user.email}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>정보를 불러오는 중...</Typography>
              )}
              <Box sx={{ mt: 2 }}>
                <TextField
                  variant="outlined"
                  label="친구 이메일 입력"
                  fullWidth
                  value={inviteFriend}
                  onChange={(e) => setInviteFriend(e.target.value)}
                  sx={{ mb: 1 }}
                />
                <Button variant="contained" onClick={handleInvite}>
                  친구 추가
                </Button>
                <Button variant="contained" color="error" onClick={handleLeaveRoom}>
                  방 나가기
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowRoomInfo(false)}>닫기</Button>
            </DialogActions>
          </Dialog>
  
          {/* 방 제목 변경 모달 */}
          <Dialog open={editingTitle} onClose={() => setEditingTitle(false)}>
            <DialogTitle>방 제목 변경</DialogTitle>
            <DialogContent>
              <TextField
                variant="outlined"
                label="새 방제목"
                fullWidth
                value={newRoomTitle}
                onChange={(e) => setNewRoomTitle(e.target.value)}
                sx={{ mb: 1 }}
              />
              <Button variant="contained" onClick={handleChangeTitle}>
                변경
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditingTitle(false)}>취소</Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        <>
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
  <Box
    ref={messagesContainerRef}
    sx={{
      height: '60vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column-reverse',
      padding: 1,
      border: '1px solid #ddd',
      borderRadius: '8px',
    }}
  >
    <List>
      {searchMessages.map((message) => (
        <ListItem key={message.timestamp}>
          <ListItemText primary={message.senderName} secondary={message.message} />
        </ListItem>
      ))}
    </List>
  </Box>
  <Box sx={{ display: 'flex', alignItems: 'center', padding: 1 }}>
    <TextField
      variant="outlined"
      label="발송자(정확히 입력)"
      value={senderName}
      onChange={(e) => setSenderName(e.target.value)}
      sx={{ mb: 1, mr: 1, flex: 1 }} // 입력 필드의 너비를 줄이고 간격을 조정
    />
    <TextField
      variant="outlined"
      label="키워드"
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
      sx={{ mb: 1, mr: 1, flex: 1 }} // 입력 필드의 너비를 줄이고 간격을 조정
    />
    <TextField
      variant="outlined"
      label="날짜"
      type="date"
      value={sendDate}
      onChange={(e) => setSendDate(e.target.value)}
      sx={{ mb: 1, flex: 1 }} // 입력 필드의 너비를 줄임
      InputLabelProps={{
        shrink: true,
      }}
    />
  </Box>
  <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 1 }}>
    <Button variant="contained" onClick={handleSearchMessages} sx={{ mb: 1 }}>
      검색
    </Button>
    <Button variant="outlined" onClick={toggleSearchMode} sx={{ mb: 1 }}>
      채팅방으로 돌아가기
    </Button>
  </Box>
</Box>

        </>
      )}
    </Box>
  );
  
}
)

export default ChatRoom;
