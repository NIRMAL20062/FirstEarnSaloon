"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  await signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signInWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  if (name) {
    await updateProfile(credential.user, { displayName: name });
  }
}

export async function signOutUser() {
  await signOut(getFirebaseAuth());
}
