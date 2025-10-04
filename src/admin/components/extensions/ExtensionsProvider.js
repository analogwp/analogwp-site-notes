/**
 * WordPress dependencies
 */
import { createContext, useContext, useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Plugin Extensions Context
 * 
 * Provides a foundation for future plugin extensibility.
 * This system allows for seamless integration with future add-ons while
 * maintaining WordPress.org compliance (no upgrade prompts or upselling).
 * 
 * The extensibility hooks work in the background and can be utilized
 * by separate plugins without showing any promotional content.
 */
const ExtensionsContext = createContext();

export const useExtensions = () => {
    const context = useContext(ExtensionsContext);
    if (!context) {
        throw new Error('useExtensions must be used within an ExtensionsProvider');
    }
    return context;
};

// Extensions Provider Component
export const ExtensionsProvider = ({ children }) => {
    const [registeredTabs, setRegisteredTabs] = useState([]);
    const [registeredFields, setRegisteredFields] = useState({});
    const [proFeatures, setProFeatures] = useState({});
    const [isProActive, setIsProActive] = useState(false);

    useEffect(() => {
        // Check if pro plugin is active
        checkProPluginStatus();
        
        // Listen for pro plugin registration
        if (window.chtExtensions) {
            loadExtensions();
        }
        
        // Set up event listener for dynamic pro plugin loading
        document.addEventListener('cht-pro-loaded', loadExtensions);
        
        return () => {
            document.removeEventListener('cht-pro-loaded', loadExtensions);
        };
    }, []);

    const checkProPluginStatus = () => {
        // Check if pro plugin is active via global flag or AJAX
        const proActive = window.agwpChtAjax?.isProActive || false;
        setIsProActive(proActive);
    };

    const loadExtensions = () => {
        if (window.chtExtensions) {
            const extensions = window.chtExtensions;
            
            // Register pro tabs
            if (extensions.tabs) {
                setRegisteredTabs(extensions.tabs);
            }
            
            // Register pro fields for existing tabs
            if (extensions.fields) {
                setRegisteredFields(extensions.fields);
            }
            
            // Register pro features
            if (extensions.features) {
                setProFeatures(extensions.features);
            }
            
            setIsProActive(true);
        }
    };

    const registerTab = (tab) => {
        setRegisteredTabs(prev => {
            const exists = prev.find(t => t.id === tab.id);
            if (exists) {
                return prev.map(t => t.id === tab.id ? { ...t, ...tab } : t);
            }
            return [...prev, tab];
        });
    };

    const registerFields = (tabId, fields) => {
        setRegisteredFields(prev => ({
            ...prev,
            [tabId]: {
                ...prev[tabId],
                ...fields
            }
        }));
    };

    const isFeatureAvailable = (featureName) => {
        return isProActive && proFeatures[featureName];
    };

    const value = {
        registeredTabs,
        registeredFields,
        proFeatures,
        isProActive,
        registerTab,
        registerFields,
        isFeatureAvailable
    };

    return (
        <ExtensionsContext.Provider value={value}>
            {children}
        </ExtensionsContext.Provider>
    );
};

// HOC for pro feature gating (simplified for WordPress.org compliance)
export const withProFeature = (WrappedComponent, featureName) => {
    return (props) => {
        const { isFeatureAvailable } = useExtensions();
        
        // Always render the component (no upgrade prompts for WordPress.org compliance)
        return <WrappedComponent {...props} />;
    };
};

export default ExtensionsProvider;