"use client"; // 클라이언트 컴포넌트로 설정
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, ButtonGroup, TextField } from '@mui/material';
import Grid from '@mui/material/Grid2';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const login = async () => {
    try {
      const response = await fetch('https://api.saltybread.party/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if(data.statusCode === 200) {
        const accessToken = data.body.accessToken;
        localStorage.setItem('accessToken', accessToken);
        router.push('/main');
      }
      else {
        setEmail('');
        setPassword('');
        alert('로그인에 실패했습니다.');
      }
    }
    catch(error) {
      alert('로그인에 실패했습니다.');
    }
  };
  const moveToSignupPage = () => {
    router.push('/register')
  };
  const moveToForgotPasswordPage = () => {
    // 비밀번호 찾기 로직을 여기에 추가하세요
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      className="h-screen"
    >
      <Grid
        size={8}
        rowSpacing={3}
        className="
          flex-col 
          jusytify-center 
          items-center 
          rounded-lg 
          shadow-xl
          shadow-blue-500/30
          p-5
        "
      >
        <Grid>
          <h1 className="text-3xl font-bold">로그인</h1>
        </Grid>
        <Grid>
          <TextField
            type="email"
            id="email"
            label="이메일"
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full'
            required
          />
        </Grid>
        <Grid>
          <TextField
            type="password"
            id="password"
            label="비밀번호"
            variant="standard"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full'
            required
          />
        </Grid>
        <Grid>
          <Button variant="contained" className='w-full' onClick={login}>로그인</Button>
        </Grid>
        <Grid>
          <ButtonGroup className='w-full'>
            <Button variant="text" className="w-full" onClick={moveToSignupPage}>회원가입</Button>
            <Button variant="text" className="w-full" onClick={moveToForgotPasswordPage}>비밀번호 찾기</Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default LoginForm;
