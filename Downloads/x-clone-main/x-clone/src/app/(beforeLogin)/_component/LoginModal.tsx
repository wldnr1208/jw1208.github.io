"use client";

import style from "@/app/(beforeLogin)/_component/login.module.css";
import { ChangeEventHandler, FormEventHandler, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    email: string;
    displayName: string;
    token: string;
  };
}

export default function LoginModal() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const loginMutation = useMutation<
    LoginResponse,
    Error,
    { email: string; password: string }
  >({
    mutationFn: async (data) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new Error("비밀번호가 일치하지 않습니다.");
          case 404:
            throw new Error("존재하지 않는 이메일입니다.");
          default:
            throw new Error("로그인 중 오류가 발생했습니다.");
        }
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || "로그인에 실패했습니다.");
      }
      return result;
    },
    onSuccess: (response) => {
      // 토큰 저장 등 필요한 처리
      if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
      }
      router.refresh();
      router.replace("/home");
    },
    onError: (error) => {
      setMessage(error.message);
      console.error("로그인 에러:", error);
    },
  });

  const onSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setMessage("");
    if (!email || !password) {
      setMessage("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const onClickClose = () => {
    router.back();
  };

  const onChangeEmail: ChangeEventHandler<HTMLInputElement> = (e) => {
    setEmail(e.target.value);
  };

  const onChangePassword: ChangeEventHandler<HTMLInputElement> = (e) => {
    setPassword(e.target.value);
  };

  return (
    <div className={style.modalBackground}>
      <div className={style.modal}>
        <div className={style.modalHeader}>
          <button className={style.closeButton} onClick={onClickClose}>
            <svg
              width={24}
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="r-18jsvk2 r-4qtqp9 r-yyyyoo r-z80fyv r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-19wmn03"
            >
              <g>
                <path d="M10.59 12L4.54 5.96l1.42-1.42L12 10.59l6.04-6.05 1.42 1.42L13.41 12l6.05 6.04-1.42 1.42L12 13.41l-6.04 6.05-1.42-1.42L10.59 12z"></path>
              </g>
            </svg>
          </button>
          <div>로그인하세요.</div>
        </div>
        <form onSubmit={onSubmit}>
          <div className={style.modalBody}>
            <div className={style.inputDiv}>
              <label className={style.inputLabel} htmlFor="email">
                이메일
              </label>
              <input
                id="email"
                className={style.input}
                value={email}
                onChange={onChangeEmail}
                type="email"
                placeholder=""
                disabled={loginMutation.isPending}
              />
            </div>
            <div className={style.inputDiv}>
              <label className={style.inputLabel} htmlFor="password">
                비밀번호
              </label>
              <input
                id="password"
                className={style.input}
                value={password}
                onChange={onChangePassword}
                type="password"
                placeholder=""
                disabled={loginMutation.isPending}
              />
            </div>
          </div>
          <div className={style.message}>{message}</div>
          <div className={style.modalFooter}>
            <button
              className={style.actionButton}
              disabled={!email || !password || loginMutation.isPending}
            >
              {loginMutation.isPending ? "로그인 중..." : "로그인하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
