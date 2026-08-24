import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            ⚡ StudentOS
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Start your journey to excellence
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
