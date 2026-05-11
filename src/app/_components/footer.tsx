import Container from "@/app/_components/container";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { DIGITAL_GARDEN_URL, GITHUB_URL, EMAIL, BLOG_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <Container>
        <div className="py-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-5">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-text-muted hover:text-primary transition-colors duration-200"
            >
              <FaGithub size={20} />
            </a>
            <a
              href={DIGITAL_GARDEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="디지털가든"
              className="text-text-muted hover:text-primary transition-colors duration-200"
            >
              <FaExternalLinkAlt size={16} />
            </a>
            <a
              href={`mailto:${EMAIL}`}
              aria-label="이메일"
              className="text-text-muted hover:text-primary transition-colors duration-200"
            >
              <MdEmail size={20} />
            </a>
          </div>
          <p className="text-sm text-text-muted">© {new Date().getFullYear()} {BLOG_NAME}</p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
