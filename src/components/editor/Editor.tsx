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

  const colors = [
    { name: 'Черный', value: '#000000' },
    { name: 'Красный', value: '#dc2626' },
    { name: 'Синий', value: '#2563eb' },
    { name: 'Зеленый', value: '#16a34a' },
    { name: 'Оранжевый', value: '#ea580c' },
    { name: 'Фиолетовый', value: '#9333ea' },
  ];

  // Сохранение выделения
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0);
      // Проверяем, что выделение находится внутри редактора
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        lastSelectionRef.current = range.cloneRange();
      }
    }
  };

  // Восстановление выделения
  const restoreSelection = () => {
    if (lastSelectionRef.current && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        try {
          // Проверяем, что выделение все еще валидно
          if (editorRef.current.contains(lastSelectionRef.current.commonAncestorContainer)) {
            selection.removeAllRanges();
            selection.addRange(lastSelectionRef.current);
          } else {
            // Если выделение невалидно, создаем новое в конце
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            lastSelectionRef.current = range;
          }
        } catch (e) {
          // Если не удалось восстановить, создаем новое выделение
          const range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          lastSelectionRef.current = range;
        }
      }
    }
  };

  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const currentContent = editorRef.current.innerHTML;
      if (content !== currentContent) {
        saveSelection();
        isUpdatingRef.current = true;
        // Убеждаемся, что при инициализации используется обычный параграф без форматирования
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
    
    // Фокусируемся на редакторе
    editorRef.current.focus();
    
    // Сохраняем текущее выделение перед выполнением команды
    const selection = window.getSelection();
    let range: Range | null = null;
    
    if (selection && selection.rangeCount > 0) {
      range = selection.getRangeAt(0).cloneRange();
    } else {
      // Если нет выделения, создаем выделение в конце
      range = document.createRange();
      if (editorRef.current.lastChild) {
        range.setStartAfter(editorRef.current.lastChild);
        range.setEndAfter(editorRef.current.lastChild);
      } else {
        range.selectNodeContents(editorRef.current);
        range.collapse(false);
      }
    }
    
    // Восстанавливаем выделение
    if (range && selection) {
      try {
        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        // Если не удалось, создаем новое выделение
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
    
    // Выполняем команду
    let success = false;
    try {
      // Пробуем без styleWithCSS сначала (для лучшей совместимости)
      success = document.execCommand(command, false, value);
      
      // Если не сработало, пробуем с styleWithCSS
      if (!success) {
        try {
          document.execCommand('styleWithCSS', false, 'true');
          success = document.execCommand(command, false, value);
        } catch (e) {
          // Игнорируем ошибку
        }
      }
    } catch (e) {
      console.error('execCommand failed:', e);
    }
    
    // Всегда обновляем контент, даже если команда не выполнилась
    // Это нужно для сохранения форматирования
    saveSelection();
    
    // Принудительно обновляем контент для отображения форматирования
    setTimeout(() => {
      // Принудительно обновляем HTML для сохранения форматирования
      if (editorRef.current && success) {
        // Триггерим событие input для сохранения изменений
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        editorRef.current.dispatchEvent(inputEvent);
      }
      
      updateState();
      updateContent();
      if (editorRef.current) {
        editorRef.current.focus();
        // Восстанавливаем выделение после обновления
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
        
        // Определяем выравнивание
        if (document.queryCommandState('justifyLeft')) {
          setAlign('left');
        } else if (document.queryCommandState('justifyCenter')) {
          setAlign('center');
        } else if (document.queryCommandState('justifyRight')) {
          setAlign('right');
        }
      } catch (e) {
        // Игнорируем ошибки
      }
    }
  };

  const handleInput = () => {
    // Сохраняем выделение перед обновлением
    saveSelection();
    
    // Принудительно обновляем форматирование в DOM
    if (editorRef.current) {
      // Убеждаемся, что форматирование сохраняется
      const html = editorRef.current.innerHTML;
      // Если HTML изменился, обновляем контент
      if (html !== content) {
        updateContent();
      }
    }
    
    // Обновляем контент и состояние
    requestAnimationFrame(() => {
      updateContent();
      updateState();
      restoreSelection();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Обработка горячих клавиш
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
    
    // Сохраняем выделение при нажатии Enter
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
    // Небольшая задержка для корректного сохранения выделения
    setTimeout(() => {
      updateState();
      saveSelection();
    }, 0);
  };

  const handleSelectionChange = () => {
    // Обновляем состояние при изменении выделения
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
    
    // Восстанавливаем сохраненное выделение
    restoreSelection();
    
    // Фокусируемся на редакторе
    editorRef.current.focus();
    
    // Небольшая задержка для восстановления фокуса
    setTimeout(() => {
      const selection = window.getSelection();
      let range: Range | null = null;
      
      if (selection && selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      } else if (lastSelectionRef.current) {
        // Используем сохраненное выделение
        range = lastSelectionRef.current.cloneRange();
        try {
          selection?.removeAllRanges();
          selection?.addRange(range);
        } catch (e) {
          // Если не удалось восстановить, создаем новое в конце
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
        // Если нет выделения, создаем выделение в конце
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
      
      // Применяем цвет через span (более надежный метод)
      let success = false;
      
      if (range) {
        try {
          if (!range.collapsed) {
            // Есть выделение - оборачиваем в span
            const span = document.createElement('span');
            // Применяем цвет через inline стиль
            span.style.color = color;
            span.style.setProperty('color', color, 'important');
            
            try {
              range.surroundContents(span);
              success = true;
            } catch (e) {
              // Если surroundContents не работает, используем другой метод
              const contents = range.extractContents();
              
              // Обрабатываем содержимое
              if (contents.nodeType === Node.TEXT_NODE) {
                // Если это текстовый узел, просто оборачиваем
                span.textContent = contents.textContent || '';
                range.insertNode(span);
              } else {
                // Если это элементы, оборачиваем их
                span.appendChild(contents);
                range.insertNode(span);
              }
              
              // Обновляем выделение
              const newRange = document.createRange();
              newRange.selectNodeContents(span);
              selection?.removeAllRanges();
              selection?.addRange(newRange);
              success = true;
            }
          } else {
            // Нет выделения - применяем цвет к следующему вводу
            const span = document.createElement('span');
            span.style.color = color;
            span.style.setProperty('color', color, 'important');
            span.innerHTML = '\u200B'; // Zero-width space для сохранения форматирования
            range.insertNode(span);
            
            // Перемещаем курсор после span
            const newRange = document.createRange();
            newRange.setStartAfter(span);
            newRange.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(newRange);
            success = true;
          }
        } catch (e) {
          console.error('Error applying color with span:', e);
          // Пробуем через execCommand как запасной вариант
          try {
            document.execCommand('styleWithCSS', false, 'true');
            success = document.execCommand('foreColor', false, color);
          } catch (e2) {
            console.error('execCommand also failed:', e2);
          }
        }
      }
      
      if (success) {
        // Сохраняем новое выделение
        saveSelection();
        
        // Обновляем контент и состояние
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

  // Закрываем меню цвета при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorMenuOpen && !(event.target as Element).closest('.color-picker-wrapper')) {
        setColorMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [colorMenuOpen]);

  // Инициализация редактора
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
                  // Сохраняем выделение при открытии меню
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
                          // Сохраняем выделение перед кликом
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
