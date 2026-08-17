"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AccountNavbar } from "./account-navbar";
import { Navbar } from "./navbar";

const ACCOUNT_NAVBAR_PREFIXES = ["/account"];
const AUTH_NAVBAR_PREFIXES = ["/login"];

export const NavbarShell = () => {
  const pathname = usePathname();
  const isAccount = ACCOUNT_NAVBAR_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuth = AUTH_NAVBAR_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isAuth) {
    return <AccountNavbar variant="auth" />;
  }

  if (isAccount) {
    return <AccountNavbar />;
  }

  return <Navbar />;
};
