/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

const AdminSidebar = () => {
    return (
        <div className="cht-w-64 cht-bg-white cht-border-r cht-border-gray-200 cht-flex cht-flex-col cht-h-full">
            <div className="cht-flex cht-items-center cht-px-6 cht-py-4 cht-border-b cht-border-gray-200">
                <div className="cht-flex cht-items-center cht-justify-center cht-w-8 cht-h-8 cht-bg-blue-600 cht-rounded-lg cht-text-white cht-mr-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M20 10c0-5.51-4.49-10-10-10C4.48 0 0 4.49 0 10c0 5.52 4.48 10 10 10 5.51 0 10-4.48 10-10zM7.78 15.37L4.37 6.22c.55-.02 1.17-.08 1.17-.08.5-.06.44-1.13-.06-1.11 0 0-1.45.11-2.37.11-.18 0-.37 0-.58-.01C4.12 2.69 6.87 1.11 10 1.11c2.33 0 4.45.87 6.05 2.34-.68-.11-1.65.39-1.65 1.58 0 .74.45 1.36.9 2.1.35.61.55 1.36.55 2.46 0 1.49-1.4 5-1.4 5l-3.03-8.37c.54-.02.82-.17.82-.17.5-.05.44-1.25-.06-1.22 0 0-1.44.12-2.38.12-.87 0-2.33-.12-2.33-.12-.5-.03-.56 1.2-.06 1.22l.92.08 1.26 3.41zM17.41 10.19c-.41-2.15-.8-4.31-1.2-6.46.1.26.16.65.16 1.02 0 1.27-.5 2.27-.82 3.25-.13.42-.27.83-.38 1.27-.38 1.43-.66 2.94-.18 4.57l.91 2.35c1.08-1.7 1.51-3.79 1.51-6zm-9.11 1.56c.4 1.2.81 2.39 1.21 3.59.13.39.26.78.38 1.17.05.15.11.29.17.43l1.45-4.05c.38-1.07.83-2.99.83-4.09 0-1.03-.38-1.75-.83-2.33-.45-.58-.83-1.02-.83-1.75 0-1.03.83-1.75 1.75-1.75.05 0 .10.01.15.02C10.6 2.62 8.63 1.5 6.25 1.5c-3.22 0-5.99 1.94-7.15 4.69.2-.01.4-.02.6-.02 1.48 0 2.25 1.11 2.25 2.24 0 .74-.45 1.36-.9 2.1-.35.61-.55 1.36-.55 2.46 0 .75.23 1.54.55 2.39l.72 2.4z"/>
                    </svg>
                </div>
                <span className="cht-text-lg cht-font-semibold cht-text-gray-900">DashPro</span>
            </div>
            
            <nav className="cht-flex-1 cht-px-4 cht-py-6">
                <ul className="cht-space-y-2">
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-white cht-bg-blue-600 cht-rounded-lg">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0h2A1.5 1.5 0 0 1 5 1.5v2A1.5 1.5 0 0 1 3.5 5h-2A1.5 1.5 0 0 1 0 3.5v-2zM1.5 1a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-2zm9.5.5A1.5 1.5 0 0 1 12.5 0h2A1.5 1.5 0 0 1 16 1.5v2A1.5 1.5 0 0 1 14.5 5h-2A1.5 1.5 0 0 1 11 3.5v-2zm1.5-.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-2zM0 12.5A1.5 1.5 0 0 1 1.5 11h2A1.5 1.5 0 0 1 5 12.5v2A1.5 1.5 0 0 1 3.5 16h-2A1.5 1.5 0 0 1 0 14.5v-2zm1.5-.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-2zm9.5.5A1.5 1.5 0 0 1 12.5 11h2A1.5 1.5 0 0 1 16 12.5v2A1.5 1.5 0 0 1 14.5 16h-2A1.5 1.5 0 0 1 11 14.5v-2zm1.5-.5a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-2z"/>
                            </svg>
                            {__('Dashboard', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3A1.5 1.5 0 0 1 15 10.5v3A1.5 1.5 0 0 1 13.5 15h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                            </svg>
                            {__('Home', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                                <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"/>
                            </svg>
                            {__('Updates', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li className="cht-my-4">
                        <hr className="cht-border-gray-200" />
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            </svg>
                            {__('Posts', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2zm13 0H10a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM1 10a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-4z"/>
                            </svg>
                            {__('Media', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                <path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                                <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                            </svg>
                            {__('Pages', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            </svg>
                            {__('Comments', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li className="cht-my-4">
                        <hr className="cht-border-gray-200" />
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                            </svg>
                            {__('Elementor', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M0 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2H2a2 2 0 0 1-2-2V2z"/>
                            </svg>
                            {__('Templates', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2z"/>
                            </svg>
                            {__('Style Kits', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li className="cht-my-4">
                        <hr className="cht-border-gray-200" />
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v3A1.5 1.5 0 0 0 1.5 6h3A1.5 1.5 0 0 0 6 4.5v-3A1.5 1.5 0 0 0 4.5 0h-3zM1 1.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-3z"/>
                                <path d="M1.5 6A1.5 1.5 0 0 0 0 7.5v7A1.5 1.5 0 0 0 1.5 16h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 8.5 6h-7zM1 7.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-7z"/>
                            </svg>
                            {__('Appearance', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                                <path d="M4.5 1A1.5 1.5 0 0 0 3 2.5V3H1.5A1.5 1.5 0 0 0 0 4.5v8A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-8A1.5 1.5 0 0 0 14.5 3H13v-.5A1.5 1.5 0 0 0 11.5 1h-7zm0 1h7a.5.5 0 0 1 .5.5V3H4v-.5a.5.5 0 0 1 .5-.5zM1 4.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-8z"/>
                            </svg>
                            {__('Plugins', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                                <path fill-rule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                                <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                            </svg>
                            {__('Users', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                            </svg>
                            {__('Tools', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                            </svg>
                            {__('Settings', 'analogwp-client-handoff')}
                        </a>
                    </li>
                    <li className="cht-my-4">
                        <hr className="cht-border-gray-200" />
                    </li>
                    <li>
                        <a href="#" className="cht-flex cht-items-center cht-px-3 cht-py-2 cht-text-sm cht-font-medium cht-text-gray-700 hover:cht-bg-gray-100 cht-rounded-lg cht-transition-colors cht-duration-200">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="cht-mr-3">
                                <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM5.5 9h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM5.5 11h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1z"/>
                                <path d="M0.5 4A1.5 1.5 0 0 1 2 2.5h12A1.5 1.5 0 0 1 15.5 4v.5H0V4z"/>
                            </svg>
                            {__('Collapse menu', 'analogwp-client-handoff')}
                        </a>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default AdminSidebar;