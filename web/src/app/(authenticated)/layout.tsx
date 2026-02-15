import { Nav } from "@/components/nav";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </>
  );
}
