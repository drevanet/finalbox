import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";




export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar/>
      <main>{children}</main>
      <Footer />
    </>
  );
}
