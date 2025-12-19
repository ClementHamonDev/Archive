"use client";

import { getSession } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

const Home = async () => {
  const sess = await getSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 ">
      Home Page
      {sess ? (
        <div className="flex flex-col items-center gap-4">
          <div>Welcome, {sess.user?.email}</div>
          <LogoutButton />
        </div>
      ) : (
        <div>Please sign in.</div>
      )}
    </div>
  );
};

export default Home;
