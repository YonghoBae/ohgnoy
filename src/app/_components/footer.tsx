import Container from "@/app/_components/container";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { DIGITAL_GARDEN_URL, GITHUB_URL, EMAIL, BLOG_NAME } from "@/lib/constants";
import PixelIconBox from "@/app/_components/ui/pixel/PixelIconBox";

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <Container>
        <div className="py-8 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <PixelIconBox>
                <FaGithub size={16} />
              </PixelIconBox>
            </a>
            <a
              href={DIGITAL_GARDEN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="디지털가든"
            >
              <PixelIconBox>
                <FaExternalLinkAlt size={14} />
              </PixelIconBox>
            </a>
            <a href={`mailto:${EMAIL}`} aria-label="이메일">
              <PixelIconBox>
                <MdEmail size={16} />
              </PixelIconBox>
            </a>
          </div>
          <p className="text-sm text-text-muted">© {new Date().getFullYear()} {BLOG_NAME}</p>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
