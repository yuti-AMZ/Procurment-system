import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />{" "}
      <div className="relative text-center max-w-md">
        <div className="text-8xl font-bold text-gold/20 mb-4">403</div>{" "}
        <h1 className="text-3xl font-semibold mb-3">Access Denied</h1>{" "}
        <p className="text-muted-foreground mb-8">
          You don&apos;t have permission to access this page. Please contact
          your administrator.{" "}
        </p>{" "}
        <Link href="/">
          <Button>Return Home</Button>{" "}
        </Link>{" "}
      </div>{" "}
    </div>
  );
}
