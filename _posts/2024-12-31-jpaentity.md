---
title: "[Backend] Spring Data JPA에서 새로운 Entity 판단하기"
author: jw1208
date: 2024-12-31
categories: [Backend, Spring]
tags: [spring-data-jpa, entity, persistence, back-end, spring-boot]
image:
  path: /assets/img/posts/jpaentity.PNG
  alt: Different database deletion strategies illustration
pin: false
comments: true
---

## 들어가며

Spring Data JPA를 사용하다 보면 `save()` 메서드 하나로 새로운 엔티티의 저장과 기존 엔티티의 수정을 모두 처리할 수 있어 편리합니다. 하지만 이 과정에서 Spring Data JPA는 어떻게 새로운 엔티티인지 아닌지를 판단할까요? 이번 글에서는 이 판단 과정을 상세히 살펴보고, 실제 개발 시 주의해야 할 점들을 알아보겠습니다.

## 새로운 Entity 판단의 기본 원리

### 1. @Version 기반 판단

Spring Data JPA는 먼저 엔티티에 `@Version` 애노테이션이 있는지 확인합니다:

```java
@Entity
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Version
    private Long version;
    
    private String name;
    private int price;
}
```

이런 경우 판단 로직은 다음과 같이 동작합니다:

```java
@Override
public boolean isNew(T entity) {
    if(versionAttribute.isEmpty() 
       || versionAttribute.map(Attribute::getJavaType)
                         .map(Class::isPrimitive)
                         .orElse(false)) {
        return super.isNew(entity);
    }

    BeanWrapper wrapper = new DirectFieldAccessFallbackBeanWrapper(entity);
    return versionAttribute.map(it -> wrapper.getPropertyValue(it.getName()) == null)
                          .orElse(true);
}
```

- Wrapper 클래스(Long, Integer 등)인 경우: null이면 새로운 엔티티로 판단
- Primitive 타입(long, int 등)인 경우: 상위 클래스의 판단 로직 사용

### 2. @Id 기반 판단

`@Version`이 없거나 primitive 타입인 경우, `@Id` 필드를 기준으로 판단합니다:

```java
public boolean isNew(T entity) {
    Id id = getId(entity);
    Class<ID> idType = getIdType();

    if (!idType.isPrimitive()) {
        return id == null;  // null이면 새로운 엔티티
    }

    if (id instanceof Number) {
        return ((Number) id).longValue() == 0L;  // 0이면 새로운 엔티티
    }

    throw new IllegalArgumentException(
        String.format("Unsupported primitive id type %s", idType)
    );
}
```

## 실제 사용 예시와 주의점

### 1. @GeneratedValue 사용 시

```java
@Entity
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    
    // 생성자, getter, setter 생략
}
```

```java
@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    
    public User createUser(String name) {
        User user = new User();
        user.setName(name);
        return userRepository.save(user);  // id가 null이므로 persist 실행
    }
    
    public User updateUser(Long id, String name) {
        User user = userRepository.findById(id).orElseThrow();
        user.setName(name);
        return userRepository.save(user);  // id가 존재하므로 merge 실행
    }
}
```

### 2. ID 직접 할당 시의 문제점

```java
@Entity
public class Document {
    @Id  // @GeneratedValue 사용하지 않음
    private String documentId;  // 업무 규칙에 따라 직접 ID 생성
    private String content;
}
```

```java
@Service
public class DocumentService {
    public Document createDocument(String documentId, String content) {
        Document doc = new Document();
        doc.setDocumentId(documentId);
        doc.setContent(content);
        
        // 문제 발생! ID가 이미 존재하므로 merge가 실행됨
        // 불필요한 select 쿼리가 발생
        return documentRepository.save(doc);
    }
}
```

### 3. Persistable 인터페이스를 통한 해결

```java
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Document implements Persistable<String> {
    @Id
    private String documentId;
    private String content;
    
    @CreatedDate
    private LocalDateTime createdDate;
    
    @Override
    public String getId() {
        return documentId;
    }
    
    @Override
    public boolean isNew() {
        // createdDate가 null이면 새로운 엔티티로 판단
        return createdDate == null;
    }
}
```

```java
@Configuration
@EnableJpaAuditing
public class JpaConfig {
    // JPA Auditing 활성화
}
```

## 실제 동작 과정 살펴보기

SimpleJpaRepository의 save() 메서드에서 isNew() 판단에 따라 다음과 같이 동작합니다:

```java
@Override
@Transactional
public <S extends T> S save(S entity) {
    Assert.notNull(entity, "Entity must not be null");

    if (entityInformation.isNew(entity)) {
        entityManager.persist(entity);
        return entity;
    } else {
        return entityManager.merge(entity);
    }
}
```

### persist vs merge 동작 차이

1. persist 동작:
   ```sql
   insert into document (document_id, content) values (?, ?)
   ```

2. merge 동작:
   ```sql
   -- 먼저 select 쿼리 실행
   select d.* from document d where d.document_id = ?
   -- 이후 insert 또는 update 실행
   insert into document (document_id, content) values (?, ?)
   ```

## 성능 비교

예를 들어 1000개의 새로운 문서를 저장하는 경우:

1. 일반적인 방식:
   - 1000번의 select 쿼리
   - 1000번의 insert 쿼리
   - 총 2000번의 데이터베이스 작업

2. Persistable 구현 시:
   - 1000번의 insert 쿼리만 실행
   - 50% 성능 향상

## 실무 적용 가이드

1. `@GeneratedValue`를 사용하는 경우:
   - 기본 동작을 그대로 사용

2. ID를 직접 할당하는 경우:
   - `Persistable` 인터페이스 구현
   - `@CreatedDate`와 같은 감사(Auditing) 필드 활용
   - 별도의 필드로 신규 여부 관리

3. 복합키(IdClass, EmbeddedId)를 사용하는 경우:
   - 반드시 `Persistable` 구현 검토

## 결론

Spring Data JPA의 새로운 엔티티 판단 로직은 기본적으로 잘 동작하지만, ID를 직접 할당하는 경우에는 주의가 필요합니다. `Persistable` 인터페이스를 구현하여 명시적으로 새로운 엔티티임을 알려주면, 불필요한 데이터베이스 조회를 방지하고 애플리케이션의 성능을 크게 향상시킬 수 있습니다.

## 참고문헌

- [Spring Data JPA 공식 문서](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [Hibernate ORM 문서](https://hibernate.org/orm/documentation/5.4/)

이 글이 Spring Data JPA를 사용하면서 겪을 수 있는 성능 문제를 해결하는 데 도움이 되길 바랍니다.