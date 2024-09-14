"use client"; // 클라이언트 컴포넌트로 설정
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextField, Box, Typography } from '@mui/material'; // Box 컴포넌트를 추가로 사용

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const register = async () => {
    try {
      const response = await fetch('https://api.saltybread.party/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, signagure: localStorage.getItem('verificationSignature') }),
      });
      //와 여기가 문제네..
      const data = await response.json();
      if (data.statusCode === 200) {
        router.push('/');
      } else {
        setEmail('');
        setName('');
        setPassword('');
        alert('회원가입에 실패했습니다.');
      }
    } catch (error) {
      alert('회원가입에 실패했습니다.');
    }
  };

  const sendEmailVerification = async () => {
    try {
      const response = await fetch('https://api.saltybread.party/email/verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (data.statusCode === 200) {
        alert('인증 메일을 전송하였습니다.');
      } else {
        alert('인증 메일을 전송하는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    console.log("이메일 인증 보내기 클릭됨");
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      p={2}
    >
      <Box
        component="form"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        sx={{
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          width: '100%',
          maxWidth: 400,
        }}
      >
        <Typography variant="h5" component="h2" mb={2}>
          회원가입
        </Typography>
        
        <Box display="flex" flexDirection="column" width="100%" gap={2} mb={3}>
          <TextField
            type="email"
            id="email"
            label="이메일"
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <Button
            variant="contained"
            onClick={sendEmailVerification}
          >
            인증 보내기
          </Button>
        </Box>

        <TextField
          type="text"
          id="name"
          label="닉네임"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <TextField
          type="password"
          id="password"
          label="비밀번호"
          variant="standard"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          margin="normal"
        />
        <Button
          type="button"
          variant="contained"
          fullWidth
          onClick={register}
          sx={{ mt: 3 }}
        >
          회원가입
        </Button>
      </Box>
    </Box>
  );
}

export default RegisterForm;
