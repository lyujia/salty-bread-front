
"use client"

import React, { useState, useEffect } from "react"; // useState와 useEffect 추가
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
      // 토큰 존재 여부 확인
      const token = localStorage.getItem("accessToken"); // 예시로 localStorage에서 가져옴
      if (token) {
        router.push('/main')
      } else {
        router.push('/login')
      }
    }, [router]);
    return null;
}
//얘가 처음 페이지이다.
