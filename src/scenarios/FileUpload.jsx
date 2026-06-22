import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Upload, X, HelpCircle, ChevronDown, Shield, FileText } from 'lucide-react';

export const FileUploadConfig = {
    id: 'file-upload',
    title: 'The File Upload',
    description: 'Verify access controls on a profile picture upload system. The system accepts JPG and PNG images up to 5MB. Test for file type restrictions, size limits, naming exploits, and malicious content vectors.',
    type: 'security',
    difficulty: 'Medium',
    requirements: [
        { id: 'valid', title: 'Valid Image Upload', explanation: 'Standard .jpg or .png file within size limits passes all checks.' },
        { id: 'wrong-type', title: 'Invalid File Type', explanation: 'System should only accept images — non-image files must be rejected.' },
        { id: 'double-ext', title: 'Double Extension Disguise', explanation: 'Classic malware disguise technique using filenames like photo.jpg.exe.' },
        { id: 'large-file', title: 'Oversized File (>5MB)', explanation: 'Files exceeding the size limit can cause storage or performance issues.' },
        { id: 'zero-byte', title: 'Empty File (0 bytes)', explanation: 'Files with no content can crash parsers or bypass validation.' },
        { id: 'long-name', title: 'Excessively Long Filename', explanation: 'Buffer overflow or filesystem path length errors.' },
        { id: 'special-name', title: 'Special Characters in Filename', explanation: 'Filenames with characters like !@#$%^&() can break storage or display logic.' },
        { id: 'sqli-name', title: 'SQL Injection in Filename', explanation: 'Filenames containing SQL syntax can exploit database storage queries.' },
        { id: 'xss-file', title: 'XSS Payload (SVG/HTML)', explanation: 'SVG and HTML files can contain executable scripts that enable Cross-Site Scripting.' },
        { id: 'path-traversal', title: 'Path Traversal in Filename', explanation: 'Filenames like ../../etc/passwd attempt to write files outside the upload directory.' },
    ]
};

