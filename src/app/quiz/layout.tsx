import { BlockBrowserNavigation } from "@/components/quiz/RedirectToHome";

export default function QuizLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BlockBrowserNavigation />
      {children}
    </>
  );
}
