'use client';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple markdown parser for our specific format
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Headers
      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-4xl font-bold mb-6 text-white">{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        if (inTable) {
          elements.push(renderTable(tableHeaders, tableRows, i));
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
        elements.push(<h2 key={i} className="text-3xl font-bold mt-8 mb-4 text-white">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        if (inTable) {
          elements.push(renderTable(tableHeaders, tableRows, i));
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
        elements.push(<h3 key={i} className="text-2xl font-semibold mt-6 mb-3 text-white/90">{line.slice(4)}</h3>);
      }
      // Horizontal rule
      else if (line.trim() === '---') {
        if (inTable) {
          elements.push(renderTable(tableHeaders, tableRows, i));
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
        elements.push(<hr key={i} className="my-8 border-white/10" />);
      }
      // Table detection
      else if (line.startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHeaders = line.split('|').map(h => h.trim()).filter(h => h);
        } else if (line.includes('---')) {
          // Skip separator line
          continue;
        } else {
          const cells = line.split('|').map(c => c.trim()).filter(c => c);
          tableRows.push(cells);
        }
      }
      // Lists
      else if (line.startsWith('- ')) {
        if (inTable) {
          elements.push(renderTable(tableHeaders, tableRows, i));
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
        elements.push(
          <li key={i} className="ml-6 mb-2 text-white/80 list-disc">
            {renderInlineMarkdown(line.slice(2))}
          </li>
        );
      }
      // Code blocks
      else if (line.startsWith('`') && line.endsWith('`')) {
        if (inTable) {
          elements.push(renderTable(tableHeaders, tableRows, i));
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
        elements.push(
          <code key={i} className="block bg-white/5 px-4 py-2 rounded-lg text-blue-300 font-mono text-sm my-2">
            {line.slice(1, -1)}
          </code>
        );
      }
      // Paragraphs
      else if (line.trim()) {
        if (inTable) {
          elements.push(renderTable(tableHeaders, tableRows, i));
          inTable = false;
          tableHeaders = [];
          tableRows = [];
        }
        if (!line.startsWith('*') || !line.endsWith('*')) {
          elements.push(
            <p key={i} className="mb-3 text-white/70 leading-relaxed">
              {renderInlineMarkdown(line)}
            </p>
          );
        } else {
          elements.push(
            <p key={i} className="mb-3 text-white/50 italic text-sm">
              {line.slice(1, -1)}
            </p>
          );
        }
      }
    }

    if (inTable) {
      elements.push(renderTable(tableHeaders, tableRows, elements.length));
    }

    return elements;
  };

  const renderTable = (headers: string[], rows: string[][], key: number) => {
    return (
      <div key={key} className="overflow-x-auto my-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/20">
              {headers.map((header, i) => (
                <th key={i} className="px-4 py-3 text-left text-white/90 font-semibold">
                  {renderInlineMarkdown(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="px-4 py-3 text-white/70">
                    {renderInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderInlineMarkdown = (text: string) => {
    // Bold
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    // Links
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">$1</a>');
    // Inline code
    text = text.replace(/`(.+?)`/g, '<code class="bg-white/10 px-2 py-1 rounded text-blue-300 font-mono text-sm">$1</code>');
    
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div className="prose prose-invert max-w-none">
      {renderMarkdown(content)}
    </div>
  );
}


