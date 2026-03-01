import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
            headerTitle: "text-zinc-100",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton:
              "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700",
            formButtonPrimary: "bg-emerald-600 hover:bg-emerald-500 text-white",
            formFieldInput:
              "bg-zinc-800 border-zinc-700 text-zinc-100 focus:border-emerald-500",
            formFieldLabel: "text-zinc-400",
            footerActionLink: "text-emerald-400 hover:text-emerald-300",
            identityPreviewEditButton: "text-emerald-400",
          },
        }}
      />
    </div>
  );
}
