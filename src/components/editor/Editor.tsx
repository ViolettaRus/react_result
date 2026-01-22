import React, { useRef, useEffect, useState } from 'react';
import { Button, Tooltip } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  FontColorsOutlined
} from '@ant-design/icons';
import './Editor.css';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

const colors = [
  { name: 'Черный', value: '#000000' },
  { name: 'Красный', value: '#dc2626' },
  { name: 'Синий', value: '#2563eb' },
  { name: 'Зеленый', value: '#16a34a' },
  { name: 'Оранжевый', value: '#ea580c' },
  { name: 'Фиолетовый', value: '#9333ea' },
];

const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  const [colorMenuOpen, setColorMenuOpen] = useState(false);
  const isUpdatingRef = useRef(false);
  const lastSelectionRef = useRef<Range | null>(null);

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        lastSelectionRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    if (!lastSelectionRef.current || !editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    try {
      if (editorRef.current.contains(lastSelectionRef.current.commonAncestorContainer)) {
        selection.removeAllRanges();
        selection.addRange(lastSelectionRef.current);
      } else {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        lastSelectionRef.current = range;
      }
    } catch (e) {
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      lastSelectionRef.current = range;
    }
  };

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const currentContent = editorRef.current.innerHTML;
      if (content !== currentContent) {
        saveSelection();
        isUpdatingRef.current = true;
        const initialContent = content || '<p style="font-weight: normal; font-style: normal; text-decoration: none;"></p>';
        editorRef.current.innerHTML = initialContent;
        
        requestAnimationFrame(() => {
          restoreSelection();
          isUpdatingRef.current = false;
          updateState();
        });
      }
    }
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    
    const selection = window.getSelection();
    let range: Range | null = null;
    
    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0).cloneRange();
    } else {
      range = document.createRange();
      if (editorRef.current.lastChild) {
        range.setStartAfter(editorRef.current.lastChild);
        range.setEndAfter(editorRef.current.lastChild);
      } else {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
      }
    }
    
    if (range && selection) {
      try {
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        const newRange = document.createRange();
        if (editorRef.current.firstChild) {
          newRange.setStart(editorRef.current, 0);
          newRange.setEnd(editorRef.current, editorRef.current.childNodes.length);
        } else {
          newRange.selectNodeContents(editorRef.current);
          newRange.collapse(false);
        }
        selection.removeAllRanges();
        selection.addRange(newRange);
        range = newRange;
      }
    }
    
    let success = false;
    try {
      success = document.execCommand(command, false, value);
      
      if (!success) {
        try {
          document.execCommand('styleWithCSS', false, 'true');
          success = document.execCommand(command, false, value);
        } catch (e) {
          // Ignore error
        }
      }
    } catch (e) {
      console.error('execCommand failed:', e);
    }
    
    saveSelection();
    
    setTimeout(() => {
      if (editorRef.current && success) {
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        editorRef.current.dispatchEvent(inputEvent);
      }
      
      updateState();
      updateContent();
      if (editorRef.current) {
        editorRef.current.focus();
        restoreSelection();
      }
    }, 10);
  };

  const updateContent = () => {
    if (editorRef.current && !isUpdatingRef.current) {
      isUpdatingRef.current = true;
      const html = editorRef.current.innerHTML;
      onChange(html);
      
      requestAnimationFrame(() => {
        isUpdatingRef.current = false;
      });
    }
  };

  const updateState = () => {
    if (editorRef.current) {
      try {
      setIsBold(document.queryCommandState('bold'));
      setIsItalic(document.queryCommandState('italic'));
      setIsUnderline(document.queryCommandState('underline'));
      setIsStrike(document.queryCommandState('strikeThrough'));
      setIsBulletList(document.queryCommandState('insertUnorderedList'));
      setIsNumberedList(document.queryCommandState('insertOrderedList'));
        
        if (document.queryCommandState('justifyLeft')) {
          setAlign('left');
        } else if (document.queryCommandState('justifyCenter')) {
          setAlign('center');
        } else if (document.queryCommandState('justifyRight')) {
          setAlign('right');
        }
      } catch (e) {
        // Ignore errors
      }
    }
  };

  const handleInput = () => {
    saveSelection();
    
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      if (html !== content) {
        updateContent();
      }
    }
    
    requestAnimationFrame(() => {
      updateContent();
      updateState();
      restoreSelection();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        execCommand('bold');
        return;
      }
      if (e.key === 'i') {
        e.preventDefault();
        execCommand('italic');
        return;
      }
      if (e.key === 'u') {
        e.preventDefault();
        execCommand('underline');
        return;
      }
    }
    
    if (e.key === 'Enter') {
      saveSelection();
      requestAnimationFrame(() => {
        updateContent();
        updateState();
        restoreSelection();
      });
    }
  };

  const handleKeyUp = () => {
    updateState();
    saveSelection();
  };

  const handleMouseUp = () => {
    setTimeout(() => {
      updateState();
      saveSelection();
    }, 0);
  };

  const handleSelectionChange = () => {
    if (editorRef.current && document.activeElement === editorRef.current) {
      updateState();
      saveSelection();
    }
  };

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  const handleColorChange = (color: string) => {
    if (!editorRef.current) return;
    
    restoreSelection();
    editorRef.current.focus();
    
    setTimeout(() => {
      const selection = window.getSelection();
      let range: Range | null = null;
      
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      } else if (lastSelectionRef.current) {
        range = lastSelectionRef.current.cloneRange();
        try {
          selection?.removeAllRanges();
          selection?.addRange(range);
        } catch (e) {
          const currentEditor = editorRef.current;
          if (currentEditor) {
            range = document.createRange();
            range.selectNodeContents(currentEditor);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }
      } else {
        const currentEditor = editorRef.current;
        if (currentEditor) {
          range = document.createRange();
          range.selectNodeContents(currentEditor);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
      
      if (!range) return;
      
      let success = false;
      
      if (range) {
        try {
          if (!range.collapsed) {
            const span = document.createElement('span');
            span.style.color = color;
            span.style.setProperty('color', color, 'important');
            
            try {
              range.surroundContents(span);
              success = true;
            } catch (e) {
              const contents = range.extractContents();
              
              if (contents.nodeType === Node.TEXT_NODE) {
                span.textContent = contents.textContent || '';
                range.insertNode(span);
              } else {
                span.appendChild(contents);
                range.insertNode(span);
              }
              
              const newRange = document.createRange();
              newRange.selectNodeContents(span);
              selection?.removeAllRanges();
              selection?.addRange(newRange);
              success = true;
            }
          } else {
            const span = document.createElement('span');
            span.style.color = color;
            span.style.setProperty('color', color, 'important');
            span.innerHTML = '\u200B';
            range.insertNode(span);
            
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
            success = true;
          }
        } catch (e) {
          console.error('Error applying color with span:', e);
          try {
            document.execCommand('styleWithCSS', false, 'true');
            success = document.execCommand('foreColor', false, color);
          } catch (e2) {
            console.error('execCommand also failed:', e2);
          }
        }
      }
      
      if (success) {
        saveSelection();
        
        requestAnimationFrame(() => {
          updateContent();
          updateState();
          editorRef.current?.focus();
          restoreSelection();
        });
      }
    }, 10);
    
    setColorMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorMenuOpen && !(event.target as Element).closest('.color-picker-wrapper')) {
        setColorMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorMenuOpen]);

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = '<p></p>';
    }
  }, []);

  return (
    <div className="editor-container">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <Tooltip title="Жирный (Ctrl+B)">
            <Button
              type={isBold ? 'primary' : 'default'}
              icon={<BoldOutlined />}
            onClick={() => execCommand('bold')}
              className="toolbar-button"
            />
          </Tooltip>
          <Tooltip title="Курсив (Ctrl+I)">
            <Button
              type={isItalic ? 'primary' : 'default'}
              icon={<ItalicOutlined />}
            onClick={() => execCommand('italic')}
              className="toolbar-button"
            />
          </Tooltip>
          <Tooltip title="Подчеркивание (Ctrl+U)">
            <Button
              type={isUnderline ? 'primary' : 'default'}
              icon={<UnderlineOutlined />}
            onClick={() => execCommand('underline')}
              className="toolbar-button"
            />
          </Tooltip>
          <Tooltip title="Зачеркивание">
            <Button
              type={isStrike ? 'primary' : 'default'}
              icon={<StrikethroughOutlined />}
            onClick={() => execCommand('strikeThrough')}
              className="toolbar-button"
            />
          </Tooltip>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <Tooltip title="По левому краю">
            <Button
              type={align === 'left' ? 'primary' : 'default'}
              icon={<AlignLeftOutlined />}
            onClick={() => {
              execCommand('justifyLeft');
              setAlign('left');
            }}
              className="toolbar-button"
            />
          </Tooltip>
          <Tooltip title="По центру">
            <Button
              type={align === 'center' ? 'primary' : 'default'}
              icon={<AlignCenterOutlined />}
            onClick={() => {
              execCommand('justifyCenter');
              setAlign('center');
            }}
              className="toolbar-button"
            />
          </Tooltip>
          <Tooltip title="По правому краю">
            <Button
              type={align === 'right' ? 'primary' : 'default'}
              icon={<AlignRightOutlined />}
            onClick={() => {
              execCommand('justifyRight');
              setAlign('right');
            }}
              className="toolbar-button"
            />
          </Tooltip>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <Tooltip title="Маркированный список">
            <Button
              type={isBulletList ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
            onClick={() => execCommand('insertUnorderedList')}
              className="toolbar-button"
            />
          </Tooltip>
          <Tooltip title="Нумерованный список">
            <Button
              type={isNumberedList ? 'primary' : 'default'}
              icon={<OrderedListOutlined />}
            onClick={() => execCommand('insertOrderedList')}
              className="toolbar-button"
            />
          </Tooltip>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <Tooltip title="Цвет текста">
            <div className="color-picker-wrapper">
              <Button
                type={colorMenuOpen ? 'primary' : 'default'}
                icon={<FontColorsOutlined />}
                onClick={() => {
                  saveSelection();
                  setColorMenuOpen(!colorMenuOpen);
                }}
                className="toolbar-button"
              />
              {colorMenuOpen && (
                <div className="color-menu" onMouseDown={(e) => e.preventDefault()}>
                  <div className="color-menu-header">Выберите цвет</div>
                  <div className="color-menu-grid">
          {colors.map((color) => (
                      <div
                        key={color.value}
                        className="color-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          saveSelection();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleColorChange(color.value);
                        }}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Tooltip>
        </div>
      </div>

      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        onInput={handleInput}
        onBlur={() => {
          updateContent();
          saveSelection();
        }}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        onMouseUp={handleMouseUp}
        suppressContentEditableWarning
        data-placeholder="Начните вводить текст..."
      />
    </div>
  );
};

export default Editor;