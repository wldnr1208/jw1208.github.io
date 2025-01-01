"use client";

import { useRouter } from "next/navigation";
import BackButton from "@/app/(beforeLogin)/_component/BackButton";
import style from "./profile.module.css";
import Post from "@/app/(afterLogin)/_component/Post";
import { useEffect, useState } from "react";
import { use } from "react";
import ChangePasswordModal from "./@modal/changePassword/page";

interface ProfileData {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  tweetsCount: number;
}

export default function Profile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [user, setUser] = useState<ProfileData>({
    id: "jw120835",
    username: "이정우",
    displayName: "wldnr1208",
    bio: "남성",
    followersCount: 0,
    followingCount: 0,
    tweetsCount: 5,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${resolvedParams.username}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const result = await response.json();
        if (result.success) {
          setUser(result.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, [resolvedParams.username]);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handleEditProfile = () => {
    router.push(`/${resolvedParams.username}/edit`);
  };

  const handleEditPassword = () => {
    setIsPasswordModalOpen(true);
  };

  return (
    <main className={style.main}>
      <div className={style.header}>
        <BackButton />
        <div className={style.headerTitle}>
          <span>{user.username}</span>
          <span>{user.tweetsCount} posts</span>
        </div>
      </div>

      <div className={style.profileContainer}>
        <div className={style.profileHeader}>
          <div className={style.userImage}>{user.username[0]}</div>
          <div className={style.buttonGroup}>
            <button onClick={handleEditProfile} className={style.editButton}>
              Edit profile
            </button>
            <button
              onClick={handleEditPassword}
              className={style.editPasswordButton}
            >
              Edit password
            </button>
          </div>
          <ChangePasswordModal
            isOpen={isPasswordModalOpen}
            onClose={() => setIsPasswordModalOpen(false)}
            displayName={user.displayName}
          />
        </div>

        <div className={style.userInfo}>
          <div className={style.userName}>
            {user.username}
            <span className={style.verifiedBadge}>✓</span>
          </div>
          <div className={style.userHandle}>{user.displayName}</div>
          <div className={style.bio}>{user.bio}</div>
          <div className={style.joinDate}>
            Joined
            {new Date().toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        <div className={style.followInfo}>
          <span>
            <span className={style.followCount}>{user.followingCount}</span>{" "}
            Following
          </span>
          <span>
            <span className={style.followCount}>{user.followersCount}</span>{" "}
            Followers
          </span>
        </div>
      </div>

      <div>
        <Post />
      </div>
    </main>
  );
}
