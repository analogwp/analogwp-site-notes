/**
 * Logger utility for AnalogWP Site Notes
 * Provides conditional logging based on debug settings
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

const LEVEL_NAMES = {
    'debug': LOG_LEVELS.DEBUG,
    'info': LOG_LEVELS.INFO,
    'warning': LOG_LEVELS.WARN,
    'warn': LOG_LEVELS.WARN,
    'error': LOG_LEVELS.ERROR
};

/**
 * Get current log level from settings
 */
const getCurrentLogLevel = () => {
    const config = window.agwp_sn_ajax || {};
    const levelName = config.logLevel || 'error';
    return LEVEL_NAMES[levelName] ?? LOG_LEVELS.ERROR;
};

/**
 * Check if debug mode is enabled
 */
const isDebugEnabled = () => {
    return window.agwp_sn_ajax?.debug === true;
};

/**
 * Check if a message should be logged based on current settings
 */
const shouldLog = (level) => {
    if (!isDebugEnabled()) {
        return false;
    }
    return level >= getCurrentLogLevel();
};

/**
 * Format log message with context
 */
const formatMessage = (prefix, message, data) => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const formatted = `[SN ${timestamp}] ${prefix}:`;
    
    if (data !== undefined) {
        return [formatted, message, data];
    }
    return [formatted, message];
};

/**
 * Logger object with conditional logging methods
 */
const logger = {
    /**
     * Debug level logging - most verbose
     */
    debug: (message, data) => {
        if (shouldLog(LOG_LEVELS.DEBUG)) {
            console.log(...formatMessage('DEBUG', message, data));
        }
    },

    /**
     * Info level logging - general information
     */
    info: (message, data) => {
        if (shouldLog(LOG_LEVELS.INFO)) {
            console.info(...formatMessage('INFO', message, data));
        }
    },

    /**
     * Warning level logging - non-critical issues
     */
    warn: (message, data) => {
        if (shouldLog(LOG_LEVELS.WARN)) {
            console.warn(...formatMessage('WARN', message, data));
        }
    },

    /**
     * Error level logging - critical issues
     */
    error: (message, data) => {
        if (shouldLog(LOG_LEVELS.ERROR)) {
            console.error(...formatMessage('ERROR', message, data));
        }
    },

    /**
     * Log API responses
     */
    apiResponse: (endpoint, response) => {
        if (shouldLog(LOG_LEVELS.DEBUG)) {
            console.log(...formatMessage('API', `${endpoint} response`, response));
        }
    },

    /**
     * Log API errors
     */
    apiError: (endpoint, error) => {
        if (shouldLog(LOG_LEVELS.ERROR)) {
            console.error(...formatMessage('API ERROR', endpoint, error));
        }
    },

    /**
     * Always log critical errors (ignores debug setting)
     */
    critical: (message, data) => {
        console.error(...formatMessage('CRITICAL', message, data));
    },

    /**
     * Log navigation/routing
     */
    navigation: (message, data) => {
        if (shouldLog(LOG_LEVELS.DEBUG)) {
            console.log(...formatMessage('NAV', message, data));
        }
    },

    /**
     * Log user actions
     */
    action: (message, data) => {
        if (shouldLog(LOG_LEVELS.INFO)) {
            console.log(...formatMessage('ACTION', message, data));
        }
    }
};

export default logger;
