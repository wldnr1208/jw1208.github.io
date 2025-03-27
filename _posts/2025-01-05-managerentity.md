---
title: "[Backend] JPA 엔티티 매니저와 영속성 컨텍스트"
author: jw1208
date: 2025-01-05
categories: [Backend, JPA, Spring]
tags: [java, spring, jpa, entity-manager, persistence-context]
pin: false
comments: true
---

## 들어가며

JPA(Java Persistence API)를 사용하다 보면 반드시 마주치게 되는 두 가지 핵심 개념이 있습니다. 바로 '엔티티 매니저(Entity Manager)'와 '영속성 컨텍스트(Persistence Context)'입니다. 이 두 개념은 JPA의 근간을 이루는 매우 중요한 요소이며, JPA를 제대로 활용하기 위해서는 이들의 동작 방식과 관계를 정확히 이해해야 합니다.

## 영속성 컨텍스트란?

영속성 컨텍스트는 "엔티티를 영구 저장하는 환경"이라는 뜻을 가지고 있습니다. 하지만 이는 단순한 데이터 저장소가 아닌, 엔티티의 생명주기를 관리하고 애플리케이션의 성능을 최적화하는 매우 스마트한 계층입니다.

### 영속성 컨텍스트의 특징

1. **1차 캐시**
   ```java
   // 1차 캐시에 저장
   Member member = new Member("John");
   em.persist(member);  // 1차 캐시에 저장됨
   
   // 1차 캐시에서 조회
   Member cachedMember = em.find(Member.class, member.getId());  // DB 조회 없이 캐시에서 반환
   ```

2. **쓰기 지연**
   ```java
   EntityTransaction transaction = em.getTransaction();
   transaction.begin();
   
   // 쓰기 지연 저장소에 SQL 저장
   Member member1 = new Member("John");
   Member member2 = new Member("Jane");
   
   em.persist(member1);  // INSERT SQL을 쓰기 지연 SQL 저장소에 저장
   em.persist(member2);  // INSERT SQL을 쓰기 지연 SQL 저장소에 저장
   
   // 이때 DB에 SQL을 보냄
   transaction.commit();
   ```

3. **변경 감지 (Dirty Checking)**
   ```java
   // 영속 엔티티 조회
   Member member = em.find(Member.class, "memberId");
   
   // 엔티티 데이터 수정
   member.setName("새로운이름");  // 엔티티만 수정
   
   // 별도의 update() 메서드 호출 필요 없음
   transaction.commit();  // 변경 감지 -> 자동으로 UPDATE SQL 생성 및 실행
   ```

## 엔티티 매니저 (Entity Manager)

엔티티 매니저는 영속성 컨텍스트를 관리하고 엔티티에 대한 데이터베이스 작업을 수행하는 인터페이스입니다.

### 엔티티 매니저의 주요 메서드

```java
public class EntityManagerExample {
    
    @PersistenceContext
    private EntityManager em;
    
    public void example() {
        // 엔티티 저장
        Member member = new Member("John");
        em.persist(member);
        
        // 엔티티 조회
        Member foundMember = em.find(Member.class, 1L);
        
        // 엔티티 수정 (변경 감지 사용)
        foundMember.setName("Jane");
        
        // 엔티티 삭제
        em.remove(foundMember);
        
        // JPQL 쿼리 실행
        List<Member> members = em.createQuery("select m from Member m", Member.class)
                               .getResultList();
    }
}
```

## 엔티티의 생명주기

엔티티는 네 가지 상태를 가질 수 있으며, 엔티티 매니저를 통해 이 상태들을 전환할 수 있습니다.

### 1. 비영속 (New/Transient)
```java
// 객체를 생성만 한 상태 (영속성 컨텍스트와 관련 없음)
Member member = new Member();
member.setId(1L);
member.setName("회원1");
```

### 2. 영속 (Managed)
```java
// 객체를 저장한 상태 (영속성 컨텍스트가 관리)
em.persist(member);

// 또는 조회한 상태
Member member = em.find(Member.class, 1L);
```

### 3. 준영속 (Detached)
```java
// 영속성 컨텍스트에서 분리
em.detach(member);

// 영속성 컨텍스트 초기화
em.clear();

// 영속성 컨텍스트 종료
em.close();
```

### 4. 삭제 (Removed)
```java
// 객체를 삭제한 상태
em.remove(member);
```

## 실전 예제: 주문 시스템

실제 애플리케이션에서 엔티티 매니저와 영속성 컨텍스트가 어떻게 활용되는지 살펴보겠습니다.

```java
@Service
@Transactional
public class OrderService {
    
    @PersistenceContext
    private EntityManager em;
    
    public Order createOrder(Long memberId, Long itemId, int count) {
        // 엔티티 조회
        Member member = em.find(Member.class, memberId);
        Item item = em.find(Item.class, itemId);
        
        // 주문 생성
        Order order = new Order(member, item, count);
        em.persist(order);  // 영속화
        
        // 재고 감소 (변경 감지 활용)
        item.removeStock(count);
        
        return order;
    }
    
    public void cancelOrder(Long orderId) {
        // 주문 조회
        Order order = em.find(Order.class, orderId);
        
        // 주문 취소
        order.cancel();  // 변경 감지 동작
    }
}
```

## 성능 최적화 팁

1. **벌크 연산 활용**
   ```java
   // 재고가 10개 미만인 모든 상품의 가격을 10% 인상
   int updatedCount = em.createQuery(
       "update Item i set i.price = i.price * 1.1 where i.stockQuantity < 10")
       .executeUpdate();
   ```

2. **페이징 처리**
   ```java
   List<Member> members = em.createQuery("select m from Member m", Member.class)
       .setFirstResult(0)    // 시작 위치
       .setMaxResults(10)    // 가져올 데이터 수
       .getResultList();
   ```

## 주의사항

1. **변경 감지는 영속 상태의 엔티티에만 적용됩니다.**
2. **준영속 상태의 엔티티는 변경 감지가 동작하지 않습니다.**
3. **영속성 컨텍스트의 1차 캐시는 트랜잭션 범위 내에서만 유효합니다.**

## 마치며

JPA의 엔티티 매니저와 영속성 컨텍스트는 복잡해 보이지만, 이들을 제대로 이해하고 활용하면 데이터베이스 작업을 매우 효율적으로 처리할 수 있습니다. 특히 변경 감지와 1차 캐시 같은 기능은 애플리케이션의 성능을 크게 향상시킬 수 있습니다.

더 나아가 학습하고 싶다면 다음 주제들을 추천드립니다:
- JPQL과 Criteria API
- 엔티티 매핑 전략
- JPA 성능 최적화
- 스프링 데이터 JPA

## 참고 자료
- Hibernate 공식 문서
- 자바 ORM 표준 JPA 프로그래밍 (김영한 저)
- Spring Data JPA 레퍼런스