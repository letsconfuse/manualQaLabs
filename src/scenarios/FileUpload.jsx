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

    const handleFiles = (files) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        const name = file.name;
        const size = file.size; // in bytes
        const type = file.type;

        addLog({ type: 'info', message: `Attempting to upload: "${name}" (${(size / 1024).toFixed(2)} KB)` });

        // 1. SQL Injection Check
        // Detects common SQL injection patterns in filenames
        if (name.match(/['";]+.*(drop|select|update|delete|insert|alter|exec).*/i)) {
            addLog({ type: 'success', message: 'CRITICAL: SQL Injection attempt detected in filename!', edgeCaseId: 'sqli-name' });
            return;
        }

        // 2. XSS Payload Check (SVG/HTML)
        // Checks if the file is an SVG or HTML which can carry XSS payloads
        if (type.includes('svg') || type.includes('html') || name.match(/\.(svg|html|htm)$/i)) {
            addLog({ type: 'success', message: 'SECURITY: XSS Risk detected (SVG/HTML upload blocked).', edgeCaseId: 'xss-file' });
            return;
        }

        // 3. Double Extension Check
        // Mock logic for "Double Extension" since real browser file input sanitizes some things, 
        // but we can check the string name.
        if (name.match(/\.(jpg|png|gif)\.exe$/i) || name.includes('.jpg.php')) {
            addLog({ type: 'success', message: 'Security: Double extension malware detected!', edgeCaseId: 'double-ext' });
            return;
        }

        // 4. Empty File Check
        // Mock "0 byte" file (simulated by checking if empty or very small)
        if (size === 0) {
            addLog({ type: 'success', message: 'Edge Case: Empty (0 byte) file.', edgeCaseId: 'zero-byte' });
            return;
        }

        // 5. Large File Check
        // Mock "Large File" - let's say 5MB limit
        if (size > 5 * 1024 * 1024) {
            addLog({ type: 'success', message: 'Validation: File too large (>5MB).', edgeCaseId: 'large-file' });
            return;
        }

        // 6. Long Filename Check
        if (name.length > 50) {
            addLog({ type: 'success', message: 'Edge Case: Filename exceptionally long.', edgeCaseId: 'long-name' });
            return;
        }

        // 7. Invalid File Type Check
        if (!type.startsWith('image/')) {
            addLog({ type: 'success', message: 'Validation: Invalid file type (Not an image).', edgeCaseId: 'wrong-type' });
            return;
        }

        addLog({ type: 'info', message: 'Upload successful.' });
        if (type.startsWith('image/') && size > 0 && size < 5 * 1024 * 1024) {
            // Valid file success
        }
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
        <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg text-slate-900">
            <h3 className="text-xl font-bold mb-4">Upload Profile Picture</h3>

            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary/50'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-2">Drag & drop your file here, or click to browse</p>
                <p className="text-xs text-gray-400">Supported: JPG, PNG (Max 5MB)</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 text-primary font-semibold hover:underline text-sm"
                >
                    Browse Files
                </button>
            </div>
        </div>
    );
};

export default FileUpload;
