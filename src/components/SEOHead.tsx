import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  path?: string;
}

const BASE = "https://id-preview--d95e4257-ad9d-4a77-897f-9f02759a84b8.lovable.app";

export default function SEOHead({ title, description, path = "/" }: SEOHeadProps) {
  const url = `${BASE}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
    </Helmet>
  );
}
