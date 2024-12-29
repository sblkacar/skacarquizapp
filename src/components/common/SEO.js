import { Helmet } from 'react-helmet';

function SEO({ title, description }) {
  return (
    <Helmet>
      <title>{title} | Quiz App</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content="#4f46e5" />
    </Helmet>
  );
} 