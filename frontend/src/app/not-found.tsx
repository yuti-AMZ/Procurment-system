import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/5 via-transparent to-background pointer-events-none" />{" "}
      <div className="relative text-center max-w-md">
        <div className="text-8xl font-bold text-gold/20 mb-4">404</div>{" "}
        <h1 className="text-3xl font-semibold mb-3">Page Not Found</h1>{" "}
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved.{" "}
        </p>{" "}
        <Link href="/">
          <Button>Return Home</Button>{" "}
        </Link>{" "}
      </div>{" "}
    </div>
  );
}
