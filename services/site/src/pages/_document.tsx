import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="Hypixel TNT Tag Stats Website" />
        <meta name="theme-color" content="#FF5555" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="TNT Tag Info" />
        <meta property="og:description" content="Hypixel TNT Tag Stats Website" />
        <meta property="og:image" content="/tntblock.png" />
        <meta property="og:image:alt" content="TNT Tag Info Logo" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
