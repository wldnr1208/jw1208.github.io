"use client";

import style from "./post.module.css";
import Link from "next/link";
import ActionButtons from "@/app/(afterLogin)/_component/ActionButtons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import PostImages from "./PostImages";
import PostArticle from "./PostArticle";
import { useQuery } from "@tanstack/react-query";

dayjs.locale("ko");
dayjs.extend(relativeTime);

interface Post {
  postId: number;
  displayName: string;
  username: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
  repostCount: number;
  original: boolean;
}

interface PostsResponse {
  posts: Post[];
}

// 랜덤 색상을 생성하는 함수 (사용자별로 고유한 색상 생성)
function generateColorFromString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 40%)`; // 채도 70%, 밝기 40%로 고정
}

// displayName에서 @ 제거하는 함수
function formatDisplayName(displayName: string) {
  return displayName.startsWith("@") ? displayName.slice(1) : displayName;
}

async function getPosts() {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
}

export default function Post() {
  const {
    data: postsData,
    error,
    isLoading,
  } = useQuery<PostsResponse>({
    queryKey: ["posts"],
    queryFn: getPosts,
  });

  if (isLoading) return <div>로딩중...</div>;
  if (error) return <div>에러가 발생했습니다: {error.message}</div>;
  if (!postsData) return null;

  return (
    <>
      {postsData.posts.map((post) => (
        <PostArticle key={post.postId} post={post}>
          <div className={style.postWrapper}>
            <div className={style.postUserSection}>
              <Link
                href={`/${formatDisplayName(post.displayName)}`}
                className={style.postUserImage}
              >
                <div
                  className={style.userInitial}
                  style={{
                    backgroundColor: generateColorFromString(post.username),
                  }}
                >
                  {post.username[0].toUpperCase()}
                </div>
                <div className={style.postShade} />
              </Link>
            </div>
            <div className={style.postBody}>
              <div className={style.postMeta}>
                <Link href={`/${formatDisplayName(post.displayName)}`}>
                  <span className={style.postUserName}>{post.username}</span>
                  &nbsp;
                  <span className={style.postUserId}>{post.displayName}</span>
                  &nbsp; · &nbsp;
                </Link>
                <span className={style.postDate}>
                  {dayjs(post.createdAt).fromNow(true)}
                </span>
              </div>
              <div>{post.content}</div>
              <ActionButtons />
            </div>
          </div>
        </PostArticle>
      ))}
    </>
  );
}
