import CheckKhodam from "@/components/cek-khodam";
import Heading from "@/components/heading";
import SocialMedia from "@/components/social-media";


export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <Heading />
      <CheckKhodam />
      <SocialMedia />
    </section>
  );
}
