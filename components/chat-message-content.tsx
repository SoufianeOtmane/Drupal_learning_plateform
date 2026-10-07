import { Fragment, ReactNode } from "react";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIndex = 0;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));

    const token = match[0];
    const key = `${keyPrefix}-${tokenIndex++}`;
    if (token.startsWith("`")) {
      nodes.push(<code className="mentor-inline-code" key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderTextBlock(block: string, key: string): ReactNode {
  const lines = block.split(/\r?\n/);
  const isUnorderedList = lines.every((line) => /^\s*[-*]\s+/.test(line));
  const isOrderedList = lines.every((line) => /^\s*\d+[.)]\s+/.test(line));

  if (isUnorderedList || isOrderedList) {
    const List = isOrderedList ? "ol" : "ul";
    return (
      <List className="mentor-message-list" key={key}>
        {lines.map((line, index) => (
          <li key={`${key}-${index}`}>
            {renderInline(line.replace(/^\s*(?:[-*]|\d+[.)])\s+/, ""), `${key}-${index}`)}
          </li>
        ))}
      </List>
    );
  }

  return (
    <p className="mentor-message-paragraph" key={key}>
      {lines.map((line, index) => (
        <Fragment key={`${key}-${index}`}>
          {index > 0 && <br />}
          {renderInline(line, `${key}-${index}`)}
        </Fragment>
      ))}
    </p>
  );
}

export default function ChatMessageContent({ text }: { text: string }) {
  const segments = text.split("```");

  return (
    <div className="mentor-message-content">
      {segments.map((segment, index) => {
        if (index % 2 === 1) {
          const newline = segment.indexOf("\n");
          const firstLine = newline === -1 ? "" : segment.slice(0, newline).trim();
          const language = /^[a-zA-Z0-9_-]{1,20}$/.test(firstLine) ? firstLine : "";
          const code = language ? segment.slice(newline + 1) : segment;

          return (
            <div className="mentor-code-block" key={`code-${index}`}>
              {language && <span className="mentor-code-language">{language}</span>}
              <pre><code>{code.trim()}</code></pre>
            </div>
          );
        }

        return segment
          .trim()
          .split(/\n\s*\n/)
          .filter(Boolean)
          .map((block, blockIndex) =>
            renderTextBlock(block, `text-${index}-${blockIndex}`),
          );
      })}
    </div>
  );
}
