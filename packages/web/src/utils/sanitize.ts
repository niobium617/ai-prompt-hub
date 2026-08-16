import DOMPurify from 'dompurify';
import { marked } from 'marked';

/**
 * 渲染 Markdown 为安全的 HTML（DOMPurify 净化，防存储型 XSS）
 * 文章内容由用户提交，marked 本身不净化，必须经过此函数再交给 v-html
 */
export function renderMarkdown(src: string): string {
  const html = marked.parse(src || '', { breaks: true, gfm: true }) as string;
  return DOMPurify.sanitize(html);
}
