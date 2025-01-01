---
title: "[Back-End] JPA 영속성 컨텍스트에 대하여"
author: jw1208
date: 2024-01-01 00:00:00 +0900
categories: [Back-End, Spring]
tags: [spring, spring-boot, spring-data-jpa, Back-end]
pin: false
comments: true
---

# JPA 영속성 컨텍스트에 대하여

## 들어가며
데이터베이스를 다루다 보면 반복적인 SQL 작성과 객체-관계 불일치 문제로 고민하게 됩니다. JPA(Java Persistence API)는 이러한 문제를 해결하기 위한 자바 표준 ORM입니다. 그 중심에는 '영속성 컨텍스트'라는 핵심 개념이 있습니다.

## 영속성 컨텍스트란?
영속성 컨텍스트는 "엔티티를 영구 저장하는 환경"이라는 뜻입니다. 하지만 이것만으로는 이해하기 어렵죠. 쉽게 설명하자면:

### 📱 스마트폰의 메모리 캐시와 비슷합니다
- 스마트폰에서 앱을 실행할 때, 자주 사용하는 데이터는 메모리에 임시 저장됩니다
- 마찬가지로 JPA는 데이터베이스에서 조회한 엔티티를 영속성 컨텍스트라는 메모리 공간에 캐시합니다

### 🏪 편의점 직원의 물품 관리와 비슷합니다
- 편의점 직원은 진열대(데이터베이스)의 상품을 관리하면서 메모장(영속성 컨텍스트)에 변경사항을 기록합니다
- 퇴근 전(트랜잭션 종료)에 메모장의 내용을 바탕으로 진열대를 정리합니다.

## 엔티티의 생명주기

```java
// 1. 비영속 상태 (new/transient)
Member member = new Member();
member.setId(1L);
member.setName("홍길동");

// 2. 영속 상태 (managed)
entityManager.persist(member);

// 3. 준영속 상태 (detached)
entityManager.detach(member);

// 4. 삭제 상태 (removed)
entityManager.remove(member);
```

### 각 상태 설명
1. 비영속 상태: 순수한 객체 상태, JPA와 관계 없음
2. 영속 상태: 영속성 컨텍스트에 저장된 상태
3. 준영속 상태: 영속성 컨텍스트에서 분리된 상태
4. 삭제 상태: 삭제된 상태

## persist() 메서드 상세 분석

### persist()란?
`persist()` 메서드는 엔티티를 영속성 컨텍스트에 저장하는 메서드입니다. 많은 개발자들이 이를 "데이터베이스에 저장하는 메서드"로 오해하지만, 실제로는 영속성 컨텍스트에 엔티티를 '등록'하는 메서드입니다.

### persist()의 동작 방식

```java
EntityTransaction tx = entityManager.getTransaction();
tx.begin();

// 1. 엔티티 생성 (비영속)
Member member = new Member();
member.setId(1L);
member.setName("홍길동");

// 2. 영속성 컨텍스트에 저장
entityManager.persist(member);
// 이 시점에는 DB에 저장되지 않음

// 3. 트랜잭션 커밋
tx.commit();
// 이 시점에 DB에 저장됨
```

### persist() 호출 시 발생하는 일
1. 엔티티의 매핑 정보 검증
2. 영속성 컨텍스트의 1차 캐시에 엔티티 저장
3. 쓰기 지연 SQL 저장소에 INSERT SQL 등록

### 주의사항과 팁

```java
// 🚫 잘못된 사용: persist() 후 직접 ID 설정
Member member = new Member();
entityManager.persist(member);
member.setId(2L); // 권장하지 않음

// ✅ 올바른 사용: @GeneratedValue 사용
@Entity
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // ...
}
```

### 식별자 생성 전략에 따른 persist() 동작 차이

1. IDENTITY 전략
```java
// DB에 즉시 INSERT SQL 실행 (예외적)
entityManager.persist(member);
System.out.println(member.getId()); // DB에서 생성된 ID 조회 가능
```

2. SEQUENCE 전략
```java
// 시퀀스 값만 조회 (DB INSERT는 커밋 시점)
entityManager.persist(member);
System.out.println(member.getId()); // 시퀀스에서 가져온 ID 조회 가능
```

## 영속성 컨텍스트의 이점

### 1️⃣ 1차 캐시

```java
// DB 조회 없이 영속성 컨텍스트에서 바로 조회
Member member = entityManager.find(Member.class, 1L);
// 동일한 엔티티를 조회할 때는 캐시에서 반환
Member member2 = entityManager.find(Member.class, 1L);
```

### 2️⃣ 동일성 보장

```java
Member member1 = entityManager.find(Member.class, 1L);
Member member2 = entityManager.find(Member.class, 1L);
System.out.println(member1 == member2); // true
```

### 3️⃣ 트랜잭션을 지원하는 쓰기 지연

```java
EntityTransaction transaction = entityManager.getTransaction();
transaction.begin();

entityManager.persist(memberA);
entityManager.persist(memberB);
// 여기까지는 SQL을 데이터베이스에 보내지 않음

transaction.commit(); // 이때 SQL을 데이터베이스에 보냄
```

### 4️⃣ 변경 감지 (Dirty Checking)

```java
Member member = entityManager.find(Member.class, 1L);
member.setName("변경된 이름"); // 엔티티만 변경

// 별도의 update() 메서드를 호출할 필요가 없음
transaction.commit(); // 변경사항 자동 감지 및 데이터베이스 업데이트
```

## 실무에서 주의할 점

### 1. 영속성 컨텍스트의 크기
```java
// 🚫 잘못된 사용
for (int i = 0; i < 100000; i++) {
    Member member = new Member("회원" + i);
    entityManager.persist(member);
}

// ✅ 올바른 사용
for (int i = 0; i < 100000; i++) {
    Member member = new Member("회원" + i);
    entityManager.persist(member);
    
    if (i % 1000 == 0) {
        entityManager.flush();
        entityManager.clear();
    }
}
```

### 2. N+1 문제 방지
```java
// 🚫 N+1 문제 발생
List<Team> teams = entityManager.createQuery("select t from Team t", Team.class)
    .getResultList();

// ✅ fetch join으로 해결
List<Team> teams = entityManager.createQuery(
    "select t from Team t join fetch t.members", Team.class)
    .getResultList();
```

## 마무리
영속성 컨텍스트는 JPA의 핵심 개념입니다. 마치 우리가 메모장에 할 일을 적어두고 나중에 한 번에 처리하는 것처럼, JPA는 영속성 컨텍스트를 통해 데이터베이스 작업을 효율적으로 관리합니다. 이를 잘 이해하고 활용한다면, 더 효율적이고 안정적인 애플리케이션을 개발할 수 있습니다.