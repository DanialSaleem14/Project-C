import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <div className="prose prose-neutral max-w-none dark:prose-invert prose-a:text-blue-600 dark:prose-a:text-blue-400">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </div>
  );
}
