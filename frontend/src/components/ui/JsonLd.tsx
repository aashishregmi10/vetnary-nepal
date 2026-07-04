// Renders one or more JSON-LD blocks as a script tag. Server component — output
// lands directly in the HTML for crawlers/AI engines.
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
