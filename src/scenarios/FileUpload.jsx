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

        // Mock logic for "Double Extension" since real browser file input sanitizes some things, 
        // but we can check the string name.
        if (name.match(/\.(jpg|png|gif)\.exe$/i) || name.includes('.jpg.php')) {
            addLog({ type: 'success', message: 'Security: Double extension malware detected!', edgeCaseId: 'double-ext' });
            return;
        }

        // Mock "0 byte" file (simulated by checking if empty or very small)
        if (size === 0) {
            addLog({ type: 'success', message: 'Edge Case: Empty (0 byte) file.', edgeCaseId: 'zero-byte' });
            return;
        }

        // Mock "Large File" - let's say 5MB limit
        if (size > 5 * 1024 * 1024) {
            addLog({ type: 'success', message: 'Validation: File too large (>5MB).', edgeCaseId: 'large-file' });
            return;
        }

        if (name.length > 50) {
            addLog({ type: 'success', message: 'Edge Case: Filename exceptionally long.', edgeCaseId: 'long-name' });
            return;
        }

        // Check type
        if (!type.startsWith('image/')) {
            addLog({ type: 'success', message: 'Validation: Invalid file type (Not an image).', edgeCaseId: 'wrong-type' });
            return;
        }

        addLog({ type: 'info', message: 'Upload successful.' });
        if (type.startsWith('image/') && size > 0 && size < 5 * 1024 * 1024) {
            // Mark as valid upload found ?? Maybe not needed for edge case list but good for completeness
            // We can add a hidden requirement for "Valid File" if we want
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

    // Simulation buttons for users who don't have these specific files handy
    const simulateUpload = (type) => {
        let mockFile = { name: 'test.jpg', size: 1024, type: 'image/jpeg' };

        switch (type) {
            case 'exe':
                mockFile = { name: 'vacation.jpg.exe', size: 1024, type: 'application/x-msdownload' };
                break;
            case 'txt':
                mockFile = { name: 'notes.txt', size: 1024, type: 'text/plain' };
                break;
            case 'large':
                mockFile = { name: 'hd-movie.mp4', size: 10 * 1024 * 1024, type: 'video/mp4' };
                break;
            case 'empty':
                mockFile = { name: 'empty.jpg', size: 0, type: 'image/jpeg' };
                break;
            case 'long':
                mockFile = { name: 'this_is_a_very_very_long_filename_that_might_cause_buffer_overflows_on_old_systems_123456789.jpg', size: 1024, type: 'image/jpeg' };
                break;
            default:
                break;
        }
        handleFiles([mockFile]);
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

            <div className="mt-8 border-t pt-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Quick Test (Simulate)</p>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => simulateUpload('exe')} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 py-2 px-3 rounded border border-red-200 transition">
                        Simulate .jpg.exe
                    </button>
                    <button onClick={() => simulateUpload('txt')} className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 py-2 px-3 rounded border border-orange-200 transition">
                        Simulate .txt file
                    </button>
                    <button onClick={() => simulateUpload('large')} className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-2 px-3 rounded border border-yellow-200 transition">
                        Simulate 10MB File
                    </button>
                    <button onClick={() => simulateUpload('empty')} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded border border-gray-200 transition">
                        Simulate 0 Byte File
                    </button>
                    <button onClick={() => simulateUpload('long')} className="col-span-2 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-3 rounded border border-purple-200 transition">
                        Simulate Long Filename
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
