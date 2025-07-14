"use client"
import { LoginForm } from "@/components/auth/login-form";
import { SegamentLogo } from "@/components/icons";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent_30%"></div>
        <div className="z-10 flex flex-col items-center text-center">
            <div className="flex items-center gap-4 mb-4">
                <SegamentLogo className="h-16 w-16" />
                <h1 className="text-5xl md:text-6xl font-headline font-bold text-primary">
                    Segament
                </h1>
            </div>
            <p className="max-w-md mb-8 text-lg text-foreground/80 font-body">
                츄니즘 및 마이마이 프로필화
            </p>
            <LoginForm />
        </div>
    </main>
  );
}
