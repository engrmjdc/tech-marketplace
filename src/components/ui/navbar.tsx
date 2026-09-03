import Link from "next/link";
import AuthButton from "./auth-button";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          Tech Marketplace
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm hover:underline">
            Find Work
          </Link>

          <Link href="/" className="text-sm hover:underline">
            Find Talent
          </Link>

          <AuthButton />
        </div>
      </div>
    </nav>
  );
}