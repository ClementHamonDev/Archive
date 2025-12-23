import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

const Home = async () => {
  const session = await getSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
};

export default Home;
