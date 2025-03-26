---
title: "[Back-End] 소프트 딜리트 vs 캐스케이드 딜리트: 데이터 삭제 전략 비교"
author: jw1208
date: 2024-12-19 14:00:00 +0900
categories: [Database, Architecture]
tags: [soft-delete, cascade-delete, database-design, jpa, spring-boot, Back-end]
image:
  path: /assets/img/posts/delete-strategy.PNG  # baseurl 제거하고 순수 asset 경로만 사용
  alt: Different database deletion strategies illustration
pin: false
comments: true    # 이 부분 추가
---

# 들어가며

데이터베이스 설계에서 가장 중요한 결정 중 하나는 데이터 삭제 전략을 선택하는 것입니다. 특히 사용자 데이터를 다룰 때는 더욱 신중한 접근이 필요합니다. 이번 포스트에서는 두 가지 주요 삭제 전략인 소프트 딜리트(Soft Delete)와 캐스케이드 딜리트(Cascade Delete)를 비교하고, 제가 최근 프로젝트에서 소프트 딜리트를 선택한 이유를 공유하고자 합니다.

## 소프트 딜리트(Soft Delete)란?

소프트 딜리트는 데이터를 실제로 삭제하지 않고, 삭제 표시만 하는 방식입니다. 보통 `is_deleted` 또는 `deleted_at` 같은 컬럼을 추가하여 구현합니다.

### 구현 예시

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    private String email;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    public boolean isDeleted() {
        return deletedAt != null;
    }
    
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}
```

## 캐스케이드 딜리트(Cascade Delete)란?

캐스케이드 딜리트는 부모 레코드가 삭제될 때 연관된 자식 레코드들도 함께 삭제되는 방식입니다.

### 구현 예시

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String username;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List posts = new ArrayList<>();
}

@Entity
@Table(name = "user_posts")
public class UserPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String content;
}
```

## 각 전략의 장단점

### 소프트 딜리트의 장점
1. **데이터 복구 가능**
   - 실수로 삭제된 데이터를 쉽게 복구할 수 있습니다.
   - 사용자가 계정을 재활성화하고 싶을 때 용이합니다.

2. **데이터 분석과 감사**
   - 삭제된 데이터도 분석에 포함시킬 수 있습니다.
   - 규제 준수를 위한 감사 추적이 가능합니다.

3. **참조 무결성 유지**
   - 관련 데이터의 참조 관계가 유지됩니다.
   - 데이터 일관성을 보장합니다.

### 소프트 딜리트의 단점
1. **데이터베이스 크기 증가**
   - 삭제된 데이터도 저장 공간을 차지합니다.
   - 백업 크기가 커질 수 있습니다.

2. **쿼리 복잡성 증가**
   - 항상 삭제 여부를 확인해야 합니다.
   - 인덱스 효율이 저하될 수 있습니다.

### 캐스케이드 딜리트의 장점
1. **데이터 일관성**
   - 참조 무결성이 자동으로 유지됩니다.
   - 고아 데이터가 발생하지 않습니다.

2. **성능 최적화**
   - 저장 공간을 효율적으로 사용합니다.
   - 쿼리가 단순합니다.

### 캐스케이드 딜리트의 단점
1. **데이터 복구 불가능**
   - 실수로 삭제한 경우 복구가 어렵습니다.
   - 백업에서 복구해야 합니다.

2. **의도치 않은 데이터 손실**
   - 연관된 모든 데이터가 함께 삭제됩니다.
   - 실수로 중요한 데이터를 잃을 수 있습니다.

## 내가 소프트 딜리트를 선택한 이유

최근 프로젝트에서 저는 사용자 데이터 삭제 전략으로 소프트 딜리트를 선택했습니다. 주요 이유는 다음과 같습니다:

1. **사용자 경험**
   - 사용자가 실수로 계정을 삭제하더라도 복구가 가능합니다.
   - "계정 휴면" 기능을 쉽게 구현할 수 있습니다.

2. **법적 요구사항**
   - GDPR과 같은 개인정보보호 규정을 준수해야 합니다.
   - 데이터 보존 기간을 유연하게 관리할 수 있습니다.

3. **데이터 분석**
   - 사용자 이탈 패턴을 분석할 수 있습니다.
   - 서비스 개선을 위한 인사이트를 얻을 수 있습니다.

## 구현 시 고려사항

소프트 딜리트를 구현할 때 다음 사항들을 고려했습니다:

```java
@Where(clause = "deleted_at IS NULL")
@SQLDelete(sql = "UPDATE users SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL")
@Entity
@Table(name = "users")
public class User {
    // ... 기존 필드들
    
    @PreRemove
    private void preRemove() {
        if (this.deletedAt != null) {
            throw new IllegalStateException("이미 삭제된 사용자입니다.");
        }
    }
}
```

1. **성능 최적화**
   - 삭제된 데이터를 주기적으로 아카이빙
   - 적절한 인덱스 설정

2. **보안 고려사항**
   - 삭제된 데이터에 대한 접근 제어
   - 개인정보 보호를 위한 암호화

## 결론

데이터 삭제 전략은 프로젝트의 요구사항과 특성에 따라 신중히 선택해야 합니다. 제 경우에는 사용자 데이터의 특성과 법적 요구사항을 고려하여 소프트 딜리트를 선택했습니다. 

하지만 모든 상황에서 소프트 딜리트가 최선은 아닙니다. 임시 데이터나 로그 데이터의 경우 캐스케이드 딜리트가 더 적합할 수 있습니다. 중요한 것은 프로젝트의 맥락을 이해하고, 각 전략의 장단점을 잘 파악하여 적절한 선택을 하는 것입니다.

## 참고자료
- [JPA Entity Lifecycle Events](https://docs.jboss.org/hibernate/orm/5.4/userguide/html_single/Hibernate_User_Guide.html#events)
- [Hibernate @SQLDelete](https://docs.jboss.org/hibernate/orm/5.4/javadocs/org/hibernate/annotations/SQLDelete.html)
- [GDPR Article 17 - Right to erasure](https://gdpr-info.eu/art-17-gdpr/)
