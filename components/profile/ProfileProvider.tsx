"use client";

import React, {
  createContext,
  useContext,
} from "react";

import { usePersistentState } from "../hooks/usePersistentState";

export type UserStage =
  | "junior_high"
  | "high_school"
  | "college"
  | "adult";

type ProfileContextValue = {
  userName: string;

  setUserName: React.Dispatch<
    React.SetStateAction<string>
  >;

  userStage: UserStage;

  setUserStage: React.Dispatch<
    React.SetStateAction<UserStage>
  >;
};

const ProfileContext =
  createContext<ProfileContextValue | null>(
    null
  );

export function ProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] =
    usePersistentState<string>(
      "affirmme_user_name_v1",
      ""
    );

  const [userStage, setUserStage] =
    usePersistentState<UserStage>(
      "affirmme_user_stage_v1",
      "adult"
    );

  return (
    <ProfileContext.Provider
      value={{
        userName,
        setUserName,
        userStage,
        setUserStage,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context =
    useContext(ProfileContext);

  if (!context) {
    throw new Error(
      "useProfile must be used inside ProfileProvider."
    );
  }

  return context;
}