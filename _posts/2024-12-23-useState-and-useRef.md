---
title: "[Front-end] useRef vs useState: 상태 관리의 두 주역 비교"
author: jw1208
date: 2024-12-23 00:00:00 +0900
categories: [Web Development, React]
tags: [react, hooks, useRef, useState, Front-end]
image:
  path: /assets/img/posts/useRef.PNG
  alt: React Hooks Comparison
pin: false
comments: true
---

# 들어가며

React에서 상태 관리는 마치 레스토랑 주방을 운영하는 것과 비슷합니다. useState는 주방의 전광판(메뉴판)이고, useRef는 주방장의 개인 메모장이라고 생각해볼 수 있습니다. 오늘은 이 두 가지 도구의 특징과 차이점, 그리고 각각 언제 사용하면 좋은지 자세히 알아보겠습니다.

## useState와 useRef의 핵심 차이

### 1. 작동 방식의 차이

useState와 useRef의 가장 큰 차이는 마치 전광판과 메모장의 차이와 같습니다.

```tsx
// useState는 전광판과 같습니다
function MenuBoard() {
  const [menuOfDay, setMenuOfDay] = useState("파스타");
  
  const updateMenu = () => {
    setMenuOfDay("피자");  // 전광판이 바뀌면 모든 직원(컴포넌트)이 알게 됩니다
  };

  return <div>{menuOfDay}</div>;  // 변경사항이 즉시 화면에 반영됩니다
}

// useRef는 메모장과 같습니다
function ChefNote() {
  const recipeNote = useRef("파스타 레시피");
  
  const updateRecipe = () => {
    recipeNote.current = "피자 레시피";  // 메모만 수정되고, 다른 사람은 모릅니다
  };

  return <div>{recipeNote.current}</div>;  // 화면은 자동으로 갱신되지 않습니다
}
```

### 2. 리렌더링의 차이

useState와 useRef의 리렌더링 차이를 실생활에 비유해보면 이해가 쉽습니다.

```tsx
// useState는 TV 채널 변경과 같습니다
function TelevisionChannel() {
  const [channel, setChannel] = useState(7);
  
  return (
    <div>
      <p>현재 채널: {channel}</p>
      <button onClick={() => setChannel(channel + 1)}>
        다음 채널
      </button>
    </div>
  );
}

// useRef는 일기장 쓰기와 같습니다
function DiaryEntry() {
  const diaryContent = useRef("오늘의 일기...");
  
  const updateDiary = () => {
    diaryContent.current += " 추가 내용";  
    // 일기는 써지지만, 보여주려면 추가 작업 필요
  };
}
```

## 실제 사용 사례

### 1. 폼 입력 관리

카페에서 주문을 받는 상황으로 비유해보겠습니다.

```tsx
// useState를 사용한 실시간 주문 현황판
function OrderSystem() {
  const [orderInput, setOrderInput] = useState("");
  const [orders, setOrders] = useState([]);

  const handleOrder = (e) => {
    setOrderInput(e.target.value);  // 주문이 들어올 때마다 현황판 업데이트
  };

  return (
    <div>
      <input value={orderInput} onChange={handleOrder} />
      <div>현재 주문: {orderInput}</div>
    </div>
  );
}

// useRef를 사용한 주문 메모
function OrderNotes() {
  const orderNotes = useRef("");
  
  const updateNotes = (e) => {
    orderNotes.current = e.target.value;  // 메모만 수정, 화면 갱신 없음
  };

  return <input onChange={updateNotes} />;
}
```

### 2. 타이머 구현

운동 타이머를 예로 들어보겠습니다.

```tsx
function WorkoutTimer() {
  const [time, setTime] = useState(0);  // 화면에 표시될 시간
  const timerRef = useRef(null);        // 타이머 ID 보관용 메모장
  
  const startTimer = () => {
    if (timerRef.current) return;  // 이미 실행 중이면 중복 실행 방지
    
    timerRef.current = setInterval(() => {
      setTime(prev => prev + 1);  // 매초마다 시간 업데이트
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // 컴포넌트 정리 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div>
      <p>운동 시간: {time}초</p>
      <button onClick={startTimer}>시작</button>
      <button onClick={stopTimer}>정지</button>
    </div>
  );
}
```

### 3. DOM 요소 접근

도서관의 책 관리 시스템으로 비유해보겠습니다.

```tsx
function Library() {
  const [selectedBook, setSelectedBook] = useState(null);
  const bookshelfRef = useRef(null);  // 실제 책장(DOM) 참조

  const scrollToBook = (bookId) => {
    setSelectedBook(bookId);  // 선택된 책 정보 업데이트 (화면 갱신)
    
    // 책장에서 해당 책의 위치로 스크롤
    const bookElement = bookshelfRef.current.querySelector(`#book-${bookId}`);
    bookElement?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div ref={bookshelfRef} className="bookshelf">
      {/* 책 목록 렌더링 */}
    </div>
  );
}
```

## 언제 무엇을 사용해야 할까?

### useState를 사용해야 할 때

1. **실시간 UI 업데이트가 필요할 때**
   - 주문 현황판
   - 장바구니 내역
   - 실시간 검색어 표시

2. **사용자 입력에 즉각적인 반응이 필요할 때**
   - 폼 입력값
   - 체크박스 상태
   - 선택된 항목 표시

### useRef를 사용해야 할 때

1. **렌더링과 무관한 값을 저장할 때**
   - 타이머 ID
   - 이전 상태값 기억
   - 외부 라이브러리 인스턴스

2. **DOM 요소에 직접 접근해야 할 때**
   - 스크롤 위치 조정
   - 입력 필드 포커스
   - 캔버스 조작

## 성능 고려사항

### useState 사용 시 주의점

```tsx
// 🚫 잘못된 사용
function BadCounter() {
  const [count, setCount] = useState(0);
  
  // 불필요한 리렌더링 발생
  useEffect(() => {
    setCount(count + 1);
  }); 
}

// ✅ 올바른 사용
function GoodCounter() {
  const [count, setCount] = useState(0);
  
  // 필요할 때만 업데이트
  const increment = () => {
    setCount(prev => prev + 1);
  };
}
```

### useRef 사용 시 주의점

```tsx
// 🚫 잘못된 사용
function BadComponent() {
  const valueRef = useRef(0);
  
  return (
    <div>
      {valueRef.current} {/* 값이 변경되어도 화면 갱신되지 않음 */}
    </div>
  );
}

// ✅ 올바른 사용
function GoodComponent() {
  const valueRef = useRef(0);
  const [, forceUpdate] = useState({});
  
  const updateAndShow = () => {
    valueRef.current += 1;
    forceUpdate({}); // 필요할 때만 수동으로 리렌더링
  };
}
```

## 결론

useState와 useRef는 각각의 장단점이 있는 React의 강력한 도구입니다. useState는 실시간으로 변경사항을 화면에 반영해야 할 때 사용하고, useRef는 렌더링과 무관하게 값을 저장하거나 DOM을 직접 조작해야 할 때 사용합니다.

레스토랑으로 비유하자면, useState는 손님들이 볼 수 있는 메뉴판이고, useRef는 주방장의 개인 레시피 노트입니다. 각각의 도구를 상황에 맞게 적절히 사용하면 더 효율적이고 성능 좋은 React 애플리케이션을 만들 수 있습니다.

## 참고자료

- [React 공식 문서 - useState](https://react.dev/reference/react/useState)
- [React 공식 문서 - useRef](https://react.dev/reference/react/useRef)
- [React Hooks 가이드](https://react.dev/learn/hooks-overview)