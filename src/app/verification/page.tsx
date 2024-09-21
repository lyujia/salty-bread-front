"use client"; // 클라이언트 컴포넌트로 설정
import React, { useEffect, useState } from 'react';
import { Typography, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useSearchParams } from 'next/navigation';

function GetVerification() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const [isverificated, setIsverificated] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      if (!code) {
        console.log('코드가 존재하지 않습니다.');
        return;
      }

      try {
        const response = await fetch(`https://api.saltybread.party/email/verifications?code=${code}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          }
        });
        const data = await response.json();
        if (data.statusCode === 200) {
          localStorage.setItem('verificationSignature', data.body);
          setIsverificated(true);
        } else {
          alert('인증에 문제가 생겼습니다.');
        }
      } catch (error) {
        console.error('Error fetching verification:', error);
      }
    };

    verifyEmail();
  }, [code]);

  // 코드가 있는 경우 성공 메시지를, 없는 경우 실패 메시지를 렌더링
  if (code !== null && isverificated) {
    return (
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ height: '100vh' }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          이메일이 확인되었습니다.
        </Typography>
        <Typography variant="body1" align="center">
          회원가입 화면으로 돌아가 주세요.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/register'}
          style={{ marginTop: '20px' }}
        >
          회원가입 화면으로 돌아가기
        </Button>
      </Grid>
    );
  } else {
    return (
      <Grid
        container
        direction="column"
        alignItems="center"
        justifyContent="center"
        style={{ height: '100vh' }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          이메일 인증이 만료되었습니다.
        </Typography>
        <Typography variant="body1" align="center">
          다시 요청해 주세요.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/register'}
          style={{ marginTop: '20px' }}
        >
          회원가입 화면으로 돌아가기
        </Button>
      </Grid>
    );
  }
}

// App 컴포넌트에 Suspense로 감싸기
export default function App() {
  return (
    <React.Suspense fallback={<div>로딩 중...</div>}>
      <GetVerification />
    </React.Suspense>
  );
}
