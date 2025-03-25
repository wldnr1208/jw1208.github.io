---
layout: post
title: "[공통] 웹 인증의 세 가지 방식: 세션 vs 쿠키 vs 토큰"
date: 2024-12-29
categories: [Web, Security]
tags: [Common, session, cookie, token, authentication, web security]
pin: false
comments: true
---

# 웹 인증의 세 가지 방식: 세션 vs 쿠키 vs 토큰

웹 애플리케이션에서 사용자 인증은 매우 중요한 부분입니다. 오늘은 가장 널리 사용되는 세 가지 인증 방식인 세션, 쿠키, 토큰에 대해 자세히 알아보겠습니다.

## 목차
1. [세션 기반 인증](#세션-기반-인증)
2. [쿠키 기반 인증](#쿠키-기반-인증)
3. [토큰 기반 인증](#토큰-기반-인증)
4. [세 가지 방식의 비교](#세-가지-방식의-비교)
5. [실제 구현 예시](#실제-구현-예시)

## 세션 기반 인증

세션은 서버 측에서 사용자의 정보를 저장하고 관리하는 방식입니다.

### 동작 방식
1. 사용자가 로그인
2. 서버는 세션 생성 및 저장
3. 서버는 세션 ID를 클라이언트에게 전달
4. 클라이언트는 세션 ID를 쿠키에 저장
5. 이후 요청마다 세션 ID를 전송하여 인증

### 예시 코드 (Node.js + Express)
```javascript
const express = require('express');
const session = require('express-session');

const app = express();

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));

app.post('/login', (req, res) => {
    // 사용자 인증 후
    req.session.userId = user.id;
    res.send('로그인 성공');
});
```

### 장점
- 서버 측에서 세션 제어 가능
- 상대적으로 보안성이 높음
- 클라이언트 측 저장소 부담이 적음

### 단점
- 서버 메모리 사용량 증가
- 확장성 문제 (서버가 여러 대일 경우)
- CORS 문제 발생 가능

## 쿠키 기반 인증

쿠키는 클라이언트 측에서 데이터를 저장하고 관리하는 방식입니다.

### 동작 방식
1. 사용자가 로그인
2. 서버는 인증 정보를 쿠키에 담아 응답
3. 브라우저는 쿠키 저장
4. 이후 요청마다 자동으로 쿠키 전송

### 예시 코드 (Node.js)
```javascript
app.post('/login', (req, res) => {
    // 사용자 인증 후
    res.cookie('user', {
        id: user.id,
        username: user.username
    }, {
        maxAge: 24 * 60 * 60 * 1000, // 24시간
        httpOnly: true,
        secure: true
    });
    res.send('로그인 성공');
});
```

### 장점
- 구현이 간단
- 서버 부하가 적음
- 자동으로 전송되는 특성

### 단점
- 보안 취약성 (XSS, CSRF 공격 위험)
- 용량 제한 (보통 4KB)
- 클라이언트에서 조작 가능

## 토큰 기반 인증

토큰은 클라이언트가 인증 정보를 토큰 형태로 저장하고 관리하는 방식입니다. 주로 JWT(JSON Web Token)가 사용됩니다.

### 동작 방식
1. 사용자가 로그인
2. 서버는 JWT 토큰 생성 및 전달
3. 클라이언트는 토큰을 저장 (localStorage 등)
4. 이후 요청 시 Authorization 헤더에 토큰을 담아 전송

### 예시 코드 (Node.js + JWT)
```javascript
const jwt = require('jsonwebtoken');

app.post('/login', (req, res) => {
    // 사용자 인증 후
    const token = jwt.sign(
        { id: user.id, username: user.username },
        'your-secret-key',
        { expiresIn: '24h' }
    );
    res.json({ token });
});

// 토큰 검증 미들웨어
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
```

### 장점
- 서버가 상태를 저장하지 않음 (Stateless)
- 확장성이 좋음
- 다양한 도메인에서 사용 가능 (CORS 문제 해결)

### 단점
- 토큰 크기가 상대적으로 큼
- 토큰 탈취 시 대응이 어려움
- 클라이언트 측에서 관리 필요

## 세 가지 방식의 비교

| 특성 | 세션 | 쿠키 | 토큰 |
|------|------|------|------|
| 저장 위치 | 서버 | 클라이언트 | 클라이언트 |
| 확장성 | 낮음 | 중간 | 높음 |
| 보안성 | 높음 | 중간 | 높음 |
| 구현 복잡도 | 중간 | 낮음 | 높음 |
| CORS | 어려움 | 어려움 | 쉬움 |
| 서버 부하 | 높음 | 낮음 | 낮음 |

## 실제 구현 예시

각각의 방식을 실제로 구현할 때 고려해야 할 보안 설정들입니다.

### 세션 설정 예시
```javascript
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // HTTPS만 허용
        httpOnly: true, // JavaScript에서 접근 불가
        maxAge: 24 * 60 * 60 * 1000, // 24시간
        sameSite: 'strict' // CSRF 방지
    }
}));
```

### 쿠키 설정 예시
```javascript
res.cookie('sessionId', 'user123', {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
    domain: 'yourdomain.com'
});
```

### JWT 토큰 설정 예시
```javascript
const token = jwt.sign(
    {
        id: user.id,
        username: user.username,
        role: user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: '24h',
        algorithm: 'HS256',
        issuer: 'your-app-name',
        audience: 'your-app-users'
    }
);
```

## 결론

각각의 인증 방식은 저마다의 장단점이 있으며, 애플리케이션의 요구사항에 따라 적절한 방식을 선택해야 합니다.

- **세션**: 전통적인 웹 애플리케이션, 높은 보안이 필요한 경우
- **쿠키**: 간단한 웹사이트, 낮은 보안 요구사항
- **토큰**: 현대적인 SPA, 마이크로서비스 아키텍처, 모바일 앱

어떤 방식을 선택하든 보안을 최우선으로 고려하고, 적절한 보안 설정을 적용하는 것이 중요합니다.