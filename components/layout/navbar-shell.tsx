"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AccountNavbar } from "./account-navbar";
import { Navbar } from "./navbar";

const ACCOUNT_NAVBAR_PREFIXES = ["/account"];

export const NavbarShell = () => {
  const pathname = usePathname();
  const isAccount = ACCOUNT_NAVBAR_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isAccount) {
    return <AccountNavbar />;
  }

  return <Navbar />;
};
