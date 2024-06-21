import CheckKhodam from "@/components/cek-khodam";
import Heading from "@/components/heading";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <Heading />
      <CheckKhodam />
    </section>
  );
}
