import React from 'react';
import toast, { Toaster } from 'react-hot-toast';

const CONFIRMATION_TOAST_ID = 'sn-confirmation';

let activeConfirmation = null;

const removeConfirmationBackdrop = () => {
	const existing = document.querySelector('.sn-confirmation-backdrop');
	if (existing) {
		existing.remove();
	}
};

const clearActiveConfirmation = (result = false) => {
	if (!activeConfirmation) {
		removeConfirmationBackdrop();
		toast.dismiss(CONFIRMATION_TOAST_ID);
		return;
	}

	const { resolve, onKeyDown } = activeConfirmation;
	activeConfirmation = null;

	if (onKeyDown) {
		document.removeEventListener('keydown', onKeyDown);
	}

	removeConfirmationBackdrop();
	toast.dismiss(CONFIRMATION_TOAST_ID);
	resolve(result);
};

// Toast provider component with modern react-hot-toast
export const ToastProvider = ({ children }) => {
	return (
		<>
			{children}
			<Toaster
				position="top-right"
				reverseOrder={false}
				gutter={8}
				containerClassName="sn-toast-container"
				containerStyle={{
					top: '52px', // Account for WP admin bar (32px) + extra margin (20px)
					zIndex: 999999,
				}}
				toastOptions={{
					// Define default options
					className: '',
					duration: 4000,
					style: {
						background: '#fff',
						color: '#363636',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
						borderRadius: '8px',
						border: '1px solid #e0e0e0',
					},

					// Default options for different types
					success: {
						duration: 3000,
						style: {
							background: '#f0f9ff',
							color: '#0369a1',
							border: '1px solid #0ea5e9',
						},
						iconTheme: {
							primary: '#0ea5e9',
							secondary: '#f0f9ff',
						},
					},
					error: {
						duration: 5000,
						style: {
							background: '#fef2f2',
							color: '#dc2626',
							border: '1px solid #ef4444',
						},
						iconTheme: {
							primary: '#ef4444',
							secondary: '#fef2f2',
						},
					},
					loading: {
						style: {
							background: '#fefce8',
							color: '#a16207',
							border: '1px solid #eab308',
						},
						iconTheme: {
							primary: '#eab308',
							secondary: '#fefce8',
						},
					},
				}}
			/>
		</>
	);
};

// Enhanced toast utility functions
export const showToast = {
	success: (message, options = {}) => {
		return toast.success(message, {
			...options,
		});
	},

	error: (message, options = {}) => {
		return toast.error(message, {
			...options,
		});
	},

	loading: (message, options = {}) => {
		return toast.loading(message, {
			...options,
		});
	},

	promise: (promise, messages, options = {}) => {
		return toast.promise(promise, messages, {
			...options,
		});
	},

	custom: (message, options = {}) => {
		return toast(message, {
			...options,
		});
	},

	dismiss: (toastId) => {
		if (toastId) {
			toast.dismiss(toastId);
		} else {
			toast.dismiss();
		}
	},

	remove: (toastId) => {
		toast.remove(toastId);
	},
};

// Confirmation function using react-hot-toast
export const showConfirmation = (message, options = {}) => {
	return new Promise((resolve) => {
		// Replace any open confirmation so only one can be active.
		if (activeConfirmation) {
			clearActiveConfirmation(false);
		}

		const onKeyDown = (event) => {
			if (event.key === 'Escape') {
				clearActiveConfirmation(false);
			}
		};

		removeConfirmationBackdrop();

		const backdrop = document.createElement('div');
		backdrop.className = 'sn-confirmation-backdrop';
		backdrop.setAttribute('aria-hidden', 'true');
		backdrop.addEventListener('click', () => clearActiveConfirmation(false));
		document.body.appendChild(backdrop);

		document.addEventListener('keydown', onKeyDown);

		activeConfirmation = {
			resolve,
			onKeyDown,
		};

		toast(
			() => (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<div style={{ fontWeight: '500' }}>{message}</div>
					<div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
						<button
							type="button"
							onClick={() => clearActiveConfirmation(false)}
							style={{
								padding: '6px 12px',
								border: '1px solid #d1d5db',
								borderRadius: '4px',
								background: '#fff',
								color: '#374151',
								cursor: 'pointer',
								fontSize: '14px',
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={() => clearActiveConfirmation(true)}
							style={{
								padding: '6px 12px',
								border: '1px solid #dc2626',
								borderRadius: '4px',
								background: '#dc2626',
								color: '#fff',
								cursor: 'pointer',
								fontSize: '14px',
							}}
						>
							{options.confirmText || 'Confirm'}
						</button>
					</div>
				</div>
			),
			{
				id: CONFIRMATION_TOAST_ID,
				duration: Infinity,
				style: {
					background: '#fff',
					color: '#111827',
					border: '1px solid #d1d5db',
					borderRadius: '8px',
					boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
					minWidth: '300px',
				},
				...options,
			}
		);
	});
};
