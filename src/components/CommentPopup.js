/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import html2canvas from 'html2canvas';
import Draggable from 'react-draggable';

const CommentPopup = ({ position, onSave, onCancel, selectedElement }) => {
    const [comment, setComment] = useState('');
    const [priority, setPriority] = useState('medium');
    const [isLoading, setIsLoading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Calculate popup position to keep it within viewport
    const getPopupStyle = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const popupWidth = 380; // Increased to match sidebar width
        const popupHeight = 300; // Estimated height
        const margin = 20; // Margin from screen edges
        
        // Start with the click position, but adjust for viewport boundaries
        let left = position.x - window.pageXOffset; // Convert to viewport coordinates
        let top = position.y - window.pageYOffset;  // Convert to viewport coordinates
        
        // Ensure popup doesn't overflow right edge
        if (left + popupWidth > viewportWidth - margin) {
            left = viewportWidth - popupWidth - margin;
        }
        
        // Ensure popup doesn't overflow left edge
        if (left < margin) {
            left = margin;
        }
        
        // Ensure popup doesn't overflow bottom edge
        if (top + popupHeight > viewportHeight - margin) {
            top = viewportHeight - popupHeight - margin;
        }
        
        // Ensure popup doesn't overflow top edge
        if (top < margin) {
            top = margin;
        }
        
        return {
            position: 'fixed',
            left: `${left}px`,
            top: `${top}px`,
            zIndex: 100001,
            maxHeight: `${viewportHeight - (top + margin)}px` // Ensure content fits
        };
    };

    // Capture screenshot of the area around the click point
    const captureScreenshot = async () => {
        // Store original scroll position at the very beginning
        const originalScrollTop = window.pageYOffset;
        const originalScrollLeft = window.pageXOffset;
        
        try {
            console.log('Starting centered screenshot capture at position:', position);

            // Get the full page dimensions
            const fullWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
            const fullHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
            
            // Calculate 512x512 area centered on click position
            const captureSize = 512;
            const centerX = position.x; // Already includes scroll offset from VisualCommentsApp
            const centerY = position.y; // Already includes scroll offset from VisualCommentsApp
            
            // Calculate capture bounds, ensuring we don't go outside the document
            const startX = Math.max(0, centerX - captureSize / 2);
            const startY = Math.max(0, centerY - captureSize / 2);
            const endX = Math.min(fullWidth, startX + captureSize);
            const endY = Math.min(fullHeight, startY + captureSize);
            
            // Adjust if we hit document boundaries
            const actualWidth = endX - startX;
            const actualHeight = endY - startY;
            
            console.log('Capture area:', { 
                startX, startY, 
                actualWidth, actualHeight,
                centerX, centerY 
            });

            // Scroll to center the capture area in viewport
            window.scrollTo(
                Math.max(0, centerX - window.innerWidth / 2),
                Math.max(0, centerY - window.innerHeight / 2)
            );

            // Wait a moment for scroll to complete
            await new Promise(resolve => setTimeout(resolve, 100));

            // Create a temporary overlay to show capture area (optional - for debugging)
            const overlay = document.createElement('div');
            overlay.id = 'cht-debug-overlay';
            overlay.style.cssText = `
                position: absolute;
                left: ${startX}px;
                top: ${startY}px;
                width: ${actualWidth}px;
                height: ${actualHeight}px;
                border: 3px solid #ff6b35;
                box-shadow: 0 0 0 2px rgba(255, 107, 53, 0.3);
                pointer-events: none;
                z-index: 999999;
            `;
            document.body.appendChild(overlay);

            // Capture the entire document, then crop to our area
            const canvas = await html2canvas(document.body, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scale: 1,
                logging: false,
                width: fullWidth,
                height: fullHeight,
                x: 0,
                y: 0,
                foreignObjectRendering: false,
                imageTimeout: 10000,
                removeContainer: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight,
                onclone: (clonedDoc, element) => {
                    try {
                        // Simple approach: replace only the most common problematic patterns
                        const allElements = clonedDoc.querySelectorAll('*');
                        allElements.forEach(el => {
                            try {
                                // Only handle inline styles to avoid disrupting computed styles
                                if (el.style && el.style.cssText) {
                                    let cssText = el.style.cssText;
                                    if (cssText.includes('color(') || cssText.includes('Color(')) {
                                        // Replace with safe fallbacks
                                        cssText = cssText.replace(/color\([^)]+\)/g, '#000000');
                                        cssText = cssText.replace(/Color\([^)]+\)/g, '#000000');
                                        el.style.cssText = cssText;
                                    }
                                }
                            } catch (e) {
                                // Skip problematic elements
                            }
                        });
                    } catch (e) {
                        // If cloning cleanup fails, continue anyway
                    }
                },
                ignoreElements: (element) => {
                    if (!element) return false;
                    
                    // Ignore our temporary overlay
                    if (element.id === 'cht-debug-overlay') return true;
                    
                    // Ignore all CHT elements and overlays
                    const ignoredClasses = [
                        'cht-comment-popup-overlay',
                        'cht-comment-popup', 
                        'cht-comment-sidebar',
                        'cht-sidebar-close',
                        'cht-toggle-button',
                        'cht-overlay',
                        'cht-admin-bar-item'
                    ];
                    
                    // Check if element has any ignored classes
                    if (element.classList && ignoredClasses.some(cls => element.classList.contains(cls))) {
                        return true;
                    }
                    
                    // Check data attributes
                    if (element.hasAttribute && element.hasAttribute('data-cht-ignore')) {
                        return true;
                    }
                    
                    // Ignore any fixed position overlay elements
                    if (element.style && element.style.position === 'fixed' && parseInt(element.style.zIndex) > 99000) {
                        return true;
                    }
                    
                    // Check computed styles for overlay-like elements
                    try {
                        const computedStyle = window.getComputedStyle(element);
                        if (computedStyle.position === 'fixed' && 
                            parseInt(computedStyle.zIndex) > 1000 && 
                            (computedStyle.backgroundColor.includes('rgba(0, 0, 0') ||
                             computedStyle.background.includes('rgba(0, 0, 0'))) {
                            return true;
                        }
                    } catch (e) {
                        // Ignore errors accessing computed styles
                    }
                    
                    return false;
                }
            });

            // Remove the temporary overlay
            const overlayElement = document.getElementById('cht-debug-overlay');
            if (overlayElement) {
                document.body.removeChild(overlayElement);
            }

            // Restore original scroll position
            window.scrollTo(originalScrollLeft, originalScrollTop);

            // Create a new canvas for the cropped 512x512 area
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = captureSize;
            croppedCanvas.height = captureSize;
            const croppedCtx = croppedCanvas.getContext('2d');
            
            // Don't fill with white background - preserve transparency/actual background
            
            // Draw the cropped area from the full screenshot
            croppedCtx.drawImage(
                canvas,
                startX, startY, actualWidth, actualHeight, // Source
                (captureSize - actualWidth) / 2, (captureSize - actualHeight) / 2, actualWidth, actualHeight // Destination (centered)
            );

            // Add a subtle border to show the capture area
            croppedCtx.strokeStyle = '#ff6b35';
            croppedCtx.lineWidth = 2;
            croppedCtx.strokeRect(1, 1, captureSize - 2, captureSize - 2);

            // Convert to data URL
            const dataURL = croppedCanvas.toDataURL('image/png', 1.0);
            console.log('Screenshot captured successfully, size:', dataURL.length);
            
            return dataURL;

        } catch (error) {
            console.error('Screenshot capture failed:', error);
            
            // Clean up temporary elements
            const overlay = document.querySelector('#cht-debug-overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
            window.scrollTo(originalScrollLeft, originalScrollTop);
            
            // Try alternative approach with simpler options
            try {
                console.log('Attempting fallback screenshot capture...');
                
                const simpleCanvas = await html2canvas(document.body, {
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    scale: 0.8,
                    logging: false,
                    width: Math.min(fullWidth, 3000),
                    height: Math.min(fullHeight, 3000),
                    x: 0,
                    y: 0,
                    foreignObjectRendering: false,
                    imageTimeout: 8000,
                    removeContainer: true,
                    scrollX: 0,
                    scrollY: 0,
                    ignoreElements: (element) => {
                        if (!element) return false;
                        
                        // Ignore CHT elements
                        if (element.classList && (
                            element.classList.contains('cht-comment-popup-overlay') ||
                            element.classList.contains('cht-comment-popup') ||
                            element.classList.contains('cht-comment-sidebar') ||
                            element.classList.contains('cht-sidebar-close') ||
                            element.classList.contains('cht-toggle-button') ||
                            element.classList.contains('cht-overlay') ||
                            element.classList.contains('cht-admin-bar-item')
                        )) {
                            return true;
                        }

                        // Ignore debug overlay
                        if (element.id === 'cht-debug-overlay') return true;
                        
                        // Ignore potentially problematic elements
                        const tagName = element.tagName;
                        if (['IFRAME', 'VIDEO', 'CANVAS', 'EMBED', 'OBJECT'].includes(tagName)) {
                            return true;
                        }
                        
                        // Try to detect elements with problematic styling
                        try {
                            const style = element.style;
                            if (style && style.cssText) {
                                if (style.cssText.includes('color(') || 
                                    style.cssText.includes('Color(') ||
                                    style.cssText.includes('lab(') ||
                                    style.cssText.includes('lch(') ||
                                    style.cssText.includes('oklab(') ||
                                    style.cssText.includes('oklch(')) {
                                    return true;
                                }
                            }
                        } catch (e) {
                            // If we can't check the style safely, ignore the element
                            return true;
                        }
                        
                        return false;
                    }
                });

                // Create cropped version
                const croppedCanvas = document.createElement('canvas');
                croppedCanvas.width = captureSize;
                croppedCanvas.height = captureSize;
                const croppedCtx = croppedCanvas.getContext('2d');

                // Fill background
                croppedCtx.fillStyle = '#ffffff';
                croppedCtx.fillRect(0, 0, captureSize, captureSize);

                // Scale coordinates for the smaller canvas
                const scaleX = simpleCanvas.width / fullWidth;
                const scaleY = simpleCanvas.height / fullHeight;
                const scaledStartX = startX * scaleX;
                const scaledStartY = startY * scaleY;
                const scaledWidth = actualWidth * scaleX;
                const scaledHeight = actualHeight * scaleY;

                // Draw the cropped area
                croppedCtx.drawImage(
                    simpleCanvas,
                    scaledStartX, scaledStartY, scaledWidth, scaledHeight,
                    0, 0, captureSize, captureSize
                );

                const fallbackDataURL = croppedCanvas.toDataURL('image/png', 0.8);
                console.log('Fallback screenshot captured successfully');
                return fallbackDataURL;
                
            } catch (fallbackError) {
                console.error('Fallback screenshot capture also failed:', fallbackError);
                
                // Clean up any remaining temporary elements
                const overlay = document.querySelector('#cht-debug-overlay');
                if (overlay) {
                    document.body.removeChild(overlay);
                }
                window.scrollTo(originalScrollLeft, originalScrollTop);
                
                return '';
            }
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        
        setIsLoading(true);
        
        try {
            // Capture screenshot
            const screenshotUrl = await captureScreenshot();
            
            // Save comment
            await onSave(comment.trim(), screenshotUrl, priority);
            
        } catch (error) {
            console.error('Error saving comment:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cht-comment-popup-overlay">
            <Draggable
                handle=".cht-popup-header"
                bounds="parent"
                onStart={() => setIsDragging(true)}
                onStop={() => setTimeout(() => setIsDragging(false), 100)}
            >
                <div 
                    className="cht-comment-popup" 
                    style={getPopupStyle()}
                    data-cht-ignore="true"
                    data-dragging={isDragging}
                >
                    <div className="cht-popup-header">
                        <h4>{__('Add Comment', 'analogwp-client-handoff')}</h4>
                        <button 
                            onClick={onCancel}
                            className="cht-popup-close"
                            disabled={isLoading}
                        >
                            ×
                        </button>
                    </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="cht-popup-body">
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder={__('Describe the issue or feedback...', 'analogwp-client-handoff')}
                            className="cht-comment-textarea"
                            rows="4"
                            disabled={isLoading}
                            autoFocus
                        />
                        
                        <div className="cht-priority-selector">
                            <label htmlFor="priority">{__('Priority:', 'analogwp-client-handoff')}</label>
                            <select
                                id="priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                disabled={isLoading}
                            >
                                <option value="low">{__('Low', 'analogwp-client-handoff')}</option>
                                <option value="medium">{__('Medium', 'analogwp-client-handoff')}</option>
                                <option value="high">{__('High', 'analogwp-client-handoff')}</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="cht-popup-footer">
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="cht-btn cht-btn-secondary"
                            disabled={isLoading}
                        >
                            {__('Cancel', 'analogwp-client-handoff')}
                        </button>
                        
                        <button 
                            type="submit" 
                            className="cht-btn cht-btn-primary"
                            disabled={isLoading || !comment.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <span className="cht-spinner"></span>
                                    {__('Saving...', 'analogwp-client-handoff')}
                                </>
                            ) : (
                                __('Save Comment', 'analogwp-client-handoff')
                            )}
                        </button>
                    </div>
                </form>
                </div>
            </Draggable>
        </div>
    );
};

export default CommentPopup;