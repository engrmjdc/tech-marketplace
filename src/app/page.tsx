import AuthButton from "../components/ui/auth-button";

export default function Home() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tech Marketplace</h1>
          <p className="mt-2">
            Freelance marketplace for technology professionals.
          </p>
        </div>

        <AuthButton />
      </div>
    </main>
  );
}