import { getSession } from "@/lib/auth";

const Home = async () => {
  const sess = await getSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 ">
      Home Page
      {sess ? (
        <div>Welcome, {sess.user?.email}</div>
      ) : (
        <div>Please sign in.</div>
      )}
    </div>
  );
};

export default Home;
