"use client"; // 클라이언트 컴포넌트로 설정
import React, { useState, useEffect,MutableRefObject } from 'react';
import { Typography, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, ListItemText, Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ChatRoom from '../modals/chat-room';

interface Room {
  roomId: string;
  title: string;
}
interface RoomProps{
  websocket: MutableRefObject<WebSocket | null>
}
const GetRoom: React.FC<RoomProps>= ({websocket}) =>{
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [friendEmails, setFriendEmails] = useState<string[]>(['']); // Initialize with one email input field
  const [accessToken, setAccessToken] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(''); // Store the selected room ID
  const [selectedRoomTitle, setSelectedRoomTitle] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken') ?? '';
    setAccessToken(token);
    const fetchRooms = async () => {
      try {
        const response = await fetch("https://api.saltybread.party/chatRooms", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.statusCode === 200) {
          setRooms(data.body)
        } else {
          alert('방들을 가져오는데 실패했습니다.')
        }
      } catch (error) {
        console.error('Error fetching rooms:', error);
      }
    };

    fetchRooms();
  }, []);

  const addRoom = async () => {
    try {
      const response = await fetch("https://api.saltybread.party/chatRooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title: newTitle, friendEmails }),
      });

      const data = await response.json();
      if (data.statusCode === 200) {
        const newRoom: Room = {
          roomId: `${data.body.roomId}`, 
          title: newTitle,
        };
        setRooms([...rooms, newRoom]); // Assuming the response data contains the new room
        setShowRoomModal(false);
        setNewTitle('');
        setFriendEmails(['']);
      } else {
        setFriendEmails(['']);
        alert('존재하지 않는 이메일이 포함되어 있습니다.');
      } // Reset email fields
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...friendEmails];
    updatedEmails[index] = value;
    setFriendEmails(updatedEmails);
  };

  const addEmailField = () => {
    setFriendEmails([...friendEmails, '']); // Add a new email field
  };

  const removeEmailField = (index: number) => {
    setFriendEmails(friendEmails.filter((_, i) => i !== index)); // Remove the specified email field
  };
  const exitRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.roomId!==roomId));
    setSelectedRoomId('');
  };

  const handleEnterRoom = (roomId: string, title: string) => {
    setSelectedRoomId(roomId); // Set selected room ID
    setSelectedRoomTitle(title);
  };

  const handleCloseChatRoom = () => {
    setSelectedRoomId(''); // Close chat room modal
  };

  // Disable the add room button if the room title is empty or any friend email is empty
  const isAddRoomDisabled = newTitle.trim() === '' || friendEmails.some(email => email.trim() === '');

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        방 목록
      </Typography>
      <List>
        {rooms.map((room) => (
          <ListItem key={room.roomId}>
            <ListItemText primary={room.title} secondary={room.roomId} />
            <Button
              variant="outlined"
              onClick={() => handleEnterRoom(room.roomId, room.title)}
              sx={{ marginLeft: 2 }}
            >
              들어가기
            </Button>
          </ListItem>
        ))}
      </List>
      <Button variant="contained" onClick={() => setShowRoomModal(true)}>
        방 추가
      </Button>
      <Dialog open={showRoomModal} onClose={() => setShowRoomModal(false)}>
        <DialogTitle>방 추가</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="방제목 입력"
            type="text"
            fullWidth
            variant="standard"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            {friendEmails.map((email, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TextField
                  margin="dense"
                  label={`이메일 ${index + 1}`}
                  type="email"
                  fullWidth
                  variant="standard"
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                />
                <IconButton onClick={() => removeEmailField(index)} sx={{ ml: 1 }}>
                  <RemoveIcon />
                </IconButton>
              </Box>
            ))}
            <Button onClick={addEmailField} startIcon={<AddIcon />} sx={{ mt: 1 }}>
              이메일 추가
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowRoomModal(false);
            setNewTitle('');
            setFriendEmails(['']); // Reset email fields
          }}>닫기</Button>
          <Button onClick={addRoom} disabled={isAddRoomDisabled}>
            추가
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Room Modal */}
      <Dialog
        open={Boolean(selectedRoomId)}
        onClose={handleCloseChatRoom}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '80vh',
            maxHeight: '80vh',
            backgroundColor: '#f5f5f5',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          },
        }}
      >
        {selectedRoomId&& selectedRoomTitle&& (
          <ChatRoom roomId={selectedRoomId} roomTitle={selectedRoomTitle} onExit={exitRoom} onClose={handleCloseChatRoom}  websocket={websocket} />
        )}
      </Dialog>
    </Box>
  );
}

export default GetRoom;
