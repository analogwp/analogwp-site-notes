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
    const [extFeatures, setExtFeatures] = useState({});
    const [isExtActive, setIsExtActive] = useState(false);

    useEffect(() => {
        // Check if ext plugin is active
        checkExtPluginStatus();
        
        // Listen for ext plugin registration
        if (window.snExtensions) {
            loadExtensions();
        }
        
        // Set up event listener for dynamic ext plugin loading
        document.addEventListener('sn-ext-loaded', loadExtensions);
        
        return () => {
            document.removeEventListener('sn-ext-loaded', loadExtensions);
        };
    }, []);

    const checkExtPluginStatus = () => {
        // Check if ext plugin is active via global flag or AJAX
        const extActive = window.agwp_sn_ajax?.isExtActive || false;
        setIsExtActive(extActive);
    };

    const loadExtensions = () => {
        if (window.snExtensions) {
            const extensions = window.snExtensions;
            
            // Register ext tabs
            if (extensions.tabs) {
                setRegisteredTabs(extensions.tabs);
            }
            
            // Register ext fields for existing tabs
            if (extensions.fields) {
                setRegisteredFields(extensions.fields);
            }
            
            // Register ext features
            if (extensions.features) {
                setExtFeatures(extensions.features);
            }
            
            setIsExtActive(true);
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
        return isExtActive && extFeatures[featureName];
    };

    const value = {
        registeredTabs,
        registeredFields,
        extFeatures,
        isExtActive,
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