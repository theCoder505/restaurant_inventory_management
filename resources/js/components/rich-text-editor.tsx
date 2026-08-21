import React, { useEffect, useRef, useState } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Code,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link as LinkIcon,
    Unlink,
    Minus,
    RotateCcw,
    RotateCw,
    RemoveFormatting,
    CodeXml,
    Eye,
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
    className?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Write recipe ingredients, preparation instructions, allergy notes, etc...',
    minHeight = '240px',
    className = '',
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isSourceMode, setIsSourceMode] = useState(false);
    const [sourceContent, setSourceContent] = useState(value || '');
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [savedSelection, setSavedSelection] = useState<Range | null>(null);

    // Sync external value with editor when it changes externally
    useEffect(() => {
        if (editorRef.current && !isSourceMode) {
            if (editorRef.current.innerHTML !== (value || '')) {
                editorRef.current.innerHTML = value || '';
            }
        }
        setSourceContent(value || '');
    }, [value, isSourceMode]);

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            // Treat empty paragraph or break as empty string
            const cleaned = html === '<p><br></p>' || html === '<br>' ? '' : html;
            onChange(cleaned);
            setSourceContent(cleaned);
        }
    };

    const exec = (command: string, value: string | undefined = undefined) => {
        if (isSourceMode) return;
        if (editorRef.current) {
            editorRef.current.focus();
        }
        document.execCommand(command, false, value);
        handleInput();
    };

    const handleFormatBlock = (tag: string) => {
        exec('formatBlock', `<${tag}>`);
    };

    // Save selection before opening link modal
    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            setSavedSelection(sel.getRangeAt(0).cloneRange());
            setLinkText(sel.toString());
        }
    };

    const restoreSelection = () => {
        if (savedSelection) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedSelection);
            }
        }
    };

    const openLinkModal = () => {
        saveSelection();
        setLinkUrl('');
        setShowLinkModal(true);
    };

    const applyLink = (e: React.FormEvent) => {
        e.preventDefault();
        setShowLinkModal(false);
        if (!linkUrl) return;

        if (editorRef.current) {
            editorRef.current.focus();
        }
        restoreSelection();

        let formattedUrl = linkUrl.trim();
        if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith('/') && !formattedUrl.startsWith('mailto:')) {
            formattedUrl = `https://${formattedUrl}`;
        }

        if (linkText && savedSelection && savedSelection.toString() === '') {
            exec('insertHTML', `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer" class="text-amber-600 underline dark:text-amber-400">${linkText}</a>`);
        } else {
            exec('createLink', formattedUrl);
        }
    };

    const removeLink = () => {
        exec('unlink');
    };

    const toggleSourceMode = () => {
        if (isSourceMode) {
            onChange(sourceContent);
            setIsSourceMode(false);
        } else {
            if (editorRef.current) {
                setSourceContent(editorRef.current.innerHTML);
            }
            setIsSourceMode(true);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            exec('insertHTML', '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    };

    // Calculate word & character counts
    const textContent = (editorRef.current?.innerText || sourceContent || '').trim();
    const charCount = textContent.length;
    const wordCount = textContent ? textContent.split(/\s+/).filter(Boolean).length : 0;

    return (
        <div className={`relative flex flex-col rounded-2xl border border-slate-300 bg-white text-slate-900 shadow-sm transition-all focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-900/80 rounded-t-2xl">
                {/* Text Formatting Group */}
                <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => exec('bold')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Bold (Ctrl+B)"
                    >
                        <Bold className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('italic')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Italic (Ctrl+I)"
                    >
                        <Italic className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('underline')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Underline (Ctrl+U)"
                    >
                        <Underline className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('strikeThrough')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Strikethrough"
                    >
                        <Strikethrough className="h-4 w-4" />
                    </button>
                </div>

                {/* Headings */}
                <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => handleFormatBlock('h2')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Heading 2"
                    >
                        <Heading1 className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFormatBlock('h3')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Heading 3"
                    >
                        <Heading2 className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFormatBlock('h4')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Heading 4"
                    >
                        <Heading3 className="h-4 w-4" />
                    </button>
                </div>

                {/* Lists & Quotes */}
                <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => exec('insertUnorderedList')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Bullet List"
                    >
                        <List className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('insertOrderedList')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Numbered List"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFormatBlock('blockquote')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Quote"
                    >
                        <Quote className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => handleFormatBlock('pre')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Code block"
                    >
                        <Code className="h-4 w-4" />
                    </button>
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => exec('justifyLeft')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Align Left"
                    >
                        <AlignLeft className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyCenter')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Align Center"
                    >
                        <AlignCenter className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyRight')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Align Right"
                    >
                        <AlignRight className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('justifyFull')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Justify"
                    >
                        <AlignJustify className="h-4 w-4" />
                    </button>
                </div>

                {/* Links & Divider */}
                <div className="flex items-center gap-0.5 border-r border-slate-200 pr-1.5 mr-1 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={openLinkModal}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Insert Link"
                    >
                        <LinkIcon className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={removeLink}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Remove Link"
                    >
                        <Unlink className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('insertHorizontalRule')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Horizontal Divider"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                </div>

                {/* History & Cleanup */}
                <div className="flex items-center gap-0.5">
                    <button
                        type="button"
                        onClick={() => exec('undo')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Undo"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('redo')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Redo"
                    >
                        <RotateCw className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => exec('removeFormat')}
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors"
                        title="Clear Formatting"
                    >
                        <RemoveFormatting className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={toggleSourceMode}
                        className={`rounded-lg p-1.5 transition-colors ${
                            isSourceMode
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                        }`}
                        title={isSourceMode ? 'Switch to Rich Editor' : 'Switch to HTML Code'}
                    >
                        {isSourceMode ? <Eye className="h-4 w-4" /> : <CodeXml className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1">
                {isSourceMode ? (
                    <textarea
                        value={sourceContent}
                        onChange={(e) => {
                            setSourceContent(e.target.value);
                            onChange(e.target.value);
                        }}
                        style={{ minHeight }}
                        className="w-full resize-y bg-slate-950 p-4 font-mono text-xs text-amber-300 focus:outline-none dark:bg-slate-950"
                        placeholder="Write HTML directly..."
                    />
                ) : (
                    <div
                        ref={editorRef}
                        contentEditable
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        style={{ minHeight }}
                        data-placeholder={placeholder}
                        className="prose prose-sm dark:prose-invert max-w-none p-4 text-xs focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:pointer-events-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-slate-500 [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-semibold [&_h4]:text-xs [&_h4]:font-semibold [&_pre]:bg-slate-900 [&_pre]:text-amber-300 [&_pre]:p-2.5 [&_pre]:rounded-lg [&_a]:text-amber-600 dark:[&_a]:text-amber-400 [&_a]:underline"
                    />
                )}
            </div>

            {/* Footer Status Bar */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-3 py-1.5 text-[10px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/50 rounded-b-2xl">
                <span>{isSourceMode ? 'HTML Source Mode' : 'Rich Text (No images allowed)'}</span>
                <div className="flex items-center gap-3">
                    <span>{wordCount} words</span>
                    <span>•</span>
                    <span>{charCount} characters</span>
                </div>
            </div>

            {/* Link Modal */}
            {showLinkModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Insert Hyperlink</h4>
                        <form onSubmit={applyLink} className="space-y-3 text-xs">
                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Link URL *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="https://example.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block font-medium text-slate-600 dark:text-slate-400">Link Text (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="Text to display"
                                    value={linkText}
                                    onChange={(e) => setLinkText(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowLinkModal(false)}
                                    className="rounded-xl bg-slate-200 px-3.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-amber-500 px-4 py-1.5 font-bold text-slate-950 hover:bg-amber-400"
                                >
                                    Apply Link
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
