"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import style from "./signup.module.css";
import BackButton from "./BackButton";

interface SignupState {
  username: string;
  email: string;
  password: string;
  bio: string;
  birthDate: string;
}

export default function SignupModal() {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupState>({
    username: "",
    email: "",
    password: "",
    bio: "",
    birthDate: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formatBirthDate = (date: string) => {
      if (date.length === 8) {
        return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
      }
      return date;
    };

    try {
      const formattedData = {
        ...formData,
        birthDate: formatBirthDate(formData.birthDate),
      };

      console.log("Sending data:", formattedData);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "서버 오류가 발생했습니다.");
      }
      // 성공 시 토큰을 sessionStorage에 저장
      if (data.data.token) {
        sessionStorage.setItem("token", data.data.token);
      }
      // 성공 시 홈으로 리다이렉트
      console.log("회원가입 성공:", data);
      router.replace("/home");
    } catch (err) {
      console.error("Error details:", err);
      setError(
        err instanceof Error ? err.message : "서버 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={style.modalBackground}>
      <div className={style.modal}>
        <div className={style.modalHeader}>
          <BackButton />
          <div>계정을 생성하세요.</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={style.modalBody}>
            <div className={style.inputDiv}>
              <label className={style.inputLabel} htmlFor="username">
                사용자 이름
              </label>
              <input
                id="username"
                name="username"
                className={style.input}
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className={style.inputDiv}>
              <label className={style.inputLabel} htmlFor="email">
                이메일
              </label>
              <input
                id="email"
                name="email"
                className={style.input}
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className={style.inputDiv}>
              <label className={style.inputLabel} htmlFor="password">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                className={style.input}
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className={style.inputDiv}>
              <label className={style.inputLabel} htmlFor="bio">
                자기소개
              </label>
              <textarea
                id="bio"
                name="bio"
                className={style.input}
                value={formData.bio}
                onChange={handleChange}
              />
            </div>
            <div className={style.inputDiv}>
              <label className={style.inputLabel} htmlFor="birthDate">
                생년월일
              </label>
              <input
                id="birthDate"
                name="birthDate"
                className={style.input}
                type="text"
                placeholder="YYYYMMDD"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={style.modalFooter}>
            <button
              type="submit"
              className={style.actionButton}
              disabled={isLoading}
            >
              {isLoading ? "처리중..." : "가입하기"}
            </button>
            {error && <div className={style.error}>{error}</div>}
          </div>
        </form>
      </div>
    </div>
  );
}
