import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

const LandingPage = async () => {
  const session = await getSession();

  if (session) {
    redirect("/home");
  }

  return (
    <main>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to the Project Archive
        </h1>
        <p className="text-lg text-center max-w-md">
          Please log in with your GitHub account to access your archived
          projects.
        </p>
        <Button className="m-12" variant="outline">
          <Link href="/login">Go to login</Link>
        </Button>
      </div>
    </main>
  );
};

export default LandingPage;
