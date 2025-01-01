"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { use } from "react";
import style from "./edit.module.css";

interface ProfileFormData {
  username: string;
  bio: string;
  protectedTweets: boolean;
}

export default function EditProfileModal({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    username: "",
    bio: "",
    protectedTweets: false,
  });

  // 사용자명에서 @ 제거 및 인코딩 처리
  const getFormattedUsername = (username: string) => {
    return encodeURIComponent(username.replace("@", ""));
  };

  useEffect(() => {
    const fetchCurrentProfile = async () => {
      try {
        const formattedUsername = getFormattedUsername(resolvedParams.username);
        const response = await fetch(`/api/users/${formattedUsername}`);

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const result = await response.json();
        if (result.success) {
          setProfileData({
            username: result.data.username,
            bio: result.data.bio || "",
            protectedTweets: false,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchCurrentProfile();
  }, [resolvedParams.username]);

  const closeModal = () => {
    router.back();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedUsername = getFormattedUsername(resolvedParams.username);
      const token = sessionStorage.getItem("token");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${formattedUsername}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const result = await response.json();

      if (result.success) {
        router.refresh();
        closeModal();
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className={style.modalOverlay} onClick={handleBackdropClick}>
      <div className={style.modal}>
        <div className={style.header}>
          <div className={style.headerLeft}>
            <button onClick={closeModal} className={style.closeButton}>
              ✕
            </button>
            <h2 className={style.title}>프로필 수정</h2>
          </div>
          <button
            type="submit"
            form="profile-form"
            disabled={isLoading}
            className={style.saveButton}
          >
            {isLoading ? "저장 중..." : "저장"}
          </button>
        </div>

        <form
          id="profile-form"
          onSubmit={onSubmit}
          className={style.formContainer}
        >
          <div className={style.inputGroup}>
            <label className={style.label}>이름</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className={style.input}
            />
          </div>

          <div className={style.inputGroup}>
            <label className={style.label}>자기소개</label>
            <textarea
              value={profileData.bio}
              onChange={(e) =>
                setProfileData((prev) => ({ ...prev, bio: e.target.value }))
              }
              className={style.textarea}
            />
          </div>

          <div className={style.checkboxGroup}>
            <input
              type="checkbox"
              id="protectedTweets"
              checked={profileData.protectedTweets}
              onChange={(e) =>
                setProfileData((prev) => ({
                  ...prev,
                  protectedTweets: e.target.checked,
                }))
              }
              className={style.checkbox}
            />
            <label htmlFor="protectedTweets" className={style.checkboxLabel}>
              트윗 보호하기
            </label>
          </div>
        </form>
      </div>
    </div>
  );
}
