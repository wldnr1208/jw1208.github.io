---
title: "[Front-End] Error Boundary에 대하여"
author: jw1208
date: 2025-01-10
categories: [Front-End, React, Error]
tags: [Front-End, React, Error]
image:
  path: /assets/img/posts/error.png
  alt: React Error Boundary
pin: false
comments: true
---

# Error Boundary - React의 신뢰성을 위한 보호막

## 들어가며

React 애플리케이션을 개발하다 보면 반드시 마주치게 되는 두 가지 중요한 문제가 있습니다. 바로 '예상치 못한 오류'와 '사용자 경험의 유지'입니다. 이 두 문제를 효과적으로 다루기 위해 React는 Error Boundary라는 핵심 메커니즘을 제공합니다. Error Boundary는 React 애플리케이션의 신뢰성을 크게 향상시키는 매우 중요한 요소이며, React를 제대로 활용하기 위해서는 Error Boundary의 동작 방식과 활용법을 정확히 이해해야 합니다.

## Error Boundary란?

Error Boundary는 "React 컴포넌트 트리에서 발생하는 자바스크립트 오류를 포착하고 처리하는 특수한 컴포넌트"입니다. 하지만 이는 단순한 오류 처리 장치가 아닌, 애플리케이션의 안정성을 보장하고 사용자 경험을 최적화하는 매우 스마트한 방어 계층입니다.

### Error Boundary의 특징

1. **오류 격리**
   ```jsx
   // Error Boundary 컴포넌트 정의
   class ErrorBoundary extends React.Component {
     constructor(props) {
       super(props);
       this.state = { hasError: false };
     }
     
     static getDerivedStateFromError(error) {
       // 오류 발생 시 상태 업데이트
       return { hasError: true };
     }
     
     componentDidCatch(error, errorInfo) {
       // 오류 로깅
       console.error("Error caught by boundary:", error, errorInfo);
     }
     
     render() {
       if (this.state.hasError) {
         // 대체 UI 표시
         return <h1>Something went wrong.</h1>;
       }
       
       return this.props.children;
     }
   }
   ```

2. **폴백 UI 제공**
   ```jsx
   // 실제 사용 예시
   <ErrorBoundary>
     <UserProfile userId={userId} />
   </ErrorBoundary>
   ```

3. **계층적 오류 처리**
   ```jsx
   // 중첩된 Error Boundary
   <ErrorBoundary fallback={<AppErrorUI />}>
     <Header />
     <ErrorBoundary fallback={<ContentErrorUI />}>
       <MainContent />
     </ErrorBoundary>
     <Footer />
   </ErrorBoundary>
   ```

## Error Boundary의 동작 원리

Error Boundary는 클래스 컴포넌트를 기반으로 하며, 두 가지 특별한 라이프사이클 메서드를 구현해야 합니다.

### 핵심 라이프사이클 메서드

```jsx
class ErrorBoundary extends React.Component {
  // 오류 발생 시 폴백 UI를 위한 상태 반환
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  // 오류 로깅, 분석 등을 위한 메서드
  componentDidCatch(error, errorInfo) {
    // 로깅 서비스에 오류 정보 전송
    logErrorToService(error, errorInfo);
  }
}
```

## 실전 Error Boundary

실제 애플리케이션에서 Error Boundary가 어떻게 활용되는지 살펴보겠습니다.

```jsx
// 재사용 가능한 Error Boundary 컴포넌트
class ProductErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  componentDidCatch(error, info) {
    // 분석 서비스에 오류 전송
    analyticsService.trackError(error, info);
  }
  
  resetError = () => {
    this.setState({ hasError: false });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h2>상품 정보를 불러올 수 없습니다</h2>
          <p>잠시 후 다시 시도해주세요</p>
          <button onClick={this.resetError}>다시 시도</button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// 사용 예시
function ProductPage() {
  return (
    <div>
      <Header />
      <ProductErrorBoundary>
        <ProductDetails id="123" />
      </ProductErrorBoundary>
      <RelatedProducts />
      <Footer />
    </div>
  );
}
```

## Error Boundary 활용 패턴

1. **기능별 Error Boundary**
   ```jsx
   // 결제 프로세스에 특화된 Error Boundary
   <PaymentErrorBoundary>
     <CheckoutProcess />
   </PaymentErrorBoundary>
   ```

2. **라우트별 Error Boundary**
   ```jsx
   // 각 페이지마다 독립적인 Error Boundary
   <Route path="/products">
     <ErrorBoundary>
       <ProductsPage />
     </ErrorBoundary>
   </Route>
   ```

3. **비동기 데이터 로딩을 위한 Error Boundary**
   ```jsx
   // 데이터 페칭 에러를 처리하는 Error Boundary
   <DataErrorBoundary>
     <SuspenseComponent>
       <ProductData />
     </SuspenseComponent>
   </DataErrorBoundary>
   ```

## Error Boundary의 한계

1. **이벤트 핸들러 오류를 감지하지 않습니다.**
   ```jsx
   // Error Boundary로 감지되지 않음
   function handleClick() {
     try {
       // 오류가 발생할 수 있는 코드
       processData();
     } catch (error) {
       // 직접 오류 처리 필요
       handleError(error);
     }
   }
   ```

2. **비동기 코드의 오류를 자동으로 감지하지 않습니다.**
   ```jsx
   // Error Boundary로 감지되지 않음
   useEffect(() => {
     async function fetchData() {
       try {
         // 비동기 작업
         const data = await fetchUserData();
       } catch (error) {
         // 직접 오류 처리 필요
         setError(error);
       }
     }
     fetchData();
   }, []);
   ```

## 함수형 컴포넌트에서의 Error Boundary

React 16.8 이후에도 Error Boundary는 클래스 컴포넌트로만 구현해야 합니다. 그러나 커스텀 훅을 통해 재사용 가능한 방식으로 활용할 수 있습니다.

```jsx
// react-error-boundary 라이브러리 활용
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function MyComponent() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // 오류 복구 로직
      }}
    >
      <ComponentThatMayError />
    </ErrorBoundary>
  );
}
```

## 마치며

React의 Error Boundary는 복잡해 보이지만, 이를 제대로 이해하고 활용하면 애플리케이션의 오류 처리를 매우 효율적으로 구현할 수 있습니다. 특히 선언적인 오류 처리와 컴포넌트 격리 같은 기능은 애플리케이션의 신뢰성을 크게 향상시킬 수 있습니다.

더 나아가 학습하고 싶다면 다음 주제들을 추천드립니다:
- React Suspense와 Error Boundary 통합
- 서버 컴포넌트에서의 오류 처리
- 테스트 환경에서 Error Boundary 활용
- 커스텀 Error Boundary 라이브러리 개발