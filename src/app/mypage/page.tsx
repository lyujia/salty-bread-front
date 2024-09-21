"use client"; // 클라이언트 컴포넌트로 설정
import React, { useState, useEffect, RefObject } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box, Switch, Snackbar } from '@mui/material';



interface UserInfo {
  name: string;
  email: string;
}
interface MyPageProps {
  notificationEnabled: boolean;
  openWebSocket: () => void;
  closeWebSocket: () => void;
}
function MyPage({notificationEnabled, openWebSocket, closeWebSocket}:MyPageProps) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const router = useRouter();
  
 
  useEffect(() => {

    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken')
      try {
        const response = await fetch('https://api.saltybread.party/users/info', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        const data = await response.json();
        if(data.statusCode === 200){
            setUser(data.body);
        }else{
            alert('정보를 읽어오는데 실패했습니다.')
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);



  const handleNameChange = async () => {
    try {
      const response = await fetch('https://api.saltybread.party/users/info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        setUser((prev) => (prev ? { ...prev, name: newName } : null));
        setShowNameModal(false);
        setNewName('');
      } else {
        alert('이름 변경에 실패했습니다.');
      }
    } catch (error) {
      alert('이름 변경에 실패했습니다.');
    }
  };

  const handlePasswordChange = async () => {
    try {
      const response = await fetch('https://api.saltybread.party/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        setShowPasswordModal(false);
        setNewPassword('');
        setOldPassword('');
        alert('비밀번호 변경에 성공했습니다.')
      } else {
        alert('비밀번호 변경에 실패했습니다.');
      }
    } catch (error) {
      alert('비밀번호 변경에 실패했습니다.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/');
  };

  const handleAccountDeletion = async () => {
    try {
      const response = await fetch('https://api.saltybread.party/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        localStorage.removeItem('accessToken');
        router.push('/');
      } else {
        alert('회원 탈퇴에 실패했습니다.');
      }
    } catch (error) {
      alert('회원 탈퇴에 실패했습니다.');
    }
  };

  // WebSocket 연결 설정 함수
  

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="#f0f0f0"
    >
      <Box
        width={{ xs: '90%', sm: '60%', md: '40%' }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={5}
        bgcolor="white"
        boxShadow={3}
        borderRadius={2}
      >
        <Typography variant="h4" gutterBottom>
          마이페이지
        </Typography>
        {user ? (
          <>
            <Typography variant="h6" gutterBottom>
              이메일: {user.email}
            </Typography>
            <Typography variant="h6" gutterBottom>
              닉네임: {user.name}
            </Typography>
          
            <Button
              variant="contained"
              onClick={() => setShowNameModal(true)}
              sx={{ mb: 2 }}
            >
              닉네임 변경
            </Button>
            <Button
              variant="contained"
              onClick={() => setShowPasswordModal(true)}
              sx={{ mb: 2 }}
            >
              비밀번호 변경
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleAccountDeletion}
              sx={{ mb: 2 }}
            >
              회원 탈퇴
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
             {/* WebSocket 연결 및 연결 해제 버튼 */}
             <Button
              variant="contained"
              color={notificationEnabled ? "secondary" : "primary"}
              onClick={notificationEnabled ? closeWebSocket : openWebSocket}
              sx={{ mt: 2 }}
            >
              {notificationEnabled ? '연결 해제하기' : '연결하기'}
            </Button>
          </>
        ) : (
          <Typography>사용자 정보를 불러오는 중...</Typography>
        )}
      </Box>

      {/* 닉네임 변경 모달 */}
      <Dialog open={showNameModal} onClose={() => setShowNameModal(false)}>
        <DialogTitle>닉네임 변경</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="새 닉네임"
            type="text"
            fullWidth
            variant="standard"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setNewName('');
            setShowNameModal(false);}}>취소</Button>
          <Button onClick={handleNameChange}>변경</Button>
        </DialogActions>
      </Dialog>

      {/* 비밀번호 변경 모달 */}
      <Dialog open={showPasswordModal} onClose={() => setShowPasswordModal(false)}>
        <DialogTitle>비밀번호 변경</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="현재 비밀번호"
            type="password"
            fullWidth
            variant="standard"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            label="새 비밀번호"
            type="password"
            fullWidth
            variant="standard"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {setShowPasswordModal(false)
            setNewPassword('');
            setOldPassword('');
          }}>취소</Button>
          <Button onClick={handlePasswordChange}>변경</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyPage;
