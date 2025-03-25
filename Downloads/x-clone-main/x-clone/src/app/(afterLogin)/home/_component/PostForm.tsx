"use client";

import {
  ChangeEventHandler,
  FormEventHandler,
  useRef,
  useState,
  useEffect,
} from "react";
import style from "./postForm.module.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UserProfile {
  id: number;
  username: string;
  displayName: string;
  bio: string;
  birthDate: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
}

interface UserProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

export default function PostForm() {
  const [myDisplayName, setMyDisplayName] = useState<string>("");
  const imageRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setMyDisplayName(user.displayName);
    }
  }, []);

  const { data: userProfileData } = useQuery<UserProfileResponse>({
    queryKey: ["userProfile", myDisplayName],
    queryFn: async () => {
      if (!myDisplayName) return null;
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${myDisplayName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }
      return response.json();
    },
    enabled: !!myDisplayName,
  });

  const postMutation = useMutation({
    mutationFn: async (content: string) => {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setContent("");
    },
  });

  const onChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    setContent(e.target.value);
  };

  const onSubmit: FormEventHandler = async (e) => {
    e.preventDefault();
    if (!content || content.trim().length === 0) return;
    postMutation.mutate(content);
  };

  const onClickButton = () => {
    imageRef.current?.click();
  };

  return (
    <form className={style.postForm} onSubmit={onSubmit}>
      <div className={style.postUserSection}>
        <div className={style.postUserImage}>
          <img
            src={userProfileData?.data?.displayName || myDisplayName}
            alt={userProfileData?.data?.username || "profile"}
          />
        </div>
      </div>
      <div className={style.postInputSection}>
        <textarea
          value={content}
          onChange={onChange}
          placeholder="무슨 일이 일어나고 있나요?"
          disabled={postMutation.isPending}
        />
        <div className={style.postButtonSection}>
          <div className={style.footerButtons}>
            <div className={style.footerButtonLeft}>
              <input
                type="file"
                name="imageFiles"
                multiple
                hidden
                ref={imageRef}
              />
              <button
                className={style.uploadButton}
                type="button"
                onClick={onClickButton}
                disabled={postMutation.isPending}
              >
                <svg width={24} viewBox="0 0 24 24" aria-hidden="true">
                  <g>
                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z"></path>
                  </g>
                </svg>
              </button>
            </div>
            <button
              className={style.actionButton}
              disabled={!content || postMutation.isPending}
            >
              {postMutation.isPending ? "게시중..." : "게시하기"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
