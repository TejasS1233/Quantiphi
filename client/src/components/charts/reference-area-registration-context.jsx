"use client";;
import { createContext, useContext } from "react";

export const ReferenceAreaRegistrationContext =
  createContext(null);

export function useReferenceAreaRegistration() {
  return useContext(ReferenceAreaRegistrationContext);
}
