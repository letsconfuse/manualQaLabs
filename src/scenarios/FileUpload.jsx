import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

export const FileUploadConfig = {
    id: 'file-upload',
    title: 'The File Upload',
    description: 'Upload a picture. Test file types, size, and double extensions.',
    type: 'security',
    difficulty: 'Medium',
    requirements: [
        { id: 'wrong-type', title: 'Invalid File Type (.txt/.pdf)', explanation: 'System should only accept images.' },
        { id: 'double-ext', title: 'Double Extension (.jpg.exe)', explanation: 'Classic malware disguise technique.' },
        { id: 'large-file', title: 'File Too Large (>5MB)', explanation: 'Prevent DOS attacks or storage issues.' },
        { id: 'zero-byte', title: 'Empty File (0 bytes)', explanation: 'Files with no content can crash parsers.' },
        { id: 'long-name', title: 'Filename Too Long', explanation: 'Buffer overflow or filesystem errors.' },
        { id: 'sqli-name', title: 'SQL Injection in Filename', explanation: 'Prevent database attacks via filenames like "test\'; DROP TABLE users;.jpg".' },
        { id: 'xss-file', title: 'XSS Payload (SVG/HTML)', explanation: 'Prevent Cross-Site Scripting via uploaded SVG or HTML files.' },
        { id: 'valid', title: 'Valid Image', explanation: 'Standard .jpg or .png file.' },
    ]
};

const FileUpload = ({ addLog }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [scanStatus, setScanStatus] = useState('idle'); // idle, scanning, clean, infected
    const [progress, setProgress] = useState(0);
    const [currentFile, setCurrentFile] = useState(null);

    const startScan = (file) => {
        setScanStatus('scanning');
        setProgress(0);
        setCurrentFile(file);
        addLog({ type: 'info', message: `Initiating security scan for: "${file.name}"...` });

        // Simulate network/scan delay
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
        const size = file.size; // in bytes
        const type = file.type;

        let detected = false;
        let malwareType = '';

        // 1. SQL Injection Check
        if (name.match(/['";]+.*(drop|select|update|delete|insert|alter|exec).*/i)) {
            detected = true;
            malwareType = 'SQL Injection Pattern';
            addLog({ type: 'success', message: 'CRITICAL: SQL Injection attempt detected in filename!', edgeCaseId: 'sqli-name' });
        }

        // 2. XSS Payload Check (SVG/HTML)
        else if (type.includes('svg') || type.includes('html') || name.match(/\.(svg|html|htm)$/i)) {
            detected = true;
            malwareType = 'XSS Payload (SVG/HTML)';
            addLog({ type: 'success', message: 'SECURITY: XSS Risk detected (SVG/HTML upload blocked).', edgeCaseId: 'xss-file' });
        }

        // 3. Double Extension Check
        else if (name.match(/\.(jpg|png|gif)\.exe$/i) || name.includes('.jpg.php')) {
            detected = true;
            malwareType = 'Double Extension Malware';
            addLog({ type: 'success', message: 'Security: Double extension malware detected!', edgeCaseId: 'double-ext' });
        }

        // 4. Empty File Check
        else if (size === 0) {
            detected = true;
            malwareType = 'Zero-Byte File';
            addLog({ type: 'success', message: 'Edge Case: Empty (0 byte) file.', edgeCaseId: 'zero-byte' });
        }

        // 5. Large File Check
        else if (size > 5 * 1024 * 1024) {
            detected = true;
            malwareType = 'Oversized File (>5MB)';
            addLog({ type: 'success', message: 'Validation: File too large (>5MB).', edgeCaseId: 'large-file' });
        }

        // 6. Long Filename Check
        else if (name.length > 50) {
            detected = true;
            malwareType = 'Buffer Overflow detected';
            addLog({ type: 'success', message: 'Edge Case: Filename exceptionally long.', edgeCaseId: 'long-name' });
        }

        // 7. Invalid File Type Check
        else if (!type.startsWith('image/')) {
            detected = true;
            malwareType = 'Invalid MIME Type';
            addLog({ type: 'success', message: 'Validation: Invalid file type (Not an image).', edgeCaseId: 'wrong-type' });
        }

        if (detected) {
            setScanStatus('infected');
            addLog({ type: 'error', message: `THREAT ELIMINATED: ${malwareType}` });
        } else {
            setScanStatus('clean');
            addLog({ type: 'info', message: 'Scan Complete: File is clean and uploaded.' });
            // Valid file success - visual feedback only
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

    // Drag and Drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
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
        <div className="w-full max-w-lg bg-surface border border-theme p-0 rounded-xl shadow-3d overflow-hidden transition-colors relative">
            {/* Overlay for Scanning/Infected States */}
            <div className={`absolute inset-0 z-20 bg-surface/90 backdrop-blur flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ${scanStatus === 'idle' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                {scanStatus === 'scanning' && (
                    <div className="w-full">
                        <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-primary-color animate-pulse">Scanning File...</h3>
                        <p className="text-secondary-color text-xs mb-4">{currentFile?.name}</p>
                        <div className="w-full bg-body h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-primary transition-all duration-200" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="text-right text-xs font-mono text-accent mt-1">{progress}%</div>
                    </div>
                )}

                {scanStatus === 'infected' && (
                    <div className="animate-bounceIn">
                        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                            <X className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-black text-red-500 mb-2">THREAT DETECTED</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">The antivirus engine has blocked this file.</p>
                    </div>
                )}

                {scanStatus === 'clean' && (
                    <div className="animate-bounceIn">
                        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.6)]">
                            <Upload className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-emerald-500 mb-2">UPLOAD COMPLETE</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">File passed all security checks.</p>
                    </div>
                )}
            </div>

            <div className="bg-surface hover-bg-surface p-6 border-b border-theme">
                <h3 className="text-xl font-bold text-primary-color flex items-center gap-2">
                    <span className="text-2xl">📂</span> Upload Profile Picture
                </h3>
                <p className="text-secondary-color text-xs mt-1">Upload your best selfie... carefully.</p>
            </div>

            <div className="p-6">
                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive ? 'border-accent-primary bg-accent-primary/10' : 'border-theme bg-body hover:bg-surface hover:border-accent-primary/50'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <Upload className={`mx-auto h-12 w-12 mb-3 transition-colors ${dragActive ? 'text-accent' : 'text-secondary-color'}`} />
                    <p className="text-sm text-primary-color mb-2 font-medium">Drag & drop your file here, or click to browse</p>
                    <p className="text-xs text-secondary-color mb-4">Supported: JPG, PNG (Max 5MB)</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleChange}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-3d-primary font-bold py-2 px-6 rounded-lg shadow-lg active:scale-[0.98] text-sm"
                    >
                        Browse Files
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
