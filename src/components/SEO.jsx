import { useEffect } from 'react';

const SEO = ({ title, description, type = 'website' }) => {
    useEffect(() => {
        // Update Title
        document.title = title;

        // Helper to update meta tags
        const updateMeta = (name, content, attribute = 'name') => {
            let element = document.querySelector(`meta[${attribute}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(attribute, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Update Meta Tags
        if (description) {
            updateMeta('description', description);
            updateMeta('og:description', description, 'property');
        }

        updateMeta('og:title', title, 'property');
        updateMeta('og:type', type, 'property');

    }, [title, description, type]);

    return null;
};

export default SEO;
