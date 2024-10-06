"use client";
import React, { useState, useEffect } from 'react';
import { Button, Modal, TextField, Typography, Box, List, ListItem, ListItemText, ListItemSecondaryAction,IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter } from 'next/navigation';

interface Friend {
  userId: string;
  name: string;
  email: string;
}

function GetFriend() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [newFriendEmail, setNewFriendEmail] = useState('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태 추가
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('accessToken') ?? '';
    setAccessToken(token);
    fetch('https://api.saltybread.party/friends', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(response => response.json())
      .then(data => setFriends(data.body))
      .catch(error => console.error('Error fetching friends:', error));
  }, []);

  const addFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
     const response = await fetch('https://api.saltybread.party/friends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ friendEmail: newFriendEmail }),
    });
    const data = await response.json();
    if(data.statusCode === 200){
        setFriends([...friends, data.body]);
        setShowAddFriendModal(false);
        setNewFriendEmail('');
      }else if(data.statusCode === 404){
        alert('존재하지 않는 이메일 입니다.');
        setNewFriendEmail('');
      }else if(data.statusCode === 403){
        localStorage.removeItem('accessToken');
        router.push('/');
      }else{
        alert('잘못된 요청입니다.');
      }
    }catch(error){console.error('Error adding friend:', error)};
  };
  const handleSearch = async (e:string) => {
    try {
      const url = e !== ''
        ? `https://api.saltybread.party/friends?friendName=${encodeURIComponent(searchTerm)}`
        : 'https://api.saltybread.party/friends';
      if(e === ''){
        setSearchTerm('');
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        setFriends(data.body);
      } else {
        console.error('Error fetching friends:', data.message);
      }
    } catch (e) {
      console.error('Error: ' + e);
    }
  };

  const deleteFriend = async (email: string) => {
    try{
      const response = await fetch(`https://api.saltybread.party/friends`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body : JSON.stringify({
        friendEmail: email
      })
    });
    const data = await response.json();
    if(data.statusCode === 200){
      setFriends(friends.filter(friend => friend.email !== email));
    }else{

    }
    }catch(error){
    console.error('Error deleting friend:', error)
  }
  };

  return (
    <div>
      <Typography variant="h5" gutterBottom>
        친구 목록
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          variant="outlined"
          label="검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1, mr: 1 }}
        />
        <IconButton color="primary" onClick={()=>handleSearch(`${searchTerm}`)}>
          <SearchIcon />
        </IconButton>
        <IconButton color="secondary" onClick={()=>handleSearch('')}>
          <ClearIcon />
        </IconButton>
      </Box>
      <List>
        {friends.map(friend => (
          <ListItem key={friend.userId}>
            <ListItemText
              primary={friend.name}
              secondary={friend.email}
            />
            <ListItemSecondaryAction>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => deleteFriend(friend.email)}
              >
                삭제
              </Button>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setShowAddFriendModal(true)}
      >
        친구 추가
      </Button>
      <Modal
        open={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        aria-labelledby="add-friend-modal"
        aria-describedby="add-friend-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            친구 추가
          </Typography>
          <form onSubmit={addFriend}>
            <TextField
              type="email"
              label="이메일"
              variant="outlined"
              fullWidth
              value={newFriendEmail}
              onChange={(e) => setNewFriendEmail(e.target.value)}
              sx={{ mb: 2 }}
              required
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button type="submit" variant="contained" color="primary">
                추가
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {
                  setShowAddFriendModal(false);
                  setNewFriendEmail('');
                }}
              >
                닫기
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
    </div>
  );
}

export default GetFriend;