const HELP_AREAS = [
    {
        area: 'Accepted File Types',
        hint1: 'The system claims to accept only images. What happens if you upload something else?',
        hint2: 'Try uploading a .txt, .pdf, or .exe file to test the MIME type and extension whitelist.',
    },
    {
        area: 'Size Boundaries',
        hint1: 'There is a maximum file size. Test what happens at and beyond the limit.',
        hint2: 'Try uploading a file larger than 5MB to trigger the size restriction.',
    },
    {
        area: 'Empty & Edge Files',
        hint1: 'What if the uploaded file has no content at all?',
        hint2: 'Create a 0-byte file and upload it. Some parsers crash or silently accept empty files.',
    },
    {
        area: 'Filename Exploits',
        hint1: 'Filenames are user input too. Are they validated or sanitized?',
        hint2: 'Try filenames with double extensions (.jpg.exe), SQL syntax (\'; DROP TABLE), or extreme length (50+ chars).',
    },
    {
        area: 'Script Injection via Files',
        hint1: 'Some file formats can contain executable code. Are they blocked?',
        hint2: 'Try uploading an SVG or HTML file — these formats can embed JavaScript payloads.',
    },
    {
        area: 'Path Traversal',
        hint1: 'Filenames can include directory navigation characters. Can an attacker escape the upload folder?',
        hint2: 'Try uploading a file with a name like ../../etc/passwd or ../config.json.',
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Help overlay component
// ─────────────────────────────────────────────────────────────────────────────
const HelpOverlay = ({ onClose }) => {
    const [expanded, setExpanded] = useState({});
    const [revealed, setRevealed] = useState({});

    const toggle = (i) => setExpanded(p => ({ ...p, [i]: !p[i] }));
    const reveal = (i) => setRevealed(p => ({ ...p, [i]: (p[i] || 0) + 1 }));

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
            <div className="w-full max-w-lg bg-surface border border-theme rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-theme bg-body">
                    <div className="flex items-center gap-2.5">
                        <HelpCircle className="w-5 h-5 text-sky-500" />
                        <div>
                            <p className="text-sm font-bold text-primary-color">Testing Guide</p>
                            <p className="text-xs text-secondary-color">Click an area for a clue. Reveal more if you're stuck.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-secondary-color hover:text-primary-color transition-colors p-1 rounded-lg hover:bg-body">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Shortcut badge */}
                <div className="px-5 py-2.5 border-b border-theme flex items-center gap-2 text-xs text-secondary-color">
                    <span>Shortcut to open this:</span>
                    <span className="px-1.5 py-0.5 bg-body border border-theme rounded text-primary-color font-mono font-semibold">Shift</span>
                    <span>+</span>
                    <span className="px-1.5 py-0.5 bg-body border border-theme rounded text-primary-color font-mono font-semibold">Alt</span>
                    <span>+</span>
                    <span className="px-1.5 py-0.5 bg-body border border-theme rounded text-primary-color font-mono font-semibold">H</span>
                    <span className="mx-2 text-theme">·</span>
                    <span>or triple-click the header icon</span>
                </div>

                {/* Areas */}
                <div className="overflow-y-auto max-h-[60vh] divide-y divide-theme">
                    {HELP_AREAS.map((item, i) => (
                        <div key={i} className="px-5 py-3">
                            <button
                                type="button"
                                onClick={() => toggle(i)}
                                className="w-full flex items-center justify-between text-left group"
                            >
                                <span className="text-sm font-medium text-primary-color group-hover:text-sky-400 transition-colors">{item.area}</span>
                                <ChevronDown className={`w-4 h-4 text-secondary-color transition-transform ${expanded[i] ? 'rotate-180' : ''}`} />
                            </button>

                            {expanded[i] && (
                                <div className="mt-3 space-y-2">
                                    <div className="bg-body border border-theme rounded-xl p-3 text-xs text-secondary-color">
                                        <span className="text-sky-400 font-semibold block mb-0.5">Clue →</span>
                                        {item.hint1}
                                    </div>

                                    {(revealed[i] || 0) >= 1 ? (
                                        <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3 text-xs text-sky-300">
                                            <span className="font-semibold block mb-0.5">Detailed hint →</span>
                                            {item.hint2}
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => reveal(i)}
                                            className="text-xs text-secondary-color hover:text-sky-400 transition-colors underline underline-offset-2"
                                        >
                                            Still stuck? Reveal a more detailed hint
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// FileUpload Scenario
// ─────────────────────────────────────────────────────────────────────────────
const FileUpload = ({ addLog }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, clean, infected
    const [progress, setProgress] = useState(0);
    const [currentFile, setCurrentFile] = useState(null);
    const [showHelp, setShowHelp] = useState(false);

    const iconClicks = useRef(0);
    const clickTimer = useRef(null);

    // Keyboard shortcut to open help
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.shiftKey && e.altKey && e.key.toLowerCase() === 'h') {
                e.preventDefault();
                setShowHelp(p => !p);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Triple click handler for help
    const handleIconClick = () => {
        iconClicks.current += 1;
        clearTimeout(clickTimer.current);
        clickTimer.current = setTimeout(() => {
            iconClicks.current = 0;
        }, 700);

        if (iconClicks.current >= 3) {
            iconClicks.current = 0;
            setShowHelp(p => !p);
        }
    };

    const startScan = (file) => {
        setScanStatus('scanning');
        setProgress(0);
        setCurrentFile(file);
        addLog({ type: 'info', message: `Initiating security scan for: "${file.name}"...` });

        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15;
            if (p > 100) {
                p = 100;
                clearInterval(interval);
                validateFile(file);
            }
            setProgress(Math.min(100, Math.round(p)));
        }, 200);
    };

    const validateFile = (file) => {
        const name = file.name;
        const size = file.size;
        const type = file.type;

        let detected = false;
        let threatType = '';

        // 1. Path Traversal Check
        if (name.includes('../') || name.includes('..\\') || name.includes('/etc/') || name.includes('\\windows\\')) {
            detected = true;
            threatType = 'Path Traversal Attack';
            addLog({ type: 'success', message: `✅ Path traversal attempt blocked: "${name}"`, edgeCaseId: 'path-traversal' });
        }

        // 2. SQL Injection in Filename Check
        else if (name.match(/['";\-\-]+.*(drop|select|update|delete|insert|alter|exec)/i)) {
            detected = true;
            threatType = 'SQL Injection in Filename';
            addLog({ type: 'success', message: `✅ SQL Injection attempt detected in filename: "${name}"`, edgeCaseId: 'sqli-name' });
        }

        // 3. XSS Payload Check (SVG/HTML files)
        else if (type.includes('svg') || type.includes('html') || name.match(/\.(svg|html|htm)$/i)) {
            detected = true;
            threatType = 'XSS Payload (SVG/HTML)';
            addLog({ type: 'success', message: `✅ XSS risk blocked: SVG/HTML file "${name}"`, edgeCaseId: 'xss-file' });
        }

        // 4. Double Extension Check
        else if (name.match(/\.(jpg|jpeg|png|gif|bmp)\.(exe|php|js|bat|cmd|sh|py|rb|pl)$/i)) {
            detected = true;
            threatType = 'Double Extension Malware';
            addLog({ type: 'success', message: `✅ Double extension malware detected: "${name}"`, edgeCaseId: 'double-ext' });
        }

        // 5. Empty File Check
        else if (size === 0) {
            detected = true;
            threatType = 'Zero-Byte File';
            addLog({ type: 'success', message: `✅ Empty file (0 bytes) detected: "${name}"`, edgeCaseId: 'zero-byte' });
        }

        // 6. File Too Large Check
        else if (size > 5 * 1024 * 1024) {
            detected = true;
            threatType = 'Oversized File (>5MB)';
            addLog({ type: 'success', message: `✅ File exceeds 5MB size limit (${(size / 1024 / 1024).toFixed(2)} MB).`, edgeCaseId: 'large-file' });
        }

        // 7. Long Filename Check
        else if (name.length > 50) {
            detected = true;
            threatType = 'Filename Buffer Overflow';
            addLog({ type: 'success', message: `✅ Filename too long (${name.length} chars): "${name.substring(0, 30)}..."`, edgeCaseId: 'long-name' });
        }

        // 8. Special Characters in Filename Check
        else if (/[!@#$%^&()+=\[\]{}'`~]/.test(name)) {
            detected = true;
            threatType = 'Special Characters in Filename';
            addLog({ type: 'success', message: `✅ Special characters detected in filename: "${name}"`, edgeCaseId: 'special-name' });
        }

        // 9. Invalid File Type Check (not an image)
        else if (!type.startsWith('image/')) {
            detected = true;
            threatType = 'Invalid MIME Type';
            addLog({ type: 'success', message: `✅ Invalid file type rejected (${type || 'unknown'}): "${name}"`, edgeCaseId: 'wrong-type' });
        }

        // Results
        if (detected) {
            setScanStatus('infected');
            addLog({ type: 'error', message: `THREAT BLOCKED: ${threatType}` });
        } else {
            setScanStatus('clean');
            addLog({ type: 'success', message: `✅ Valid image uploaded successfully: "${name}"`, edgeCaseId: 'valid' });
        }

        // Reset after 3 seconds
        setTimeout(() => {
            setScanStatus('idle');
            setProgress(0);
            setCurrentFile(null);
        }, 3000);
    };

    const handleFiles = (files) => {
        if (!files || files.length === 0) return;
        startScan(files[0]);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    return (
        <>
            {showHelp && createPortal(<HelpOverlay onClose={() => setShowHelp(false)} />, document.body)}

            <div className="flex items-center justify-center min-h-full p-6 bg-body">
                <div className="w-full max-w-sm bg-surface border border-theme rounded-2xl shadow-xl relative transition-all overflow-hidden">

                    {/* Scan overlay */}
                    <div className={`absolute inset-0 z-20 bg-surface/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ${scanStatus === 'idle' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        {scanStatus === 'scanning' && (
                            <div className="w-full">
                                <div className="w-14 h-14 border-[3px] border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <h3 className="text-base font-bold text-primary-color animate-pulse mb-1">Scanning File...</h3>
                                <p className="text-secondary-color text-xs mb-4 truncate max-w-[250px] mx-auto">{currentFile?.name}</p>
                                <div className="w-full bg-body h-1.5 rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500 transition-all duration-200 rounded-full" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="text-right text-[10px] font-mono text-secondary-color mt-1">{progress}%</div>
                            </div>
                        )}

                        {scanStatus === 'infected' && (
                            <div className="animate-fadeIn">
                                <div className="w-16 h-16 bg-rose-500/10 border-2 border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <X className="w-8 h-8 text-rose-400" />
                                </div>
                                <h3 className="text-lg font-bold text-rose-400 mb-1">Threat Detected</h3>
                                <p className="text-secondary-color text-xs">The security engine has blocked this file.</p>
                            </div>
                        )}

                        {scanStatus === 'clean' && (
                            <div className="animate-fadeIn">
                                <div className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Upload className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-bold text-emerald-400 mb-1">Upload Complete</h3>
                                <p className="text-secondary-color text-xs">File passed all security checks.</p>
                            </div>
                        )}
                    </div>

                    {/* Header */}
                    <div className="text-center p-6 pb-0">
                        <button
                            type="button"
                            onClick={handleIconClick}
                            title="Click 3× for help"
                            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 mb-4 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                        >
                            <Shield className="w-7 h-7" />
                        </button>
                        <h2 className="text-xl font-bold text-primary-color">Upload Profile Picture</h2>
                        <p className="text-secondary-color text-xs mt-1">Select or drop a file to begin the security scan.</p>
                    </div>

                    {/* Upload zone */}
                    <div className="p-6">
                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                                dragActive
                                    ? 'border-sky-500 bg-sky-500/5'
                                    : 'border-theme bg-body hover:border-sky-500/40 hover:bg-surface'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className={`mx-auto h-10 w-10 mb-3 transition-colors ${dragActive ? 'text-sky-400' : 'text-secondary-color/40'}`} />
                            <p className="text-sm text-primary-color font-medium mb-1">Drag & drop your file here</p>
                            <p className="text-xs text-secondary-color">or click to browse</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6">
                        <p className="text-center text-xs text-secondary-color">
                            Need a clue?{' '}
                            <button
                                type="button"
                                onClick={() => setShowHelp(true)}
                                className="text-sky-400 hover:text-sky-300 transition-colors underline underline-offset-2"
                            >
                                Open testing guide
                            </button>
                            {' '}or press{' '}
                            <span className="font-mono text-primary-color">Shift+Alt+H</span>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FileUpload;
