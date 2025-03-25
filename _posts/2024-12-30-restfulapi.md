---
layout: post
title: "[공통] REST API: 개념부터 실전 예제까지"
date: 2024-12-30
categories: [Common, API, REST]
tags: [Common, REST, API, HTTP, Web Development]
pin: false
comments: true
---

# REST API 완벽 가이드: 개념부터 실전 예제까지

## 목차
1. REST API란?
2. REST 아키텍처의 주요 원칙
3. REST API 설계 가이드라인
4. HTTP 메서드와 상태 코드
5. 실전 예제
6. 보안과 인증
7. 모범 사례와 안티패턴

## 1. REST API란?

REST(Representational State Transfer)는 웹 서비스의 아키텍처 스타일로, 2000년 로이 필딩(Roy Fielding)이 그의 박사 논문에서 처음 소개했습니다. REST API는 이 아키텍처 원칙을 따르는 API를 의미합니다.

### 핵심 특징
- 클라이언트-서버 구조
- 무상태(Stateless)
- 캐시 가능
- 계층화 시스템
- 인터페이스 일관성

## 2. REST 아키텍처의 주요 원칙

### 2.1 리소스 중심 설계
모든 것을 리소스로 표현하며, 각 리소스는 고유한 URI를 가집니다.

예시:
```
/users           # 사용자 리소스
/users/123       # ID가 123인 사용자
/users/123/posts # ID가 123인 사용자의 게시글
```

### 2.2 상태 전이
클라이언트는 하이퍼링크를 통해 애플리케이션의 상태를 전이할 수 있어야 합니다.

예시:
```json
{
  "id": 123,
  "name": "John Doe",
  "links": {
    "posts": "/users/123/posts",
    "profile": "/users/123/profile"
  }
}
```

## 3. REST API 설계 가이드라인

### 3.1 URI 설계 규칙

좋은 예시:
```
GET /articles
GET /articles/123
POST /articles
PUT /articles/123
DELETE /articles/123
```

나쁜 예시:
```
GET /getArticles
POST /createArticle
PUT /updateArticle/123
DELETE /deleteArticle/123
```

### 3.2 리소스 명명 규칙
- 명사 사용하기
- 복수형 사용하기
- 소문자 사용하기
- 하이픈(-) 사용하기 (언더스코어 대신)

## 4. HTTP 메서드와 상태 코드

### 4.1 주요 HTTP 메서드

| 메서드 | 용도 | 예시 |
|--------|------|------|
| GET | 리소스 조회 | GET /users/123 |
| POST | 리소스 생성 | POST /users |
| PUT | 리소스 전체 수정 | PUT /users/123 |
| PATCH | 리소스 부분 수정 | PATCH /users/123 |
| DELETE | 리소스 삭제 | DELETE /users/123 |

### 4.2 주요 HTTP 상태 코드

```
2xx - 성공
  200 OK: 요청 성공
  201 Created: 리소스 생성 성공
  204 No Content: 요청 성공했지만 응답 본문 없음

4xx - 클라이언트 오류
  400 Bad Request: 잘못된 요청
  401 Unauthorized: 인증 필요
  403 Forbidden: 권한 없음
  404 Not Found: 리소스 없음
  409 Conflict: 리소스 충돌

5xx - 서버 오류
  500 Internal Server Error: 서버 내부 오류
  503 Service Unavailable: 서비스 이용 불가
```

## 5. 실전 예제

### 5.1 블로그 API 예제

게시글 관리 API:

```javascript
// 게시글 목록 조회
GET /api/posts
Response 200:
{
  "posts": [
    {
      "id": 1,
      "title": "REST API 이해하기",
      "author": "김개발",
      "created_at": "2024-12-30T12:00:00Z"
    }
  ],
  "total": 1,
  "page": 1
}

// 게시글 생성
POST /api/posts
Request:
{
  "title": "새로운 게시글",
  "content": "REST API에 대해 알아봅시다.",
  "tags": ["API", "REST"]
}
Response 201:
{
  "id": 2,
  "title": "새로운 게시글",
  "created_at": "2024-12-30T12:30:00Z"
}

// 게시글 수정
PUT /api/posts/2
Request:
{
  "title": "수정된 게시글",
  "content": "내용이 수정되었습니다."
}
Response 200:
{
  "id": 2,
  "title": "수정된 게시글",
  "updated_at": "2024-12-30T12:45:00Z"
}
```

## 6. 보안과 인증

### 6.1 JWT를 이용한 인증 예제

```javascript
// 로그인 요청
POST /api/auth/login
Request:
{
  "email": "user@example.com",
  "password": "password123"
}
Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}

// 인증이 필요한 API 호출
GET /api/users/me
Headers:
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 6.2 API 키 인증 예제

```javascript
GET /api/weather?city=seoul
Headers:
{
  "X-API-Key": "your-api-key-here"
}
```

## 7. 모범 사례와 안티패턴

### 7.1 모범 사례
- 버전 관리 도입하기 (예: /api/v1/users)
- 페이지네이션 구현하기
- 적절한 에러 처리와 메시지 제공
- CORS 설정하기
- 레이트 리미팅 적용하기

### 7.2 안티패턴
- URI에 동사 사용하기
- 세션 기반의 상태 유지
- 중첩된 URI가 너무 깊어지는 것
- 응답에서 중요한 정보 노출하기

## 결론

REST API는 웹 서비스 설계의 기본이 되는 아키텍처 스타일입니다. 위에서 설명한 원칙과 가이드라인을 따르면서, 실제 서비스의 요구사항에 맞게 유연하게 적용하는 것이 중요합니다.

## 참고자료
- Roy Fielding의 REST 논문
- REST API Design Rulebook
- Microsoft REST API Guidelines
- HTTP Status Codes 공식 문서