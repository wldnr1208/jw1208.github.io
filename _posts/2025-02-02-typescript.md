---
title: "[Frontend] TypeScript infer 키워드와 조건부 타입 이해하기"
author: jw1208
date: 2025-02-02
categories: [Frontend, TypeScript]
tags: [Frontend, TypeScript, infer]
pin: false
comments: true
---

# TypeScript의 `infer` 키워드란?

`infer`는 TypeScript에서 **조건부 타입(Conditional Types)**과 함께 사용되어,  
특정 타입 내부에서 **부분 타입을 추론(infer)**할 수 있게 해주는 키워드입니다.
예를 들어 함수 타입이 주어졌을 때, `infer`를 사용하면 그 **반환 타입만 뽑아내는** 유틸리티 타입을 만들 수 있습니다.

## 목차
1. infer의 기본 개념  
2. infer 사용 예시  
3. extends와의 관계  
4. 다양한 infer 예시  
5. 정리  
6. 참고 자료  

## 1. infer의 기본 개념

`infer`는 **조건부 타입 내부에서만** 사용할 수 있습니다.  
독립적으로 사용하면 오류가 발생합니다.

```typescript
type ExtractReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
// T가 함수 타입이면, 해당 함수의 반환 타입을 R로 추론합니다.
// 조건이 만족되지 않으면 never을 반환합니다.
```

## 2. infer 사용 예시

### ✅ 함수 반환 타입 추출
```typescript
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = GetReturnType<() => string>;     // string
type B = GetReturnType<() => number[]>;   // number[]
type C = GetReturnType<string>;           // never
```

### ✅ 배열의 요소 타입 추출
```typescript
type ElementType<T> = T extends (infer U)[] ? U : T;

type D = ElementType<number[]>;     // number
type E = ElementType<string[]>;     // string
type F = ElementType<boolean>;      // boolean
```

## 3. extends와의 관계

`extends`는 `infer`와 자주 함께 쓰이며, 두 가지 역할을 합니다:

1. 제네릭 제한 (Generic Constraint)
```typescript
type OnlyString<T extends string> = T;

type G = OnlyString<'hello'>; // 'hello'
// type H = OnlyString<42>; // ❌ Error: number는 string을 확장하지 않음
```

2. 조건부 타입 검사
```typescript
type TypeCheck<T> = T extends string ? '문자열' : '다른 타입';

type I = TypeCheck<'typescript'>; // '문자열'
type J = TypeCheck<123>;          // '다른 타입'
```

## 4. 다양한 infer 예시

### ✅ Promise의 결과 타입 추출
```typescript
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type K = UnwrapPromise<Promise<number>>;  // number
type L = UnwrapPromise<string>;           // string
```

### ✅ 튜플의 첫 번째 요소 타입 추출
```typescript
type First<T> = T extends [infer F, ...any[]] ? F : never;

type M = First<[number, string, boolean]>;  // number
type N = First<[]>;                         // never
```

### ✅ 함수 인자 타입 추출
```typescript
type FirstArg<T> = T extends (arg: infer A) => any ? A : never;

type O = FirstArg<(id: number) => void>;  // number
type P = FirstArg<() => void>;            // never
```

## 5. 정리

| 키워드 | 역할 | 사용 위치 |
|--------|------|-----------|
| infer | 타입 추론 | 조건부 타입 내부에서만 사용 가능 |
| extends | 타입 제한 / 조건 체크 | 제네릭 정의 또는 조건부 타입에서 사용 |

`infer`는 복잡한 타입 구조에서 필요한 타입만 추출할 때 유용합니다.
조건부 타입과 조합하면 강력한 유틸리티 타입을 만들 수 있습니다.
단, `infer`는 조건부 타입 내부에서만 사용 가능하다는 점을 꼭 기억하세요.

## 6. 참고 자료
- 📘 [TypeScript Handbook - Conditional Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#conditional-types)
- 🧠 [NAVER D2 - infer, never만 보면 두려워지는 당신을 위한 고급 TypeScript](https://d2.naver.com/helloworld/4797313)
- 📗 [타입스크립트 핸드북 (한글)](https://typescript-kr.github.io/)

**`infer`를 자유자재로 다룰 수 있게 되면, TypeScript에서 더 강력한 타입 추상화와 안정성 확보가 가능합니다.
실무 코드에 적용하면서 점점 익숙해져 보세요! 😊**