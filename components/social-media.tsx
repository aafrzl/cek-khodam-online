import { siteConfig } from "@/config/site";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa6";
import { FaTiktok } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

export default function SocialMedia() {
  return (
    <div className="flex flex-col gap-2 items-center mt-4">
      <p className="text-sm">Follow social media kami.</p>
      <div className="flex flex-wrap md:flex-nowrap items-center space-x-2">
        <Link
          target="_black"
          rel="noreferrer noopener"
          className="p-2 bg-foreground rounded-full hover:bg-primary group"
          href={siteConfig.links.instagram}
        >
          <FaInstagram className="w-4 h-4 md:w-5 md:h-5 text-background shrink-0 group-hover:text-foreground" />
        </Link>
        <Link
          target="_black"
          rel="noreferrer noopener"
          className="p-2 bg-foreground rounded-full hover:bg-primary group"
          href={siteConfig.links.tiktok}
        >
          <FaTiktok className="w-4 h-4 md:w-5 md:h-5 text-background shrink-0 group-hover:text-foreground" />
        </Link>
        <Link
          target="_black"
          rel="noreferrer noopener"
          className="p-2 bg-foreground rounded-full hover:bg-primary group"
          href={siteConfig.links.discord}
        >
          <FaDiscord className="w-4 h-4 md:w-5 md:h-5 text-background shrink-0 group-hover:text-foreground" />
        </Link>
        <Link
          target="_black"
          rel="noreferrer noopener"
          className="p-2 bg-foreground rounded-full hover:bg-primary group"
          href={siteConfig.links.github}
        >
          <FaGithub className="w-4 h-4 md:w-5 md:h-5 text-background shrink-0 group-hover:text-foreground" />
        </Link>
      </div>
    </div>
  );
}
