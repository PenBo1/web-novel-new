import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { css } from '@codemirror/lang-css';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'json' | 'css';
  height?: string;
  className?: string;
}

export const Editor = ({ value, onChange, language, height = '300px', className }: EditorProps) => {
  const extensions = React.useMemo(() => {
    return language === 'json' ? [json()] : [css()];
  }, [language]);

  return (
    <div className={className}>
      <CodeMirror
        value={value}
        height={height}
        theme="dark"
        extensions={extensions}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: true,
        }}
      />
    </div>
  );
};
