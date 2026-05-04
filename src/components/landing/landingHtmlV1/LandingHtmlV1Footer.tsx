import type { HomepageContent } from "@/content/homepage";

type Props = { content: HomepageContent };

export function LandingHtmlV1Footer({ content }: Props) {
  void content;
  return (
    <footer>
      <div className="footer-logo">CoachFlow AI</div>
      <ul className="footer-links">
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms of Service</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
      <div className="footer-copy">© 2026 CoachFlow AI. All rights reserved.</div>
    </footer>
  );
}

